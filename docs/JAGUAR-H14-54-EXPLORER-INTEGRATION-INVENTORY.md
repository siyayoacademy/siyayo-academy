# 🔔🐆 JAGUAR — Inventário Mestre de Integração ao Explorer Real
**Snapshot:** H14.53 `43468d39255dcebb13e944ef79ef054d6883cf68`. Inclui o candidato H14.54 nesta branch, sujeito a testes. Inventário baseado em fontes GitHub verificadas, não é atestado de integração. O histórico completo além das fontes consultadas não foi reaudidado.

## A. Módulos do Explorer — catálogo REG-01 (18)

| Código | Módulo | Fronteira a proteger |
|---|---|---|
| `EXP-01` | Experience Header | Conservar seletores, contratos e versão no alvo |
| `CTX-02` | Circumstance Strip | Conservar seletores, contratos e versão no alvo |
| `DEP-03` | Dependency Focus | Conservar seletores, contratos e versão no alvo |
| `HEAD-04` | Dependency Head Probe | Conservar seletores, contratos e versão no alvo |
| `ID-05` | Learner Identity (NICK visual) | Conservar seletores, contratos e versão no alvo |
| `GEAR-06` | Language/QW/Word Type/Tense/Mode/Perspective | Conservar seletores, contratos e versão no alvo |
| `LIVE-07` | Living Window/Lines | Conservar seletores, contratos e versão no alvo |
| `EVAL-08` | Assessment Probes | Conservar seletores, contratos e versão no alvo |
| `NEXT-09` | Toroidal NEXT | Conservar seletores, contratos e versão no alvo |
| `TRAIL-10` | Learning Trail | Conservar seletores, contratos e versão no alvo |
| `WORD-11` | Word Path | Conservar seletores, contratos e versão no alvo |
| `PATITA-12` | Interaction Ledger observational | Conservar seletores, contratos e versão no alvo |
| `FUNC-13` | Master VIP Functions (hidden experimental) | Conservar seletores, contratos e versão no alvo |
| `SPEECH-A` | Corpus Speech | Conservar seletores, contratos e versão no alvo |
| `SPEECH-B1` | Question Speech | Conservar seletores, contratos e versão no alvo |
| `SPEECH-B2` | Response Speech | Conservar seletores, contratos e versão no alvo |
| `RS-01` | Responsive Stage | Conservar seletores, contratos e versão no alvo |
| `XESP-DIAG` | XESPIRITO diagnosis | Conservar seletores, contratos e versão no alvo |

**Atenção:** ID-05 não é autenticador; PATITA-12 observa, nunca aprova Evidence; TRAIL-10 e WORD-11 mostram somente evidência canônica; FUNC-13 permanece oculto. EVAL-08 e contratos autorizados são responsáveis pela avaliação, não componentes de fala ou exploração.

## B. Evolução WHY/V30 — H14.39 a H14.54

| ELO | Entrega verificável | Natureza / limites | Documento |
|---|---|---|---|
| H14.39 | Ocorrência, origem e idempotência | modelo sintético em memória; sem integração automática | [Relatório](../../docs/JAGUAR-H14-39-CROSS-ORIGIN-OCCURRENCE-IDEMPOTENCE.md) |
| H14.40 | Reuso 85C durável | análise sem storage duplicado; sem integração automática | [Relatório](../../docs/JAGUAR-H14-40-V30-85C-DURABLE-IDEMPOTENCY-REUSE.md) |
| H14.41 | Dimensão/intenção/ciclo | contrato especificado; sem autorização; sem integração automática | [Relatório](../../docs/JAGUAR-H14-41-DIMENSION-INTENT-ATTEMPT-LIFECYCLE.md) |
| H14.42 | Falhas e recuperação | SQLite local com rollback/replay; sem integração automática | [Relatório](../../docs/JAGUAR-H14-42-DURABLE-FAILURE-RECOVERY.md) |
| H14.43 | Handoff seletivo | manifesto de 182 arquivos e 7 gates abertos; sem integração automática | [Relatório](../../docs/JAGUAR-H14-43-SELECTIVE-INTEGRATION-HANDOFF.md) |
| H14.44 | Binding preparado | preparador JS de serviços simulados; sem integração automática | [Relatório](../../docs/JAGUAR-H14-44-SERVER-BINDING-DRY-RUN.md) |
| H14.45 | Replay 85C | adaptador local de replay/revalidação; sem integração automática | [Relatório](../../docs/JAGUAR-H14-45-PERSISTED-REPLAY-REVALIDATION.md) |
| H14.46 | Ação/escopo transacional | SQLite + metadados sintéticos; sem integração automática | [Relatório](../../docs/JAGUAR-H14-46-TRANSACTIONAL-ACTION-SCOPE.md) |
| H14.47 | Compatibilidade de escritores | bypass entre writers reproduzido; sem integração automática | [Relatório](../../docs/JAGUAR-H14-47-CROSS-ADAPTER-LEGACY-COMPATIBILITY.md) |
| H14.48 | Ponto único de escrita | triggers locais bloqueiam bypass; sem integração automática | [Relatório](../../docs/JAGUAR-H14-48-SINGLE-WRITE-BOUNDARY.md) |
| H14.49 | Contrato D1/legado | plano de destino sem migração; sem integração automática | [Relatório](../../docs/JAGUAR-H14-49-D1-WRITER-LEGACY-CONTRACT.md) |
| H14.50 | Batch protegido | JS + SQLite local; 17 testes; sem integração automática | [Relatório](../../docs/JAGUAR-H14-50-GUARDED-BATCH-CANDIDATE.md) |
| H14.51 | Binding D1 local | Miniflare proxy Node; 14 testes; sem integração automática | [Relatório](../../docs/JAGUAR-H14-51-MINIFLARE-D1-RUNTIME.md) |
| H14.52 | Worker local empacotado | workerd/D1/crypto; 15 testes; sem integração automática | [Relatório](../../docs/JAGUAR-H14-52-WORKER-LOCAL-BUNDLE.md) |
| H14.53 | Fronteira sintética/proveniência | Worker gateway D1 local; 12 testes, CI GREEN; sem integração automática | [Relatório](../../docs/JAGUAR-H14-53-TRUSTED-ACTION-PROVENANCE.md) |
| H14.54 | Prova assinada substituível | HMAC de teste, contrato de verificador e bundle; CI pendente; sem integração automática | [Relatório](../../docs/JAGUAR-H14-54-VERIFIED-ASSERTION-CONTRACT.md) |

