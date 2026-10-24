# JAGUAR H14.16 — FUNC-13 Browser QA and selective integration gate

Parent: H14.15 GREEN, commit `63dcaa67532aaadbe4201607ad540eb75c5541b1`.

## Browser verification — not assessment approval

GitHub Actions runs real headless Chromium at **1440×900 desktop**, **390×844 portrait** and **844×390 landscape**. Tests:
- experimental opt-in via `?mode=experience&h14_14=preview`;
- normal URL without preview flag keeps FUNC-13 hidden;
- expected LINES and Learning Trail containers remain present;
- EN/ES/PT switches update module context;
- five-function control (EXISTENCE);
- NARRATING perspective retains yellow;
- NEGATIVE displays non-authored content rather than a fabricated response;
- viewport horizontal overflow and full-page screenshots archived as Action artifacts;
- uncaught browser JavaScript exceptions trigger failure.

**Scope caution**: automatic existence checks are NOT human visual homologation, audio quality certification, learner evidence correctness or a complete interaction audit across all QWs. Screenshots need manual inspection in GitHub artifacts. This workflow adds tests and documentation only, no canonical source/Explorer/UI change.

## Divergence with main — differential adoption, no merge

At audit, `main` HEAD `c2149f5e63b8de716cf9b9dcdede213bd328344e` is one independent commit beyond the shared ancestor. That commit publishes the approved trilingual Academy homepage and chapter summaries; **do not reverse or overwrite**. H14.15 HEAD is ~1,726 commits ahead and one behind the main branch. The count is history topology, not a reason to merge wholesale.

The files `verb-explorer.html`, `js/verb-explorer.js`, `css/verb-explorer.css` and `data/learning/experience-seeds.json` differ between `main` and the experimental lineage. These older production sources lack many of the features on which FUNC-13 depends (Experience navigation, original PERSPECTIVE corpus and state). Thus it would be unsafe to cherry-pick only FUNC-13 JavaScript directly onto main and claim it works.

### Selective reconciliation prerequisites
1. Identify intended **future Explorer baseline**: current experimental Explorer for controlled preview, or a separately reviewed main-derived integration branch.
2. Audit **actual dependencies** of the H14.15 Explorer (runtime, presentation memory, four Experiences and colors, source matrix, CSS, PATITA boundaries) and main-only homepage changes. Create a dependency-closed **minimal patch**; do not copy the thousands of commits.
3. Test baseline compatibility and loss of functionality with the new browser E2E suite plus existing corpus/contract regressions.
4. Human review screenshots: desktop, narrow portrait and landscape, EN/ES/PT, speech, scroll, and Learning Trail/Word Path.
5. Before production, require separate pedagogical homologation and explicit merge/deploy authorization.

## Privacy, identity, evaluation and audio boundaries

In FUNC-13: presentation-only, no recording, scoring, persistence or novel speaker. PATITA and approved contracts remain separate. Master VIP functions are exactly QUALITY, STATE, MOVEMENT=TO BE+ING, ACTION, EXISTENCE=THERE+TO BE. No QW prerequisite, no imposed S1→S4 sequence. The experimental preview flag is OFF by default. `main`, PR #3, Cloudflare and remote Worker/D1 remain untouched.
