"""Scheduling business rules: template CRUD with conflict detection, session generation, today board."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.db import transaction
from django.utils import timezone

from apps.access import policy
from apps.access import services as access
from apps.access.models import ROLE_ADMIN, ROLE_SHEIKH, ROLE_SUPERVISOR
from apps.audit import services as audit
from apps.configuration import services as config
from apps.core import timeutil
from apps.core.exceptions import ConflictError, ScopeNotFound, ValidationFailure
from apps.maqraat import services as maqraat
from apps.people import services as people

from . import repositories
from .models import Session, Status

WEEK_MINUTES = 7 * 1440


# ---- conflict detection ---------------------------------------------------------------------------
def _span(weekday: int, start: time, end: time) -> tuple[int, int]:
    s = weekday * 1440 + start.hour * 60 + start.minute
    dur = ((end.hour * 60 + end.minute) - (start.hour * 60 + start.minute)) % 1440
    return s, s + (dur or 1440)


def _overlap(a: tuple[int, int], b: tuple[int, int]) -> bool:
    """Interval overlap on a circular week (a Sunday-night slot can run into Monday)."""
    for shift in (-WEEK_MINUTES, 0, WEEK_MINUTES):
        if a[0] < b[1] + shift and b[0] + shift < a[1]:
            return True
    return False


def _check_conflicts(maqraa_id: int, weekday: int, start: time, end: time, sheikh_id, supervisor_id,
                     exclude_id: int | None = None) -> None:
    span = _span(weekday, start, end)
    for other in repositories.slots_of_maqraa_system(maqraa_id, exclude_id):
        if _overlap(span, _span(other.weekday, other.start_time, other.end_time)):
            raise ConflictError("يتداخل هذا الموعد مع موعد آخر في نفس المقرأة", errors={"conflict": "same_maqraa"})
    for person_id, who in ((sheikh_id, "sheikh"), (supervisor_id, "supervisor")):
        if not person_id:
            continue
        for other in repositories.slots_of_person_system(person_id, exclude_id):
            if _overlap(span, _span(other.weekday, other.start_time, other.end_time)):
                # no details about another maqraa (segregation): only "busy elsewhere"
                kind = "person_busy_here" if other.maqraa_id == maqraa_id else "person_busy_elsewhere"
                msg = ("مشغول في موعد آخر في هذه المقرأة" if kind == "person_busy_here"
                       else "مشغول في مقرأة أخرى")
                raise ConflictError(msg, errors={"conflict": kind, "who": who})


def _validate_people(maqraa_id: int, sheikh_id, supervisor_id) -> None:
    if sheikh_id and not access.has_role(sheikh_id, maqraa_id, [ROLE_SHEIKH]):
        raise ValidationFailure("المصحح غير مسجل في هذه المقرأة", errors={"sheikh_id": "not_in_maqraa"})
    if supervisor_id and not access.has_role(supervisor_id, maqraa_id, [ROLE_SUPERVISOR, ROLE_ADMIN]):
        raise ValidationFailure("المشرف غير مسجل في هذه المقرأة", errors={"supervisor_id": "not_in_maqraa"})


def _validate_times(weekday: int, start: time, end: time) -> None:
    if not 0 <= weekday <= 6:
        raise ValidationFailure("يوم غير صالح")
    if start == end:
        raise ValidationFailure("وقت البداية يساوي وقت النهاية")


def _tz(maqraa_id: int) -> ZoneInfo:
    return ZoneInfo(config.get_setting("base_timezone", maqraa_id))


# ---- template CRUD --------------------------------------------------------------------------------
def _slot_dict(slot, names: dict[int, str]) -> dict:
    return {
        "id": slot.pk, "weekday": slot.weekday, "weekday_ar": timeutil.AR_WEEKDAYS[slot.weekday],
        "start": slot.start_time.strftime("%H:%M"), "end": slot.end_time.strftime("%H:%M"),
        "sheikh": {"id": slot.sheikh_id, "name": names.get(slot.sheikh_id)} if slot.sheikh_id else None,
        "supervisor": {"id": slot.supervisor_id, "name": names.get(slot.supervisor_id)} if slot.supervisor_id else None,
        "notes": slot.notes,
    }


def list_slots(actor, maqraa_id: int, *, ip=None) -> list[dict]:
    access.require(actor, policy.SCHEDULE_VIEW_ALL, maqraa_id, ip=ip)
    slots = repositories.list_slots(actor, maqraa_id)
    names = people.names_for([p for s in slots for p in (s.sheikh_id, s.supervisor_id) if p])
    return [_slot_dict(s, names) for s in slots]


@transaction.atomic
def create_slot(actor, maqraa_id: int, *, weekday: int, start: time, end: time, sheikh_id=None,
                supervisor_id=None, notes: str = "", ip=None) -> dict:
    access.require(actor, policy.SCHEDULE_EDIT, maqraa_id, ip=ip)
    _validate_times(weekday, start, end)
    _validate_people(maqraa_id, sheikh_id, supervisor_id)
    _check_conflicts(maqraa_id, weekday, start, end, sheikh_id, supervisor_id)
    slot = repositories.create_slot(maqraa_id=maqraa_id, weekday=weekday, start_time=start, end_time=end,
                                    sheikh_id=sheikh_id, supervisor_id=supervisor_id, notes=notes)
    audit.record(actor, "slot.create", obj=slot, maqraa_id=maqraa_id,
                 after={"weekday": weekday, "start": str(start), "sheikh": sheikh_id}, ip=ip)
    sync_future_sessions(maqraa_id)
    return _slot_dict(slot, people.names_for([p for p in (sheikh_id, supervisor_id) if p]))


@transaction.atomic
def update_slot(actor, maqraa_id: int, slot_id: int, *, changes: dict, ip=None) -> dict:
    access.require(actor, policy.SCHEDULE_EDIT, maqraa_id, ip=ip)
    slot = repositories.get_slot(actor, maqraa_id, slot_id)
    if slot is None:
        raise ScopeNotFound()
    before = {"weekday": slot.weekday, "start": str(slot.start_time), "end": str(slot.end_time),
              "sheikh": slot.sheikh_id, "supervisor": slot.supervisor_id}
    for key in ("weekday", "start_time", "end_time", "sheikh_id", "supervisor_id", "notes"):
        if key in changes:
            setattr(slot, key, changes[key])
    _validate_times(slot.weekday, slot.start_time, slot.end_time)
    _validate_people(maqraa_id, slot.sheikh_id, slot.supervisor_id)
    _check_conflicts(maqraa_id, slot.weekday, slot.start_time, slot.end_time, slot.sheikh_id,
                     slot.supervisor_id, exclude_id=slot.pk)
    slot.save()
    audit.record(actor, "slot.update", obj=slot, maqraa_id=maqraa_id, before=before,
                 after={"weekday": slot.weekday, "start": str(slot.start_time), "end": str(slot.end_time),
                        "sheikh": slot.sheikh_id, "supervisor": slot.supervisor_id}, ip=ip)
    sync_future_sessions(maqraa_id)
    return _slot_dict(slot, people.names_for([p for p in (slot.sheikh_id, slot.supervisor_id) if p]))


@transaction.atomic
def delete_slot(actor, maqraa_id: int, slot_id: int, *, ip=None) -> None:
    access.require(actor, policy.SCHEDULE_EDIT, maqraa_id, ip=ip)
    slot = repositories.get_slot(actor, maqraa_id, slot_id)
    if slot is None:
        raise ScopeNotFound()
    slot.active = False
    slot.save(update_fields=["active", "updated_at"])
    audit.record(actor, "slot.delete", obj=slot, maqraa_id=maqraa_id, ip=ip)
    sync_future_sessions(maqraa_id)


# ---- session generation ---------------------------------------------------------------------------
def generate_sessions(maqraa_id: int, *, weeks_ahead: int | None = None, today: date | None = None) -> int:
    """System job + service: create missing sessions for the next N weeks (UTC), future only."""
    weeks = weeks_ahead or config.get_setting("sessions_generate_weeks_ahead", maqraa_id)
    tz = _tz(maqraa_id)
    start_day = today or timezone.now().astimezone(tz).date()
    end_day = start_day + timedelta(days=7 * weeks)
    slots = repositories.active_slots_system(maqraa_id)
    window_start = timeutil.local_to_utc(start_day - timedelta(days=1), time(0, 0), tz)
    window_end = timeutil.local_to_utc(end_day + timedelta(days=1), time(0, 0), tz)
    existing = repositories.existing_session_keys(maqraa_id, window_start, window_end)
    now = timezone.now()
    new: list[Session] = []
    day = start_day
    while day < end_day:
        for slot in slots:
            if slot.weekday != day.weekday():
                continue
            start_at, end_at = timeutil.slot_to_utc(day, slot.start_time, slot.end_time, tz)
            if start_at <= now or (slot.pk, start_at) in existing:
                continue
            new.append(Session(maqraa_id=maqraa_id, start_at=start_at, end_at=end_at, sheikh_id=slot.sheikh_id,
                               supervisor_id=slot.supervisor_id, origin_slot_id=slot.pk))
        day += timedelta(days=1)
    repositories.bulk_create_sessions(new)
    return len(new)


@transaction.atomic
def sync_future_sessions(maqraa_id: int) -> dict:
    """Template changed: regenerate *future untouched* sessions only; past and touched sessions stay."""
    removed = repositories.delete_future_untouched(maqraa_id, timezone.now())
    created = generate_sessions(maqraa_id)
    return {"removed": removed, "created": created}


def generate_for_actor(actor, maqraa_id: int, *, ip=None) -> dict:
    access.require(actor, policy.SCHEDULE_EDIT, maqraa_id, ip=ip)
    result = sync_future_sessions(maqraa_id)
    audit.record(actor, "sessions.generate", object_type="Maqraa", object_id=maqraa_id, maqraa_id=maqraa_id,
                 after=result, ip=ip)
    return result


def generate_all() -> dict[int, int]:
    return {mid: generate_sessions(mid) for mid in maqraat.all_maqraa_ids()}


# ---- reading sessions -----------------------------------------------------------------------------
def _session_dict(s: Session, names: dict[int, str], now: datetime, *, with_supervisor=True) -> dict:
    awaiting_report = s.end_at < now and s.status not in Status.FINAL
    return {
        "id": s.pk, "status": s.status, "awaiting_report": awaiting_report,
        "start_utc": s.start_at.isoformat(), "end_utc": s.end_at.isoformat(),
        "start_tunis": timeutil.fmt_hm(s.start_at, timeutil.TUNIS), "end_tunis": timeutil.fmt_hm(s.end_at, timeutil.TUNIS),
        "start_mecca": timeutil.fmt_hm(s.start_at, timeutil.MECCA), "end_mecca": timeutil.fmt_hm(s.end_at, timeutil.MECCA),
        "sheikh": {"id": s.sheikh_id, "name": names.get(s.sheikh_id)} if s.sheikh_id else None,
        "supervisor": ({"id": s.supervisor_id, "name": names.get(s.supervisor_id)}
                       if with_supervisor and s.supervisor_id else None),
    }


def _day_payload(maqraa, day: date, sessions, names, *, with_supervisor=True) -> dict:
    now = timezone.now()
    adjust = config.get_setting("hijri_adjust_days", maqraa.pk)
    return {
        "maqraa": {"id": maqraa.pk, "name_ar": maqraa.name_ar},
        "date": day.isoformat(), "date_ar": timeutil.date_ar(day), "date_hijri_ar": timeutil.date_hijri_ar(day, adjust),
        "sessions": [_session_dict(s, names, now, with_supervisor=with_supervisor) for s in sessions],
    }


def today_board(actor, maqraa_id: int, *, day: date | None = None, ip=None) -> dict:
    """Today board. Sheikhs only ever see their own sessions."""
    access.require(actor, policy.SCHEDULE_VIEW_OWN, maqraa_id, ip=ip)
    maqraa = maqraat.get_maqraa(actor, maqraa_id, ip=ip)
    tz = _tz(maqraa_id)
    day = day or timezone.now().astimezone(tz).date()
    start, end = timeutil.local_day_bounds_utc(day, tz)
    only_own = None if access.can(actor, policy.SCHEDULE_VIEW_ALL, maqraa_id) else actor.person_id
    if only_own is None and not access.can(actor, policy.SCHEDULE_VIEW_ALL, maqraa_id):
        return _day_payload(maqraa, day, [], {})
    sessions = repositories.sessions_between(actor, maqraa_id, start, end, sheikh_id=only_own)
    names = people.names_for([p for s in sessions for p in (s.sheikh_id, s.supervisor_id) if p])
    return _day_payload(maqraa, day, sessions, names)


def list_sessions(actor, maqraa_id: int, date_from: date, date_to: date, *, ip=None) -> list[dict]:
    access.require(actor, policy.SCHEDULE_VIEW_OWN, maqraa_id, ip=ip)
    if date_to < date_from or (date_to - date_from).days > 62:
        raise ValidationFailure("مجال التواريخ غير صالح")
    tz = _tz(maqraa_id)
    start = timeutil.local_to_utc(date_from, time(0, 0), tz)
    end = timeutil.local_to_utc(date_to + timedelta(days=1), time(0, 0), tz)
    only_own = None if access.can(actor, policy.SCHEDULE_VIEW_ALL, maqraa_id) else actor.person_id
    sessions = repositories.sessions_between(actor, maqraa_id, start, end, sheikh_id=only_own)
    names = people.names_for([p for s in sessions for p in (s.sheikh_id, s.supervisor_id) if p])
    now = timezone.now()
    return [_session_dict(s, names, now) for s in sessions]


def public_today(slug: str) -> dict:
    """Public page: names and times only. No phones, no supervisors, no internal data."""
    maqraa = maqraat.get_public_maqraa(slug)
    tz = _tz(maqraa.pk)
    day = timezone.now().astimezone(tz).date()
    start, end = timeutil.local_day_bounds_utc(day, tz)
    sessions = repositories.sessions_between_system(maqraa.pk, start, end)
    names = people.names_for([s.sheikh_id for s in sessions if s.sheikh_id])
    payload = _day_payload(maqraa, day, sessions, names, with_supervisor=False)
    for item in payload["sessions"]:
        for private in ("id", "status", "awaiting_report", "start_utc", "end_utc", "supervisor"):
            item.pop(private, None)
        if item["sheikh"]:
            item["sheikh"] = {"name": item["sheikh"]["name"]}
    return payload


# ---- planning import ------------------------------------------------------------------------------
def import_planning(actor, maqraa_id: int, parsed, *, replace: bool = True, ip=None) -> dict:
    """Load a parsed legacy grid into the template. Conflicting rows are skipped and reported."""
    access.require(actor, policy.SCHEDULE_EDIT, maqraa_id, ip=ip)
    access.require(actor, policy.ACCESS_MANAGE, maqraa_id, ip=ip)
    report = {"created": 0, "skipped": [], "warnings": list(parsed.warnings), "people": 0}
    seen: set[int] = set()
    with transaction.atomic():
        if replace:
            repositories.deactivate_all_slots(maqraa_id)
        for row in parsed.slots:
            sheikh = people.find_or_create_by_name(row.corrector)
            sup = people.find_or_create_by_name(row.supervisor) if row.supervisor else None
            for person, role in ((sheikh, ROLE_SHEIKH), (sup, ROLE_SUPERVISOR)):
                if person is not None:
                    access.ensure_access(person.pk, maqraa_id, role, granted_by=actor.pk)
                    seen.add(person.pk)
            try:
                with transaction.atomic():
                    _check_conflicts(maqraa_id, row.weekday, row.start, row.end, sheikh.pk, sup.pk if sup else None)
                    repositories.create_slot(maqraa_id=maqraa_id, weekday=row.weekday, start_time=row.start,
                                             end_time=row.end, sheikh_id=sheikh.pk, supervisor_id=sup.pk if sup else None)
                report["created"] += 1
            except ConflictError as exc:
                report["skipped"].append({"cell": row.cell, "sheikh": row.corrector,
                                          "reason": exc.errors.get("conflict", "conflict")})
        report["people"] = len(seen)
        audit.record(actor, "planning.import", object_type="Maqraa", object_id=maqraa_id, maqraa_id=maqraa_id,
                     after={"created": report["created"], "skipped": len(report["skipped"])}, ip=ip)
    sync_future_sessions(maqraa_id)
    return report
