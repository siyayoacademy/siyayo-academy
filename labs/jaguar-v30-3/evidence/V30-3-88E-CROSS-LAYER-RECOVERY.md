# JAGUAR V30.3.88E — Cross-layer recovery and HOW TO SHOW

STATUS: ISOLATED TEST ONLY; no Cloudflare deployment, no real user or Explorer runtime change.

This checkpoint joins existing code unchanged:
- offline RS256 verification, trusted-injected rotating keys, test-only signed sid and independently checked session revocation from 88D;
- server-supplied scoped read of real in-memory SQLite via 87B/85D;
- separate observational-only 87C/85E browser panel and original pinned Word Path/Trail script tests.

22 test cases cover 4 QWs x EN/ES/PT, signed session, revoked and expired tokens, wrong subject, wrong app audience, JWKS rollover, offline revocation store, compromised SQLite checksum, no-store, 401/403/404/405/503, logout and preserved scoring boundary. Production Edge is SIMULATED: browser sends no JWT; test transport supplies Access assertion server-side. No new browser login or Worker route is deployed.

Provider documentary facts, confirmed Oct 21 2026:
https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/
https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/

Cloudflare Access documents RS256-signed app tokens, configured application AUD, issuer, public certs at the team URL, per-user and per-app revocation, and /cdn-cgi/access/logout. It does NOT guarantee the invented test sid claim. Production may instead use documented Access revocation and a separately contracted SIYAYO session layer if needed.

The 12 pre-staging external blockers continue to be BLOCKED. Test success cannot certify Access setup, actual revocation latency, nonbypassable URLs, D1 backup/rollback, or physical-device visual homologation. The contract evolution registry and the 7D.3.10 DISCOVER WHY study remain preserved and inactive.
