# JAGUAR 90C.7H.4 — Human regression after 90C.7H.3: scope and navigation audit

## Trigger
User screenshot set for 90C.7H.3 `2e4139f1.siyayo-academy.pages.dev`. User reported that the situation became worse; **human acceptance failed**. Never describe the deployed 90C.7H.3 preview as homologated or ready for production.

## Grounded observations
- S1 WHAT EN 1/3 correctly present in read-only Word Path.
- CUÁL ES contextual response recognized in green and scored 4/4; not equivalent to a canonical Green Pass / Learning Trail contract completion.
- Other snapshot displays active WHICH PT 2/3 when viewing a Spanish QW; visual language and active assessment are distinct. Does not imply evidence loss by itself, but is a user-facing coherence concern requiring supervised reconciliation.
- After dinner S4 WHY ES displays exploratory LINES with no WHY owner (Word Path shows WHY not started). Without an authorized S3 WHY assessment, this is **correctly not a transfer opportunity**, but the interface previously lacked explicit explanatory navigation for WHY S4.
- Cross-language Chromium test 90C.7H.3 covered authorized WHAT in S1 → explicit select WHY S3 → WHY transfer S4, but **not** every direct-S4, mixed-QW, mixed-language user navigation or longitudinal replay path.

## Implemented here
- In `js/verb-explorer.js` `renderAssessmentEntryNotice`: S4 WHY without retained S3 origin receives an EN/ES/PT advisory to return to S3 and start authorized WHY there. No Session/Attempt/Evidence mutation.
- Chromium test exercises direct S4 with nick and WHY EN/ES/PT; must show notice, hide WHY assessment panel and never invent a session.
- Existing six cross-language S3 origin→S4 transfer regression reruns to prevent regressions.
- First CI failed on a temporal-dead-zone reference to `decision` in the advisory patch; corrected that mistake before verification. **Do not omit the initial RED from audit history.**

## Remaining product work, NOT claimed fixed by this ELO
1. Implement generalized language/QW reconciliation for WHICH/WHAT/WHERE/WHY: source of truth = scope(learnerId, skill, language, originExperienceId), never visual language alone. A language change must not create an assessment silently; explicit QW selection may resume matching recorded scope or start a *declared* origin only.
2. Test real mixed navigation: active WHAT EN S1 1/3; WHICH PT S1 2/3; CUÁL ES observed 4/4; switch to S3 WHY PT, QW toggles; return S4 ES without S3 WHY ES; preserve all scopes, visual status and user guidance.
3. Differentiate green contextual-candidate 4/4 from contract GREEN PASS 3/3 with clear module labels.
4. Verify retained snapshots and cross-language order independently, with screenshots and before/after progress. Do not overwrite historical NICK data.
5. Separate S4 transfer authority from S3 origin, handle all missing-entry cases, and preserve all assessment panels only when scope matches.
6. Human acceptance in a **new isolated preview** after negative + positive tests; no production/main/PR#3 or Worker/D1 changes. SHARE/PRINT remains unverified.

## Governance
90C.7H.3 human verdict: **NOT HOMOLOGATED**. 90C.7H.4 is an experimental corrective gate (advisory + regression), not full general reconciliation and not production authorization.
