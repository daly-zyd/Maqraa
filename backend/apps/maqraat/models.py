from django.db import models
from django.db.models import Q

from apps.access.scoping import ScopedQuerySet
from apps.core.models import TimestampedModel


class Riwaya(models.Model):
    code = models.SlugField(max_length=20, unique=True)  # qaloun / hafs
    name_ar = models.CharField(max_length=60)

    def __str__(self):
        return self.name_ar


class MaqraaQuerySet(ScopedQuerySet):
    SCOPE_FIELD = "id"


class Maqraa(TimestampedModel):
    """riwaya x gender. Each maqraa is an isolated data silo (section 4.3)."""

    MEN = "men"
    WOMEN = "women"

    slug = models.SlugField(max_length=40, unique=True)
    riwaya = models.ForeignKey(Riwaya, on_delete=models.PROTECT, related_name="maqraat")
    gender = models.CharField(max_length=5, choices=[(MEN, "رجال"), (WOMEN, "نساء")])
    name_ar = models.CharField(max_length=100)
    logo = models.FileField(upload_to="logos/", blank=True)  # served only through the app
    whatsapp_group_id = models.CharField(max_length=80, blank=True)  # students / announcements
    staff_group_id = models.CharField(max_length=80, blank=True)  # sheikhs
    active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    objects = MaqraaQuerySet.as_manager()

    class Meta:
        constraints = [models.UniqueConstraint(fields=["riwaya", "gender"], name="uniq_maqraa_riwaya_gender")]
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.name_ar


class MaqraaLinkQuerySet(ScopedQuerySet):
    pass


class MaqraaLink(TimestampedModel):
    """Links are data, never code (Zoom rooms, WhatsApp group invites)."""

    ZOOM = "zoom"
    WHATSAPP_INVITE = "whatsapp_group_invite"
    OTHER = "other"

    maqraa = models.ForeignKey(Maqraa, on_delete=models.CASCADE, related_name="links")
    kind = models.CharField(max_length=24, choices=[(ZOOM, "zoom"), (WHATSAPP_INVITE, "whatsapp"), (OTHER, "other")])
    label = models.CharField(max_length=100, blank=True)
    url = models.URLField(max_length=500)
    is_default = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    show_on_public_site = models.BooleanField(default=False)
    created_by = models.BigIntegerField(null=True, blank=True)

    objects = MaqraaLinkQuerySet.as_manager()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["maqraa", "kind"], condition=Q(is_default=True, active=True),
                                    name="uniq_default_link_per_kind"),
        ]
