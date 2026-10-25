# JAGUAR H14.41 — Dimensão, intenção e ciclo de tentativa

Status: **especificado, sem autorização avaliativa**. Base: H14.40, commit `f8f2cbf958b807f84cf2e2371b0b2ef4dd8eb768`.

## Decisão de reaproveitamento

Usar a tabela e a chave `(learner_subject,event_id)` do V30.3.85C. A proposta transporta a vinculação versionada dentro de `payload_json`, por um futuro adaptador de servidor. Nenhuma coluna, tabela, migração ou adaptador é criado neste ELO. O contrato 85C aceita JSON canônico, mas não valida sozinho dimensão, intenção ou autoridade: essa verificação continua sendo responsabilidade futura do servidor.

Registros antigos continuam legíveis. Ausência de vinculação significa `legacy_unbound`, classificação de leitura, sem alterar o status persistido nem inferir autorização retroativa. Uma exploração antiga não se converte em tentativa avaliativa: uma nova ação autorizada exige novo UUID.

## Dimensão e intenção

| Campo | Valores | Responsabilidade |
| --- | --- | --- |
| Dimensão | question-function; reason-answer(local); reason-answer(transfer) | Um evento corresponde a uma dimensão exata |
| Intenção | start; resume; transfer | Pedido explícito, validado contra alvo autorizado |
| Origem | Experience do contrato | Imutável durante aquele ciclo |
| Experience atual | Cena da ação | Deve coincidir com a tarefa e a dimensão autorizadas |
| Identidade | Sujeito verificado no servidor | NICK não autentica nem concede propriedade |

S2 local com origem S2 e S2 transferência com origem S1 permanecem escopos diferentes. Transferência pode ser tentada antes da prova local, sem fechar o contrato incompleto. Visitar uma Experience, clicar NEXT ou trocar idioma/QW não inicia, reinicia ou transfere um contrato. Nenhuma avaliação prévia de WHICH/HOW é exigida.

A vinculação inclui contrato ID/versão, alvo avaliativo, idioma, QW, origem, cena atual, dimensão, intenção, referência da ação direta e proveniência da exposição ao modelo. Esses dados devem ser resolvidos e validados no servidor; um JSON ou hash enviado pelo navegador não comprova autoridade, independência ou significado. PATITA pode observar; sua observação não substitui a ação do aprendiz nem a decisão do avaliador.

## Armazenamento e avaliação

85C mantém somente `observed_exploratory` ou `pending`. O recibo `created/duplicate` confirma armazenamento, sem nota, crédito ou aprovação. Os estados abaixo pertencem ao desenho de um futuro avaliador separado, não a novas situações da tabela 85C:

`pending → awaiting_authority → eligible_for_evaluator → decision_accepted ou decision_rejected`

Uma decisão aceita somente poderá chegar a `evidence_committed` com transação atômica decisão + Evidence/outbox e chave idempotente por sujeito/evento/dimensão/alvo. Isso é requisito de integração, ainda não implementado nem comprovado. Alvo revogado, proveniência desconhecida, escopo divergente ou ausência de autenticação bloqueiam elegibilidade. Elegibilidade também não significa aprovação semântica.

Retry preserva UUID e envelope originais; alteração de dimensão, idioma, intenção, cena, origem ou resposta com o mesmo UUID resulta em conflito. Nova submissão recebe novo UUID. Navegação posterior não reescreve uma tentativa. Rollback futuro desabilita o adaptador e preserva registros e leitores anteriores.

## Verificação e lacunas

O teste deste ELO verifica o modelo de estados, caminhos proibidos, pré-condições de Evidence e alinhamento com H14.6/H14.40. Regressões herdadas verificam 85C, SQLite e WHY S3→S4. Esses testes não provam autenticação de produção, concorrência distribuída D1 ou avaliação de texto livre.

DG-01 ganha especificação, permanecendo aberta para implementação e autoridade. DG-03 recebe fronteira de ciclo, permanecendo aberta para atomicidade real. As sete lacunas continuam abertas como portões de integração. H14.42 exercitará falhas e recuperação; H14.43 reunirá manifesto e GO/NO-GO.

Preservados: main, PR #3, Explorer, PATITA, Learning Trail, FUNC-13 oculto, WHY S3→S4 e produção. Nenhum alvo foi autorizado, nenhuma Evidence ou Green Pass emitido.
