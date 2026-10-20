from datetime import datetime

from django.db.models import Q

from .models import Session, Status, WeeklyTemplateSlot


# ---- slots ----------------------------------------------------------------------------------------
def list_slots(actor, maqraa_id: int):
    return list(WeeklyTemplateSlot.objects.for_actor(actor).filter(maqraa_id=maqraa_id, active=True)
                .order_by("weekday", "start_time"))


def get_slot(actor, maqraa_id: int, slot_id: int) -> WeeklyTemplateSlot | None:
    return WeeklyTemplateSlot.objects.for_actor(actor).filter(pk=slot_id, maqraa_id=maqraa_id, active=True).first()


def create_slot(**fields) -> WeeklyTemplateSlot:
    return WeeklyTemplateSlot.objects.create(**fields)


def slots_of_maqraa_system(maqraa_id: int, exclude_id: int | None = None):
    qs = WeeklyTemplateSlot.objects.system().filter(maqraa_id=maqraa_id, active=True)
    return list(qs.exclude(pk=exclude_id) if exclude_id else qs)


def slots_of_person_system(person_id: int, exclude_id: int | None = None):
    """Cross-maqraa on purpose: used only to *detect* conflicts, never to display another maqraa's data."""
    qs = WeeklyTemplateSlot.objects.system().filter(active=True).filter(Q(sheikh_id=person_id) | Q(supervisor_id=person_id))
    return list(qs.exclude(pk=exclude_id) if exclude_id else qs)


def deactivate_all_slots(maqraa_id: int) -> int:
    return WeeklyTemplateSlot.objects.system().filter(maqraa_id=maqraa_id, active=True).update(active=False)


def active_slots_system(maqraa_id: int | None = None):
    qs = WeeklyTemplateSlot.objects.system().filter(active=True)
    return list(qs.filter(maqraa_id=maqraa_id) if maqraa_id else qs)


# ---- sessions -------------------------------------------------------------------------------------
def existing_session_keys(maqraa_id: int, start: datetime, end: datetime) -> set[tuple[int, datetime]]:
    rows = Session.objects.system().filter(maqraa_id=maqraa_id, origin_slot__isnull=False,
                                           start_at__gte=start, start_at__lt=end).values_list("origin_slot_id", "start_at")
    return set(rows)


def bulk_create_sessions(sessions: list[Session]) -> None:
    Session.objects.bulk_create(sessions)


def delete_future_untouched(maqraa_id: int, now: datetime) -> int:
    qs = Session.objects.system().filter(maqraa_id=maqraa_id, start_at__gt=now, origin_slot__isnull=False,
                                         status=Status.SCHEDULED)
    count = qs.count()
    qs.delete()
    return count


def sessions_between(actor, maqraa_id: int, start: datetime, end: datetime, *, sheikh_id: int | None = None):
    qs = Session.objects.for_actor(actor).filter(maqraa_id=maqraa_id, start_at__gte=start, start_at__lt=end)
    if sheikh_id is not None:
        qs = qs.filter(sheikh_id=sheikh_id)
    return list(qs.order_by("start_at"))


def sessions_between_system(maqraa_id: int, start: datetime, end: datetime):
    return list(Session.objects.system().filter(maqraa_id=maqraa_id, start_at__gte=start, start_at__lt=end)
                .exclude(status=Status.CANCELLED).order_by("start_at"))
