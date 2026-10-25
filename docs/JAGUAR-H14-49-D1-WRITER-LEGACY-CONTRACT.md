# JAGUAR H14.49 — Contrato do escritor de destino e tratamento legado

Base: H14.48 `79ce251bd0d2820590ad3a6c7e69afad892c09a0`. **Resultado: contrato de destino e planejador de tratamento definidos; adaptador D1 e staging ainda não implementados/validados.** Não houve implantação, migração ou integração ao Explorer.

## Contrato do escritor único

O destino deverá ter uma única fronteira de submissão controlada pelo servidor. A identidade virá de sujeito autenticado; NICK não dá propriedade. O UUID identifica um envio do sujeito. A ação direta tem consumo único por sujeito/actionReference, mesmo com UUIDs distintos. O escopo preserva sujeito, skill, idioma, origem, ID/versão de contrato e QW.

A unidade atômica deverá validar a revisão de autorização e seu estado, reservar ação/escopo e inserir a ocorrência na tabela 85C existente. Retry autenticado e idêntico retorna recibo histórico, sem novo início ou avaliação. Mudança de envelope com o mesmo UUID é conflito. Os escritores anteriores deverão estar bloqueados antes de habilitar o novo. O flag padrão continuará desativado.

## O que a documentação D1 sustenta

Fontes oficiais consultadas em 25/10/2026:

- [D1 Database — batch](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch): lote de prepared statements ordenado, com rollback quando uma instrução falha.
- [D1 Database — withSession](https://developers.cloudflare.com/d1/worker-api/d1-database/#withsession): consistência sequencial; first-primary inicia no primário.
- [Read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/): política de leitura com Sessions/bookmarks e réplicas assíncronas.

**Decisão de arquitetura, não garantia extra da documentação:** a atomicidade de nosso protocolo precisa de predicados de autorização/reserva dentro da unidade de gravação. Sessions e uma consulta prévia não comprovam sozinhas essa propriedade. O loop Python com BEGIN IMMEDIATE e lógica entre consultas não será copiado presumindo equivalência com a API D1. Os schemas MOCK e triggers locais também não são migrações de produto aprovadas.

Uma instrução que altera zero linhas pode terminar sem erro. Logo, checar meta.changes depois de concluir um lote não basta para desfazer reservas já confirmadas. Condições obrigatórias precisam impedir o commit por mecanismo SQL de falha efetiva ou por outra estratégia comprovadamente atômica. O SQL e a estratégia exatos do adaptador ainda serão implementados e testados. Dois testes locais demonstram zero-row sem rollback versus violação real de constraint com rollback; eles não executam D1.

## Política para registros anteriores

O planejador `legacy_destination_plan.py` usa a auditoria read-only H14.47 e não executa reparos. A saída contém contagens e códigos, sem respostas, sessões ou identificadores reais.

| Resultado encontrado | Tratamento definido |
| --- | --- |
| Banco vazio ou consistente | Candidato apenas a protótipo isolado de destino; sem autorização de deploy |
| Sem binding | Preservar histórico; não inferir autoridade ou preencher campos retroativamente |
| Binding sem reservas | Revisar proveniência; não criar claims automaticamente |
| Mesma ação em vários UUIDs | Preservar todas as linhas; não escolher vencedor arbitrariamente |
| Integridade divergente | Preservar fonte, bloquear novas gravações e investigar |
| Claim órfão | Revisar interrupção/inconsistência; não apagar metadados |
| Metadados ausentes | Revisar schema auxiliar, sem criá-lo implicitamente |
| Fonte ilegível ou inexistente | Parar, sem criar banco substituto |

A classificação é um plano de tratamento, não uma decisão pedagógica. Mesmo um banco consistente retorna `mayWrite:false`, `mayDeploy:false` e `mayIssueEvidence:false`. Nenhum registro é transformado em Evidence e nenhum problema é marcado como resolvido pela simples emissão do plano.

## Evidência necessária antes de habilitar o destino

O contrato JSON registra como UNVERIFIED: schema aditivo revisado; identidade/revisão real; lote atômico com precondições e caso zero-row; disputas de UUID/ação; revogação/expiração; política de leitura e replay; proveniência legada; desativação com histórico legível; regressões EN/ES/PT e homologação do Explorer. Esses critérios detalham as sete lacunas H14.43, sem substituir ou fechar seus portões.

Próximo incremento concreto: implementar um candidato isolado de lote protegido, sem endpoint, e testar sua semântica antes de staging. Não se presume que a existência de batch autorize publicar esse candidato.

## Validação

**9 testes novos** verificam consistência sem autorização de deploy, preservação de registros unbound, reservas ausentes, integridade, claims órfãos, schema ausente, arquivo inexistente e os dois comportamentos transacionais descritos. A workflow executa também as regressões H14.39–H14.48, 85C e WHY S3→S4 EN/ES/PT.

```bash
python3 -B labs/jaguar-v30-3/test/h14-49/legacy_destination_plan_test.py -v
```

As ocorrências anteriores, módulos anteriores e migração 85C não foram alterados. Preservados main, PR #3, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto, WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.
