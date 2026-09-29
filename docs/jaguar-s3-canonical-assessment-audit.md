# Jaguar — auditoria de entrada da Session S3 (Having a Nice Dinner)

Status: **WAIT de alvo e contrato S3**. Auditoria somente; nenhum novo Attempt, Evidence, Green Pass ou gesto de adoção é concedido por este documento.

## O que o corpus já declara

| Origem | Fato canônico | Alcance atual |
|---|---|---|
| `preparing-dinner.thinkingMind[what]` | `what.use.object-question` e provas de função/resposta em S2 | Session S2 |
| `having-dinner.thinkingMind[what]` | “What are we eating first?” / “¿Qué estamos comiendo primero?” / “O que estamos comendo primeiro?”; `answerGrounding.acceptedVocabularyIds = ["salmon"]` | transferência da Session S2, não prova de S3 |
| `having-dinner.thinkingMind` | WHAT, WHO, HOW, WHY em EN/ES/PT | exploração; nenhum `assessmentTarget` para S3 |
| `having-dinner.toroidalNext` | destino `after-dinner-conversation` | navegação livre existente |
| `after-dinner-conversation.thinkingMind` | WHAT, WHO, WHY, HOW em EN/ES/PT | perguntas sem `answerGrounding` ou prova de transferência S3 fundamentada |

O diretório `data/learning/skills/` contém somente `which.json` e `what.json`. A política Green autoriza essas duas skills quando têm Pass Contract. Não existe hoje uma definição de habilidade-alvo própria de S3.

## Fronteira runtime encontrada

- `VisitedSessionAdoptionAuthority.inspect` aceita apenas a Session `which.use.determiner` e a transferência `determiner-use`. O Green WHAT de S2 em S3 não atravessa esta inspeção.
- `NextAssessmentTarget.prepare` valida exclusivamente `shopping-for-dinner → preparing-dinner`, WHICH → WHAT; não seleciona habilidade para S3.
- `PedagogicalSessionAdoptionSurface` depende dessas duas autoridades. O botão de adoção S3 não pode ser habilitado apenas porque o aluno visitou S3 ou respondeu `salmon`.
- `NextSessionActivation` exige decisão/skill e Pass Contract coerentes e cria Evidence operacional vazio para a nova Session. Seu retorno literal `S2_ACTIVE` e sua verificação especial de WHAT são atuais e precisam de generalização deliberada antes de S3.

## Próxima admissão canônica

1. Escolher a habilidade de S3 a partir da necessidade comunicativa do corpus (WHO, HOW ou WHY são candidatos, não decisão tomada). Declarar `assessmentTarget` explícito, definição de skill e Pass Contract. WHAT de S3 permanece a transferência de S2 até uma escolha pedagógica explícita diferente.
2. Fundamentar duas provas locais em S3 e uma transferência na Experience seguinte em EN/ES/PT. Uma pergunta presente no seed ou uma animação não constitui Evidence; S4 precisa de resposta/alternativas verificáveis antes de um probe avaliado.
3. Criar especificações, Result, EvidenceBridge, AttemptBoundary e painel para a skill escolhida; preservar identidade de Session, ocorrência, apoio e idioma. Só a autoridade canônica fecha Green.
4. Generalizar a inspeção da transferência e a seleção do próximo alvo sem copiar pacotes de S2 nem criar segundo router. Adotar S3 somente após gesto explícito do aluno em S3; NEXT livre continua livre.
5. Testar: Green S2 preservado, visita S3 livre, S3 em 0/3 apenas após adoção, duas provas locais, visita S4, transferência 3/3, EN/ES/PT e recusa de proveniência errada. Homologar a interface depois dos contratos.

Até a primeira decisão e o grounding de S4, a Session S3 fica em **WAIT**, sem contador 0/3 inventado e sem Green presumido.
