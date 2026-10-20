# SIYAYO JAGUAR V30.2 — simulated identity boundary

This is an isolated Node.js mock only, NOT authentication. It does not connect to V29 D1, cannot be deployed as a Worker, and does not confer Green Pass. The in-memory registry models trusted identity verification solely for negative tests.

Run: `node --test identity.test.mjs`

Validated 2026-10-19: 12 tests passing. Next: independently audit trust-source verification, session revocation, scope contracts and provenance; then build a distinct integration adapter (not included).

Do not substitute this mock for actual OIDC/Access token verification. No production secrets, D1 databases, or learner PII are included.
