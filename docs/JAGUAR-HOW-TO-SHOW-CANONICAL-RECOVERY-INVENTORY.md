# JAGUAR — HOW TO SHOW / response modules: canonical recovery inventory

**Status:** VERIFIED SOURCE INVENTORY / DIVERGENCES OPEN — **not** a claim of restored or homologated runtime.  
**Scope:** SIYAYO Academy · Verb Explorer · EN/ES/PT · portrait-first; isolated to `jaguar/verb-explorer-resume-live-wire`.  
**Reason:** recover previously agreed HOW TO SHOW patterns before further visual commits; eliminate ungrounded substitutions and repeated implementation work.  
**Evidence:** user-provided annotated screenshots in the active discussion; live source inspection of `docs/SIYAYO-WORK-MAP.md`, `docs/siyayo-canonical-development-map.md`, `js/verb-explorer-what-assessment-live.js`, `css/verb-explorer.css` on Jaguar; earlier browser inspection. Screenshots are discussion evidence **not committed as assets**. Do not claim they are in the repository.

## A. Reference hierarchy (the lighthouses)

1. **Current explicit user acceptance / instructions**: portrait priority; gold SVG Speaker **integrated on the LEFT inside the answer card**, answer text in the right pane; all alternatives must remain accessible, in their pedagogical order; active UI green `#56C877` is a *new* request, **not** recovered legacy design. Audio must not award Evidence.
2. **Source checkpoint JAGUAR-LIVE-15 — WHAT visual alignment with WHICH**, in `docs/SIYAYO-WORK-MAP.md`: full centered response cards, two columns in landscape, one in narrow portrait; **at most two object-answer candidates per presentation page** with previous/next; pagination itself produces zero Attempts. The record cites historical baseline `cbca74b68dffa76dfd0ae9cbcff8ec01aaf68ec9`. This conflicts with the more recent request to avoid hiding the third alternative. **DO NOT silently choose one: preserve both as provenance and resolve exact latest acceptance rule before another pagination rewrite.**
3. **Source checkpoints LIVE-31 / LIVE-32 / LIVE-33** in `docs/SIYAYO-WORK-MAP.md`: standard gold speaker delegated to existing language-aware speech; left placement; for diagnostic question cards the *entire question card* is the native speak button, gold icon is decorative, no nested buttons, no answer event. **Scope is diagnostic question**, not automatically a mandate to make answer cards one big speech button. Preserve separate semantics of speaking vs selecting.
4. **Current canonical development map** `docs/siyayo-canonical-development-map.md`: English Face/MASTER VIP/Fine Art are study-level mappings; latest annotated green/answer/speech audit. Do not treat proposed components as implemented.
5. **Actual runtime files**: `js/verb-explorer-what-assessment-live.js` and `css/verb-explorer.css`, plus existing `js/verb-explorer.js` and presentation-copy. These prove what code exists, **not** what was deployed, heard, or homologated.

## B. Audited component matrix

