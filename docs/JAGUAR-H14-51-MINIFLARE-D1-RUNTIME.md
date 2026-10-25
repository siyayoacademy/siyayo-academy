# JAGUAR H14.51 — Binding D1 no runtime local Miniflare

Base: H14.50 `03ccf051e677309891987524fee6df7624c33fc4`. **Resultado: candidato H14.50 executado sem alterações contra o binding D1 local de Miniflare/workerd.** Não foi usado D1 remoto nem ambiente de produção.

## Avanço comprovado

Os testes H14.50 forneciam atomicidade por um driver Python/SQLite. Neste ELO, as operações de prepare/bind/first/run/batch são executadas pelo binding obtido de `Miniflare.getD1Database('DB')`. A documentação oficial descreve esse acesso para testes: [Miniflare D1](https://developers.cloudflare.com/workers/testing/miniflare/storage/d1/) (consultada em 25/10/2026).

Python apenas exporta as constantes de DDL dos fixtures anteriores. Não executa queries, transações ou retorno de batch neste novo ensaio. O candidato JavaScript continua sendo executado no host Node, usando o proxy do binding D1; isto NÃO comprova ainda seu empacotamento e execução como módulo dentro de um Worker. Esse limite é separado da verificação de SQL e semântica da API D1 local.

## Ambiente reproduzível e isolado

- Miniflare **4.20260730.0**, workerd **1.20260730.1**, versões fixadas em package-lock.json.
- Compatibility date **2026-07-30**.
- Dependências restritas ao pacote de testes `test/h14-51`, sem package/dependências na raiz.
- Persistência D1 em diretório temporário exclusivo por teste, removido no encerramento.
- Worker local mínimo retorna 404; não expõe o candidato por rota HTTP.
- Nenhum account ID, token, binding de banco remoto ou deploy é configurado.

A inicialização usa somente schema 85C original e DDL sintético H14.46/H14.48/H14.50. Nenhuma migração de produto foi criada. A auditoria de cutover H14.48 não está sendo executada por Miniflare: o fixture começa vazio e instala explicitamente os metadados de teste, sem afirmar reconciliação de banco legado.

## Resultados dos 14 testes novos

| Cenário | Resultado no binding D1 local |
| --- | --- |
| Lote com seis instruções | created, uma ocorrência/escopo/claim e asserção vazia |
| Autorização sem nenhuma linha correspondente | CHECK failure; lote sem reservas parciais |
| Erro SQL após insert da ocorrência | Rollback de ocorrência, escopo e claim |
| Revogação após preparo JavaScript | Falha dentro do lote |
| Revisão stale e alvo expirado | Nenhuma gravação parcial |
| Retry após criação de escopo | duplicate sem outro batch |
| Mesma ação com outro UUID | Segunda ocorrência bloqueada |
| Oito submissões simultâneas | Um created e sete duplicate |
| Resposta perdida após commit | Retry recupera recibo sem duplicação |
| Gate desativado | Insert recusado |
| EN/ES/PT | Leitor 85C original aceita binding por idioma |
| Candidato desativado | Nenhum batch executado |
| Dispose completo e recriação do runtime | Ocorrência/reservas persistem; retry duplicate |
| UUIDs distintos disputando nova ação | Um vencedor, um bloqueado; um consumo da ação |

A injeção de erro dentro do batch é uma instrução SQL adicional que viola CHECK, executada pelo binding. A perda de resposta é simulada somente depois que o batch real retorna. A revogação é aplicada no banco antes de enviar o lote, mantendo o preparo JavaScript anterior para reproduzir a janela de dados desatualizados.

## Reprodução

Da raiz:

```bash
npm ci --prefix labs/jaguar-v30-3/test/h14-51 --no-audit --no-fund
npm test --prefix labs/jaguar-v30-3/test/h14-51
```

A workflow instala as versões fixadas, executa esses testes e todas as regressões H14.39–H14.50/85C/WHY S3→S4 EN/ES/PT.

## Limites e decisão

**GO para a compatibilidade local com binding D1; NO-GO para publicação.** Ainda não foram comprovados: D1 remoto, replicação geográfica, latências reais, leitura de replay via Sessions/bookmarks no destino, autenticação real, expiração durante execução/commit, migração de registros legados, empacotamento do candidato dentro de Worker e contratos pedagógicos S1/S2 autorizados.

DG-05 ganha evidência Miniflare/workerd local com API D1, mas não fecha concorrência distribuída nem staging. As sete lacunas H14.43 permanecem abertas. Próximo incremento concreto: testar o candidato empacotado dentro do Worker local, mantendo mock authorization e rota externa desativada, antes de qualquer proposta de staging remoto.

Preservados main, PR #3, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto, WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.
