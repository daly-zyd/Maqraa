from django.urls import path

from . import views

urlpatterns = [
    path("maqraat/<int:maqraa_id>/slots/", views.SlotListView.as_view(), name="slot-list"),
    path("maqraat/<int:maqraa_id>/slots/<int:slot_id>/", views.SlotDetailView.as_view(), name="slot-detail"),
    path("maqraat/<int:maqraa_id>/generate-sessions/", views.GenerateSessionsView.as_view(), name="generate-sessions"),
    path("maqraat/<int:maqraa_id>/today/", views.TodayBoardView.as_view(), name="today-board"),
    path("maqraat/<int:maqraa_id>/sessions/", views.SessionListView.as_view(), name="session-list"),
    path("public/maqraat/<slug:slug>/today/", views.PublicTodayView.as_view(), name="public-today"),
]
