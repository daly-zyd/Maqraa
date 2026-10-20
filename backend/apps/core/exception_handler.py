from rest_framework.response import Response
from rest_framework.views import exception_handler

from .exceptions import DomainError


def api_exception_handler(exc, context):
    """Consistent error format: {code, detail (Arabic), errors}."""
    if isinstance(exc, DomainError):
        return Response(
            {"code": exc.code, "detail": exc.message_ar, "errors": exc.errors},
            status=exc.http_status,
        )
    response = exception_handler(exc, context)
    if response is not None and isinstance(response.data, dict) and "code" not in response.data:
        detail = response.data.get("detail", "")
        response.data = {"code": getattr(exc, "default_code", "error"), "detail": str(detail), "errors": response.data}
    return response
