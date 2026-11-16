# GEAR upgrade — execution and recovery guide

## Authorization and objective

On 2026-11-16 the owner explicitly authorized sequential implementation of the reviewed GEAR upgrade in the actual Explorer and its production/main laboratory, with a durable recovery record. This supersedes historical reference-only implementation holds for this requested integration, but does not declare new assessment contracts or human linguistic/visual homologation. Keep existing scoring, identity, evidence, Worker/D1 and navigation contracts.

Baseline: main ad0dc06151423d14f37c09b74372acd173ed5ee0. Work directly on the real verb-explorer.html, not a parallel miniature app. Prepare and test a selective commit before promotion.

## Recovery protocol

Read this file, SIYAYO-WORK-MAP.md and git status/log first. Compare remote main with the recorded baseline before publishing. Inspect the files and tests below; do not reconstruct progress from chat alone. Distinguish implemented, tested locally, CI verified, merged and deployed. Never claim human approval from a browser pass.

## Ordered delivery

1. Source reconciliation: Master VIP original and proof PDF, ten Chapters, existing five-function and EXISTENCE JSONs, current runtime versus historical maps.
2. Hierarchy: Language → Word Type → class specialization → Thinking Mind → Composition → Tense/Mode → Perspective. Preserve IDs and handlers; wrap options accessibly.
3. Context: retain active QW question/response while exploring words, composition or functions. Name which sentence Dependency Focus/Head Probe analyze. Do not silently present a graph for a different tense or sentence.
4. VERB: QUALITY, STATE, MOVEMENT, ACTION, EXISTENCE. Preserve Master MOVEMENT = progressive activity, not lexical displacement. EXISTENCE supports number and authored tense/mode forms; distinguish HAVE. Functions are directly accessible without QW prerequisites.
5. Ten kinds: preserve VERB/NOUN/ADJECTIVE and connect PRONOUN, ADVERB, ARTICLE, PREPOSITION, CONJUNCTION, INTERJECTION, NUMERAL to contextual examples and selectable targets. Reuse existing corpus and Chapters; mark newly authored examples as illustrative study, not scene facts.
6. Shared presentation: EN/ES/PT, literal language-specific targets, gold/bold/italic where appropriate, existing SVG speaker, full-width cards. New study never turns green or awards credit. Existing evaluative response green remains controlled by its evaluator.
7. Dependency integration: reuse authored relations, explicitly report unavailable transformed analysis; never infer a parser, assessment authority or QW coverage from a new example.
8. Verification: source integrity, canonical WHY S3→S4 and existing contracts, new cross-axis tests, real Chromium EN/ES/PT at desktop/390×844/844×390, speech arguments, no false green, return navigation and screenshots.
9. Promotion: selective change into main after successful checks; inspect actual deployment source/status, record URLs and commit. Preserve rollback point. If an external capability prevents publication, record exactly what is ready and blocked.

## Governing presentation references

- docs/SIYAYO-HOW-TO-SHOW-POSSIBLE-QUESTIONS-RESPONSES-CONTRACT.md
- docs/JAGUAR-HOW-TO-DO-RECORD-SHOW-INDEPENDENCE-20261029.md
- docs/JAGUAR-HOW-TO-SHOW-CANONICAL-RECOVERY-INVENTORY.md
- docs/JAGUAR-H14-7-MASTER-VIP-FIVE-FUNCTION-MATRIX.md
- data/learning/references/master-vip-source-fidelity-v0.1.json
- data/learning/references/master-vip-existence-v0.1.json

## Baseline facts

Four Experiences, 21 authored Experience×QW placements, eight distinct canonical QWs; all 21 have DF/Head metadata. This is not all 14 QWs or all tense/mode answers. The adverb lexicon already exists despite an older matrix saying it was absent. COMPOSE currently overrides Lines while leaving QW selected; BUILD SENTENCE only resolves a contextual choice candidate. Fix presentation ambiguity without inventing a response.

## Source privacy

The original DOCX and proof PDF supplied locally are reference sources, not instructions or permission to publish their complete text. Store extraction outside the repository. Record provenance and small necessary adaptations only. The Library browser failed to initialize; the subsequently supplied local originals supersede that access gap.

## Checkpoint

