# JAGUAR 90C.7H.7 — PATITA P0: observation ledger, first integration

## What changed
- `js/verb-explorer-patita-interaction-trail.js`: browser-local, bounded append-only observation journal for button actions and current Explorer state (Experience, QW, language, tense, mode, word type, perspective, view).
- `verb-explorer.html`: load observer and show separate observation list inside expandable Learning Trail & Word Path.
- Works in free exploration independently of NICK and independent of canonical scoring; when a NICK exists, future events are attributed to that NICK. Anonymous events are scoped to this tab session and are not automatically attributed to a newly entered NICK.
- The journal is intentionally separate from legacy PATITA contextual-response storage. No historical migration or mutation.
- The journal records action type and control identifier, **not free-form text or canonical evidence**. Browser localStorage is limited to the latest 500 events and is not a remote backend or permanent durable learner archive.
- Observing a clicked assessment button does **not** imply the assessment accepted a response. Only the canonical evaluator can create evidence.

## Test policy
CI regression protects the existing S3 WHY and supervisor contracts; browser automation checks EN/ES/PT, 6 toggles, no spontaneous session, anonymous isolation and visible PATITA trail when expanded. Any RED means experimental, not homologated.

## Remaining P0 work
1. Complete **all** button types (including richer probes and dynamically generated choices), navigation via browser history, keyboard, accessibility interactions, and audio completion states rather than intent alone.
2. Create one canonical PATITA event envelope and projection from real probe result/evidence without granting credit or bypassing consent. Do not mix observed free practice with evaluator authority.
3. Decide when and how a learner may explicitly adopt anonymous history into a NICK; no silent adoption.
4. Verify retention, reset, and learner privacy before syncing to D1. No remote persistence in this ELO.
5. Generalize visible QW × language × Experience state separately from active assessment scope and ensure Word Path shows both, not falsely asserting active credit.
6. Only after P0 is validated, authorize flexible per-Experience assessment opportunities and new Master VIP lexical material, keeping skill requirements strict but route order free.

## Governance
No production, main, PR #3, Worker/D1 mutation or Cloudflare preview. This is a lab prototype; 90C.7H.3 preview remains not homologated. PATITA observations are not a substitute for Evidence.
