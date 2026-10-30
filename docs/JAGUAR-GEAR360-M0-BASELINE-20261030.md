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
