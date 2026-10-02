# Jaguar — Thinking Mind, Xespirito e fronteiras comparativas
Data: 2026-10-02 (America/Sao_Paulo)
Base: 88b35ceca2a58a367881bad6caf0366e12e9b4e6
Checkpoint JAGUAR-LIVE-20 — ESTUDO FINO, documentação somente.

## Pergunta da auditoria
As capacidades existentes já verificam a adequação semântica dos diálogos de Thinking Mind? O que deve ser preservado antes de distinguir avaliação por idioma e prova local/transferência?

## Autoridades encontradas
| Componente | Capacidade demonstrada | Limite atual |
|---|---|---|
| ThinkingMindInformationGapResolver | cruza intention + QWord da Experience com capabilities; retorna foco canônico, opportunityOnly e evidenceProduced false | não recebe/parsa uma resposta do aluno; não valida adequação contextual; skill de capability não substitui assessmentTarget |
| ThinkingMindRuntimeDecision | inspect/choose preservam escolha manual; autoSelection false | não escolhe automaticamente, não cria Evidence ou Green Pass |
| ThinkingMindAssessmentSelection | aceita apenas assessmentTarget com skill e definitionPath explícitos; preserva WAIT quando ausente | retained usa aluno|skill; língua não integra a chave; retorno antecipado de skill igual também não diferencia idioma |
| XespiritoDiagnostics + Verb Grid | conflitos canônicos e padrões compostos de auxiliares/modais; sugere reparo funcional | núcleo diagnóstico atual é de construções inglesas; explicações EN/ES/PT não equivalem a três gramáticas diagnósticas |
| XespiritoExplorerBridge | painel no DNA VERBS, diagnóstico e repairTrace; aplicação de reparo seguida de novo diagnóstico | ausência de conflito reconhecido vira clear no rastro; não certifica gramática completa, intenção ou coerência de resposta |
| MultilingualInterference | formas/meaning declarados por idioma, família esquisito/exquisito/weird; identifica uso local, outro idioma ou hipótese híbrida | catálogo piloto de uma família; comparação de token, não compreensão universal de frase; distances não provam significado |
| XespiritoInterferenceBridge + EvidenceGate | observação de transferência/hipótese; padrão repetido exige revisão, conflict false | não confirma incorreção ou reforço só por semelhança; não gera Green Pass QWord |
| InterferenceContrastVerifier | diferencia meaningCorrect/formCorrect e selectedLanguage/expectedLanguage com padrão repetido | consome vereditos já fornecidos por prova externa; não calcula semanticamente esses booleanos |
| ContextualChoiceResolver | pontua traits declarados dos candidatos WHICH e presença de respostas EN/ES/PT | valid canonical candidate significa candidato cadastrado completo, não análise gramatical aberta; 4/4 vale apenas para o rubric contextual declarado |
| Probe sources + boundaries + Cycle | avaliação dos pilotos WHAT/WHICH/WHY com alternativas e grounding declarados | não torna adequado o fallback genérico de LINES em outras QWords |

## Casos executados
Quatro suites passaram no código desta base:
- Thinking Mind information-gap resolver.
- Thinking Mind runtime decision.
- Xespirito: 9 conflitos canônicos e 11 compostos.
- Xespirito PortuSpanGlish.

Experimento isolado:
Where do you can go? → functional-conflict.
Where should we put the vegetables? → no-canonical-diagnostic.
I cook dinner every evening. → no-canonical-diagnostic.
¿Dónde debemos poner las verduras? → no-canonical-diagnostic.
Onde devemos colocar os legumes? → no-canonical-diagnostic.
O repairTrace do bridge registra a frase genérica como clear. Nenhum desses retornos comprova que a frase responde à pergunta WHERE: diagnose recebe sentence e grid, não pergunta/Experience/idioma/answerGrounding.

Outra demonstração: duas observações de exquisito em contexto PT produzem pattern-observed, requiresReview true, conflict false e requiresReinforcement false. É proteção legítima contra transformar mistura linguística em erro por inferência.

