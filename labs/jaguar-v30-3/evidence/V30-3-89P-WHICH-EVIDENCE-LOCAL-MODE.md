# JAGUAR V30.3.89P — qualificação da evidência USE sem afrouxar contrato

**Constatação inicial:** workflow V30.3.89O no commit `12e8829`: os 11 testes do mapa e as 40 asserções do REVIEW passaram. A etapa histórica `scripts/test-which-third-attempt-green-boundary.js` falhou com **esperado GREEN_PASS, obtido WAITING_FOR_EVIDENCE**, antes de rodar WHAT/WHERE/WHY.

**Causa objetiva:** o teste histórico trouxe uma Evidence inicial `determiner-use` de S1 com `result: 'pass'` e `support: 'none'`, mas **sem `mode: 'local'`**. O requisito canônico de USE precisa de `mode: 'local'`; o de TRANSFER precisa de `mode: 'transfer'`. O resultado WAIT é correto diante da evidência incompleta.

## Governança

- **Não modificar** `js/green-pass-profile.js`, `which.json`, o Explorer oficial, `main`, nem o teste histórico.
- Executar o teste histórico intocado como *negative control*: deve falhar **especificamente** por WAITING_FOR_EVIDENCE vs GREEN_PASS.
- Em seguida executar cópia efêmera transformada em `os.tmpdir()`, modificando somente a única evidência USE do fixture para incluir `mode: 'local'`, preservando bytes do arquivo original.
- Demonstrar o estado progressivo 1/3, 2/3, 3/3 e estados negativos: USE sem mode, duplicação de USE local, suporte errado, transfer fail e ausência de transfer mode.
- Confirmar que o bridge de TRANSFER rejeita origem incoerente, Experience igual à origem e escolha diferente, mantendo a separação Green Pass elegível ≠ NEXT automático.
- O resultado **não equivale a Evidence real de aluno**. Os testes fazem validação de modelos e fixtures explícitas, não navegação de aluno autenticado nem captura acústica.

**Validação:** `node --test test/which-evidence-boundary-89p.test.mjs` com variável `SIYAYO_89P_PINNED_ROOT` apontando à cópia imutável, via workflow 89P.

**Encadeamento 89O:** Substituir a etapa **de execução** do teste histórico vermelho por `node --test test/which-evidence-boundary-89p.test.mjs` no workflow 89O; preservar o passo de REVIEW e todos os regressivos de WHAT, WHERE, WHY. Não falsificar GREEN no teste antigo: a execução preservada é parte do controle negativo esperado.

**Segurança:** sem deploy manual, D1, Worker, Zero Trust, pagamento ou publicação na `main`. A Cloudflare Pages conectada ao GitHub pode criar previews automaticamente a partir da branch laboratorial; não tratar como homologação ou publicação oficial.
