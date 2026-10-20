from django.urls import path

from . import views

urlpatterns = [
    path("settings/", views.SettingsView.as_view(), name="settings"),
    path("audit/", views.AuditView.as_view(), name="audit"),
]
