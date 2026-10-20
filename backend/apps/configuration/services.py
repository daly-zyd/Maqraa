from django.core.cache import cache

from apps.access import policy
from apps.access import services as access
from apps.audit import services as audit
from apps.core.exceptions import CapabilityDenied, ScopeNotFound, ValidationFailure

from . import repositories
from .registry import REGISTRY, coerce

_CACHE_VERSION_KEY = "settings:version"


def _version() -> int:
    return cache.get(_CACHE_VERSION_KEY, 1)


def get_setting(key: str, maqraa_id: int | None = None):
    """Effective value: per-maqraa override > global > registry default (short-TTL cache, version-invalidated)."""
    defn = REGISTRY.get(key)
    if defn is None:
        raise ValidationFailure(f"إعداد غير معروف: {key}")
    ck = f"settings:{_version()}:{key}:{maqraa_id}"
    hit = cache.get(ck)
    if hit is not None:
        return hit[0]
    value = defn.default
    for scope in ([maqraa_id] if maqraa_id else []) + [None]:
        found, stored = repositories.get_value_system(key, scope)
        if found:
            value = stored
            break
    cache.set(ck, (value,), 60)
    return value


def set_setting(actor, key: str, value, maqraa_id: int | None = None, *, ip=None):
    defn = REGISTRY.get(key)
    if defn is None:
        raise ValidationFailure(f"إعداد غير معروف: {key}")
    if defn.system or maqraa_id is None:
        access.require_global(actor, policy.SYSTEM_SETTINGS, ip=ip)
        if defn.system and maqraa_id is not None:
            raise ValidationFailure("هذا الإعداد عام فقط")
    else:
        access.require(actor, policy.SETTINGS_EDIT, maqraa_id, ip=ip)
    before = get_setting(key, maqraa_id)
    repositories.upsert(key, coerce(defn, value), maqraa_id)
    cache.set(_CACHE_VERSION_KEY, _version() + 1, None)
    audit.record(actor, "setting.set", object_type="Setting", object_id=key, maqraa_id=maqraa_id,
                 before={"value": before}, after={"value": value}, ip=ip)


def list_settings(actor, maqraa_id: int | None = None) -> list[dict]:
    if maqraa_id is None:
        access.require_global(actor, policy.SYSTEM_SETTINGS)
    else:
        access.require(actor, policy.SETTINGS_EDIT, maqraa_id)
    return [{"key": d.key, "kind": d.kind, "system": d.system, "value": get_setting(d.key, maqraa_id)}
            for d in REGISTRY.values() if maqraa_id is None or not d.system]


def list_audit(actor, *, maqraa_id: int | None = None, before_id: int | None = None, limit: int = 50):
    """Super admin: everything. Admin: read-only, own scope. Others: denied."""
    ids = access.scope_ids(actor)
    allowed = ids if ids is None else {m for m in ids if access.can(actor, policy.AUDIT_VIEW, m)}
    if allowed is not None and not allowed:
        raise CapabilityDenied()
    if maqraa_id is not None:
        if allowed is not None and maqraa_id not in allowed:
            raise ScopeNotFound()
        allowed = {maqraa_id}
    entries = audit.list_entries(maqraa_ids=allowed, before_id=before_id, limit=limit)
    return [{"id": e.id, "at": e.at.isoformat(), "actor": e.actor_label, "action": e.action,
             "object_type": e.object_type, "object_id": e.object_id, "maqraa_id": e.maqraa_id,
             "outcome": e.outcome} for e in entries]
