# JAGUAR H14.28 — Laboratório de contrastes semânticos WHY

**STATUS: estudo fino / revisão humana, SEM avaliador automático.**

O laboratório cria 48 respostas de demonstração **novas**, claramente marcadas como `NEW_EXPLICITLY_SYNTHESIZED_LAB_EXAMPLE`, distribuídas em S1 Shopping e S2 Preparing × EN/ES/PT × oito contrastes. Essas frases não fazem parte automaticamente do corpus canônico e **não foram homologadas**.

### Categorias
1. **GROUNDED_PARAPHRASE:** mesma relação causal em palavras diferentes da referência.
2. **MINOR_LANGUAGE_ERROR:** sentido adequado apesar de imperfeição ortográfica ou gramatical identificável.
3. **PARTIAL_REASON:** justificativa geral com referente ou relação pouco específicos.
4. **OFF_CONTEXT:** frase correta linguisticamente, mas incompatível com a cena.
5. **MANNER_INSTEAD_OF_REASON:** descreve HOW/procedimento no lugar da causa WHY.
6. **PLAUSIBLE_UNVERIFIED:** motivo imaginável, mas não sustentado pelos fatos narrados; exige revisão, não aprovação automática.
7. **FUNCTION_PARAPHRASE:** explica o tipo de informação solicitado (função interrogativa), **não** responde à razão local.
8. **MODEL_ECHO:** repete a resposta de referência; correspondência literal **não demonstra independência**.

A rubrica H14.27 orienta três avaliações distintas: (a) pertinência semântica/contextual 0/4 proposta, (b) clareza linguística e concordância, (c) progresso contratual 0/3 exclusivamente por circuito canônico previamente autorizado. **Nenhuma dessas 48 frases recebe nota automática.** A classificação de caso e os rótulos de expectativa são hipóteses de estudo que exigem apreciação humana, inclusive quando o caso parece óbvio.

S1 pergunta por que alguém prefere queijo fresco, com referente salmão; S2 pergunta por que preparam o jantar juntos. O modo de preparar não substitui a causa. Razões alternativas podem ser válidas quando realmente apoiadas no contexto; não rejeitar respostas somente por não repetir o modelo, mas não inventar novos fatos da cena.

### Governança e preservação
Registro de governança consultado em H14.27, branch `jaguar/module-governance-registry-20261024`, com base histórica H14.19: HEAD-04 permanece análise sintática, EVAL-08 responde apenas por contratos autorizados, LIVE-07/SPEECH-A apenas apresentam ou pronunciam, PATITA-12 observa. FUNC-13 ainda oculto; PERIOD segue lacuna GEAR-06.

Este ELO **não toca** Experience seeds, skills WHY, contratos canônicos, Explorer, PATITA, Learning Trail, PR #3, main ou produção. A próxima etapa deve ser a homologação pedagógica das paráfrases e a elaboração de critérios de aceitação com auditoria de falsos positivos/negativos, sem automatizar decisão livre antes da aprovação.
