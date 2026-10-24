# JAGUAR H14.3 — WHY S1 · Estudo fino de elegibilidade contextual

**Checkpoint anterior:** H14.2 GREEN, 21 slots. **Esta etapa:** um único slot, `shopping-for-dinner × why`. **Status:** referência somente, nenhum contrato ou componente executável foi modificado.

## Evidência de autoria, não de crédito

No corpus `data/learning/experience-seeds.json`, S1 WHY dispõe de um diálogo EN/ES/PT para PRESENT/PAST/FUTURE × AFFIRMATIVE/NEGATIVE/INTERROGATIVE (nove combinações), apresentação contextual com duas alternativas, `dependencyFocus` e `dependencyHeadProbe`. Não tem `assessmentTarget`. O mapa H14.2 permanece como inventário de fonte, não permissão para avaliar.

A pergunta ampla "Why do you prefer this one?" depende da interpretação de `this one`; o `presentationGrounding.questionOverride` estabelece queijo fresco na cena. **O aprendiz não precisa completar WHICH para entender ou explorar WHY**. A referência ao queijo deve ser resolvida pelo próprio contexto, não por um pré-requisito artificial de navegação.

As respostas `dialogueForms.*.interrogative.response` são **perguntas de confirmação**, não respostas explicativas diretas. São exercícios válidos de transformação de modo; não podem contar como `reason-answer`. As variantes PAST/FUTURE existentes são material didático; sua adequação temporal depende da situação e do PERIOD antes de qualquer tentativa avaliativa.

O distrator "shopping-finished" pode ser linguisticamente bem formado, mas não justifica **preferir o queijo fresco**. Separar (1) forma linguística, (2) pertinência semântica, (3) evidência contratual e (4) indicação de adequação 0/4; este último indicador não é Green Pass 0/3→3/3.

## Comparação necessária, sem abrir outro slot

S2 WHY tem `presentationGrounding` de `sharing-preparation`, com contraste `still-shopping`, mas não possui a mesma matriz `dialogueForms` nem declaração de avaliação. **Não inferir S2 como transferência S1**. O contrato atual de WHY, `why.use.contextual-reason`, exige question-function, reason-answer local e reason-answer transfer; sua origem/transferência autorizadas permanecem S3 Having → S4 After-Dinner.

## Regra de Visão de Águia

Oportunidade contextual pode surgir em qualquer Experience; reconhecer evidência requer contrato específico, situação consistente, identidade/idioma/escopo preservados e tentativa efetiva do aluno. A ordem de visitas ou a troca de QW jamais gera crédito. PATITA observa; o motor contratual avalia; HOW TO SHOW apresenta registros fiéis à avaliação.

**Portão para futura adoção S1 WHY:** (a) fixar referente trilíngue sem obrigar WHICH; (b) distinguir resposta causal de transformação interrogativa; (c) revisar PRESENT/PAST/FUTURE/PERIOD × modo; (d) validar contraste/distratores; (e) propor contrato independente com transferência semanticamente distinta; (f) inspecionar EN/ES/PT + runtime; (g) obter homologação humana antes de ativar avaliação.

## Master VIP — fonte primária preservada

`STRUCTURE- KIND OF WORDS.docx` fundamenta The Ten Kinds of Words. A função EXISTENCE (**THERE + TO BE**, incluindo THERE IS/ARE, WAS/WERE, WILL BE, HAS/HAVE BEEN e HAD BEEN) pertence a estudo funcional distinto, páginas de referência 100–104. Os índices `master-vip-existence-v0.1.json` e `master-vip-existence-experience-candidates-v0.1.json` já preservam tal linhagem. EXISTENCE **não é nova Question Word** nem resposta automática a WHY; seus exemplos S1–S4 são `PENDING_HOMOLOGATION` e precisam de revisão contextual própria.

## Limites e integridade

Esta rodada acrescenta só documentação, mapa de estudo e teste de invariantes de fonte. Não altera `experience-seeds.json`, skill WHY, avaliação, PATITA, LINES, progressão, evidência, Green Pass, PR #3, main, produção Cloudflare nem Worker/D1 remoto. O original privado da Master VIP não é publicado.
