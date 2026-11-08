# JAGUAR · FINE ART INTEGRATION 01 — modular stage contract

Status: architecture checkpoint; NOT production release. Base: SOUND-05 classic timbre approved in the Cloudflare preview. Preserve the legacy actor, its SVG, all 13 ring controls, assessment and the 432 Hz tuning.

## Central pedagogical actor — FRONDOSA (preserve FIRST)
- **ACTOR.FRONDOSA**: the Frondosa tree is the heart of the luminous trilingual Solfege stage, not decoration. Preserve its original visual, all **14 interactive Question Word leaves**, leaf identity, focus, lighting, response flow (question → WAIT → learner response), and EN/ES/PT semantics. It must remain independently operable when any piano is hidden, swapped, or under development.
- **GEAR.QUESTION_WORDS**: 14 QWs, selected activity and context; its pedagogical event contract must not depend on the presence of a piano or NICK.
- **GEAR.LEAF_LIGHT**: leaf feedback belongs to Frondosa; musical note light belongs to each instrument. Synchronize through explicit XCONNECTION events only.
- **STAGE.CONTROLS**: preserve PLAY WITH (Question Words/Nouns/Verbs), ACTIVITY (Explore/14 Questions/Classify/Morphology/Function), NOUN LAYER (Concrete/Abstract/Proper), LISTEN/LANGUAGE (Sound/Solfege/EN/ES/PT/Tripiano), Environment and Weather. Existing controls must not disappear when an actor changes.

## Independent actors
- **ACTOR.PIANO_PLANO**: 22-key responsive chromatic keyboard G3–E5. Classical piano timbre homologated; its current UI and educational handlers are not replaced.
- **ACTOR.PIANINHO_LEGACY**: original `assets/pianinho-magico.svg` and overlay, retained for portfolio and other stages. Default remains unchanged.
- **ACTOR.PIANINHO_FINE_ART**: opt-in `assets/pianinho-semicircular-homologado.png`, 22 transparent key hit areas, 13 ring notes. Activate with `?pianinho_resume03=1`; do not enable by default until visual/audio homologation.
- **ACTOR.RING_13**: 13 independently addressable buttons, shared by actor presentation, not an assessment engine.

## Shared gears
- **GEAR.TUNING**: `piano-tuning-432.js`, MIDI 55–76, 12-TET A4=432 Hz, single authority.
- **GEAR.CLASSIC_SOUND**: approved Piano Plano classical timbre for 22 notes; Fine Art may use a distinct register only if independently homologated.
- **GEAR.LIGHT**: note illumination, never triggers another note.
- **GEAR.SOLFEGE**: musical naming and exercises; no direct audio authority.
- **GEAR.LANGUAGE**: EN/ES/PT text/TTS, independent of music.
- **GEAR.RECORD**: evaluation only when an explicit assessment contract grants it.

## Integration boundaries
1. Every actor owns its DOM/visual layer; no actor edits another actor's keys.
2. XCONNECTION musical events carry `note`, `midi`, `frequency`, `scope`, and `sourceActor`. One gesture must produce one sound.
3. `HOW TO SHOW` must work without NICK; `HOW TO DO` remains free; `HOW TO RECORD` is isolated.
4. Portrait and Auto/Landscape use two distinct user-supplied keymap profiles. Do NOT infer one from the other; `null` dimensions require the lab's existing fallback, not arbitrary dimensions.
5. The lab grid, sliders and JSON export remain opt-in with `?keymap_lab=1`; never show in production by default.
6. No merge into main or Cloudflare production until Fine Art artwork, 22 hit targets, 13 ring notes, sound, lighting, and all modes are visually and musically checked.

## Stage disposition
- **Pedagogical center**: Frondosa, always available with 14 interactive leaves.
- **Fine Art musical actor**: semicircular Pianinho with 22 keys and 13 ring notes, independent of Frondosa.
- **Instrument actor**: Piano Plano, 22-key approved classic timbre, independent of Frondosa and Pianinho.
- **Heritage actor**: original Pianinho retained as an independently selectable module, never deleted.
- **Controls and gears**: independently mounted, accessible without scrolling through or enabling another actor. Avoid fixed overlays obscuring controls on mobile.
- This is a *logical arrangement*, not a mandate to vertically stack actors. Preserve the existing stage until visual layout is homologated.

## Sequence
- ELO 01A: freeze independent actor/gear contracts (this checkpoint).
- ELO 01B: move Portrait and Auto/Landscape keymap matrices into separate configuration, wire to Fine Art only.
- ELO 01C: verify 13 ring notes and prevent duplicate sound paths.
- ELO 01D: verify classical timbre, 432 Hz, note illumination and responsive modes.
- ELO 01E: deploy preview and collect homologation. Production unchanged.

## Frondosa non-regression gate (mandatory before preview and publication)
- 14/14 leaves visible, individually actionable, with correct Question Word identity.
- Question → WAIT → learner response works with and without any piano actor.
- Trilingual EN/ES/PT, Sound/Solfege, and Tripiano controls remain reachable.
- PLAY WITH, ACTIVITY, NOUN LAYER, Environment and Weather remain present and responsive.
- Switching actors does not reset leaf state or create spurious assessment/evidence.
- Portrait/Auto/Landscape and smartphone views do not clip the tree, leaves, or controls.

## Required checks
22 unique MIDI 55–76, 13 unique ring controls, legacy default preserved, opt-in Fine Art PNG loads, portrait/auto/landscape calibration, no double notes, no evaluation events, no new credential or private asset, no unintended change to Piano Plano.
