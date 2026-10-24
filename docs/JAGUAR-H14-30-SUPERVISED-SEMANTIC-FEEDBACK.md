# JAGUAR H14.30 — Protocolo de decisão semântica supervisionada

**Natureza:** laboratório de revisão pedagógica. Os 48 exemplos do H14.28 receberam sugestões de estados e feedback, sem processar nenhuma resposta real do aprendiz. O código NÃO é um classificador de texto livre nem pode criar AssessmentTarget, Attempt, Evidence ou Green Pass.

## Estados de análise (hipóteses)
- **COHERENT**: significado pertinente à pergunta contextual e suficientemente fundamentado; aceitar paráfrases, mantendo qualidade linguística separada. Também pode indicar reconhecimento correto da função WHY, **apenas na dimensão question-function**.
- **PARTIAL**: razão genérica ou referente incompleto, mas com tentativa de ligação ao contexto; fornecer pergunta de aprofundamento, sem tratar como fracasso definitivo.
- **NEEDS_REVIEW**: fato causal não estabelecido, repetição de modelo sem independência observada, leitura ambígua ou evidência insuficiente. Pedir esclarecimento ou revisar o contexto.
- **INCOHERENT**: descreve outra cena ou responde HOW quando a tarefa exige justificativa WHY; feedback específico que permita nova tentativa.

Todo estado é `hypothesis`, sujeito a homologação docente. Não há `0/4` calculado nem `0/3` produzido; a rubrica 0/4 serve a revisão da adequação contextual, o progresso 0/3 pertence exclusivamente ao contrato canônico autorizado. Qualidade da língua tem eixo próprio (CLEAR, UNDERSTANDABLE_WITH_LANGUAGE_ERRORS, MEANING_UNCLEAR) e não interfere mecanicamente no sentido.

**Governança:** consulta já auditada no SIYAYO Module Registry (baseline H14.19) permanece compatível: EVAL-08 governa avaliações autorizadas, HEAD-04 análise sintática, LIVE-07 / SPEECH-A apresentação, PATITA-12 observação, GEAR-06 eixos e PERIOD pendente. FUNC-13 oculto, intacto.

**Limites de H14.30:** sem alteração no Explorer, corpus, contrato, PATITA, Learning Trail, PR #3, `main` ou produção. A próxima etapa poderá investigar revisão humana de casos adversos e ambíguos para delimitar falsos positivos/negativos, **antes** de qualquer decisão automatizada.
