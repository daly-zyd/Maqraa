"""Audit trail. Lowest business app: it depends on nothing but core."""
from . import repositories


def _label(actor) -> str:
    if actor is None or not getattr(actor, "pk", None):
        return "anonymous"
    return getattr(actor, "username", str(actor.pk))


def record(actor, action: str, *, obj=None, object_type: str = "", object_id="", maqraa_id=None,
           before=None, after=None, ip=None, outcome: str = "allowed"):
    if obj is not None:
        object_type = object_type or obj.__class__.__name__
        object_id = object_id or getattr(obj, "pk", "")
    return repositories.insert(
        actor_user_id=getattr(actor, "pk", None),
        actor_label=_label(actor),
        action=action,
        object_type=object_type,
        object_id=str(object_id or ""),
        maqraa_id=maqraa_id,
        before=before,
        after=after,
        ip=ip,
        outcome=outcome,
    )


def list_entries(*, maqraa_ids, before_id=None, limit: int = 50):
    return repositories.list_page(maqraa_ids=maqraa_ids, before_id=before_id, limit=min(limit, 200))
