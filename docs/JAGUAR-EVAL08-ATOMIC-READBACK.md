# 🔔🐆 EVAL-08 · Persistência atômica e projeção por readback

Esta branch preserva a base EVAL-08 GREEN e adiciona um **adaptador de laboratório SQLite/D1-shaped, não conectado à produção**. O esquema aditivo `atomic-fixture.sql` é isolado da migração V30.3/85C. A ocorrência V30.3/85C mantém `pending` como estado de ingresso; Evidence nasce somente em transação distinta que revalida sessão, contrato, ação direta, escopo e revogação **no SQL**, criando Attempt, Evidence (somente resposta aprovada) e outbox como unidade atômica.

`createLocalAtomicEval08Writer` expõe `commitAtomicAssessment` e `readAccepted` por escopo sujeito×skill×idioma×Experience de origem. Uma resposta incorreta fica como Attempt sem Evidence. Repetição, revogação, falhas injetadas, transações incompletas e mistura de idiomas/sujeitos são bloqueadas. A leitura exige uma sessão verificável **sintética** ativa; não aceita NICK como autenticação e nunca declara Green Pass a partir de uma escrita.

Limites: os serviços de verificação de identidade, decisão contratual e correção continuam **mocks confiáveis do teste**, não identidade real nem avaliação semântica livre. A interface EVAL-08 ainda precisa de adapter de provedor real e implantação de esquema de produto (não copiar `lab_*`). O teste não usa Cloudflare D1 remoto, não faz deploy, merge ou conversão de WHY S1/S2 em contrato avaliativo. Os 15 HG e 7 DG permanecem abertos. O ciclo WHY S3→S4 e o Explorer atual continuam preservados.

Para CI: `node --test scripts/test-eval08-atomic-readback.mjs`. Próxima fase: adaptar as validações transacionais para schema de staging autenticado, conferir revogação e readback sob concorrência real, conectar projetores canônicos e então avaliar readiness/Cloudflare, mediante aprovação.
