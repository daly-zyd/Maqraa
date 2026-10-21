from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=190)
    password = serializers.CharField(max_length=256, trim_whitespace=False)


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class OtpRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=190)


class OtpVerifySerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=190)
    code = serializers.CharField(max_length=12)


class PasswordResetSerializer(OtpVerifySerializer):
    new_password = serializers.CharField(max_length=256, trim_whitespace=False)
