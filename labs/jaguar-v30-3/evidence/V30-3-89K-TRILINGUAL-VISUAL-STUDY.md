# JAGUAR V30.3.89K — HOW TO SHOW · estudo trilíngue e responsividade

**Proveniência:** leitura de fontes canônicas no commit fixo `c7e83709cacf8479847df0f3cee4ed8a563aaae6`, mais teste do observador do laboratório. **Nenhuma alteração nos arquivos JS/CSS oficiais.**

## Comportamentos constatados no código
- O Word Path localiza em EN/ES/PT os cabeçalhos, estados salvos e a advertência de que a exploração livre não concede pontos.
- Sua tabela mostra **4 QWs canônicas, 3 colunas de idioma**, 12 células. Não apresenta progresso fictício `0/3` em células de contratos que não começaram.
- Registros de avaliação por escopo/idioma são distintos. Um `WHAT · EN · 2/3` salvo não significa `WHAT · ES · 2/3` ou `WHAT · PT · 2/3`.
- `learner-trail` possui texto de ajuda ○ ◐ ● ★, diferente de CHOICE/USE/TRANSFER ○/●, em cada idioma. O código diferencia o idioma de apresentação daquele pertencente ao contrato.
- Há região de rolagem horizontal com `tabindex=0`, `role=region`, destaque `:focus-visible`, redução de movimento e CSS `@container` para largura reduzida.
- O módulo Word Path inclui registro local `PATITA` de observações contextuais, indicado como **sem crédito avaliativo**; isso é separado de evidências aceitas e do teste D1 85D/85E.

## Divergências / lacunas a estudar antes da homologação visual
- O `aria-label` da sequência de Experiences está literalmente em inglês: `Visited learning experiences`, mesmo quando o idioma exibido é ES/PT. **Candidato de acessibilidade, não patch aprovado**.
- A tabela reduz `min-width` a 322px abaixo de 480px; pode rolar horizontalmente. Estar presente no CSS não garante boa leitura/gestos em smartphone real.
- Checar visualmente as palavras em ES/PT e no modo portrait, sobretudo linhas longas e separação entre a coluna EN e cabeçalhos.
- Conferir, com exemplo de contrato real, `DISPLAY ES · ASSESSMENT EN`, `●●○ · 2/3`, e `S1 ● confirmado → S2 ○ 0/3`. Teste estático **não comprova o resultado visual em aparelhos**.
- A lista de 14 QWs maior não significa 14 contratos avaliativos completos; este painel só cobre WHICH/WHAT/WHY/WHERE.

## Como verificar
`node --test test/trilingual-visual-contract-89k.test.mjs` no diretório `labs/jaguar-v30-3` com `SIYAYO_89K_PINNED_ROOT` apontando para checkout isolado do commit oficial. GitHub CI usa checkout imutável no mesmo repositório, sem publicação nem integração automática.

**Autoridade:** snapshots observacionais e eventos PATITA não podem gerar CHOICE/USE/TRANSFER, progresso aceito, Green Pass ou qualquer alteração no Learning Trail canônico.

**Governança:** Zero Trust Free permanece pendente sem contratação; staging D1 e Worker não criados. 12 gates externos bloqueados. Produção `main`, Explorer oficial e Worker `shiny-scene-4b76` intactos.
