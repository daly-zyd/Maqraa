from django.db import models


class AuditLog(models.Model):
    """Append-only: who, what, object, before/after, ip, outcome (denials included)."""

    OUTCOME_ALLOWED = "allowed"
    OUTCOME_DENIED = "denied"
    OUTCOME_ERROR = "error"

    at = models.DateTimeField(auto_now_add=True, db_index=True)
    actor_user_id = models.BigIntegerField(null=True, blank=True)
    actor_label = models.CharField(max_length=150, blank=True)
    action = models.CharField(max_length=80)
    object_type = models.CharField(max_length=60, blank=True)
    object_id = models.CharField(max_length=40, blank=True)
    maqraa_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    before = models.JSONField(null=True, blank=True)
    after = models.JSONField(null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    outcome = models.CharField(max_length=10, default=OUTCOME_ALLOWED)

    class Meta:
        indexes = [models.Index(fields=["maqraa_id", "at"]), models.Index(fields=["actor_user_id", "at"])]
        ordering = ["-id"]
