# SIYAYO JAGUAR V30.3.85E — Observation-only HOW TO SHOW adapter

**This is a TEST-ONLY, NOT DEPLOYABLE browser adapter. It is not installed in the Explorer, not protected by a real session provider, and not a Cloudflare staging release.**

## Purpose
Link the data shape of the 85D observation-only restore preview to a browser-compatible, non-scoring **supplementary** panel, while keeping the real Word Path and Learning Trail intact. The four existing QWs × EN/ES/PT form 12 informational cells.

## Important trust and provenance boundaries
1. An 85C persisted row with \`pending\` or \`observed_exploratory\` is **not** accepted canonical evidence. Display ○/◐ only in the new observation-only panel. The canonical Trail's ●/★, 0/3→3/3 and Green Pass remain evaluator-owned.
2. \`test/observation-ui/observation-panel.mjs\` is *not* a credential verifier. The injected \`loadSnapshot(viewKey)\` is simulated; \`viewKey\` is never accepted as identity or secret. A future HTTP API must extract and verify the real session server-side, gate reads by opaque subject and policy, and return a minimal sanitized snapshot.
3. The UI model rejects extra fields (subject, nick, credit, confirmation, arbitrary score), duplicate or missing 12 cells, invalid counts and forged markers. HTML is made from DOM text nodes, never \`innerHTML\`.
4. An epoch counter ensures a response started under one NICK/QW does not overwrite the panel after the learner switches context. Clearing the panel invalidates unfinished reads; the underlying live Explorer identity source is not changed.
5. This adapter does not read or write \`localStorage\`, call the actual Explorer's \`getRetainedProgress\` or \`getRetainedEvidence\`, or mutate assessment/Green Pass. The Word Path/Trail source remains pinned to Explorer SHA \`c7e83709cacf8479847df0f3cee4ed8a563aaae6\` and is executed independently in CI.

## Next gates for real staging
- Resolve an actual authentication provider, secure session cookie, authorization checks and revocation semantics. Do not use NICK as proof.
- Implement scoped staging-only HTTP read API, using trusted server policy, and do not expose previously blocked V30.3 diagnostic write/read paths.
- Add integration tests for real D1 queries, logout/cross-learner reads, expired session, browser navigation and stale request cancellation.
- Verify all 12 observation cells and canonical evidence visually on desktop/portrait/landscape in a protected environment; explicit security and release go/no-go.
- No credentials in this public repository, no preview URL invented, no remote deploy authorized by passing mock tests.

## Code/CI evidence
- New local panel contract tests and existing 85D, 85C, 85B, Explorer, local D1 and security workflows must be green.
- The durable Source of Truth remains the experimental GitHub branch. No local-only /tmp artifacts.
