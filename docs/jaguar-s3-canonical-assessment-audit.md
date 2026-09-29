# Jaguar — auditoria de entrada da Session S3 (Having a Nice Dinner)

Status: **alvo e grounding de corpus declarados; WAIT de avaliação observada e adoção S3**. Nenhum novo Attempt, Evidence, Green Pass ou gesto de adoção é concedido por este documento.

## O que o corpus já declara

| Origem | Fato canônico | Alcance atual |
|---|---|---|
| `preparing-dinner.thinkingMind[what]` | `what.use.object-question` e provas de função/resposta em S2 | Session S2 |
| `having-dinner.thinkingMind[what]` | “What are we eating first?” / “¿Qué estamos comiendo primero?” / “O que estamos comendo primeiro?”; `answerGrounding.acceptedVocabularyIds = ["salmon"]` | transferência da Session S2, não prova de S3 |
| `having-dinner.thinkingMind[why]` | `why.use.contextual-reason` com motivo `prepared-together` em EN/ES/PT | alvo declarado de S3; avaliação observada em WAIT |
| `having-dinner.toroidalNext` | destino `after-dinner-conversation` | navegação livre existente |
| `after-dinner-conversation.thinkingMind[why]` | motivo `talking-together` em EN/ES/PT | grounding de transferência S3 declarado; probe em WAIT |

O diretório `data/learning/skills/` contém `which.json`, `what.json` e `why.json`. A política Green autoriza somente WHICH e WHAT; WHY permanece declarada no corpus, sem autoridade Green operacional.

## Fronteira runtime encontrada

- `VisitedSessionAdoptionAuthority.inspect` aceita apenas a Session `which.use.determiner` e a transferência `determiner-use`. O Green WHAT de S2 em S3 não atravessa esta inspeção.
- `NextAssessmentTarget.prepare` valida exclusivamente `shopping-for-dinner → preparing-dinner`, WHICH → WHAT; não seleciona habilidade para S3.
- `PedagogicalSessionAdoptionSurface` depende dessas duas autoridades. O botão de adoção S3 não pode ser habilitado apenas porque o aluno visitou S3 ou respondeu `salmon`.
- `NextSessionActivation` exige decisão/skill e Pass Contract coerentes e cria Evidence operacional vazio para a nova Session. Seu retorno literal `S2_ACTIVE` e sua verificação especial de WHAT são atuais e precisam de generalização deliberada antes de S3.

## Próxima admissão canônica

1. **Concluído no corpus:** WHY foi escolhida com `assessmentTarget`, skill e Pass Contract explícitos. WHAT/salmão em S3 permanece a transferência de S2.
2. **Grounding declarado; observação em WAIT:** S3 e S4 têm alternativas e motivos verificáveis em EN/ES/PT. Uma pergunta presente no seed, uma resposta declarada ou uma animação não constituem Evidence; ainda falta probe avaliado.
3. **Especificações concluídas:** `AdaptiveWhyContextualReasonProbeSpecificationSource` resolve função, resposta local e transferência, apenas para S3→S4, em EN/ES/PT. Criar Result, EvidenceBridge, AttemptBoundary e painel para WHY; preservar identidade de Session, ocorrência, apoio e idioma. Só a autoridade canônica fecha Green.
4. Generalizar a inspeção da transferência e a seleção do próximo alvo sem copiar pacotes de S2 nem criar segundo router. Adotar S3 somente após gesto explícito do aluno em S3; NEXT livre continua livre.
5. Testar: Green S2 preservado, visita S3 livre, S3 em 0/3 apenas após adoção, duas provas locais, visita S4, transferência 3/3, EN/ES/PT e recusa de proveniência errada. Homologar a interface depois dos contratos.

Até existir observação avaliada, autorização de adoção e política Green para WHY, a Session S3 fica em **WAIT**, sem contador 0/3 inventado e sem Green presumido.

## Decisão de corpus posterior à auditoria

A habilidade escolhida para S3 é `why.use.contextual-reason`. `having-dinner.thinkingMind[why].assessmentTarget` aponta para `data/learning/skills/why.json`. O Pass Contract declara função da pergunta, razão situada sem apoio e razão em transferência sem apoio. Em S3, `reasonGrounding` aceita `prepared-together`, ancorado na situação do jantar preparado juntos; em S4, aceita `talking-together`, ancorado na conversa juntos. Alternativas `shopping-now` servem como contraste incompatível com o contexto atual. As realizações EN/ES/PT e o teste `scripts/test-s3-why-corpus-contract.js` protegem essa identidade. A pergunta WHAT/salmão em S3 permanece apenas transferência da Session S2.

**WAIT permanece:** o probe é somente especificação read-only. Não existem ainda Result, EvidenceBridge, AttemptBoundary, painel live, autorização de adoção S2→S3 nem inclusão de WHY na política Green. O `assessmentTarget` é declaração de destino e não inicia Session ou prova por si só.
