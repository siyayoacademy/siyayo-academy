# JAGUAR H14.52 — Candidato empacotado dentro do Worker local

Base: H14.51 `bb2878e3746415a29f4e5b15c087a65ec31fd696`. **Resultado: candidato H14.50 executado dentro de workerd, com módulos empacotados, crypto nativo e binding D1 local.** Não houve deploy, D1 remoto ou integração ao Explorer.

## O que mudou em relação ao H14.51

H14.51 executava o candidato no host Node e acessava o proxy do binding D1. H14.52 usa esbuild para empacotar um Worker que importa o candidato H14.50, o preparador H14.44 e o leitor 85C originais, sem modificá-los. Miniflare executa esse bundle dentro de workerd com `nodejs_compat` e compatibility date `2026-07-30`.

O teste verifica o grafo de entrada do bundle e mantém `node:crypto` e `cloudflare:workers` como módulos nativos externos. Uma prova SHA256 calculada pela chamada RPC dentro do Worker é comparada com o resultado esperado no host. O candidato e o leitor 85C são chamados no Worker, não substituídos por funções do host.

## Fronteira de acesso

- O fetch do Worker retorna **404** para todos os métodos/caminhos testados, inclusive `/submit` e `/__lab/v30/write`.
- `submit` e `readForTest` são métodos RPC de laboratório, acessados pelo stub local Miniflare. Não são rotas HTTP.
- Ausência do binding local explícito `LAB_RPC_ENABLED:true` bloqueia essas chamadas.
- Não há configuração Wrangler de deploy, conta, token, banco remoto, hostname público ou rota do Explorer.
- Injeções de erro, revogação e resposta perdida dependem somente de bindings do teste, nunca de campos do pedido.

O script é um Worker de ensaio, não um autenticador de produção. Os resolvers consultam tabelas mock_sessions/mock_targets/mock_actions e escopos do banco local. Isso prova resolução de dados dentro do runtime; a sessão continua sintética. NICK e flags enviadas pelo cliente não autorizam gravação.

## Estado, fontes e dependências

O preparador resolve alvo/ação/escopo por dados do servidor simulado; o candidato revalida precondições no batch e usa a tabela `v30_85c_occurrences` existente. O leitor 85C continua verificando isolamento e digest. Nenhuma tabela de ocorrências paralela, coluna ou migração de produto é criada.

Dependências diretas: WorkerEntrypoint, node:crypto, H14.50, H14.44, storage-contract.mjs, D1 e DDL sintético exportado do H14.51/H14.46/H14.48. esbuild **0.28.2**, Miniflare **4.20260730.0** e workerd **1.20260730.1**, fixados em package-lock.json. Bundle gerado em memória e bancos persistentes em diretórios temporários; não publicar binários ou caches como código do projeto.

## Testes

**15 testes novos** passaram:

1. Grafo do bundle contém candidato/preparador/leitor originais.
2. Execução RPC dentro do Worker com crypto nativo e D1.
3. HTTP GET/POST nos caminhos testados sempre 404, sem gravação.
4. RPC desabilitado sem binding explícito.
5. Replay reconhece escopo existente sem reiniciar start.
6. Oito chamadas RPC simultâneas: um created e sete duplicate.
7. Revisão stale e alvo draft bloqueados.
8. Revogação entre preparo e batch desfaz a submissão.
9. Erro SQL posterior reverte ocorrência, escopo e claim.
10. Resposta perdida após commit retorna duplicate no retry.
11. Sessão revogada não submete nem lê recibo histórico.
12. Autoridade/sujeito forjado no pedido é rejeitado.
13. UUIDs distintos disputando uma ação: um vencedor.
14. Reinício completo do Worker preserva replay e dados.
15. EN/ES/PT escritos e lidos inteiramente dentro do Worker empacotado.

A workflow também executa todos os ensaios H14.39–H14.51/85C e a regressão WHY S3→S4. O esquema de dados do teste começa vazio; este ELO não reconcilia bancos legados ou aprova migrações.

```bash
npm ci --prefix labs/jaguar-v30-3/test/h14-52 --no-audit --no-fund
npm test --prefix labs/jaguar-v30-3/test/h14-52
```

## Governança complementar aplicada

Referência XPR-02 `04ea14d92e028f832313aa3a973762b8c60c0b6e` e revisão WHY/XPR `4d23abbf2893df8191b637bb792a35775f6c9f23`. Não se alteram o Registry ou a watchlist ativa; a proposta anterior permanece separada. Nenhum supervisor contínuo é instalado.

| Eixo | Aplicação |
| --- | --- |
| HOW TO DO | Executar preparo, replay e batch dentro do Worker local |
| HOW TO RECORD | Reutilizar 85C; sujeito/UUID, ação e escopo com proveniência sintética explícita |
| HOW TO SHOW | Recibos e relatório de teste; nenhuma projeção de pending como crédito |
| HOW TO CHECK | Grafo do bundle, crypto nativo, RPC/HTTP, concorrência, rollback, reinício e idiomas |
| HOW TO SPEAK | Não aplicável ao backend; áudio e speech existentes preservados |

Consumidores futuros continuam sendo SIA:ID-05, SIA:EVAL-08, SIA:TRAIL-10 e SIA:WORD-11 sob seus contratos próprios; não foram conectados. SIA:PATITA-12 permanece observacional, SIA:FUNC-13 oculto e MCE independente. Saídas atuais são recibos created/duplicate e pending; nenhum evento ou painel do Explorer foi conectado.

**IMPLEMENTADO:** empacotamento e Worker de ensaio. **TESTADO LOCALMENTE:** Miniflare/workerd + D1, 15 casos. **PENDENTE:** identidade confiável, proveniência real de ações, D1 remoto, leitura replicada, expiração distribuída, reconciliação legada, avaliação/Evidence. **HOMOLOGADO:** nenhuma nova homologação pedagógica declarada. **INTEGRADO AO EXPLORER/PRODUÇÃO:** não.

## Decisão e próximo ELO

GO para compatibilidade do pacote Worker local; NO-GO para staging/produção por este resultado isolado. Os sete portões H14.43 continuam abertos. H14.53 deverá tratar a fronteira de identidade/revisão confiável e proveniência imutável da ação. Mocks não podem fechar DG-04. Contratos WHY S1/S2 e HG-04/05/09/10 precisam de revisão/autorização pedagógica separadas.

Preservados main, PR #3, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto, WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.

Referências técnicas consultadas: [Miniflare modules](https://developers.cloudflare.com/workers/testing/miniflare/core/modules/) e [Workers RPC](https://developers.cloudflare.com/workers/runtime-apis/rpc/), em 25/10/2026. A validação deste pacote decorre dos testes locais, não de documentação por si só.
