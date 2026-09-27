# SIYAYO CANONICAL DEVELOPMENT MAP

Version: 1.0  
Status: canonical-development-map  
Audit baseline: `jaguar/verb-explorer-resume-live-wire@c46310b`  
Parallel motion/piano baseline: `jaguar/piano-stage-v0.1@cda3edc`

## Purpose

This map is the persistent WHAT / WHERE contract for SIYAYO Academy.

For every capability, development should answer:

- **WHAT EXISTS?**
- **WHAT IS MISSING?**
- **WHAT CONNECTS?**
- **WHERE NEXT?**

Every new feature should be located in this map before it becomes an isolated implementation.

## Canonical learning flow

```text
WELCOME
  ↓
WORD TREE
  ↓
CHAPTER / A5 ↔ MASTER
  ↓
CANONICAL CORPUS
  ↓
THINKING MIND
  ↓
EXPERIENCE / COMPOSITION / PERSPECTIVE
  ↓
ATTEMPT → EVIDENCE
  ↓
ADAPTIVE CYCLE
  ├─ WAIT → learner agency → RESUME
  └─ GREEN → NEXT
  ↓
WHERE ARE YOU GOING NEXT?
```

Sound, Piano, Frondosa, archetypes and Motion are perceptual/navigation layers around this same learning system. They must connect to canonical meaning, learner action or evidence rather than become decorative parallel systems.

## Capability map

| Capability | Exists | Missing / risk | Connects | Where next |
|---|---|---|---|---|
| Welcome / Home | Welcome, locale surface, chapter stack, quick links | complete locale contract and profile persistence | Word Tree, Chapters, Experiences | locale/context contract |
| Chapters / A5 | Chapters 01–10 ready + Question Words ready | preserve concise 10-slide contract | MASTER, corpus, speech, Experiences | no duplication; deepen through MASTER |
| MASTER | `masterScope`, source reviews and reserved depth already declared in Chapters | consolidate deep canonical corpus | Chapters, lexicons, Experience | capability-by-capability source mapping |
| Question Words | 14 canonical focuses + HOW OLD practical extension | global skill/evidence coverage beyond pilots | Thinking Mind, Frondosa, Experiences | map each QW to skills and evidence |
| DNA VERBS | verb functions, tense/form/subject surfaces | expose corpus knowledge such as regularity where pedagogically useful | Verb corpus, Xespirito, Experience | corpus→UI capability mapping |
| Nouns | canonical dinner corpus + Experience noun axis | broaden corpus and reuse outside dinner | composition, Dependency, Experiences | reusable noun capability |
| Adjectives | expanded canonical corpus + Experience adjective axis | broader contextual linking | nouns, composition, semantic domains | corpus→Experience mapping |
| Other word types | rich Chapters and MASTER scopes | operational corpora/UI/evidence not yet equally deep | Ten Kinds, Dependency, Experiences | extract reusable capability patterns |
| Lexical Composition | NOUN + ADJECTIVE → COMPOSE → BUILD SENTENCE | generalize beyond pilot | word types, sentence axis, evidence | canonical composition contract |
| Perspective | DESCRIBE / NARRATE / DEBATE / CONCLUDE runtime | explicit pedagogical/evidence contract | Experience, profile, assessment | define observable skill per perspective |
| Experiences | Dinner sequence + College seeds | unify capability declarations and broader runtime integration | corpus, QW, adaptive cycle | Experience capability manifest |
| Adaptive Engine | Attempt, Evidence, Green Pass, Router, WAIT, Agency, Resume, Runtime Dispatch | extend grounded skills/evidence coverage | all Experiences | reuse one adaptive authority |
| Archetypes | Jaguar, Xespirito, Patita traces/roles | formal capability ownership for future actors | adaptive engine, diagnostics, narrative | ability first, character second |
| Responsive surfaces | Chapter/Home portrait contract + Explorer guards | shared surface contract across Experience/Piano/animation | all interactive environments | canonical L0–L3 surface rules |
| Piano / Frondosa | piano stage, 14 QW leaves, sound interactions | connect learning events/evidence deliberately | QW, sound, motion | semantic event bridge |
| Motion DNA | shared timing/easing/effect vocabulary | runtime orchestration and scene state machine | all animated surfaces | preserve as shared foundation |
| Animated SIYAYO Journey | actors are reserved in Motion DNA; narrative route is now canonically recorded here | scene implementation is incomplete; current Piano runtime has no swipe journey controller | Welcome, Frondosa, Jaguar, Patita, Nice Party, portals, adaptive WAIT | implement only after scene/state contract is explicit |

