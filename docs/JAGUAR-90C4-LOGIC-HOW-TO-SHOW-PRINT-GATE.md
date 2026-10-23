# JAGUAR 90C.4 — Coerência de apresentação versus autoridade avaliativa

**Origem:** relato humano do preview Cloudflare 90C.2, 23/10/2026; screenshots S3/S4 com NICK `why s3 s4`, históricos WHICH/WHAT/WHERE e anotação WHERE salmon. **Escopo:** branch experimental isolada, sem merge, sem deploy Pages e sem alteração de contrato/evidência.

## PERAÍ 1 — WHY S3/S4
Nas capturas, LINES exibe as respostas corretas do corpus `Because we prepared it together.` e `Because we enjoy talking together.`, mas Trail exibe **EXPLORING WHY · ASSESSMENT WHAT**. Código verificado: `#livingLines` só chama `speakText`; `#whyAssessmentPanel .why-probe-option` é que produz evento, Result, Evidence e Attempt após sessão WHY autorizada. `HEAD IDENTIFIED` é observação livre sem concessão de Green. Portanto, não pintar LINES de verde nem computar click de áudio como acerto. O `03 / 03` de LINES conta frases, não o contrato 0/3→3/3.

**ELO 90C.4:** novo `js/verb-explorer-visible-assessment-boundary.js` SOMENTE de apresentação explica a separação, indica QW visível versus QW/idioma de contrato e direciona ao painel de avaliação quando ativo. Nenhuma chamada a `submitObservedAttempt`. Confirmar também o caminho explícito para iniciar WHY com NICK recente em S3 e retomar em S4. Não reiniciar WHAT/WHERE salvos automaticamente.

## PERAÍ 2 — WHERE, anotação POSSIBLE RESPONSES
Screenshot destaca `We can find the salmon at the fish counter.`. O painel WHERE em `js/verb-explorer-where-assessment-live.js` monta independentemente áudio `.where-probe-audio` e resposta avaliativa `.where-probe-option`. CSS existente só aplica verde quando `aria-pressed=true` e `data-assertive=true` (pass + support=none). Investigar em browser real se botão, evento, scope, suporte de áudio onstart, estado no Trail e cor verde concordam. **Não** impor verde a toda frase correta ou a tentativa assistida.

## Formula geral para cada QW × Experience × idioma × TENSE × MODE
`PROVENANCE → CORPUS → CONTRACT/AUTHORITY → RUNTIME OWNER → ACTION CHANNEL → RESULT → EVIDENCE → PASS CONTRACT → HOW TO SHOW → TRAIL/WORD PATH → SHARE/PRINT → REGRESSION/HUMAN ACCEPTANCE`.

Gate por célula: versão SHA+fonte; pergunta/resposta/distrator fundamentados; target autorizado ou livre; learner/NICK/idioma/origem; click áudio versus resposta; support sensor; Result e Attempt únicos; contrato parcial 0/3→3/3; cartões separados e geometria responsiva; verde só com assertividade aprovada; painel Trail/Word Path somente leitura; relatório SHARE/PRINT reproduz dados auditáveis sem criar evidência; desktop/portrait/landscape, teclado, leitor e áudio EN/ES/PT; discrepância STOP/PERAÍ com snapshot antes/depois.

**Estado:** Stage 90C.4 experimental; implementação do aviso de autoridade foi enviada ao GitHub, teste unitário adicionado, CI ainda precisa ser confirmado. SHARE/PRINT e gate matricial estão mapeados e **não implementados** por esta etapa. A matriz deve ser ampliada progressivamente para 14 QWs e 3 tempos × 3 modos, sem inventar contratos.

**Preservação:** V30.3→89Z→90A→90C.3 e as marcas homologadas ficam intocados; `main`, PR #3, Worker/D1 remoto e produção NÃO alterados. Os 12 controles externos continuam bloqueados.
