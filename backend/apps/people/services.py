from apps.access import policy
from apps.access import services as access
from apps.accounts import services as accounts
from apps.audit import services as audit
from apps.core.arabic import name_key, strip_titles
from apps.core.exceptions import ConflictError, ScopeNotFound, ValidationFailure
from apps.maqraat import services as maqraat

from . import repositories


def display_name(raw: str) -> str:
    """Name as shown in the UI: titles ('ش/') and time hints removed, spaces collapsed."""
    return " ".join(strip_titles(raw).split())


def find_or_create_by_name(raw_name: str):
    """System use (planning import, onboarding): resolve a spelling to one Person through aliases."""
    shown = display_name(raw_name)
    key = name_key(raw_name)
    if not key:
        raise ValidationFailure("اسم فارغ")
    person = repositories.find_by_alias_key(key)
    if person is None:
        person = repositories.create_person(full_name=shown, name_key=key)
    repositories.add_alias(person, shown, key)
    return person


def possible_duplicates():
    return repositories.possible_duplicates()


def get_me(actor) -> dict:
    """GET /api/v1/me/: identity, per-maqraa roles and effective capabilities."""
    visible = maqraat.list_maqraat(actor)
    perms = access.effective_permissions(actor, [m.id for m in visible])
    person = repositories.get_system(actor.person_id) if actor.person_id else None
    return {
        "id": actor.pk,
        "username": actor.username,
        "full_name": person.full_name if person else actor.username,
        "person_id": actor.person_id,
        "is_super_admin": actor.is_super_admin,
        "maqraat": [
            {"id": m.id, "slug": m.slug, "name_ar": m.name_ar, "riwaya": m.riwaya.code, "gender": m.gender,
             **perms["maqraat"].get(m.id, {"roles": [], "capabilities": []})}
            for m in visible
        ],
        "global_capabilities": perms["global"],
    }


def list_people(actor, maqraa_id: int, *, ip=None) -> list[dict]:
    access.require(actor, policy.PEOPLE_VIEW, maqraa_id, ip=ip)
    show_phone = access.can(actor, policy.PEOPLE_VIEW_PHONE, maqraa_id)
    grouped: dict[int, dict] = {}
    for row in access.list_accesses(maqraa_id):
        p = row.person
        entry = grouped.setdefault(p.pk, {"id": p.pk, "full_name": p.full_name, "roles": [],
                                          "display_name_formal": p.display_name_formal,
                                          "phone": p.phone_e164 if show_phone else None})
        entry["roles"].append(row.role)
    return sorted(grouped.values(), key=lambda d: d["full_name"])


def create_person(actor, maqraa_id: int, *, full_name: str, role: str, phone: str | None = None,
                  display_name_formal: str = "", ip=None):
    """Onboarding: person + alias + per-maqraa role in one transaction-like step."""
    access.require(actor, policy.PEOPLE_MANAGE, maqraa_id, ip=ip)
    e164 = None
    if phone:
        e164 = accounts.normalize_phone(phone)
        if not e164:
            raise ValidationFailure("رقم الهاتف غير صالح")
    key = name_key(full_name)
    if repositories.find_by_alias_key(key):
        raise ConflictError("هذا الاسم موجود مسبقاً")
    person = repositories.create_person(full_name=display_name(full_name), name_key=key,
                                        phone_e164=e164, display_name_formal=display_name_formal)
    repositories.add_alias(person, display_name(full_name), key)
    access.grant_access(actor, person_id=person.pk, maqraa_id=maqraa_id, role=role, ip=ip)
    audit.record(actor, "person.create", obj=person, maqraa_id=maqraa_id, after={"role": role}, ip=ip)
    return person


def _require_person(person_id: int):
    person = repositories.get_system(person_id)
    if person is None:
        raise ScopeNotFound()
    return person


def grant_role(actor, *, person_id: int, maqraa_id: int, role: str, ip=None):
    maqraat.get_maqraa(actor, maqraa_id, ip=ip)
    _require_person(person_id)
    return access.grant_access(actor, person_id=person_id, maqraa_id=maqraa_id, role=role, ip=ip)


def revoke_role(actor, *, person_id: int, maqraa_id: int, role: str, ip=None):
    maqraat.get_maqraa(actor, maqraa_id, ip=ip)
    _require_person(person_id)
    return access.revoke_access(actor, person_id=person_id, maqraa_id=maqraa_id, role=role, ip=ip)


def set_super_admin(actor, *, user_id: int, value: bool, ip=None):
    return access.set_super_admin(actor, user_id=user_id, value=value, ip=ip)


def names_for(person_ids: list[int]) -> dict[int, str]:
    return {pk: p.full_name for pk, p in repositories.names_system(person_ids).items()}
