from rest_framework import serializers


class MaqraaSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    slug = serializers.CharField()
    name_ar = serializers.CharField()
    riwaya = serializers.CharField(source="riwaya.code")
    riwaya_ar = serializers.CharField(source="riwaya.name_ar")
    gender = serializers.CharField()


class LinkSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    kind = serializers.CharField()
    label = serializers.CharField(allow_blank=True, required=False)
    url = serializers.URLField()
    is_default = serializers.BooleanField(required=False, default=False)
    show_on_public_site = serializers.BooleanField(required=False, default=False)
