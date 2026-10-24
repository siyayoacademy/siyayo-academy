# JAGUAR H14.2 — Visão de Águia · Matriz de oportunidades

## Achado auditável (corpus atual)
- 4 Experiences com 21 slots Experience × QW. Cada slot contém pergunta EN/ES/PT.
- 5 slots declaram `assessmentTarget` (início avaliativo autorizado).
- 2 slots declaram `assessmentResumeTarget` (retomada do contrato existente).
- 10 slots têm resposta/contexto explicitamente estruturado por `answerGrounding`, `dialogueForms`, `choiceContext`, `reasonGrounding` ou `responses`.
- 11 slots não apresentam esses formatos de resposta contextual; `presentationGrounding` sozinho não significa resposta aceita.
- S1 WHY e S2 WHY já oferecem apresentação contextual, mas não podem ganhar `assessmentTarget` sem revisão/autorização de contrato.
- S3 WHAT apresenta contexto sem `assessmentTarget`: conteúdo disponível não é automaticamente início de avaliação.
- Os campos `assessmentEntryFrom` para S2 WHAT e S3 WHY indicam exceções autoradas de início independente condicionado, não licença geral de rota sem autorização.
- `assessmentResumeTarget` de S2 WHICH e WHERE continua exigindo origem e evidência do contrato já iniciado.

## Regra de trabalho HOW TO DO → HOW TO SHOW
Cada novo slot deve passar pela análise em ordem: situação/necessidade semântica da Experience → pergunta EN/ES/PT → resposta contextual → TENSE/MODE/PERIOD e Word Type → possíveis provas e distrações → elegibilidade contratual → exposição no LINES, Dependency Focus, Head Probe e PATITA.
A Master VIP prevalece nas definições didáticas originais. THERE + TO BE / EXISTENCE mantém status de proposta contextual em referência, não conteúdo avaliativo ativo.

## Decisão de governança
O mapa `data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json` é **somente leitura**: não altera seeds, Question Word menus, contratos, seleção runtime, evidências, Green Pass ou publicação.
A liberdade de explorar é independente do direito de obter crédito. Expandir um assessmentTarget ou transferibilidade requer novo contrato aprovado e bateria de regressões.
O próximo ELO operacional deve selecionar um slot contextual por vez para autoria e avaliação de adequação, sem preenchimento em massa.
