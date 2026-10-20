"""Sandbox/CI settings.

Production and development run on SQL Server (see dev.py). This module swaps in SQLite *only* so the
unit suite can run where no SQL Server is installed. The SQL-Server-specific checks (filtered unique
indexes on nullable columns, locking) must still be run once against a real instance (docs/ASSUMPTIONS.md).
"""
from .base import *  # noqa: F401,F403

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]  # speed only
REST_FRAMEWORK = {**REST_FRAMEWORK, "DEFAULT_THROTTLE_CLASSES": []}  # noqa: F405
