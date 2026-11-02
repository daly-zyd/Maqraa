from django.db import models
from django.db.models import Q

from apps.access.scoping import ScopedQuerySet
from apps.core.models import TimestampedModel


class SlotQuerySet(ScopedQuerySet):
    pass


class WeeklyTemplateSlot(TimestampedModel):
    """One recurring session. weekday: Monday=0 ... Sunday=6. Times are in the base timezone (Tunis)."""

    maqraa = models.ForeignKey("maqraat.Maqraa", on_delete=models.CASCADE, related_name="slots")
    weekday = models.PositiveSmallIntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()  # <= start_time means the slot crosses midnight
    sheikh = models.ForeignKey("people.Person", null=True, blank=True, on_delete=models.PROTECT, related_name="+")
    supervisor = models.ForeignKey("people.Person", null=True, blank=True, on_delete=models.PROTECT, related_name="+")
    notes = models.CharField(max_length=200, blank=True)
    active = models.BooleanField(default=True)

    objects = SlotQuerySet.as_manager()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["maqraa", "weekday", "start_time"], condition=Q(active=True),
                                    name="uniq_active_slot_start"),
            models.CheckConstraint(condition=Q(weekday__gte=0, weekday__lte=6), name="slot_weekday_range"),
        ]
        indexes = [models.Index(fields=["maqraa", "weekday", "active"]),
                   models.Index(fields=["sheikh", "active"]), models.Index(fields=["supervisor", "active"])]


class Status:
    SCHEDULED = "scheduled"
    AWAITING_CONFIRMATION = "awaiting_confirmation"
    CONFIRMED = "confirmed"
    DECLINED = "declined"
    SUBSTITUTION_OPEN = "substitution_open"
    ROOM_OPEN = "room_open"
    CLOSED_OUT = "closed_out"
    REPORTED = "reported"
    MISSED = "missed"
    CANCELLED = "cancelled"

    ALL = [SCHEDULED, AWAITING_CONFIRMATION, CONFIRMED, DECLINED, SUBSTITUTION_OPEN, ROOM_OPEN, CLOSED_OUT,
           REPORTED, MISSED, CANCELLED]
    FINAL = {CLOSED_OUT, REPORTED, MISSED, CANCELLED}


class Session(TimestampedModel):
    """Dated instance generated from the template. Past sessions are immutable history."""

    maqraa = models.ForeignKey("maqraat.Maqraa", on_delete=models.CASCADE, related_name="sessions")
    start_at = models.DateTimeField()  # UTC
    end_at = models.DateTimeField()  # UTC
    sheikh = models.ForeignKey("people.Person", null=True, blank=True, on_delete=models.PROTECT, related_name="+")
    supervisor = models.ForeignKey("people.Person", null=True, blank=True, on_delete=models.PROTECT, related_name="+")
    original_sheikh = models.ForeignKey("people.Person", null=True, blank=True, on_delete=models.PROTECT, related_name="+")
    status = models.CharField(max_length=24, default=Status.SCHEDULED, choices=[(s, s) for s in Status.ALL])
    zoom_url_override = models.URLField(max_length=500, blank=True)
    origin_slot = models.ForeignKey(WeeklyTemplateSlot, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)

    objects = SlotQuerySet.as_manager()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["origin_slot", "start_at"], condition=Q(origin_slot__isnull=False),
                                    name="uniq_session_per_slot_start"),
        ]
        indexes = [models.Index(fields=["maqraa", "start_at"]), models.Index(fields=["status", "start_at"]),
                   models.Index(fields=["sheikh", "start_at"])]


class SessionReport(TimestampedModel):
    """Close-out report of one session (the "تقرير مقرأة" posted to the WhatsApp group).

    Corrector and supervisor are frozen at report time: a later substitution or roster change never rewrites history.
    Pages are mushaf faces (الوجه), 1..604 in the Madina print.
    """

    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name="report")
    maqraa = models.ForeignKey("maqraat.Maqraa", on_delete=models.CASCADE, related_name="+")
    corrector = models.ForeignKey("people.Person", null=True, blank=True, on_delete=models.PROTECT, related_name="+")
    supervisor = models.ForeignKey("people.Person", null=True, blank=True, on_delete=models.PROTECT, related_name="+")
    students_start = models.PositiveSmallIntegerField()
    students_end = models.PositiveSmallIntegerField()
    page_from = models.PositiveSmallIntegerField()
    page_to = models.PositiveSmallIntegerField()
    notes = models.CharField(max_length=500, blank=True)
    submitted_by = models.ForeignKey("people.Person", null=True, blank=True, on_delete=models.SET_NULL, related_name="+")

    objects = SlotQuerySet.as_manager()

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(students_end__lte=models.F("students_start")),
                                   name="report_students_end_lte_start"),
            models.CheckConstraint(condition=Q(page_from__gte=1, page_to__lte=604, page_to__gte=models.F("page_from")),
                                   name="report_pages_range"),
        ]
