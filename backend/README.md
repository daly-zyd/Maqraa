# Maqraa backend (Django + DRF + SQL Server)

Phase 0 / Phase 1 foundation: accounts, per-maqraa access control, people, weekly template, session generation, today board,
planning import. See `docs/ASSUMPTIONS.md` and `docs/AUTH_REVIEW.md`.

```
python -m venv .venv && .venv\Scripts\activate        # Windows
pip install -r requirements-dev.txt
copy .env.example .env                                  # fill the SQL_* values
python manage.py migrate                                # seeds the 4 maqraat
python manage.py createsuperuser --username boss        # (create_superuser sets is_super_admin)
python manage.py import_planning PLANNING.xlsx --actor boss --dry-run
python manage.py generate_sessions
pytest                                                   # 362 tests, SQLite (see ASSUMPTIONS 8)
lint-imports                                             # architecture contracts
```

Layers (per app): `views -> services -> repositories -> models` (import-linter enforced); apps depend only downwards:
`core <- audit <- accounts <- access <- maqraat <- people <- configuration <- scheduling`.
Every maqraa-owned model is read through `Model.objects.for_actor(actor)`; the plain manager refuses to run a query.
Cross-scope access answers 404 and is audited; a missing capability inside the scope answers 403.

API: `/api/v1/` (OpenAPI at `/api/schema/`). Auth: `POST auth/login|refresh|logout`, `GET me/`.
