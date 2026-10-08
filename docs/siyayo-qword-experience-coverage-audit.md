# Jaguar — cobertura de QWords nas Experiences
Data: 2026-10-02 (America/Sao_Paulo).
Branch: jaguar/verb-explorer-resume-live-wire.
Base auditada: 3f97d8bd13a696847b803fe83a2a3fcaf3b72337.
Checkpoint: JAGUAR-LIVE-19 — ESTUDO FINO; somente documentação.

## Escopo e evidência
Leitura do SIYAYO Canonical Development Map, Corpus ↔ Experience Capability Matrix, Work Map, experience-seeds, question-word-capabilities, três definições de skill, renderizadores de exploração/diagnóstico/prática, seleção de Session e avaliador de contratos. Escopo operacional: quatro Experiences carregadas pelo Verb Explorer, não todos os materiais de Chapters/MASTER ou outros branches. Homologação do Nick compacto foi informada pelo usuário; não inferida de screenshots indisponíveis.

Há 21 entradas de Thinking Mind nas quatro Experiences. Todas possuem question e questionWordLabel em EN/ES/PT: 63 combinações com esses dois campos presentes. Presença textual não significa qualidade linguística já homologada, prova avaliativa ou Green Pass.

## Mapa das 14 QWords
S1 Shopping; S2 Preparing; S3 Having; S4 After Dinner.
Ausente significa não declarada neste corpus; a inclusão em uma Experience depende de pertinência comunicativa, não preenchimento automático de todos os espaços.

| QWord | S1 | S2 | S3 | S4 | Contrato operacional de início |
|---|---|---|---|---|---|
| WHAT | presente | presente | presente | presente | S1 e S2 |
| WHERE | presente | presente | ausente | ausente | nenhum |
| WHEN | ausente | presente | ausente | ausente | nenhum |
| WHO | presente | presente | presente | presente | nenhum |
| WHICH | presente | presente | ausente | ausente | S1 |
| WHY | presente | presente | presente | presente | S3 |
| HOW | ausente | presente | presente | presente | nenhum |
| HOW MUCH | presente | ausente | ausente | ausente | nenhum |
| HOW MANY | ausente | ausente | ausente | ausente | nenhum |
| WHOSE | ausente | ausente | ausente | ausente | nenhum |
| WHOM | ausente | ausente | ausente | ausente | nenhum |
| HOW LONG | ausente | ausente | ausente | ausente | nenhum |
| HOW FAR | ausente | ausente | ausente | ausente | nenhum |
| HOW OFTEN | ausente | ausente | ausente | ausente | nenhum |

O mapa de capabilities declara as 14 e HOW OLD como extensão prática. Isso não cria corpus de Experience nem Pass Contract. WHAT e WHY têm nomes de skill distintos entre o mapa genérico de capacidades e seus contratos específicos: identify.information-gap vs use.object-question; identify.reason vs use.contextual-reason. Não migrar nem substituir por inferência; mapear explicitamente a relação de escopo.

## Dependency Focus e pergunta observável
| Contexto | Focus EN/ES/PT | Diagnóstico observável |
|---|---|---|
| S1 WHAT | estruturas shopping-what declaradas/carregadas | vínculo de What com cook; alternativas próprias por idioma |
| S1 WHICH | fixture preservado All these three books, com estruturas próprias ES/PT | núcleo de three → books; fora do 0/3 |
| S2 WHAT | estruturas preparing-what declaradas/carregadas | não declarado |
| S2 WHICH | estruturas preparing-which declaradas/carregadas | não declarado |
| Demais 17 entradas presentes | não declarado | não declarado |

O renderer escolhe o Focus da QWord atual; somente WHICH pode consumir o fixture de Experience. Não reaproveitar a pergunta de books para WHAT/WHERE/WHY. Focus ausente é lacuna de conteúdo/integração neste estudo, não prova de que o módulo é desnecessário.

## Diálogo exploratório e Tense/Mode
Quatro pares possuem dialogueForms completo: S1 WHAT, WHERE, WHY; S2 WHICH. Verificação de campos: Present/Past/Future × Affirmative/Negative/Interrogative × EN/ES/PT, question e response presentes.
Isso é cobertura declarada, não nova homologação visual/áudio das 108 combinações.

