from datetime import datetime

from django.db.models import F

from .models import AuthAttempt, OtpChallenge, User


def find_user_for_login(*, username: str | None, email: str | None, phone: str | None) -> User | None:
    from django.db.models import Q

    q = Q()
    if username:
        q |= Q(username__iexact=username)
    if email:
        q |= Q(email__iexact=email)
    if phone:
        q |= Q(phone=phone)
    if not q:
        return None
    return User.objects.filter(q).first()


def get_user(user_id: int) -> User | None:
    return User.objects.filter(pk=user_id).first()


def get_user_by_person(person_id: int) -> User | None:
    return User.objects.filter(person_id=person_id).first()


def bump_token_version(user_id: int) -> None:
    User.objects.filter(pk=user_id).update(token_version=F("token_version") + 1)


def count_super_admins() -> int:
    return User.objects.filter(is_super_admin=True, is_active=True).count()


def record_attempt(*, identifier_key: str, ip: str | None, success: bool) -> None:
    AuthAttempt.objects.create(identifier_key=identifier_key, ip=ip, success=success)


def count_failures(*, since: datetime, identifier_key: str | None = None, ip: str | None = None) -> int:
    qs = AuthAttempt.objects.filter(success=False, at__gte=since)
    if identifier_key is not None:
        qs = qs.filter(identifier_key=identifier_key)
    if ip is not None:
        qs = qs.filter(ip=ip)
    return qs.count()


def clear_failures(identifier_key: str) -> None:
    AuthAttempt.objects.filter(identifier_key=identifier_key, success=False).delete()


def set_super_admin(user_id: int, value: bool) -> None:
    User.objects.filter(pk=user_id).update(is_super_admin=value, token_version=F("token_version") + 1)


def create_otp(*, user: User, purpose: str, code_hash: str, expires_at: datetime) -> OtpChallenge:
    OtpChallenge.objects.filter(user=user, purpose=purpose, consumed=False).update(consumed=True)
    return OtpChallenge.objects.create(user=user, purpose=purpose, code_hash=code_hash, expires_at=expires_at)


def count_otps_since(*, user: User, since: datetime) -> int:
    return OtpChallenge.objects.filter(user=user, created_at__gte=since).count()


def active_otp(*, user: User, purpose: str, now: datetime) -> OtpChallenge | None:
    return (OtpChallenge.objects.filter(user=user, purpose=purpose, consumed=False, expires_at__gt=now)
            .order_by("-created_at").first())


def register_otp_attempt(challenge: OtpChallenge) -> None:
    OtpChallenge.objects.filter(pk=challenge.pk).update(attempts=F("attempts") + 1)


def consume_otp(challenge: OtpChallenge) -> None:
    OtpChallenge.objects.filter(pk=challenge.pk).update(consumed=True)


def set_password(user: User, raw_password: str) -> None:
    user.set_password(raw_password)
    user.token_version += 1  # every existing session ends
    user.save(update_fields=["password", "token_version"])
