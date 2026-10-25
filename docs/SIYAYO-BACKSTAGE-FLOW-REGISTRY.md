# SIYAYO REG-02 — Backstage, JSON Enrichment & Durable Memory Governance

**Status:** documentation-only, no runtime implementation or evaluation authorization.  
**Parent Module Registry:** `jaguar/module-governance-registry-20261024` · `719f259d78ca27d444bdfacecd3ccd2091818980`.  
**Lab evidence snapshot:** `jaguar/h14-40-why-v30-85c-durable-idempotency-contract` · `f8f2cbf958b807f84cf2e2371b0b2ef4dd8eb768` (H14.40, CI green, integration NOT authorized).  
**Scope:** cross-branch supervision. H14.41–H14.43 are planned, not treated as completed here.

## A. Principles and five HOW TO responsibilities

- **HOW TO DO:** content authoring/promotion and control-flow orchestration only from approved sources; no inferred skill, grammar or evaluation.
- **HOW TO RECORD:** PATITA observational data, Explorer presentation memory, laboratory occurrence storage, and canonical Evidence are **four distinct stores/contracts**. Neither local UI memory nor V30.3.85C occurrence receipts are canonical Evidence.
- **HOW TO SHOW:** LIVE-07, DEP-03, FUNC-13 and Trail/Word Path consume projections; no renderer becomes an authority simply by displaying a state.
- **HOW TO CHECK:** validate origin, JSON shape, context, translations, permission, idempotence and provenance, with separate checks for storage versus evaluation.
- **HOW TO SPEAK:** localized speech controls use approved text and lang; a speech click is not answer submission and must not generate credit.

## B. Backstage module identifiers (documentation aliases, NOT new JS implementations)

| Code | Runtime/lab reference | Contribution | Boundary |
|---|---|---|---|
| `DATA-01` JSON Authoring & Provenance | `data/learning/experience-seeds.json`, references, dependency JSON, skill JSON | Source for contextual content and declared targets | Enrichment must not silently grant assessment |
| `FLOW-01` Runtime Orchestration | `js/verb-explorer-adaptive-bootstrap.js`, `js/verb-explorer-adaptive-coordinator.js` | Loads dependencies and coordinates authorized runtime steps | Loading is not assessment authorization |
| `STATE-01` Scoped Presentation State | `js/verb-explorer-experience-presentation-memory.js`, `js/verb-explorer-adaptive-state-bridge.js` | Restores visual state; read-only bridge | Does not mint Evidence |
| `AUTH-01` Contract and Scope | `js/question-word-assessment-contract.js`, `js/adaptive-assessment-scope.js` | Checks declared targets and browser-side scope ownership | NICK/browser scope is not verified server identity |
| `OBS-01` PATITA Observation | `js/verb-explorer-patita-interaction-trail.js` | Interaction observation | No grading, Evidence, Green |
| `STORE-85C` Durable Occurrence Lab | `labs/jaguar-v30-3/migrations/0004_v30_85c_occurrences.sql`, `test/storage-contract/storage-contract.mjs` | Local-only SQLite/D1-compatible *study* of idempotent occurrence writes | No production D1, no real auth, no canonical Evidence |
| `INTENT-01` WHY Dimension/Intent Proposal | `scripts/jaguar-h14-39-shadow-occurrence-idempotence.js` and H14.40 reconciliation | Models question-function / local / transfer and exploratory/pending separation | H14.39 synthetic UUID model is **not** canonical server ownership |
| `GATE-01` Selective Integration & Verification | H14.40 reconciliation report, CI, future H14.43 handoff | Blocks silent cross-branch adoption | No automatic merge or migration |

## C. JSON enrichment supervision — mandatory checkpoints

A JSON authoring change is a **documentary trigger** (not an existing browser event). Record: the proposing branch + immutable commit SHA, affected file paths, schema/version, original source and provenance, target Experience × QW × EN/ES/PT × tense × mode × perspective, consumer modules, and changed versus unchanged fields.

1. **Discover:** determine whether the data already exists in another JSON, seed, skill, reference or prior laboratory contract; prefer an authorized canonical source instead of copying a second dictionary.
2. **Validate:** parse/schema/expected key names, reference integrity, unique IDs, coverage per declared language and Experience, and semantic coherence of question/answer, grammatical tense/mode and QW. An unauthored combination must remain an explicit gap; never fabricate a sentence.
3. **Authority separation:** adding a QW or example exposes an **opportunity**, not an assessment target. A new `assessmentTarget` or `assessmentResumeTarget` requires separate contract authority and testing; no derived GREEN.
4. **Consumption audit:** identify HTML surface, JS parser/controller, caches and dependent renderers; test both initial render and EN↔ES↔PT, QW, tense, mode, Perspective and Experience switches. Check for stale UI while preserving prior canonical evidence.
5. **Check & promote:** independent tests, no secret/learner data, versioned change report, CI evidence, human pedagogical/visual homologation when needed, and selective target-branch adoption only after comparing HEADs.

**Review stop conditions:** missing provenance, duplicate ownership, source schema drift, incoherent localized text, contract inferred from presence, state/evidence conflation, unauthorized migration, real identity from NICK, or regressions.

## D. Durable occurrence memory: what H14.40 actually verifies

