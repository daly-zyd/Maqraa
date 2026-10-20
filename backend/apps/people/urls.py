from django.urls import path

from . import views

urlpatterns = [
    path("people/", views.PeopleView.as_view(), name="people"),
    path("access/grant/", views.GrantView.as_view(), name="access-grant"),
    path("access/revoke/", views.RevokeView.as_view(), name="access-revoke"),
    path("access/super-admin/", views.SuperAdminView.as_view(), name="access-super-admin"),
]
