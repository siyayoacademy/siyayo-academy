# Master VIP — MVP11: leitura e speech modular

29/10/2026. Escopo exclusivo da branch jaguar/master-vip-modular-site-print-20261026.

A ressalva do professor é o contrato: o cartão textual inteiro é o botão nativo, acionável também por teclado. Speaker SVG dourado decorativo à esquerda; texto centralizado. Sem botões separados para repetir/parar. Novo clique cancela a leitura anterior e reinicia a selecionada. Navegação, ocultação, saída da página e Escape cancelam. Sem autoplay.

## HOW TO DO / HOW TO SPEAK

Referência conferida: branch jaguar/verb-explorer-resume-live-wire, commit c7e83709cacf8479847df0f3cee4ed8a563aaae6. js/verb-explorer.js: renderLivingLines e livingLines.onclick; css/verb-explorer.css: .living-line, .living-line b e .siyayo-speaker. Mesmo SVG em máscara, coluna esquerda e cartão inteiro clicável. js/app.js fornece rate 0.92, pitch 1 e volume 1. O controlador é independente; os hooks WHERE/avaliação da referência não foram importados.

Um controlador compartilhado atende os cinco destinos disponíveis. Os 374 slides mantêm IDs; 372 possuem texto falável, totalizando 1.540 alvos identificáveis. As duas referências vetoriais sem texto não recebem áudio artificial. EN/ES/PT usam en-US/es-ES/pt-BR; não foram inventadas traduções ausentes. Exercício não lê gabarito fechado. Normalização de pontilhados e glifos decorativos não corrige o original.

## HOW TO SHOW

Subcontêineres distinguem explicação, exemplo, exercício, resposta, quadro e descrição da figura. Corpo explicativo: 21px desktop, 20px portrait, entrelinha 1.65. Exemplos/exercícios têm escala própria. Preservados Quicksand/Nunito Sans, azuis/dourados, fontes e imagens. Tabelas largas rolam internamente.

## HOW TO RECORD / HOW TO CHECK

Registro derivado: docs/master-vip-presentation-registry.v1.json. O script scripts/build-master-vip-presentation-registry.cjs registra IDs, idioma, função, origem disponível e hash do texto sem criar conteúdo concorrente.

IMPLEMENTADO: HTML/CSS/JS e registro acima. TESTADO LOCALMENTE: testes de regressão existentes e test-master-vip-speech.cjs passaram. Harness DOM local conferiu as 374 unidades, 1.540 cartões e 1.540 textos de impressão, sem perda de texto, controles aninhados ou speaker/botões de áudio no print. Portrait: largura útil 375px, largura da página 375px, corpo explicativo 20px/33px; desktop 21px. Cancelamento e eventos atrasados conferidos com mecanismo de voz simulado.

PENDENTE: confirmação audível no navegador do usuário. O navegador deste laboratório expôs zero vozes e retornou synthesis-failed; não foi possível homologar som, pronúncia ou qualidade de voz. PENDENTE: homologação humana visual e prova física A4. Print usa apresentação independente e preserva seleção de gabaritos; PDFs existentes não foram regenerados.

HOMOLOGADO: não. INTEGRADO AO EXPLORER: não. Catálogo permanece 0.9.0, 374 unidades e 10,2245% dos caracteres textuais da fonte; este lote não importa novos trechos da apostila. Próximas importações adotam o componente e exigem revisão de idioma/origem.

Main, PR #3, contratos avaliativos, PATITA/NICK, D1 e produção não foram alterados. Supervisão contínua não foi instalada.


## JAGUAR-MVP-11.2 — homologação e continuidade

29/10/2026: professor homologou o padrão visual e confirmou áudio funcional nos cartões revisados, incluindo classe com inicial maiúscula e quebra de linha antes do exemplo. Este registro atualiza os estados históricos de pendência acima somente nesse escopo; conteúdo integral e A4 físico não estão homologados. Guia vigente HOW TO DO/RECORD/SHOW/CHECK/SPEAK: [Work Map](SIYAYO-WORK-MAP.md). [Checkpoint](master-vip-jaguar-checkpoint.json) e [referência XPR](master-vip-xpr-handoff.json). Prioridade primária: importar o restante da apostila com o componente aprovado. NEXT GO: MVP12, P02430 QUALITY & STATE; não repetir auditorias concluídas ou abrir arquitetura paralela.
