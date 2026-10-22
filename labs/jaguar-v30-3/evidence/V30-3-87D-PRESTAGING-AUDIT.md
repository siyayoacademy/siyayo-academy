# JAGUAR V30.3.87D — pre-staging security audit

## Verified verdict: STAGING BLOCKED
Source: isolated GitHub laboratory, pinned Explorer at c7e83709cacf8479847df0f3cee4ed8a563aaae6. All previous lab checks are not equivalent to live release clearance.

The machine-readable inventory lives at security/prestaging-readiness.json. Eight categories are lab-tested; **twelve external verification gates remain blocked**:
- EXT-01 Access policies and non-bypassable preview hostname
- EXT-02 real team issuer and Access audience
- EXT-03 JWKS source, key rotation, bounded cache and fail closed
- EXT-04 actual per-session revocation and logout
- EXT-05 verified learner principal distinct from display NICK
- EXT-06 trusted issued skill and Pass Contract policy
- EXT-07 separate staging Worker/D1, migrations and binding review
- EXT-08 backup, audit logs, privacy and rollback rehearsal
- EXT-09 actual read-only browser/Explorer integration behind rollback flag
- EXT-10 desktop/portrait/landscape EN/ES/PT visual acceptance
- EXT-11 live HTTP deny, unauthorized cross-origin and no-store tests
- EXT-12 explicit authorization for a named nonproduction deployment

Specific gaps:
The current RS256 test verifier receives public JWKs by injection, not a real rotating Access JWKS source. Its mock isSessionActive check is passed subject/issuer/audience/iat/exp only, not a provider-verifiable session ID. A signature-valid token is **not** proof of per-session revocation support. The 87B HTTP handler and 87C browser adapter are test files, not installed in a live Worker or Explorer. The only Wrangler test config contains a placeholder D1 identifier and workers_dev=false.

Local audit CLI:
- node scripts/prestaging-gate.mjs : success **only** means this BLOCKED inventory is internally consistent
- node scripts/prestaging-gate.mjs --require-ready : expected exit 2; STAGING NOT AUTHORIZED

Adversarial tests protect the shape of the inventory, forbidden CI deployment instructions, disabled diagnostic routes, key HTTP/browser source references and fail-closed release declarations. Static tests cannot replace live provider checks or a security audit.

Next work before any remote deploy: real configured Access policies, secure trusted JWKS and revocation strategy, server-approved Pass Contracts, separate staging D1 with rollback, and protected actual browser integration. Only after independently verified evidence and explicit staging approval can the release gate be redesigned. No main merge, remote Cloudflare data or learner traffic was touched.
