"""Typed setting registry (section 7.1): every business parameter, its type and its default.

`system=True` settings are super_admin only (dry-run, feature flags); the others are editable by admins
within their maqraa scope (per-maqraa overrides).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class SettingDef:
    key: str
    kind: str  # int | bool | str | json
    default: Any
    system: bool = False
    min: int | None = None
    max: int | None = None


_DEFS = [
    SettingDef("reminder_steps", "json", [
        {"minutes_before": 60, "channels": ["push"]},
        {"minutes_before": 30, "channels": ["push", "whatsapp_dm"]},
        {"minutes_before": 15, "channels": ["push", "whatsapp_dm"], "final": True},
    ]),
    SettingDef("substitution_start_minutes_before", "int", 15, min=0, max=1440),
    SettingDef("group_announcement_minutes_before", "int", 10, min=0, max=1440),
    SettingDef("early_confirmation_hours_before", "int", 0, min=0, max=168),
    SettingDef("at_risk_digest_hours_before", "int", 0, min=0, max=168),
    SettingDef("absence_offer_hours_before", "int", 48, min=0, max=720),
    SettingDef("group_update_horizon_hours", "int", 24, min=0, max=720),
    SettingDef("sheikh_can_submit_report", "bool", False),
    SettingDef("report_reminder_after_end_minutes", "int", 0, min=0, max=1440),
    SettingDef("apology_after_start_minutes", "int", 15, min=0, max=240),
    SettingDef("daily_image_send_time", "str", "07:00"),
    SettingDef("weekly_image_day", "str", "sunday"),
    SettingDef("report_auto_publish", "bool", False),
    SettingDef("supervisor_can_see_phones", "bool", False),
    SettingDef("hijri_adjust_days", "int", 0, min=-2, max=2),
    SettingDef("base_timezone", "str", "Africa/Tunis"),
    SettingDef("sessions_generate_weeks_ahead", "int", 3, min=1, max=8),
    SettingDef("dry_run", "bool", True, system=True),
    SettingDef("whatsapp_min_delay_seconds", "int", 3, system=True, min=0, max=60),
]
REGISTRY: dict[str, SettingDef] = {d.key: d for d in _DEFS}


def coerce(defn: SettingDef, value):
    from apps.core.exceptions import ValidationFailure

    if defn.kind == "bool":
        if not isinstance(value, bool):
            raise ValidationFailure(f"{defn.key}: قيمة منطقية مطلوبة")
    elif defn.kind == "int":
        if isinstance(value, bool) or not isinstance(value, int):
            raise ValidationFailure(f"{defn.key}: عدد صحيح مطلوب")
        if (defn.min is not None and value < defn.min) or (defn.max is not None and value > defn.max):
            raise ValidationFailure(f"{defn.key}: خارج المجال المسموح")
    elif defn.kind == "str":
        if not isinstance(value, str):
            raise ValidationFailure(f"{defn.key}: نص مطلوب")
    elif defn.kind == "json":
        if not isinstance(value, (list, dict)):
            raise ValidationFailure(f"{defn.key}: قائمة أو كائن مطلوب")
    return value
