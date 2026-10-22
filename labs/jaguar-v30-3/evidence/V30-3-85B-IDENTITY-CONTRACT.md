# JAGUAR V30.3.85B — Verified principal vs Explorer NICK

**MODE: OFFLINE SECURITY CONTRACT AND MOCK TESTS. NOT REAL AUTHENTICATION. NEVER DEPLOY.**

## Objective
Keep the Explorer's original NICK/identity UX and evidence path. In the future, a trusted server principal will govern persistence and reads; the human-entered NICK is presentation metadata only. No browser field may choose a D1 owner.

## Directly established on the pinned Explorer branch
- `SIYAYOVerbExplorerLearnerIdentitySource.adopt(id)` accepts an in-memory human nickname.
- `SIYAYOVerbExplorerLearnerIdentityProvider.provide(id)` forwards the nickname and clears certain runtime authorities on change; it does not authenticate.
- `AdaptiveAssessmentScope` uses `[learnerId,skill,language,originExperienceId]` as browser-local assessment ownership.
- Explorer event occurrence IDs are in-memory counters and cannot serve as durable cross-restart storage identifiers.

## Server boundary design
- Server obtains an opaque subject and session identity from a **separately configured, genuinely trusted session verifier**, not the browser or a user-entered name.
- Provider verification must enforce issuer, audience, expiry, issued-at, revocation and session ownership on each sensitive request.
- The `subject` field from the verifier, never `nick`, is the future storage owner. A NICK change cannot transfer records. Two learners may share the same NICK but never the same owner by implication.
- Input allowlist: `sessionHandle`, `nick` in the study. A future actual HTTP adapter should extract its secure session cookie server-side; it must not trust client-supplied JSON tokens or nicknames as authority.
- Never accept client `subject`, `learnerId`, `credit`, `status`, `greenPass`, `assessmentAuthority` or timestamp as an authorization claim.
- The emitted object is just a **test-only identity context**, not a credential, bearer token, signed proof, session cookie or authorization decision.
- No direct call from the Explorer is connected to this prototype; the existing simulated identity registry remains only in the V30 tests.

## What remains undecided
1. Select real identity/session provider (OIDC, managed Access, custom trusted session) and session cookie lifecycle, revocation and recovery semantics.
2. Decide whether NICK is unique or reusable **as a display label only**, and establish consent/privacy and account association rules.
3. Define canonical storage key including verified subject, skill, language, origin, and separately current/transfer experience; ensure stable idempotency identifiers (V30.3.85C).
4. Define read-only server restore behavior and public/private metadata boundaries (V30.3.85D).
5. Test real provider integration in a separate Cloudflare staging project behind access controls, only following review and explicit go/no-go.

## Non-negotiable isolation
- No D1 schema is changed in 85B, no HTTP route added, and no Explorer or `main` file modified.
- No learner data, real tokens, deployments, credit or Green Pass.
- `test/identity-contract/server-identity-contract.mjs` deliberately lives **under test/** so it cannot be mistaken for a production auth component.
- The future trusted adapter MUST be audited separately and may NOT be obtained merely by passing arbitrary request fields into this factory.

## CI criteria
- 23 identity-contract behavioral tests pass, along with previous 91 regression/compatibility checks.
- All workflows remain scoped to recovery branch with read-only repository permission.
