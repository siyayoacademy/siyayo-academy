# SIYAYO JAGUAR V30.3.87C — Browser restore coordinator, test-only

**LAB ONLY. Not connected to the production Explorer or a Cloudflare Worker. No remote deploy.**

The browser-side coordinator is a nondeployable test module: `test/browser87/explorer-observation-client.mjs`. It reads the 87B observation-only JSON over the fixed same-origin GET URL `/__lab/v30/observations` with no URL parameters, NICK, learner subject, JWT, or custom authorization header. Cloudflare Access would be responsible for authenticating before the backend verifies the assertion; this has **not** been configured remotely.

The coordinator preserves the existing evaluator and accepted-evidence displays. It reuses only the **separate** 85E observation panel and refuses to write score, Green Pass, `getRetainedEvidence` or `getRetainedProgress`.

Coverage includes login-context selection (not authentication), logout, display language EN/ES/PT, QW WHICH/WHAT/WHERE/WHY, Experience changes, NICK/view-key switches, overlapping requests and stale results, 401/403/404/503, malformed JSON, HTML login interposition, and a bounded response body. The panel never inserts raw HTML.

The UI selection key is **not an authentication credential** and must never choose D1 ownership. A real release requires access-controlled HTTPS, server-side verification, correct session issuance/revocation, and a restricted staging authorization. The old disabled Worker diagnostic routes remain closed.

The implementation is intentionally isolated under `labs/jaguar-v30-3/test/`. The existing Explorer implementation and production Pages remain unchanged.

Next: execute the 87C test workflow alongside all existing regressions, then prepare an explicit staging security checklist; do not declare browser integration complete from synthetic tests alone.
