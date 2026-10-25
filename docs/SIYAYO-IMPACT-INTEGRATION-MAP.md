# SIYAYO REG-03 — Análise de Impacto e Mapa de Integração

**Status:** documentação executiva e mapa estruturado de dependências; não é monitoramento automático nem mudança no runtime.
**Origem documental:** `jaguar/module-governance-reg02-backstage-20261025` @ `1854563d16ffd87b7d20174860766fbd33700e2d`.
**Fontes de código congeladas:** Explorer H14.19 @ `9bcf599affccec323e4af6aa82d3a76f631bb8f5`; laboratório H14.40 @ `f8f2cbf958b807f84cf2e2371b0b2ef4dd8eb768`.

## Objetivo

Responder à pergunta **se eu modificar este JSON, evento, controlador ou módulo, o que será afetado, o que deverá permanecer íntegro e como testar antes de incorporar?**. O registro cataloga módulos de tela, bastidores, fontes, conexões, gatilhos e gates. A leitura do grafo é uma análise inicial, nunca autorização automática para publicar.

## Procedimento operacional

1. **pin source and target HEAD** — documentar checkpoint em relatório de revisão.
2. **identify change type and exact paths** — documentar checkpoint em relatório de revisão.
3. **find direct graph edges** — documentar checkpoint em relatório de revisão.
4. **expand impacted consumers** — documentar checkpoint em relatório de revisão.
5. **check five HOW TO and authority** — documentar checkpoint em relatório de revisão.
6. **run targeted regressions** — documentar checkpoint em relatório de revisão.
7. **document gate decision** — documentar checkpoint em relatório de revisão.
8. **explicit selective adoption only** — documentar checkpoint em relatório de revisão.

**Regra de fontes:** conferir o HEAD **atual** da branch alvo e da fonte antes de qualquer mudança; os SHA acima documentam apenas o estado que foi auditado. Uma aresta marcada `requires_caller_verification` é hipótese de auditoria, não consumo confirmado.

## Regras de interpretação do mapa

- Aresta orientada `from → to` significa fornecedor/acionador → consumidor/receptor. A navegação pode formar ciclos. Não inferir que uma aresta significa avaliação ou escrita.
- `renders`, `draws_connections`, `loads`, `localizes` e `visually_adjacent_only` são efeitos visuais e não criam Attempts.
- `guards_target`, `authorizes_or_resumes`, `submits_authorized_attempt` exigem autorização **fora** do componente visual.
- `LAB-85C → H14-40` é **reutilização documental do estudo**, nunca um fluxo de gravação em produção. Nenhuma aresta autoriza writes reais.
- Eventos de navegador observados no código, como `siyayo:responsive-preview-changed`, não são equivalentes aos **gatilhos documentais propostos**, como `json_source_change` e `storage_schema_proposal`.
- `SPEECH-A` atual posiciona speaker à **esquerda**; levá-lo à direita é variante deliberada, não uma propriedade do CSS atual.

## Mapa resumido das principais interações

```text
JSON-SEEDS → RUNTIME-EXP → EXP-01 / GEAR-06 / LIVE-07 / NEXT-09
                          ↘ DEP-03 / HEAD-04 / EVAL-08 (montagem, não crédito)
GEAR-06 → RUNTIME-EXP → ASSESS-SELECT → EVAL-08 → FLOW-01 → TRAIL-10 → WORD-11
RS-01 ──siyayo:responsive-preview-changed──→ DEP-SURFACE → DEP-03
JSON-FUNCTIONS → FUNC-13 (preview oculto, leitura somente; não avalia)
PATITA-12 observa interação de UI, separado de TRAIL-10 / Evidence
LAB-85C → H14-40 → GATE-01 (reuso de pesquisa, SEM escrita no Explorer)
```

## Catálogo de nós verificados ou referenciados

