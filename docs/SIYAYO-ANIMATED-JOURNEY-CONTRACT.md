# SIYAYO Animated Journey Contract

**Branch:** `jaguar/animated-siyayo-journey-v0.1`  
**Status:** BASELINE IMPLEMENTED — responsive shell + canonical W0→W8 state machine; visual asset choreography pending.

## Audit result

No dedicated Animated Journey branch or runtime page existed at the time of this implementation.

Canonical ingredients already existed in two parallel development lines:

- `jaguar/piano-stage-v0.1`
  - shared SIYAYO Responsive Contract;
  - shared responsive CSS/JS;
  - Motion DNA;
  - Piano/Frondosa actor capability model.
- `jaguar/verb-explorer-resume-live-wire`
  - canonical Animated SIYAYO Journey route recorded in `docs/siyayo-canonical-development-map.md`;
  - canonical Academy/adaptive navigation and evidence authorities.

This branch starts from the Piano Stage branch so it inherits the already homologated responsive implementation. It does not mutate the adaptive branch.

## Canonical route

```
W0  Celestial Iris / opening
↓
W1  Golden Eagle + Golden Branch
↓
W2  Golden Seed ready
↓
W3  Seed release / fall
↓
W4  Frondosa canopy / branch contacts / portals
↓
W5  Trunk / internal structure
↓
W6  Roots / ground
↓
W7  Jaguar trajectory / next footprint
↓
W8  Patita + Golden Seed / DNA recognition
↓
Nice Party / Academy continuation
```

## Interaction grammar

Inherited from `data/motion/siyayo-motion-dna.json`:

`touch-or-swipe → event → motion → reveal → resonance → wait-or-next`

Swipe is a learner-controlled advance motor, not an autoplay timer.

## Responsive contract

The Journey consumes:

- `../css/siyayo-responsive-stage.css`
- `../js/siyayo-responsive-preview.js`

Therefore Auto / Portrait / Landscape are the same shared implementation already used by Piano.

Real touch-first devices use real responsive CSS and do not need the developer preview toolbar.

## Layer rule

The initial runtime reserves the layer contract without inventing art assets:

- environment/background
- celestial iris
- golden eagle
- golden branch
- golden seed
- Frondosa canopy/branches
- portals
- trunk
- roots/ground
- Jaguar trajectory
- Patita
- illumination/particles
- contextual WAIT/portal controls

Each future asset should remain individually composable and should prefer transparent backgrounds when it must receive independent motion.

## Portal rule

A Journey portal does not navigate by itself.

It dispatches a `siyayo:journey-portal-request` with a canonical capability handoff. A separate approved navigation/runtime owner must consume that request.

Initial mapped example:

```
W4 Frondosa
→ Explore Morphology
→ collection: verbs
→ activity: morphology
→ destination surface: Piano Stage
→ status: mapped, not auto-navigated
```

## Evidence boundary

Animation, swipe, resonance, collision with a branch/leaf, portal reveal and scene completion are presentation/navigation events only.

They do not create:

- Attempt
- Evidence
- GREEN
- learner mastery
- automatic Session state

## Reduced motion

Reduced-motion users keep the same W0→W8 semantic order and controls while scene transitions collapse to still/immediate state changes.

## Next implementation

1. Insert canonical transparent actor assets into reserved layers.
2. Define W0 iris/eagle visual choreography.
3. Define seed trajectory W2→W6.
4. Define branch/leaf contact effects in W4.
5. Bind approved portal receiver(s), beginning with Explore Morphology.
6. Homologate Auto / Portrait / Landscape and real smartphone before deeper choreography.