- Schema `v30_85c_occurrences` is an **additive, local-only** study; primary key `(learner_subject,event_id)`.
- `learner_subject` MUST originate from a trusted verified server principal in any future live implementation. Display NICK must not be used for authorization or ownership.
- `event_id` is a stable UUIDv4 for retries of **one submission**; same subject + same ID + unchanged envelope returns duplicate/no second row. Changed language, origin, skill, context, purpose, payload, or version must fail closed. Distinct verified subjects can independently use the same UUID.
- `source_occurrence_id` is legacy UI correlation, not the durable primary key.
- Exploration can be stored only as `observed_exploratory`; assessment occurrence only as `pending`. Pending **never** implies pass, Evidence or GREEN.
- Schema 85C does **not** have dedicated dimension or intent columns. H14.41 must first propose an explicit, versioned and authorized binding strategy; no migration is performed by this registry.
- Tested: SQLite schema, uniqueness and connection-close/reopen. **Not proven here:** real authentication, Worker/D1 distributed concurrency, atomic Evidence outbox, production rollback.

### Storage versus assessment chain

`Verified server identity (NOT IMPLEMENTED)`
→ `Authorized scope/purpose (PARTIAL STUDY)`
→ `UUID + canonical event payload`
→ `85C idempotent occurrence write (LOCAL STUDY)`
→ `observed_exploratory OR pending`
→ `future authorized EVAL-08 decision (NOT PROVIDED BY 85C)`
→ `future atomic canonical Evidence + separate GREEN contract (NOT PROVIDED BY 85C)`.

No shortcut from PATITA, HEAD IDENTIFIED, speech, JSON appearance, pending state or stored occurrence to Evidence.

## E. Seven H14.40 reconciliation gaps (all OPEN at the audited snapshot)

| Gap | Invariant required to close | Owning future review |
|---|---|---|
| `DG-01` Dimension + intent | Bind origin, local/transfer and question-function authoritatively | H14.41 design |
| `DG-02` WHY S1/S2 authorized contracts | Explicit teacher-approved assessment target; preserve S3→S4 | EVAL-08 + pedagogy |
| `DG-03` Atomic Evidence | Exactly-once Evidence/outbox, separately transactional | Canonical evaluation + persistence |
| `DG-04` Real identity | Trusted server session principal and isolation | Authentication / security |
| `DG-05` Cross-runtime concurrency | Worker/D1 real staging races, crashes and retries | H14.42 staging gates |
| `DG-06` Selective Explorer integration | Compare current MAIN/PR #3 HEAD, data and regressions | H14.43 handoff |
| `DG-07` Human homologation | Review HG-04/05/09/10 | Teacher / pedagogical authority |

## F. Cross-branch checkpoint and supervision rule

A lab change MUST NOT silently update or overwrite the Module Registry. For every proposed adoption, record: `source_branch`, `source_sha`, `paths_changed`, `module_consumers`, `authority_class`, `data_schema_change`, `tests`, `human_review`, `target_branch_head`, `compatibility_decision`, and `rollback_plan`.

**Documentary watchpoints (not deployed event listeners):** `json_source_change`, `new_assessment_target`, `storage_schema_proposal`, `identity_boundary_change`, `cross_branch_cherry_pick`, `release_candidate`.

When any watchpoint occurs: compare existing owners/contracts → compute impact graph → run scoped checks → review GO/NO-GO; log whether each gap is OPEN, VERIFIED_IN_LAB or AUTHORIZED_IN_TARGET. Never treat GitHub CI green as pedagogical homologation or real-device verification.

## G. Direct verified source links

- [H14.40 reuse report](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/h14-40-why-v30-85c-durable-idempotency-contract/docs/JAGUAR-H14-40-V30-85C-DURABLE-IDEMPOTENCY-REUSE.md)
- [H14.40 reconciliation JSON](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/h14-40-why-v30-85c-durable-idempotency-contract/data/learning/references/jaguar-h14-40-durable-idempotency-reconciliation-v0.1.json)
- [V30.3.85C migration](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/h14-40-why-v30-85c-durable-idempotency-contract/labs/jaguar-v30-3/migrations/0004_v30_85c_occurrences.sql)
- [V30.3.85C contract code](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/h14-40-why-v30-85c-durable-idempotency-contract/labs/jaguar-v30-3/test/storage-contract/storage-contract.mjs)
- [H14.39 synthetic idempotency simulator](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/h14-40-why-v30-85c-durable-idempotency-contract/scripts/jaguar-h14-39-shadow-occurrence-idempotence.js)

## H. Preservation

Documentation-only. No database touched, no new runtime, routes or assessment semantics, no deploy, no Evidence, no Green, no changes to `main`, PR #3, PATITA, Learning Trail or hidden FUNC-13. Follow-up ELOs are independent from this registry snapshot.

## REG-03 — Impact Analysis & Integration Map

O REG-03 permite identificar mudanças, consumidores diretos/indiretos, gatilhos e gates antes de transportar módulos entre branches ou reutilizá-los em outro site. Inclui riscos de UI antiga, coerência EN/ES/PT, contratos, JSON, persistência 85C e armazenamento distinto de Evidence. **Não monitora branches automaticamente e não concede aprovação técnica.**

- [Manual de análise de impacto](./SIYAYO-IMPACT-INTEGRATION-MAP.md)
- [Grafo estruturado de dependências](./siyayo-impact-integration-map.json)
