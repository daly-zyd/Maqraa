from apps.access import policy
from apps.access import services as access
from apps.audit import services as audit
from apps.core.exceptions import ScopeNotFound, ValidationFailure

from . import repositories
from .models import MaqraaLink


def list_maqraat(actor):
    return repositories.list_for_actor(actor)


def get_maqraa(actor, maqraa_id: int, *, ip=None):
    access.require_scope(actor, maqraa_id, ip=ip)
    maqraa = repositories.get_for_actor(actor, maqraa_id)
    if maqraa is None:
        raise ScopeNotFound()
    return maqraa


def all_maqraa_ids() -> list[int]:
    return repositories.all_active_ids()


def get_public_maqraa(slug: str):
    maqraa = repositories.get_by_slug_system(slug)
    if maqraa is None:
        raise ScopeNotFound()
    return maqraa


def list_links(actor, maqraa_id: int):
    get_maqraa(actor, maqraa_id)
    return repositories.list_links(actor, maqraa_id)


def create_link(actor, maqraa_id: int, *, kind: str, url: str, label: str = "", is_default: bool = False,
                show_on_public_site: bool = False, ip=None):
    access.require(actor, policy.LINKS_MANAGE, maqraa_id, ip=ip)
    if kind not in {MaqraaLink.ZOOM, MaqraaLink.WHATSAPP_INVITE, MaqraaLink.OTHER}:
        raise ValidationFailure("نوع الرابط غير معروف")
    link = repositories.create_link(maqraa_id=maqraa_id, kind=kind, url=url, label=label,
                                    show_on_public_site=show_on_public_site, created_by=actor.pk)
    if is_default:
        repositories.make_default(link)
    audit.record(actor, "link.create", obj=link, maqraa_id=maqraa_id, after={"kind": kind, "default": is_default}, ip=ip)
    return link


def set_default_link(actor, maqraa_id: int, link_id: int, *, ip=None):
    access.require(actor, policy.LINKS_MANAGE, maqraa_id, ip=ip)
    link = repositories.get_link(actor, maqraa_id, link_id)
    if link is None:
        raise ScopeNotFound()
    repositories.make_default(link)
    audit.record(actor, "link.set_default", obj=link, maqraa_id=maqraa_id, ip=ip)
    return link


def current_zoom_url(maqraa_id: int) -> str:
    link = repositories.current_link(maqraa_id, MaqraaLink.ZOOM)
    return link.url if link else ""
