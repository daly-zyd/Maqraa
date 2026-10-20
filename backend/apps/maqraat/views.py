from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .serializers import LinkSerializer, MaqraaSerializer


def _ip(request):
    return request.META.get("REMOTE_ADDR")


class MaqraaListView(APIView):
    def get(self, request):
        return Response(MaqraaSerializer(services.list_maqraat(request.user), many=True).data)


class MaqraaDetailView(APIView):
    def get(self, request, maqraa_id: int):
        return Response(MaqraaSerializer(services.get_maqraa(request.user, maqraa_id, ip=_ip(request))).data)


class LinkListView(APIView):
    def get(self, request, maqraa_id: int):
        return Response(LinkSerializer(services.list_links(request.user, maqraa_id), many=True).data)

    def post(self, request, maqraa_id: int):
        data = LinkSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        link = services.create_link(request.user, maqraa_id, ip=_ip(request), **data.validated_data)
        return Response(LinkSerializer(link).data, status=201)


class LinkDefaultView(APIView):
    def post(self, request, maqraa_id: int, link_id: int):
        link = services.set_default_link(request.user, maqraa_id, link_id, ip=_ip(request))
        return Response(LinkSerializer(link).data)
