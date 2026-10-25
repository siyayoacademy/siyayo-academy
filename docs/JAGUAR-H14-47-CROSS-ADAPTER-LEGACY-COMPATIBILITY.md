# JAGUAR H14.47 — Compatibilidade cruzada e registros anteriores

Base: H14.46 `3c43844cd8403dccd50d877ba50a9a729ea10fb2`. **Resultado: leitura/replay cruzados testados; coexistência dos escritores H14.45/H14.46 bloqueada.** Este ELO registra uma divergência reproduzível, sem esconder o problema sob testes verdes.

## Descoberta central

O adaptador JavaScript H14.45 utiliza o write 85C original, que garante unicidade por sujeito/UUID, mas não participa das reservas de ação/escopo do modelo H14.46. Assim, uma ação consumida no H14.46 pode ganhar outra ocorrência por um UUID diferente no H14.45. O teste executa os dois caminhos no MESMO arquivo SQLite e demonstra duas linhas para a mesma ação. O auditor identifica `ACTION_REUSED_ACROSS_UUIDS` e bloqueia a compatibilidade.

Portanto, esses escritores não podem ser ligados simultaneamente a um destino real presumindo a garantia transacional do H14.46. A futura implementação precisa de caminho único de escrita que respeite reservas e autorização, com bloqueio dos caminhos anteriores ou reconciliação transacional explícita. Nenhum writer real foi habilitado neste ELO.

## Matriz verificada

| Cenário | Resultado |
| --- | --- |
| Ocorrência H14.46 → leitor JavaScript 85C | Lê pending e binding, inclusive revisão de autorização |
| Gravação H14.46 → retry H14.45 | duplicate; linha e reservas preservadas |
| Gravação H14.45 → retry H14.46 | Recibo duplicate; não inventa reservas ausentes |
| H14.45 + H14.46 gravando mesma ação com UUIDs diferentes | Divergência reproduzida; exige bloqueio de coexistência |
| Registro 85C sem binding | Permanece legível como histórico; sem upgrade/reserva implícita |
| Metadados auxiliares ausentes | Auditor bloqueia revisão sem criar tabelas |
| Payload adulterado ou binding divergente | Detectado; nenhuma correção automática |
| Claim sem ocorrência | Marcado como órfão; sem reparo ou exclusão |
| EN/ES/PT | Leitura pelo contrato 85C e binding preservados por idioma |

## Auditor de compatibilidade

`compatibility_inspector.py` abre o arquivo com SQLite `mode=ro` e uma transação de leitura para snapshot consistente. Confere digest, binding versus colunas 85C, reservas de escopo, consumo por sujeito/ação, múltiplos UUIDs da mesma ação e claims órfãos. Retorna somente contagens e códigos de problemas, sem expor respostas ou identificadores do aprendiz.

Não modifica ocorrências, não cria metadados ausentes, não importa escopos legados, não concede créditos e não decide homologação. Mesmo um banco de laboratório consistente retorna `cutoverReady:false` e `evaluationAllowed:false`: consistência local não é autorização de integração.

`sqlite_lab_driver.py` é somente a ponte dos testes. O JavaScript H14.45, o leitor 85C e o modelo Python H14.46 são executados de verdade sobre o mesmo arquivo SQLite. O driver não é endpoint nem proposta de transporte para produção.

## Validação e preservação

**10 testes novos** cobrem a matriz acima, com snapshots das linhas antes/depois das operações de replay e inspeção. O teste de coexistência passa ao provar o bloqueio esperado, não ao demonstrar gravação segura. A workflow também mantém as regressões H14.39–H14.46, 85C e WHY S3→S4 EN/ES/PT.

```bash
node --test labs/jaguar-v30-3/test/h14-47/cross-adapter-compatibility.test.mjs
```

As fontes H14.45/H14.46 e a tabela 85C não foram alteradas. Os registros antigos exigem decisão explícita de reconciliação; não foi feito backfill de autoridade, consumo ou escopo a partir de simples presença de dados. Dados sintéticos e tabelas auxiliares continuam restritos a arquivos temporários de testes.

Os sete portões H14.43 permanecem abertos. Próximo incremento concreto: um único ponto de escrita no laboratório que impeça bypass das reservas, com política explícita para banco legado ou parcialmente reservado. Isso deve preceder um patch de staging; não basta portar a função de insert.

Preservados main, PR #3, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto, WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.
