# SIYAYO Stage Development Contract

**Branch:** `jaguar/piano-stage-v0.1`  
**Purpose:** preserve the historical implementation logic, homologated behavior, visual contracts, and forward-development rules of the SIYAYO Piano Stage so later work extends the tree without silently cutting already validated branches.

## 1. Operating rule

Before any new implementation:

1. Read this contract.
2. Read `data/stage/siyayo-stage-participation-map.json`.
3. Identify the active collection, activity, language lens, actor roles, learner action, evidence role, and destination.
4. Preserve every homologated invariant unless a new change explicitly supersedes it.
5. If a proposed change conflicts with a homologated rule, stop at WAIT and document the conflict before coding.
6. After implementation, update both this contract and the Stage Participation Map with the new state: planned → implemented → tested → homologated.

A new implementation must **extend** an existing branch or explicitly deprecate it. It must never erase a working branch merely because a new surface or routine was introduced.

## 2. Core invariants

### 2.1 Stage vs pedagogical authority

The Stage presents, orchestrates, speaks, animates, offers support, and captures explicit learner action.

The Stage does **not** manufacture canonical evaluation.

Keep distinct:

- presentation
- learner choice
- canonical source
- Evidence
- GREEN / Green Pass
- navigation authority

A local visual choice is not evidence by itself.

### 2.2 Exact semantic identity beats shared musical identity

When the exact semantic item is known, only that semantic item receives semantic resonance.

Shared musical note identity may still produce musical resonance, but it must not illuminate unrelated semantic leaves.

Examples already homologated:

- Nouns: exact noun resonance.
- Verbs: exact verb resonance.
- 14 Questions: exact Question Word resonance.
- Black chromatic keys: global actor aura, never fake semantic leaves.

### 2.3 Language is a lens, not authority

EN, ES, and PT are canonical language realizations, not automatic translations derived from one master phrase.

Tripiano is a language sequence capability, not a pedagogical authority.

Changing language must not silently change:

- active collection
- active activity
- assessment authority
- learner choice
- canonical source
- current item, unless the active Experience explicitly requires it

### 2.4 Context determines function

Do not permanently equate surface form with grammatical function.

The same visible word may serve different functions in different contexts.

Future implementations must preserve:

```
form + current context → current function
```

not:

```
form = permanent function
```

## 3. Homologated Stage routing

Current visual/pedagogical sequence:

```
Collection
→ Activity
→ Contextual Activity Surface
→ Listen / Language
→ Status
→ Instrument
```

Current collection bindings:

- Question Words → Explore, 14 Questions
- Nouns → Explore, Classify
- Verbs → Explore
- Semantic Cadence → contextual-only

Activities are contextual capabilities. They must not become permanent unrelated buttons.

## 4. Frondosa contract

Frondosa is a reusable semantic/perceptual surface.

Approved roles include:

- semantic surface
- speak word
- speak example
- support surface
- context reveal
- exact semantic resonance
- visual/silent resonance
- classification branches
- language sequence
- future contextual structure labels

Frondosa must **change role by activity** instead of accumulating every possible control at once.

Recommended visual grammar:

```
TRUNK / focal surface
= current word or concept

PRIMARY BRANCHES
= current pedagogical dimension

LEAVES
= choices/items of that dimension

AURA / BACKGROUND
= global contextual property

ORBIT / TIMELINE
= temporal progression

ACTORS
= auxiliary/functional agents
```

Only the active pedagogical dimension should expand.

## 5. Grouping / queue contract for large collections

Large collections are presented in Frondosa-sized windows.

Current implementation:

- Verbs Group 1 → 1–14
- Verbs Group 2 → 15–21

Reusable targets:

- Adjectives
- ABC / alphabet
- other large word collections

Invariant:

```
GROUP = pagination/window
GROUP ≠ grammatical classification
```

A group must never secretly mean Regular, Irregular, Positive, Negative, etc.

Changing group only changes the visible collection window. It does not create Evidence, GREEN, or assessment.

## 6. Question Words contract

Homologated behavior:

