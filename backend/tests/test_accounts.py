import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework.test import APIClient

from apps.accounts import services as accounts
from apps.audit.models import AuditLog
from apps.core.exceptions import AuthenticationFailure, TooManyAttempts

User = get_user_model()
PW = "Str0ng-Passw0rd!"


def test_users_without_email_or_phone_are_allowed(db):
    User.objects.create_user("a", PW)
    User.objects.create_user("b", PW)  # two NULL emails/phones must coexist
    User.objects.create_user("c", PW, email="x@y.tn")
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create_user("d", PW, email="x@y.tn")


@pytest.mark.parametrize("ident", ["sheikh1", "SHEIKH1", "s1@example.com", "+21698123456", "98123456"])
def test_login_by_username_email_or_phone(make_user, ident):
    make_user("sheikh1", email="s1@example.com", phone="+21698123456")
    assert "access" in accounts.login(ident, PW)


def test_generic_error_for_unknown_and_wrong_password(make_user):
    make_user("sheikh1")
    with pytest.raises(AuthenticationFailure) as a:
        accounts.login("ghost", PW)
    with pytest.raises(AuthenticationFailure) as b:
        accounts.login("sheikh1", "wrong")
    assert a.value.message_ar == b.value.message_ar


def test_lockout_after_repeated_failures(make_user):
    make_user("sheikh1")
    for _ in range(5):
        with pytest.raises(AuthenticationFailure):
            accounts.login("sheikh1", "bad", ip="1.1.1.1")
    with pytest.raises(TooManyAttempts):
        accounts.login("sheikh1", PW, ip="1.1.1.1")  # even the right password is refused while locked
    assert AuditLog.objects.filter(action="auth.locked").exists()


def test_token_version_revokes_access_immediately(make_user):
    user = make_user("sheikh1")
    tokens = accounts.login("sheikh1", PW)
    c = APIClient()
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    assert c.get("/api/v1/me/").status_code == 200
    accounts.bump_token_version(user.pk)
    assert c.get("/api/v1/me/").status_code == 401


def test_refresh_rotates_and_detects_reuse(make_user):
    make_user("sheikh1")
    first = accounts.login("sheikh1", PW)
    second = accounts.refresh(first["refresh"])
    assert second["refresh"] != first["refresh"]
    with pytest.raises(AuthenticationFailure):
        accounts.refresh(first["refresh"])  # replay of a rotated token


def test_refresh_fails_after_logout_and_after_version_bump(make_user):
    user = make_user("sheikh1")
    t = accounts.login("sheikh1", PW)
    accounts.logout(t["refresh"])
    with pytest.raises(AuthenticationFailure):
        accounts.refresh(t["refresh"])
    t2 = accounts.login("sheikh1", PW)
    accounts.bump_token_version(user.pk)
    with pytest.raises(AuthenticationFailure):
        accounts.refresh(t2["refresh"])


def test_inactive_user_cannot_login(make_user):
    user = make_user("sheikh1")
    User.objects.filter(pk=user.pk).update(is_active=False)
    with pytest.raises(AuthenticationFailure):
        accounts.login("sheikh1", PW)


def test_login_http_contract(make_user):
    make_user("sheikh1")
    r = APIClient().post("/api/v1/auth/login/", {"identifier": "sheikh1", "password": "bad"}, format="json")
    assert r.status_code == 401 and set(r.json()) == {"code", "detail", "errors"}
