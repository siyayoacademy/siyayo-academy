# JAGUAR H14.25 — WHY S1/S2 · Estudo Fino trilíngue
## Estado
SOMENTE AUDITORIA DE FONTES. Nenhum contrato, evidência, PATITA, Explorer ou produção alterado. S3→S4 permanece ciclo canônico existente.

## S1 Shopping — preferência pelo queijo
Pergunta genérica "Why do you prefer this one?" não determina o referente sem contexto. `presentationGrounding.questionOverride` fornece "Why do you prefer the fresh cheese?" e equivalentes ES/PT. Referência: "Because the fresh, mild cheese pairs well with the salmon." O dado de queijo existe como referência lexical sem exigir GREEN anterior em WHICH. Contraste "Because we have already finished shopping" pode ser gramatical mas não responde à preferência pelo queijo. O contraste ainda requer homologação humana, nunca pontuação implícita.

Os nove `dialogueForms` para PRESENT/PAST/FUTURE × AFFIRMATIVE/NEGATIVE/INTERROGATIVE são **material gramatical de autoria**, NÃO são nove respostas avaliativas WHY. Formas interrogativas de resposta podem virar pergunta de confirmação e não uma explicação causal. Apenas `presentationGrounding` PRESENT/AFFIRMATIVE é exibível como referência exploratória no resolvedor 90C atual.

## S2 Preparing — motivo da preparação conjunta
Pergunta "Why are we preparing this dinner together?" / "¿Por qué estamos preparando esta cena juntos?" / "Por que estamos preparando este jantar juntos?". Referências EN: "Because preparing it together lets us share the experience."; ES: "Porque prepararla juntos nos permite compartir la experiencia."; PT: "Porque prepará-lo juntos nos permite compartilhar essa experiência." O referente é `this dinner` / `esta cena` / `este jantar`, distinto da preferência por queijo S1. A forma ES `prepararla` retoma `la cena`, PT `prepará-lo` retoma `o jantar`. É leitura de fonte já escrita, não nova autoria.

O contraste "still-shopping" refere-se ao supermercado, incompatível com uma cena de cozinha em casa; sua qualidade didática ainda exige revisão humana.

## Transferência sem rigidez
S1→S2 e S2→S1 permanecem **DRAFT_NOT_AUTHORIZED**. As duas razões podem ser semanticamente distintas (ingrediente × atividade compartilhada), mas isso por si só não demonstra transferência da competência WHY. S2 também possui papel potencial de transferência no circuito originado em S1 e de origem própria; contratos precisam distinguir intenção, origem e ocorrência para não duplicar crédito. Não obrigar passagem sequencial nem pedir GREEN em HOW/WHICH como condição de explorar WHY. O circuito S3→S4 já existente continua intocado.

## Matriz de decisão
- **HOW TO DO:** identificar pergunta, referente, resposta causal e contraste no JSON; delimitar TENSE/MODE/PERIOD.
- **HOW TO CHECK:** verificar motivo adequado na cena e tradução EN/ES/PT; distinguir resposta contextual de forma gramatical; impedir evidência sem tentativa observada, escopo e contrato.
- **HOW TO SHOW:** mostrar apenas referências em estudo e estados pendentes, sem misturá-las com LINES canônicas nem pontuar.
- **HOW TO RECORD:** PATITA permanece observacional; contratos atuais são donos exclusivos da Evidence.
- **Próximo portão:** homologação humana do contraste/contexto e especificação de tarefa independente para S1 e S2 com transferência diferenciada. Nenhum novo AssessmentTarget nem PassContract agora.

## Verificações
`scripts/jaguar-h14-25-why-s1-s2-fine-review.js` lê fontes H14.5, H14.6 e Experience seeds. Testa seis visões S1/S2×EN/ES/PT e bloqueia autorização indevida, formas não autoradas, referendos imprecisos e alterações nos hashes de origem. O relatório detalhado `h14-25-why-review.json` fica nos artefatos do GitHub Actions.
