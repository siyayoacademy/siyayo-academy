# SIYAYO JAGUAR V30.3.6 — isolated mock-to-storage bridge

**Local laboratory only. NOT authentication, NOT production Worker, NOT Green Pass.**

The V29 Worker is preserved in `src/worker.js` and its 9 tests in `test/worker.test.mjs` as an unchanged reference. V30.2 identity mock and its 12 tests are preserved under `test/identity-mock/`. The new bridge is `src/bridge.mjs` with its own tests. It uses an injected D1-shaped DB (`prepare().bind().run()/first()`) and a mocked identity registry/policy.

Run: `node --test test/worker.test.mjs test/identity-mock/identity.test.mjs test/bridge.test.mjs`

`migrations/0003_v30_occurrences.sql` is a **new separate experimental table**, keeping `observed_exploratory` and `pending` distinct at SQL constraint level. It has **not** been applied to real D1; tests use an in-memory fake implementing the D1 calls. The bridge deliberately does not expose an HTTP endpoint. Next step is Wrangler local-only D1 migration and restart smoke tests after security review.

Trust limitation: `verifyMockIdentity` is not valid authentication and local registry/policy data are test fixtures. No provider login, token lifecycle, remote D1, contract authority, verified pedagogical provenance, credit or Green Pass is implemented. No deployment or merge to main.