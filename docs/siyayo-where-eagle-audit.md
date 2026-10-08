# WHERE — Eagle Audit and Assessment Readiness Map

Date: 2026-10-04 (America/Sao_Paulo)  
Branch: `jaguar/verb-explorer-resume-live-wire`

## Scope

This is a study/audit checkpoint only. It does not create a WHERE assessment skill, Session, Evidence rule, Pass Contract, Green Pass authority, Dependency graph, answer grounding, or navigation.

## Canonical capability

- QWord: `where`
- Capability skill: `where.identify.place`
- Capability role: information-gap opportunity
- Evidence: none from presence alone
- Assessment skill: **not declared**
- Assessment target: **absent** in current Dinner and College WHERE entries

## Semantic finding

WHERE belongs to a broader **spatial-target** family with at least two distinct subtypes:

### 1. Location

Question asks where something is found, situated, or placed.

Dinner S1 — Shopping:
- EN: Where can we find the salmon?
- ES: ¿Dónde podemos encontrar el salmón?
- PT: Onde podemos encontrar o salmão?
- grounded dialogue answer:
  - EN: at the fish counter
  - ES: en la sección de pescado
  - PT: na seção de peixes

Dinner S2 — Preparing:
- EN: Where should we put the vegetables?
- ES: ¿Dónde debemos poner las verduras?
- PT: Onde devemos colocar os legumes?
- current gap: no canonical answerGrounding, dialogueForms, Dependency Focus or diagnostic structure.

### 2. Destination

Question asks for the endpoint/direction of movement.

College — Going to College:
- EN: Where are you going?
- ES: ¿Adónde vas?
- PT: Para onde você está indo?

The EN surface form `where` covers both location and destination. ES/PT may lexicalize the distinction explicitly (`dónde` vs `adónde/a dónde/para dónde`; `onde` vs `aonde/para onde`).

## Assessment consequence

Do **not** define WHERE as a generic “place” evaluator.

Recommended common semantic family:

`spatial-target`

Candidate first contract, if later authorized:

1. `spatial-function`
   - recognizes WHERE as requesting spatial information.
2. `location-answer` / local
   - grounded first in Shopping S1.
3. `location-answer` / transfer
   - candidate Preparing S2, but **WAIT** until its answer grounding and dependency structure exist.

This first contract should explicitly **not claim**:
- destination-use,
- preposition mastery,
- movement-verb mastery,
- cross-language equivalence,
- Green for College WHERE.

College destination should later become either:
- a second WHERE subtype contract, or
- an advanced transfer/contrast requirement after location is stable.

## Current grounded assets

Shopping WHERE:
- QWord/intention: yes
- EN/ES/PT question: yes
- dialogueForms Present/Past/Future × Affirmative/Negative/Interrogative: yes
- contextual location answer: yes, via dialogueForms
- Dependency Focus: no
- diagnostic head probe: no
- answerGrounding: no
- assessmentTarget: no

Preparing WHERE:
- QWord/intention: yes
- EN/ES/PT question: yes
- dialogueForms: no
- canonical answer: no
- Dependency Focus: no
- diagnostic: no
- answerGrounding: no
- assessmentTarget: no

College WHERE:
- QWord/intention: yes
- EN/ES/PT question: yes
- destination contrast: yes
- canonical destination is inferable from Experience situation/title, but not encoded as assessment answerGrounding
- Dependency Focus: no
- diagnostic: no
- assessmentTarget: no

## Required next grounding before evaluator

1. Define a canonical answer for Preparing WHERE from authored corpus — do not invent container/surface.
2. Add reusable spatial vocabulary/preposition corpus only if needed by that authored answer.
3. Create canonical dependency structures for Shopping WHERE and Preparing WHERE in EN/ES/PT.
4. Add observational diagnostics from those structures; diagnostics remain outside 0/3.
5. Add explicit answerGrounding for Shopping and Preparing WHERE.
6. Decide exact local/transfer modes.
7. Only then author a skill definition + Pass Contract.
8. Only after the skill exists, add assessmentTarget to the chosen origin.
9. Keep College destination outside the first Green claim unless separately authorized.

## Eagle question

For every WHERE surface ask:

> Is this screen showing LOCATION or DESTINATION, and does the active assessment contract claim exactly that subtype?

If not, preserve exploration/WAIT.