| Código | Tipo | Arquivo/fonte | Papel |
|---|---|---|---|
| `EXP-01` | display | `verb-explorer.html` | See REG-02 module/backstage records for full contract |
| `CTX-02` | display | `verb-explorer.html` | See REG-02 module/backstage records for full contract |
| `DEP-03` | display | `verb-explorer.html` | See REG-02 module/backstage records for full contract |
| `HEAD-04` | display | `verb-explorer.html` | See REG-02 module/backstage records for full contract |
| `ID-05` | identity | `verb-explorer.html` | See REG-02 module/backstage records for full contract |
| `GEAR-06` | control | `verb-explorer.html` | See REG-02 module/backstage records for full contract |
| `LIVE-07` | display | `verb-explorer.html` | See REG-02 module/backstage records for full contract |
| `EVAL-08` | evaluation | `js/verb-explorer-why-assessment-live.js` | See REG-02 module/backstage records for full contract |
| `NEXT-09` | navigation | `verb-explorer.html` | See REG-02 module/backstage records for full contract |
| `TRAIL-10` | display | `js/verb-explorer-learner-trail-surface.js` | See REG-02 module/backstage records for full contract |
| `WORD-11` | display | `js/verb-explorer-polyglot-word-path-view.js` | See REG-02 module/backstage records for full contract |
| `PATITA-12` | observation | `js/verb-explorer-patita-interaction-trail.js` | See REG-02 module/backstage records for full contract |
| `FUNC-13` | display | `js/verb-explorer-h14-14-preview.js` | See REG-02 module/backstage records for full contract |
| `SPEECH-A` | speech | `js/verb-explorer.js` | See REG-02 module/backstage records for full contract |
| `SPEECH-B1` | speech | `js/verb-explorer-what-assessment-live.js` | See REG-02 module/backstage records for full contract |
| `SPEECH-B2` | speech | `js/verb-explorer-why-assessment-live.js` | See REG-02 module/backstage records for full contract |
| `RS-01` | responsive | `js/siyayo-responsive-preview.js` | See REG-02 module/backstage records for full contract |
| `XESP-DIAG` | diagnostic | `js/xespirito-diagnostics.js` | See REG-02 module/backstage records for full contract |
| `FLOW-01` | orchestration | `js/verb-explorer-adaptive-coordinator.js` | See REG-02 module/backstage records for full contract |
| `STATE-01` | presentation | `js/verb-explorer-experience-presentation-memory.js` | See REG-02 module/backstage records for full contract |
| `AUTH-01` | authority | `js/question-word-assessment-contract.js` | See REG-02 module/backstage records for full contract |
| `GATE-01` | governance | `docs/SIYAYO-BACKSTAGE-FLOW-REGISTRY.md` | See REG-02 module/backstage records for full contract |
| `JSON-SEEDS` | data | `data/learning/experience-seeds.json` | Experience titles, circumstances, QW, dialogue, perspective and NEXT |
| `JSON-CAPABILITIES` | data | `data/learning/question-word-capabilities.json` | QW opportunities not automatically assessment authority |
| `JSON-DEPENDENCIES` | data | `data/learning/dependencies/` | Language/QW dependency structures |
| `JSON-FUNCTIONS` | data | `data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json` | FUNC-13 five-function reference cells |
| `JSON-SKILLS` | data | `data/learning/skills/why.json` | WHY canonical skill; authorization remains separate |
| `RUNTIME-EXP` | control | `js/verb-explorer.js` | Owns renderExperience(), goToExperience(), gear click handlers, speakText() |
| `PRES-COPY` | presentation | `js/verb-explorer-presentation-copy.js` | Localizes UI/circumstance copy |
| `DEP-SURFACE` | presentation | `js/verb-explorer-dependency-focus-surface.js` | Renders diagram and redraws on layout events |
| `HEAD-PROBE` | control | `js/verb-explorer-dependency-head-probe-live.js` | Head Probe binding and observation/assessment boundary |
| `ASSESS-SELECT` | authority | `js/verb-explorer-thinking-mind-assessment-selection.js` | Explicit assessment target selection/resume, not inferred from QW |
| `CONTEXT-CHECK` | verification | `js/verb-explorer-contextual-coherence.js` | Read-only contextual corpus coherency |
| `SPEECH-RUNTIME` | speech | `js/verb-explorer.js` | speakText Web Speech API locales en-US/es-ES/pt-BR |
| `SOURCE-HIGHLIGHT` | presentation | `js/study-target-presentation.js` | Read-only golden target highlighting |
| `SCOPE-BOUNDARY` | authority | `js/adaptive-assessment-scope.js` | Browser assessment ownership, not server identity |
| `QW-CONTRACT` | authority | `js/question-word-assessment-contract.js` | QW capability not assessment unless declared |
| `REG-02` | governance | `docs/SIYAYO-BACKSTAGE-FLOW-REGISTRY.md` | Documented backstage governance, not browser runtime |
| `LAB-85C` | laboratory | `labs/jaguar-v30-3/migrations/0004_v30_85c_occurrences.sql` | Local-only SQLite occurrence storage study |
| `LAB-39` | laboratory | `scripts/jaguar-h14-39-shadow-occurrence-idempotence.js` | Synthetic shadow event model, not production store |
| `H14-40` | governance | `docs/JAGUAR-H14-40-V30-85C-DURABLE-IDEMPOTENCY-REUSE.md` | Documented reconciliation of WHY and V30 durable study |

