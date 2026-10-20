# SIYAYO JAGUAR V30.3.86 — E2E integration LAB, never remote

**LOCAL LAB ONLY. DO NOT DEPLOY. THE EXISTING EXPLORER REMAINS UNMODIFIED.**

## Implemented executable path
- A real temporary filesystem SQLite database (Node 22 built-in \`node:sqlite\`) using the existing additive \`0004_v30_85c_occurrences.sql\`.
- A simulated server-side verifier from the **existing 85B test-only identity contract** resolves an opaque subject. The NICK remains display-only.
- A **server-injected allowlist policy** specifies one of four assessment QWs × three languages × exploration/assessment; the browser supplies only an allowlisted \`policyId\`, not learner/skill/subject/status/credit.
- Existing 85C write/replay protection, 85D exact read scope + checksum integrity and 85E observation-only DOM view work together. A real SQLite close/reopen demonstrates persistence beyond a process connection.
- A whole-result failure if any permitted scope fails; no partial grid, no guessed evidence or Green Pass.
- The returned shape is the existing 12-cell observation preview, with no opaque subject, raw answers, canonical accepted-progress, or Green Pass.
- Previous blocked V30 experimental routes stay disabled; no new Cloudflare HTTP endpoints.

## Tests and hard stop
The 18 E2E tests exercise isolation between students sharing NICK, identity changes, expired/revoked sessions, 12 QW-language cells, separate exploration/pending purposes, S1→S2→S3 origin, UUID retry conflicts, SQLite tampering, read-only UI, server policy denial and all-or-nothing restore. All 7 prior CI workflows must remain GREEN. These tests **are not** browser visual homologation nor real authentication.

## Next gates before actual Explorer integration
1. Choose and configure a real session identity provider; the laboratory simulated \`sessionHandle\` must be replaced with an authenticated, server-extracted secure cookie/session mechanism, never user-supplied JSON.
2. Enforce server-issued, versioned Question Word skill/Pass Contract policy, not a client-selected mock allowlist.
3. Add a private, protected staging-only endpoint for read-only observations; never reopen the disabled \`/__lab/v30/write-once\`, \`read-once\` or \`read-other\` diagnostics.
4. Prototype a separate read-only browser integration behind a flag and test login/logout, 401/403/404, cross-tenant requests, browser/mobile/portrait and rollback, while preserving existing Word Path/Trail.
5. Perform a security review and request staging deployment authorization before any remote Cloudflare release.

**Source of truth:** the GitHub experimental recovery branch and recorded GitHub Actions checks, not \`/tmp\` or the Codespaces session.
