import os

from .base import *  # noqa: F401,F403

DEBUG = True
DATABASES = {
    "default": {
        "ENGINE": "mssql",
        "NAME": os.environ.get("SQL_DATABASE", "maqraa"),
        "HOST": os.environ.get("SQL_SERVER", "localhost\\SQLEXPRESS"),
        "USER": os.environ.get("SQL_USER", ""),
        "PASSWORD": os.environ.get("SQL_PASSWORD", ""),
        "CONN_MAX_AGE": 60,
        "OPTIONS": {
            "driver": os.environ.get("SQL_DRIVER", "ODBC Driver 18 for SQL Server"),
            "TrustServerCertificate": "yes",
        },
    }
}
