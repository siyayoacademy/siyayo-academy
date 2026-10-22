# JAGUAR V30.3.87A — RS256 Access token verification contract

**OFFLINE CRYPTO STUDY ONLY. NO LIVE IDENTITY, NO CLOUDFLARE DEPLOY.**

Cloudflare Access provides an RS256 application token through the Cf-Access-Jwt-Assertion header; the browser may also have a CF_Authorization cookie, but the Access origin documentation recommends verifying the assertion header.

See: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/ and https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/

This version of the verifier performs actual WebCrypto RSASSA-PKCS1-v1_5 SHA-256 signature checks against injected, pinned public JWKs. It rejects untrusted/unknown kid, unsupported alg, invalid issuer/application audience, expired/future tokens, empty service-token subject, non-app JWTs, and inactive/revoked sessions.

**Key rotation still missing:** test code takes only server-injected public keys. A future staging Worker must securely fetch and cache Access JWKS from the **trusted, configured team domain** with bounds and rotation/failure semantics, never arbitrary JWT jku/jwk URLs or browser-provided values.

The isSessionActive callback is required and fail-closed. In tests this is a stub; true Access session revocation and provider lifecycle are **not implemented**. Real launch also requires configured Access policy and an origin not bypassable by public request.

Private keys are generated afresh by GitHub Actions tests and never checked into Git. No real email, user identity or account credentials.

No new Worker routes, D1 modifications, production Explorer changes or Cloudflare preview; CI is scoped to the dedicated experimental branch.