- 14 semantic Question Words on Frondosa.
- Question Words may be explored independently.
- 14 Questions is a contextual Activity, not a language mode.
- EN / ES / PT remain pedagogical language lenses during 14 Questions.
- Flow:
  Question → WAIT → learner agency/support → explicit response → OBSERVED → external evaluation request.
- Context Support may reveal and speak situation + concrete question.
- WAIT archetypes are presentation/support only.
- No local GREEN.
- No fake Evidence.
- Canonical navigation is requested externally; no second local router.

## 7. Nouns contract

### 7.1 Explore

Canonical layers:

- Concrete
- Abstract
- Proper

Layers are classifications, not pagination groups.

EN / ES / PT / Tripiano may present the same canonical noun item through their own language realization.

### 7.2 Classify

Homologated distinctions:

```
learner choice
≠ canonical source
≠ evaluation
```

Frondosa Classify role:

- focal noun
- Concrete branch
- Abstract branch
- Proper branch

Buttons and Frondosa branches are synchronized.

Learner choice receives one visual state.

Canonical source reveal receives a distinct visual state.

Relational speech is allowed, for example:

- EN: “Love is an abstract noun.”
- ES: “Amor es un sustantivo abstracto.”
- PT: “Amor é um substantivo abstrato.”

When spoken immediately after learner choice, this verbalizes the learner's selected relation and must not be treated as canonical correctness.

When Source is explicitly revealed, the canonical relation may be spoken as source presentation.

Next noun clears learner-choice/source state and preserves the activity.

## 8. Verb Actions contract

Current canonical corpus: 21 trilingual Verb Actions from `data/lexicon/verbs/action-examples.json`.

Current Stage state:

- Explore only.
- Two visual groups: 1–14 and 15–21.
- Exact one-item semantic resonance.
- EN / ES / PT / Tripiano presentation.
- Example sentence presentation.
- No tense transformation yet.
- No regular/irregular classification yet.
- No modal/auxiliary transformation yet.
- No local evaluation.

## 9. Future Verb Systems — protected architecture

Verb development must preserve **orthogonal dimensions**.

Do not collapse these into one taxonomy:

### 9.1 Lexical / morphology dimension

- Regular
- Irregular

Possible visual language:

- Regular → uniform/predictable branch behavior
- Irregular → distinct bifurcation/pattern marker

Irregular must never be visually framed as “wrong”.

Color alone is insufficient; combine color with contour, icon, branch motion, or another accessible cue.

### 9.2 Function dimension

Candidate functions already established in SIYAYO methodology:

- Quality
- State
- Movement
- Existential
- Routine
- Modal
- Conditional

Function is contextual and must not be permanently glued to a word form.

### 9.3 Time dimension

- Present
- Past
- Future
- Present Period
- Past Period
- Future Period

Prefer a separate timeline/orbit rather than reusing the Regular/Irregular visual channel.

### 9.4 Sentence-form dimension

- Affirmative
- Negative
- Interrogative

These are sentence/form states, not permanent lexical properties.

### 9.5 Modal / auxiliary dimension

DO / BE / HAVE and modal core must remain distinguishable from the lexical verb.

Xespirito may embody the auxiliary/modal layer so the interface does not become a wall of permanent buttons.

Example:

```
[Xespirito: SHOULD]
        ↓
      CHOOSE
```

Modal force/intention and lexical action remain separate.

### 9.6 Language-specific realization

Never assume one morphological transformation is equivalent across EN, ES, and PT.

Use:

```
canonical concept
↓
language-specific realization
```

English regularity, Spanish conjugation, and Portuguese conjugation require their own verified realization.

## 10. Future Adjectives — protected architecture

Do not conflate:

### Semantic valence

- positive
- neutral
- negative

with:

### Degree

- positive/base degree
- comparative
- superlative

These are different dimensions and require different visual channels.

Large adjective inventories should reuse the Grouping Contract.

## 11. ABC / alphabet future contract

The alphabet may be presented as ordered groups/windows rather than overcrowding Frondosa.

Alphabet group navigation is pagination/sequence only; it must not be mistaken for semantic or grammatical classification.

