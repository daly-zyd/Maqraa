"""Session close-out report (تقرير المقرأة): permissions, validation, history and the WhatsApp text."""
from datetime import datetime, time, timedelta

import pytest
from django.utils import timezone

from apps.audit.models import AuditLog
from apps.configuration import services as config
from apps.core import timeutil
from apps.core.exceptions import CapabilityDenied, ConflictError, ScopeNotFound, ValidationFailure
from apps.people.models import Person
from apps.scheduling import services
from apps.scheduling.models import Session, Status


@pytest.fixture
def team(make_user, maq):
    admin = make_user("adm", roles={"qaloun-men": ["admin"]})
    sheikh = make_user("shk", roles={"qaloun-men": ["sheikh"]})
    other_sheikh = make_user("shk2", roles={"qaloun-men": ["sheikh"]})
    sup = make_user("sup", roles={"qaloun-men": ["supervisor"]})
    outsider = make_user("hadm", roles={"hafs-men": ["admin"]})
    Person.objects.system().filter(pk=sheikh.person_id).update(full_name="رياض العيد", honorific="د/")
    Person.objects.system().filter(pk=sup.person_id).update(full_name="حاتم بن عياد")
    return admin, sheikh, other_sheikh, sup, outsider


def make_session(maqraa, sheikh, sup, *, start=None, minutes=60, status=Status.SCHEDULED):
    start = start or timezone.now() - timedelta(hours=2)
    return Session.objects.create(maqraa=maqraa, start_at=start, end_at=start + timedelta(minutes=minutes),
                                  sheikh_id=sheikh.person_id, supervisor_id=sup.person_id if sup else None,
                                  status=status)


GOOD = {"students_start": 6, "students_end": 5, "page_from": 66, "page_to": 70}


def test_supervisor_reports_and_session_becomes_reported(team, maq):
    admin, sheikh, _, sup, _ = team
    q = maq["qaloun-men"]
    # Tuesday 20 Oct 2026, 18:45 Mecca = 15:45 UTC
    start = datetime(2026, 10, 20, 15, 45, tzinfo=timeutil.UTC)
    s = make_session(q, sheikh, sup, start=start, minutes=60)
    out = services.submit_report(sup, q.pk, s.pk, **GOOD, actual_start=time(18, 46), actual_end=time(19, 26))
    s.refresh_from_db()
    assert s.status == Status.REPORTED
    assert (s.actual_end - s.actual_start) == timedelta(minutes=40)
    assert out["actual_start_mecca"] == "18:46" and out["actual_end_mecca"] == "19:26"
    assert out["corrector"]["name"] == "رياض العيد" and out["supervisor"]["name"] == "حاتم بن عياد"
    text = out["whatsapp_text"]
    for line in ("تقرير مقرأة بالقرآن نحيا 🌹", "المصحح ✍️ د/ رياض العيد حفظه الله و رعاه", "الإشراف 💻 حاتم بن عياد",
                 "عدد الطلبة المشاركين : 06", "عدد الطلبة عند انتهاء المقرأة : 05", "البداية من الوجه : 66",
                 "التلاوة إلى الوجه : 70", "وقت التصحيح من : 18:46 إلى 19:26 توقيت مكة المكرمة",
                 "اليوم والتاريخ : الثلاثاء 20 أكتوبر 2026🗓️", "أسأل الله أن يتقبل منا ومنكم صالح الأعمال 🌹🌹"):
        assert line in text.split("\n"), line
    assert AuditLog.objects.filter(action="session.report").count() == 1


def test_women_maqraa_uses_feminine_blessing_and_custom_title(make_user, maq):
    admin = make_user("wadm", roles={"qaloun-women": ["admin"]})
    sheikha = make_user("wshk", roles={"qaloun-women": ["sheikh"]})
    w = maq["qaloun-women"]
    config.set_setting(admin, "report_title", "مقرأة قالون نساء", w.pk)
    s = make_session(w, sheikha, None)
    text = services.submit_report(admin, w.pk, s.pk, **GOOD)["whatsapp_text"]
    assert "حفظها الله و رعاها" in text and "تقرير مقرأة قالون نساء 🌹" in text
    assert "الإشراف 💻 wadm" in text  # no planned supervisor: whoever closed out signs