| Component | Existing reference | Jaguar HEAD observed in code | Divergence / risk | Next action | Acceptance |
|---|---|---|---|---|---|
| WHAT contextual response cards | User-approved card screenshot: gold speaker integrated in **left cell**, response text right; portrait priority | `what-probe-response-row` wraps separate audio + answer buttons; CSS grid `56px minmax(0,1fr)`, 48px in narrow container | DOM has two buttons in a row; not yet proven visually equivalent to original integrated full-width card. Browser inspection reported failure to confirm homologated full-width form | Compare screenshot/actual rendered dimensions, width and borders with source card component; reuse existing styling/token and markup where possible, **do not invent third design** | User confirms left gold SVG, integrated card, centered legible text, consistent width in portrait |
| Speaker SVG | LIVE-31/32/33 for diagnostic questions; user reference for answer cards | `what-probe-speaker` contains `span.siyayo-speaker` on left | SVG gold appearance not confirmed in deployed portrait; distinct question-card vs answer-card behavior must be maintained | Verify computed SVG rendering and inherited gold color; check shared speaker component; compare older screenshot | Visible gold speaker at left in each answer, keyboard/touch access |
| Speech EN/ES/PT | Existing browser speech, language-aware, no assessment events | WHAT code uses `SpeechSynthesisUtterance` with `en-US/es-ES/pt-BR`, stops propagation | Audible playback, actual voice and ES/PT accessibility labels not fully tested; availability depends on browser/device | Test click, touch, Enter, Space, actual audio EN/ES/PT, cancellation; no answer submission | Audible correct language and no Evidence/Attempt from listen |
| Alternative order | User: previously consolidated ordering and visibility | `spec.alternatives.forEach` keeps authored order | Good in code, needs rendered verification after any layout changes | Test full corpus alternatives, no shortening or reordering | All canonical candidates reachable, source order retained |
| Pagination WHAT | LIVE-15: max 2 visible per page, labelled previous/next | Recent code removed pager and renders all alternatives simultaneously (commit `9e7859b`) | **Documented conflict** between LIVE-15 historical specification and newer explicit user direction to keep choices visually present; no assumed resolution | Present provenance and exact design choice; no automatic revert | Explicit current acceptance; no hidden third option against approved current rule; paging never awards Evidence if retained |
| Selection / active green | User explicitly: NEW feature, green equal to Dependency Focus SVG reference | `--siyayo-selected-green:#56c877` in CSS; green applied to multiple selected controls | UI active != Green Pass. CSS specificity/inline colors can override and affect contrast | Inspect actual computed style for QW, tense, mode, perspective, answers in EN/ES/PT | Green `#56C877` on active controls, white text and gold outline, no disabled false positives |
| WHICH R1/R2/REVIEW | Prior Jaguar sequencing contract: alternatives → selection → feedback → REVIEW | Not modified by WHAT-specific recent code according to inspected scope | Regression not yet fully run against latest deployment | R1 and R2 separate QA nick, EN/ES/PT; verify feedback order and contextual score | REVIEW never precedes choice/feedback; 0/4–4/4 contextual fit != 0/3–3/3 contract |
| NICK / Learning Trail / Word Path | Canonical learner-scoped evidence and language/QW isolation | Existing separate components; WHAT free exploration is documented as non-graded | Layout or speaker interactions must not create Attempt, erase state or grant Green | Run EN→ES→PT→EN and WHAT↔WHICH with preserved nick | No spurious contract Evidence; language/QW independence |
| Circumstance labels | EN/ES/PT presentation-copy and prior correction `60be3f4` | Initial transient English strip removed; localizer retained | Deployment and timing must remain validated after subsequent commits | Inspect ES/PT rendered values and any flashes | No stale English label on ES/PT |
| Portrait / landscape / desktop | User portrait-first, LIVE-15 one-column narrow / two-column wide (historical) | Current CSS forces one-column WHAT answers; `@container` narrows left icon cell | Need verify desired landscape layout without sacrificing portrait and without conflicting with latest acceptance | Capture real phone portrait + landscape + desktop; measure overflow/wrapping and scroll | No clipping, overlay, horizontal overflow or hidden answer/speaker |
| HOW TO SHOW catalog | Historical fragments across work map, screenshots and CSS; MASTER VIP integration design | No complete independently audited per-component registry yet | Memory is distributed; treating a fragment as universal creates regression | Build catalog from actual approved snapshots and named source contracts; label gaps explicitly | Every UI patch names a source checkpoint and acceptance screenshot/test |
| Deployment | Branch Jaguar preview separate from `main`; PR #3 merge conflicts | GitHub commits can be confirmed independently from Cloudflare deployment | Commit existence != preview version != visual homologation | Verify SHA in repo and Cloudflare deploy identity; test preview; obtain user acceptance | No merge/main promotion without separate authorization |

## C. Recent relevant commits and classification

- `60be3f4` — circumstance localization render correction; **code committed**, partial browser regression, not comprehensive homologation.
- `981f403` — NEW active-button green visual; followed by `3f291d4` to align approved `#56C877`; **new feature**, not recovery.
- `9e7859b` — remove WHAT two-per-page pagination; **requires reconciliation** with LIVE-15 before treating as canonical.
- `8bba43d` — introduced right-hand standalone WHAT speech control; **known HOW TO SHOW regression**.
- `05a1197` — moved speech left and reused `.siyayo-speaker`; **code committed**, not proven equivalent to homologated card.
- `876f9b0` — portrait-first WHAT card CSS; browser inspection **did not confirm** fully homologated card geometry.
- Current inventory commit is **documentation only**. Do not claim fixes from writing this file.

## D. Immediate execution order — NEXT GO

