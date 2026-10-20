from .models import Setting


def get_value_system(key: str, maqraa_id: int | None):
    row = Setting.objects.system().filter(key=key, maqraa_id=maqraa_id).first()
    return (True, row.value) if row else (False, None)


def upsert(key: str, value, maqraa_id: int | None) -> None:
    row = Setting.objects.system().filter(key=key, maqraa_id=maqraa_id).first()
    if row:
        row.value = value
        row.save(update_fields=["value", "updated_at"])
    else:
        Setting.objects.create(key=key, value=value, maqraa_id=maqraa_id)


def delete_override(key: str, maqraa_id: int) -> None:
    Setting.objects.system().filter(key=key, maqraa_id=maqraa_id).delete()
