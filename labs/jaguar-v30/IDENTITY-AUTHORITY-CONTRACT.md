# SIYAYO JAGUAR V30.1 — Identity and Pedagogical Authority Boundary
Status: DESIGN CONTRACT / NOT IMPLEMENTED
Baseline: V29 local Worker + D1 functional archive (5bc005fc60e834817e246b412ad1eeaa777e8926)
Scope: experimental only; no deployment, production login, migration or Green Pass grant.

## 1. Trust boundaries
- CLIENT (Tri-Language Verb Explorer): untrusted requests and exploratory activity. The client may request an action but never asserts authenticated learner identity, effective authorization, grades or credits.
- IDENTITY VERIFIER (server): validates a trusted authentication proof from a chosen provider, derives opaque stable subject ID and session validity; never accepts client-supplied learner_subject as authority.
- AUTHORIZATION (server): checks the subject against permission for skill, language, experience, purpose and contract version before canonical assessment.
- EVENT INGESTION (Worker): records minimally necessary observations with idempotency, payload integrity and request limits; starts in pending state.
- PEDAGOGICAL EVIDENCE AUTHORITY (server): independently verifies activity provenance, assessment contract, attempt context, required support/mode and permitted scope. Only this layer can confirm evidence.
- GREEN PASS DECISION: separate explicit authorized transition after all requirements are met; NEVER derived from an arbitrary client event or V29 receipt.

## 2. Proposed identity claim contract (not yet a token implementation)
- subject: stable opaque ID derived server-side from verified provider identity.
- issuer, audience, issued_at, expires_at and session_id: verified server-side.
- roles/entitlements: resolved server-side, not trusted from posted event.
- no names, email addresses or passwords in assessment payload.
- missing, expired, unverifiable or revoked identity => DENY assessment read/write.
- future provider selection (e.g. Cloudflare Access or another OIDC-compatible system) requires a separate design and integration review.

## 3. Proposed event envelope
{
  "occurrenceId": "non-secret stable idempotency key",
  "skillId": "which.use.determiner",
  "language": "en",
  "experienceId": "shopping-for-dinner",
  "questionWord": "WHICH",
  "purpose": "exploration",
  "event": {"choice": "books"},
  "contractVersion": "0.1.0"
}
All fields in this envelope are untrusted input. The Worker binds them to server-derived subject and authorized scope; contractVersion must resolve to a known approved snapshot, not be accepted as authority.

## 4. Required state machine
OBSERVED_EXPLORATORY -> STORED_EXPLORATORY
ASSESSMENT_REQUESTED -> PENDING -> VERIFIED_EVIDENCE | REJECTED
VERIFIED_EVIDENCE + CONTRACT_SATISFIED -> ELIGIBLE_FOR_PASS -> AUTHORIZED_PASS
No promotion from exploratory to assessed based on client-side flags. Language/QW navigation must not erase other independent trails.

## 5. Existing canonical anchors
- data/learning/skills/which.json (version 0.1.0): requires choice-function/pass, determiner-use/pass/support none, determiner-use/pass/mode transfer/support none.
- data/learning/green-pass-authority.json: only explicitly adopted skills with a Pass Contract use contract authority; legacy fallback remains distinct.
- js/green-pass-profile.js: evaluates requirement matching but does not independently verify source provenance.
- labs/jaguar-v29: token-simulated pending-only ingest; NOT real authentication.

## 6. V30.2 acceptance gates
1. Auth absent/invalid/expired/revoked -> fail closed.
2. Subject A may not read or write Subject B evidence, regardless of body values.
3. Scope/skill/language/experience mismatches -> deny.
4. Exploration never becomes verified evidence by replay or altered status.
5. Duplicate identical event => idempotent; conflicting event => reject.
6. Contract versions and evidence provenance checked on server.
7. No externally usable endpoints, production credentials, deploy or Green Pass in experimental phase.
8. Regression preserves V29 9-test suite and Explorer EN/ES/PT behavior.

## 7. Next implementation decision
Choose and verify an actual identity provider and its server-side verification protocol before coding real authentication. Begin with a mocked verified-identity boundary and negative tests in a separate isolated laboratory; do not treat the mock as a deployment control.

## Governance
Branch: jaguar/v30-identity-contract-lab
No merge to main. No Cloudflare deploy. No modification of homologated Explorer. Avoid secrets, local D1 files, tokens and PII in repository.
