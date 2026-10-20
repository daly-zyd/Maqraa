"""Generated from the policy table: role x capability x (own maqraa, same riwaya, other gender, other riwaya)."""
import pytest

from apps.access import policy
from apps.access import services as access
from apps.core.exceptions import CapabilityDenied, ScopeNotFound

OWN = "qaloun-men"
OTHERS = {"same_riwaya_other_gender": "qaloun-women", "other_riwaya_same_gender": "hafs-men",
          "other_riwaya_other_gender": "hafs-women"}
CAPS = sorted(policy.MAQRAA_CAPABILITIES)


@pytest.mark.parametrize("role", ["sheikh", "supervisor", "admin"])
@pytest.mark.parametrize("cap", CAPS)
def test_own_maqraa_follows_the_matrix(make_user, maq, role, cap):
    user = make_user(roles={OWN: [role]})
    expected = cap in policy.ROLE_CAPABILITIES[role]
    assert access.can(user, cap, maq[OWN].pk) is expected
    if expected:
        access.require(user, cap, maq[OWN].pk)
    else:
        with pytest.raises(CapabilityDenied):
            access.require(user, cap, maq[OWN].pk)


@pytest.mark.parametrize("role", ["sheikh", "supervisor", "admin"])
@pytest.mark.parametrize("cap", CAPS)
@pytest.mark.parametrize("other", OTHERS.values(), ids=OTHERS.keys())
def test_other_maqraat_are_invisible_not_forbidden(make_user, maq, role, cap, other):
    user = make_user(roles={OWN: [role]})
    assert not access.can(user, cap, maq[other].pk)
    with pytest.raises(ScopeNotFound):  # 404, never 403, to avoid leaking existence
        access.require(user, cap, maq[other].pk)


@pytest.mark.parametrize("cap", CAPS)
@pytest.mark.parametrize("slug", ["qaloun-men", "qaloun-women", "hafs-men", "hafs-women"])
def test_super_admin_has_everything_everywhere(make_user, maq, cap, slug):
    assert access.can(make_user(super_admin=True), cap, maq[slug].pk)


@pytest.mark.parametrize("cap", sorted(policy.GLOBAL_CAPABILITIES))
def test_global_capabilities_are_super_admin_only(make_user, cap):
    admin = make_user(roles={s: ["admin"] for s in ["qaloun-men", "qaloun-women", "hafs-men", "hafs-women"]})
    assert not access.can_global(admin, cap)
    assert access.can_global(make_user(super_admin=True), cap)


def test_multi_role_in_one_maqraa_is_the_union_and_never_leaks(make_user, maq):
    user = make_user(roles={OWN: ["sheikh", "supervisor"], "hafs-men": ["sheikh"]})
    assert access.can(user, policy.SESSION_CLOSEOUT, maq[OWN].pk)           # from supervisor
    assert access.can(user, policy.SUBSTITUTION_ACCEPT, maq[OWN].pk)        # from sheikh
    assert not access.can(user, policy.SESSION_CLOSEOUT, maq["hafs-men"].pk)  # sheikh only there


def test_deactivated_access_and_inactive_maqraa_grant_nothing(make_user, maq):
    from apps.access.models import MaqraaAccess

    user = make_user(roles={OWN: ["admin"]})
    MaqraaAccess.objects.filter(person=user.person).update(active=False)
    user.__dict__.pop("_scope_cache", None)
    assert not access.can(user, policy.SCHEDULE_EDIT, maq[OWN].pk)


def test_anonymous_gets_nothing(maq):
    from django.contrib.auth.models import AnonymousUser

    assert not access.can(AnonymousUser(), policy.SCHEDULE_VIEW_OWN, maq[OWN].pk)
