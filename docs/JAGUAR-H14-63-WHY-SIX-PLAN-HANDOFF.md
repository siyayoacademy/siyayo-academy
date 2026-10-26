# 🔔🐆 JAGUAR H14.63 — WHY · Seis planos de estudo independente EN/ES/PT

**Status `DRAFT_FOR_HUMAN_HOMOLOGATION_NO_EVIDENCE_AUTHORITY`.** Base H14.62 GREEN (commit `689b9c6da80f32c32a9067fd53ec2f29a931eb71`), sem alteração no Explorer real.

## Entrega efetiva

Um **handoff de seis planos** (duas origens × EN/ES/PT) com 18 exigências, consolidado diretamente dos projetores H14.26, H14.37, H14.38. Não duplicar modelos de resposta, não redigir supostos resultados de alunos e não afirmar homologação humana. Um JSON processável preserva as relações; um projetor JS read-only expõe apenas prompts de estudo, instrução autoral provisória e critérios de revisão, não modelos do professor.

| Circuito | Origem | Outra Experience | Critério causal |
|---|---|---|---|
| WHY-S1-S2-DRAFT | Shopping (queijo fresco) | Preparing (preparação coletiva) | Preferência do ingrediente → compartilhar a preparação |
| WHY-S2-S1-DRAFT | Preparing (preparação coletiva) | Shopping (queijo fresco) | Preparação coletiva → preferência do ingrediente |

Em cada idioma, dimensões separadas:
1. **`question-function`**: reconhecer WHY/por qué/por que como solicitação de **razão**, distinta de HOW/maneira. A instrução H14.27 existe, mas falta **enunciado avaliativo independente, homologado**, diferente do Dependency Head Probe.
2. **`reason-answer(local)`**: perguntar o motivo causal da Experience de origem, exigir resposta própria livre e sem gabarito previamente apresentado. Aceitar paráfrase semanticamente válida somente após homologação do critério.
3. **`reason-answer(transfer)`**: realizar outra tarefa causal na Experience alternativa, mantendo **a mesma origem do escopo**. A criança/aprendiz pode visitar experiências em qualquer ordem; visitar S2 não torna automaticamente sua ação transferência de S1.

## Proveniência e segurança

**S1:** `Why do you prefer the fresh cheese?`; referência reservada ao professor sobre queijo fresco e salmão. **S2:** `Why are we preparing this dinner together?`; referência sobre preparar juntos e compartilhar a experiência. Equivalentes em espanhol e português são derivados do JSON autorado e ainda sujeitos à avaliação humana de naturalidade. Apenas **PRESENT/AFFIRMATIVE** é o recorte fonte; outros tempos e modos não viram autoridade por sua presença no corpus.

As seis apresentações existentes **não são seis avaliações homologadas**. O banco de 48 exemplos de H14.37 é sintético; suas etiquetas não provam compreensão semântica. O projeto de submissão só aceita metadados artificiais controlados e recusa `answerText`, `learnerId` ou dados privados. H14.38 retém os modelos do professor; a projeção H14.63 **não inclui** esses modelos no conteúdo destinado a alunos. Uma avaliação futura precisará de fronteira servidora real para separar materiais de revisão e tarefas públicas.

**Compatibilidade:** preservar WHY S3→S4, 0/3→3/3 somente por Evidence autorizada, NICK visual ≠ autenticação, PATITA observador, EVAL-08 autoridade, TRAIL/WORD canônicos, FUNC-13 oculto, GEAR-06 PERIOD pendente, sem ordem rígida ou pré-requisito WHICH/HOW.

## Testes e próximos portões

`node scripts/test-jaguar-h14-63-why-six-plan-handoff.js` valida seis combinações × três dimensões, fidelidade ao H14.38, ausência de vazamento dos modelos, ações inválidas, isolamento por origem/idioma, S3 preservado e autorização falsa. CI também deve reexecutar H14.26/37/38, H14.62 e WHY S3→S4.

**H14.64 próximo:** formulário/revisão independente com dois pareceristas reais, aprovação semântica e mediação de divergências HG-01–10. Nenhum parecer foi coletado nesta entrega; H14.64 é o portão humano, não uma aprovação automática.

**HIST-01 ainda parcial; DG-01–DG-07 e HG-01–10 permanecem abertos.** Não houve alteração em `main`, PR #3, runtime do Explorer, Cloudflare, D1 remoto, dados pessoais ou autenticação.
