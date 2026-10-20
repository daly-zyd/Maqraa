from django.db import models

from apps.core.models import TimestampedModel

ROLE_SHEIKH = "sheikh"
ROLE_SUPERVISOR = "supervisor"
ROLE_ADMIN = "admin"
ROLES = [ROLE_SHEIKH, ROLE_SUPERVISOR, ROLE_ADMIN]


class MaqraaAccess(TimestampedModel):
    """Access is granted per (person, maqraa, role) - never by role alone (section 4.2)."""

    person = models.ForeignKey("people.Person", on_delete=models.CASCADE, related_name="accesses")
    maqraa = models.ForeignKey("maqraat.Maqraa", on_delete=models.CASCADE, related_name="accesses")
    role = models.CharField(max_length=12, choices=[(r, r) for r in ROLES])
    active = models.BooleanField(default=True)
    granted_by = models.BigIntegerField(null=True, blank=True)  # user id

    class Meta:
        constraints = [models.UniqueConstraint(fields=["person", "maqraa", "role"], name="uniq_access")]
        indexes = [models.Index(fields=["maqraa", "role", "active"]), models.Index(fields=["person", "active"])]
