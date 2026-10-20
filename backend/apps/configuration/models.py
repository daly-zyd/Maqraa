from django.db import models
from django.db.models import Q

from apps.access.scoping import ScopedQuerySet
from apps.core.models import TimestampedModel


class SettingQuerySet(ScopedQuerySet):
    SCOPE_FIELD = "maqraa_id"


class Setting(TimestampedModel):
    key = models.CharField(max_length=80)
    value = models.JSONField()
    maqraa = models.ForeignKey("maqraat.Maqraa", null=True, blank=True, on_delete=models.CASCADE)  # null = global

    objects = SettingQuerySet.as_manager()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["key", "maqraa"], condition=Q(maqraa__isnull=False), name="uniq_setting_maqraa"),
            models.UniqueConstraint(fields=["key"], condition=Q(maqraa__isnull=True), name="uniq_setting_global"),
        ]
