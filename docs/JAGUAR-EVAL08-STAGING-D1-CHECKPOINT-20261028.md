# 🔔🐆 JAGUAR — EVAL-08 remote staging D1 checkpoint and schema candidate

**Operational checkpoint reported by Cloudflare AI / user on 2026-10-27; source is user-provided provider confirmation, not an independent direct Cloudflare API attestation by this GitHub workflow.**

- Worker `siyayo-academy-staging-api`: created, HTTP 404 + `Cache-Control: no-store`; workers.dev and preview URLs disabled, no routes or domains.
- D1 `siyayo-academy-staging`: created, empty (0 tables), isolated; binding `ASSESSMENT_DB` now attached to this Worker.
- No evaluator runtime, public routes, SQL migrations or real learner records. Production Pages and other Workers unchanged.

## Migration proposal

`staging/eval08/migrations/0001_eval08_initial.sql` is a **new candidate** for the real staging database. It is intentionally separate from the historical `labs/jaguar-v30-3/migrations` and `lab_*` fixtures. Seven product-domain tables cover sessions, authorized contracts (default DENY), direct actions, 85C-style pending occurrences, attempts, accepted Evidence and outbox. Data integrity includes foreign keys, unique event/action IDs, Evidence pass-only trigger and immutable attempt/evidence triggers.

This **does not** authenticate a subject by itself, validate a provider JWT, establish semantic assessment correctness, or grant Green Pass. A trusted Worker adapter must revalidate live session, action, contract revision, authorization and revocation **inside the atomic SQL batch**; staged providers and actual Cloudflare D1 concurrency/recovery remain open. No bootstrap approvals, credentials or learner data are seeded.

## Release sequence

1. Validate schema offline with SQLite and negative tests; CI must be GREEN.
2. Human review schema, naming and privacy model; pin commit and migration SHA.
3. Inspect existing remote D1 status and its Time Travel recovery bookmark (read-only); confirm zero tables and current D1 UUID.
4. With **separate explicit authorization**, apply only versioned migration `0001_eval08_initial.sql` to `siyayo-academy-staging`, never the live Pages D1; verify new tables/indices/triggers and no rows.
5. Keep Worker HTTP 404, URLs disabled, no evaluator installed. Later, independently verify authenticator and writer before any route, shadow test or Green Pass.

**Never apply this unreviewed candidate remotely.** The original H14.67/H14.64 HG and DG gates stay open. Cloudflare Free D1 Time Travel recovery is limited in retention; restore is destructive, so create a bookmark and incident runbook before data is present. Documentation: https://developers.cloudflare.com/d1/reference/migrations/ and https://developers.cloudflare.com/d1/reference/time-travel/ .