S1 WHICH usa choiceContext: QUESTION → CANONICAL CHOICE → REVIEW, candidatos e feedback separados. A pausa de Tense/Mode neste contexto é deliberada, não uma lacuna a eliminar automaticamente.
S2 e S3 WHAT usam answerGrounding contextual. WHAT inclui ligação ao painel de prática quando ele está disponível.
As demais 14 entradas caem no ramo genérico QUESTION → CORPUS RESPONSE do verbo de entrada → FOLLOW-UP. O fallback é operacional, mas não comprova uma resposta semanticamente adequada à pergunta. Prioridade: S2 WHERE e WHY; S3/S4 WHY já possuem reasonGrounding para provas, porém o diálogo exploratório não o consome.
Exemplo: WHY pode apresentar uma prova contextual correta e, simultaneamente, LINES genérico. São duas superfícies a integrar, sem duplicar avaliador.

## Percursos avaliativos existentes
| Início | Provas locais | Transferência |
|---|---|---|
| S1 WHICH | choice-function + determiner-use | S2 determiner-use |
| S1 WHAT | question-function + object-answer | S2 object-answer |
| S2 WHAT | question-function + object-answer | S3 object-answer |
| S3 WHY | question-function + reason-answer | S4 reason-answer |

Resolvers canônicos executados nesta auditoria para EN, ES e PT:
WHICH S1/S2, WHAT S1/S2, WHAT S2/S3, WHY S3/S4 retornaram especificações válidas.
Esse teste verifica produção de especificações, não a execução de todos os eventos do navegador.

A nota contextual 4/4 de WHICH descreve os critérios do candidato naquele contexto. Não equivale a quatro provas do Green Pass. Pergunta observável, nota contextual, Evidence e projeção de conquista são camadas diferentes.
WHAT tem respostas canônicas contextualizadas, mas não possui automaticamente o mesmo rubric 4/4 de WHICH. Não copiar uma pontuação de adequação do queijo para outra intenção comunicativa.

## Pontos abertos antes de ampliar contratos
1. Prova local vs transferência — CONFIRMADO no avaliador isolado:
   os três passContracts exigem uso/reposta sem mode e outra exigência com mode transfer.
   evaluateContract usa some para cada requirement; um mesmo pacote transfer pode cumprir as duas.
   Reproduzido: requirement funcional pass + pacote transfer pass/support none satisfazem os três requirements nos três contratos.
   Isso não demonstra emissão indevida pela interface, e não alteramos contratos. Homologar se uso local deve ser explicitamente mode local antes de espelhar o modelo para WHERE.
2. Idioma — NÃO homologado isolamento completo:
   especificações e eventos incluem language; retained Session usa learnerId|skill, sem language.
   Skills compartilhadas têm realizations; doesNotClaim exclui cross-language-equivalence.
   Definir explicitamente qual progresso é compartilhado e qual é por idioma, antes de anunciar Green Pass independente por língua.
3. Prática anônima — o diagnóstico estrutural de S1 admite prática anônima; os montadores WHAT/WHY/WHICH avaliativos exigem Session adotada. Essa diferença precisa de uma matriz própria por superfície. Não transformar resposta anônima em Evidence retroativa sem contrato.
4. Exibição — WHICH e WHY montam prática antes da experience-grid; WHAT dentro de LINES. WHY ainda não foi integrado ao modelo visual de WHICH/WHAT.
5. Comentários antigos — os sources WHAT/WHY ainda descrevem S2/S3 embora WHAT já resolva início S1. Código e corpus atuais prevalecem.
6. Xespirito — DNA VERBS e seu diagnóstico funcional preservados; esta auditoria não mudou seus contratos ou o motor temporal/modal.

## Próximo elo proposto para homologação
Primeiro decidir a distinção local/transferência e a unidade de progresso por idioma; não implementar alteração contratual antes dessa decisão.
Depois completar o diálogo exploratório S2 WHERE com pergunta e resposta contextual canônicas EN/ES/PT, usando S1 WHERE como referência. Definir o Dependency Focus próprio e a pergunta observável antes de introduzir seu Pass Contract.
Fechar as lacunas estruturais das QWords já avaliáveis: S2 WHAT/WHICH diagnóstico e S3/S4 WHY Focus/diagnóstico/diálogo.
Ampliar uma QWord por vez, registrando extensão/migração/substituição, corpus por idioma, WAIT, testes e homologação visual.
