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

# ACTIVE CHECKPOINT — JAGUAR-LIVE-02

**Status:** ACTIVE  
**Recorded:** 2026-09-22  
**Repository:** `siyayoacademy/siyayo-academy`  
**Active branch:** `jaguar/verb-explorer-resume-live-wire`  
**Base:** `main`  
**Checkpoint source HEAD before this documentation commit:** `eb41c1f2b307fb0af98173a992369455a6f45c05`  
**CI at source HEAD:** GREEN — Resume Runtime Dispatch, Corpus Integrity, Verb Explorer Adaptive Bootstrap.  
**Cloudflare:** deploy successful; laptop end-to-end validation completed by the user.

## DONE — explicit Dependency Head Probe + learner identity gate

Grounded live chain:

```text
human-entered learner name/nickname
  -> LearnerIdentityProvider
  -> IdentitySource
  -> explicit WHICH selection
  -> declared assessmentTarget
  -> canonical Skill
  -> grounded Session
  -> Dependency Head Probe
  -> LearnerEvent
  -> HeadProbeResult
  -> Evidence
  -> Attempt
  -> adaptive Cycle
```

Validated behavior:

- Head Probe remains hidden before grounded Session authority;
- learner identity is explicit, non-persisted and never silently invented;
- WHICH carries an explicit `assessmentTarget`; Skill is not inferred from Experience/questionWord;
- `ALL` / `THESE` -> `TRY ANOTHER WORD`;
- `BOOKS` -> `HEAD IDENTIFIED`;
- Head Probe interaction does not drive Dependency Focus;
- Dependency Focus remains independently exploratory and its SVG redraws with focus migration;
- head-identification Evidence does not automatically grant Green Pass or NEXT;
- laptop end-to-end behavior validated without page reload.

## WAIT / PERAÍ — invariants

- Learner profile metadata is not pedagogical Evidence by itself.
- A display name/nickname identifies the learner-facing Session owner; it does not prove Skill.
- Exploratory Dependency Focus remains non-assessment.
- One accepted learner Attempt may create a longitudinal observation footprint, but that footprint must not be represented as mastery or contract closure.
- `IN_PROGRESS` is not `CONFIRMED`.
- Only canonical Green Pass contract closure may produce the confirmed Trail marker for an Experience.
- Do not infer Skill from Experience, questionWord, profile attributes, nationality, profession, age or other personalization metadata.
- Do not authorize NEXT from a single Head Probe pass.

## NOW — longitudinal observed-attempt footprint

The live Cycle already accepts real learner Attempts, but the learner-facing Trail reads `AdaptiveEvidenceProfile`. At present the live Coordinator writes longitudinal history only for confirmed Green Pass contract closure. Therefore a real accepted Head Probe attempt can leave the Trail at:

```text
○ UNOBSERVED · 0 CONTEXTS
```

even though the learner has already produced observed Evidence.

## NEXT GO

Create the smallest fail-closed authority that records one idempotent **observed-attempt footprint** into `AdaptiveEvidenceProfile` only after the adaptive Cycle accepts that Attempt.

Expected semantic transition:

```text
accepted learner Attempt
  -> longitudinal observed footprint
  -> LearnerTrailView
  -> ◐ IN_PROGRESS
```

A later canonical Green Pass closure remains independently authoritative:

```text
GREEN_PASS contract closure
  -> confirmed longitudinal closure
  -> ● CONFIRMED
```

No score inflation. No mastery inference. No automatic NEXT. No duplicate footprint for the same occurrenceId.

---

# HISTORICAL CHECKPOINT — JAGUAR-LIVE-01


**Status:** ACTIVE  
**Recorded:** 2026-09-22  
**Repository:** `siyayoacademy/siyayo-academy`  
**Active branch:** `jaguar/verb-explorer-resume-live-wire`  
**Base:** `main`  
**Checkpoint source HEAD before this documentation commit:** `3d4a71802d393f56d9417be5f3f5f81e4624a387`  
**CI at source HEAD:** GREEN — Resume Runtime Dispatch, Corpus Integrity, Verb Explorer Adaptive Bootstrap.  
**Cloudflare:** deploy successful for `3d4a718`; laptop visual validation completed by the user.

