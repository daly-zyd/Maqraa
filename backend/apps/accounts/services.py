"""Authentication business rules: identifier resolution, lockout, versioned JWT, refresh rotation."""
from __future__ import annotations

import secrets
from datetime import timedelta

import phonenumbers
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from django.utils.module_loading import import_string
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit import services as audit
from apps.core.exceptions import AuthenticationFailure, TooManyAttempts, ValidationFailure

from . import repositories
from .models import OtpChallenge

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


# ---- WhatsApp one-time codes ---------------------------------------------------------------------
_OTP_TEXT = {
    OtpChallenge.PURPOSE_LOGIN: "رمز الدخول إلى مقرأة بالقرآن نحيا: {code}\nصالح {minutes} دقائق. لا تشاركه مع أحد.",
    OtpChallenge.PURPOSE_RESET: (
        "رمز استعادة كلمة المرور لمقرأة بالقرآن نحيا: {code}\nصالح {minutes} دقائق. لا تشاركه مع أحد."
    ),
}


def request_otp(identifier: str, purpose: str, *, ip: str | None = None) -> None:
    """Always returns silently: the caller can never tell whether the account exists or has a phone."""
    user = repositories.find_user_for_login(**_classify(identifier))
    if user is None or not user.is_active or not user.phone:
        audit.record(None, "auth.otp_skipped", object_type="login", object_id=(identifier or "")[:190], ip=ip,
                     outcome="denied")
        return
    now = timezone.now()
    if repositories.count_otps_since(user=user, since=now - timedelta(hours=1)) >= settings.OTP_MAX_PER_HOUR:
        audit.record(user, "auth.otp_throttled", object_type="User", object_id=user.pk, ip=ip, outcome="denied")
        return
    code = f"{secrets.randbelow(10**6):06d}"
    repositories.create_otp(user=user, purpose=purpose, code_hash=make_password(code),
                            expires_at=now + timedelta(minutes=settings.OTP_TTL_MINUTES))
    text = _OTP_TEXT[purpose].format(code=code, minutes=settings.OTP_TTL_MINUTES)
    import_string(settings.OTP_SENDER)(user.phone, text)
    audit.record(user, "auth.otp_sent", object_type="User", object_id=user.pk, ip=ip)


def _check_otp(identifier: str, code: str, purpose: str, *, ip: str | None):
    user = repositories.find_user_for_login(**_classify(identifier))
    challenge = repositories.active_otp(user=user, purpose=purpose, now=timezone.now()) if user else None
    if challenge is None or not user.is_active or challenge.attempts >= settings.OTP_MAX_ATTEMPTS:
        check_password(code or "", _DUMMY_HASH)
        audit.record(None, "auth.otp_failed", object_type="login", object_id=(identifier or "")[:190], ip=ip,
                     outcome="denied")
        raise AuthenticationFailure("الرمز غير صحيح أو انتهت صلاحيته")
    if not check_password((code or "").strip(), challenge.code_hash):
        repositories.register_otp_attempt(challenge)
        audit.record(user, "auth.otp_failed", object_type="User", object_id=user.pk, ip=ip, outcome="denied")
        raise AuthenticationFailure("الرمز غير صحيح أو انتهت صلاحيته")
    repositories.consume_otp(challenge)
    return user


def login_with_otp(identifier: str, code: str, *, ip: str | None = None) -> dict:
    user = _check_otp(identifier, code, OtpChallenge.PURPOSE_LOGIN, ip=ip)
    audit.record(user, "auth.login_otp", object_type="User", object_id=user.pk, ip=ip)
    return {**_tokens_for(user), "user": {"id": user.pk, "username": user.username}}


def reset_password(identifier: str, code: str, new_password: str, *, ip: str | None = None) -> None:
    user = _check_otp(identifier, code, OtpChallenge.PURPOSE_RESET, ip=ip)
    try:
        validate_password(new_password, user)
    except DjangoValidationError as exc:
        raise ValidationFailure("كلمة المرور ضعيفة", errors={"new_password": list(exc.messages)}) from None
    repositories.set_password(user, new_password)
    repositories.clear_failures((identifier or "").strip().lower()[:190])
    audit.record(user, "auth.password_reset", object_type="User", object_id=user.pk, ip=ip)
