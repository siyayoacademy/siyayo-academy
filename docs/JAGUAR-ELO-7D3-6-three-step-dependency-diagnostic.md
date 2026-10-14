# JAGUAR · ELO 7D.3.6 — Three-step Dependency Link Diagnostic

**Baseline:** PR #3 / `de9d7d82cd05820f2343e3b89ce5b2404fda0766`  
**Status:** prepared implementation, not yet published or visually homologated.  
**Authority:** user GO for a presentation-only ELO; no new Assessment Target, Pass Contract, Green Pass, or TORO routing.

## Approved teaching method

A recognized Head Probe is divided into three visually separated reading phases:

1. The exact **canonical reference sentence** (EN/ES/PT).
2. The **investigated question word** taken from the canonical target token; no guess from screen language alone.
3. The **short binding question**, with anaphoric wording rather than repeating the original full quotation.

Shopping example:

| EN | ES | PT |
|---|---|---|
| Which cheese should we choose? | ¿Cuál queso deberíamos elegir? | Qual queijo devemos escolher? |
| **WHICH** | **CUÁL** | **QUAL** |
| Which noun does it modify? | ¿A qué sustantivo se vincula? | A qual substantivo se liga? |

Learner alternatives remain underneath in the existing order, with exactly the same candidate IDs, event boundaries and expected head. No automatic Evidence or Green.

## Scope, fallback and audio

- `js/adaptive-dependency-head-probe-browser-wire.js`: presentation-only segmentation using the original authored English, Spanish or Portuguese phrasing. Exact target-term validation is required. Unmatched prompts are rendered verbatim using the previous presentation path.
- `css/verb-explorer.css`: appended, scoped typography and spacing for three text phases, including Portrait. Keep the speech-card as a single accessible **native button** with its existing golden speaker.
- **Speech continues to read `view.prompt` exactly as authored**. The display is abbreviated, but this ELO does not revise audio text or pronunciation rules.
- The validated output samples all **27 present QW × Experience × language prompts** (WHAT/WHERE/WHICH/WHY depending on stage); new lexical roles require future corpus-driven approval and no forced segmentation.
- The historical fixture `Which word is the head of “three”?` keeps its original form, demonstrating safe fallback. Historical books/Portuguese livros corpora remain untouched.
- `scripts/test-head-probe-corpus-presentation.js` updates the old hardcoded `<br>` expectation.
- `scripts/test-jaguar-head-probe-three-step-presentation.js` verifies all currently authored probes, native candidate controls, historic fallback, untouched speaker text and no learner-action submission from audio.

**Regression / homologation matrix:** EN/ES/PT × Shopping / Preparing / Having / After Dinner where Head Probe exists × AUTO/Portrait/Landscape × speaker × keyboard/tab focus × candidate choice with/without NICK × zero unapproved Evidence / unchanged WAIT/Green. Real-browser manual QA after preview deployment remains mandatory.
