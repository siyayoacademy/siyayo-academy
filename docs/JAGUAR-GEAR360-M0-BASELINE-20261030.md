# JAGUAR — M0 baseline / selective integration from main

Date: 2026-10-30. Branch created **from main**, not from the diverged WHY branch.

## Verified source checkpoint
- main baseline commit from compare: `c2149f5e63b8de716cf9b9dcdede213bd328344e`.
- WHY source: `jaguar/why-explorer-live-wire-20261029` (current HEAD must be rechecked before each import).
- Compare main...WHY: 1,827 ahead, 1 behind. Comparison lists 300 files; treat this as truncated, not a comprehensive inventory.
- main `verb-explorer.html` blob `ddb08279e6ffdf5e9d24fc0c5b51ab62a32301a5`; WHY `333901d383c46b1e7ddde0750543525aa6502389`.
- main `js/verb-explorer.js` blob `93d3e4b57f9d0337847005df704248b473644946`; WHY `c37ad17c6382dcca4910fc911d0bbdc2811020f2`.
- WHY `js/verb-explorer-why-assessment-live.js` blob `2c429c76e3547471aa6bbbcf3f06691f3e277305`; absent on main.
- WHY `data/learning/skills/why.json` blob `cf16e1e879bd236e5199240e350c0c623a2bc3ed`; absent on main.

## Gate outcome
**M0 partial, M1 blocked pending dependency closure**: WHY is not a single drop-in module. Main's controller/HTML do not yet wire the WHY runtime. Copying only the WHY module or overwriting core files would create a broken or regressed Explorer. No code copied blindly; no new deploy, no SQL, no worker change, no main change.

## Next implementation sequence
1. Trace actual script import order and referenced DOM IDs in both versions; identify changed CSS, JSON and runtime dependencies.
2. Identify minimal coherent adoption slice covering S3/S4 WHY without NICK; preserve S1/S2/WHICH/WHAT/WHERE and all legacy modules.
3. Add targeted tests for render independence, QW persistence S1-S4, language switches, learner identity isolation and non-credit free exploration.
4. Only after CI and manually inspected preview may changes be promoted to main in small recoverable commits.

Authoritative plan and gates: `docs/JAGUAR-GEAR-MAIN-LAB-INTEGRATION-20261030.md` on the WHY branch, linked from `docs/SIYAYO-WORK-MAP.md`. No blanket merge of 1,827 commits.

## M1 dependency-gate implementation (2026-10-30)
- Main HTML loads 6 external scripts; WHY HTML loads 48. Main controller 36,243 chars; WHY controller 70,376 chars. This is not a single-module drop-in.
- Committed `scripts/jaguar-gear360-m1-dependency-census.cjs` (commit `e6eed2c`) to scan actual referenced HTML scripts/styles and controller JSON direct literals, report source/target gaps and stop for broken source references.
- Committed `.github/workflows/jaguar-gear360-m1-dependency-census.yml` (commit `9c3f5d0`) to check out main and WHY as independent read-only trees and run the scanner.
- CI outcome not yet confirmed at documentation time. No runtime assets transported to main; next step is inspect CI, reconcile failures and explicitly scope the minimal portable feature.

## M1.2 selective recovery (2026-10-30)
- Source WHY canonical contract `data/learning/skills/why.json`, blob `cf16e1e879bd236e5199240e350c0c623a2bc3ed`, copied unchanged to **integration branch only**, commit `fbf0001`.
- This is source recovery, not runtime enablement: no WHY evaluator script, HTML wiring or production deployment was performed.
- Main still untouched; contract is not automatically assessable without its authorized evaluator and run-time scope.
- The dependency census now explicitly checks all 12 S1–S4 × EN/ES/PT WHY dependency paths, including dynamically assembled paths.
- Follow-up: close module import graph and demonstrate a no-NICK pedagogical render with controlled regression; only then transport the coherent runtime set.

## M1.3 canonical component recovery (2026-10-30)
The following WHY source files were copied unchanged from `jaguar/why-explorer-live-wire-20261029` into the main-derived integration branch:
- `js/adaptive-why-contextual-reason-probe-specification-source.js` — `7551979`
- `js/adaptive-why-contextual-reason-probe-result.js` — `8fb7f53`
- `js/adaptive-why-contextual-reason-probe-evidence-bridge.js` — `e429abc`
- `js/adaptive-why-contextual-reason-probe-attempt-boundary.js` — `21929ac`
- `js/verb-explorer-why-assessment-live.js` — `fc3c89b`

