from rest_framework import serializers


class SettingSetSerializer(serializers.Serializer):
    key = serializers.CharField()
    value = serializers.JSONField()
    maqraa_id = serializers.IntegerField(required=False, allow_null=True, default=None)
