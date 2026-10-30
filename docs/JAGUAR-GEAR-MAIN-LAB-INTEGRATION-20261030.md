# JAGUAR — GEAR Multiverse 360° · MAIN as integrated laboratory

Date: 2026-10-30. Decision: owner requests that the primary `main` site function as the integrated development laboratory until public homologation. This replaces the indefinite cycle of isolated previews, **not** safety checks or history preservation.

## Non-negotiable inherited decisions
- Master VIP / The Ten Kinds of Words is the broad pedagogical source. QWs (14), word classes (10), languages EN → ES → PT, Experiences S1–S4 and successors, tense, mode, perspective and specialized modules are independent navigation dimensions. No forced route.
- HOW TO DO: contextually meaningful exploration regardless of NICK or assessment eligibility.
- HOW TO SHOW: render the authored modules when Experience × QW × language matches; never gate teaching UI on learner identity, evaluator availability, Green Pass or credit.
- HOW TO RECORD: PATITA observes navigation without awarding credits. Only an authorized contract, isolated by learner identity, QW, language and assessment scope, may accept evidence and issue Green Pass. Observation is not a pass.
- A contract may accept eligible evidence across Experiences and in any order, preserving results across language/Experience switches, without duplicates. No mechanically invented combinations or unauthorized answers.
- Preserve the established modules, JSON, assessments, previous audits, maps, Word Path, Learning Trail, audio, Dependency Focus, Head Probe, GEAR and specialized There to be / There is / There are. Do not rebuild them without reconciliation.

## Grounded divergence checkpoint (2026-10-30)
- `main...jaguar/why-explorer-live-wire-20261029`: diverged; feature branch 1,825 commits ahead / 1 behind; compare reports 300 files (may be capped).
- `js/verb-explorer-why-assessment-live.js` present on WHY branch, absent from `main`.
- `js/verb-explorer.js` and `verb-explorer.html` differ between refs.
- WHY S3/S4 cross-language practice tests revealed a render/mount dependence on readiness, QW not carried reliably across navigation, and an exploratory layout defect. Branch-side corrections made; unverified visual/CI results are not homologation.
- Never perform a blanket merge of 1,825 commits: it risks unrelated experimental code, staging configuration, deployments, contracts and PR #3.

## Execution plan / accountable gates
| ELO | Action | Acceptance evidence | State |
|---|---|---|---|
| M0 | Pin current main and WHY HEAD, baseline inventory limited to runtime imports/dependency graph/CI/Pages production source; preserve recovery refs | concrete SHAs; reproducible file map; backup reference | STARTED: comparison performed; full graph pending |
| M1 | Selectively integrate shared GEAR and WHY runtime dependencies to main, with coherent module wiring and source authority; no blanket merge | direct dependency completeness + explicit diff, no unrelated assets | PENDING |
| M2 | Universal toroidal switching gate: Experience S1–S4 × relevant QWs × EN/ES/PT × NICK absent/present, revisit/back/forward/refresh and QW retention | modules always render when authored; never stale QW; state and UI consistent | PENDING |
| M3 | Contract gate: PATITA observation separate; learner isolation; no credit on free practice; eligible cross-Experience evidence, idempotency, 0/3–3/3 and Green Pass | repeatable local tests + Learning Trail / Word Path reconciliation | PENDING |
| M4 | Visual/linguistic regression: desktop/portrait, text wrapping, speaker, LINES, DF, Head Probe, NEXT anchor, EN/ES/PT and existing WHICH/WHAT/WHERE before and after WHY integration | screenshots plus CI and owner homologation | PENDING |
| M5 | Promote a small validated code lot to main (the working laboratory) and confirm Cloudflare Pages deployment is actually main at expected commit; rollback-ready | CI GREEN, actual production URL, current SHA and owner visual homologation | PENDING |
| M6 | Expand remaining QWs and ten word classes by reusable authored contracts/content modules, not one full redesign per QW; honor Master VIP | per-family coverage ledger with implemented/available-for-study/assessable/not-authored distinctions | PENDING |

## Per-commit guardrails
1. Read current branch + main HEAD before edits and again before promotion; stop on changed bases.
2. Limit integration to files and dependencies needed; never overwrite another team's active module blindly. Retain branch work and map each adopted source to destination and SHA.
3. Every meaningful code lot must have automated tests with negative assertions (no NICK still shows practice, no unauthorized Green Pass), and named manual UI checks.
4. Record commit, workflow/run conclusion, preview/production URL, defects, reconciliation, and next step in this map. A commit or successful Pages build alone does not prove behavior.
5. Do not alter D1, Worker routes, authentication, secrets, billing, Cloudflare bindings, PR #3 or remote migrations as a side effect of this integration; independent gates and explicit scope remain in force.
6. Main as laboratory means continuous controlled integration. Public disclosure and real authenticated production are separate explicit milestones.

## First immediate work package
- Verify WHY educational rendering without NICK and language switching in S3/S4; guard QW retention S1→S2→S3→S4.
- Compare the old main module loader against WHY branch import graph before porting changes.
- Run regression before modifying the default branch; if the baseline fails, keep main unchanged and report the blocker precisely.

## Continuity contract
This document is the single checkpoint for the main-laboratory transition and links back to `docs/SIYAYO-WORK-MAP.md`. Continue from the last verified ELO and commit rather than proposing a fresh audit or restarting WHY. Check active heads and the newest homologation before any follow-up work.
