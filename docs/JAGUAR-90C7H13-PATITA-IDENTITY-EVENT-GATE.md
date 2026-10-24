# JAGUAR 90C.7H.13 — PATITA identity event integrity

## Diagnosis grounded in browser
The original H12 automated test reported that #learnerIdentityChange was not visible in a test path. H13 diagnostic Chromium shows that its compact identity view **does** become visible after explicit NICK confirmation and remains visible on WHICH selection and the S1→S2 navigation, in EN/ES/PT. Therefore do not label this a deterministic CSS defect or alter layout speculatively.

The canonical learner identity source does not persist or authenticate the user. Explicit NICK input is required; reload cannot silently recreate identity from PATITA browser-local observations.

## End-to-end gate
`scripts/experimental-patita-h13-switch.py` checks that the real UI button changes ALPHA→BETA→ALPHA; BETA cannot view ALPHA PATITA outcome records, and ALPHA can see its own bounded local history after explicit return. `scripts/experimental-patita-h13-diagnostic.py` captures UI identity state and screenshots before/after NICK and navigation. Check latest H13 workflow before claiming completion.

## Follow-up risks
- Clicking the identity button in different contexts may race with async session readiness or render. Do not auto-restore NICK on page reload.
- Local PATITA journal is at most 500 events; it is not a permanent archive or D1 learner database.
- Word Path canonical Evidence remains independently owner-scoped. Display of observations never counts as Pass Contract 0/3→3/3 evidence.
- Testing BETA via a direct identity provider would not certify actual button accessibility, so H13 uses the real UI. No production/main/PR #3/Worker or Cloudflare deployment.
