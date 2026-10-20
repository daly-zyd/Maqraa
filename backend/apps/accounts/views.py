from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from . import services
from .serializers import LoginSerializer, RefreshSerializer


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
