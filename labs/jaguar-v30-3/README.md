# SIYAYO JAGUAR V30.3 — recovery audit archive

**LOCAL DIAGNOSTIC ONLY. NEVER DEPLOY. NOT authentication, production Worker, verified pedagogical authority, credit or Green Pass.**

The V30.3.6 source and its 34 regression cases were restored byte-for-byte from eight user-provided files on 2026-10-20. V29 remains at `src/worker.js`; V30.2 mock identity remains at `test/identity-mock/`; V30.3 bridge remains `src/bridge.mjs`. The separate SQL table definition is at `migrations/0003_v30_occurrences.sql`.

The final HTTP integration (`src/worker-v30-integration.mjs`) was **reconstructed**, not recovered byte-for-byte, from the recorded V30.3.78–V30.3.79 conversation. The three diagnostic write/read routes are disabled via HTTP 404 before any database access. Only the mock `/probe` and the local `/health` diagnostic remain. Original D1 data and the original V30.3.80 log were not recovered; do not confuse newly generated test logs with the original.

## Regression

Execute from this directory:

```sh
node --test test/worker.test.mjs test/identity-mock/identity.test.mjs test/bridge.test.mjs
node --test test/worker-v30-integration.test.mjs
```

The first command runs the original 34 tests. The second runs additional HTTP safety tests on the reconstructed integration. Tests use mock D1 adapters; the health unit test does not establish the condition of a live D1 database.

## Provenance and limitations

The `evidence/PROVENANCE.md` file distinguishes original on-screen test results and hashes from regenerated evidence. The `evidence/recovery-*.log` files are generated from the reconstructed recovery sandbox. No real authentication, real learner identity, remote D1 migration, credit authorization, Green Pass, deployment or merge is provided. The public GitHub Actions workflow is CI-only and must not contain deploy steps.