1. **Recover reference**: locate original response-card markup/CSS and approved screenshot/checkpoint, including exact speaker integration, typography, padding and responsive geometry; distinguish WHAT answer from diagnostic question and WHICH R1/R2.
2. **Measure divergence**: actual DOM/computed styles, screenshots and content at desktop/portrait/landscape; verify deployment identity before editing.
3. **Resolve one explicit conflict**: LIVE-15 two-per-page vs latest all-visible request. Do not overwrite historical documentation; record chosen current acceptance.
4. **Minimal corrective patch**: reuse existing HOW TO SHOW presentation and gold SVG; no corpus, NICK, evaluator, Green Pass or contract change.
5. **Functional tests**: EN/ES/PT, all candidates, keyboard/touch, actual speech, no audio Evidence; R1/R2/REVIEW; language/QW scope; no overflow.
6. **Release gate**: verify GitHub SHA, Cloudflare deployment SHA, live preview, user visual homologation; `main` untouched.
7. **Scale only after this gate**: map MASTER VIP and Ten Kinds/14 QWs by source, capability, word type, language, QW, Experience, speech, visual role and authorized assessment. Use English Face/disks as adapters; do not build a parallel engine.

## E. Immutable distinction of statuses

- **DOCUMENTED**: source and intended behavior recorded.
- **IMPLEMENTED**: code exists in branch.
- **COMMITTED**: GitHub confirms SHA.
- **DEPLOYED**: exact build/commit is identified on Cloudflare.
- **TESTED**: specified scenarios executed with recorded results.
- **HOMOLOGATED**: user accepted the demonstrated result.

Never advance status because a preceding status passed. When evidence is missing, mark **OPEN**, not **ABSENT** or **DONE**.

**No runtime/CSS changes, no merge, no deployment promotion authorized by this inventory.**


## F. Historical LINES reference and next visual recovery gate

**Verified origin:** The `LINES / POSSIBLE RESPONSES` panel appears in `verb-explorer.html` at Git commit `5137862734` (2026-08-29), with the `living-window`, `livingLines` and navigation elements. Earlier inspected HTML versions did not contain this panel. The current approved WHICH panel, as shown in the user's screenshot, is the visual HOW TO SHOW reference for question and response lines.

**Visual contract:** golden SVG speaker integrated at the left edge of each card; centered legible response text on the right; consistent border, padding, typography and card width; ordered responses; portrait-first with landscape and desktop checks. The speaker interaction is distinct from answer selection and must not create assessment evidence.

**Historical conflict to resolve:** checkpoint JAGUAR-LIVE-15 records at most two WHAT responses per presentation page, whereas the latest requested WHAT design displays all three ordered responses without hiding the third. Both are documented; do not silently overwrite the earlier checkpoint. The currently accepted presentation must be explicitly verified against the current user's visual instructions.

**Code-level discrepancy:** In `css/verb-explorer.css`, the older `.what-canonical-panel .what-canonical-options` two-column rule has greater specificity than the newer `.what-canonical-options` one-column rule. Verify computed styles in the deployed preview before patching. The WHICH card uses its existing `.choice-option`, `.choice-audio` and `.choice-select` presentation; WHAT currently uses `.what-probe-response-row`, `.what-probe-speaker` and `.what-probe-option`. Reuse the approved visual arrangement, not the assessment event wiring.

**Release gate:** source diff -> minimal CSS/markup correction -> check all alternatives -> test speech EN/ES/PT without Evidence -> portrait/landscape/desktop -> R1/R2/REVIEW and NICK/Learning Trail regression -> verified commit SHA and matching preview -> user homologation. No merge to main.

**Privacy rule:** Keep this recovery entry limited to technical checkpoints and public commit identifiers. Do not insert learner nicks, personal names, e-mail addresses, telephone numbers or device identifiers.

**State at writing:** historical origin VERIFIED; HOW TO SHOW visual reference USER CONFIRMED; CSS issue IDENTIFIED; corrective CSS commit, deployment verification and complete regressions PENDING.


## G. WHAT/QUÉ/O QUE assertive-response presentation rule (2026-10-18)

User homologated full-width, ordered WHAT answer cards in EN/ES/PT and the left-integrated golden SVG speakers; user reports speech functional in all three languages. **New specific HOW TO SHOW contract:** use the existing active-control green `#56C877` with dark-blue text `#07162A`. For WHAT/QUÉ/O QUE **response candidates**, green is shown if and only if the chosen candidate has a positive evaluation result (`evaluated.result === 'pass'`); an incorrect choice must not receive green merely because it was selected. The Question Word choice control remains a separate active-control state and can use green with dark-blue lettering. Do not confuse this presentation signal with a Green Pass, accepted contract Evidence or progression.

