# JAGUAR V30.3.88D — composite verification checkpoint

TEST LAB ONLY — NOT DEPLOYABLE.

This integrates independently tested rotating JWKS, RS256 JWT verification, a test-only signed sid claim bound to a server-resolved session record, and per-session revocation. Missing or mismatched session ID, signature, subject, issuance/expiration or a failed revocation lookup denies access. Old key rejection and overlap are exercised with locally generated keys.

**Provider limitation:** The sid claim used in tests is a laboratory fixture. Cloudflare Access app JWTs are NOT guaranteed to provide it, and production revocation semantics remain unverified. The JWKS source is injected, not real provider network retrieval. Nothing here is authorized for staging or connected to actual Explorer. Twelve external 87D release gates remain blocked. The canonical future DISCOVER WHY and contract-evolution registry remain parked/preserved.
