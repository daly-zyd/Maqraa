"""Import a legacy planning workbook into a maqraa's weekly template.

    python manage.py import_planning FILE.xlsx --maqraa hafs-men --sheet Feuil1 --actor admin [--dry-run]
"""
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.maqraat.models import Maqraa
from apps.people import services as people
from apps.scheduling import services
from integrations import planning_xlsx


class Command(BaseCommand):
    help = "Import a legacy Google-Sheets planning (xlsx) into the weekly template"

    def add_arguments(self, parser):
        parser.add_argument("file")
        parser.add_argument("--maqraa", help="slug (default: guessed from the sheet title)")
        parser.add_argument("--sheet")
        parser.add_argument("--actor", required=True, help="username of a super_admin/admin")
        parser.add_argument("--dry-run", action="store_true", help="parse and validate, then roll back")
        parser.add_argument("--keep", action="store_true", help="keep existing slots (default: replace)")

    def handle(self, *args, **o):
        if not Path(o["file"]).exists():
            raise CommandError("file not found")
        parsed = planning_xlsx.parse_workbook(o["file"], o["sheet"])
        slug = o["maqraa"] or parsed.maqraa_slug_hint
        maqraa = Maqraa.objects.system().filter(slug=slug).first()
        if maqraa is None:
            raise CommandError(f"maqraa '{slug}' not found (title: {parsed.title!r})")
        actor = get_user_model().objects.filter(username=o["actor"]).first()
        if actor is None:
            raise CommandError("actor not found")
        self.stdout.write(f"Sheet {parsed.sheet!r}: {len(parsed.slots)} slots -> {maqraa.name_ar}")
        try:
            with transaction.atomic():
                report = services.import_planning(actor, maqraa.pk, parsed, replace=not o["keep"])
                self.stdout.write(f"created={report['created']} skipped={len(report['skipped'])} people={report['people']}")
                for w in report["warnings"]:
                    self.stdout.write(f"  warning: {w}")
                for s in report["skipped"]:
                    self.stdout.write(f"  SKIPPED {s['cell']} {s['sheikh']}: {s['reason']}")
                dupes = people.possible_duplicates()
                for a, b in dupes:
                    self.stdout.write(f"  possible duplicate person: {a.pk} {a.full_name!r} ~ {b.pk} {b.full_name!r}")
                if o["dry_run"]:
                    transaction.set_rollback(True)
                    self.stdout.write("dry-run: rolled back")
        except Exception as exc:
            raise CommandError(str(exc)) from exc
