from datetime import date

from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from . import services
from .serializers import SlotPatchSerializer, SlotWriteSerializer


def _ip(request):
    return request.META.get("REMOTE_ADDR")


def _date(request, name, default=None):
    raw = request.query_params.get(name)
    if not raw:
        return default
    try:
        return date.fromisoformat(raw)
    except ValueError:
        raise ValidationError({name: "YYYY-MM-DD"}) from None


class SlotListView(APIView):
    def get(self, request, maqraa_id: int):
        return Response(services.list_slots(request.user, maqraa_id, ip=_ip(request)))

    def post(self, request, maqraa_id: int):
        data = SlotWriteSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        v = data.validated_data
        slot = services.create_slot(request.user, maqraa_id, weekday=v["weekday"], start=v["start_time"],
                                    end=v["end_time"], sheikh_id=v["sheikh_id"], supervisor_id=v["supervisor_id"],
                                    notes=v["notes"], ip=_ip(request))
        return Response(slot, status=201)


class SlotDetailView(APIView):
    def patch(self, request, maqraa_id: int, slot_id: int):
        data = SlotPatchSerializer(data=request.data, partial=True)
        data.is_valid(raise_exception=True)
        return Response(services.update_slot(request.user, maqraa_id, slot_id, changes=dict(data.validated_data),
                                             ip=_ip(request)))

    def delete(self, request, maqraa_id: int, slot_id: int):
        services.delete_slot(request.user, maqraa_id, slot_id, ip=_ip(request))
        return Response(status=204)


class GenerateSessionsView(APIView):
    def post(self, request, maqraa_id: int):
        return Response(services.generate_for_actor(request.user, maqraa_id, ip=_ip(request)))


class TodayBoardView(APIView):
    def get(self, request, maqraa_id: int):
        return Response(services.today_board(request.user, maqraa_id, day=_date(request, "date"), ip=_ip(request)))


class SessionListView(APIView):
    def get(self, request, maqraa_id: int):
        start = _date(request, "from") or date.today()
        end = _date(request, "to") or start
        return Response(services.list_sessions(request.user, maqraa_id, start, end, ip=_ip(request)))


class PublicTodayView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []
    throttle_classes = [AnonRateThrottle]

    def get(self, request, slug: str):
        return Response(services.public_today(slug))
