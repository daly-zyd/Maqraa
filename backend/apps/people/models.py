from django.db import models
from django.db.models import Q

from apps.access.models import MaqraaAccess
from apps.access.scoping import ScopedQuerySet
from apps.core.models import TimestampedModel


class PersonQuerySet(ScopedQuerySet):
    def scope_filter(self, ids):
        # a person is visible when they hold an active access in a maqraa the actor can see
        return Q(pk__in=MaqraaAccess.objects.filter(maqraa_id__in=ids, active=True).values("person_id"))


class Person(TimestampedModel):
    full_name = models.CharField(max_length=150)
    display_name_formal = models.CharField(max_length=200, blank=True)  # "الشيخ فلان بن فلان" for posters
    honorific = models.CharField(max_length=40, blank=True)
    show_photo = models.BooleanField(default=False)  # consent flag
    phone_e164 = models.CharField(max_length=20, null=True, blank=True, default=None)  # sensitive
    active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    name_key = models.CharField(max_length=200, db_index=True)

    objects = PersonQuerySet.as_manager()

    class Meta:
        constraints = [models.UniqueConstraint(fields=["phone_e164"], condition=Q(phone_e164__isnull=False),
                                               name="uniq_person_phone_when_set")]

    def __str__(self):
        return self.full_name


class PersonAlias(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="aliases")
    alias = models.CharField(max_length=200)
    alias_key = models.CharField(max_length=200, unique=True)
