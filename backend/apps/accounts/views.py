from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from . import services
from .serializers import (
    LoginSerializer,
    OtpRequestSerializer,
    OtpVerifySerializer,
    PasswordResetSerializer,
    RefreshSerializer,
)


def _ip(request) -> str | None:
    return request.META.get("REMOTE_ADDR")


class _AuthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class LoginView(_AuthView):
    def post(self, request):
        data = LoginSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        return Response(services.login(data.validated_data["identifier"], data.validated_data["password"],
                                       ip=_ip(request)))


class RefreshView(_AuthView):
    def post(self, request):
        data = RefreshSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        return Response(services.refresh(data.validated_data["refresh"]))


class LogoutView(_AuthView):
    def post(self, request):
        data = RefreshSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        services.logout(data.validated_data["refresh"])
        return Response({"detail": "تم تسجيل الخروج"})


_OTP_ACCEPTED = {"detail": "إن كان للحساب رقم واتساب مسجّل فسيصلك رمز التحقق خلال لحظات"}


class OtpRequestView(_AuthView):
    purpose = "login"

    def post(self, request):
        data = OtpRequestSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        services.request_otp(data.validated_data["identifier"], self.purpose, ip=_ip(request))
        return Response(_OTP_ACCEPTED, status=202)


class PasswordForgotView(OtpRequestView):
    purpose = "reset"


class OtpVerifyView(_AuthView):
    def post(self, request):
        data = OtpVerifySerializer(data=request.data)
        data.is_valid(raise_exception=True)
        return Response(services.login_with_otp(data.validated_data["identifier"], data.validated_data["code"],
                                                ip=_ip(request)))


class PasswordResetView(_AuthView):
    def post(self, request):
        data = PasswordResetSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        services.reset_password(data.validated_data["identifier"], data.validated_data["code"],
                                data.validated_data["new_password"], ip=_ip(request))
        return Response({"detail": "تم تغيير كلمة المرور. سجّل الدخول بها الآن"})
