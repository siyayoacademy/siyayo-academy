# JAGUAR · FINE ART INTEGRATION 01 — modular stage contract

Status: architecture checkpoint; NOT production release. Base: SOUND-05 classic timbre approved in the Cloudflare preview. Preserve the legacy actor, its SVG, all 13 ring controls, assessment and the 432 Hz tuning.

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

## Sequence
- ELO 01A: freeze independent actor/gear contracts (this checkpoint).
- ELO 01B: move Portrait and Auto/Landscape keymap matrices into separate configuration, wire to Fine Art only.
- ELO 01C: verify 13 ring notes and prevent duplicate sound paths.
- ELO 01D: verify classical timbre, 432 Hz, note illumination and responsive modes.
- ELO 01E: deploy preview and collect homologation. Production unchanged.

## Required checks
22 unique MIDI 55–76, 13 unique ring controls, legacy default preserved, opt-in Fine Art PNG loads, portrait/auto/landscape calibration, no double notes, no evaluation events, no new credential or private asset, no unintended change to Piano Plano.