## Ligações entre módulos (arestas de impacto)

| De → Para | Tipo | Gatilho | Fonte da evidência | Limite |
|---|---|---|---|---|
| `JSON-SEEDS → RUNTIME-EXP` | `loads` | `initial_load` | `js/verb-explorer.js` | `read_only_or_visual` |
| `JSON-SEEDS → PRES-COPY` | `localizes` | `language_or_experience_selection` | `js/verb-explorer-presentation-copy.js` | `read_only_or_visual` |
| `PRES-COPY → CTX-02` | `renders` | `language_or_experience_selection` | `js/verb-explorer-presentation-copy.js` | `read_only_or_visual` |
| `RUNTIME-EXP → EXP-01` | `renders` | `experience_or_language` | `js/verb-explorer.js` | `read_only_or_visual` |
| `RUNTIME-EXP → GEAR-06` | `selects_and_renders` | `gear_clicks` | `js/verb-explorer.js` | `read_only_or_visual` |
| `RUNTIME-EXP → LIVE-07` | `renders` | `gear_change_or_experience_navigation` | `js/verb-explorer.js` | `read_only_or_visual` |
| `RUNTIME-EXP → NEXT-09` | `updates` | `experience_navigation` | `js/verb-explorer.js` | `read_only_or_visual` |
| `NEXT-09 → RUNTIME-EXP` | `navigates` | `next_or_previous_click` | `js/verb-explorer.js` | `navigation_only` |
| `GEAR-06 → RUNTIME-EXP` | `requests` | `question_language_tense_mode_perspective_click` | `js/verb-explorer.js` | `read_only_or_visual` |
| `JSON-DEPENDENCIES → RUNTIME-EXP` | `loads` | `initial_load` | `js/verb-explorer.js` | `read_only_or_visual` |
| `RUNTIME-EXP → DEP-03` | `renders` | `question_or_language_or_experience` | `js/verb-explorer.js` | `read_only_or_visual` |
| `RUNTIME-EXP → HEAD-04` | `renders` | `question_or_language_or_experience` | `js/verb-explorer.js` | `read_only_or_visual` |
| `DEP-SURFACE → DEP-03` | `draws_connections` | `render_and_layout_change` | `js/verb-explorer-dependency-focus-surface.js` | `read_only_or_visual` |
| `RS-01 → DEP-SURFACE` | `notifies` | `siyayo:responsive-preview-changed` | `js/siyayo-responsive-preview.js; js/verb-explorer-dependency-focus-surface.js` | `read_only_or_visual` |
| `HEAD-PROBE → HEAD-04` | `binds` | `dependency_probe_mount_and_choice` | `js/verb-explorer-dependency-head-probe-live.js` | `free_observation_or_scoped_assessment_only` |
| `JSON-CAPABILITIES → QW-CONTRACT` | `describes_capability` | `question_selection` | `js/question-word-assessment-contract.js` | `capability_not_evidence` |
| `QW-CONTRACT → ASSESS-SELECT` | `guards_target` | `assessment_target_declaration` | `js/question-word-assessment-contract.js; js/verb-explorer-thinking-mind-assessment-selection.js` | `explicit_only` |
| `GEAR-06 → ASSESS-SELECT` | `requests_assessment` | `qw_selection` | `js/verb-explorer.js` | `explicit_target_required` |
| `ASSESS-SELECT → EVAL-08` | `authorizes_or_resumes` | `selected_qw_with_target` | `js/verb-explorer-thinking-mind-assessment-selection.js` | `contract_only` |
| `RUNTIME-EXP → EVAL-08` | `mounts` | `renderExperience` | `js/verb-explorer.js` | `mount_not_credit` |
| `EVAL-08 → FLOW-01` | `submits_authorized_attempt` | `choice_or_probe_action` | `js/verb-explorer-adaptive-coordinator.js` | `contract_and_scope_required` |
| `AUTH-01 → EVAL-08` | `guards` | `assessment_boundary_check` | `js/question-word-assessment-contract.js` | `explicit_only` |
| `SCOPE-BOUNDARY → AUTH-01` | `establishes_scope` | `learner_skill_language_origin` | `js/adaptive-assessment-scope.js` | `browser_scope_only` |
| `FLOW-01 → TRAIL-10` | `provides_view_data` | `scoped_assessment_change` | `js/verb-explorer-learner-trail-surface.js` | `canonical_view_only` |
| `TRAIL-10 → WORD-11` | `supplies_witness_view` | `trail_expansion_and_scoped_refresh` | `js/verb-explorer-polyglot-word-path-view.js` | `read_only` |
| `RUNTIME-EXP → SPEECH-A` | `constructs` | `corpus_render` | `js/verb-explorer.js` | `read_only_or_visual` |
| `SOURCE-HIGHLIGHT → SPEECH-A` | `highlights` | `render_corpus_line` | `js/study-target-presentation.js` | `read_only_or_visual` |
| `SPEECH-A → SPEECH-RUNTIME` | `requests_speech` | `corpus_line_click` | `js/verb-explorer.js` | `audio_not_attempt` |
| `SPEECH-B1 → SPEECH-RUNTIME` | `requests_speech` | `assessment_question_audio` | `js/verb-explorer.js` | `audio_not_answer` |
| `SPEECH-B2 → EVAL-08` | `submits_selection` | `response_button_click_only` | `js/verb-explorer-what-assessment-live.js; js/verb-explorer-why-assessment-live.js` | `contract_gate_required` |
| `JSON-SEEDS → CONTEXT-CHECK` | `supplies_context` | `why_corpus_resolution` | `js/verb-explorer-contextual-coherence.js` | `read_only_or_visual` |
| `CONTEXT-CHECK → LIVE-07` | `grounds_corpus` | `why_tense_mode_language` | `js/verb-explorer.js` | `no_semantic_grading` |
| `JSON-FUNCTIONS → FUNC-13` | `reference_data` | `func13_opt_in_preview` | `js/verb-explorer-h14-14-preview.js` | `source_only_no_evidence` |
| `GEAR-06 → FUNC-13` | `requests_projection` | `perspective_tense_mode_language_change` | `js/verb-explorer-h14-14-preview.js` | `source_only_no_evidence` |
| `FUNC-13 → TRAIL-10` | `visually_adjacent_only` | `none` | `verb-explorer.html` | `no_data_transfer` |
| `RUNTIME-EXP → STATE-01` | `remembers` | `experience_navigation` | `js/verb-explorer-experience-presentation-memory.js` | `presentation_state_only` |
| `RUNTIME-EXP → PATITA-12` | `observed_by` | `learner_ui_click` | `js/verb-explorer-patita-interaction-trail.js` | `observation_only` |
| `LAB-39 → H14-40` | `reconciled_by` | `h14_40_reuse_review` | `docs/JAGUAR-H14-40-V30-85C-DURABLE-IDEMPOTENCY-REUSE.md` | `laboratory_only` |
| `LAB-85C → H14-40` | `reused_study_by` | `h14_40_reuse_review` | `data/learning/references/jaguar-h14-40-durable-idempotency-reconciliation-v0.1.json` | `laboratory_only` |
| `H14-40 → GATE-01` | `requires_selective_integration` | `future_go_no_go` | `docs/JAGUAR-H14-40-V30-85C-DURABLE-IDEMPOTENCY-REUSE.md` | `never_automatic` |
| `REG-02 → GATE-01` | `governance_reference` | `impact_review` | `docs/SIYAYO-BACKSTAGE-FLOW-REGISTRY.md` | `docs_only` |

