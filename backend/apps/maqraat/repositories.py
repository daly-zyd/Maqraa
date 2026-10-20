from django.db import transaction

from .models import Maqraa, MaqraaLink


def list_for_actor(actor):
    return list(Maqraa.objects.for_actor(actor).filter(active=True).select_related("riwaya"))


def get_for_actor(actor, maqraa_id: int) -> Maqraa | None:
    return Maqraa.objects.for_actor(actor).filter(pk=maqraa_id).select_related("riwaya").first()


def all_active_ids() -> list[int]:
    return list(Maqraa.objects.system().filter(active=True).values_list("id", flat=True))


def get_by_slug_system(slug: str) -> Maqraa | None:
    """Public pages and jobs only; callers expose names only."""
    return Maqraa.objects.system().filter(slug=slug, active=True).select_related("riwaya").first()


def list_links(actor, maqraa_id: int):
    qs = MaqraaLink.objects.for_actor(actor).filter(maqraa_id=maqraa_id, active=True)
    return list(qs.order_by("kind", "-is_default", "id"))


def create_link(**fields) -> MaqraaLink:
    return MaqraaLink.objects.create(**fields)


def get_link(actor, maqraa_id: int, link_id: int) -> MaqraaLink | None:
    return MaqraaLink.objects.for_actor(actor).filter(pk=link_id, maqraa_id=maqraa_id).first()


@transaction.atomic
def make_default(link: MaqraaLink) -> None:
    MaqraaLink.objects.system().filter(maqraa_id=link.maqraa_id, kind=link.kind, is_default=True) \
        .exclude(pk=link.pk).update(is_default=False)
    link.is_default = True
    link.save(update_fields=["is_default", "updated_at"])


def current_link(maqraa_id: int, kind: str) -> MaqraaLink | None:
    return MaqraaLink.objects.system().filter(maqraa_id=maqraa_id, kind=kind, active=True) \
        .order_by("-is_default", "id").first()