Implementation on Jaguar branch: `js/verb-explorer-what-assessment-live.js` commit `f204176fcafbf39b144387c1075d3ed2ca5f7ebf` sets `what-answer-assertive` only for the chosen option after a positive probe evaluation. `css/verb-explorer.css` commit `ebaa590fddb22e7eadf68ba4b6c0facf37b9ede7` styles the affirmative response green with dark-blue text, while a selected non-passing response retains the dark card background. This applies to the common EN/ES/PT rendering path.

**State:** user visual homologation applies to the prior full-width cards and speech, not yet to this new conditional-color implementation. Commits VERIFIED; deployed SHA, positive/negative behavior in EN/ES/PT, portrait regression and Green Pass noninterference NOT YET TESTED. Main untouched.


## H. Jaguar ten-elo execution queue — release gates

This queue records the user's instruction to progress through ten linked ELOs before a consolidated Cloudflare visual review. **One ELO is not automatically one commit**; each gate needs verifiable evidence.

1. **ELO 01 — Conditional WHAT color**: EN/ES/PT `evaluated.result === 'pass'` alone may mark an answer assertive. JS commit `35e73825b6fac50110abf2cc383f58ad89cca74d`, CSS commit `137149d7c48650fe63454c911958f84c8b1d7746`. SOURCE IMPLEMENTED, deployed confirmation PENDING.
2. **ELO 02 — Rejected answer state**: parsley/perejil/salsa must remain dark even when selected; check hover, focus, click and reselect. PENDING deployed regression.
3. **ELO 03 — Correct answer state**: salmon/salmón/salmão must display green `#56C877` and dark-blue `#07162A`; selection is not Green Pass. PENDING deployed regression.
4. **ELO 04 — Active controls**: Question Word WHAT/QUÉ/O QUE and other active gear controls use homologated green/dark-blue, without confusing active UI with positive answer assessment. PENDING.
5. **ELO 05 — HOW TO SHOW**: preserve three full-width ordered answer rows, integrated golden speaker at left, no hidden pagination; user homologated layout and speech on 2026-10-18. NEW COLOR RULE PENDING.
6. **ELO 06 — Audio and input separation**: speech EN/ES/PT remains functional, speaker click must never select or submit evidence. User-reported audio PASS; automated noninterference regression PENDING.
7. **ELO 07 — Contract evidence**: anonymous exploratory choices never produce canonical Evidence; NICK CHOICE/USE/TRANSFER, Green Pass and Word Path must not be changed by CSS. PENDING.
8. **ELO 08 — R1/R2/REVIEW**: maintain feedback then review, contextual 4/4 independent of contract 0/3→3/3, without touching existing accepted WHICH paths. PENDING.
9. **ELO 09 — Responsive release**: compare portrait-first with landscape/desktop and EN/ES/PT; verify Cloudflare preview deployment corresponds to commit SHA, not just GitHub source. PENDING.
10. **ELO 10 — Consolidated user review**: provide branch preview URL, exact deployed SHA, passing/failing checks and known gaps; request visual homologation before any separate main promotion. PENDING.

**First live-browser observation, before latest JS/CSS commits:** all three languages showed full-width rows and pedagogical pass/fail feedback, but active Question Word and answer colors differed from the new user requirement; some icon-color observations conflict with user-provided screenshots. Treat as PRE-FIX BASELINE, not final verification. Do not claim audible tests by browser automation. No main merge.


## I. Active QW and assertive WHAT bold typography

User screenshots on 2026-10-18 identified that default active WHAT appeared dark-blue/white, including after learner NICK entry; user also homologated the WHAT response green/dark-blue colors and requested **BOLD** typography. Canonical HOW TO SHOW presentation rule: whenever an active gear control has the approved green background `#56C877`, use dark-blue `#07162A` with `font-weight:700`. The active Question Word must have this appearance on initial render and after NICK reinitialization, without awarding any assessment credit. For a WHAT/QUÉ/O QUE response, green + dark-blue BOLD is only permitted for an evaluated passing answer. Incorrect selected answers remain dark and must not receive the green style.

CSS implementation commit `ff2bde1ebc3a4d121e530205e4e661abb2e662be` overrides the previous `#questionGear .gear-option.question-word-practicing` dark background when `.active` and strengthens positive answer typography. **Source commit confirmed; Cloudflare deployment, initial/NICK state and EN/ES/PT regression not yet verified.** No main merge.
