from rest_framework import serializers


class SlotWriteSerializer(serializers.Serializer):
    weekday = serializers.IntegerField(min_value=0, max_value=6)
    start = serializers.TimeField(source="start_time", input_formats=["%H:%M", "%H:%M:%S"])
    end = serializers.TimeField(source="end_time", input_formats=["%H:%M", "%H:%M:%S"])
    sheikh_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    supervisor_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    notes = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")


class SlotPatchSerializer(SlotWriteSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for f in self.fields.values():
            f.required = False


class ReportWriteSerializer(serializers.Serializer):
    students_start = serializers.IntegerField(min_value=0, max_value=999)
    students_end = serializers.IntegerField(min_value=0, max_value=999)
    page_from = serializers.IntegerField(min_value=1, max_value=604)
    page_to = serializers.IntegerField(min_value=1, max_value=604)
    actual_start = serializers.TimeField(required=False, allow_null=True, default=None,
                                         input_formats=["%H:%M", "%H:%M:%S"])  # Mecca time
    actual_end = serializers.TimeField(required=False, allow_null=True, default=None, input_formats=["%H:%M", "%H:%M:%S"])
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")
