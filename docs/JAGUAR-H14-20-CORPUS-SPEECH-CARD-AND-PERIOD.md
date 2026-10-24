# 🔔🐆 JAGUAR H14.20 — Corpus Speech Card HOW TO SHOW
## Verificação do anexo do professor
A imagem de referência apresenta **TIPO A — Corpus Speech Card**: o cartão inteiro é um controle de áudio, o speaker dourado ocupa a região esquerda e a frase fica **centralizada no cartão inteiro**. A linha das cinco funções é apresentada abaixo da fala. O FUNC-13 adota essa composição no LAB independente H14.20.

### Hierarquia visual homologável
**Linha 1 — Speech Card inteiro clicável:** um único `<button>`, SVG dourado à esquerda, coluna central de texto e coluna de equilíbrio à direita. Esse espaço simétrico impede que o speaker desloque o centro da frase. A etiqueta discreta da fonte continua marcada como `SIYAYO_ADAPTATION / PENDING_HOMOLOGATION`. Somente a frase textual pode ser pronunciada, nunca um status nem um parecer de avaliação. A falta de frase autorada ou suporte à síntese de voz desabilita o cartão.

**Linha 2 — Cinco funções:** QUALITY / STATE / MOVEMENT / ACTION / EXISTENCE, horizontal e com scroll próprio em portrait; clicar escolhe a função somente no estado visual do laboratório.

**Linha 3 — Estudo Fino em três cartões:** **1 FUNÇÃO — Master VIP**, **2 CONTEXTO — Experience × Perspective**, **3 ESTUDO FINO — Coerência da relação**. Trata-se de uma terceira **faixa**, não uma terceira frase nem uma resposta canônica. No desktop há três colunas; em portrait as três áreas ficam empilhadas, preservando legibilidade.

### Speech e responsabilidade
A ação de toda a primeira linha usa a API `SpeechSynthesisUtterance` com `en-US`, `es-ES`, `pt-BR`; não grava nem concede crédito. Usa o SVG correspondente ao speaker tradicional do Explorer. O áudio depende das vozes instaladas no navegador e deve ser verificado em dispositivo real. Os exemplos H14.7 permanecem candidatos em estudo; apresentação audível não implica homologação pedagógica.

### Evidência GEAR STACK — PERIOD
A falta de `PERIOD` foi registrada como dívida arquitetural `GEAR-06-PERIOD-GAP`. É uma **prioridade geral do Gear Stack**, distinta das cinco funções. Primeiro é preciso definir a semântica de PERIOD e como o contexto temporal e H14.12 autorizam sua apresentação. Nenhum novo controle PERIOD foi adicionado neste ELO.

### Limites deliberados
Esta é **somente uma página de laboratório**; nenhuma modificação em `verb-explorer.html`, Explorer Runtime, CSS oficial, PATITA, Learning Trail, `main`, PR #3 ou Cloudflare. O FUNC-13 continua **OCULTO na navegação normal**. A posição no HTML final está pendente de homologação.

O teste automatizado mede estrutura, centralização e interações em Chromium simulado quando executado no CI; não substitui inspeção humana de estética e qualidade real das vozes.
