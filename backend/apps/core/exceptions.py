"""Domain exceptions. Services raise these; the exception handler maps them to HTTP."""


class DomainError(Exception):
    http_status = 400
    code = "error"
    message_ar = "حدث خطأ"

    def __init__(self, message_ar: str | None = None, *, errors: dict | None = None):
        super().__init__(message_ar or self.message_ar)
        self.message_ar = message_ar or self.message_ar
        self.errors = errors or {}


class ScopeNotFound(DomainError):
    """Object outside the caller's scope: indistinguishable from a missing object (404)."""

    http_status = 404
    code = "not_found"
    message_ar = "غير موجود"


class CapabilityDenied(DomainError):
    """The caller is in scope but lacks the capability (403)."""

    http_status = 403
    code = "forbidden"
    message_ar = "ليست لديك صلاحية لهذا الإجراء"


class ValidationFailure(DomainError):
    http_status = 400
    code = "validation_error"
    message_ar = "بيانات غير صالحة"


class ConflictError(DomainError):
    http_status = 409
    code = "conflict"
    message_ar = "تعارض في البيانات"


class AuthenticationFailure(DomainError):
    http_status = 401
    code = "invalid_credentials"
    message_ar = "بيانات الدخول غير صحيحة"


class TooManyAttempts(DomainError):
    http_status = 429
    code = "too_many_attempts"
    message_ar = "محاولات كثيرة، حاول لاحقاً"
