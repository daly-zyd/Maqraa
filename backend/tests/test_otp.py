import pytest
from django.test import override_settings
from rest_framework.test import APIClient

from apps.accounts import services as accounts
from apps.accounts.models import OtpChallenge
from apps.core.exceptions import AuthenticationFailure, ValidationFailure

PHONE = "+21698123456"
SENT: list[tuple[str, str]] = []


def fake_sender(phone, text):
    SENT.append((phone, text))


@pytest.fixture(autouse=True)
def _sender():
    SENT.clear()
    with override_settings(OTP_SENDER="tests.test_otp.fake_sender"):
        yield


def _code():
    return SENT[-1][1].split(": ")[1].split("\n")[0]


def test_otp_login_roundtrip(make_user):
    make_user("sheikh1", phone=PHONE)
    accounts.request_otp("sheikh1", "login")
    assert SENT[-1][0] == PHONE
    tokens = accounts.login_with_otp("98123456", _code())  # phone also works as identifier
    assert "access" in tokens
    with pytest.raises(AuthenticationFailure):
        accounts.login_with_otp("sheikh1", _code())  # a code is single use


def test_unknown_or_phoneless_accounts_are_silent(make_user):
    make_user("nophone")
    accounts.request_otp("nophone", "login")
    accounts.request_otp("ghost", "login")
    assert SENT == []


def test_wrong_code_locks_challenge_after_max_attempts(make_user):
    make_user("sheikh1", phone=PHONE)
    accounts.request_otp("sheikh1", "login")
    good = _code()
    for _ in range(5):
        with pytest.raises(AuthenticationFailure):
            accounts.login_with_otp("sheikh1", "000000" if good != "000000" else "111111")
    with pytest.raises(AuthenticationFailure):
        accounts.login_with_otp("sheikh1", good)


def test_otp_requests_are_rate_limited(make_user):
    make_user("sheikh1", phone=PHONE)
    for _ in range(8):
        accounts.request_otp("sheikh1", "login")
    assert len(SENT) == 5


def test_code_is_stored_hashed(make_user):
    make_user("sheikh1", phone=PHONE)
    accounts.request_otp("sheikh1", "login")
    assert _code() not in OtpChallenge.objects.get().code_hash


def test_password_reset_changes_password_and_revokes_sessions(make_user):
    user = make_user("sheikh1", phone=PHONE)
    old = accounts.login("sheikh1", "Str0ng-Passw0rd!")
    accounts.request_otp("sheikh1", "reset")
    accounts.reset_password("sheikh1", _code(), "N3w-Passw0rd-Longer!")
    assert "access" in accounts.login("sheikh1", "N3w-Passw0rd-Longer!")
    with pytest.raises(AuthenticationFailure):
        accounts.refresh(old["refresh"])  # token_version bumped
    user.refresh_from_db()
    assert user.token_version == 2


def test_password_reset_enforces_password_policy(make_user):
    make_user("sheikh1", phone=PHONE)
    accounts.request_otp("sheikh1", "reset")
    with pytest.raises(ValidationFailure):
        accounts.reset_password("sheikh1", _code(), "123")


def test_login_code_cannot_reset_a_password(make_user):
    make_user("sheikh1", phone=PHONE)
    accounts.request_otp("sheikh1", "login")
    with pytest.raises(AuthenticationFailure):
        accounts.reset_password("sheikh1", _code(), "N3w-Passw0rd-Longer!")


def test_http_endpoints_never_reveal_account_existence(make_user):
    make_user("sheikh1", phone=PHONE)
    c = APIClient()
    a = c.post("/api/v1/auth/otp/request/", {"identifier": "sheikh1"}, format="json")
    b = c.post("/api/v1/auth/otp/request/", {"identifier": "ghost"}, format="json")
    assert a.status_code == b.status_code == 202 and a.json() == b.json()
    r = c.post("/api/v1/auth/otp/verify/", {"identifier": "sheikh1", "code": _code()}, format="json")
    assert r.status_code == 200 and "access" in r.json()
