# JAGUAR · ELO 7D.3.5 — Shopping WHICH/QUAL contextual Dependency Focus

**Audit baseline:** `8f810c5f8b122df368d3f454f4bda61e67215c68`. **Status:** implementation prepared; separate authorization required for publication and visual homologation.

## Purpose

Shopping WHICH in EN and QUAL in PT previously displayed the book-based canonical Dependency Focus, unrelated to the actual shopping question. The question-level ES dependency structure already points to the cheese; it is preserved without rewriting its content.

| Language | Canonical question | DET → NOUN | Probe asks for | Correct token ID |
|---|---|---|---|---|
| EN | Which cheese should we choose? | Which → cheese | noun modified by Which | `cheese` |
| ES | ¿Cuál queso deberíamos elegir? | Cuál → queso | sustantivo vinculado a Cuál | `cheese` |
| PT | Qual queijo devemos escolher? | Qual → queijo | substantivo ligado a Qual | `cheese` |

## Ownership and tests

- Only the **question-level** Shopping WHICH Focus and Head Probe metadata are changed for EN/PT; ES metadata, the QUESTION itself, the contextual choice candidates, skills and Pass Contracts stay as authored.
- New explicitly authored corpus units: `shopping-which-en.json` and `shopping-qual-pt.json`. The runtime loader adds both with exact IDs. No cross-language fallback.
- English shows explicit `we` as `PRON`; Portuguese does not invent a standalone `nós` not present in the sentence. The conjugated `devemos` is represented as the taught modal auxiliary.
- The **Experience-level** historical `all-these-three-books` / `todos-estes-tres-livros` fixtures and all existing files remain. `HeadProbe` correct IDs arise from a dependency relation, never by manually fixing assessment evidence.
- Preserve G0 corpus/G1 observational diagnostic separation from G3 contract authority; no learner progress, Green, transfer, or TORO change.
- Adjust two **question-specific regression expectations** formerly asserting books for Shopping WHICH, without changing historical Experience-level fixture tests.
- New regression: `scripts/test-shopping-which-cheese-dependency-trilanguage.js` verifies sources, per-language mappings, prompt target, expected head, distinct alternatives, missing-language fail closed, legacy retained, runtime load, no Green claims.
- Human review is still required in English/Spanish/Portuguese, AUTO/PORTRAIT/LANDSCAPE, speech, keyboard and SVG connector geometry before visual homologation.

**Next independent elo:** semantic REVIEW vs R1/R2 order, or further pronoun comparison enrichment, only after separate GO.
