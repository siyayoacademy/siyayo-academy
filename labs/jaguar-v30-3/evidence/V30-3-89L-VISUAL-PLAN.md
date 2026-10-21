# SIYAYO V30.3.89L — auditoria visual de navegador (EN/ES/PT × desktop/portrait)

## Objetivo e origem
Capturar seis estados do **Explorer real do código-fonte fixado** em `c7e83709cacf8479847df0f3cee4ed8a563aaae6` por servidor HTTP local do GitHub Actions: 1440×900 desktop e 390×844 portrait, alternando os três idiomas. Este teste **não é o Pages de produção**; a identidade de versão do Pages/preview remoto não foi comprovada.

## Procedimento
O navegador headless Chrome tenta abrir Experience, iniciar NICK **sintético** `VISUAL-LAB-89L`, selecionar EN/ES/PT e expandir o componente `#learningTrailWordPathModule`. Faz captura completa da página e captura do módulo; relatório inclui estado visível do Trail, marcador, presença da matriz e rolagem horizontal interna, dimensões de documento e viewport. Os resultados ficam em **artifact** no GitHub Actions.

## Interpretação
- Não reivindicar homologação manual a partir de screenshot automatizado.
- A matriz Word Path pode ter rolagem interna legítima; distingui-la de overflow horizontal da página inteira.
- `○/◐/●/★` do Trail são estados do avaliador longitudinal; `○/◐` de observações não criam Green Pass.
- Um aluno sintético novo pode estar em `0/3`. Este teste não deve fabricar `2/3` ou `3/3` nem modificar o avaliador para obter uma imagem específica.
- A avaliação do cenário `2/3` com transferência pendente exige evidência canônica homologada ou um **fixture visual explicitamente rotulado** e isolado.
- Se a automação não conseguir abrir uma interface, **deve registrar bloqueio**, nunca alegar que ela foi validada.
- Nenhuma ação na Cloudflare, Access, Workers, Pages ou D1; nenhuma cobrança. 12 gates externos permanecem bloqueados.

## Artefatos e próxima etapa
Workflow `.github/workflows/jaguar-v30-3-visual-capture-89l.yml` → artifacts `siyayo-89l-visual-6-cases` (capturas e `report.json`). Confirmar o próprio CI e só depois comparar as imagens com prints reais do usuário antes de uma eventual homologação.
