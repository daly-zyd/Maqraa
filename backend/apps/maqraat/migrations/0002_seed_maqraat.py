from django.db import migrations

DATA = [
    ("qaloun", "قالون", "men", "مقرأة قالون رجال"),
    ("qaloun", "قالون", "women", "مقرأة قالون نساء"),
    ("hafs", "حفص", "men", "مقرأة حفص رجال"),
    ("hafs", "حفص", "women", "مقرأة حفص نساء"),
]


def seed(apps, schema_editor):
    Riwaya = apps.get_model("maqraat", "Riwaya")
    Maqraa = apps.get_model("maqraat", "Maqraa")
    for order, (code, riwaya_ar, gender, name) in enumerate(DATA, start=1):
        riwaya, _ = Riwaya.objects.get_or_create(code=code, defaults={"name_ar": riwaya_ar})
        Maqraa.objects.get_or_create(slug=f"{code}-{gender}", defaults={
            "riwaya": riwaya, "gender": gender, "name_ar": name, "sort_order": order})


class Migration(migrations.Migration):
    dependencies = [("maqraat", "0001_initial")]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
