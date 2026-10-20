from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .serializers import AccessChangeSerializer, PersonCreateSerializer, SuperAdminSerializer


def _ip(request):
    return request.META.get("REMOTE_ADDR")


class MeView(APIView):
    def get(self, request):
        return Response(services.get_me(request.user))


class PeopleView(APIView):
    def _maqraa_id(self, request) -> int:
        try:
            return int(request.query_params["maqraa"])
        except (KeyError, ValueError):
            raise ValidationError({"maqraa": "required"}) from None

    def get(self, request):
        return Response(services.list_people(request.user, self._maqraa_id(request), ip=_ip(request)))

    def post(self, request):
        data = PersonCreateSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        person = services.create_person(request.user, self._maqraa_id(request), ip=_ip(request),
                                        **data.validated_data)
        return Response({"id": person.pk, "full_name": person.full_name}, status=201)


class GrantView(APIView):
    def post(self, request):
        data = AccessChangeSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        services.grant_role(request.user, ip=_ip(request), **data.validated_data)
        return Response({"detail": "ok"}, status=201)


class RevokeView(APIView):
    def post(self, request):
        data = AccessChangeSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        services.revoke_role(request.user, ip=_ip(request), **data.validated_data)
        return Response({"detail": "ok"})


class SuperAdminView(APIView):
    def post(self, request):
        data = SuperAdminSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        services.set_super_admin(request.user, ip=_ip(request), **data.validated_data)
        return Response({"detail": "ok"})
