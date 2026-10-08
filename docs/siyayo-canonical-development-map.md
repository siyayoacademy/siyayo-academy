# SIYAYO CANONICAL DEVELOPMENT MAP

Version: 1.1  
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

### Gold Seed — variante futura com vídeo

**Registro:** `JGS-VIDEO-PLAN-20261008` · 2026-10-08.  
**Status:** PLANEJADO — aguardando roteiro final e homologação de todos os arquétipos finais.

A ordem definida pelo usuário é concluir o passo a passo da Jornada em desenvolvimento e homologar os arquétipos antes de produzir a variante com animação pré-renderizada, controlador WAIT/swipe e camada HTML interativa. O método inicial recomendado usa um clipe por transição e uma imagem correspondente para cada WAIT.

O plano inclui storyboard retrato/paisagem, contatos e pouso coerentes, manifesto de mídia/portais, retorno à mesma parada, acessibilidade, piloto W3 → W4, homologação em dispositivos e integração futura ao portfólio da **Agência SIYAYO Academy Fine Digital Art**.

Procedimentos e decisões OPEN: [SIYAYO-GOLD-SEED-VIDEO-ROADMAP](SIYAYO-GOLD-SEED-VIDEO-ROADMAP.md). Registro máquina: `animatedJourney.videoAnimationRoadmap`. Esta é uma decisão de roadmap, sem produção ou integração de vídeo realizada; preserva o acesso direto e as autoridades canônicas de navegação, Evidence e Green.

## GOLD CONNECTION — Tri-Language Verb Explorer adaptive expansion DNA

The label already present in the Explorer is architectural, not ornamental:

`SIYAYO ACADEMY · GOLD CONNECTION`  
`Tri-Language Verb Explorer`

GOLD CONNECTION names the reusable connection between **large canonical knowledge**, **Thinking Mind opportunities**, **explicit assessment authority**, **learner evidence** and **TORO expansion**.

The Academy may grow toward encyclopedia-scale interactivity without turning every visible word or question into simultaneous assessment.

### Expansion grammar

```text
CANONICAL CORPUS
      ↓
CAPABILITY AVAILABLE
      ↓
THINKING MIND OPPORTUNITY
      ↓
CONTRACT AUTHORITY?
      ↓
EXPLICIT EXPERIENCE ASSESSMENT TARGET?
      ↓
LEARNER ACTION
      ↓
ATTEMPT
      ↓
EVIDENCE
      ↓
PASS CONTRACT
      ↓
WAIT or GREEN
      ↓
TORO EXPANSION
```

The gates are deliberately separate.

- **Capability** means the learner may encounter, explore, listen to, compare or practice a meaningful opportunity.
- **Contract Authority** means the skill is mature enough to make contractual pedagogical claims.
- **Assessment Target** means this specific Experience explicitly chooses that authorized skill for assessment.
- **Evidence** means an observed learner action with valid learner, skill, language, origin, occurrence and support provenance.

Therefore:

```text
content present        ≠ assessment active
capability present     ≠ contract authorized
contract authorized    ≠ assessment targeted
visual exploration     ≠ learner evidence
navigation             ≠ Session transition
animation              ≠ evidence
Green Pass             ≠ automatic NEXT
```

### TORO as adaptive expansion

TORO is not a fixed lesson sequence. It is the controlled expansion of meaningful opportunities around a stable learner identity and evidence core.

```text
CENTER
  learner identity
  profile
  assessment scope
  evidence history

RINGS
  Experiences
  Question Words
  verbs
  nouns
  adjectives
  other word types
  perspectives
  semantic contexts

OPENINGS
  capabilities exposed by Thinking Mind + corpus

GATES
  Contract Authority + explicit assessmentTarget

SEEDS
  observed learner evidence

GREEN
  confirmed Pass Contract

NEW RING
  new Experiences, contrasts, lexical families and QWords
```

A learner can therefore expand non-linearly. One learner may confirm WHAT and WHERE while still reinforcing WHICH; another may progress through WHY and HOW first. The system does not need to force every learner through one identical list.

### Encyclopedia-scale corpus, narrow authority

A large inventory of verbs, adjectives, nouns, Question Words, prepositions, perspectives and contexts may exist simultaneously in canonical corpus.

That abundance is desirable.

It does **not** mean every item should gain its own evaluator immediately.

The intended architecture is:

```text
many verbs
many adjectives
many nouns
many QWords
many Experiences
        ↓
structured reusable corpus
        ↓
contextually exposed opportunities
        ↓
small explicitly authorized assessment surface
        ↓
profile-sensitive expansion
```

This allows the Tri-Language Verb Explorer to become increasingly encyclopedic while preserving pedagogical precision.

A new verb can become interactive as soon as an Experience needs it. An adjective can participate in semantic comparison before it owns a dedicated skill. A Question Word can be visible and useful for years before its Green Pass contract is mature. Corpus richness and assessment maturity evolve independently.

### Profile-sensitive expansion

Adaptive behavior should change the **field of opportunities**, not merely choose a different static lesson.

The learner profile may influence which capability is:

- visible,
- emphasized,
- practiced,
- assessed,
- reinforced,
- transferred,
- confirmed,
- or left in WAIT.

The profile must never fabricate competence. Expansion is driven by evidence plus explicit authority.

### GOLD CONNECTION and the archetypes

The same architecture gives the current archetypes concrete system roles:

```text
THINKING MIND
  sees meaningful information needs

JAGUAR
  executes the next precise validated step

EAGLE
  audits coherence across visual state,
  assessment scope and authority

PATITA
  remembers the observed path

GOLDEN SEED
  atomic grounded knowledge / evidence

FRONDOSA
  accumulated and expanding capability structure

TORO
  return + integration + outward expansion
```

These are not separate evidence authorities. They are perceptual, operational or narrative views over the same canonical learning system.

### Branch and page inheritance rule

Every new SIYAYO branch, page or interactive surface should grow under this same GOLD CONNECTION contract.

A new implementation must not create an independent mastery, score, progression, routing or Green authority merely because it introduces new content.

Before a capability becomes evaluative, the development path should be:

```text
canonical content
→ capability
→ Experience grounding
→ skill definition
→ Pass Contract
→ Specification / Result / Evidence / Attempt
→ AssessmentScope / Coordinator dry-run
→ Contract Authority admission
→ explicit assessmentTarget
→ live assessment surface
→ Green / WAIT
```

This staged path is the reusable expansion DNA for the Ten Kinds, Question Words, Verb DNA, future Experiences, Frondosa/Piano surfaces and other Academy branches.

---

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

## Canonical audit artifacts

- `docs/siyayo-corpus-experience-capability-matrix.md` — Ten Kinds + Question Words audit connecting A5, MASTER depth, reusable corpus, Experience/Toro, evidence maturity and the next canonical action.

Current first executable gap discovered by that matrix: **Chapter 01 NOUN lacks the explicit `chapterScope` / `masterScope` metadata contract already present in Chapters 02–10.**