## DONE — live learner progression + longitudinal Trail

The browser runtime now preserves the adaptive chain through learner-owned progression:

```text
Choice / observed learner action
  -> Cycle
  -> GREEN_PASS / longitudinal closure
  -> AdaptiveEvidenceProfile
  -> Convergence
  -> explicit learner NEXT
  -> ProgressionDecision
  -> SessionTransitionBoundary
  -> S1 release
  -> S2 activation with prior evidence
```

The learner-facing Trail is read-only and evidence-grounded:

```text
AdaptiveEvidenceProfile
  -> LearnerTrailView
  -> LearnerProgressMarker
  -> chronological Experience sequence
  -> current-position illumination
  -> learner-facing canonical word label
```

Semantic markers:

```text
○ UNOBSERVED
◐ IN_PROGRESS
● CONFIRMED
★ CONSOLIDATED_EVIDENCE
```

Current position never becomes evidence merely because the learner is there.

## DONE — Dependency Focus visual syntax

Canonical fixture:

`data/learning/dependencies/all-these-three-books.json`

Grounded example:

```text
All    -> books   det
these  -> books   det
three  -> books   nummod
```

Live architecture:

```text
Experience.dependencyFocus
  -> AdaptiveDependencyFocusView
  -> AdaptiveDependencyConnectorView
  -> SIYAYOVerbExplorerDependencyFocusSurface
  -> SIYAYOVerbExplorerDependencyFocusInteraction
```

Capabilities proven by tests and laptop visual validation:

- word-class-agnostic focus across the Ten Kinds;
- head ↔ dependent resolution from canonical data only;
- responsive SVG curves and relation labels;
- mouse / pen / touch / keyboard focus boundaries;
- Enter / Space accessible activation;
- focus migration BOOKS ↔ ALL / THESE / THREE;
- no parser inference;
- no LearnerEvent, Evidence, score, mastery, Green Pass or progression produced by exploratory focus;
- live `shopping-for-dinner` Experience binding;
- pleasant green connector layer and gold current-focus layer validated visually on laptop.

Manual smartphone validation remains pending because the user's current network connection is unstable during heavy rain; do not classify that as a runtime defect without reproduction.

## WAIT / PERAÍ — Dependency Focus invariants

- Pointing / hover / focus is exploratory navigation, not assessment evidence.
- Do not emit a pedagogical LearnerEvent merely because a token is highlighted.
- Do not infer a missing syntactic relation; canonical dependency data is authoritative.
- Keep dependency visualization separate from Green Pass authority.
- Keep Trail state separate from dependency relation state.
- SVG/color/presentation may vary, but canonical relation identity must remain stable.
- Smartphone validation is pending external network recovery; preserve the current working laptop behavior.

## NOW — next pedagogical layer

The visual relation substrate is complete enough to support an explicit learner task such as:

```text
"Which word is the head?"
```

Unlike hover/focus, an explicit answer may legitimately become an observed LearnerEvent if and only if a dedicated probe/presentation/result contract defines that modality.

## NEXT GO

READ-ONLY audit before any write:

1. inspect existing determiner-use / transfer / contrast probe presentation and browser-wire contracts;
2. identify the smallest reusable authority pattern for a Dependency Head Probe;
3. define the exact boundary between exploratory `DependencyFocusInteraction` and explicit assessed answer;
4. only then open the first RED for a learner-owned head-identification event.

Expected conceptual chain:

```text
canonical dependency structure
  -> HeadProbeDefinition
  -> explicit learner answer
  -> LearnerEvent (single observed occurrence)
  -> HeadProbeResult
  -> Evidence
  -> adaptive Cycle
```

No parser magic. No evidence from hover. No automatic Green Pass.

---

# HISTORICAL CHECKPOINT — JAGUAR-LIVE-00


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
