from .base import *  # noqa: F401,F403
from .dev import DATABASES  # noqa: F401  (same SQL Server connection, secrets from .env)

DEBUG = False
SECURE_HSTS_SECONDS = 31536000
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
