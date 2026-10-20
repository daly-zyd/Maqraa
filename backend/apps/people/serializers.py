from rest_framework import serializers


class PersonCreateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=["sheikh", "supervisor", "admin"])
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, allow_null=True)
    display_name_formal = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")


class AccessChangeSerializer(serializers.Serializer):
    person_id = serializers.IntegerField()
    maqraa_id = serializers.IntegerField()
    role = serializers.ChoiceField(choices=["sheikh", "supervisor", "admin"])


class SuperAdminSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    value = serializers.BooleanField()
