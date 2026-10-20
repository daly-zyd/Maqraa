from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView

from apps.people.views import MeView

api = [
    path("auth/", include("apps.accounts.urls")),
    path("me/", MeView.as_view(), name="me"),
    path("maqraat/", include("apps.maqraat.urls")),
    path("", include("apps.people.urls")),
    path("", include("apps.configuration.urls")),
    path("", include("apps.scheduling.urls")),
]

urlpatterns = [
    path("api/v1/", include(api)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
]
