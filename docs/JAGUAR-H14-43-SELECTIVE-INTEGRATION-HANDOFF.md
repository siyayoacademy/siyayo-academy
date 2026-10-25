# JAGUAR H14.43 — Manifesto de integração seletiva

**Decisão: GO para encerrar a preparação técnica H14.40–H14.43; NO-GO para integração executável, staging ou produção.** A conclusão 4/4 não fecha as sete lacunas nem autoriza avaliação. Nenhum merge foi realizado.

## Fontes congeladas

O manifesto JSON registra 182 arquivos de referência/teste por Git blob SHA, dependências por fronteira e os HEADs consultados no GitHub. O inventário serve à preservação; não é uma lista de código autorizado a copiar nem comprova fechamento transitivo de dependências de runtime. A allowlist de aplicação executável está vazia.

| Fonte consultada | HEAD |
| --- | --- |
| main | c2149f5e63b8de716cf9b9dcdede213bd328344e |
| PR #3 — head | c7e83709cacf8479847df0f3cee4ed8a563aaae6 |
| PR #3 — base registrada na PR | 8cd169bac05506f7c9046a12bfee7542af2292e6 |
| Module Registry | 719f259d78ca27d444bdfacecd3ccd2091818980 |
| Laboratório H14.42 | b30aa104c531f3f96ba0a878b4eb5c423c5d7644 |

A base registrada na PR é diferente da main consultada. A futura integração deve atualizar a comparação; este snapshot não garante que as branches ficarão imóveis. O Registry também é documental, baseado no source_commit nele declarado, e não prova equivalência com as versões atuais dos módulos.

## Comparação por arquivo

| Arquivo/módulo em relação ao laboratório | main | PR #3 |
| --- | --- | --- |
| verb-explorer.html, js/verb-explorer.js, experience-seeds.json | Diferentes | Diferentes |
| WHY skill e Adaptive Scope | Ausentes | Iguais |
| WHY assessment live, Learner Trail, Word Path | Ausentes | Diferentes |
| PATITA interaction trail | Ausente | Ausente |
| 85C SQL e storage-contract | Ausentes | Ausentes |

A ausência refere-se ao caminho exato consultado, não a toda funcionalidade equivalente no destino. Os hashes e caminhos completos constam no JSON. Não transportar corpus/HTML/Explorer por sobrescrita integral. A arquitetura durável 85C deve ser reaproveitada; sua presença no laboratório não significa implantação no Explorer.

## Fronteiras do Module Registry

- ID-05: NICK visual não substitui sujeito autenticado do servidor.
- EVAL-08: único caminho futuro para alvo autorizado e decisão avaliativa compatível.
- TRAIL-10 / WORD-11: projeções de evidência canônica; pending não pode virar progresso.
- PATITA-12: registro observacional; não autoriza Evidence nem GREEN.
- FUNC-13: referência experimental permanece oculta; sem crédito avaliativo.

## Sete portões que permanecem abertos

| Portão | Exigência para integração |
| --- | --- |
| DG-01 | Implementar binding versionado de dimensão/intenção, validado no servidor e na leitura avaliativa |
| DG-02 | Homologar e autorizar contratos WHY S1/S2 por origem, separados do S3→S4 existente |
| DG-03 | Comprovar transação decisão + Evidence/outbox e consumidores idempotentes |
| DG-04 | Autenticação real, revogação e isolamento por sujeito verificado |
| DG-05 | Concorrência e recuperação em Worker/D1 de staging; SQLite local já ensaiado |
| DG-06 | Patch seletivo contra HEADs atualizados, dependências completas e regressões do Explorer |
| DG-07 | Homologação pedagógica HG-04/05/09/10, incluindo independência e transferência |

O manifesto enumera a sequência de trabalho futura e a evidência necessária em cada fronteira. Staging exige primeiro um patch isolado, identidade, contratos e infraestrutura adequados; o presente documento não autoriza implantação. Ao surgir qualquer mudança de HEAD ou fonte, regenerar a comparação e revisar o patch antes de aplicar.

## Verificação

O auditor somente lê arquivos e confere hashes, preservação e decisões. Testes de mutação rejeitam GO indevido, fechamento sem evidência de qualquer portão, fonte alterada, allowlist executável, autoridade avaliativa ou HEAD ausente. A workflow repete H14.39–H14.42, 24 testes 85C, 16 SQLite anteriores, 10 novos SQLite, 5 falhas JS e ciclo WHY S3→S4 EN/ES/PT.

```bash
node scripts/test-jaguar-h14-43-integration-readiness.js
node scripts/jaguar-h14-43-integration-readiness.js
```

A auditoria local verifica os hashes do laboratório; os hashes de main/PR/Registry são um snapshot remoto coletado, não são reconsultados pela CI. Testes verdes comprovam preservação e preparo do pacote dentro desse escopo, sem comprovar autenticação de produção, significado de texto livre ou integração já realizada.

**Preservado:** main, PR #3, Explorer, PATITA, Learning Trail/Word Path, FUNC-13 oculto, WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.
