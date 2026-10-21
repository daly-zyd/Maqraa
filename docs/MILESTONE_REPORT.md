# Milestone report — style, themes, login

## Done
- **Identity from the logos**: palette (emerald, gold, oxblood, lapis, parchment) as Tailwind v4 tokens + CSS variables; self-hosted Naskh (text), Thuluth (titles), Amiri Quran (verses).
- **Themes**: light/dark + 4 maqraa themes (default, حفص رجال, رجال, نساء) switched from the navbar, remembered in localStorage (`theme`, `maqraa_theme`). A theme re-points the `--color-emerald-*` scale, so every page follows.
- **Motion**: hero lattice drifts (transform only), glow breathes, one self-drawing star, page fade, reveal on scroll; everything off under `prefers-reduced-motion`. Intro plays once per session.
- **Adab**: `src/data/verses.ts` — text from Tanzil Uthmani via api.alquran.cloud; every entry `approved:false`, so nothing is public until the owner flips it (visible in dev and on /styleguide with a «قيد المراجعة» tag). The hadith still needs checking against a printed edition.
- **/styleguide** (`/#/styleguide`): tokens, fonts, buttons, ornaments, verses, cards.
- **Login** (`/#/login`): username/email/phone + password, WhatsApp code, forgot password; navbar «تسجيل الدخول» (desktop + mobile) becomes a user menu; `/dashboard` tiles and route guards come from `capabilities` in `/me/`.
- **Architecture**: components → `services/authService.ts` → `lib/apiClient.ts` (Axios, silent refresh). MSW mock (`VITE_USE_MOCK=true`, or dev without `VITE_API_URL`); real API via `VITE_API_URL`.
- **Backend**: `/auth/otp/request|verify`, `/auth/password/forgot|reset` (hashed codes, 10 min, 5 attempts, 5/hour, audited, same answer for unknown accounts); sender is pluggable (`OTP_SENDER`, logs in dev).

## Evidence
- tsc, oxlint, vite build, vitest (12), backend pytest + ruff + import-linter: all green.
- End-to-end login flow against the mock: `node scripts/shots/login_flow.cjs` (9/9).
- 18 screenshots in `docs/screenshots/` (home, login, styleguide × 360/768/1440 × light/dark); no horizontal overflow.
- Lighthouse mobile (production build, throttled): performance 65, accessibility 100, best practices 100 (LCP 4.2 s on a slow simulated phone).

## Remaining / assumptions
- Performance: framer-motion is in the main bundle (184 kB gzip); LazyMotion would save ~50 kB. Not done.
- The WhatsApp sender is a log stub until the outbox adapter exists.
- Dashboard tiles link to screens not built yet (schedule, people, reports, access, audit).
- Theme names for the green and ornate logos are assumptions (رجال / نساء).
- Pages other than Home got the new tokens, dividers and avatars, not a full re-layout.

## Needed from the owner
- Approve (or correct) the verses/hadith in `src/data/verses.ts`.
- Confirm which logo the site header should use (it still uses the transparent site logo).
