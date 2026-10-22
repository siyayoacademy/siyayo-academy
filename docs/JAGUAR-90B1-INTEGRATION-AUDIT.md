# JAGUAR 90B.1 — auditoria cruzada de integração V30.3→89Z

**Status: testes de CI AGUARDANDO verificação; nenhum merge, deploy, PR #3, mudança na main, D1 ou autenticação.** Checkpoint-base b8f5020f739585d08f551f2a6dad27484b34cada. Ramo `jaguar/explorer-integration-gate-90b1`.

## Meta e método

Conferir no mesmo checkout o laboratório histórico V30.3 (árvore Git preservada `5ee77257551593b8e4960dd6971cc7ed069fcd56`) e o Explorer 89U–89Z, sem executar infraestrutura externa nem duplicar o avaliador.

Cada domínio tem rastreabilidade máquina em `data/canonical/siyayo-integration-audit-90b1.json`, com arquivos de teste existentes e bloqueios pendentes. A prova inclui:
- 11 domínios W01–W11: NICK, identidade versus sujeito autenticado, isolamento por QW/idioma/origem, ciclo Event/Result/Evidence/Attempt, WHICH contextual REVIEW, WHAT 2 origens, WHERE onstart/candidato isolado, WHY S3→S4 (0/3→2/3→3/3), NEXT, Trail/Word Path e ES/PT pronomes.
- Testes Node do Explorer contra **código consolidado real**, e testes V30.3 com Explorer fixado original `c7e83709`, para distinguir preservação de comportamento atual.
- Browser Chromium **somente portrait 390×844** para WHICH/WHAT/WHERE EN/ES/PT, WHY S3→S4 EN/ES/PT e gramática ES/PT; áudio de navegador é observado/mockado, **não** validado acusticamente.
- Verificar o arquivo inteiro V30.3 via SHA de árvore no checkout, contratos 3/3 de cada QW, WHERE still `isolated-candidate`, proibição de Green por fala e autorização remota ainda false.

## Fronteiras de aceite

GREEN CI confirma compatibilidade técnica *dessas provas*, não toda a carreira histórica byte a byte (ver `evidence/PROVENANCE.md`), homologação visual, persistência real em D1, autenticação, Cloudflare Access, áudio físico ou aprovação para produção. Não alterar contratos ou testes para mascara falhas. Se uma expectativa histórica se basear em DOM antigo, corrigir seletor referenciando controle avaliativo real e acrescentar regressão negativa de áudio.

### Classificação esperada após testes

| Domínio | Status antes CI | O que permanece PENDENTE |
|---|---|---|
| Evidência canônica S1→S4 e 4 QWs | Testes preexistentes 90B GREEN; 90B.1 aguarda | cobertura por identidade autenticada |
| NICK/memória/Word Path | testes + mapeamento | persistência remota e validação humana |
| HOW TO SHOW Questions≠Responses | navegador 89Y GREEN; 90B.1 aguarda | homologação portrait |
| ES/PT CUÁL/CUÁLES/QUAL/QUAIS | 89Z GREEN; 90B.1 aguarda | português e espanhol em smartphone físico |
| Worker, SQLite, JWT/JWKS, segurança | laboratório histórico preservado | 12 bloqueios externos; staging NÃO autorizado |
| Mais QWs, PRESENT, PAST, FUTURE e AFFIRMATIVE/NEGATIVE/INTERROGATIVE | planejamento registrado | contratos/testes/homologação específicos |

## Regras de promoção preservadas

Próximo 90C após aceitar o resultado 90B.1; 90C.1 preview portrait; 90D somente staging sob 12 controles e autorização específica; 90E somente após homologação e aprovação explícita. Não tocar PR #3, produção ou DB remoto; manter documentos `docs/JAGUAR-90B-TO-90E-MASTER-ROADMAP.md` e `data/canonical/siyayo-integration-roadmap-90b.json` como contrato obrigatório. Evidências visuais GitHub Actions expiram, não tratá-las como arquivo permanente.


## 90B.1.1 · Primeira execução e divergências de proveniência
- Run 39874297023 foi RED inicial. Testes V30 89Q/89R são fail-closed sem `SIYAYO_89Q_PINNED_ROOT` / `SIYAYO_89R_PINNED_ROOT`, e foram executados sem o checkout imutável; workflow corrigido para criar o checkout `c7e83709` e passar ambos os caminhos.
- `scripts/test-which-first-attempt-contract.js` é histórico e espera USE sem `mode`. O corpus vigente exige explicitamente `mode:local` (89P, preservado) para impedir crédito cruzado com TRANSFER. Não afrouxar o contrato para aprovar o teste antigo; ele continua no Git e deve permanecer classificado como legado, enquanto o CI utiliza o teste vigente de uso do determinante. Este é um exemplo de auditoria orientada a proveniência, não de perda de código.
- Revisão browser portrait EN/ES/PT e auditorias seguintes ainda pendem da execução.
