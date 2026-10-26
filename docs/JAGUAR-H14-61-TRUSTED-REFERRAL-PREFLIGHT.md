# JAGUAR H14.61 — Checagem confiável de proposta (laboratório isolado)

**Base:** H14.60 GREEN, commit `2c43f309eb12862d968e8d8b5ded96d27a3390bc`. O objetivo é receber uma proposta browser somente como dica e validar, por **adapters independentes de laboratório**, identidade/sessão assinadas, ação DIRETA com origem, contrato autorizado versionado e origem de retomada.

O `createLabReferralPreflight` verifica o token H14.54 (assinatura HMAC com chave SOMENTE de teste), sessão sintética vinculada, ação direta sintética imutável (sem PATITA), target canônico, skill, idioma, QW, Experience, intenção, expiração, revogação e contrato explicitamente autorizado. O resultado de sucesso é `LAB_PREFLIGHT_REVIEWABLE_NOT_EXECUTABLE`: **não concede permissão de execução** e não chama nenhuma API de sessão, tentativa, avaliação, Evidence, Green ou D1.

Nenhum segredo, documento privado ou credencial real é publicado. Não há deploy/HTTP endpoint ou inserção desse código na UI. A implementação anterior de H14.60 permanece exatamente igual. A navegação por QW/Experience/EN/ES/PT continua livre. `HIST-01` e todos os DG-01–DG-07 continuam ABERTOS.

Testes herméticos: `node --test labs/jaguar-v30-3/test/h14-61/referral-preflight.test.mjs`. A CI verifica também os regressivos H14.57–H14.60. Antes de qualquer integração com EVAL-08 real, substituir os mocks por identidade de servidor confiável, ação registrada no lado do servidor e contrato pedagógico efetivamente homologado — tudo por autorização separada.