## 12. Actor contract

### Piano Plano

Tendency:

- structural anchor
- harmony/accompaniment
- note/chord anchor
- visual resonance

### Pianinho Mágico

Tendency:

- melody
- interactive response
- call-and-response
- learner-facing playful agent

### Frondosa Sombreira

Tendency:

- semantic surface
- speech
- contextual guide
- classification/relationship visualization

### Xespirito

Reserved future role:

- auxiliary/modal organization
- verb-system helper
- structure without replacing the lexical verb

Roles are tendencies, not prisons. Experience bindings may temporarily assign capabilities.

## 13. Visual accessibility rules

- Color must never be the only carrier of meaning.
- Avoid overlap.
- Avoid text truncation when an adaptive label treatment is possible.
- Portrait may use its own wrapping/layout rules.
- Auto/Landscape behavior must not be sacrificed to fix Portrait.
- Exact semantic focus should visually differ from global musical resonance.
- Choice, source, WAIT, Evidence, and GREEN require distinguishable visual semantics.

Terminology:

- overlap = elements visually occupy the same area
- spacing issue = insufficient distance without actual overlap
- alignment issue = elements do not share the intended visual axis
- overflow = content exceeds its container
- truncation = visible text is shortened/clipped

## 14. Historical implementation checkpoints

### Stage foundation — homologated

- reusable `/piano/` stage
- Piano Plano
- Pianinho Mágico
- Frondosa Sombreira
- chromatic keyboard
- EN / ES / PT / Solfege / Sound / Tripiano
- responsive Auto / Portrait / Landscape

### Question Words — homologated

- 14 Frondosa leaves
- exact semantic identity
- trilingual 14 Questions flow
- WAIT/support/context surface
- learner response boundary
- external evaluation request boundary

### Nouns Explore — homologated

- canonical Concrete / Abstract / Proper layers
- trilingual speech
- exact semantic resonance

### Nouns Classify — implemented and visually tested

- focal noun + 3 Frondosa classifier branches
- synchronized branch/button choice
- learner choice vs canonical source distinction
- relational trilingual speech
- Next noun state reset
- no local evaluation

### Stage visual hierarchy — homologated in current pass

- Collection → Activity → Contextual Surface → Listen/Language → Status → Instrument
- Portrait control overlap corrected

### Verb Actions — current active development

- full 21-item canonical corpus admitted
- groups 1–14 / 15–21
- exact semantic resonance
- Portrait fit improved
- Explore-only pending full homologation across EN / ES / PT / Tripiano

## 15. Change-state ledger

Every future feature should move through:

```
REGISTERED
→ MAPPED
→ IMPLEMENTED
→ TESTED
→ HOMOLOGATED
```

Optional states:

```
WAIT
BLOCKED
DEPRECATED
SUPERSEDED
```

A feature marked HOMOLOGATED must not be silently removed or semantically repurposed.

## 16. Current NEXT order

1. Homologate Verb Actions groups 1–14 and 15–21 in EN / ES / PT / Tripiano.
2. Confirm exact one-item Frondosa resonance for all Verb Action groups.
3. Preserve Grouping Contract for Adjectives / alphabet / other large collections.
4. Map Verb morphology layer before implementing Regular / Irregular.
5. Map Verb Function, Time, Sentence Form, and Modal/Auxiliary as separate dimensions.
6. Bind Semantic Cadence only where an Experience explicitly needs it.
7. Admit Nice Party contextual vocabulary/accessories.
8. Prototype Perspective Shift.
9. Prototype Social Identity.
10. Audit each remaining Kind of Word before activation.

## 17. Protection clause

If a future implementation proposes to remove, merge, rename, or repurpose a homologated branch:

- identify the exact rule/checkpoint affected;
- explain why the old behavior is insufficient;
- define migration behavior;
- obtain explicit GO;
- update this contract before or in the same change set.

No “cleanup” may delete a homologated pedagogical branch merely because it appears redundant from a local code perspective.

The tree may grow new branches. Existing homologated branches are preserved unless consciously superseded.
