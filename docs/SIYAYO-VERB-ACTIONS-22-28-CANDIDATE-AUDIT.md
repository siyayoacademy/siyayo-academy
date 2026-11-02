# SIYAYO Verb Actions 22–28 Candidate Audit

**Branch:** `jaguar/piano-stage-v0.1`  
**Status:** MAPPED — candidates grounded in existing SIYAYO Experiences; not yet canonical Verb Actions.

## Goal

Complete the second Frondosa window from 7 items to 14 items:

```
Group 1 → 1–14
Group 2 → 15–28
```

The visual symmetry is useful, but admission remains pedagogical first. A candidate is admitted only when it has:

- a grounded SIYAYO context;
- EN / ES / PT realization;
- English lemma and morphology;
- compatible verb-function metadata;
- an example sentence suitable for Explore;
- no duplication of an existing canonical Verb Action.

## Proposed grounded candidates

### 22. FIND

Grounded in Nice Party / shopping:

- EN: find
- ES: encontrar
- PT: encontrar
- Example context: “Where can we find the salmon?”
- English morphology: irregular — find → found → found
- Candidate function: action

Why useful: connects Question Words, shopping context, location search and irregular morphology.

### 23. NEED

Grounded in Nice Party quantity questions:

- EN: need
- ES: necesitar
- PT: precisar
- Example context: “How much salmon do we need?”
- English morphology: regular — need → needed → needed
- Candidate function: state/action depending the active canonical treatment

Why useful: expands beyond visible physical actions and prepares modal/necessity contrasts without confusing NEED with MUST.

### 24. SERVE

Grounded in Nice Party dinner preparation:

- EN: serve
- ES: servir
- PT: servir
- Example context: “We serve them fresh.”
- English morphology: regular — serve → served → served
- Candidate function: action

Why useful: continues the dinner narrative after BUY / COOK and gives a clean regular pattern.

### 25. ARRIVE

Grounded in College narrative:

- EN: arrive
- ES: llegar
- PT: chegar
- Example context: “We arrived, listened to the teacher and started studying.”
- English morphology: regular — arrive → arrived → arrived
- Candidate function: movement/action

Why useful: broadens Movement beyond GO / COME / WALK / RUN and connects directly to the College universe.

### 26. BEGIN

Grounded in College toroidal continuation:

- EN: begin
- ES: empezar
- PT: começar
- Example context: “We begin studying together.”
- English morphology: irregular — begin → began → begun
- Candidate function: action

Why useful: strong irregular morphology and natural bridge into sequences / routines / phase changes.

### 27. UNDERSTAND

Grounded repeatedly in College learning:

- EN: understand
- ES: entender
- PT: entender
- Example context: “How can we understand this lesson better?”
- English morphology: irregular — understand → understood → understood
- Candidate function: state/action pending canonical function decision

Why useful: expands the corpus from physical action toward cognition, useful for adaptive diagnostics and learning contexts.

### 28. SHARE

Grounded in College note-taking interaction:

- EN: share
- ES: compartir
- PT: compartilhar
- Example context: “Who would like to share a note?”
- English morphology: regular — share → shared → shared
- Candidate function: action

Why useful: social/communicative action, classroom interaction, and a clean regular pattern.

## Proposed balance

Existing second window (15–21):

```
come
run
buy
choose
cook
open
close
```

Candidate extension (22–28):

```
find
need
serve
arrive
begin
understand
share
```

Result:

```
Group 2 = 15–28 = 14 items
```

This creates a useful mix of:

- movement
- shopping
- food/dinner
- cognition
- classroom interaction
- regular morphology
- irregular morphology

## Admission boundary

These seven are **candidates, not canonical Verb Actions yet**.

Before code admission, the canonical corpus must receive explicit records for each item with:

- `id`
- `lemma`
- `translations`
- `verbFunction`
- optional `verbClass`
- `regularity`
- `forms`
- `tags`

and the trilingual Explore corpus must receive a suitable example + targetWords entry.

## Protected implementation sequence

```
CANDIDATE AUDIT
→ canonical admission
→ validate corpus
→ Piano imports 28
→ Group 1 = 1–14
→ Group 2 = 15–28
→ Explore test
→ Morphology EN test
→ HOMOLOGATE 28-item corpus
```

Do not add the seven only inside `piano.js`; that would create a second unofficial verb universe.


## Admission result

Status: **CANONICALLY ADMITTED; PIANO IMPLEMENTED; awaiting Stage homologation**.

The seven audited candidates were admitted to the canonical verb corpus and received canonical sentence/subject form files. Corpus Integrity, Verb Explorer Adaptive Bootstrap and Resume Runtime Dispatch passed before Piano admission.

The Stage target is now active:

```
Group 1 → 1–14
Group 2 → 15–28
```
