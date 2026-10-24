# JAGUAR H14.22 — Teste visual funcional do FUNC-13 centralizado

Objetivo: validar em Chromium o padrão toroidal centralizado: **linha 1** Corpus Speech Card Tipo A (SVG dourado esquerda, frase centralizada no cartão, cartão inteiro clicável), **linha 2** cinco funções com grupos/linhas centralizados sem cortes, **linha 3** Função, Contexto e Estudo Fino centralizados em três colunas no desktop e empilhados no portrait.

A suíte valida 1440×900, 768×1024, 390×844, 320×700 e 844×390; ausência de transbordamento de página; alinhamentos em pixels; seleções de todas as funções; alternância EN/ES/PT; origem exata do texto; bloqueio de áudio para negativas ou passado não autorados; memória temporária da função por Experience; ausência de Gear PERIOD; coleta de capturas em `artifacts/h14-22`.

O teste de áudio substitui a API de síntese por uma instrumentação determinística para conferir eventos `speak`, texto e idioma. **Não equivale à audição humana da voz** em um dispositivo físico. Do mesmo modo, capturas e checks automatizados não equivalem à homologação estética pelo professor.

Arquitetura: FUNC-13 permanece oculto na navegação normal, exclusivamente como laboratório; não alterar HTML ou runtime oficial, PATITA, Learning Trail, QWs, avaliação, `main`, PR #3, produção ou Worker/D1. `GEAR-06-PERIOD-GAP` segue como pendência separada.
