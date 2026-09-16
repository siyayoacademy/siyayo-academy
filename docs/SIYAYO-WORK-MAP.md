# SIYAYO ACADEMY — WORK MAP

> Canonical human-readable continuity map for active development.  
> Purpose: preserve the exact thread of work across Chat, Work, devices, connection interruptions and parallel research conversations.

## Recovery rule

When continuity is uncertain, do not reconstruct the project from chat memory alone.

1. Read this map.
2. Verify the active branch and current HEAD in GitHub.
3. Verify the latest relevant CI result.
4. Re-read the contracts/files named by the current checkpoint.
5. Resume only from `NEXT GO`.
6. If repository evidence conflicts with this document, repository evidence wins and this map must be corrected before implementation continues.

A chat conversation is not a branch. A branch represents an independent implementation line. Research/discussion can remain parallel without creating a branch until it starts producing independent code changes.

---

# ACTIVE CHECKPOINT — JAGUAR-LIVE-00

**Status:** ACTIVE  
**Recorded:** 2026-09-16  
**Repository:** `siyayoacademy/siyayo-academy`  
**Active branch:** `jaguar/verb-explorer-resume-live-wire`  
**Base:** `main`  
**Last known branch relation:** ahead of `main`, no known commits behind at checkpoint inspection.  
**Last contractual CI:** GREEN reported after adaptive contrast CI integration.

## DONE — contractual adaptive cycle

The current contractual cycle is closed.

Grounded chain:

```text
longitudinal evidence A(K)
  -> AdaptiveEvidenceProfile
  -> recommendation: review-pattern
  -> Decision focus: contrast-review
  -> ContrastReviewBoundary
  -> ProbeDefinition(K)
  -> observed LearnerEvent / occurrenceId
  -> ProbeResult
  -> InterferenceContrastVerifier
  -> verified evidence B(K)
  -> InterferenceAdaptiveBridge
  -> AdaptiveEvidenceProfile
  -> pending state re-derived from longitudinal history
```

Important distinction:

```text
K            = linguistic pattern identity
occurrenceId = observed learner-action identity
```

History is preserved. Pending pedagogical state is derived from history; handling a pattern does not delete historical evidence.

## CURRENT CYCLE — LIVE RUNTIME

Goal: discover the exact productive browser/UI seam that can ground a real `contrast-review` microinteraction without fabricating pedagogical authority.

### FIRST — READ ONLY

Locate where the current live runtime can encounter:

```text
Decision.focus === 'contrast-review'
```

and determine whether an existing concrete UI interaction can provide the required ProbeDefinition authority and observed learner response.

No live wiring before this audit is complete.

## NEXT GO

Read-only audit of the exact branch runtime/UI around `contrast-review`, Xespirito evidence, Leaf/Guided/microchallenge surfaces and existing learner-event producers. Identify the smallest real productive seam. If no existing producer exists, record the missing authority explicitly before designing a new one.

## WAIT / PERAÍ — invariants

- No automatic NEXT or automatic restart.
- Green Pass is not automatic Session termination.
- Resume is not Session termination.
- Eligible opportunity is not Session termination.
- Do not silently replace `session.decision` inside an active Session.
- A new structural Decision belongs to a new Session after an explicitly grounded transition.
- Do not call `Coordinator.clear()` from Green Pass, Resume, click, bootstrap reload or currentExperience mutation.
- Attempt is created only at observed learner-event time.
- Missing canonical Skill is a legitimate pre-contract WAIT; do not invent Skill.
- Legacy `verb-function` fallback may remain operational but is not canonical pedagogical resolution.
- Do not add canonical Skill to Experience schema and do not infer Skill from Experience.
- Do not treat the Green Pass contract allowlist as a target selector.
- Do not put identity attributes, PII or raw external provider IDs into pedagogical evidence/events.
- Learner identity must be canonical before entering the adaptive chain.
- `AdaptiveEvidenceProfile` is longitudinal history; it is not the active Session and does not itself authorize NEXT.
- EvidenceView informs; EvidenceProfile interprets; Orchestrator decides; PedagogicalResonance finds compatibility; none alone authorizes NEXT.
- `canonicalForm.valid` is not `meaningCorrect`.
- Contextual choice score is not automatically `meaningCorrect`.
- LearnerEvent choice is not selectedLanguage; selectedLanguage must come from an authoritative selected alternative.
- K belongs to ProbeContext/pattern provenance, not LearnerEvent.
- `occurrenceId` identifies the observed learner action, not the linguistic pattern.
- Do not reuse the dinner cheese Choice interaction as a multilingual contrast probe unless an explicit contract proves that modality.
- Do not treat CI GREEN as proof that live browser/UI wiring exists.

