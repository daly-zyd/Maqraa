# Assumptions and open decisions

Decisions taken while building Phase 0 / Phase 1 (backend). Each one is configurable or easy to change; please confirm.

## From the planning workbooks (`import_planning`)
1. **Qaloun sheet:** the file has two sheets. The command defaults to the first one, so pass `--sheet "Planning Hebdomadaire"`
   (dated 10 Oct 2026, the current week) or `--sheet "Planning Général"` (dated 28 Mar 2026, standing template). They differ
   in a few cells (supervisors, the 15:30 start on Monday). **Which one is the template?**
2. **Half-hour starts** such as `ش/أحمد بن عياد (05:30)` and `ش/فتحي سليم (15:30)`: the start is taken from the bracket and the duration
   is assumed to be **60 minutes** (05:30-06:30, 15:30-16:30). A warning is printed for every such cell. Edit the slot if the end differs.
3. **Hafs row `Tunis 18:00 / Mecca 19:00`** is inconsistent (Mecca is always Tunis + 2 h) and the 17:00 row is missing in that
   sheet. The Mecca column is treated as the reliable one, so the row is imported as **17:00 Tunis**. Warning printed.
4. **Day order** differs between the two sheets (Hafs starts on Friday, Qaloun on Sunday). Days are read by name, not by position.
5. The Hafs sheet's "الاشراف العام" column is ignored.
6. **Duplicate people:** `يوسف المديحي` and `يوسف مديحي` resolve to one person (leading "ال" is ignored when matching). Two further
   candidates are *reported, not merged*: `أبو سهيل` ~ `رشيد أبو سهيل` and `أحمد سعد` ~ `أحمد سعد جاويش`. A merge screen is still to build.
7. Sheikhs and supervisors of the same name across Hafs and Qaloun are the **same Person** (global), with one access row per maqraa.
   The import blocks overlapping slots for the same person across maqraat (reported as `person_busy_elsewhere`, no detail).

## Architecture
8. **Test database:** the sandbox has no SQL Server, so `config/settings/test.py` uses SQLite **for the unit suite only**. Dev and prod use
   SQL Server (`mssql-django`). To run once against a real instance: set the `SQL_*` variables and `pytest --ds=config.settings.dev`.
   Still to verify on SQL Server: the filtered unique indexes on `email`/`phone` (two users without email), `CheckConstraint`, and
   `select_for_update(skip_locked=True)` for the outbox (Phase 2).
9. `GET /api/v1/me/` lives in the `people` app (it needs persons, accesses and maqraat); `accounts` stays at the bottom of the app graph.
10. Tokens are returned in the JSON body (the static site is on another origin). The SPA keeps the access token in memory and the refresh token in
    `localStorage` or a cookie (decision for the frontend phase).
11. Weekday numbering in the database: Monday = 0 ... Sunday = 6 (Python). Arabic names are rendered from that.
12. `supervisor_can_see_phones` exists as a setting but is **not yet applied** (phones are visible to admins and super_admin only).
13. Prayer-time markers (section 6) are not implemented yet.

## Out of scope in this delivery (next steps)
Authentication flows beyond password login (WhatsApp OTP, magic link, PIN, TOTP 2FA, device list), outbox/scheduler, WhatsApp, Web Push,
substitution engine, close-out and reports, posters/schedule images, analytics, and the React redesign. The existing React site is
untouched; `AGENTS.md` still says "static, no backend", which this specification supersedes. Please confirm before I update it.
