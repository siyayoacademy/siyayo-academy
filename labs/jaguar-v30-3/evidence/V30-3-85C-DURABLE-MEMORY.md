# JAGUAR V30.3.85C — Durable Experience memory key, test-only

**LAB ONLY: Not browser integration, not production identity, not remote D1. Do not deploy.**

## Purpose
Create a separate additive D1-schema prototype so a simulated learner can resume persisted event observations across QW/language/Experience navigation without confusing transfer with a new contract. The NICK remains display-only; only a verified server-owned opaque subject may identify the learner's rows.

## Canonical ownership
- Owner: `learner_subject` from V30.3.85B's **test-only server-verifier principal**, never client NICK.
- Assessment scope: `[opaque subject, skillId, language, originExperienceId, contractVersion]` (plus server-governed Question Word / purpose checks).
- Every stored occurrence has a separate `current_experience_id`; a transfer to Preparing/Having retains its original assessment scope.
- Client-side `choice-select:1` is a `source_occurrence_id` useful for trace correlation, **not a durable key**.
- Durable `event_id` in this model is an RFC 4122 UUIDv4 and must be stable across *retries of the same submission* and newly allocated for each distinct event. UUID format alone confers no authority. A future browser/outbox must generate and retain the same UUID until acknowledgement or a server must provide an appropriate durable identifier; do not generate a new UUID on each retry.
- D1 primary key `(learner_subject,event_id)` prevents one subject from silently reusing the same UUID in another skill or language while allowing distinct authenticated subjects their own events.
- Schema: `migrations/0004_v30_85c_occurrences.sql` creates a new `v30_85c_occurrences` table and index; **V29 and V30.3 tables are not modified**. No data migration/dual-read is activated.

## Authority boundary
- `test/storage-contract/storage-contract.mjs` runs only inside tests with simulated `identity` and injected server policy. It is NOT a route, auth implementation, proof provider, evaluator, or production Green Pass.
- Request-like `submission` accepts only `eventId`, `sourceOccurrenceId`, `currentExperienceId`, `event`. It cannot provide learner/skill/language/contract/purpose/status/credit.
- The server policy must be authoritatively resolved in a future implementation; current tests mock that policy. `observed_exploratory` and `pending` are the only states. SQL CHECK constraints deny confirmed/mastery/Green Pass statuses.
- Store canonical JSON with SHA-256; identical retries are duplicates, changed content/context under same UUID is an occurrence conflict. Verify hashes and status on read.
- Data rows must be filtered and scoped by authenticated opaque subject + skill/language/origin/version/QW/purpose on any read. Public Explorer's read-only Trail and Word Path remain untouched.

## Backward compatibility / rollback
- **Additive-only prototype:** the old V29 table and V30.3 `v30_occurrences` table remain intact; new code does not read or write them.
- **No automatic migration** from the legacy questionWord/language/currentExperience scope. A reliable migration requires actual validated provenance of source skill/origin/contract, explicit tenant consent/access controls, collision policy, and rollback tests. Otherwise fail closed rather than guessing.
- Rollback of the future *staging-only* pilot should disable the new adapter first and leave historical records intact. Never delete production data or apply DROP statements from this lab.
- Review proper production signing/session/authorization and secret management prior to any remote Cloudflare usage.

## CI criteria
- `node --test test/storage-contract.test.mjs` exercises UUID idempotency, forged authority, isolation, origin versus current Experience, integrity, retry, nickname changes and scope boundaries.
- `python3 test/durable-storage.sqlite.test.py -v` checks actual SQLite persistence after connection close/reopen, additive schema, uniqueness, language and status constraints.
- Existing GitHub workflows (the original 114 checks) must remain green. No changes to Explorer, production D1 or Cloudflare remote.

## Next V30.3.85D
Study an authenticated read-only restoration observer into Trail/Word Path *without introducing evaluator authority*, using this versioned key as the proposed source contract. Test navigation changes and cross-learner denial; still do not deploy.
