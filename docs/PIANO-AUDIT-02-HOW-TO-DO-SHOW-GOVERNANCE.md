# PIANO-AUDIT-02 — HOW TO DO / HOW TO SHOW / GOVERNANCE
Date: 2026-11-02
Repository: siyayoacademy/siyayo-academy
Source branch: jaguar/piano-stage-v0.1
Cloudflare Pages: https://pianinho-magico-siyayo.pages.dev/piano/
Status: PARTIAL SOURCE AUDIT — not a full functional homologation

## Verified source files
- piano/index.html, piano/piano.js, piano/piano.css, piano/keyboard-map.json, piano/content-collection-engine.js are present in the branch tree.
- piano/keyboard-map.json: chromatic C4–C5, eight white and five black keys; five animation layers; musical identity independent of semantic identity; no Evidence.
- data/environments/siyayo-environments.json: v0.2.0, reusable environment foundation.
- data/environments/siyayo-weather.json: v0.1.0, states clear/cloudy/mist/rain, event siyayo:set-weather, no external provider.
- docs/SIYAYO-PIANO-SYMBOLIC-LAYER-MAP.md: symbolic layers are presentation-only; pointer events disabled on decorative layers; dormant isolated assets.
- docs/SIYAYO-VERB-SYSTEMS-DEVELOPMENT-MAP.md: morphological regularity in EN cannot be propagated to ES/PT; function, morphology, time, sentence form are distinct axes.
- piano/piano.js exists and contains UI references for keyboard, Pianinho, noun classification, learner response, wait and support controls. Complete code path verification remains pending.

## HOW TO DO — source ownership and reuse
1. Treat the Piano as a consumer/presentation stage, not the authority for assessment, Evidence, GREEN, credits or session state.
2. Reuse canonical data through explicit adapters with source path, schema version, event names, owner, consumers, fallback and tests.
3. Keep EN → ES → PT order and language-specific morphology. Never infer ES/PT regularity from EN.
4. Keep Environment, Weather and symbolic visuals orthogonal to pedagogy; their controls must not alter assessment targets.
5. Distinguish music events, semantic events and evaluator contracts. No implied transfer of authority.
6. Preserve production and branch independence; no merge into main, no changes to DNA Explorer, Master VIP or staging during this audit.
7. THERE TO BE / THERE IS / THERE ARE: candidate shared grammar corpus only. Locate the real hidden DNA Explorer JSON, check provenance, schema, linguistic coverage, context, consumers and tests before importing. No integration authorized or completed by this document.

## HOW TO SHOW — observed and pending
Observed from user screenshots: Pianinho mascot, musical hotspots, keyboard, Sound/Solfege/EN/ES/PT/Tripiano, Question Words, noun/verb functions, Environment modes Auto time/Cosmic/Forest day/Forest night/Dawn/Party, Weather Clear/Cloudy/Mist/Rain, Auto/Portrait/Landscape.
User reports audible notes and trilingual explanations; independent automated audio verification pending.
Check responsive bottom control bars for occlusion; check 6×4 atmosphere combinations; check all key presses and note frequencies; check trilingual copy and speech; check mode-switch persistence and accessibility; verify 0/4–4/4 progress semantics; verify inactive/hidden modules are not described as implemented.

## Governance ledger (current)
PIANO-KEYS — implemented data contract; runtime test pending.
PIANO-ENV — reusable JSON contract; all combinations pending.
PIANO-WEATHER — reusable JSON contract; event boundary identified; runtime tests pending.
PIANO-SYMBOLIC — layered design map; some asset slots dormant by design.
PIANO-VERBS — morphology/function separation documented; ES/PT morphology not yet canonically established in cited map.
PIANO-THERE-TO-BE — DISCOVERY REQUIRED; do not assume source or share schema.
PIANO-MOBILE — visible controls; Android installation/PWA not verified.
PIANO-RELEASE — Cloudflare deployment success shown by user; commit-to-deploy provenance and automated tests pending.

## Definition of satisfactory
A module is HOMOLOGATED only after source identification, explicit ownership, schema and event review, visual and behavioral checks EN/ES/PT where applicable, regression tests, accessible mobile layout, documented evidence, and approved integration boundary. Mark all other states OBSERVED, MAPPED, PENDING, or BLOCKED.

## Next ELO
1. Identify deployed SHA and compare with branch head.
2. Read full Piano JS/HTML/CSS and content engine; enumerate modules/events/consumers.
3. Locate hidden THERE TO BE corpus in its own branch and inspect JSON without modifying it.
4. Add contract matrix and tests to an isolated branch, review before any production deployment.
5. Only after homologation consider a separate Android/PWA packaging project.
