# JAGUAR H14.4 — WHY independente por Experience · Diagnóstico e portões

## Evidência canônica e proteção

Este checkpoint nasce de H14.3 GREEN. O runtime WHY atual continua **S3 Having → S4 After-Dinner**, com três requisitos de contrato: `question-function`, `reason-answer(local)`, `reason-answer(transfer)`. Nenhum ponto, sessão, PATITA, `experience-seeds.json` ou arquivo `data/learning/skills/why.json` é modificado por este ELO.

A Visão de Águia distingue cinco fatos: QW existe; pergunta tem referente contextual; resposta causal é realmente adequada; destino proporciona uma transferência distinta; contrato possui autoridade. Navegação livre é independente desses fatos; nenhuma visita ou áudio concede evidência.

## Diagnóstico computável do gargalo

O arquivo `js/adaptive-why-contextual-reason-probe-specification-source.js` exige **HOW como QW na origem** para o contraste `why` × `how`, além de `reasonGrounding` nas duas cenas; rejeita destino com `assessmentTarget` próprio e exige `toroidalNext.nextExperience` imediato. A UI `js/verb-explorer-why-assessment-live.js` segue a mesma exigência de transferência adjacente. Isso é um acoplamento **da implementação atual**, não uma norma pedagógica geral.

| Circuito | Motivos observados de bloqueio do resolver legado | Decisão |
|--|--|--|
| S1 WHY → S2 WHY | Origem sem `assessmentTarget`; S1 sem HOW authored QW; falta `reasonGrounding` em S1 e S2 | **CANDIDATO** (não ativar) |
| S2 WHY → S3 WHY | Origem sem `assessmentTarget`; S2 sem `reasonGrounding`; S3 já é origem independente de WHY | **CANDIDATO** (não ativar) |
| S3 WHY → S4 WHY | Contrato atual com contextos e meios autorizados | **MANTER** |

É incorreto resolver a rigidez apenas adicionando `assessmentTarget` a S1/S2. O teste H14.4 prova que essa mudança isolada continua falhando no resolver. Também não se deve adicionar artificialmente uma QW HOW a S1 só para satisfazer requisito de código. A distinção WHY/HOW pode ser um *contraste de função interrogativa* desacoplado de uma navegação prévia pela QW HOW, desde que o contrato pedagógico o defina e homologue.

## Coerência causal, não equivalência lexical

- **S1:** "Why do you prefer the fresh cheese?" → justificativa de harmonização com salmão. "This one" exige referente acessível na cena, mas **não** um Green Pass prévio de WHICH.
- **S2:** "Why are we preparing this dinner together?" → justificativa de cooperação/experiência compartilhada. Necessita resposta causal com identidade contextual e modo apropriado.
- **S3:** "Why is this dinner special?" → "Because we prepared it together." A justificativa de S2 e a de S3 têm forte sobreposição semântica. **S2→S3 ainda não pode ser promovida como transferência independente** apenas por troca de Experience ou ID da resposta.
- **S4:** razão de apreciar a conversa depois do jantar, transferência homologada pelo contrato original S3→S4.

`dialogueForms.*.interrogative.response` em S1 é pergunta de confirmação gramatical, não prova de resposta causal. PAST/FUTURE e PERIOD precisam corresponder às circunstâncias. Avaliação contextual 0/4 (adequação de escolha) é diferente do progresso canônico 0/3→3/3 (requisitos de prova). Nenhum desses contadores avança apenas com observação PATITA.

## Desenho exigido para futuro contrato v2 (não aplicado)

1. **Entry independente:** seleção expressa da QW em qualquer Experience com oportunidade homologada; sem pré-requisito de passar por WHICH ou HOW. Se já houver outra Session, preservar primeiro seu snapshot; nunca descartar dados anteriores.
2. **Source-led spec:** pergunta × situação × referent × causa × contraste × EN/ES/PT × TENSE/MODE/PERIOD. Um contraste WHY/HOW pode ser pedagógico, mas não obriga QW HOW no menu da Experience.
3. **Local evidence:** apenas uma tentativa observada do aluno, avaliada contra resposta causal própria da cena e pelo contrato ativo; áudio, LINES, DF/DHP e PATITA permanecem sem autoridade.
4. **Transfer independente:** cenário realmente novo, modo `transfer` autorizado pelo contrato de origem, origem/idioma/identidade vinculados, prova distinta; não depender de NEXT nem usar a QW da Experience de chegada como novo contrato por inferência.
5. **Ambiguidade S3:** quando uma Experience é entrada de um contrato e transferência candidata de outro, preservar duas identidades distintas de escopo; exigir escolha explícita do aluno e despacho sem atribuição dupla.
6. **State:** `AdaptiveAssessmentScope` usa `learnerId × skill × language × originExperienceId`; não sobrescrever o circuito S3 com S1/S2 nem mover evidências de outro idioma/NICK.
7. **Supervisão:** regressões contrafactuais (somente `assessmentTarget` não deve liberar avaliação), WHY S3→S4 real, alternância QW/idioma, checkpoint PATITA, autoria Master VIP e testes visuais EN/ES/PT.

O helper `scripts/jaguar-h14-4-why-readiness.js` é um **diagnosticador puro de bloqueios de código/JSON**, não um motor de aprovação semântica. H14.4 determina os motivos de NÃO autorizar e preserva a possibilidade de estudos por slot. H14.5 deve decidir uma transferência semanticamente distinta e especificar contrato aprovado antes de alterar o runtime.

## Master VIP

`STRUCTURE- KIND OF WORDS.docx`: método The Ten Kinds of Words, Question Words, modos e tempos. A função EXISTENCE `THERE + TO BE`, incluindo `THERE IS/ARE`, pertence à referência independente `data/learning/references/master-vip-existence-v0.1.json`. Não confundir existência com WHY ou criar QW avaliativa por essa razão.

## Governança

Arquivos criados: referência JSON, diagnosticador puro, teste regressivo e este relatório, mais workflow de CI. **Somente branch isolada**; nenhuma alteração a Explorer executável, PATITA, Skill/Pass Contract, MAIN, PR #3, produção Cloudflare, Worker/D1 ou arquivo original privado da Master VIP.
