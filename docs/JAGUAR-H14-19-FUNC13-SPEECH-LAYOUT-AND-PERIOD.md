# 🔔🐆 JAGUAR H14.19 — FUNC-13 · Speech Window

## Design decision for visual homologation
**Line 1:** gold SVG speaker button on the **left**, contextual authored text on the **right**, width of the module. Speaker is a separate accessible control; clicking it reads the exact displayed adaptation in EN/ES/PT, never records an assessment response. The path is based on existing `.siyayo-speaker` SVG mask in Explorer CSS.

**Line 2:** horizontal five-button strip: QUALITY, STATE, MOVEMENT, ACTION, EXISTENCE. The strip can scroll internally on portrait, while the text line retains available width. Detailed **Function, Context/Perspective and Fine Study** appear below; three columns on desktop and stacked on portrait. Proposed lab layout only, not yet homologated by a human.

The source of speech is exclusively H14.7 adaptation when H14.13/H14.18 source checks approve its existing TENSE/MODE; it remains **PENDING_HOMOLOGATION** as a pedagogical source. For unavailable grammatical forms the text indicates a gap and speech is disabled. The original Master examples remain distinct and an ES original not indexed is not fabricated.

The browser's Speech Synthesis is used with locales en-US, es-ES and pt-BR; the actual voice quality/availability on the user's devices remains subject to manual validation. Any selection cancels prior speech. On an unsupported browser, the control stays disabled. No new evaluation, PATITA, learner record, Evidence or Green Pass.

## PERIOD gap
Current Gear Stack contains TENSE and MODE but not an independent PERIOD selector. PERIOD is a separate **GEAR STACK roadmap gap**, **not** a reason to add another grammar control to FUNC-13. The snapshot retains `period:null`; grammar must never be invented.

## Isolation
This ELO creates **only** `labs/func13-function-window-h14-19/` and its contract/tests/docs/workflow. The existing H14.18 lab is preserved. Neither `verb-explorer.html`, `js/verb-explorer.js`, Explorer CSS, `main`, PR #3 nor production is changed. FUNC-13 **remains hidden in normal Explorer navigation**, and its final position is undecided. The experimental layout is for visual approval at a later stage.
