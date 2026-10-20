from django.urls import path

from . import views

urlpatterns = [
    path("", views.MaqraaListView.as_view(), name="maqraa-list"),
    path("<int:maqraa_id>/", views.MaqraaDetailView.as_view(), name="maqraa-detail"),
    path("<int:maqraa_id>/links/", views.LinkListView.as_view(), name="maqraa-links"),
    path("<int:maqraa_id>/links/<int:link_id>/default/", views.LinkDefaultView.as_view(), name="maqraa-link-default"),
]