### Núcleo reutilizável — sem duplicar

- `V30.3.85C`: chave `learner_subject,event_id`, migração `0004` e leitor `storage-contract.mjs`. A tabela de ocorrências é a única base de `pending` no laboratório; não criar tabela espelho ao integrar.
- H14.44: preparador; H14.50: candidato JS de seis statements; H14.52: Worker local real; H14.53: gateway e proveniência sintética imutável; H14.54: verificador de asserção de teste pluggable. Não promover fixtures `mock_*` a migrations reais por cópia.
- WHY S3→S4: preservar sua própria cadeia CHOICE/USE/TRANSFER e regressões. S1/S2 requerem contratos separados, sem rigidez de percurso.
- Eventos observados e interações exploratórias são separados de tentativas autorizadas. `pending`, `created`, `duplicate`, `MATCH`, `CI GREEN` não constituem Evidence ou Green Pass.
- O corpus e a matriz QW × Experience × Idioma × Forma/Tempo/Modo não devem ser substituídos integralmente por qualquer laboratório de persistência.

## C. Fronteiras obrigatórias de integração (sete gates H14.43)

| Gate | Exigência | Situação |
|---|---|---|
| DG-01 | authoritative versioned binding of dimension and intent | **ABERTO** |
| DG-02 | authorized WHY S1/S2 contracts | **ABERTO** |
| DG-03 | atomic evaluation decision plus Evidence/outbox and idempotent consumers | **ABERTO** |
| DG-04 | real trusted authentication, revocation and subject isolation | **ABERTO** |
| DG-05 | real Worker/D1 staging concurrency recovery consistency | **ABERTO** |
| DG-06 | fresh main/PR compare and selective regression tested integration patch | **ABERTO** |
| DG-07 | human pedagogical homologation HG-04/05/09/10 | **ABERTO** |

## D. Ordem recomendada (após avaliação e autorização próprias)

1. **Congelar HEADs atuais** de `main`, PR #3, H14.54 e registry; comparar caminho por caminho com o manifesto anterior de 182 arquivos (que é um snapshot histórico).
2. **Fechar fronteiras de identidade/proveniência reais** sem tratar NICK ou um handle do cliente como principal. Escolher emissor verificado, política de sessão/CSRF e originação assinada da ação.
3. **Validar schema em D1 isolado** e migrar metadados somente com reconciliação legada; nenhum segundo armazenamento de ocorrência.
4. **Autorizar contratos pedagógicos** WHY S1/S2 por QW/Experience/idioma/origem, garantindo flexibilidade e transferência; isso é independente de D1.
5. **Preparar integração seletiva** com ID-05, EVAL-08, TRAIL-10, WORD-11; preservar PATITA observacional, corpus, speech, NEXT, FUNC-13 oculto, WHAT/WHERE/WHICH.
6. **Executar ensaios EN/ES/PT** no Explorer real, desktop/portrait/landscape; incluir retry, concorrência, rollback, áudio, QW switch, origem e Evidence/Green legítimas.
7. **Registrar decisão GO/NO-GO de cada gate** e obter autorização separada para merges/deploys; rejeitar qualquer patch total que substitua arquivos homologados sem revisão.

## E. Governança e rastreabilidade

REG-01 identifica módulos, REG-02 fluxos e autoridade, REG-03 consumidores e impacto. XPR-01 cataloga relações com MCE, XPR-02/03.1 compara HEADs e descobre branches explicitamente. A governança **não substitui** o contrato pedagógico nem a autenticação do Worker. A watchlist do XPR-03.1 cobre até H14.52; os novos ELOs precisam de novas inscrições com SHA e aprovação, sem descoberta automática de dependências.

**NO-GO** para publicar qualquer laboratório como Explorer real por este inventário. O único estado permitido é preparação rastreável para futura integração seletiva.