## Animated SIYAYO Journey — canonical entrance route

This route is a **first-class Academy access experience**, not a decorative intro and not a replacement for the direct Academy Home. It is an optional interactive entrance into the same canonical universe.

### Narrative sequence

```text
IRIS / CELESTIAL OPENING
        ↓ swipe
GOLDEN EAGLE
        ↓
GOLDEN BRANCH
        ↓
GOLDEN SEED
        ↓ swipe / release
SEED FALLS INTO FRONDOSA
        ↓
LEAVES + BRANCHES + RESONANT CONTACTS
        ↓ each swipe may advance to a meaningful WAIT
DIMENSIONAL PORTALS BECOME VISIBLE
        ↓
SEED TRAVELS THROUGH THE TRUNK
        ↓
OPEN GROUND / CLEARING
        ↓
NEXT JAGUAR FOOTPRINT
        ↓
PATITA IDENTIFIES A NEW GOLDEN SEED
        ↓
BRILLIANT DNA RECOGNITION
        ↓
ENCOUNTER / NICE PARTY
        ↓
ACADEMY UNIVERSE CONTINUES
```

### Interaction contract

The canonical motion phase already established in `data/motion/siyayo-motion-dna.json` is:

```text
touch-or-swipe → event → motion → reveal → resonance → wait-or-next
```

The journey must preserve that grammar. **Swipe is a learner-controlled advance motor**, not an autoplay timeline. A swipe may initiate movement, but the scene can stop at a meaningful WAIT so the learner can observe, touch, listen, choose or enter a dimensional portal.

### Canonical actors already reserved by Motion DNA

`piano-siyayo`, `pianinho-magico`, `frondosa`, `leaf`, `branch`, `golden-seed`, `golden-eagle`, `jaguar`, `patita`.

The Iris / celestial opening and explicit dimensional portals are narrative requirements recorded by this map and should receive canonical actor/state identifiers before runtime implementation.

### Integration rule

The golden seed is the continuity object of the journey. Its movement must be able to carry semantic state without pretending that animation itself is assessment evidence.

A portal may route to a Chapter, Question Word, DNA surface, Experience, Piano/Frondosa surface or another approved Academy destination. The destination must come from canonical navigation/capability state; animation must not invent a second navigation authority.

PATITA's recognition of the new seed/DNA should be connected to existing learner/context state when that contract is ready. It must not fabricate profile evidence.

### Access rule

The animated journey and the direct Academy Home are two entrances to the **same SIYAYO universe**:

```text
DIRECT ACCESS ───────┐
                     ├── canonical Academy state
ANIMATED JOURNEY ────┘
```

A learner should never be forced through animation to reach learning content. Reduced-motion accessibility must preserve the same semantic sequence through still/reduced transitions.

### Responsive/layer rule

Animated scenes inherit the SIYAYO surface discipline:

```text
L0 environment / background
L1 persistent global navigation when appropriate
L2 animated semantic scene
L3 contextual interaction / portal / WAIT controls
```

No scene may grow under or collide with persistent controls. Portrait, landscape and reduced-motion behavior must be defined before homologation.

## Development admission rule

Before implementing a new SIYAYO feature, record:

```text
capability
canonical source
runtime owner
visual surface
learner action
evidence produced (or explicitly NONE)
responsive contract
motion/sound contract
WAIT/NEXT behavior
destination / return path
status
```

If one of these is unknown, mark it **OPEN** rather than silently inventing a parallel contract.

## Immediate next canonical pass

Build the **Corpus ↔ Experience Capability Mapping** for the Ten Kinds + Question Words. For each kind, locate Chapter coverage, MASTER scope, corpus source, runtime surface, Experience usage, evidence/skill coverage, visual/dependency representation and responsive state.

The Animated SIYAYO Journey remains visible in every 360° audit as a top-level access/navigation capability while that mapping proceeds.
