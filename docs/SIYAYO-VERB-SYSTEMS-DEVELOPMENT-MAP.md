# SIYAYO Verb Systems Development Map

**Branch:** `jaguar/piano-stage-v0.1`  
**Status:** MAPPED — implementation intentionally deferred until language-specific contracts are available.

## Purpose

Define how Verb morphology, function, time, sentence form, modal/auxiliary structure, and actor orchestration may enter the Piano Stage without collapsing distinct linguistic dimensions or overwriting already homologated Stage behavior.

## Canonical sources inspected

- `data/lexicon/verbs/actions.json`
- `data/schemas/verb.schema.json`
- `data/nodes/action.json`
- `data/grammar/verb-grid.json`
- `js/xespirito-diagnostics.js`

## Critical finding

The current `regularity` field in the canonical lexical verb corpus is explicitly an **English lexical morphology classification**.

The schema states that this value must **not** be treated as a universal EN/ES/PT classification.

Therefore:

```
regularity(en)
≠ automatically regularity(es)
≠ automatically regularity(pt)
```

No Stage implementation may color or label Spanish or Portuguese verbs as Regular/Irregular by copying the English field.

Until independent ES/PT morphology contracts exist, Regular/Irregular Stage behavior must remain:

```
EN → eligible for grounded implementation
ES → WAIT for canonical language-specific morphology
PT → WAIT for canonical language-specific morphology
Tripiano → WAIT for cross-language regularity comparison
```

## Orthogonal verb dimensions

### A. Lexical morphology

Question answered: **How does this verb form change?**

Current grounded EN values:

- regular
- irregular

Visual candidate:

- Regular → uniform branch/contour behavior
- Irregular → alternate branch/bifurcation marker

Rules:

- irregular never means incorrect;
- color is never the sole cue;
- morphology does not redefine semantic verb function;
- morphology does not replace tense.

### B. Verb function

Question answered: **What function is the verb expressing in this context?**

Current canonical function axis includes:

- quality
- state
- movement
- action
- existence

Optional pedagogical/system labels remain separate:

- routine
- modal
- conditional

Important current-source clarification:

`action.json` states that Routine is currently treated as an application of Action rather than an independent core verb-function in that source.

Therefore future Stage labels must follow the active canonical source rather than silently forcing an older taxonomy over it.

### C. Time / tense / aspect

Question answered: **When / over what temporal structure does the event unfold?**

Keep separate from morphology and function.

Protected future visual channel:

```
PAST —— PRESENT —— FUTURE
```

or an orbital/timeline surface.

Do not use the Regular/Irregular aura to represent time.

### D. Sentence form

Question answered: **How is the sentence framed?**

- affirmative
- negative
- interrogative

These are sentence states, not permanent lexical properties.

### E. Auxiliary / modal system

Question answered: **Which structural carrier / modal force organizes the lexical verb?**

Protected actor: **Xespirito**.

Current canonical system includes:

- DO
- BE
- HAVE
- CAN
- COULD
- MAY
- MIGHT
- MUST
- SHALL
- SHOULD
- WILL
- WOULD

Xespirito should organize the auxiliary/modal layer without replacing the lexical verb.

Example:

```
[Xespirito: SHOULD]
        ↓
      CHOOSE
```

### F. Language realization

Question answered: **How does the current concept actually realize in EN / ES / PT?**

Each language requires independent canonical morphology and structure.

Forbidden shortcut:

```
English morphology
→ translate labels
→ assume Spanish/Portuguese equivalence
```

Required pattern:

```
shared pedagogical concept
↓
EN canonical realization
ES canonical realization
PT canonical realization
```

## Visual channel allocation

To prevent future control overload, one visual channel must not carry two unrelated meanings.

Proposed allocation:

- Frondosa focal word → lexical item
- branch labels → active pedagogical dimension
- aura/background → one global contextual property only
- contour/icon/motion → secondary accessible cue
- timeline/orbit → time
- Xespirito → auxiliary/modal organization
- Piano → structural/musical anchor
- Pianinho → call-response / melody / interactive cue

Only one pedagogical dimension should expand as the primary branch set at a time.

## Large collections

Use the existing Grouping Contract.

```
GROUP = pagination/window
GROUP ≠ regularity
GROUP ≠ verb function
GROUP ≠ tense
GROUP ≠ sentence form
```

The same contract is reserved for Adjectives and ABC/alphabet queues.

## Adjectives protected preview

Two axes must remain separate:

### Semantic valence
- positive
- neutral
- negative

### Degree
- positive/base
- comparative
- superlative

Do not use one button/color state for both axes.

## Admission order for Verb Systems

1. Homologate current Verb Actions grouped Explore.
2. Map and implement **EN-only Regular/Irregular morphology view** from the grounded corpus.
3. Keep ES/PT regularity at WAIT until canonical morphology exists.
4. Map Verb Function as a separate activity/surface.
5. Map Time/Tense as a separate timeline/orbit.
6. Map Sentence Form separately.
7. Map Xespirito auxiliary/modal interaction.
8. Only after those contracts are stable, combine dimensions inside explicit Experiences.

## Required tests for each new verb dimension

- current collection remains stable;
- current item remains stable when changing only the new dimension;
- language switch does not invent unsupported morphology;
- exact semantic resonance remains one-item;
- Group navigation does not alter classification;
- actor role is contextual, not permanent;
- no presentation state becomes Evidence or GREEN automatically;
- Portrait / Auto / Landscape remain visually distinct and readable.

## WAIT conditions

Stop implementation when:

- ES/PT morphology is missing but the UI would imply it exists;
- a proposed control mixes two grammatical dimensions;
- a new visual treatment overwrites an existing meaning;
- Xespirito would replace rather than organize the lexical verb;
- a new activity requires evaluation authority not yet connected;
- a “cleanup” would remove a homologated Stage branch.

## Current NEXT GO

After current Verb Actions homologation:

```
FIRST
→ implement EN-only Regular / Irregular visual morphology layer
→ with explicit EN scope
→ no ES/PT inference
→ no evaluation

THEN
→ audit ES/PT canonical morphology sources
→ only expand when grounded
```


## Homologated checkpoint

`PIANO-STAGE-VERB-MORPH-EN-02` is now HOMOLOGATED.

## 28-item corpus expansion candidate checkpoint

See:

`docs/SIYAYO-VERB-ACTIONS-22-28-CANDIDATE-AUDIT.md`

Candidate set:

`find, need, serve, arrive, begin, understand, share`

Target:

`Group 1 = 1–14`, `Group 2 = 15–28`.

These remain candidates until canonical corpus admission.


## Verb Function checkpoint — PIANO-STAGE-VERB-FUNCTION-01

Canonical audit:

`docs/SIYAYO-VERB-FUNCTION-28-AUDIT.md`

Status: **IMPLEMENTED — awaiting homologation**.

The Activity `Verbs → Function` reads the existing `verbFunction` field rather than inferring function from morphology or surface wording.

Current grounded coverage: Action, Movement, State.

Reserved canonical axis members: Quality, Existence.

Function overlap is explicitly allowed.

## Corpus scale roadmap

Minimum product direction: **200 canonical verbs**.

Windowing remains fixed at 14 items. The first complete window milestone above 200 is 210.

No Stage-only verb may be created to fill a visual window.
