import pytest
from rest_framework.test import APIClient

from apps.access import services as access
from apps.accounts import services as accounts
from apps.core.exceptions import CapabilityDenied, ConflictError, ScopeNotFound
from apps.people.models import Person


def target(name="target"):
    return Person.objects.create(full_name=name, name_key=name)


def test_admin_can_grant_lower_roles_in_own_maqraa(make_user, maq):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    p = target()
    access.grant_access(admin, person_id=p.pk, maqraa_id=maq["qaloun-men"].pk, role="sheikh")
    access.grant_access(admin, person_id=p.pk, maqraa_id=maq["qaloun-men"].pk, role="supervisor")


def test_admin_cannot_create_admins_only_super_admin_can(make_user, maq):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    p = target()
    with pytest.raises(CapabilityDenied):
        access.grant_access(admin, person_id=p.pk, maqraa_id=maq["qaloun-men"].pk, role="admin")
    access.grant_access(make_user(super_admin=True), person_id=p.pk, maqraa_id=maq["qaloun-men"].pk, role="admin")


def test_admin_cannot_grant_outside_their_scope(make_user, maq):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    with pytest.raises(ScopeNotFound):
        access.grant_access(admin, person_id=target().pk, maqraa_id=maq["hafs-men"].pk, role="sheikh")


@pytest.mark.parametrize("role", ["sheikh", "supervisor"])
def test_lower_roles_cannot_manage_access(make_user, maq, role):
    user = make_user(roles={"qaloun-men": [role]})
    with pytest.raises(CapabilityDenied):
        access.grant_access(user, person_id=target().pk, maqraa_id=maq["qaloun-men"].pk, role="sheikh")


def test_nobody_changes_their_own_privileges_not_even_super_admin(make_user, maq):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    with pytest.raises(CapabilityDenied):
        access.grant_access(admin, person_id=admin.person_id, maqraa_id=maq["qaloun-men"].pk, role="supervisor")
    boss = make_user(super_admin=True)
    with pytest.raises(CapabilityDenied):
        access.set_super_admin(boss, user_id=boss.pk, value=False)


def test_last_super_admin_cannot_be_demoted(make_user, monkeypatch):
    boss = make_user(super_admin=True)
    other = make_user(super_admin=True)
    with pytest.raises(CapabilityDenied):  # nobody changes their own privileges
        access.set_super_admin(boss, user_id=boss.pk, value=False)
    # simulate the race where `other` is the only active super admin left
    monkeypatch.setattr(accounts, "count_active_super_admins", lambda: 1)
    with pytest.raises(ConflictError):
        access.set_super_admin(boss, user_id=other.pk, value=False)
    monkeypatch.undo()
    access.set_super_admin(boss, user_id=other.pk, value=False)  # allowed while boss remains


def test_only_super_admin_can_toggle_super_admin(make_user):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    with pytest.raises(CapabilityDenied):
        access.set_super_admin(admin, user_id=make_user().pk, value=True)


def test_revocation_takes_effect_immediately(make_user, maq):
    boss = make_user(super_admin=True)
    sup = make_user("sup", roles={"qaloun-men": ["supervisor"]})
    tokens = accounts.login("sup", "Str0ng-Passw0rd!")
    c = APIClient()
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    assert c.get(f"/api/v1/maqraat/{maq['qaloun-men'].pk}/today/").status_code == 200
    access.revoke_access(boss, person_id=sup.person_id, maqraa_id=maq["qaloun-men"].pk, role="supervisor")
    assert c.get(f"/api/v1/maqraat/{maq['qaloun-men'].pk}/today/").status_code == 401  # old token dead
    fresh = accounts.login("sup", "Str0ng-Passw0rd!")
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {fresh['access']}")
    assert c.get(f"/api/v1/maqraat/{maq['qaloun-men'].pk}/today/").status_code == 404  # no scope anymore


def test_role_changes_are_audited_with_before_after(make_user, maq):
    from apps.audit.models import AuditLog

    boss = make_user(super_admin=True)
    p = target()
    access.grant_access(boss, person_id=p.pk, maqraa_id=maq["hafs-men"].pk, role="sheikh")
    entry = AuditLog.objects.filter(action="access.grant").latest("id")
    assert entry.actor_user_id == boss.pk and entry.after["role"] == "sheikh" and entry.maqraa_id == maq["hafs-men"].pk
