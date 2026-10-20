"""The single declarative policy: role -> capabilities (matrix of section 4.4). Deny by default.

No `if user.role == ...` checks anywhere else in the code base.
"""
from __future__ import annotations

from .models import ROLE_ADMIN, ROLE_SHEIKH, ROLE_SUPERVISOR

# ---- capability catalog ---------------------------------------------------------------------------
SCHEDULE_VIEW_OWN = "schedule.view_own"
SCHEDULE_VIEW_ALL = "schedule.view_all"
SCHEDULE_EDIT = "schedule.edit"
SCHEDULE_OVERRIDE_DAY = "schedule.override_day"
SESSION_CONFIRM = "session.confirm"
SESSION_CLOSEOUT = "session.closeout"
SESSION_DECLARE_ABSENCE = "session.declare_absence"
SUBSTITUTION_ACCEPT = "substitution.accept"
SUBSTITUTION_ASSIGN = "substitution.assign"
REPORT_PUBLISH = "report.publish"
PEOPLE_VIEW = "people.view"
PEOPLE_MANAGE = "people.manage"
PEOPLE_VIEW_PHONE = "people.view_phone"
ACCESS_MANAGE = "access.manage"
TEMPLATES_EDIT = "templates.edit"
SETTINGS_EDIT = "settings.edit"
LINKS_MANAGE = "links.manage"
STATS_VIEW = "stats.view"
AUDIT_VIEW = "audit.view"

# global (not per maqraa): super_admin only
WHATSAPP_MANAGE = "whatsapp.manage"
SYSTEM_SETTINGS = "system.settings"
ROLES_MANAGE_SUPER = "roles.manage_super"

GLOBAL_CAPABILITIES = frozenset({WHATSAPP_MANAGE, SYSTEM_SETTINGS, ROLES_MANAGE_SUPER})

_SHEIKH = {SCHEDULE_VIEW_OWN, SESSION_CONFIRM, SESSION_DECLARE_ABSENCE, SUBSTITUTION_ACCEPT, STATS_VIEW}
_SUPERVISOR = {
    SCHEDULE_VIEW_OWN, SCHEDULE_VIEW_ALL, SCHEDULE_OVERRIDE_DAY, SESSION_CONFIRM, SESSION_CLOSEOUT,
    SESSION_DECLARE_ABSENCE, SUBSTITUTION_ASSIGN, REPORT_PUBLISH, STATS_VIEW, PEOPLE_VIEW,
}
_ADMIN = _SUPERVISOR | {
    SCHEDULE_EDIT, PEOPLE_MANAGE, PEOPLE_VIEW_PHONE, ACCESS_MANAGE, TEMPLATES_EDIT, SETTINGS_EDIT,
    LINKS_MANAGE, AUDIT_VIEW,
}

ROLE_CAPABILITIES: dict[str, frozenset[str]] = {
    ROLE_SHEIKH: frozenset(_SHEIKH),
    ROLE_SUPERVISOR: frozenset(_SUPERVISOR),
    ROLE_ADMIN: frozenset(_ADMIN),
}

MAQRAA_CAPABILITIES = frozenset(_ADMIN)  # what super_admin holds in every maqraa
ALL_CAPABILITIES = MAQRAA_CAPABILITIES | GLOBAL_CAPABILITIES


def capabilities_for_roles(roles) -> frozenset[str]:
    """Union of the capabilities of every role held in one maqraa."""
    out: set[str] = set()
    for role in roles:
        out |= ROLE_CAPABILITIES.get(role, frozenset())
    return frozenset(out)
