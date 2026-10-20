from .models import AuditLog


def insert(**fields) -> AuditLog:
    return AuditLog.objects.create(**fields)


def list_page(*, maqraa_ids: set[int] | None, before_id: int | None, limit: int):
    """Keyset pagination (id descending). maqraa_ids=None means every maqraa."""
    qs = AuditLog.objects.all()
    if maqraa_ids is not None:
        qs = qs.filter(maqraa_id__in=maqraa_ids)
    if before_id:
        qs = qs.filter(id__lt=before_id)
    return list(qs.order_by("-id")[:limit])
