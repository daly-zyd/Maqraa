from django.urls import path

from . import views

urlpatterns = [
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("refresh/", views.RefreshView.as_view(), name="auth-refresh"),
    path("otp/request/", views.OtpRequestView.as_view(), name="auth-otp-request"),
    path("otp/verify/", views.OtpVerifyView.as_view(), name="auth-otp-verify"),
    path("password/forgot/", views.PasswordForgotView.as_view(), name="auth-password-forgot"),
    path("password/reset/", views.PasswordResetView.as_view(), name="auth-password-reset"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
]
