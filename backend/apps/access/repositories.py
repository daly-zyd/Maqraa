from .models import MaqraaAccess


def get_access(person_id: int, maqraa_id: int, role: str) -> MaqraaAccess | None:
    return MaqraaAccess.objects.filter(person_id=person_id, maqraa_id=maqraa_id, role=role).first()


def upsert_access(*, person_id: int, maqraa_id: int, role: str, granted_by: int | None) -> tuple[MaqraaAccess, bool]:
    return MaqraaAccess.objects.update_or_create(
        person_id=person_id, maqraa_id=maqraa_id, role=role,
        defaults={"active": True, "granted_by": granted_by},
    )


def deactivate_access(access: MaqraaAccess) -> None:
    access.active = False
    access.save(update_fields=["active", "updated_at"])


def list_for_maqraa(maqraa_id: int):
    return list(MaqraaAccess.objects.filter(maqraa_id=maqraa_id, active=True).select_related("person"))


def active_person_ids_for_role(maqraa_id: int, role: str) -> list[int]:
    return list(MaqraaAccess.objects.filter(maqraa_id=maqraa_id, role=role, active=True)
                .values_list("person_id", flat=True))


def has_active_role(person_id: int, maqraa_id: int, roles: list[str]) -> bool:
    return MaqraaAccess.objects.filter(person_id=person_id, maqraa_id=maqraa_id, role__in=roles, active=True).exists()
