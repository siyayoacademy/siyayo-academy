# JAGUAR V30.3.84 — Cloudflare release safety boundary

Status: GREEN LOCAL CI; REMOTE RELEASE IS NOT READY. There has been NO remote Cloudflare deployment.

## What was independently tested
- 42 Node.js mock regressions (V29, V30.2, bridge, reconstructed HTTP).
- 10 SQLite SQL constraint tests using actual SQLite rather than mocked D1.
- 10 HTTP smoke requests through local Cloudflare workerd/Wrangler with a locally migrated D1.
- Versioned evidence distinguishing original sources from rebuilt Worker, preserved under evidence/PROVENANCE.md.

## Additional local-only gate
- scripts/assert-isolation.mjs verifies local-only Wrangler config, loopback listener, placeholder D1 ID, restricted CI branch and token permissions, and no remote deploy or Cloudflare credentials.
- test/assert-isolation.test.mjs mutation-tests this gate. Static checks are defense-in-depth and cannot stop intentionally edited workflows elsewhere.
- Experimental write-once, read-once, and read-other routes stay HTTP 404. This is not authorization for internet-facing use.

## Mandatory steps before any isolated remote Cloudflare preview
1. Independent staging account/project, hostname and D1 binding; no production D1, token or route.
2. Real identity provider and validated, revocable sessions replacing mock tickets and hard-coded time.
3. Server-issued authorization for skill, language, experience, purpose and contract version; deny other learners.
4. Authenticated HTTP tests for revoked, expired, wrong-scope, forged identity, privilege injection, integrity corruption, idempotency and denial responses.
5. Secure D1 migrations/rollback rehearsed against staging only; confirm no credits or Green Pass are issued by this layer.
6. Protect remote preview with Cloudflare Access or an equivalently restrictive gate; test unauthenticated access from outside.
7. Review Cloudflare settings and named project before remote deployment; separate explicit go/no-go.
8. After staging deployment, audit logs, data access, end-to-end isolation, rollback and unaffected public Explorer.

Until these gates pass: local CI only. Do not deploy V30.3 reconstructed Worker, do not connect live students, and do not merge into main.
