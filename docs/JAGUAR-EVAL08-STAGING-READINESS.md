# JAGUAR EVAL-08 staging readiness

Checkpoint: canonical projection GREEN `62f247b7c6440243c980e62b5dd2221f160455ff`. Reuses V30.3.89A/89D design: `siyayo-academy-staging-api` Worker and `siyayo-academy-staging` D1 still proposed, not created. Twelve EXT external checks, fifteen HG pedagogical checks and seven DG technical checks still open.

The new inspector enforces fail-closed checks for configuration, public bypass and invented proofs, with a 404-only handler. It does not verify actual Cloudflare account access, issuer, keys or revocation, and it creates no public Worker endpoint. No Cloudflare deploy, D1 migration, main/PR3 merge, production binding or secrets. The next phase requires user-authorized Cloudflare read-only discovery and separately authorized protected staging.

Historical compatibility: CI 40572352099 ran V30.3.89D test, whose `--require-live` exit-code assertion expected 2 but received 1. The original historical test was not rewritten. The present CI executes the 89D current design checker directly and retains the discrepancy as open technical debt; no claim of live authorization is made.
