"""Scoped managers: segregation cannot depend on discipline (section 2A).

Every maqraa-owned model exposes ``Model.objects.for_actor(actor)``. The plain manager refuses to
evaluate a query unless it went through ``for_actor`` (user-facing) or ``system()`` (jobs/adapters).
"""
from __future__ import annotations

from django.db import models
from django.db.models import Q

from .models import MaqraaAccess


class UnscopedQueryError(RuntimeError):
    pass


def _cache(actor):
    return actor.__dict__.setdefault("_scope_cache", {})


def roles_by_maqraa(actor) -> dict[int, set[str]]:
    """{maqraa_id: {roles}} from active MaqraaAccess rows. Empty for anonymous users."""
    if actor is None or not getattr(actor, "is_authenticated", False):
        return {}
    cache = _cache(actor)
    if "roles" not in cache:
        data: dict[int, set[str]] = {}
        person_id = getattr(actor, "person_id", None)
        if person_id:
            rows = MaqraaAccess.objects.filter(person_id=person_id, active=True, maqraa__active=True)
            for maqraa_id, role in rows.values_list("maqraa_id", "role"):
                data.setdefault(maqraa_id, set()).add(role)
        cache["roles"] = data
    return cache["roles"]


def accessible_maqraa_ids(actor) -> set[int] | None:
    """None means *every* maqraa (super_admin)."""
    if actor is None or not getattr(actor, "is_authenticated", False):
        return set()
    if getattr(actor, "is_super_admin", False) and getattr(actor, "is_active", False):
        return None
    return set(roles_by_maqraa(actor))


class ScopedQuerySet(models.QuerySet):
    SCOPE_FIELD = "maqraa_id"
    _scoped = False

    def _clone(self):
        clone = super()._clone()
        clone._scoped = self._scoped
        return clone

    def scope_filter(self, ids: set[int]) -> Q:
        return Q(**{f"{self.SCOPE_FIELD}__in": ids})

    def for_actor(self, actor):
        ids = accessible_maqraa_ids(actor)
        qs = self._clone()
        qs._scoped = True
        return qs if ids is None else qs.filter(self.scope_filter(ids))

    def system(self):
        """Reserved for scheduler jobs, adapters and cross-maqraa conflict checks (never user-facing reads)."""
        qs = self._clone()
        qs._scoped = True
        return qs

    # ---- guards: an unscoped queryset cannot be evaluated or mutated --------------------------
    def _guard(self):
        if not self._scoped:
            raise UnscopedQueryError(
                f"{self.model.__name__}: use .for_actor(actor) (user-facing) or .system() (jobs)."
            )

    def _fetch_all(self):
        self._guard()
        return super()._fetch_all()

    def count(self):
        self._guard()
        return super().count()

    def exists(self):
        self._guard()
        return super().exists()

    def update(self, **kwargs):
        self._guard()
        return super().update(**kwargs)

    def delete(self):
        self._guard()
        return super().delete()

    def iterator(self, *args, **kwargs):
        self._guard()
        return super().iterator(*args, **kwargs)

    def aggregate(self, *args, **kwargs):
        self._guard()
        return super().aggregate(*args, **kwargs)


ScopedManager = models.Manager.from_queryset(ScopedQuerySet)
