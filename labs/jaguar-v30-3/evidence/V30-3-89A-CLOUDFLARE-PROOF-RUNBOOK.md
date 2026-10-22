# JAGUAR V30.3.89A — CLOUDFLARE REAL-PROOF READINESS

## Current verdict: ACCOUNT CONNECTION MISSING — 12 EXTERNAL CONTROLS BLOCKED

The prior V30.3.88E was reviewed in the actual repository and its 16 GitHub CI workflows all completed successfully. The experimental branch remains the sole target of these new audit files; Explorer canonical source at commit c7e83709cacf8479847df0f3cee4ed8a563aaae6 and main are untouched.

A read-only browser profile survey found **no saved Cloudflare signed-in session**. Neither the remote Access app nor account/team domain, policy AUD, staging Worker, nor separate D1 binding can honestly be confirmed from public documentation or a GitHub lab test.

## First real milestone: read-only discovery of the user's Cloudflare account

Requires the user's explicit consent to connect an authenticated browser profile to Cloudflare. Never request a password or API key in chat. The first visit must be read-only and may inspect:
- whether a Zero Trust team domain and Access applications actually exist;
- the precise Access-protected candidate hostname and application policy, without assuming public Pages previews are protected;
- whether there is a separate, unused nonproduction Worker and D1, and whether continuous deployment could accidentally publish branches;
- whether current permissions permit a narrowly scoped staging configuration; read only and do not change payment or account settings.

Do not copy private identifiers, cookies, JWTs, user records, D1 rows or account credentials into GitHub. Store only redacted proof classifications and a reference to approved evidence.

## Correct access/revocation model

Official Cloudflare session management describes application JWT validation, Access logout endpoints, user revocation and application revocation. These do not prove that a custom lab sid claim exists in real Access tokens. The 88D and 88E composite validators are **mock-only** and MUST NOT be deployed as real Access authentication without an approved provider-backed session strategy.

Use the trusted team-domain cert endpoint and configured application AUD. Probe logout/revocation propagation with explicit test accounts in staging only; the documented logout behavior may take about 20–30 seconds to invalidate already issued tokens. A browser control clearing a panel is not equivalent to provider revocation.

## Acceptance plan after connection

1. Establish exact isolated staging target and a protected Access application with no public bypass. No changes yet.
2. Review actual provider session verification options, JWT issuer/AUD/JWKS and supported revocation.
3. Confirm a dedicated staging-only D1 with rollback, least-privilege account permissions and NO production data.
4. **Request separate explicit staging-only approval** describing exact account, hostname, Worker/D1 and rollback. Do not treat prior generic OK GO as authorization to deploy or mutate remote databases.
5. Only on a secured staging target, execute externally observed deny/login/logout probes. With Access in front of the origin, anonymous requests may receive an Access redirect rather than the application's 401; do not follow redirects blindly or interpret 302 as user-data exposure.
6. Verify server-scoped subject, QW, language, origin, 0/4 contextual vs 0/3 assessment separation, Learning Trail and Word Path 4×3 in browser/desktop/portrait/landscape.
7. Require an independent security review, confirmed rollback and explicit human signoff. Preserve all twelve V30.3.87D blockers until actual external evidence supports their closure.

Official documentation:
- https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/
- https://developers.cloudflare.com/changelog/post/2025-10-03-one-click-access-for-workers/
- https://developers.cloudflare.com/workers/wrangler/environments/
- https://developers.cloudflare.com/d1/configuration/environments/

### Machine guard

The manifest security/cloudflare-live-proof.json intentionally has no real account data. The script scripts/cloudflare-proof-preflight.mjs exits zero only if the BLOCKED plan is internally consistent; --require-live exits 2 to prevent claiming a remote validation. This is an offline safety gate, not a remote probe or Access provider connection.

The future 7D.3.10 DISCOVER WHY remains parked in governance/contract-evolution-registry.json, without touching the existing Explorer runtime.
