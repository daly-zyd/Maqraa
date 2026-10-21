from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from django.db.models import Q
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, password=None, **extra):
        if not username:
            raise ValueError("username is required")
        email = extra.pop("email", None)
        user = self.model(username=username, email=(email.lower() if email else None), **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra):
        extra.setdefault("is_super_admin", True)
        return self.create_user(username, password, **extra)


class User(AbstractBaseUser):
    """Authentication does not require an email (section 4.7).

    `email` and `phone` are optional; their uniqueness only applies when they are set. The constraints
    below are *conditional* unique indexes (``WHERE col IS NOT NULL``) so SQL Server accepts many NULLs.
    """

    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(null=True, blank=True, default=None)
    phone = models.CharField(max_length=20, null=True, blank=True, default=None)  # E.164
    person = models.OneToOneField("people.Person", null=True, blank=True, on_delete=models.SET_NULL,
                                  related_name="user")
    is_active = models.BooleanField(default=True)
    is_super_admin = models.BooleanField(default=False)
    token_version = models.PositiveIntegerField(default=1)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["email"], condition=Q(email__isnull=False),
                                    name="uniq_user_email_when_set"),
            models.UniqueConstraint(fields=["phone"], condition=Q(phone__isnull=False),
                                    name="uniq_user_phone_when_set"),
        ]

    def __str__(self):
        return self.username


class AuthAttempt(models.Model):
    """Login attempts for progressive lockout (database-backed: no Redis)."""

    identifier_key = models.CharField(max_length=190, db_index=True)
    ip = models.GenericIPAddressField(null=True, blank=True, db_index=True)
    success = models.BooleanField(default=False)
    at = models.DateTimeField(default=timezone.now, db_index=True)


class OtpChallenge(models.Model):
    """One-time code sent over WhatsApp (login or password reset). Only a hash of the code is stored."""

    PURPOSE_LOGIN = "login"
    PURPOSE_RESET = "reset"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otp_challenges")
    purpose = models.CharField(max_length=10)
    code_hash = models.CharField(max_length=256)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    consumed = models.BooleanField(default=False)
