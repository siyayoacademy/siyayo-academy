# JAGUAR V30.3.85 — Explorer Experiences ↔ V30.3 integration contract audit

**Status: mappings audited; integration NOT yet implemented. No deploy, no merge, no modification to the official Explorer.**

## Durable sources and version pins
- **Explorer candidate branch:** `jaguar/verb-explorer-resume-live-wire`, inspected at commit `c7e83709cacf8479847df0f3cee4ed8a563aaae6`.
- **Storage/Worker lab branch:** `jaguar/v30-3-recovery-archive` (CI-only).
- This audit's GitHub workflow performs a second, read-only checkout pinned to the Explorer SHA. It tests five exact Git blob hashes and executable JS interfaces using Node VM. Rebase/re-pin deliberately after Explorer changes; do not silently treat an outdated snapshot as current.
- Latest local Cloudflare CI baseline: 42 Node + 10 SQL + 15 isolation-gate + 10 local HTTP requests (77 checks). These are not real Cloudflare authentication tests.

## Existing browser seams (observed directly in pinned Explorer source)
| Explorer component | Contract actually present | Trust boundary |
| --- | --- | --- |
| `verb-explorer-learner-identity-source.js` | `adopt(id)`, `getId()`, `clear()`, in-memory nickname | Unverified and nonpersistent; **not login** |
| `verb-explorer-learner-identity-provider.js` | `provide(id)`, `clear()` and identity-switch reset | Forwards only; does not verify a student |
| `adaptive-assessment-scope.js` | scope key JSON `[learnerId, skill, language, originExperienceId]` | Browser scope is for assessment ownership; never a trusted DB subject |
| `verb-explorer-learner-event.js` | e.g. `choice-select:1`, `observed:true`, `actor:'learner'` | Counter resets per JS runtime; source event does not authenticate learner |
| `question-word-assessment-contract.js` | assessment target must be explicitly declared; opportunity-only is not credit | Target declaration is not a server-issued authorization |
| `verb-explorer-choice-evidence-packet-bridge.js` | provenance correlation by occurrence ID | No new score/mastery/authority may be inferred |
| `verb-explorer-learner-trail-surface.js` and `verb-explorer-polyglot-word-path-view.js` | read-only progress and canonical witnesses | Presentation is not source of server authority |

## Exact mismatches preventing a safe direct connection
1. **Identity:** NICK is user-entered and in memory. The V30.3 Bridge accepts a test-only simulated proof; there is no valid login/session mapped to a server-owned opaque student subject. Never use NICK as a secure D1 row owner.
2. **Event identity:** Explorer events use `choice-select:1` style counters. The V30.2 mock rejects colons via `[A-Za-z0-9_-]{1,64}`. Moreover counters restart with page reload and would collide across visits. Persisted occurrence IDs need stable, idempotent, collision-resistant production semantics; implement only at the trusted boundary, preserving source occurrenceId for correlation.
3. **Assessment scope:** Explorer's canonical scope is `[learnerId, skill, language, originExperienceId]`. The current mock Bridge builds `questionWord/language/currentExperienceId`, omitting `skillId` and origin. This could mix distinct skill contracts or break transfer semantics. Specify a server canonical scope (including opaque subject, skill, assessment language, origin and relevant contract version) and treat current Experience separately.
4. **Authority:** Explorer event observations do not authorize `assessment` status or Green Pass. Server must resolve an explicit assessment target and versioned Pass Contract, verify a real principal and enforce `exploration` vs `assessment`; do not accept browser claims of credit, status or mastery.
5. **Durability:** The NICK panel and UI presentation memory are not server persistence. Define a minimal read-only authenticated restore protocol and ensure switching learner/QW/language does not erase another learner's record.
6. **Remote release:** The V30.3 HTTP write/read diagnostic routes were intentionally disabled (404) and shall remain disabled. Do not enable them to 'integrate' the Explorer. Remote staging and Access require a separate security review and explicit approval.

## Proposed next engineering slices — not yet authorized for live adoption
- **85A contract (this audit):** pin the two existing branch versions, document precise mismatches, run regression across the real Explorer's unmodified JS snapshot. Nothing is deployed.
- **85B trusted identity study:** decide provider/session and NICK-to-verified-subject mapping; implement a dedicated mocked server boundary only after reviewing current Explorer runtime, without browser-generated authority.
- **85C canonical storage-key migration study:** define a new backward-compatible D1 table or migration/dual-read strategy to preserve skill, origin, assessed language and per-learner ownership; design idempotent event IDs and rollback.
- **85D read-only restore study:** prototype authenticated reads into a separate observer, keeping Word Path and Trail read-only and never granting Green Pass on a D1 receipt.
- **85E staging gate:** revisit 85B–D, add provider/authorization security tests, then request explicit Cloudflare staging authorization. No deployment from mock code.

## Nonnegotiable invariants
- Switching QW, language, Experience or NICK must not erase another learner's evidence or automatically award credit.
- `observed_exploratory` and `pending` remain different states. `pending` is not an accepted Pass Contract.
- Assessment evidence originates in the canonical evaluator, not the NICK field, presentation panels or storage receipts.
- The original V30.3.80 Codespaces log and Worker bytes were not recovered. Historical hashes in `evidence/PROVENANCE.md` refer to missing originals; do not misrepresent reconstructed files as those originals.
- No production credentials or private learner data in this public repository.

## What constitutes GREEN for V30.3.85A
- Cross-branch audit CI PASS with exact pinned Explorer file blobs.
- The audit accurately reports incompatibilities rather than claiming functional integration.
- Prior recovery, SQLite, isolation and Wrangler local workflows continue PASS.
- The only modifications are in this isolated experimental branch, never in main or live Explorer.
