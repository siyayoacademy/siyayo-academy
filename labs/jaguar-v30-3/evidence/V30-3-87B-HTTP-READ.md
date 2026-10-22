# SIYAYO JAGUAR V30.3.87B — JWT-signed, server-scoped read-only HTTP **lab contract**

**LOCAL EXPERIMENT ONLY. NOT A DEPLOYABLE CLOUDFLARE WORKER, NOT A REAL ACCESS LOGIN.**

## Source and preserved boundaries
- Pinned experimental branch: \`jaguar/v30-3-recovery-archive\`; source Explorer remains pinned to \`c7e83709cacf8479847df0f3cee4ed8a563aaae6\`.
- New \`test/http87/read-only-http.mjs\` wraps the previously tested \`createAccessVerifier87\` from 87A; then obtains policy from \`policiesForSubject(verifiedOpaqueSubject)\`, then reads existing 85D SQLite/D1 observations, then feeds the previously tested 85E 12-cell sanitised preview.
- Signatures are **actually verified** using locally generated 2048-bit RSA keys and WebCrypto, not an unsigned JSON mock. But \`isSessionActive\` and server policy checks are still injected **test stubs**; real revocation, JWKS rotation and team Access configuration are not tested.
- \`GET /__lab/v30/observations\` is exported from a **test-only module**, not installed as a route in the reconstructed Worker, Pages or Explorer. Existing disabled \`/__lab/v30/read-once\`, \`write-once\`, \`read-other\` endpoints remain disabled.

## Exact HTTP behaviors
- \`401 unauthenticated\`: missing, expired, revoked or cryptographically invalid JWT, and fail-closed verifier outages.
- \`403 forbidden\`: no issued policy, duplicate/invalid scope or a policy for another authenticated subject, without reading D1.
- \`404 not_found\`: unknown route, or valid authorized learner with no recorded occurrences; missing history is not guessed from other learners.
- \`405 method_not_allowed\`: any non-GET request for the supported route; no mutation.
- \`400 invalid_request\`: no query parameters accepted (including nickname, subject, QW), no request-supplied authorization selectors.
- \`503 history_unavailable\`: D1 or integrity failure, no partial matrix.
- \`200\`: exclusively twelve WHO/WHAT/etc? **No**: the four currently implemented Word Path QWs are WHICH, WHAT, WHERE, WHY × EN/ES/PT. Observations/pending are separate from canonical evaluator decisions; all accepted progress fields stay null.
- Every response uses \`Cache-Control: no-store\`, \`X-Content-Type-Options: nosniff\`, no CORS access granting and only public-safe JSON. No opaque subject, nick, session, payload, score or Green Pass exposed.

## Safety limitation and release gates
- The actual Workers origin may require Access on the DNS/application AND mandatory signature verification. A public bypass endpoint or trusting CF_Authorization cookie/NICK is disallowed.
- The 87A injected verifier does not implement provider JWKS fetching/rotation nor trustworthy per-session revocation. Production cannot rely on a test-supplied \`isSessionActive\` callback. Real token verification requires a trusted CF Access JWKS endpoint, configured issuer/app audience, secure replay/session lifecycle, short cache/stale-key behavior and fail-closed outages.
- The new HTTP component is not wired into the Explorer runtime, Worker or remote D1. It is a test interface for acceptance/rejection behavior and UI compatibility only. No staging deployment or credentials.
- Later: provider verification, real Access policy, protected staging endpoint, same-origin browser fetch, 401/logout behavior, privacy review, real browser desktop/portrait/landscape tests, and explicit release authorization.

## CI
20 isolated tests exercise RS256-signed Requests, 401/403/404/405/400/503/200, cache/CORS protections, separate subjects, forged policy rejection, SQL integrity and feed into the existing 85E read-only panel. The original recovery and local Cloudflare workflows continue as independent regressions.