## Cenários de auditoria e verificação

### IM-01 — Troca QW ou idioma com painel antigo

**Gatilho documentado:** `question_language_tense_mode_perspective_click`, `question_or_language_or_experience`.
**Ponto de partida:** `GEAR-06`, `RUNTIME-EXP`, `JSON-SEEDS`, `PRES-COPY`.
**Conferir impacto em:** `EXP-01`, `CTX-02`, `DEP-03`, `HEAD-04`, `LIVE-07`, `EVAL-08`, `TRAIL-10`, `WORD-11`, `PATITA-12`, `FUNC-13`.
**Gate requerido:** `language_qw_regression`.

Verificações:
- Repeat EN→ES→PT and QW WHAT→WHY→WHICH within S1–S4
- Verify each localized title, dependency diagram, corpus and opt-in preview redraw
- Ensure retained evidence remains in exact learner/skill/language/origin scope while wrong pending selection is invalidated
- Check free exploration never creates credit

**Impedir integração quando:** `stale_ui`, `scope_leak`, `implicit_assessment`.

### IM-02 — Responsive Stage e geometria do Dependency Focus

**Gatilho documentado:** `siyayo:responsive-preview-changed`.
**Ponto de partida:** `RS-01`, `DEP-SURFACE`.
**Conferir impacto em:** `DEP-03`, `LIVE-07`, `GEAR-06`.
**Gate requerido:** `responsive_visual_device`.

