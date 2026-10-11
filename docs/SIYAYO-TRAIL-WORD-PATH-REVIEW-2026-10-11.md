# SIYAYO — Learning Trail / Word Path · future review register
Date: 2026-10-11. Status: **OPEN — discussion / audit only**. Source: four user-annotated Spanish-language screenshots after JAGUAR ELO-2. The images are not included in the public repository. This record preserves questions and visual acceptance criteria; **none of these proposals authorizes implementation**.

## Already homologated; preserve
- ELO-1: expandable and initially closed Learning Trail & Word Path module below the Experience grid.
- ELO-2: existing `learnerTrailSurface` and generated Word Path inside that module, without duplicating IDs or evidence.
- Accepted progress is contract-owned; exploration/navigation does not produce Evidence, Attempt, Green Pass or change assessment language.
- At 2/3, local CHOICE and USE can be accepted while TRANSFER remains empty. A context is counted as confirmed only by the canonical closure authority.

## Backlog for separate Estudo Fino + GO
1. **LT-LANG-01 — Two distinct languages**: when the display is Spanish but the live assessment belongs to English, `PANTALLA ES · EVALUACIÓN EN` may be canonically correct. Make the distinction clear, preferably with human-readable `English / Español / Português` instead of ambiguous `EN / ES / PT` on learner-facing assessment notices. Never silently relabel an English Session as Spanish or transfer its evidence.
2. **LT-ORIGIN-02 — Experience title**: replace presentation of raw `shopping-for-dinner` with the localized canonical title (e.g. `Compras para una linda cena`) using the active display language; evaluate whether the active visit and contract origin need two separately labeled names.
3. **LT-LOCATION-03 — Origin marker**: study placement of the current Experience badge directly beneath `LEARNING TRAIL / RUTA DE APRENDIZAJE`; avoid duplicate badges until their meanings (visit vs assessment origin) are explicit. Only a proposed visual position; not yet homologated.
4. **LT-MARKER-04 — Semantics and accessibility**: compare large ○ / ◐ / ● / ★, CHOICE/USE/TRANSFER ○ / ● and confirmed contexts against actual contract packets and Green closure. Distinguish observation from accepted evidence; 1/3, 2/3, 3/3 and zero confirmed contexts are potentially valid combinations. Test updates when changing QW, language, Experience and learner.
5. **LT-COPY-05 — Copy and help**: revisit `CÓMO LEER LA RUTA`, `RESPUESTA EXPLORATORIA OBSERVADA` and `REGISTRO DE EVALUACIÓN` for clear human reading in EN/ES/PT. Help should explain ownership and marker semantics, without overload in the compact view.
6. **WP-QW-06 — Word Path scope**: clarify that `WHICH / WHAT / WHY / WHERE` are canonical QW identifiers accompanied by `CUÁL / QUÉ / POR QUÉ / DÓNDE` in Spanish. Evaluate a more descriptive user-facing heading such as `Recorrido de palabras interrogativas` and a separate `Registro de la evaluación activa`; no global relabeling until approved. Broader QW coverage depends on each QW's available canonical data, skill/Session, contracts and assessment targets; do not fabricate routes.
7. **WP-RETAIN-07 — Visited vs saved vs active**: validate sequences WHICH 1/3 → WHAT 0/3 → WHO/QUIÉN free exploration, keeping saved assessments distinct from the highlighted QW. `0/3 progress saved` indicates retained origin/session, not accepted evidence. Preserve language ownership, history and return without a restart.
8. **LT-PRESENT-08 — Responsive and speech**: evaluate card density/overflow and summary accessibility in AUTO/PORTRAIT/LANDSCAPE; T7 speech and physical smartphone checks remain pending. Do not infer a defect from a visual screenshot alone.

## Separate Dependency line — explicitly not in the Trail backlog patch
- **DF-ELO-3** (authorized): restore only `dependencyFocusSurface` immediately after Learner Identity and before `experience-grid`, as in pre-LIVE-57; keep semantic structure, SVG arrows, scroll and QW-dependent reading unchanged.
- **HP-ELO-4 (IMPLEMENTED; visual homologation pending)**: with explicit user GO on 2026-10-11, `dependencyHeadProbePanel` moves directly after `dependencyFocusSurface` and before `experience-grid`, outside LINES. Its answer-option buttons change only from capsule (`border-radius:999px`) to SIYAYO rounded rectangles (`10px`); existing question-card radius (`12px`), panel border (`16px`), audio control, feedback, data bindings, language ownership, assessment contracts, identity panel anchor and canonical evidence chain remain unchanged. Verify in EN/ES/PT, AUTO/PORTRAIT/LANDSCAPE, keyboard/touch and learner-identity compact/edit states before human visual homologation. Dependency Focus QW expansion remains separately OPEN.
- **DF-QW-EXTENSION-OPEN**: eventually study individual Dependency Focus fixtures and QW-specific role/labels keyed to the currently ON Question Word, including missing QWs. A missing canonical relation is a data gap, never permission to invent a parser or assessment evidence.
- Previously homologated Head Probe feedback/speech and exploratory vs contract evidence rules remain intact. No redesign in ELO-3.

## Governance
One elo → targeted change → readback/verification → user visual homologation. No automatic next tasks, main merge, production change or new evidence authority. New proposals need a separate Study / GO / validation entry.
