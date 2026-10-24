# JAGUAR H14.6 — WHY · Contrato por Experience / escopo independente

**Status: `SPECIFIED_NOT_AUTHORIZED`.** H14.5 CI GREEN: [Actions 40052328516](https://github.com/siyayoacademy/siyayo-academy/actions/runs/40052328516). H14.6 transforma os resultados H14.2–H14.5 em **proposta contratual auditável**, sem editar `experience-seeds.json`, `skills/why.json` nem o runtime.

## Especificação dos três circuitos

| Identidade | Início (local) | Transferência proposta/existente | Estado |
|---|---|---|---|
| WHY-S1-S2-DRAFT | S1 escolha de queijo → harmonização com salmão | S2 preparação conjunta → partilha | Proposta sem autorização |
| WHY-S2-S1-DRAFT | S2 preparação conjunta → partilha | S1 escolha do queijo → harmonização | Estudo de transferência na revisita, sem obrigatoriedade de ordem, sem autorização |
| WHY-S3-S4-CANONICAL | S3 motivo pelo qual o jantar é especial | S4 motivo de apreciar a conversa | **Contrato existente inalterado** |

As duas direções S1↔S2 são **candidatas distintas por origem e tipo de pergunta causal**, não autorizações duplas e não prova de transferência: o aprendiz terá que responder uma tarefa contextual independente no destino. Retroceder a S1 poderá ser válido como revisita deliberada, mas não é progressão automática nem exige voltar obrigatoriamente ao supermercado.

S4 tem contexto causal e pode ser estudado futuramente como origem própria, mas permanece no papel canônico de transferência S3 até que exista outra oportunidade e contrato aprovado.

## Por que duas identidades são necessárias em S2

O aluno pode chegar a S2 e **iniciar WHY próprio S2**, ou já ter começado WHY em S1 e **transferir/revisitar o contrato S1**. O mesmo cenário não deve apropriar-se automaticamente do progresso de outra origem. Despacho futuro exige comando explícito `start | resume | transfer`, com `originExperienceId` no segundo e terceiro casos. Sem intenção ou origem não se decide nada. Ainda será necessária uma UI humanamente clara; o estudo puro não a publica.

Chave de escopo atual, preservada: `learnerId × skill × language × originExperienceId`. A `Experience` onde ocorre a tentativa é metadado do evento, e não altera a origem. O aluno não precisa completar WHICH, nem passar por HOW, nem ir por NEXT para conhecer a situação. **A mesma QW pode ter origem independente em cada Experience**, mas só depois da homologação.

## Prova necessária (contrato WHY vigente como base)

1. `question-function` — reconhecer WHY como procura de causa, em contraste conceitual com HOW (maneira); a presença da QW HOW no menu não é pré-requisito.
2. `reason-answer(local)` — ação explícita do aluno sobre uma causa apropriada à situação de origem, com forma EN/ES/PT controlada.
3. `reason-answer(transfer)` — ação explícita sobre uma causa em situação semanticamente diferente. A prova de transferência **não precisa ser coletada depois das outras provas**, mas o contrato não fecha até satisfazer todos os requisitos autorizados.

Necessário distinguir exercício interrogativo de resposta causal; boa gramática não garante pertinência da resposta. Clicar em áudio/LINES/Dependency Focus/Head Probe ou navegar gera observação PATITA, **não Evidence**. O 0/4 de adequação contextual não equivale ao 0/3→3/3 dos três requisitos do contrato.

## Cuidados de implementação futura (não realizada)

- **Fonte:** `presentationGrounding` autorado de S1 e S2 serve como hipótese de pergunta/alternativas, não como `reasonGrounding` avaliativo automaticamente aceitável. Validar gesto próprio de resposta, chance de acerto por alternativas, distratores e independência de pistas.
- **Autoridade:** registro por Experience com status `DRAFT_NOT_AUTHORIZED`; aprovação separada do `assessmentTarget` e de especificações locais/transfer; não liberar apenas por mudança de campo ou navegação.
- **Armazenamento:** reter e restaurar sessões por chave integral; proibir transferência de evidência entre NICK, língua ou origem. NICK é identificação pedagógica de interface, **não autenticação verificada do backend**.
- **Separação S2:** selecionar expressamente origem para `transfer` ou `resume`; nunca inferir que a entrada de S2 é transferência S1 nem que S2 deve apagar a sessão de S1.
- **Runtime:** substituir acoplamentos a `toroidalNext` e presença de HOW como *gatilhos avaliativos* por verificações de contrato e autoria, sem apagar a navegação canônica ou alterar o comportamento S3→S4.
- **HOW TO SHOW:** a UI deve mostrar QW, língua, Experience atual e origem do contrato; PATITA apresenta observações sem reivindicar pontos; Word Path/Trail apresentam somente evidências realmente aceitas.
- **PERIOD/TENSE/MODE:** o piloto contextual de S1/S2 é PRESENT + AFFIRMATIVE. PAST/FUTURE, negativos, interrogativos e períodos perfeitos demandam estudo de adequação próprio, inclusive exemplos interrogativos que não são causas.

`scripts/jaguar-h14-6-contract-inspector.js` serve exclusivamente a estudo de elegibilidade **sem `Attempt`, `Evidence`, `GREEN` ou despacho de Session**. Só aceita escopo de um registro de retenção injetado em testes para explicar invariantes. **Não representa autenticador, seleção segura de produção nem prova de aprendizagem**.

## Master VIP

`STRUCTURE- KIND OF WORDS.docx` ancora WHY=reason, HOW=manner, os 10 tipos de palavras e exercícios de tempos/modos. A função EXISTENCE (THERE + TO BE, THERE IS/THERE ARE) é registrada em referências separadas e **não concede evidência WHY**.

## Próxima porta H14.7

Detalhar contratos de resposta independente e a UI de escolha explícita de escopo, validar semanticamente distratores trilíngues, desenhar teste de alternância e restauração com duas origens simultâneas, e preparar homologação humana antes de permitir qualquer `assessmentTarget` adicional.

**Integridade:** somente 5 arquivos de documentação/estudo/testes e workflow isolado. Sem mutação de `main`, PR #3, produção Cloudflare, PATITA executável, Worker/D1 remoto, JSON das Experiences, contrato existente ou Master VIP privada.