Verificações:
- Use AUTO, PORTRAIT(430px), LANDSCAPE(844px) desktop preview
- Observe redraw and scroll of dependency connector links
- Verify touch-first device uses AUTO and toolbar is hidden
- No changes to QW, Evidence or learner identity

**Impedir integração quando:** `connector_misalignment`, `unauthorized_pedagogical_change`.

### IM-03 — Montar SPEECH-A com speaker à direita acima de NEXT

**Gatilho documentado:** `corpus_line_click`.
**Ponto de partida:** `SPEECH-A`, `LIVE-07`.
**Conferir impacto em:** `SOURCE-HIGHLIGHT`, `SPEECH-RUNTIME`, `NEXT-09`, `RS-01`.
**Gate requerido:** `visual_speech_only`.

Verificações:
- Locate .living-window and insert before .toroidal-next without replacing evaluative probes
- Preserve gold token bold and center-aligned text across EN/ES/PT
- Original current implementation has LEFT speaker; right alignment is a proposed scoped CSS variant
- Speech action must not become response/Attempt; test keyboard focus and portrait

**Impedir integração quando:** `text_overlap`, `audio_submits_answer`, `next_interference`.

### IM-04 — Atualizar estrutura JSON de Dependency Focus

**Gatilho documentado:** `question_or_language_or_experience`.
**Ponto de partida:** `JSON-DEPENDENCIES`, `DEP-SURFACE`.
**Conferir impacto em:** `DEP-03`, `HEAD-04`, `CONTEXT-CHECK`.
**Gate requerido:** `json_semantic_and_ui`.

Verificações:
- Validate language/QW/Experience source path and graph node labels
- Verify existing diagram projection and Head Probe use canonical structure
- No inferred dependency or evaluator from missing authoring
- Inspect EN/ES/PT responsive connections

**Impedir integração quando:** `unproven_dependency`, `stale_graph`, `unexpected_evidence`.

### IM-05 — FUNC-13 recebe novas células da matriz

**Gatilho documentado:** `func13_opt_in_preview`, `perspective_tense_mode_language_change`.
**Ponto de partida:** `JSON-FUNCTIONS`, `FUNC-13`.
**Conferir impacto em:** `GEAR-06`, `RUNTIME-EXP`, `TRAIL-10`.
**Gate requerido:** `func13_source_only`.

Verificações:
- Confirm H14.13 unified projection and source provenance
- Only show authored grammar; no fabricated PERIOD variants
- Maintain panel hidden without explicit preview query
- No Evidence, Green Pass or mutation of Trail

**Impedir integração quando:** `missing_provenance`, `unhomologated_example_presented_as_authorized`, `preview_leaks_to_default`.

