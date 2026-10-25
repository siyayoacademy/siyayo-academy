# SIYAYO ACADEMY — REGISTRO DE GOVERNANÇA DOS MÓDULOS

> **Estado:** edição documental aprovada para publicação em `jaguar/module-governance-registry-20261024`; catálogo de referência, sem alterações no runtime.
> **Fonte verificada:** [`jaguar/h14-19-func13-speech-window-period-gap`](https://github.com/siyayoacademy/siyayo-academy/tree/jaguar/h14-19-func13-speech-window-period-gap) · commit `9bcf599affccec323e4af6aa82d3a76f631bb8f5`.
> **Nomenclatura:** os códigos EXP-01…FUNC-13 são apelidos documentais; não renomeiam seletores HTML ou arquivos.

## Objetivo

Permitir solicitar componentes por nome, distinguir superfície visual de controlador técnico, transportar recursos para outros sites e conferir atualização ao alternar QW, Experience, idioma ou identidade. Cada módulo tem cinco responsabilidades: HOW TO DO / HOW TO RECORD / HOW TO SHOW / HOW TO CHECK / HOW TO SPEAK.

## Índice de módulos

| Código | Nome amigável | Seletor / localização | Portabilidade |
|---|---|---|---|
| `EXP-01` | Experience Header | `.experience-heading; #experienceTitle; #experienceSituation` | Reusable with localized title data |
| `CTX-02` | Circumstance Strip | `#circumstanceStrip` | Reusable if source keys/translation dictionary provided |
| `DEP-03` | Dependency Focus | `#dependencyFocusSurface` | Portable ONLY with canonical dependency structures, diagram renderer, connector view, CSS |
| `HEAD-04` | Dependency Head Probe | `#dependencyHeadProbePanel` | Requires all specialized Definition/Presenter/Result/Evidence/Attempt boundaries |
| `ID-05` | Learner Identity | `#learnerIdentityPanel; #learnerIdentityInput` | Reuse only with privacy and identity scope controls |
| `GEAR-06` | Pedagogical Axes / Gear Stack | `.gear-stack; #experienceLanguageGear; #questionGear; #wordTypeGear;` | Portable as UI shell |
| `LIVE-07` | Living Window / Lines & Possible Responses | `.living-window; #livingLines` | Portable corpus reader with separate authoring and evaluation layers |
| `EVAL-08` | Assessment Probes | `dynamic #determinerUseAssessmentPanel; #whatAssessmentPanel; #whyAs` | Not portable as a plain visual widget without evaluation gates |
| `NEXT-09` | Toroidal NEXT Navigation | `.toroidal-next; #nextExperience; #previousExperience` | Can copy visual navigation shell |
| `TRAIL-10` | Learning Trail | `#learningTrailWordPathModule > #learningTrailWordPathPanel > #learn` | Portable read-only with corresponding canonical sources |
| `WORD-11` | Word Path | `#learningTrailWordPathPanel (rendered content in learnerTrailSurfac` | Portable ONLY alongside canonical evidence reader |
| `PATITA-12` | PATITA Interaction Ledger | `#patitaInteractionLedger` | Portable if privacy model and event selectors adapted |
| `FUNC-13` | Master VIP — Five Verb Functions / Function Lens | `#h14SpecializedPreview` | Portable authoring/reference component |
| `SPEECH-A` | Corpus Speech Card | `#livingLines > .living-line; .siyayo-speaker` | Portable visual+speech widget, but implement your own language/text source |
| `SPEECH-B1` | Assessment Question Speech Card | `.what-probe-question-card; .why-probe-question-card; .where-probe-q` | Portable only after separating visual speech from assessment semantics |
| `SPEECH-B2` | Assessment Response Row | `.what-probe-response-row; .why-probe-response-row; .where-probe-cho` | Portable as two-button presentation |
| `RS-01` | Responsive Stage — Auto / Portrait / Landscape | `[data-siyayo-responsive-toolbar]; [data-siyayo-responsive-viewport]` | HIGH — copy two shared files, HTML shell and scoped page CSS |
| `XESP-DIAG` | XESPIRITO — Functional Diagnosis | `#xespiritoPanel` | Portable with own grammar source |

## Hierarquia visual e posicionamento

```text
Experience View
├── EXP-01 Experience Header
├── CTX-02 Circumstance Strip
├── ID-05 Learner Identity
├── DEP-03 Dependency Focus
├── HEAD-04 Dependency Head Probe
├── .experience-grid
│   ├── GEAR-06 Pedagogical Axes
│   └── LIVE-07 Living Window
│       ├── Header / #livingLines (SPEECH-A)
│       ├── Choice Resolver / Contrast Probe
│       ├── Line Controls / #assessmentAdoptionControls
│       └── NEXT-09 .toroidal-next
├── FUNC-13 Master VIP Function Lens (oculto, opt-in)
└── Learning Trail & Word Path
    ├── TRAIL-10
    ├── WORD-11 (projeção na superfície do Trail)
    └── PATITA-12
```

**IMPORTANTE:** `LIVE-07` é o contêiner maior. `NEXT-09` é um submódulo de `LIVE-07`, posicionado no fim. Pedido “acima do NEXT-09, dentro de LINES” significa *antes de `.toroidal-next` e dentro de `.living-window`*, sem confundir o contador do Corpus com progresso avaliativo.

## Responsabilidades por módulo

### `EXP-01` — Experience Header

- **Status e localização:** existing structure; documentation alias; `.experience-heading; #experienceTitle; #experienceSituation`.
- **Controlador técnico:** `js/verb-explorer.js · renderExperience()`.
- **Dados de origem:** data/learning/experience-seeds.json → items[].title/situation.
- **Consumidores/interações:** #experienceView; CTX-02; LIVE-07; FUNC-13.
- **Eventos de entrada:** goToExperience(id); change language; initial route; popstate.
- **HOW TO DO:** Resolve active Experience by id.
- **HOW TO RECORD:** Presentation memory may retain navigation state; no evaluation credit.
- **HOW TO SHOW:** Render localized title and situation.
- **HOW TO CHECK:** Ensure experience exists and localized text is grounded.
- **HOW TO SPEAK:** None in header.
- **Atualiza quando:** Re-render on Experience or language change.
- **Contrato visual:** Centered header; gold SIYAYO title.
- **Portabilidade:** Reusable with localized title data.

### `CTX-02` — Circumstance Strip

- **Status e localização:** existing structure; documentation alias; `#circumstanceStrip`.
- **Controlador técnico:** `js/verb-explorer-presentation-copy.js · localize()`.
- **Dados de origem:** data/learning/experience-seeds.json → items[].circumstances; js/verb-explorer-presentation-copy.js → dictionary.
- **Consumidores/interações:** Experience Header; Dependency Focus; pedagogical context.
- **Eventos de entrada:** renderExperience; language change; Experience navigation.
- **HOW TO DO:** Read TIME/PLACE/WEATHER/COMPANY/PURPOSE keys.
- **HOW TO RECORD:** No assessment record.
- **HOW TO SHOW:** Render five contextual cards with localized labels.
- **HOW TO CHECK:** Unknown circumstance keys must not be fabricated.
- **HOW TO SPEAK:** No independent speech.
- **Atualiza quando:** Re-render on Experience or language change.
- **Contrato visual:** Dark cards, gold accents.
- **Portabilidade:** Reusable if source keys/translation dictionary provided.

### `DEP-03` — Dependency Focus

- **Status e localização:** existing structure; documentation alias; `#dependencyFocusSurface`.
- **Controlador técnico:** `js/verb-explorer-dependency-focus-surface.js; js/verb-explorer-dependency-structure-source.js`.
- **Dados de origem:** data/learning/dependencies/*.json (actual URL whitelist in js/verb-explorer.js); data/learning/experience-seeds.json → thinkingMind[].dependencyFocus.
- **Consumidores/interações:** HEAD-04; Dependency connectors; Thinking Mind.
- **Eventos de entrada:** QW change; language change; Experience change; resize; siyayo:responsive-preview-changed.
- **HOW TO DO:** Resolve canonical dependency structure matching Experience/QW/language.
- **HOW TO RECORD:** Read-only diagram; interaction observer may log exploration, not Evidence.
- **HOW TO SHOW:** Render dependency token boxes + connectors.
- **HOW TO CHECK:** Validate referenced structure and tokens; never infer missing syntax.
- **HOW TO SPEAK:** No independent TTS in diagram.
- **Atualiza quando:** Recompute on grounded selection, redraw connectors after geometry/preview changes.
- **Contrato visual:** Centered token diagram with semantic links; preserve readable arrows.
- **Portabilidade:** Portable ONLY with canonical dependency structures, diagram renderer, connector view, CSS.

### `HEAD-04` — Dependency Head Probe

- **Status e localização:** existing structure; documentation alias; `#dependencyHeadProbePanel`.
- **Controlador técnico:** `js/verb-explorer-dependency-head-probe-live.js`.
- **Dados de origem:** data/learning/experience-seeds.json → dependencyHeadProbe or thinkingMind metadata; data/learning/dependencies/*.json.
- **Consumidores/interações:** AdaptiveDependencyHeadProbeDefinition; AdaptiveDependencyHeadProbeResult; Adaptive Coordinator; PATITA-12.
- **Eventos de entrada:** QW/Experience/language change; learner selects alternative; learner identity change.
- **HOW TO DO:** Present candidates and determine selected syntactic head.
- **HOW TO RECORD:** Free observation via PATITA; Attempt/Evidence only with compatible active contract.
- **HOW TO SHOW:** Presenter/browser wire + localized feedback.
- **HOW TO CHECK:** Verify matching structure, learner, language, Experience, scope and authorized Session.
- **HOW TO SPEAK:** Probe speaker via supplied speak callback.
- **Atualiza quando:** Mount or hide when metadata/scope changes; preserve qualified feedback by context.
- **Contrato visual:** Centered prompt and answer options.
- **Portabilidade:** Requires all specialized Definition/Presenter/Result/Evidence/Attempt boundaries.
- **ATENÇÃO:** HEAD IDENTIFIED in practice ≠ contract 3/3 or GREEN PASS.

### `ID-05` — Learner Identity

- **Status e localização:** existing structure; documentation alias; `#learnerIdentityPanel; #learnerIdentityInput`.
- **Controlador técnico:** `js/verb-explorer-learner-identity-{source,provider,surface}.js`.
- **Dados de origem:** User-entered NICK; identity source.
- **Consumidores/interações:** Assessment scopes; PATITA-12; TRAIL-10; WORD-11.
- **Eventos de entrada:** Confirm learner; Change learner.
- **HOW TO DO:** Establish displayed learner identity and allow changing it.
- **HOW TO RECORD:** Identity source; canonical learning identity is not display-only.
- **HOW TO SHOW:** Compact NICK / edit form.
- **HOW TO CHECK:** Scope any canonical evidence to exact learner.
- **HOW TO SPEAK:** No TTS.
- **Atualiza quando:** Refresh on identity change and Experience render.
- **Contrato visual:** Small dark-gold identity panel.
- **Portabilidade:** Reuse only with privacy and identity scope controls.
- **ATENÇÃO:** Do not carry one learner’s evidence into another learner’s view.

### `GEAR-06` — Pedagogical Axes / Gear Stack

- **Status e localização:** existing structure; documentation alias; `.gear-stack; #experienceLanguageGear; #questionGear; #wordTypeGear; #experienceTenseGear; #experienceModeGear; #perspectiveGear`.
- **Controlador técnico:** `js/verb-explorer.js · attachEvents/renderExperience; js/thinking-mind-runtime-decision.js; js/verb-explorer-thinking-mind-assessment-selection.js`.
- **Dados de origem:** data/learning/experience-seeds.json; data/learning/question-word-capabilities.json; NOUN/ADJECTIVE lexicons.
- **Consumidores/interações:** EXP-01; DEP-03; LIVE-07; FUNC-13; EVAL-08.
- **Eventos de entrada:** [data-experience-language]; [data-question-index]; [data-word-type]; [data-experience-tense]; [data-experience-form]; [data-perspective]; COMPOSE/BUILD SENTENCE.
- **HOW TO DO:** Choose visible axes; Thinking Mind Decision resolves available opportunities.
- **HOW TO RECORD:** Presentation memory retains UI; canonical evaluation only on declared target via Assessment Selection.
- **HOW TO SHOW:** Render active buttons and available axes; change content in adjacent panels.
- **HOW TO CHECK:** No fabricated QW skills; grammar lock and contextual coherence gates.
- **HOW TO SPEAK:** Changes active voice locale, but gear has no audio.
- **Atualiza quando:** Re-render current Experience; reset line offset as coded; preserve scope-owned evidence.
- **Contrato visual:** Gold labels, SIYAYO dark blue, selected active states.
- **Portabilidade:** Portable as UI shell; assessment selection requires canonical runtime.

### `LIVE-07` — Living Window / Lines & Possible Responses

- **Status e localização:** existing structure; documentation alias; `.living-window; #livingLines`.
- **Controlador técnico:** `js/verb-explorer.js · experienceLines/renderLivingLines; js/verb-explorer-visible-assessment-boundary.js`.
- **Dados de origem:** data/learning/experience-seeds.json → thinkingMind/perspectives; data/lexicon/*; canonical choices.
- **Consumidores/interações:** LW header; SPEECH-A; EVAL-08; NEXT-09; choice resolver; line controls.
- **Eventos de entrada:** renderExperience; QW/Experience/language change; lineUp/lineDown; word type/tense/mode/perspective.
- **HOW TO DO:** Assemble three visible lines from authored Corpus and current axes.
- **HOW TO RECORD:** Speech lines do NOT register evaluative responses; PATITA may observe clicks.
- **HOW TO SHOW:** Render header/counter/dialogue, optional subpanels and NEXT.
- **HOW TO CHECK:** VisibleAssessmentBoundary labels corpus-only; missing authored variants show authoring gap.
- **HOW TO SPEAK:** Uses SPEECH-A and speakText().
- **Atualiza quando:** Rebuild on relevant selection; lineOffset reset for most navigation actions.
- **Contrato visual:** Dark center-aligned sentence cards; 03/03 is dialogue count.
- **Portabilidade:** Portable corpus reader with separate authoring and evaluation layers.
- **ATENÇÃO:** NEXT-09 is CHILD of LIVE-07; not an independent parent at same DOM level.

### `EVAL-08` — Assessment Probes

- **Status e localização:** existing structure; documentation alias; `dynamic #determinerUseAssessmentPanel; #whatAssessmentPanel; #whyAssessmentPanel; #whereAssessmentPanel`.
- **Controlador técnico:** `js/verb-explorer-{determiner-use,what,why,where}-assessment-live.js`.
- **Dados de origem:** data/learning/experience-seeds.json → assessmentTarget / assessmentResumeTarget; canonical target definitions / probe specifications.
- **Consumidores/interações:** Adaptive Coordinator; Attempt/Evidence boundaries; TRAIL-10; WORD-11.
- **Eventos de entrada:** Authorized QW selection; learner choice; Session resume; Experience/language/identity change.
- **HOW TO DO:** Specialized question/choice probes for WHICH WHAT WHERE WHY.
- **HOW TO RECORD:** Canonical Attempt/Evidence with authorized target only.
- **HOW TO SHOW:** Dynamically mount separate probe panels; WHICH panel is before .experience-grid, not within LIVE-07.
- **HOW TO CHECK:** Validate declared assessment target, scope, result, compatible session and pass contract.
- **HOW TO SPEAK:** Independent question-card TTS and answer-row TTS.
- **Atualiza quando:** Mount/hide and refresh on active context and scope.
- **Contrato visual:** B1 speech question vs B2 separate audio & answer.
- **Portabilidade:** Not portable as a plain visual widget without evaluation gates.
- **ATENÇÃO:** Never infer credit from corpus listening.

### `NEXT-09` — Toroidal NEXT Navigation

- **Status e localização:** existing structure; documentation alias; `.toroidal-next; #nextExperience; #previousExperience`.
- **Controlador técnico:** `js/verb-explorer.js; js/verb-explorer-live-next-wire.js; js/verb-explorer-toroidal-next-observer.js`.
- **Dados de origem:** data/learning/experience-seeds.json → toroidalNext.nextExperience/prompt/answer; runtime transition authorities.
- **Consumidores/interações:** LIVE-07 parent; Experience Navigation; Adaptive Transition.
- **Eventos de entrada:** Click NEXT candidate; Click Previous Experience; evaluation progression events.
- **HOW TO DO:** Offer navigation candidate or authorized progression path.
- **HOW TO RECORD:** Observations and canonical progression maintained by respective authorities.
- **HOW TO SHOW:** NEXT card inside .living-window.
- **HOW TO CHECK:** NEXT candidate ≠ GREEN or assessment authorization.
- **HOW TO SPEAK:** No native speaker.
- **Atualiza quando:** Update on Experience render, authorized progression and transfer readiness.
- **Contrato visual:** Centered dark blue panel with gold NEXT button.
- **Portabilidade:** Can copy visual navigation shell; cannot blindly copy canonical progression authority.
- **ATENÇÃO:** To place above NEXT: insert before .toroidal-next within .living-window; do not confuse LIVE-07 with NEXT-09.

### `TRAIL-10` — Learning Trail

- **Status e localização:** existing structure; documentation alias; `#learningTrailWordPathModule > #learningTrailWordPathPanel > #learnerTrailSurface`.
- **Controlador técnico:** `js/verb-explorer-learner-trail-surface.js; js/adaptive-learner-trail-view.js`.
- **Dados de origem:** Adaptive Coordinator snapshots; scope-owned evidence and pass-contract progress.
- **Consumidores/interações:** WORD-11; PATITA-12 (parallel observational panel).
- **Eventos de entrada:** learner change; QW/language change; Assessment updated; Experience render.
- **HOW TO DO:** Project learner progress by authorized skill and scope.
- **HOW TO RECORD:** Read-only canonical progress projection.
- **HOW TO SHOW:** Render milestones / progress / transfer.
- **HOW TO CHECK:** Verify accepted evidence, scope and progress markers.
- **HOW TO SPEAK:** None.
- **Atualiza quando:** Refresh after canonical evidence or visible context updates.
- **Contrato visual:** Expansible dark-blue trail view.
- **Portabilidade:** Portable read-only with corresponding canonical sources.

### `WORD-11` — Word Path

- **Status e localização:** existing structure; documentation alias; `#learningTrailWordPathPanel (rendered content in learnerTrailSurface)`.
- **Controlador técnico:** `js/verb-explorer-polyglot-word-path-view.js`.
- **Dados de origem:** Retained Evidence from ThinkingMindAssessmentSelection; canonical Experience + NOUN corpus; Adaptive Scope.
- **Consumidores/interações:** TRAIL-10; EVAL-08.
- **Eventos de entrada:** QW/language/learner change; new accepted evidence; Trail refresh.
- **HOW TO DO:** Project accepted words/answers by skill/language/origin.
- **HOW TO RECORD:** No writes: read-only witnesses.
- **HOW TO SHOW:** Display evidence details / polyglot matrix.
- **HOW TO CHECK:** No witness => no accepted label; never invent answer text.
- **HOW TO SPEAK:** No native TTS defined.
- **Atualiza quando:** Refresh with Trail and scope changes.
- **Contrato visual:** Scoped polyglot text/list/matrix.
- **Portabilidade:** Portable ONLY alongside canonical evidence reader.

### `PATITA-12` — PATITA Interaction Ledger

- **Status e localização:** existing structure; documentation alias; `#patitaInteractionLedger`.
- **Controlador técnico:** `js/verb-explorer-patita-interaction-trail.js`.
- **Dados de origem:** DOM UI events; localStorage key siyayo.patita.interactions.v1; sessionStorage key siyayo.patita.tab-session.v1.
- **Consumidores/interações:** Learning Trail; observation summaries; contextual outcomes.
- **Eventos de entrada:** Captured UI click; recordOutcome(); storage/pageshow; details toggle.
- **HOW TO DO:** Observe interaction intents and visible outcomes.
- **HOW TO RECORD:** Local bounded ledger, max 500 records; observational only.
- **HOW TO SHOW:** Render recent PATITA interactions within expandable module.
- **HOW TO CHECK:** Classify UI outcomes, NOT canonical evaluator.
- **HOW TO SPEAK:** Never synthesizes speech.
- **Atualiza quando:** Refresh on click/outcome/identity/context changes.
- **Contrato visual:** Observational activity history.
- **Portabilidade:** Portable if privacy model and event selectors adapted.
- **ATENÇÃO:** PATITA is NEVER sole authority for Attempt, Evidence, GREEN.

### `FUNC-13` — Master VIP — Five Verb Functions / Function Lens

- **Status e localização:** experimental; H14.19 branch inspected; still hidden by default; `#h14SpecializedPreview`.
- **Controlador técnico:** `js/verb-explorer-h14-14-preview.js + scripts/jaguar-h14-13-specialized-mirror-reference.js`.
- **Dados de origem:** data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json; data/learning/experience-seeds.json → perspectives.
- **Consumidores/interações:** Explorer Runtime; Experience Navigation; GEAR-06.
- **Eventos de entrada:** QUALITY/STATE/MOVEMENT/ACTION/EXISTENCE selection; language, Experience, perspective, tense, mode, QW change; popstate.
- **HOW TO DO:** Project SIYAYO-authoring reference with H14.13 core coherence rules.
- **HOW TO RECORD:** Per-Experience temporary function selection; NO Attempt/Evidence/GREEN.
- **HOW TO SHOW:** Five-function panel with two contextual cards; default hidden; opt-in ?h14_14=preview.
- **HOW TO CHECK:** H14.13 projectSingle verifies provenance, status, authoring compatibility and lack of assessment authority.
- **HOW TO SPEAK:** H14.19 speech-window work is specialized; verify precise behavior before adopting in another site.
- **Atualiza quando:** Only opt-in render with valid source and compatible context.
- **Contrato visual:** Five buttons, gold/dark cards, perspective color red/yellow/green/blue.
- **Portabilidade:** Portable authoring/reference component; requires H14.13 core and matrix.
- **ATENÇÃO:** Do not treat the panel as EVAL-08 or automatic assessment progress.

### `SPEECH-A` — Corpus Speech Card

- **Status e localização:** existing structure; documentation alias; `#livingLines > .living-line; .siyayo-speaker`.
- **Controlador técnico:** `js/verb-explorer.js · renderLivingLines/speakText; css/verb-explorer.css`.
- **Dados de origem:** Canonical authored dialogue from experienceLines(); speechLocales in verb-explorer.js.
- **Consumidores/interações:** LIVE-07; SPEAKER-SVG.
- **Eventos de entrada:** Click complete living-line card; SpeechSynthesis start/end.
- **HOW TO DO:** Select authored text to read aloud.
- **HOW TO RECORD:** Not an assessment answer; PATITA may observe click.
- **HOW TO SHOW:** Full-card speech button; centered paragraph + edge icon.
- **HOW TO CHECK:** VisibleAssessmentBoundary; authoring-gap item is not clickable speech.
- **HOW TO SPEAK:** SpeechSynthesisUtterance; en-US, es-ES, pt-BR.
- **Atualiza quando:** Re-render when language/QW/content axes change.
- **Contrato visual:** Dark background; centered semibold body; gold bold target; SVG-mask gold speaker; CURRENT Explorer speaker at LEFT via .living-line b {left:13px;right:auto}; RIGHT is a proposed placement variant.
- **Portabilidade:** Portable visual+speech widget, but implement your own language/text source.
- **ATENÇÃO:** Speaker on right is a requested variant, not current code. Do not equate audio click to assessment attempt.

### `SPEECH-B1` — Assessment Question Speech Card

- **Status e localização:** existing structure; documentation alias; `.what-probe-question-card; .why-probe-question-card; .where-probe-question`.
- **Controlador técnico:** `js/verb-explorer-{what,why,where}-assessment-live.js + CSS`.
- **Dados de origem:** Authorized probe questions and localized specifications.
- **Consumidores/interações:** EVAL-08.
- **Eventos de entrada:** Click question card for audio.
- **HOW TO DO:** Present authored assessment question.
- **HOW TO RECORD:** Question audio is not answer selection.
- **HOW TO SHOW:** Question button with integrated speaker icon and centered text.
- **HOW TO CHECK:** Assessment/scope checked independently; question listen alone no evidence.
- **HOW TO SPEAK:** Speech function provided by runtime.
- **Atualiza quando:** Remount on context/QW/language/assessment changes.
- **Contrato visual:** Gold speaker inside one card; target text gold bold.
- **Portabilidade:** Portable only after separating visual speech from assessment semantics.

### `SPEECH-B2` — Assessment Response Row

- **Status e localização:** existing structure; documentation alias; `.what-probe-response-row; .why-probe-response-row; .where-probe-choice`.
- **Controlador técnico:** `js/verb-explorer-{what,why,where}-assessment-live.js + CSS`.
- **Dados de origem:** Grounded probe answer alternatives.
- **Consumidores/interações:** EVAL-08; SPEECH-B1.
- **Eventos de entrada:** Click speaker separately; Click answer option.
- **HOW TO DO:** Separate listening action from answer selection.
- **HOW TO RECORD:** Answer selection may submit authorized Attempt only through evaluative boundary.
- **HOW TO SHOW:** Two independent controls: speaker cell + response button, centered text.
- **HOW TO CHECK:** Verify no Answer submission on audio click; authority gate must validate selection.
- **HOW TO SPEAK:** Independent audio button for localized response.
- **Atualiza quando:** Remount/redraw on scoped assessment and language changes.
- **Contrato visual:** Two-cell dark panel; CSS presently places speech icon in LEFT column.
- **Portabilidade:** Portable as two-button presentation; never copy assessment submission blindly.

### `RS-01` — Responsive Stage — Auto / Portrait / Landscape

- **Status e localização:** existing shared contract; `[data-siyayo-responsive-toolbar]; [data-siyayo-responsive-viewport]`.
- **Controlador técnico:** `js/siyayo-responsive-preview.js`.
- **Dados de origem:** No JSON source; CSS vars --siyayo-preview-portrait-width / --siyayo-preview-landscape-width; localStorage siyayo-responsive-preview-mode (legacy siyayo-piano-preview-mode).
- **Consumidores/interações:** Piano Stage; Verb Explorer; Dependency Focus layout listener; any target page adopting common shell.
- **Eventos de entrada:** data-preview click; bootstrap; siyayo:responsive-preview-changed; window.SIYAYOResponsivePreview.setMode(mode).
- **HOW TO DO:** Constrain preview viewport on desktop; Auto uses actual responsive width.
- **HOW TO RECORD:** Persist preview mode in localStorage ONLY; no pedagogical state.
- **HOW TO SHOW:** css/siyayo-responsive-stage.css applies toolbar and widths; JS toggles data-preview, active class and aria-pressed.
- **HOW TO CHECK:** Whitelist auto/portrait/landscape; on touch-first force AUTO; verify page-specific container queries.
- **HOW TO SPEAK:** None.
- **Atualiza quando:** On mode switch dispatch custom event; page-specific layout may listen for redraw.
- **Contrato visual:** Portrait=430px; Landscape=844px; Auto=no width cap; toolbar hidden for coarse-pointer touch.
- **Portabilidade:** HIGH — copy two shared files, HTML shell and scoped page CSS; preserve contract.
- **ATENÇÃO:** Developer preview is NOT physical device emulation; CSS container/media rules must be adapted for the new page.

### `XESP-DIAG` — XESPIRITO — Functional Diagnosis

- **Status e localização:** additional module; alias not in 01–13 numbering; `#xespiritoPanel`.
- **Controlador técnico:** `js/xespirito-diagnostics.js; js/xespirito-explorer-bridge.js`.
- **Dados de origem:** Canonical verb grid / verb constructions.
- **Consumidores/interações:** VERB DNA.
- **Eventos de entrada:** Diagnose click; input changes.
- **HOW TO DO:** Analyze functional verbal constructions.
- **HOW TO RECORD:** No evidence writes in static diagnosis itself.
- **HOW TO SHOW:** Diagnostic panel.
- **HOW TO CHECK:** Use functional grammar diagnosis, not invented evaluator.
- **HOW TO SPEAK:** Separate from corpus speech.
- **Atualiza quando:** When diagnosed sentence changes.
- **Contrato visual:** Dark functional panel.
- **Portabilidade:** Portable with own grammar source.

## Procedimento de adoção RS-01 (outro site)

**Arquivos canônicos:** [CSS](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/h14-19-func13-speech-window-period-gap/css/siyayo-responsive-stage.css) · [JS](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/h14-19-func13-speech-window-period-gap/js/siyayo-responsive-preview.js) · [Contrato](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/h14-19-func13-speech-window-period-gap/docs/SIYAYO-STAGE-CONTAINER-RESPONSIVE-CONTRACT.md).

1. Na branch do **site de destino**, conferir HTML e CSS responsivo existente e obter autorização de adaptação nesse site.
2. Copiar os dois arquivos comuns sem duplicar o motor. Referenciar CSS no `<head>` e JS com `defer` após estruturar o DOM.
3. Reproduzir a toolbar com `data-siyayo-responsive-toolbar` e seus botões `data-preview`; envolver o conteúdo no `div.stage-viewport[data-siyayo-responsive-viewport]`.
4. Adicionar CSS específico da página e `container-type:inline-size; container-name:...;` se usar regras `@container`. **Copiar o stage não transporta os breakpoints do Explorer!**
5. Verificar três modos em desktop, foco por teclado, colisões, conteúdo overflow e touch-first real. O preview não simula SO, DPI ou navegador físico.
6. Eventos `siyayo:responsive-preview-changed` podem ser consumidos para recalcular setas ou geometria; não alteram Session/Attempt/Evidence/Green.

### HTML mínimo

```html
<link rel="stylesheet" href="css/siyayo-responsive-stage.css">
<script src="js/siyayo-responsive-preview.js" defer></script>

<div class="dev-preview-toolbar" data-siyayo-responsive-toolbar role="toolbar" aria-label="Layout preview">
  <button type="button" class="preview-button" data-preview="auto">AUTO</button>
  <button type="button" class="preview-button" data-preview="portrait">PORTRAIT</button>
  <button type="button" class="preview-button" data-preview="landscape">LANDSCAPE</button>
</div>
<div class="stage-viewport" data-siyayo-responsive-viewport data-preview="auto">
  <main class="my-site-content">...conteúdo específico...</main>
</div>
```

## SPEECH-A — exigência visual e variante solicitada

**CONFIRMADO no Explorer inspecionado:** `.living-line` é botão único de fala; `.siyayo-speaker` desenha ícone dourado por máscara SVG; o texto da linha fica centralizado com `Nunito Sans`, peso 600, e palavras-alvo em dourado/peso 800 via `.study-target-word`. **O speaker atual fica à esquerda (`.living-line b {left:13px;right:auto}`)**. Não dizer que a variante direita já está homologada.

**Para solicitar VARIANTE à direita em outro site, sem mudar a semântica:** usar posição absoluta do ícone, reservar preenchimento simétrico para texto, não alterar o evento de áudio, verificar altura e largura em Portrait. Exemplo de CSS novo, isolado por classe:

```css
.siyayo-speech-a--right { position:relative; display:block; width:100%;
  padding:16px 48px; text-align:center; background:#071f41; color:#eef4ff; }
.siyayo-speech-a--right .speech-text { display:block; text-align:center; font-weight:600; }
.siyayo-speech-a--right .speech-icon { position:absolute; right:13px; top:50%; transform:translateY(-50%); }
.siyayo-speech-a--right .study-target-word { color:#f2d88a; font-weight:800; }
```

Não transportar o callback de assessment para um card informativo. Se a pergunta for avaliativa, separar `SPEECH-B1` (pergunta para ouvir) de `SPEECH-B2` (áudio independente da escolha).

## Diagnóstico de atualizações / stale UI

| Alteração | Painéis afetados | Check invariante |
|---|---|---|
| EN→ES→PT | EXP-01, CTX-02, DEP-03, HEAD-04, GEAR-06, LIVE-07, FUNC-13 | Textos e voz localizados; nenhuma evidência de outro idioma reclassificada |
| QW A→B→A | DEP-03, HEAD-04, GEAR-06, LIVE-07, EVAL-08, TRAIL-10 | QW restaurada no painel; contratos independentes |
| Experience S1→S4 | EXP-01, CTX-02, DEP-03, GEAR-06, NEXT-09, FUNC-13 | Dados de cenário atual; transição não implica GREEN |
| NICK A→B | ID-05, EVAL-08, TRAIL-10, WORD-11, PATITA-12 | Não misturar scopes de aluno |
| Portrait / Landscape | RS-01 + superfícies responsivas | Redraw visual apenas; nenhuma tentativa criada |

## Regra de publicação e leitura entre chats

Caminhos canônicos desta edição na branch documental `jaguar/module-governance-registry-20261024`: `docs/SIYAYO-MODULE-GOVERNANCE-REGISTRY.md` e `docs/siyayo-module-registry.json`. Para outro chat, consultar diretamente os arquivos **na branch de documentação** e conferir o commit de origem e a branch de destino antes de reutilizar qualquer componente. Publicar documentação não faz merge na `main`, não instala módulos em outros sites, não autoriza avaliações nem homologa versões visuais.

## Prompt operacional reutilizável

> Abra o registro `docs/SIYAYO-MODULE-GOVERNANCE-REGISTRY.md` no repositório `siyayoacademy/siyayo-academy`, confira o JSON correspondente e o commit de origem. Solicito o módulo `<CÓDIGO>`, no contêiner `<PARENT>`, antes/depois de `<SIBLING>`. Preserve HOW TO DO / RECORD / SHOW / CHECK / SPEAK, regras CSS e autoridade. Identifique diferenças de branch e lacunas, audite antes de qualquer alteração; reutilize o contrato do componente em vez de criar um motor paralelo.


## REG-02 — Bastidores, enriquecimento JSON e memória durável

A governança se estende à rastreabilidade de **JSON, serviços de bastidores, escopos de identidade, armazenamento durável de ocorrências, testes e integração seletiva**. O registro companion documenta as responsabilidades e **as sete lacunas H14.40**, sem habilitar persistência ou avaliação no Explorer.

- [Manual de governança dos bastidores](./SIYAYO-BACKSTAGE-FLOW-REGISTRY.md)
- [Mapa estruturado de fluxo e dependências](./siyayo-backstage-flow-registry.json)
- Fonte de laboratório auditada: `jaguar/h14-40-why-v30-85c-durable-idempotency-contract` @ `f8f2cbf958b807f84cf2e2371b0b2ef4dd8eb768`.
- **Distinção obrigatória:** PATITA observa; 85C registra `pending` ou `observed_exploratory` em teste local; somente contratos avaliativos autorizados podem produzir Evidence e GREEN em outro circuito.
