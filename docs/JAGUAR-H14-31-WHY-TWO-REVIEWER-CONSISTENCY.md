# 🔔🐆 JAGUAR H14.31 — Consistência de pareceres semânticos WHY

## Missão
Estudar a **consistência de julgamento humano**, sem reduzir respostas livres à comparação literal. Aplica-se a WHY em S1 Shopping e S2 Preparing, para EN/ES/PT, com 48 exemplos **sintéticos** H14.28, matriz de riscos H14.29 e estados orientativos H14.30.

**Não existe aqui um avaliador automático. Não existem avaliações humanas coletadas até este momento.** Os dois pareceres demonstrativos usados nos testes são inteiramente simulados para verificar o funcionamento da comparação. Não reportar concordância entre esses testes como confiabilidade pedagógica real.

## Rotina para dois avaliadores
1. Cada revisor recebe a pergunta, Experience, idioma, objetivo da dimensão (question-function ou reason-answer(local)), texto semântico do caso e evidências do cenário; a hipótese H14.30 é referência para debate, não um gabarito a copiar.
2. Revisões independentes incluem: `state` (COHERENT, PARTIAL, NEEDS_REVIEW, INCOHERENT); `contextualBand` (0–4 ou `null` quando insuficiente); `expressionQuality` (CLEAR, UNDERSTANDABLE_WITH_LANGUAGE_ERRORS, MEANING_UNCLEAR); `rationale` contextual fundamentada. Idioma, Experience, dimensão e código do caso devem coincidir; revisores precisam de IDs diferentes.
3. O comparador somente relata concordância ou divergência entre **dois pareceres fornecidos**, não classifica texto novo. Falta de um segundo parecer = `AWAITING_SECOND_INDEPENDENT_REVIEW`; dados incompletos ou misturados = `INVALID_REVIEW_SET`.
4. Divergência do estado ou diferença superior a uma faixa contextual = `NEEDS_SEMANTIC_ADJUDICATION`; desacordo exclusivamente linguístico = `NEEDS_LANGUAGE_ADJUDICATION`. Respostas com premissa não verificada, situação ambígua ou repetição do modelo sem independência permanecem `NEEDS_SOURCE_OR_INDEPENDENCE_REVIEW`, inclusive quando os dois revisores coincidirem.
5. Dois pareceres compatíveis produzem `CONSISTENT_REVIEWS_PENDING_HOMOLOGATION`, **nunca** aprovação automática da resposta de um aluno.
6. A revisão final e qualquer possível autorização contratual pertencem a processo pedagógico e jurídico/técnico distinto; PATITA apenas observa, EVAL-08 é a fronteira de avaliação autorizada.

## Três eixos inconfundíveis
- **Coerência contextual**: faixa 0/4 como guia da revisão pedagógica, não escore de aluno atribuído por este componente.
- **Qualidade linguística**: classificação independente; erro pontual não apaga causa bem fundamentada, mas linguagem ambígua exige investigação.
- **Progresso contratual 0/3**: exclusivamente Evidence de uma tentativa real, independente, vinculada ao aprendiz, QW, idioma e Experience de origem sob contrato autorizado; os pareceres não concedem progresso.

## Entregáveis
- `scripts/jaguar-h14-31-two-reviewer-consistency.js`: instrumento puro, sem I/O, para comparar pareceres humanos explícitos sobre as 48 referências.
- `scripts/jaguar-h14-31-review-form.js`: 48 formulários vazios, com as duas avaliações e mediação pendentes; exportáveis como JSON.
- `scripts/test-jaguar-h14-31-two-reviewer-consistency.js`: compara **sete pares simulados** para exercício de concordância e divergência (sem uso como estatística de confiabilidade real), testa idiomas, identificação de dimensões e ausência de Evidence.
- Este documento e o workflow de validação.

## Futuros critérios de homologação
Recolher avaliações de professores reais e independentes com instruções equivalentes nos três idiomas, avaliar divergências sem induzir julgamento pela rubrica, investigar erros sistemáticos por Experience, separar revisão de traduções de revisão do referente causal, auditar premissas não fundamentadas e justificar cada mediação. Não impor concordância artificial nem usar o estado COHERENT da dimensão question-function como prova de reason-answer(local).

## Fronteiras inalteradas
O registro de governança SIYAYO foi consultado em H14.27; `HEAD-04` = sintaxe, `EVAL-08` = contrato autorizado, `LIVE-07`/`SPEECH-A` = apresentação, `PATITA-12` = observação, `FUNC-13` oculto e `GEAR-06-PERIOD-GAP` pendente. `main`, PR #3, Experience seeds, contrato WHY atual, Explorer oficial, Learning Trail e produção não são modificados.
