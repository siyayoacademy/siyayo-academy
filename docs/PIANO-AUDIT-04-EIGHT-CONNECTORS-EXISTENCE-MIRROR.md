# PIANO-AUDIT-04 — Eight connectors, Frondosa consumers and EXISTENCE adapter preflight
Date: 2026-11-02
Status: READ-ONLY SOURCE TRACE; NO FEATURE ACTIVATED
Branch: jaguar/piano-stage-v0.1

## Actual interactive surfaces
- piano/index.html lines 59–67: eight Pianinho mascot hotspots C4,D4,E4,F4,G4,A4,B4,C5 (8 white-note positions).
- piano/index.html lines 77–91: fourteen Frondosa leaf controls (Question Words); notes reused across leaves, not 14 unique pitches.
- piano/index.html lines 195–199: separate Piano Plano chromatic keyboard; keyboard-map.json defines 13 notes (8 white + 5 black).
- These are THREE separate surfaces. Never equate the eight mascot connectors with the fourteen Frondosa QW leaves or the thirteen chromatic notes.

## Source-level consumer tracing
- piano/piano.js lines 5–25: DOM bindings for keyboard and mascot hotspots.
- lines 2838+: refreshFrondosaLabels() maps collection/activity to leaf labels and visibility; cannot replace this mapping wholesale.
- lines 2933+: verbFunctionCopy.existence currently labels/defines conceptual existence, not full THERE+BE paradigms.
- lines 2037+: stage-activity-changed event explicitly evaluated:false and evidenceProduced:false.
- lines 2111+: activateKey emits siyayo:musical-event with note, source, semantic and trilingual payload.
- lines 3376+: Frondosa leaf click branches by noun classification, noun exploration, verb morphology/function and other activity; a new panel must not intercept these events or rewrite dataset.note.
- lines 3276+: musical-event consumer handles resonance, and chromatic responses; must not be duplicated by grammar adapter.
- piano/content-collection-engine.js: content collection change/rejection events; preserve contracts.

## Proposed read-only adapter (NOT IMPLEMENTED)
Source of truth: data/learning/references/master-vip-existence-v0.1.json in Explorer research branch; before consumption, copy a reviewed versioned snapshot into a Piano-specific namespace OR expose a verified read-only resource with CORS and immutable version. Do not fetch from an unrelated Cloudflare Pages project without verifying its deployment, path and privacy boundary.

Contract candidate:
- id: piano-existence-study-v0
- sourceId, sourceVersion, provenance, approvalStatus
- period: present | past | future | presentPerfect | pastPerfect
- mode: affirmative | negative | interrogative
- language: en | es | pt
- number: singular | plural | invariant as applicable
- text, contextualSceneId (optional), translationReviewStatus
- evaluated:false; evidenceProduced:false; writes:false
- No automatic scene conjugation. ES/PT scene examples are adaptation candidates, not full grammatical paradigms.

## Interaction mirror, carefully bounded
- Existing eight mascot connectors continue to trigger their original musical notes and semantic events.
- A separate optional EXISTENCE panel may OBSERVE a user gesture/event to update an illustrative card (e.g. eight example slots) but MUST NOT consume or cancel the note event, change note pitch, relabel original keys, replace Frondosa QW, or write to Explorer state.
- Use event subscription and an explicit mapping table: connector noteId -> exampleSlotId. The eight slots are presentation choices, not eight tense/mode combinations or eight assessment targets.
- Feature flag OFF by default until source, runtime, visual and accessibility acceptance tests pass.

## Regression gates
1. Baseline and after: eight mascot hotspot notes, thirteen Piano Plano chromatic notes, fourteen Frondosa QW leaves.
2. Verify existing collection/morphology/function/classification paths and original speech/solfege.
3. Verify semantic cadence, resonance events, keyboard audio, Frondosa animation and environment/weather remain unchanged.
4. Test each panel choice independently; no event cancellation; no duplicate audio; no assessment/NICK/Evidence/GREEN.
5. EN→ES→PT translations and grammar independently reviewed; portrait/landscape no overlay/scroll regression.
6. Missing source gracefully hides/disables optional panel without affecting musical operation.

## Next technical step
Build isolated adapter schema and non-mutating test harness first. Only after tests and explicit approval, add a feature-flagged panel to Piano. No changes to production, main, Master VIP, Explorer or staging in this ELO.
