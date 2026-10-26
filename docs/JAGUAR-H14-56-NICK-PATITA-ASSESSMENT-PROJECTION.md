# JAGUAR H14.56 — NICK × PATITA × contratos × Trail / Word Path

**GO somente para laboratório read-only; NÃO É avaliação automática de texto livre e não altera o Explorer.**

## Responsabilidades
- **NICK**: marcador visível para iniciar/retomar uma experiência. A API existente `verb-explorer-learner-identity-source.js` não autentica nem cria sujeito real. A ponte H14.56 exige um resolvedor de vínculo **injetado pelo teste**; na integração real, dependerá de identidade validada pelo servidor, sem confiar num nickname isolado.
- **PATITA**: observa interações e mudanças de Experience/QW/idioma; o ledger existente `js/verb-explorer-patita-interaction-trail.js` mantém `evidenceProduced:false`. Não decide, pontua nem inicia avaliação por observação.
- **QW/corpus**: `question-word-assessment-contract.js` distingue `assessmentTarget`, `assessmentResumeTarget` e mera `OPPORTUNITY_ONLY`. Contexto autorado sozinho não concede autorização.
- **EVAL-08**: somente contrato autorizado, autoria comprovada, origem e escopo adequado podem produzir Evidence. O laboratório H14.56 apenas recebe contextos canônicos de um serviço injetado e utiliza `adaptive-assessment-scope.js` + `adaptive-pass-contract-progress-view.js`.
- **Learning Trail / Word Path**: projetam exclusivamente progresso aceito em escopos separados por learner × skill/QW × idioma × Experience de origem, sem somar livremente idiomas ou misturar origens.

## Teste de navegação livre
Uma pessoa pode explorar S1/WHAT em PT enquanto sua avaliação WHY originada em S3 conserva o progresso em EN/ES/PT. A mudança de tela não reinicia o progresso, não emite Evidence nem desbloqueia um contrato novo por inferência. O observador pode descobrir contexto relevante, mas não cria uma decisão de avaliação.

## Integração futura
1. Criar resolvedor confiável de NICK vinculado a sujeito validado; não confundir NICK com sessão autenticada.
2. Adaptar o catálogo de oportunidades aos contratos explicitamente homologados por Experience, QW e idioma, sem obrigar sequência física entre cenas.
3. Passar somente ações diretas comprovadas por entrada autorizada EVAL-08, sem aceitar PATITA ou áudio como `Attempt`.
4. Armazenar decisões/evidências canônicas com idempotência e autoria em D1 real apenas depois dos gates DG-01 a DG-07.
5. Conectar os projectors existentes do Learning Trail e Word Path com os mesmos escopos canônicos.
6. Ensaiar troca EN/ES/PT, QW/Experience, NICK, speaker, replay, transferência, origem e progressos 0/3 → 3/3, sem creditar visita.

**H14.56 não cria `assessmentTarget`, não modifica `experience-seeds.json`, não usa D1 remoto, não escreve no Explorer e não concede Green Pass.**

## Arquivos e uso
- `labs/jaguar-v30-3/test/h14-56/assessment-observation-bridge.cjs`
- `labs/jaguar-v30-3/test/h14-56/assessment-observation-bridge.test.cjs`
- Teste: `node --test labs/jaguar-v30-3/test/h14-56/assessment-observation-bridge.test.cjs`.

**Cuidado arquitetural:** esta prova usa um `listCanonicalContexts` sintético para as projeções. Uma fonte real terá de passar as evidências aceitas e os avaliadores já existentes; `pending` 85C, cliques PATITA e perfil meramente observacional não são testemunhos canônicos.
