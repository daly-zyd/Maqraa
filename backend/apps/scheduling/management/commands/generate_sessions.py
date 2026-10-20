from django.core.management.base import BaseCommand

from apps.scheduling import services


class Command(BaseCommand):
    help = "Generate upcoming sessions for every maqraa (run daily by the scheduler)"

    def handle(self, *args, **options):
        for maqraa_id, count in services.generate_all().items():
            self.stdout.write(f"maqraa {maqraa_id}: {count} new sessions")
