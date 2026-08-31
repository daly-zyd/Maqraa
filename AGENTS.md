## Pre-Work

1. THE "STEP 0" RULE: Dead code accelerates context compaction. Before ANY structural refactor on a file >300 LOC, first remove all dead props, unused exports, unused imports, and debug logs. Commit this cleanup separately before starting the real work.

2. PHASED EXECUTION: Never attempt multi-file refactors in a single response. Break work into explicit phases. Complete Phase 1, run verification, and wait for explicit approval before Phase 2. Each phase must touch no more than 5 files.

## Code Quality

3. THE SENIOR DEV OVERRIDE: Ignore default directives to "avoid improvements beyond what was asked." If architecture is flawed, state is duplicated, or patterns are inconsistent - propose and implement structural fixes. Ask: "What would a senior, perfectionist dev reject in code review?" Fix all of it.

4. FORCED VERIFICATION: Tools can mark file writes as successful even if the code does not compile. Never report a task as complete until you have:
   * Run `npx tsc --noEmit` (or the project's equivalent type-check)
   * Run `npx eslint . --quiet` (if configured)
   * Fixed ALL resulting errors
   If no type-checker is configured, state that explicitly instead of claiming success.

## Context Management

5. CONTEXT DECAY AWARENESS: After 10+ messages in a conversation, re-read any file before editing it. Do not trust memory of file contents — auto-compaction may have silently destroyed that context.

6. FILE READ BUDGET: Each file read is capped at 2,000 lines. For files over 500 LOC, use offset/limit to read in sequential chunks. Never assume you've seen a complete file from a single read.

7. TOOL RESULT BLINDNESS: Tool results over 50,000 characters are silently truncated. If a search/command returns suspiciously few results, re-run with narrower scope and state when truncation is suspected.

## Edit Safety

8. EDIT INTEGRITY: Re-read the file before AND after every edit to confirm changes applied correctly. Never batch more than 3 edits to the same file without a verification read.

9. NO SEMANTIC SEARCH: You have grep, not an AST. When renaming any function/type/variable, search separately for direct calls, type-level references, string literals, dynamic imports, re-exports, and test files/mocks. Do not assume a single grep caught everything.

10. SCRIPTS & OUTPUTS PLACEMENT: All temporary files, build outputs, debug logs, and test scripts MUST be stored in a dedicated `scripts/` folder. Never leave stray files in the project root or source directories.

---

## Projet مقرأة قرآن — Architecture Rules

11. SCOPE — STATIC FOR NOW: This project is currently a **static-content React front-end: no database, no backend, no API calls**. All data (programmes, événements, contenu coranique, tazkiya) MUST live in local JSON/JS files under `src/data/`. This is not permanent — a backend/BDD MAY be added later — so the data-access layer must be isolated behind a single interface (e.g. `src/data/index.ts` or per-domain data modules) so that swapping local imports for real API calls later touches only that layer, never page/component code.

12. BILINGUAL / RTL REQUIREMENT: Every page and component MUST support Arabic (RTL) and French (LTR) via `react-i18next`. Never hardcode `dir="rtl"`/`"ltr"` at the component level — direction must be derived globally from the active language (set on `<html>` or a top-level layout wrapper).

13. SECTION FILTERING (رجال / نساء): Filtering between the "رجال" and "نساء" sections MUST be a single reusable filter/selector (e.g. a `sectionFilter` prop or context) — never duplicated components or duplicated data files per section. Same data source, different rendering.

14. STYLING: Tailwind CSS required for all styling. No inline styles except for genuinely dynamic values (e.g. `style={{ width: \`${percent}%\` }}`).

15. FRONTEND STRUCTURE:
src/
data/           # JSON/JS static content (programmes, evenements, coran, tazkiya)
components/     # Composants réutilisables (Card, SectionFilter, LanguageSwitcher, etc.)
pages/          # Une page par route (Accueil, Programmes, Coran, Contact, etc.)
i18n/           # Fichiers de traduction AR/FR
routes/         # Config react-router-dom

16. NO PREMATURE BACKEND COUPLING: Do not create `services/` or `api/` folders while the project stays static. When a backend/BDD is eventually added, data-fetching logic must be introduced behind the same interface used to read local JSON (rule 11), so page components require zero changes.