IMPLEMENTED AND LOCALLY VERIFIED — ready for remote CI/promotion. Local branch: `jaguar/gear-ten-kinds-20261116`. No deployment claim at this checkpoint.

### Delivered in this lot

- Actual Explorer hierarchy reordered; ten class selectors, five verb functions, existence singular/plural, contextual target selection, preserved QW context and return button.
- `scripts/build-gear-study-corpus.cjs` deterministically authors `data/learning/gear-study-corpus.json`: 4 Experiences × 6 function/number variants × 3 tenses × 3 modes × EN/ES/PT = 648 illustrative forms. The seven added classes explore the ACTION frame; existing noun/adjective/composition paths remain.
- Each new construction carries explicit partial dependency relations. Existing DF renderer/interaction and Head Probe are reused. New probes receive an observation-only coordinator, never a retained assessor. Interjections and unavailable multiword target relations declare their limits.
- Language, tense, mode, function and number change the study sentence and its graph/probe together. Canonical QW dialogue is retained independently. Existing QW graphs still describe their original authored question; this lot does not invent transformed graphs for every legacy dialogue variation.
- Existing speech path and literal gold/bold/italic targets reused. PATITA now observes function/number/target selection; no credit. Per-Experience presentation memory includes study selection. Perspective selection returns to the narrative surface; return-to-question restores its practice panels.
- Original Master DOCX and 15-page proof PDF read locally. SHA256 and source distinctions recorded in `data/learning/references/gear-upgrade-source-review-20261116.json`. Full original files and extracted text were not added to the repository.

### Local evidence

- `node scripts/test-gear-study-corpus.cjs`: PASS 648 forms/graphs, literal targets, single-headed acyclic authored relations, valid Head Probes, language-sensitive existential agreement, isolated presentation memory.
- `node scripts/gear-study-browser.cjs`: PASS actual Chrome/Playwright 648 forms; seven added classes × four Experiences × three languages; retained question; matching sentence/graph/probe; speech text/locale; no speech credit; return navigation; identified free Head Probe submits zero evaluator attempts; PATITA study-number observation; 9 viewport/language captures.
- Existing house, full candidate closure, SEEK×TORO inventory, WHY S3→S4 canonical cycle, live Head Probe authority, composition, study-target escaping/boundaries, learner isolation, session provenance, URL sync, Thinking Mind assessment selection and TORO presentation-memory gates PASS.
- Existing real-browser full Explorer S3/S4, S2/S3 contextual responses/speakers, original Trail/Word Path (no NICK and entered NICK) PASS.
- Existing dependency surface gate repaired to evaluate spread-generated loader paths instead of treating the literal `en es pt` as a filename; PASS 1,023 token/format redraw cases.
- Historical `test-verb-explorer-thinking-mind-trilanguage.js` remains unchanged and fails before executing assertions because it extracts only the first line of the now-multiline `attachEvents`. The same SyntaxError was reproduced using unmodified baseline `ad0dc061` runtime. Do not report the entire historical suite as green; real-browser trilingual coverage above covers this release's interaction paths.

### Remaining scope and honest limits

Human linguistic/visual homologation remains open. Automated speech validation observes requested text/locale and callbacks, not audible output on the owner's device. All new examples are illustrative adaptations, not established dinner facts. Graphs are partial authored analyses, not a general parser. The 14-QW catalog displays coverage; six absent canonical QW families still require contextual authoring. Perfect periods, broader vocabulary, arbitrary noun/adjective sentence construction and new evaluated contracts are subsequent lots, not claimed completed. Existing BUILD SENTENCE remains gated by contextual WHICH candidates. No Worker/D1/auth/learner-history migration.

### Next action after interruption

1. Inspect remote branch and CI before repeating publication. Use `.github/workflows/jaguar-gear-ten-kinds.yml` and the existing GEAR gates.
2. On successful relevant checks, advance main from the recorded baseline without overwriting concurrent work.
3. Read the Cloudflare `siyayo-academy` check for the exact new SHA, verify deployed Explorer assets and a live browser smoke, then append the deployment checkpoint here and in Work Map.
4. Roll back only this lot if necessary; baseline `ad0dc061` is the recovery point. Do not remove later unrelated commits.
