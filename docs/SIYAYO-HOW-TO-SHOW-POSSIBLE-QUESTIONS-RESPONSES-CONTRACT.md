# SIYAYO · HOW TO SHOW · POSSIBLE QUESTIONS ≠ POSSIBLE RESPONSES
**Owner:** user-defined/homologated visual reference; 2026-10-04 and 2026-10-18 agreements, expressly reasserted with two annotated screenshots 2026-10-22. **Protocol:** JAGUAR 89X / read first at each new chat, ELO and memory-resumption. **Status:** visual contract approved, latest WHAT/WHERE/WHY UI implementation **not** human-homologated. This record is durable and must not be replaced with a generic “speaker exists” checklist.

## 0. Non-negotiable ordering — WHAT before HOW
1. Ground question from canonical Corpus/Experience/Thinking Mind/QW and its chosen language and tense/mode/perspective. No invented answer.
2. Identify authorized Assessment Target, learner/NICK, skill, assessment language and origin Experience. Determine whether the probe is free exploration, function, local answer or transfer.
3. Define correct canonical alternatives, expected alternative IDs, evidence dimensions, support conditions, evaluator and Pass Contract. Incorrect, assisted or exploratory choices are not accepted evidence merely because clicked.
4. Only **after** the semantic and evaluation contract is known, render the two different visual modules below. Never let CSS/green decide grading.
5. Project accepted witnesses only to Learning Trail / Word Path; continue preserving QW × assessment language × origin × learner; no evidence from screen changes, visit, audio requests or NEXT.

## A. POSSIBLE QUESTIONS — GREEN annotations in 2026-10-22 images
- One coherent, full-width semi-rectangular **question** card per authored probe, with gold **SVG speaker** at left; actual question text centered, generous padding, no clipping. Do not cram speech into a detached circle, split the question into narrow columns, or use a pill.
- The appropriate *Question Word* is **bold gold** using the existing `SIYAYOStudyTargetPresentation.highlight` and `.study-target-word`, except when highlighting it would disclose the answer being assessed (e.g. QW identification/function choice). Case-appropriate, language-accurate; not a blanket regex on any matching substring.
- Tapping/clicking the speaker speaks the localized question and **does not** submit an Attempt, Evidence, or Green Pass. Keyboard and viewport support are required.
- If the same authored question repeats across assessment stages, keep distinct step semantics; do not merge/erase authorized stages merely for appearance. Reuse the same question-card component and exact corpus wording.

## B. POSSIBLE RESPONSES — ORANGE/RED annotations
- **One full-width horizontal row PER alternative, at desktop AND in portrait and landscape.** No parallel narrow answer columns and no shrinking text into vertical stacks.
- **Cell 1:** independent gold SVG speaker button (speech only). **Cell 2:** centered, line-wrapped, semi-rectangular evaluative response button using the exact canonical alternative ID. Both form one aligned card. Do not put a floating speaker *outside* its alternative row.
- For QW discrimination options such as QUÉ / DÓNDE or location-function options such as LOCATION / DESTINATION, these are still *response alternatives*, not question-card content. Apply exactly the same response-row module (even for short words).
- Preserve all approved alternatives and order; do not silently paginate away the remaining answers. Keep tooltips/ARIA accessible.
- **Green `#56C877`, text `#07162A` ONLY when positively assertive/accepted by the proper authorized evaluation.** Incorrect, selected-but-unaccepted, assisted WHERE local evidence and free exploration must not masquerade as accepted Green Pass. Neutral response is dark blue, gold border. Question Words are gold/bold only as pedagogically safe.
- Speaker request is not speech `onstart`; WHERE audio support is sticky only after the native started speech observation and never becomes an independent local/transfer witness.

## C. Existing reference and placement
- Preserve homologated WHICH LINES/POSSIBLE RESPONSES / REVIEW (reference Aug 29 commit `5137862734`, HOW TO SHOW registry Oct 18 `41b6382`), speaker SVG to the left, centered response text, active asserted answer green with dark navy text.
- KEEP Dependency Focus → Head Probe above Experience grid; KEEP specialized practice in LINES area; KEEP NEXT learner-owned; KEEP Learning Trail + Word Path independent expandable module below grid. Do not place Trail inside POSSIBLE RESPONSES.
- WHY S3→S4 2/3→3/3, WHAT S1/S2 origins, WHERE candidate support conditions, WHICH R1/R2+REVIEW must not change their scoring or contract during a presentation-only patch.
- The evaluation surface's `0/3→3/3` and longitudinal marker `○ ◐ ● ★` must agree with Trail and Word Path; display language versus assessment language must remain explicit and non-interchangeable; accepted witness includes QW/skill, language, learner and origin.

## D. Required gate, every ELO
1. Diff exact code references vs this document and attached visual references; name the QW, Experience and visual modules examined.
2. Validate original contract/evidence with canonical tests **before** HOW TO SHOW assertions.
3. Assert each real DOM question has exactly one legible full-width question card + gold speech, all possible responses have full-width two-cell speaker/answer rows and approved order, and wrong/assisted/exploratory choices are NOT green.
4. EN/ES/PT, desktop, portrait 390x844 and landscape 844x390: measure bounding rectangles, full-width ratio, word wrapping, accessible click targets, QW gold exceptions and no global horizontal overflow.
5. Verify no audio click changes Evidence, Trail progress, Word Path history, or NEXT; WHERE native `onstart` support never implies independent credit.
6. Compare Trail/Word Path before/after QW, language, NICK and Experience changes. Check saved vs current origin and no duplicate cards/credits. No silent 0/3→3/3.
7. Attach real browser screenshots (not only mocked DOM) and review with user **before** lab→PR #3 or production promotion.
8. If tests omit a geometry or visual-acceptance requirement, a green CI cannot be described as complete HOW TO SHOW homologation. RED → investigate, not remove the authority check to make CI green.

**Files/owners:** `js/verb-explorer-{what,where,why}-assessment-live.js` (module actions), `css/verb-explorer.css` (presentation); `js/verb-explorer-learner-trail-surface.js` and `js/verb-explorer-polyglot-word-path-view.js` (read-only); no new authority. Expansion into other QWs and PAST/FUTURE comes after grounded contracts and separate approval.