def test_correction_keeps_frozen_people_and_is_audited(team, maq):
    admin, sheikh, other, sup, _ = team
    q = maq["qaloun-men"]
    s = make_session(q, sheikh, sup)
    services.submit_report(sup, q.pk, s.pk, **GOOD)
    Session.objects.system().filter(pk=s.pk).update(sheikh_id=other.person_id)  # later roster change
    out = services.submit_report(admin, q.pk, s.pk, **{**GOOD, "students_end": 4})
    assert out["students_end"] == 4 and out["corrector"]["id"] == sheikh.person_id
    entry = AuditLog.objects.get(action="session.report.update")
    assert entry.before["students"] == [6, 5] and entry.after["students"] == [6, 4]


def test_sheikh_needs_the_setting_to_report_and_only_for_own_session(team, maq):
    admin, sheikh, other, sup, _ = team
    q = maq["qaloun-men"]
    mine = make_session(q, sheikh, sup)
    theirs = make_session(q, other, sup, start=timezone.now() - timedelta(hours=5))
    with pytest.raises(CapabilityDenied):
        services.submit_report(sheikh, q.pk, mine.pk, **GOOD)
    config.set_setting(admin, "sheikh_can_submit_report", True, q.pk)
    services.submit_report(sheikh, q.pk, mine.pk, **GOOD)
    with pytest.raises(ScopeNotFound):
        services.submit_report(sheikh, q.pk, theirs.pk, **GOOD)
    with pytest.raises(ScopeNotFound):
        services.get_report(sheikh, q.pk, theirs.pk)
    assert services.get_report(sheikh, q.pk, mine.pk)["page_to"] == 70


def test_other_maqraa_admin_gets_404(team, maq):
    *_, sup, outsider = team
    q = maq["qaloun-men"]
    s = make_session(q, team[1], sup)
    with pytest.raises(ScopeNotFound):
        services.submit_report(outsider, q.pk, s.pk, **GOOD)


@pytest.mark.parametrize("bad, error", [
    ({"students_end": 7}, "students_end"),
    ({"page_from": 71}, "page_to"),
    ({"page_to": 605}, "page_to"),
])
def test_validation(team, maq, bad, error):
    *_, sup, _ = team
    q = maq["qaloun-men"]
    s = make_session(q, team[1], sup)
    with pytest.raises(ValidationFailure) as exc:
        services.submit_report(sup, q.pk, s.pk, **{**GOOD, **bad})
    assert error in exc.value.errors


def test_future_and_cancelled_sessions_are_refused(team, maq):
    *_, sup, _ = team
    q = maq["qaloun-men"]
    future = make_session(q, team[1], sup, start=timezone.now() + timedelta(hours=3))
    with pytest.raises(ValidationFailure):
        services.submit_report(sup, q.pk, future.pk, **GOOD)
    cancelled = make_session(q, team[1], sup, start=timezone.now() - timedelta(hours=6), status=Status.CANCELLED)
    with pytest.raises(ConflictError):
        services.submit_report(sup, q.pk, cancelled.pk, **GOOD)


def test_session_crossing_midnight_mecca(team, maq):
    *_, sup, _ = team
    q = maq["qaloun-men"]
    start = datetime(2026, 10, 20, 20, 30, tzinfo=timeutil.UTC)  # 23:30 Mecca
    s = make_session(q, team[1], sup, start=start)
    out = services.submit_report(sup, q.pk, s.pk, **GOOD, actual_start=time(23, 35), actual_end=time(0, 20))
    s.refresh_from_db()
    assert s.actual_end - s.actual_start == timedelta(minutes=45)
    assert out["actual_end_mecca"] == "00:20"


def test_http_put_and_get(team, maq, client_for):
    admin, sheikh, _, sup, _ = team
    q = maq["qaloun-men"]
    s = make_session(q, sheikh, sup)
    url = f"/api/v1/maqraat/{q.pk}/sessions/{s.pk}/report/"
    c = client_for(sup)
    assert c.get(url).status_code == 404
    r = c.put(url, {**GOOD, "actual_start": "18:46", "actual_end": "19:26", "notes": ""}, format="json")
    assert r.status_code == 200 and r.json()["status"] == "reported"
    assert c.get(url).json()["whatsapp_text"] == r.json()["whatsapp_text"]
    assert client_for(sheikh).put(url, GOOD, format="json").status_code == 403
    assert c.put(url, {**GOOD, "page_to": 999}, format="json").status_code == 400
