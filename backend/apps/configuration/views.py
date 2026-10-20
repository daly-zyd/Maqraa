from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .serializers import SettingSetSerializer


def _ip(request):
    return request.META.get("REMOTE_ADDR")


def _int(request, name):
    v = request.query_params.get(name)
    return int(v) if v and v.isdigit() else None


class SettingsView(APIView):
    def get(self, request):
        return Response(services.list_settings(request.user, _int(request, "maqraa")))

    def post(self, request):
        data = SettingSetSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        services.set_setting(request.user, data.validated_data["key"], data.validated_data["value"],
                             data.validated_data["maqraa_id"], ip=_ip(request))
        return Response({"detail": "ok"})


class AuditView(APIView):
    def get(self, request):
        return Response(services.list_audit(request.user, maqraa_id=_int(request, "maqraa"),
                                            before_id=_int(request, "before"),
                                            limit=_int(request, "limit") or 50))
