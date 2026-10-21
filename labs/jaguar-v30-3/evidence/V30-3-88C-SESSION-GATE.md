# V30.3.88C — Independently verified session-lifecycle model

This is a **test-only interface**; it assumes resolveVerifiedSession resolves a session ID issued and verified by a real provider/backend. The callback is a test stub and is NOT connected to Cloudflare Access JWTs, their signature digest, or the browser NICK.

An independently verified session ID enables revocation of one session while retaining another for the same opaque subject. Expiration, missing sessions, malformed clock and revocation-store outages fail closed.

**EXT-04 remains BLOCKED.** Real provider-backed per-session logout/revocation semantics, a dependable session identifier and staging infrastructure are not implemented or authorized here. No Worker route or Explorer authority is modified.