## Carregamento e conexão
verb-explorer.html carrega XespiritoDiagnostics/ExplorerBridge e Thinking Mind resolver/runtime; seu bootstrap carrega a seleção avaliativa.
Não foram encontrados imports de MultilingualInterference, XespiritoInterferenceBridge/Gate ou XespiritoEvidenceInterpreter nos manifestos inspecionados verb-explorer.html, verb-explorer-adaptive-bootstrap.js e adaptive-browser-runtime.js. Existência da biblioteca e testes não demonstra cabo completo no Explorer atual. Outras páginas/branches não foram auditadas aqui.
verb-explorer-xespirito-evidence-bridge existe e interpreta repairTrace quando as dependências estão presentes; não cria Profile/Session/Attempt/Context.
XespiritoGreenPassBridge aplica sinais de conflito ao perfil legado via recordAttempt; não é a autoridade do Pass Contract QWord e não deve ser usada como atalho de aprovação de resposta.

## Lacunas localizadas, sem correção neste GO
1. LINES fallback não passa por verificador de adequação pergunta-resposta. Thinking Mind e diagnóstico funcional não fecham essa lacuna.
2. Xespirito pode dizer FUNCTIONAL PATH CLEAR para texto fora do catálogo: interpretar como nenhum conflito reconhecido, nunca como aprovação acadêmica completa. Homologar eventual clareza do rótulo e status num elo separado.
3. repairTrace do Explorer é estado do bridge, sem learnerId/idioma por registro; identidade/provider não foi auditado como limpando esse trace. Definir ownership antes de aproveitar tal rastro numa avaliação personalizada.
4. Capabilities WHAT identify.information-gap e WHY identify.reason vs pilotos use.object-question/use.contextual-reason têm escopos diferentes. Criar relação explícita de escopo; não renomear ou fundir automaticamente.
5. Independência de idiomas e de provas local/transferência seguem abertas no LIVE-19.

## Especificação candidata para homologação, ainda não código
### Prova local e transferência
- Requirement de uso local deve declarar mode local.
- Requirement de transferência mantém mode transfer.
- Pacote funcional + pacote transfer não fecha o requisito local.
- Local correto, função correta e transferência correta fecham o contrato.
- A autoridade de origem, skill, evento explícito, Experience e suporte continuam necessários.
- Transferência entre Experiences no mesmo idioma não é transferência entre idiomas. Um contraste entre línguas terá contrato distinto se for adotado.

### Identidade da avaliação por idioma
Separar dois estados: idioma de exploração/comparação e idioma da avaliação adotada.
Trocar o botão LANGUAGE continua livre e não inicia outra Session, não transporta Evidence nem apaga conquista.
Cada avaliação confirmada deve correlacionar learnerId, skill, idioma e origem/versão contratual conforme o contrato a homologar; a separação não pode ser feita só na chave de retained.
O evento/Attempt precisa coincidir com o idioma da avaliação para produzir Evidence dela. Eventos em outro idioma podem permanecer prática/rastro, até adoção explícita da avaliação correspondente.
Histórico comparativo reúne resultados, mas não presume equivalência nem transfere Green Pass entre idiomas.
Impacto a auditar antes de implementar: composer, Session/context, retained, profile observations, packets, Cycle evaluator, closure dedupe, trail/mastery projection, adoption, learner switch.

### Adequação dos diálogos
Um turno canônico deve vir do corpus aprovado para QWord + Experience + idioma + intenção + Tense/Mode quando aplicável.
Cada idioma tem texto/estrutura próprios; tradução automática não é autoridade.
Ausência de resposta específica é lacuna explícita. Não preencher com frase do verbo nem com reparo gramatical.
Xespirito contribui diagnóstico funcional dentro de seu escopo. Comparação de false friends contribui hipótese/contraste. Prova QWord recebe grounding aprovado e passa pelo Cycle atual.
Não criar segundo router, avaliador genérico imaginário ou nova autoridade de Green Pass.

## Ordem sugerida
1. Homologar mode local/transfer como menor ajuste contratual; testes positivos e negativos.
2. Homologar avaliação por idioma separada da LANGUAGE exploratória; mapa completo de impactos antes de código.
3. S2 WHERE: estabelecer corpus contextual EN/ES/PT e Dependency Focus próprio; perguntas corretas já existentes não garantem respostas próprias.
4. Fechar lacunas WHAT/WHICH/WHY e ampliar demais QWords conforme pertinência de cada Experience.
Sem JS/CSS/HTML/JSON alterados nesta passagem.
