# Review of the reference authentication module

**Reference used:** `C:\ERP-Smartis\server` (Django, app `accounts`). `daly-zyd/Smartis-Contrax` could not be opened from this
session (not found with the connected GitHub credentials: private repository or different name), so only the local one was reviewed.

## What it does
- Custom `User` mapped to the legacy ERP table `users` (unmanaged); password in a legacy column, no email/phone/token version.
- JWT (SimpleJWT) delivered in HttpOnly cookies, 15 min access / 7 days refresh, **rotation on refresh**, and a **revocation list**
  (`SMARTIS_JetonRevoque`: jti + expiry) kept in the database *and* in cache; `CookieJWTAuthentication` rejects revoked jti.
- Declarative **capability catalog** (`policy.py`: `AccessPolicy.can/require`), `require_capability()` DRF permission factory,
  roles stored in `SMARTIS_Role` / `SMARTIS_AffectationRole` (one role per user, no scope).
- `repositories.py` for persistence; architecture tests in `scripts/` (`test_architecture.py`, `test_rbac_policy.py`, `test_token_revocation.py`).

## Kept (ideas, adapted)
| Idea in the reference | In Maqraa |
|---|---|
| Capability catalog + `can` / `require` | `apps/access/policy.py` + `access.services.require()`; **per maqraa** and deny by default |
| First gate in DRF, authoritative check in services | same, plus scoped managers (`for_actor`) |
| Rotating refresh + revocation | SimpleJWT blacklist (reuse detection) **and** `token_version` (immediate revoke of all tokens) |
| Repositories hold persistence, services hold rules | enforced with import-linter contracts |
| Architecture tests | `tests/test_architecture.py` |

## Not reused, on purpose
- Table mapping to a legacy ERP, multi-database router and per-request DB switching: not needed here.
- **Password column limited to 30 characters / legacy storage**: replaced by Django hashing (Argon2).
- Single role per user without scope: the spec needs `MaqraaAccess(person, maqraa, role)` and segregation per maqraa.
- Cookies: the static site is cross-origin, so tokens travel in the body (see ASSUMPTIONS.md item 10).

## Added (gaps the spec asks for)
Login by username **or** email **or** phone (E.164, `phonenumbers`), email/phone optional with conditional unique indexes,
generic errors and equalised timing, database-backed progressive lockout (per account and per IP), `token_version`,
role-administration rules (only super_admin creates admins, no self-promotion, last super_admin protected), audit of
logins/denials/role changes, and a `/me/` contract listing effective capabilities per maqraa.

## Still missing (planned)
WhatsApp OTP, magic links, PIN, TOTP 2FA with recovery codes, activation/reset flows without email, device/session list,
rate limiting at the proxy level.
