"""Authentication business rules: identifier resolution, lockout, versioned JWT, refresh rotation."""
from __future__ import annotations

from datetime import timedelta

import phonenumbers
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit import services as audit
from apps.core.exceptions import AuthenticationFailure, TooManyAttempts

from . import repositories

_DUMMY_HASH = make_password("dummy-password-for-constant-time")


def normalize_phone(raw: str, region: str | None = None) -> str | None:
    """E.164 or None. Tunisia (+216) by default, Saudi Arabia (+966) and others if prefixed."""
    try:
        parsed = phonenumbers.parse(raw, region or settings.DEFAULT_PHONE_REGION)
    except phonenumbers.NumberParseException:
        return None
    if not phonenumbers.is_valid_number(parsed):
        return None
    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


def _classify(identifier: str) -> dict:
    ident = (identifier or "").strip()
    if "@" in ident:
        return {"username": None, "email": ident.lower(), "phone": None}
    digits = ident.replace(" ", "").replace("-", "")
    if digits.lstrip("+").isdigit():
        return {"username": ident, "email": None, "phone": normalize_phone(digits)}
    return {"username": ident, "email": None, "phone": None}


def _tokens_for(user) -> dict:
    refresh = RefreshToken.for_user(user)
    refresh["tv"] = user.token_version  # identity + version only; never permissions (section 4.6)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def login(identifier: str, password: str, *, ip: str | None = None) -> dict:
    """Never reveals whether the account exists (same error, same work)."""
    key = (identifier or "").strip().lower()[:190]
    now = timezone.now()
    window = now - timedelta(minutes=settings.LOGIN_LOCK_MINUTES)
    if (repositories.count_failures(since=window, identifier_key=key) >= settings.LOGIN_MAX_FAILURES
            or (ip and repositories.count_failures(since=window, ip=ip) >= settings.LOGIN_MAX_FAILURES_PER_IP)):
        audit.record(None, "auth.locked", object_type="login", object_id=key, ip=ip, outcome="denied")
        raise TooManyAttempts()

    user = repositories.find_user_for_login(**_classify(identifier))
    if user is None:
        check_password(password or "", _DUMMY_HASH)  # equalise timing
        ok = False
    else:
        ok = user.is_active and check_password(password or "", user.password)

    repositories.record_attempt(identifier_key=key, ip=ip, success=ok)
    if not ok:
        audit.record(None, "auth.login_failed", object_type="login", object_id=key, ip=ip, outcome="denied")
        raise AuthenticationFailure()

    repositories.clear_failures(key)
    audit.record(user, "auth.login", object_type="User", object_id=user.pk, ip=ip)
    return {**_tokens_for(user), "user": {"id": user.pk, "username": user.username}}


def refresh(raw_refresh: str) -> dict:
    """Rotating refresh with reuse detection (blacklisted tokens fail) and token_version check."""
    try:
        token = RefreshToken(raw_refresh)  # verifies signature, expiry and blacklist
    except TokenError:
        raise AuthenticationFailure("انتهت الجلسة") from None
    user = repositories.get_user(token.get("user_id"))
    if user is None or not user.is_active or token.get("tv") != user.token_version:
        raise AuthenticationFailure("انتهت الجلسة")
    try:
        token.blacklist()
    except AttributeError:  # pragma: no cover - blacklist app missing
        pass
    return _tokens_for(user)


def logout(raw_refresh: str) -> None:
    try:
        RefreshToken(raw_refresh).blacklist()
    except TokenError:
        pass


def bump_token_version(user_id: int) -> None:
    """Immediate revocation of every access/refresh token of the user."""
    repositories.bump_token_version(user_id)


def bump_token_version_for_person(person_id: int) -> None:
    user = repositories.get_user_by_person(person_id)
    if user is not None:
        repositories.bump_token_version(user.pk)


def get_user(user_id: int):
    return repositories.get_user(user_id)


def count_active_super_admins() -> int:
    return repositories.count_super_admins()


def set_super_admin(user_id: int, value: bool) -> None:
    repositories.set_super_admin(user_id, value)