### IM-06 — Enriquecimento JSON de Experience/QW

**Gatilho documentado:** `json_source_change`.
**Ponto de partida:** `JSON-SEEDS`, `JSON-CAPABILITIES`, `JSON-SKILLS`.
**Conferir impacto em:** `GEAR-06`, `LIVE-07`, `CONTEXT-CHECK`, `AUTH-01`, `EVAL-08`, `TRAIL-10`.
**Gate requerido:** `source_authority`.

Verificações:
- Diff old/new JSON schema and record source commit, author, provenance and origin
- Validate EN/ES/PT, target QW, TENSE/MODE/PERSPECTIVE and missing corpus gaps
- Confirm QW opportunity is not an implicit assessmentTarget
- Compare consumers and run cross-selection regressions before selective merge

**Impedir integração quando:** `duplicated_canonical_source`, `unsupported_grammar`, `silent_contract_change`, `schema_drift`.

### IM-07 — WHY S1/S2 dimensão, intenção e novo contrato

**Gatilho documentado:** `new_assessment_target`.
**Ponto de partida:** `H14-40`, `LAB-39`, `AUTH-01`, `EVAL-08`.
**Conferir impacto em:** `GATE-01`, `LAB-85C`, `FLOW-01`, `PATITA-12`, `TRAIL-10`, `WORD-11`.
**Gate requerido:** `eval_contract_teacher`.

Verificações:
- Check DG-01 and DG-02 independently before any new authority
- Preserve existing S3→S4 WHY cycle and approved review scope
- Require direct author action, independent question-function/local/transfer dimension and explicit origin
- Do not promote simulated or pending attempt to canonical Evidence

**Impedir integração quando:** `unapproved_contract`, `pending_promoted_to_pass`, `patita_credit`.

### IM-08 — Reutilizar V30.3.85C no Explorer

**Gatilho documentado:** `storage_schema_proposal`.
**Ponto de partida:** `LAB-85C`, `H14-40`.
**Conferir impacto em:** `AUTH-01`, `GATE-01`, `FLOW-01`, `TRAIL-10`, `WORD-11`.
**Gate requerido:** `backend_security_staging`.

Verificações:
- Identify exact (learner_subject,event_id) key and schema snapshot; no second occurrence bank
- Verified server principal—not NICK—owns events; stable UUIDv4 across one submission retries
- Replay same payload yields duplicate, changed language/origin/payload fails closed
- Prove atomic Evidence lifecycle, actual Worker/D1 races and rollback separately before live integration

**Impedir integração quando:** `nick_as_storage_identity`, `remote_migration_without_approval`, `duplicate_bank`, `storage_receipt_treated_as_evidence`.

### IM-09 — Reposicionar elemento de LIVE-07 sem alterar NEXT

**Gatilho documentado:** `experience_navigation`.
**Ponto de partida:** `LIVE-07`, `NEXT-09`.
**Conferir impacto em:** `SPEECH-A`, `SPEECH-B1`, `SPEECH-B2`, `EVAL-08`, `RS-01`.
**Gate requerido:** `layout_navigation`.

Verificações:
- Insert DOM child immediately before .toroidal-next and preserve parent .living-window
- Preserve choice, contrast, assessment controls and NEXT keyboard click
- Test layout in desktop and mobile portrait/landscape
- Confirm NEXT permission/target unchanged

**Impedir integração quando:** `button_reparented`, `navigation_behavior_changed`, `evaluation_overlap`.

### IM-10 — Discordância entre PATITA e Learning Trail

**Gatilho documentado:** `learner_ui_click`, `scoped_assessment_change`.
**Ponto de partida:** `PATITA-12`, `TRAIL-10`, `WORD-11`.
**Conferir impacto em:** `AUTH-01`, `FLOW-01`, `STATE-01`.
**Gate requerido:** `audit_evidence_provenance`.

Verificações:
- Compare observational interaction scope vs canonical accepted witnesses; do not equate them
- Ensure cross-language and learner isolation
- Confirm Word Path read-only and no evidence created from replay of PATITA ledger
- Check records after free exploration and valid authorized attempt separately