## CONTRACTS TO RECHECK BEFORE LIVE WRITES

- `js/adaptive-contrast-review-boundary.js`
- `js/adaptive-contrast-probe-definition.js`
- `js/adaptive-contrast-probe-result.js`
- `js/interference-contrast-verifier.js`
- `js/interference-adaptive-bridge.js`
- `js/adaptive-evidence-profile.js`
- `js/adaptive-pedagogical-orchestrator.js`
- `js/verb-explorer-learner-event.js`
- `js/verb-explorer-adaptive-coordinator.js`
- `js/verb-explorer-adaptive-composer.js`
- `js/verb-explorer-adaptive-bootstrap.js`

## TEST ANCHORS

- `scripts/test-adaptive-contrast-review-boundary.js`
- `scripts/test-adaptive-contrast-probe-definition.js`
- `scripts/test-adaptive-contrast-probe-result.js`
- `scripts/test-adaptive-evidence-profile.js`
- `scripts/test-interference-longitudinal-cycle.js`
- `scripts/test-contrast-probe-longitudinal-cycle.js`

---

# PARALLEL WORK TREE

## A. Adaptive Runtime / Jaguar

**Branch:** `jaguar/verb-explorer-resume-live-wire`  
**State:** ACTIVE implementation line.  
**Checkpoint:** `JAGUAR-LIVE-00`.  
**Current work:** Live Runtime contrast-review audit.

## B. SIYAYO presentation / audiences / profiles

**State:** parallel research and product/presentation design.  
**Branch:** none required while discussion/research only.  
**Branch rule:** create a dedicated branch when this line begins producing independent repository changes that should not be mixed with adaptive runtime work.

Possible future branch naming family:

```text
presentation/<specific-scope>
```

The exact branch name should be chosen only when implementation scope is known.

## C. Pedagogical content / Experiences / Ten Kinds of Words

**State:** continuing product/content domain.  
Keep pedagogical content decisions separate from runtime authority contracts. Create a branch only for a concrete independent implementation batch.

## D. Visual / Sonic / Story experiments

**State:** parallel design/research domain.  
Experiments do not need a branch until repository assets/code are intentionally changed.

---

# CHECKPOINT PROTOCOL

At every important boundary, append or update a checkpoint using this shape:

```text
SIYAYO CHECKPOINT ID

WHERE
branch:
HEAD:
CI:

DONE
last proven contract/result:

WAIT / PERAÍ
what must NOT happen:

NOW
current investigation/implementation:

NEXT GO
single smallest next action:

PARALLEL
other active topics and their branch/state:
```

Checkpoint IDs should be monotonic inside a workstream, for example:

```text
JAGUAR-LIVE-00
JAGUAR-LIVE-01
JAGUAR-LIVE-02
```

A checkpoint is a navigation anchor, not proof by itself. GitHub source, commits and tests remain the technical evidence.

---

# CONNECTION INTERRUPTION RECOVERY

If ChatGPT displays a message such as `Conexão interrompida. Aguardando a resposta completa` or a conversation becomes unavailable:

```text
STOP speculative implementation
  -> open SIYAYO-WORK-MAP.md
  -> identify active checkpoint
  -> verify branch HEAD
  -> verify relevant CI
  -> inspect named contracts
  -> compare repository evidence with checkpoint
  -> resume NEXT GO
```

Useful recovery request:

```text
Iaia, resgate JAGUAR-LIVE-00 pelo SIYAYO-WORK-MAP e confirme HEAD/CI antes do próximo GO.
```

This procedure intentionally makes the repository, rather than a single chat session, the durable continuity anchor.
