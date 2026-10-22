# JAGUAR V30.3.89O — INVENTÁRIO TRANSVERSAL S1→S4, REVIEW e WHY

**Status:** auditoria e regressão da arquitetura existente, não implementação de novo módulo. Origem fixa: Explorer `jaguar/verb-explorer-resume-live-wire` commit `c7e83709cacf8479847df0f3cee4ed8a563aaae6`. Desenvolvimento experimental `jaguar/v30-3-recovery-archive`; `main` não deve ser alterada.

## DNA da sequência pedagógica

Existem **4 Experiences** (S1 Shopping, S2 Preparing, S3 Having, S4 After-Dinner) conectadas pelo campo `toroidalNext.nextExperience`. Cada Experience possui seu próprio corpus de Question Words e enunciados em EN/ES/PT: **21 slots de QW / 8 tipos de QW diferentes / 63 enunciados linguísticos localizados**. Isso **não** implica que existam 21 contratos avaliativos homologados. O Word Path apresenta quatro famílias: WHICH, WHAT, WHERE, WHY.

| Experience | QWs authored | Meaningful natural relationship |
|--|--|--|
| S1 Shopping | WHAT, WHERE, HOW MUCH, WHICH, WHY, WHO | reconhecer ingredientes/lugar/quantidade/escolha/preferência/pessoas |
| S2 Preparing | WHAT, WHERE, WHEN, HOW, WHICH, WHY, WHO | planejar ação/posição/tempo/modo/escolha/razão/agentes |
| S3 Having | WHAT, WHO, HOW, WHY | consumir, conversar, perceber o modo, perguntar por quê |
| S4 After-Dinner | WHAT, WHO, WHY, HOW | transferir razões ao contexto da conversa |

O circuito S4→S1 está previsto no `toroidalNext` do corpus, **não implica progressão automática**, não autoriza Green Pass e tampouco obriga o aprendiz a repetir S1.

## Diferenciar três conceitos WHY

**A. 7D.3.7 REVIEW pós-feedback — implementado e presente na fonte.** Apenas `shopping-for-dinner` + QW WHICH fornece `choiceContext` R1/R2. `js/verb-explorer.js` monta `choiceReview` depois de `choiceFeedback`; REVIEW só revela se uma alternativa canônica válida foi escolhida. Áudio é solicitado via `speakText`; não declarar qualidade acústica comprovada por CI. Pergunta trilingue *Why does this choice fit the dinner? / ¿Por qué esta elección combina con la cena? / Por que esta escolha combina com o jantar?*; a REVIEW é explicação contextual, não a QW WHY avaliativa independente.

**B. WHY · QW própria — código e testes canônicos presentes.** Contrato 3 requisitos `question-function + reason-answer(local) + reason-answer(transfer)`. S3 Having é a origem; S4 After-Dinner é a transferência. WHY também está presente como texto de pergunta em S1 e S2, mas isso **não** significa que sua avaliação S3/S4 seja iniciada automaticamente nesses palcos. O uso do NEXT continua sob decisão do aprendiz, sem atribuição automática de Evidence a visitas ou leitura.

**C. 7D.3.10 DISCOVER WHY — proposta preservada, ainda NÃO implementada.** Registrada em `governance/contract-evolution-registry.json`. Sequência proposta `QUESTION → CHOICE R1/R2 → CONTEXTUAL FEEDBACK 0/4–4/4 → REVIEW → DISCOVER WHY → REFLECT & TRANSFER`. Não confundir escore de adequação contextual `0/4–4/4` com CHOICE/USE/TRANSFER `0/3–3/3`. Abrir explicação jamais cria Evidence ou Green Pass.

## Ligações de Assessment por contexto, sem fila obrigatória de QWs

- WHICH: S1 → S2 (CHOICE/local/transfer; origem não é alterada pela visita).
- WHAT: estão documentados **dois caminhos distintos**, S1 → S2 e S2 → S3. Não generalizar origens entre sessões.
- WHERE: S1 → S2, contrato `where.json` sinalizado **isolated-candidate**, não homologação global.
- WHY: S3 → S4, contrato independente que herda histórico sem produzir crédito de outras QWs.
- HOW MUCH, WHEN, HOW e WHO: corpus possui perguntas, mas não elevar automaticamente a contratos 3/3.
- Evidências devem manter `learnerId × skill × language × originExperienceId`; o estado observacional PATITA não confere crédito.

## Quatro checks automáticos de auditoria

**89O.1** grafo das 4 experiências, 21 slots/8 QWs/EN–ES–PT, versus apenas 4 famílias de Word Path; **89O.2** REVIEW R1/R2, localização/ordem/limite de escopo; **89O.3** contratos e transferências contextuais WHICH, WHAT, WHERE, WHY + WHY S3/S4; **89O.4** DISCOVER WHY em espera, 0/4 × 0/3, autoridades de acesso/persistência preservadas.

Executar `node --test test/review-why-transversal-89o.test.mjs` no laboratório com `SIYAYO_89O_PINNED_ROOT` apontando ao checkout imutável (workflow inclui os testes canônicos existentes, sem alterações aos próprios testes). **Green CI confirma estes invariantes, não uma homologação visual, áudio real ou adoção acadêmica.**

## Pendências no mapa — nenhuma deve ser descartada

1. S1 WHICH R1/R2 → REVIEW: testado via VM, mas faltam validações humanas de posição, som real e alternância/reload nos três idiomas.
2. WHY S3→S4: origem, transferência e autoridade testáveis no CI; conferir fluxo real em smartphone, finalização e retorno após 3/3 sem fabricar respostas.
3. Revisão contextual independente para outras QWs: **não especificada/homologada**, não replicar automaticamente REVIEW do WHICH.
4. DISCOVER WHY e quatro critérios contextuais: aguardando decisão sobre proveniência do corpus, copy trilíngue, gesto de descoberta e futuro contrato de transferência.
5. Esquema histórico compartilhado: a regra é observador ≠ Evidence, `NICK` ≠ identidade autenticada e mudança de idioma/QW não apaga outras tentativas.
6. Verificação visual 89N: seis telas do usuário por QW foram simuladas, com cartões e NEXT. Teste separado de REVIEW e WHY real.
7. Segurança/deploy: 12 gates externos bloqueados; Zero Trust Free segue pendente sem pagamento. CI na branch laboratorial pode acionar previews Pages automáticos; não é publicação em `main` nem validação de produção.

**Próxima autorização possível:** revisão visual e auditiva real da sequência Shopping WHICH R1/R2 REVIEW, seguida de S3 WHY e S4 transferência, mantendo checkpoints isolados. Não modificar documentos canônicos, código oficial ou Cloudflare sem acordo.
