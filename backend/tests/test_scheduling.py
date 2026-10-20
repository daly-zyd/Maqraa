from datetime import time, timedelta

import pytest
from django.utils import timezone

from apps.access.scoping import UnscopedQueryError
from apps.core import timeutil
from apps.core.exceptions import ConflictError, ValidationFailure
from apps.maqraat.models import Maqraa
from apps.scheduling import services
from apps.scheduling.models import Session, WeeklyTemplateSlot


@pytest.fixture
def team(make_user, maq):
    """Qaloun men: admin + sheikh + supervisor; Hafs men: the same sheikh also serves there."""
    admin = make_user("adm", roles={"qaloun-men": ["admin"]})
    sheikh = make_user("shk", roles={"qaloun-men": ["sheikh"], "hafs-men": ["sheikh"]})
    sup = make_user("sup", roles={"qaloun-men": ["supervisor"]})
    hafs_admin = make_user("hadm", roles={"hafs-men": ["admin"]})
    return admin, sheikh, sup, hafs_admin


def new_slot(actor, maqraa, weekday=1, start=time(10, 0), end=time(11, 0), sheikh=None, supervisor=None):
    return services.create_slot(actor, maqraa.pk, weekday=weekday, start=start, end=end,
                                sheikh_id=sheikh.person_id if sheikh else None,
                                supervisor_id=supervisor.person_id if supervisor else None)


def test_create_slot_and_validation(team, maq):
    admin, sheikh, sup, _ = team
    q = maq["qaloun-men"]
    slot = new_slot(admin, q, sheikh=sheikh, supervisor=sup)
    assert slot["start"] == "10:00" and slot["sheikh"]["name"] == "shk"
    with pytest.raises(ValidationFailure):
        new_slot(admin, q, weekday=9)
    with pytest.raises(ValidationFailure):
        new_slot(admin, q, start=time(9, 0), end=time(9, 0))
    outsider = team[3]
    with pytest.raises(ValidationFailure):  # a sheikh must belong to this maqraa
        services.create_slot(admin, q.pk, weekday=2, start=time(8, 0), end=time(9, 0), sheikh_id=outsider.person_id)


def test_same_maqraa_overlap_is_blocked_including_half_hour_starts(team, maq):
    admin, sheikh, *_ = team
    q = maq["qaloun-men"]
    new_slot(admin, q, start=time(10, 0), end=time(11, 0))
    with pytest.raises(ConflictError) as e:
        new_slot(admin, q, start=time(10, 30), end=time(11, 30))
    assert e.value.errors["conflict"] == "same_maqraa"
    new_slot(admin, q, start=time(11, 0), end=time(12, 0))  # adjacent is fine


def test_cross_maqraa_double_booking_blocked_without_leaking_details(team, maq):
    admin, sheikh, _, hafs_admin = team
    new_slot(hafs_admin, maq["hafs-men"], weekday=3, start=time(20, 0), end=time(21, 0), sheikh=sheikh)
    with pytest.raises(ConflictError) as e:
        new_slot(admin, maq["qaloun-men"], weekday=3, start=time(20, 30), end=time(21, 30), sheikh=sheikh)
    assert e.value.errors == {"conflict": "person_busy_elsewhere", "who": "sheikh"}
    assert "حفص" not in e.value.message_ar and "hafs" not in str(e.value.errors)
    new_slot(admin, maq["qaloun-men"], weekday=3, start=time(21, 0), end=time(22, 0), sheikh=sheikh)  # no overlap


def test_midnight_crossing_slot_conflicts_with_early_next_day(team, maq):
    admin, sheikh, *_ = team
    q = maq["qaloun-men"]
    new_slot(admin, q, weekday=0, start=time(23, 30), end=time(0, 30), sheikh=sheikh)
    with pytest.raises(ConflictError):
        new_slot(admin, q, weekday=1, start=time(0, 0), end=time(1, 0))
    new_slot(admin, q, weekday=1, start=time(0, 30), end=time(1, 30))


def test_generation_is_utc_future_only_and_idempotent(team, maq):
    admin, sheikh, sup, _ = team
    q = maq["qaloun-men"]
    tomorrow = (timezone.now().astimezone(timeutil.TUNIS) + timedelta(days=1)).date()
    new_slot(admin, q, weekday=tomorrow.weekday(), start=time(23, 0), end=time(0, 0), sheikh=sheikh, supervisor=sup)
    n = Session.objects.system().filter(maqraa=q).count()
    assert n >= 3  # 3 weeks ahead by default
    first = Session.objects.system().filter(maqraa=q).order_by("start_at").first()
    assert first.start_at.utcoffset().total_seconds() == 0
    assert timeutil.fmt_hm(first.start_at, timeutil.TUNIS) == "23:00"
    assert timeutil.fmt_hm(first.start_at, timeutil.MECCA) == "01:00"
    assert first.end_at - first.start_at == timedelta(hours=1)
    assert services.generate_sessions(q.pk) == 0  # idempotent


