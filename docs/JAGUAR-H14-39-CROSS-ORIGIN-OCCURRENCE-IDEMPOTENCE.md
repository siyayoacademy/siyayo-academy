# JAGUAR H14.39 — Occurrence identity, origin scope and idempotency

**ELO de laboratório.** Não há um repositório persistente de tentativas aqui nem autoridade para conceder Evidence. H14.39 simula um ledger em memória apenas durante uma chamada, usando nomes fictícios `SIM_A`, `SIM_B` e IDs sintéticos `SIM_OCC_...`.

## Distinções
- **Escopo:** perfil sintético × skill WHY × idioma EN/ES/PT × Experience de origem. Navegação a uma Experience diferente não troca automaticamente a origem.
- **Ocorrência:** token hipotético global à simulação; repetir o mesmo envelope gera `IDENTICAL_REPLAY_NO_OP`; reaproveitar o token para outra dimensão, origem, idioma ou perfil dá `OCCURRENCE_COLLISION_FAIL_CLOSED`.
- **Tarefas:** reconhecer WHY, justificar localmente e justificar na transferência; S2 pode ser origem própria ou cenário de transferência de S1. O mesmo evento nunca satisfaz automaticamente os dois papéis.
- **Ações não comprobatórias:** PATITA observando, reprodução pelo speaker, visita à cena, resposta-modelo exposta, identidade de origem/idioma incongruente, ausência de ação autoral ou ocorrência não validada.
- **Repetições legítimas:** outra ocorrência sintética pode constituir nova tentativa candidata na mesma dimensão. Isso não significa crédito, nem que o aluno realmente demonstrou independência.
- **Privacidade:** o simulador não aceita identificadores reais, textos das respostas ou registros da avaliação canônica.

## Limite exato do GREEN
Testar replay/conflito **dentro de uma chamada em memória** não demonstra idempotência durável, concorrente nem entre dispositivos. Esses requisitos serão responsabilidade futura de um contrato EVAL-08 autorizado, com armazenamento transacional, isolamento por aluno, autenticação, chaves únicas e verificação de eventos. O laboratório devolve sempre `canMintEvidence:false`.

**PATITA observa; o contrato específico EVAL-08 avalia.** O ciclo canônico WHY S3→S4 permanece intacto. FUNC-13 continua oculto, PERIOD segue pendência do GEAR-06. Nenhum merge na `main`, modificação da PR #3 ou publicação de produção.

Próximo portão útil: modelar um contrato de idempotência durável **sem conectá-lo ao runtime real**, ou executar a revisão pedagógica HG-04/05/09/10 com professores humanos, conforme autorização.
