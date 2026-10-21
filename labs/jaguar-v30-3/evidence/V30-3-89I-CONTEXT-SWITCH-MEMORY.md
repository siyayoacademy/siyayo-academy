# JAGUAR V30.3.89I — Navegação livre e memória observacional (laboratório)

**Status:** teste sintético offline; não instalado no Explorer oficial. Segue a decisão 89H de **adiar Zero Trust Free sem contratação, cartão, Worker ou D1 remotos**.

## O que a nova suíte verifica

- **EN → ES → PT → EN:** os registros sintéticos por idioma ficam armazenados isoladamente; ao retornar ao idioma anterior, a observação persistida é recuperada após fechar e reabrir o SQLite.
- **WHAT → WHERE → WHAT:** nenhuma mudança de QW apaga ou transfere observações entre QWs. As células não observadas permanecem vazias.
- **Shopping S1 → Preparing S2 → Having S3:** cada registro conserva seu `originExperienceId` autorizado, enquanto `currentExperienceId` documenta cada etapa de transferência.
- **Nova origem pedagógica:** uma origem distinta é recuperada somente quando a política servidor a autoriza. Alternar de volta recupera a origem anterior, sem misturá-las por acidente.
- **Versão de contrato:** alterar a versão filtra os registros exibidos; não reatribui ou apaga eventos da versão anterior.
- **Identidade:** NICK pode ser alterado e repetido entre alunos. Somente o sujeito verificado sinteticamente pelo *server* controla as leituras. Expiração/revogação de sessão sintética bloqueiam recuperação até nova sessão de teste.
- **Integridade:** replay idempotente, conflito de UUID entre escopos, campos forjados, idioma não autorizado e progressos artificiais falham sem escrever novo registro.
- **HOW TO SHOW:** selecionar idioma, QW ou Experience limpa a vista anterior e carrega somente um snapshot autenticado pelo transporte simulado `GET` same-origin e sem cache. A vista jamais envia JWT, NICK, QW ou usuário como autenticação.
- **Assessment ≠ observation:** `pending` / `observed_exploratory` produzem apenas marcadores de observação (`○/◐`); `acceptedProgress = null`, `confirmed = false`, `greenPass = false`.

## Limite de interpretação

A matriz de observações atual tem **4 Question Words exibidas × EN/ES/PT = 12 células**. As 14 QWs do modelo amplo são um universo de navegação, não 14 contratos avaliativos implementados. O painel 85E agrega contagens das políticas aprovadas pelo servidor num único snapshot de 12 células; não representa a lista canônica completa de palavras nem o Learning Trail/Word Path de evidências aceitas.

Mudança de idioma, QW ou Experience aqui é **seleção e consulta sintética**, não mudança real de configuração do navegador do aluno nem proof de Cloudflare Access. Reautenticação, JWKS, políticas reais e staging seguem com as **12 barreiras externas bloqueadas**.

O fluxo visual e pedagógico homologado do Explorer permanece na referência `c7e83709cacf8479847df0f3cee4ed8a563aaae6`; não são modificados o runtime, `main`, Pages, `shiny-scene-4b76`, D1 remoto ou Access. DISCOVER WHY / 7D.3.10 continua como proposta separada.

## Execução
- `node --test test/context-switch-recovery-89i.test.mjs` na pasta `labs/jaguar-v30-3`.
- GitHub Actions, branch exclusivamente `jaguar/v30-3-recovery-archive`, CI de leitura; prefixar commit `[CF-Pages-Skip]` para suprimir build de preview.