def test_template_change_regenerates_future_but_keeps_touched_and_past(team, maq):
    admin, sheikh, *_ = team
    q = maq["qaloun-men"]
    tomorrow = (timezone.now().astimezone(timeutil.TUNIS) + timedelta(days=1)).date()
    slot = new_slot(admin, q, weekday=tomorrow.weekday(), start=time(12, 0), end=time(13, 0), sheikh=sheikh)
    touched = Session.objects.system().filter(maqraa=q).order_by("start_at").first()
    Session.objects.system().filter(pk=touched.pk).update(status="confirmed")
    past = Session.objects.create(maqraa=q, start_at=timezone.now() - timedelta(days=2),
                                  end_at=timezone.now() - timedelta(days=2, hours=-1), status="scheduled",
                                  sheikh_id=sheikh.person_id)
    services.update_slot(admin, q.pk, slot["id"], changes={"start_time": time(14, 0), "end_time": time(15, 0)})
    assert Session.objects.system().filter(pk=touched.pk, start_at=touched.start_at).exists()  # touched survives
    assert Session.objects.system().filter(pk=past.pk).exists()  # past is immutable history
    futures = Session.objects.system().filter(maqraa=q, status="scheduled", start_at__gt=timezone.now())
    assert {timeutil.fmt_hm(s.start_at, timeutil.TUNIS) for s in futures} == {"14:00"}


def test_deleted_slot_disappears_from_future(team, maq):
    admin, sheikh, *_ = team
    q = maq["qaloun-men"]
    slot = new_slot(admin, q, weekday=2, sheikh=sheikh)
    services.delete_slot(admin, q.pk, slot["id"])
    assert not Session.objects.system().filter(maqraa=q, status="scheduled", start_at__gt=timezone.now()).exists()
    assert services.list_slots(admin, q.pk) == []


def test_sheikh_sees_only_own_sessions_on_board_and_list(team, make_user, maq):
    admin, sheikh, sup, _ = team
    q = maq["qaloun-men"]
    other = make_user("shk2", roles={"qaloun-men": ["sheikh"]})
    tomorrow = (timezone.now().astimezone(timeutil.TUNIS) + timedelta(days=1)).date()
    new_slot(admin, q, weekday=tomorrow.weekday(), start=time(9, 0), end=time(10, 0), sheikh=sheikh)
    new_slot(admin, q, weekday=tomorrow.weekday(), start=time(10, 0), end=time(11, 0), sheikh=other)
    own = services.today_board(sheikh, q.pk, day=tomorrow)
    assert [s["sheikh"]["name"] for s in own["sessions"]] == ["shk"]
    assert len(services.today_board(sup, q.pk, day=tomorrow)["sessions"]) == 2
    assert len(services.list_sessions(other, q.pk, tomorrow, tomorrow)) == 1


def test_board_shows_both_times_and_dates(team, maq):
    admin, sheikh, sup, _ = team
    q = maq["qaloun-men"]
    tomorrow = (timezone.now().astimezone(timeutil.TUNIS) + timedelta(days=1)).date()
    new_slot(admin, q, weekday=tomorrow.weekday(), start=time(15, 0), end=time(16, 0), sheikh=sheikh, supervisor=sup)
    board = services.today_board(sup, q.pk, day=tomorrow)
    s = board["sessions"][0]
    assert (s["start_tunis"], s["start_mecca"]) == ("15:00", "17:00")
    assert board["date_ar"] == timeutil.date_ar(tomorrow) and "هـ" in board["date_hijri_ar"]
    assert s["awaiting_report"] is False


def test_public_today_exposes_names_only(team, maq, client_for):
    admin, sheikh, sup, _ = team
    q = maq["qaloun-men"]
    today = timezone.now().astimezone(timeutil.TUNIS).date()
    new_slot(admin, q, weekday=today.weekday(), start=time(23, 58), end=time(23, 59), sheikh=sheikh, supervisor=sup)
    Session.objects.system().filter(maqraa=q).delete()
    start, end = timeutil.slot_to_utc(today, time(12, 0), time(13, 0))
    Session.objects.create(maqraa=q, start_at=start, end_at=end, sheikh_id=sheikh.person_id, supervisor_id=sup.person_id)
    r = client_for(None).get(f"/api/v1/public/maqraat/{q.slug}/today/")
    assert r.status_code == 200
    text = r.content.decode()
    assert "shk" in text and "sup" not in text.replace("supervisor", "") and "phone" not in text
    assert "supervisor" not in r.json()["sessions"][0] and set(r.json()["sessions"][0]["sheikh"]) == {"name"}
    assert client_for(None).get("/api/v1/public/maqraat/nope/today/").status_code == 404


def test_unscoped_queries_are_refused(maq):
    with pytest.raises(UnscopedQueryError):
        list(Maqraa.objects.all())
    with pytest.raises(UnscopedQueryError):
        WeeklyTemplateSlot.objects.filter(maqraa=maq["hafs-men"]).count()
    with pytest.raises(UnscopedQueryError):
        Session.objects.all().exists()
    assert Maqraa.objects.system().count() == 4


def test_http_slot_crud(team, maq, client_for):
    admin, sheikh, sup, _ = team
    q = maq["qaloun-men"].pk
    c = client_for(admin)
    r = c.post(f"/api/v1/maqraat/{q}/slots/", {"weekday": 1, "start": "05:30", "end": "06:30",
                                                "sheikh_id": sheikh.person_id}, format="json")
    assert r.status_code == 201 and r.json()["start"] == "05:30"
    sid = r.json()["id"]
    assert c.patch(f"/api/v1/maqraat/{q}/slots/{sid}/", {"notes": "x"}, format="json").status_code == 200
    r = c.post(f"/api/v1/maqraat/{q}/slots/", {"weekday": 1, "start": "06:00", "end": "07:00"}, format="json")
    assert r.status_code == 409 and r.json()["code"] == "conflict"
    assert client_for(sup).post(f"/api/v1/maqraat/{q}/slots/", {"weekday": 4, "start": "1:00", "end": "2:00"}, format="json").status_code == 403
    assert c.delete(f"/api/v1/maqraat/{q}/slots/{sid}/").status_code == 204
