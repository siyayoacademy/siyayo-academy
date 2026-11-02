# SIYAYO Piano Symbolic Layer Map v0.1

Status: implementation scaffold active on `jaguar/piano-stage-v0.1`.

## Principle

Symbolic atmosphere is presentation only. It never creates pedagogical state, Evidence, GREEN, Session authority, or learner evaluation.

## Global stack

| Layer | Role | Suggested opacity | Pointer events | Conceptual z |
| --- | --- | ---: | --- | ---: |
| G0 | Environment base / spectral blue | 1.00 | none | 0 |
| G1 | Spectral depth wash | 0.90–1.00 | none | 1 |
| G2 | Golden aura / orbital rings | 0.08–0.18 | none | 2 |
| G3 | Golden seed field | 0.40–0.75 | none | 3 |
| G4 | Optional isolated eagle | 0.08–0.16 | none | 4 |
| G5 | Optional isolated golden Frondosa | 0.10–0.20 | none | 5 |
| G6 | Optional isolated golden seed | 0.14–0.24 | none | 6 |
| G7 | Weather overlay | contextual | none | 7 |
| C10+ | Functional cards, Pianinho, Frondosa, Question Words | functional | normal | 10+ |
| UI50+ | Developer preview / HUD | 1.00 | normal | 50+ |

## Local Frondosa stack

| Layer | Role | Suggested opacity | Pointer events |
| --- | --- | ---: | --- |
| F0 | Local dark/spectral backdrop | 0.60–0.90 | none |
| F1 | Optional symbolic golden art | 0.08–0.18 | none |
| F2 | Branch/skeleton map | 0.18–0.32 | none |
| F3 | Word leaf shape | 0.78–0.90 | normal |
| F4 | Word text | 1.00 | normal |
| F5 | Focus/hover/active affordance | 1.00 | normal |

## Asset slots implemented

The global scaffold now exposes three dormant decorative slots:

- `[data-symbolic-eagle]`
- `[data-symbolic-frondosa]`
- `[data-symbolic-seed]`

They intentionally start at `opacity: 0` until isolated transparent assets are introduced and visually homologated.

## Current active symbolic layers

- spectral depth wash
- golden central aura
- golden orbital rings
- breathing seed/light field
- reduced-motion fallback

## Next asset pass

Adopt isolated transparent assets one by one in this order:

1. Golden eagle
2. Golden Frondosa
3. Golden seed

Each adoption must be independently adjustable for opacity, scale and position. No combined raster should become a permanent dependency of the stage.

## Interaction boundary

All global symbolic layers use `pointer-events:none`.
Only functional leaves/hotspots/buttons receive learner interaction.
