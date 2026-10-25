# 🔔🐆 JAGUAR H14.53 — Trusted Identity Boundary & Immutable Action Provenance (local candidate)

**Base:** H14.52 `677ced16460e9f0f5c88a40a379293beedb3c07f`, local bundled Worker/Miniflare D1. **Status:** isolated candidate; no product authentication, remote D1, staging, production, Explorer integration or pedagogical grant.

## Problem and change

H14.52 correctly used a synthetic `mock_sessions` lookup inside the Worker, but `submit(input)` still accepted a `sessionHandle` and other authorization pointers within the caller's input. H14.53 puts a **synthetic server-side gateway** in front of the *unchanged* H14.50 guarded-batch candidate. The caller now only supplies `{actionKey,eventId,intent}`; it cannot supply subject, session handle, target ID, authorization revision, action reference or exposure claim. An explicit Worker test-only binding `LAB_H1453_SESSION_HANDLE` supplies the session. **This remains a mock session: possession of an environment binding is not proof of production authentication.**

New fixture-only `mock_h1453_action_provenance` records `actionKey, sessionHandle, subject, target, action, authorizationRevision, source, modelExposure, exposureReference, recordedAt, bindingSha256, intent` and rejects update/delete via SQL triggers. The gateway resolves subject from the synthetic session, checks same-subject ownership, provenance age and source `DIRECT_LEARNER_ACTION`, compares exposure/action and the SHA-256 of the target binding, then calls the previous preparer and guarded-batch mechanism without changing 85C occurrence storage. A SQL trigger on the action-consumption reservation rechecks that action/session/target data and revision were not revoked, stale or modified before the transactional claim. The trigger intentionally stores no Evidence and does not assert semantic correctness.

## Separation of responsibility

| Area | H14.53 result | Unmet production requirement |
| --- | --- | --- |
| Identity | Server-side injected synthetic session; client cannot nominate subject | Real verifier, cookie/token provenance, revocation authority, expiry under distributed conditions |
| Action provenance | Immutable mock record and checked subject/target/exposure/revision | Authenticated ingest event, durable authorship chain, trusted ingestion policy |
| Target | SHA-256 consistency plus target binding and revision checks | Authorized pedagogical contract and semantic rubric |
| Storage | Reuses `v30_85c_occurrences` and H14.50 six-statement batch | Remote D1 and real migration/legacy consistency review |
| Concurrency/replay | Guarded claim, receipts created/duplicate, replay recovery | Distributed D1 consistency and read replica policy |
| Presentation/evaluation | None. `pending` stays pending | EVAL-08 authorized Evidence, Trail/Word Path projections |
| Web access | Worker fetch returns 404; test RPC opt-in only | Explicitly authorized production route, CSRF/session boundary, abuse controls |

## Five HOW TO and integration gates

- **DO:** resolve a minimal action key against a server-owned test session; never believe arbitrary client authorization fields.
- **RECORD:** one 85C occurrence, existing action/scope reservation, companion provenance fixture only; a recorded action is **not** an Evidence or Green Pass.
- **SHOW:** test receipt and lab docs; no Explorer interface changes.
- **CHECK:** immutable record, action tamper, target mutation, wrong subject, stale revision, revocation during batch, rollback, replay, restart, concurrency; fail-closed.
- **SPEAK:** not applicable to trusted backend; current English/Spanish/Portuguese speech and learning UI preserved.

**DG-04 remains OPEN:** this is synthetic trusted dependency plumbing, not a real authentication system. DG-01/02/03/05/06/07 similarly remain open for production. Real D1, account-level isolation, session issuance, trusted event collection, contract authority, evidence/outbox and browser regression need separate permission and tests.

## Run locally

```bash
npm ci --prefix labs/jaguar-v30-3/test/h14-53 --no-audit --no-fund
npm test --prefix labs/jaguar-v30-3/test/h14-53
```

Workflow re-runs H14.52 and predecessor regressions, but CI GREEN only proves the listed test set. No Wrangler deployment config and no public HTTP submission route. All mock schemas are *fixtures*, never migrations authorized for product.

## Scope & traceability

Files limited to `labs/jaguar-v30-3/test/h14-53/`, one reference JSON, this document and a branch-specific workflow. The original H14.44/H14.50/85C/H14.52 files are not modified; MCE, main, PR #3, Explorer, PATITA, Word Path, Learning Trail, Cloudflare production and D1 remote remain untouched.

**Decision:** GO only for sandbox laboratory examination when tests pass; NO-GO for real authentication claim, staging, product data writes, Evidence/Green or deployment.

**Next candidate:** integrate a real verified session-source adapter only after choosing an explicit authentication provider/issuer and trusted action-ingestion contract; do not invent identity from NICK or a browser-supplied handle.
