# Next ELO: authored multiword prepositions

Owner requested the next ELO after the second-turn release 92b3ef1. Scope: close the existing PREPOSITION target/head gap for ES después de and PT depois do in after-dinner-conversation, preserving all 648 sentences and all valid previous relations. No generic parser, evaluator or learner-history change.

Implementation: 36 ACTION/MOVEMENT cells (2 languages × 2 functions × 3 tenses × 3 modes) gain an explicit phrase-to-anchor mapping and one external case relation from después/depois to cena/jantar. PREPOSITION study uses ACTION: 18 newly interactive cases; MOVEMENT graphs also retain the authored relation. Full phrase remains highlighted and full sentence spoken. Scope text explains the token anchor and partial internal analysis. Orthographic do remains ADP+DET, without inventing de/o token separation or an internal fixed edge.

Reference distinction: UD https://universaldependencies.org/u/dep/fixed.html describes first-word anchoring of fixed expressions; https://universaldependencies.org/u/overview/tokenization.html requires syntactic separation of contractions for full UD annotation. This Explorer retains its partial orthographic representation, not a claim of full UD conformity. These sources inform the boundary; the specific two phrases are SIYAYO authored adaptations pending human linguistic review.

Acceptance: unchanged 648 sentence/target inventory; preserve existing graph edges except the erroneous Portuguese do-as-English-aux edges; exactly 36 explicit anchors/added external relations; valid Head Probes; browser all 18 new PREPOSITION tense/mode/language cases, EN single-word regression, phrase highlight, speakers/no credit, no stale notice after class/language switch, NICK isolation, portrait layout and original GEAR suites. Record publication and verification before completion.

Checkpoint: implementation published and verified. Baseline main 92b3ef1c267187b3392a15635a495396e2a55c7a. Do not claim human homologation or complete internal contraction analysis.

Baseline defect found by edge comparison: the shared auxiliary-word list incorrectly treated Portuguese do as English do in 18 ACTION/MOVEMENT cells. Explicit ADP+DET classification removes those 18 aux edges; exactly 36 external case edges added, all other prior edges preserved. The full 648 sentence/target inventory SHA256 remains d1d8be80c95a31a408af951a87306eddc6b3adc3466318523364fb30db856c1f. Phrase selection now brings the anchor/head into the diagram viewport, using the existing guarded scrolling behavior.

## Publication checkpoint — 2026-11-17

PUBLISHED: release 94964cb0f6fc78730fea5b9890087f57fb73aa5a. Candidate CI PASS https://github.com/siyayoacademy/siyayo-academy/actions/runs/44152380237 includes all 648 prior forms, new 18-case browser gate, 162 question/second-turn configurations, 216 targets and existing pedagogical flows. Actual preview https://857b474d.siyayo-academy.pages.dev passed all 18 new cases. Cloudflare main deployment https://02a77fd6.siyayo-academy.pages.dev succeeded; exact public adapter/corpus assets match the release. Main repeat CI: https://github.com/siyayoacademy/siyayo-academy/actions/runs/44153285971 . The unrelated baseline general corpus-schema failure remains outside this lot.

On resume: inspect this record, git status and remote main. Do not repeat the implemented expressions or alter full sentence text. Internal contraction segmentation and human linguistic/visual homologation remain open. Owner checklist and production evidence are in the session outputs directory.

Public production Chrome gate PASS for all 18 cases, exact text/locale, phrase highlight, current graph/probe, no credit, NICK, EN fallback and mobile viewport; no page errors.

Main repeat CI PASS: https://github.com/siyayoacademy/siyayo-academy/actions/runs/44153285971 . Publication and all required gates complete.