**Impedir integração quando:** `evidence_from_observation`, `scope_leak`, `display_counts_as_credit`.

## JSON enrichment — detecção de conflito e duplicação

Antes de autorar JSON, verificar dados existentes em `experience-seeds.json`, `question-word-capabilities.json`, `data/learning/dependencies/`, `data/learning/skills/` e `data/learning/references/`; registrar arquivo + commit + consumidores, coerência em EN/ES/PT, QW, TENSE, MODE, PERSPECTIVE e cobertura dos cenários. `assessmentTarget` é fronteira explícita; a presença de QW não cria contrato.

## V30.3.85C — fronteira de memória durável

A migração SQLite/D1 estudada usa `(learner_subject,event_id)` como chave primária, porém é **LOCAL-ONLY**. `event_id` é UUIDv4 estável de uma submissão; **NICK não autentica**. Apenas `observed_exploratory` ou `pending` podem ser armazenados nessa tabela. A migração não possui coluna exclusiva de dimensão/intenção, não cria Evidence, não avaliou autenticação real nem concorrência distribuída do Worker/D1. As sete lacunas DG-01…DG-07 permanecem declaradas **OPEN no checkpoint H14.40**. Para integrá-la: nova leitura de HEAD, identidade confiável, contrato de dimensão/intenção, teste atômico de Evidence, rollback e decisão seletiva.

## Modelo obrigatório de revisão GO/NO-GO

```json
{
  "change_id": "REG-03-review-example",
  "source_branch": "",
  "source_sha": "",
  "target_branch": "",
  "target_head": "",
  "changed_paths": [],
  "modules_direct": [],
  "modules_transitive": [],
  "authority_diff": "none/needs-review",
  "regression_evidence": [],
  "human_homologation": "PENDING",
  "decision": "REVIEW_REQUIRED",
  "rollback_plan": ""
}
```

**Critério:** `GREEN` em CI confirma os testes executados, não a homologação visual, pedagógica ou autorização de produção. Nenhum merge automático; nenhum contrato ou banco recebe autoridade deste registro.

## Integração entre chats

Solicitação-modelo: **JAGUAR, consulte o SIYAYO REG-03 em `docs/siyayo-impact-integration-map.json` e o REG-02; compare o HEAD da branch que estamos editando com os snapshots e audite o impacto de `GEAR-06` sobre `LIVE-07`, `EVAL-08`, `TRAIL-10` e PATITA. Faça primeiro um diagnóstico GO/NO-GO, sem alterar avaliação ou produção.**

## Inventário de artefatos

- `docs/siyayo-impact-integration-map.json`: grafo estruturado com fontes, relações, gatilhos, cenários e invariantes.
- `docs/SIYAYO-IMPACT-INTEGRATION-MAP.md`: manual legível, pontos de execução, gates e testes.
- `docs/SIYAYO-MODULE-GOVERNANCE-REGISTRY.md`: registro dos 18 módulos, com ponte para REG-02 e REG-03.
- `docs/SIYAYO-BACKSTAGE-FLOW-REGISTRY.md`: fronteiras de JSON, armazenamento e laboratórios, com ponte para REG-03.

## XPR-01 — Catálogo interprojetos (SIYAYO + Mestre Canto Ensino)

O [Cross-Project Registry](./SIYAYO-CROSS-PROJECT-REGISTRY.md) referencia 18 módulos SIYAYO e 21 módulos MCE com qualificadores `SIA:` e `MCE:`, sem transferir autoridade, áudio, conteúdo ou implementação entre repositórios. O [JSON estruturado](./siyayo-cross-project-registry.json) registra relações efetivamente adaptadas (RS-01), possibilidades futuras e exclusões; `node scripts/validate-siyayo-cross-project-registry.mjs` verifica sua integridade interna, sem consultar GitHub remoto.

## XPR-02 — Read-only drift audit

A [auditoria de divergências](./SIYAYO-CROSS-PROJECT-DRIFT-AUDITOR.md) compara HEADs expressamente inscritos em uma [watchlist](./siyayo-cross-project-watchlist.json), analisa arquivos modificados e aponta consumidores candidatos. O script não monitora continuamente, não descobre branches automaticamente e não integra código.