**Import is preservation only.** HTML script order, `js/verb-explorer.js`, current CSS, learner/coordinator/cycle/Green Pass dependencies and actual runtime compatibility are still unresolved. No assessment can be claimed operational until these dependencies and cross-Experience UI regression pass. None of the imported scripts is loaded by main's current HTML.

Next M1.4: reconcile dependency provider exports and script ordering, then test no-NICK S3/S4 pedagogical rendering, identity separation, and contractual evidence without overriding the default branch.

## M1.4 verified loader ordering and reusable integrity gate
- WHY source HTML sequence: specification source → result → evidence bridge → attempt boundary → WHY contextual module → main Explorer driver.
- Added `scripts/jaguar-gear360-m14-why-integrity.cjs` (`cad52f4`), comparing recovered module bytes to the WHY source and asserting loader order and 3-dimension canonical contract.
- Added the integrity check to CI workflow (`2d0ff96`). The check reports `BLOCKED_UNWIRED` while source files are present but not loaded by the integration HTML. This is intentional, not a working browser pass.
- Next: close complete GEAR bootstrap/DOM/CSS dependencies before activation. No default-branch changes, no D1 or worker changes.

## M1.5 DOM/CSS/runtime dependency gate (2026-10-30)
- Source HTML: main = 6 scripts, 2 CSS, 57 explicit HTML IDs; WHY = 48 scripts, 6 CSS, 99 explicit IDs. Counts derive from current file contents, not CI output.
- Added `scripts/jaguar-gear360-m15-dom-css-gate.cjs` (`64edd5f`), a read-only, three-tree comparison of loader scripts, CSS references, HTML IDs, source driver DOM lookups and recovered WHY module presence.
- Added check to the integration branch workflow (`641c600`). Source completeness, dynamic browser behavior and CI GREEN are **not yet certified**.
- Keep M1 feature wiring BLOCKED until complete source dependencies and DOM/CSS structure are reconciled. The `main` branch remains unchanged; separate D1, worker and staging checks untouched.
- Next M1.6: review actual gate output, repair the gate if its assumptions are wrong, and implement a coherent integration candidate only after the structural parity baseline passes.

## M1.6 recovery — authored WHY dependency corpus
- Copied unchanged six authored S3/S4 dependency corpus files (having-why and after-dinner-why, EN/ES/PT) from WHY source into integration branch; source JSON parsed successfully before copy.
- Files: `data/learning/dependencies/{having,after-dinner}-why-{en,es,pt}.json`.
- Commits: `0f083132`, `ce8073a5`, `803b37bb`, `dcbb074c`, `440669ae`, `4fa1a99a`.
- S1/S2 WHY pedagogy is **not** inferred from S3/S4; confirm authored shopping/preparing corpus and runtime references separately.
- No WHAT/WHICH/WHERE or learner/assessment control modified. HTML wiring still pending. CI conclusions not verified due to tool limitations; do not claim GREEN. MAIN and D1 unchanged.

## M1.7 WHY S1/S2 corpus recovery — 2026-10-30
- Recovered six complete, already-authored Dependency Focus JSON files (S1 shopping / S2 preparing × EN/ES/PT) from WHY experimental source **unchanged**.
- Source SHA checkpoints: shopping EN `4f6e377`, ES `77ade1d`, PT `a054278`; preparing EN `18a4da3`, ES `ddaba77`, PT `afe8a9e`.
- Integration commits: `bcf87be5`, `3fa895e4`, `bdaf75e9`, `57154e68`, `6f7288aa`, `4a3ba66e`.
- All **12** WHY Dependency Focus corpus files are now present for S1–S4 EN/ES/PT, as source recovery; this does not assert that S1/S2 have independent assessment contracts or that anything is rendered in the integration HTML.
- Runtime GEAR/HTML/CSS wiring and browser regression remain the blocking M1.8 gate. No MAIN/D1/Worker modifications.
