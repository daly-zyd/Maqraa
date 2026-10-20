"""Authorization service: the *authoritative* check (DRF permission classes are only the first gate).

Out-of-scope maqraa -> ScopeNotFound (404). In scope but missing capability -> CapabilityDenied (403).
Both are audited as denials.
"""
from __future__ import annotations

from apps.accounts import services as accounts
from apps.audit import services as audit
from apps.core.exceptions import CapabilityDenied, ConflictError, ScopeNotFound, ValidationFailure

from . import policy, repositories
from .models import ROLE_ADMIN, ROLES
from .scoping import accessible_maqraa_ids, roles_by_maqraa


def _deny(actor, capability, maqraa_id, exc, ip=None):
    audit.record(actor, "access.denied", object_type=capability, maqraa_id=maqraa_id, ip=ip, outcome="denied")
    raise exc


def scope_ids(actor) -> set[int] | None:
    """None = every maqraa."""
    return accessible_maqraa_ids(actor)


def in_scope(actor, maqraa_id: int) -> bool:
    ids = accessible_maqraa_ids(actor)
    return ids is None or maqraa_id in ids


def capabilities_in(actor, maqraa_id: int) -> frozenset[str]:
    if actor is None or not getattr(actor, "is_authenticated", False):
        return frozenset()
    if getattr(actor, "is_super_admin", False) and actor.is_active:
        return policy.MAQRAA_CAPABILITIES
    return policy.capabilities_for_roles(roles_by_maqraa(actor).get(maqraa_id, ()))


def can(actor, capability: str, maqraa_id: int) -> bool:
    return capability in capabilities_in(actor, maqraa_id)


def can_global(actor, capability: str) -> bool:
    return bool(getattr(actor, "is_super_admin", False) and actor.is_active
                and capability in policy.ALL_CAPABILITIES)


def require(actor, capability: str, maqraa_id: int, *, ip=None) -> None:
    if not in_scope(actor, maqraa_id):
        _deny(actor, capability, maqraa_id, ScopeNotFound(), ip)
    if not can(actor, capability, maqraa_id):
        _deny(actor, capability, maqraa_id, CapabilityDenied(), ip)


def require_scope(actor, maqraa_id: int, *, ip=None) -> None:
    """Membership only (any role). Out of scope -> 404 + audited denial."""
    if not in_scope(actor, maqraa_id):
        _deny(actor, "scope", maqraa_id, ScopeNotFound(), ip)


def require_global(actor, capability: str, *, ip=None) -> None:
    if not can_global(actor, capability):
        _deny(actor, capability, None, CapabilityDenied(), ip)


def roles_in(actor, maqraa_id: int) -> set[str]:
    return set(roles_by_maqraa(actor).get(maqraa_id, ()))


def effective_permissions(actor, maqraa_ids: list[int]) -> dict:
    """Contract of GET /api/v1/me/: roles and capabilities per maqraa (the only thing the UI uses)."""
    per_maqraa = {}
    for mid in maqraa_ids:
        if in_scope(actor, mid):
            per_maqraa[mid] = {
                "roles": sorted(roles_in(actor, mid))
                or (["super_admin"] if getattr(actor, "is_super_admin", False) else []),
                "capabilities": sorted(capabilities_in(actor, mid)),
            }
    global_caps = sorted(policy.GLOBAL_CAPABILITIES) if can_global(actor, policy.WHATSAPP_MANAGE) else []
    return {"maqraat": per_maqraa, "global": global_caps}


# ---- role administration (section 4.6) -------------------------------------------------------------
def _check_role_admin_rules(actor, person_id: int, maqraa_id: int, role: str, ip=None) -> None:
    if role not in ROLES:
        raise ValidationFailure("دور غير معروف")
    require(actor, policy.ACCESS_MANAGE, maqraa_id, ip=ip)
    if getattr(actor, "person_id", None) == person_id:
        _deny(actor, "access.self_change", maqraa_id, CapabilityDenied("لا يمكنك تعديل صلاحياتك بنفسك"), ip)
    if role == ROLE_ADMIN and not can_global(actor, policy.ROLES_MANAGE_SUPER):
        _deny(actor, "access.grant_admin", maqraa_id, CapabilityDenied("المدير العام فقط ينشئ المسؤولين"), ip)


def grant_access(actor, *, person_id: int, maqraa_id: int, role: str, ip=None):
    _check_role_admin_rules(actor, person_id, maqraa_id, role, ip)
    existing = repositories.get_access(person_id, maqraa_id, role)
    before = {"active": existing.active} if existing else None
    access, _ = repositories.upsert_access(person_id=person_id, maqraa_id=maqraa_id, role=role,
                                           granted_by=getattr(actor, "pk", None))
    accounts.bump_token_version_for_person(person_id)  # takes effect immediately
    audit.record(actor, "access.grant", obj=access, maqraa_id=maqraa_id, before=before,
                 after={"person": person_id, "role": role, "active": True}, ip=ip)
    return access


def revoke_access(actor, *, person_id: int, maqraa_id: int, role: str, ip=None) -> None:
    _check_role_admin_rules(actor, person_id, maqraa_id, role, ip)
    access = repositories.get_access(person_id, maqraa_id, role)
    if access is None or not access.active:
        raise ScopeNotFound()
    repositories.deactivate_access(access)
    accounts.bump_token_version_for_person(person_id)
    audit.record(actor, "access.revoke", obj=access, maqraa_id=maqraa_id,
                 before={"person": person_id, "role": role, "active": True}, after={"active": False}, ip=ip)


def set_super_admin(actor, *, user_id: int, value: bool, ip=None) -> None:
    require_global(actor, policy.ROLES_MANAGE_SUPER, ip=ip)
    if actor.pk == user_id:
        _deny(actor, "access.self_change", None, CapabilityDenied("لا يمكنك تعديل صلاحياتك بنفسك"), ip)
    target = accounts.get_user(user_id)
    if target is None:
        raise ScopeNotFound()
    if not value and target.is_super_admin and accounts.count_active_super_admins() <= 1:
        raise ConflictError("لا يمكن إزالة آخر مدير عام")
    accounts.set_super_admin(user_id, value)
    audit.record(actor, "access.set_super_admin", object_type="User", object_id=user_id,
                 before={"is_super_admin": target.is_super_admin}, after={"is_super_admin": value}, ip=ip)


def list_accesses(maqraa_id: int):
    return repositories.list_for_maqraa(maqraa_id)


def person_ids_with_role(maqraa_id: int, role: str) -> list[int]:
    return repositories.active_person_ids_for_role(maqraa_id, role)


def has_role(person_id: int, maqraa_id: int, roles: list[str]) -> bool:
    return repositories.has_active_role(person_id, maqraa_id, roles)


def ensure_access(person_id: int, maqraa_id: int, role: str, *, granted_by: int | None = None):
    """System use only (planning import, onboarding wizard after its own capability checks)."""
    existing = repositories.get_access(person_id, maqraa_id, role)
    if existing and existing.active:
        return existing
    access, _ = repositories.upsert_access(person_id=person_id, maqraa_id=maqraa_id, role=role, granted_by=granted_by)
    accounts.bump_token_version_for_person(person_id)
    return access
