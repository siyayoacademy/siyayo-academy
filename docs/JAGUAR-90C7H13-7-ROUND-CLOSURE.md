# JAGUAR 90C.7H.13.7 — Fechamento controlado da rodada

## Critério da rodada
Auditoria cruzada do circuito WHICH S1 CHOICE + USE (2/3) → navegação livre EN/ES/PT e S1–S4 → retorno ao contexto S2 e transferência após resposta válida (3/3).
Uma escolha incorreta em S2 mantém 2/3. Somente um evento avaliado pelo contrato pode produzir GREEN_PASS.

## Fontes de verificação independentes
1. **Contrato canônico:** `AdaptivePassContractProgressView.project` + evidências e assessmentScope vinculados ao mesmo NICK, skill, idioma e origem.
2. **HOW TO SHOW — Learning Trail:** `learner-trail-contract-progress`, `data-assessment-skill`, `data-assessment-language`, QW visível.
3. **HOW TO SHOW — Word Path:** célula `which.use.determiner` por idioma, leitura de progresso 3/3 com origem preservada.
4. **PATITA:** duas observações S2 de resultado da transferência (falha e acerto), ambas `observationOnly` e sem autoridade para Evidence/Green Pass.
5. **Após conclusão:** alternar para WHERE, trocar idioma de apresentação, conferir 3/3 persistente no Word Path e retornar para WHICH; não obter novo crédito pelo simples retorno.

## Ferramentas
`scripts/experimental-patita-h13-7-crosscheck.py` e `.github/workflows/jaguar-patita-h13-7.yml` avaliam EN/ES/PT no Chromium (retrato 390×844) e regressões.
Capturas e JSON ficam em artefato do GitHub Actions se o job de navegador concluir.

## Escopo e pendências assumidas
O GREEN do gate, quando concluído, valida esta cadeia WHICH nas rotas percorridas. Não declara homologação de todas as 14 QWs, todos os tempos, modos ou Perspectives, nem autenticação por NICK, recuperação automática após reload ou persistência D1.
Nenhuma alteração nos contratos avaliativos foi incluída neste H13.7. Não publicar/mesclar em main, PR #3, Worker/D1 ou Cloudflare Pages.
As propostas EXISTENCE da Master VIP permanecem referenciais, com autoria contextual pendente.

## Próxima etapa após aprovação
Revisão humana das capturas EN/ES/PT em portrait e desktop e planejamento da ampliação a WHAT, WHERE, WHY e as demais QWs somente com contratos autorizados.
