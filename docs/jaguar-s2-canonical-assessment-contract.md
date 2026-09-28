# Jaguar — contrato de avaliação da Session S2 (Preparing a Nice Dinner)

Status: **CORPUS FUNDAMENTADO / WAIT de autoridade e avaliação**. As respostas contextuais S2/S3 já estão declaradas e verificadas por teste de integridade; este documento não concede Evidence, Green Pass ou cobertura runtime.

## Autoridades existentes

- O ciclo toroidal do jantar está homologado como navegação/conteúdo: Shopping → Preparing → Having → After-Dinner Conversation → Shopping.
- A pergunta “Which carrots should we cook first?” / “¿Qué zanahorias deberíamos cocinar primero?” / “Quais cenouras devemos cozinhar primeiro?” em `preparing-dinner` é a prova de **transferência da Session S1** (`which.use.determiner`), após NEXT livre. Seu Attempt tem proprietário S1 e não pode ser copiado ou contado como prova de S2.
- Somente o gesto explícito de adoção no destino cria Session S2; o perfil longitudinal mantém S1 confirmada, e S2 começa sem Evidence operacional.
- Hoje a decisão de adoção copia a skill `which.use.determiner` para S2. A pergunta WHAT de S2 não produz provas canônicas. Portanto 0/3 exibido nessa nova Session ainda não oferece três etapas executáveis.

## Habilidade proposta para S2

`what.use.object-question` — usar WHAT / QUÉ / O QUE para perguntar e responder **qual coisa está sendo preparada**, em contexto de cozinha. Fonte: `preparing-dinner.thinkingMind[questionWord=what]` (“What are we preparing first?” / “¿Qué estamos preparando primero?” / “O que estamos preparando primeiro?”) e as perspectivas de S2, que dizem preparar os vegetais primeiro. A habilidade tem identidade própria: não inferir WHAT pela posição inicial do seletor Thinking Mind nem reciclar a definição `which.use.determiner`.

### Contrato candidato (3 evidências independentes)

| Prova | Observação explícita | Corpus e condição de pass | Autoridade necessária |
|---|---|---|---|
| 1. Função da pergunta | Learner distingue WHAT/QUÉ/O QUE (coisa/ação) de WHERE/DÓNDE/ONDE (lugar), respondendo a prompt vinculado à pergunta de S2 | Entrada WHAT e WHERE de S2; escolha correta observada, sem Evidence por simples exibição | Probe, Result, EvidenceBridge e AttemptBoundary ancorados na Session S2 |
| 2. Resposta situada | Learner responde o que preparar primeiro a partir da decisão de S2; pode escolher ou formular resposta em EN/ES/PT | A perspectiva debating de S2 prefere preparar vegetables / verduras / legumes antes de cozinhar salmon / salmón / salmão. `answerGrounding` aceita substantivos do vocabulário S2 marcados como `vegetable` (incluindo tomates, cenouras e vagens), com traduções EN/ES/PT. A palavra coletiva “vegetais” ancora o contexto, mas não é uma opção lexical exigida | Especificação de resposta e avaliação canônica separadas de exibição/áudio/suporte |
| 3. Transferência | Após NEXT livre a Having Dinner, learner responde uma nova pergunta WHAT de S3 | `having-dinner.thinkingMind[what]`: “What are we eating first?” e traduções; `answerGrounding` declara `salmon` como primeiro prato, com contexto em EN/ES/PT; a declaração não constitui prova observada | Attempt modo transfer na Session S2; Green Pass apenas por fechamento canônico das três provas |

As três provas exigem respostas observadas do aluno e proveniência de Session, Experience, skill, ocorrência e apoio; exibir pergunta, abrir S3, acertar a transferência de S1 e usar áudio não contam como prova S2. Respostas apoiadas não satisfazem automaticamente condições de autonomia se o contrato exigir `support: none`. Nota contextual 4/4 e diagnóstico do núcleo são outras medidas, não etapas desse contrato.

## Ordem mínima da próxima costura

1. **CONCLUÍDO NO CORPUS:** ancorar respostas S2 em vegetais canônicos e S3 em `salmon`, com as três línguas; a distinção WHAT versus WHERE ainda precisa de probe avaliado. O teste `scripts/test-dinner-what-answer-grounding.js` verifica os vínculos e protege a transferência WHICH de S1.
2. **DEFINIÇÃO DECLARADA; AUTORIDADE EM WAIT:** `data/learning/skills/what.json` contém o Pass Contract WHAT; a política Green ainda autoriza somente WHICH. A próxima ligação deve selecionar a skill WHAT no destino, validar a definição pela autoridade e instalar probes observados antes de incluí-la na política de Green. Não alterar decisão S1 ou navegação; sem configuração válida, permanecer em WAIT, sem 0/3 de habilidade fictícia.
3. Conectar provas de função e resposta situada à Session S2 após adoção; apresentar feedback de cada observação separado da contagem do contrato. Verificar três idiomas e falhas de proveniência.
4. Habilitar a prova de transferência S2→S3 sem adoção automática de S3; só Evidence canônica fecha Green de S2. Testar S1 Green preservado, S2 iniciada vazia, S2 1/3→2/3→3/3, e navegação por todo o anel independente da avaliação.
5. Somente após esses testes, redesenhar estados visuais da Thinking Mind e da trilha para mostrar qual Session está ativa e distinguir “acertou esta questão”, progresso de habilidade e Green Pass.

## Critério de homologação

A sequência de NEXT pelas quatro Experiences e retorno à origem permanece livre em EN/ES/PT. A resposta `carrots/zanahorias/cenouras` continua fechando somente S1. A adoção cria S2 sem herdar pacotes de S1; as três provas novas têm ocorrências independentes e somente o contrato canônico confirma S2. Com fonte lexical fundamentada, mas sem a autoridade de Session e avaliação de WHAT homologadas, o estado deve permanecer WAIT — jamais Green presumido. Um novo evento `carrots` em S2 só pode ser contado depois da adoção, com identidade de ocorrência distinta do evento de transferência de S1.
