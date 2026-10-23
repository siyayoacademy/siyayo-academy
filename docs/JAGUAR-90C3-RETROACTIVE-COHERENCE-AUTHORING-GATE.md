# JAGUAR 90C.3 — Auditoria retroativa e autoria WHY S1/S2 (somente laboratório)

**Origem:** JAGUAR 90C.2 `a6924981a99ed886cdfecf210cc49d0b850f6e3a`. **Status:** trabalho experimental, não homologado nem implantado. Não altera avaliação, histórico, PR #3, main, Worker/D1 ou Pages.

## Entregável 1 — verificador retroativo
`scripts/test-jaguar-retro-coherence-90c3.js` lê `data/learning/experience-seeds.json` e inventaria por Experience e QW: traduções EN/ES/PT, diálogos tempo/modo, respostas lexicais, candidatos WHICH, razões WHY e lacunas. Executa negativos de tradução ausente e grounding WHY duplicado. Não infere correção semântica por simples presença de strings; não concede `Attempt`, `Evidence` ou `Green Pass`.

**Distinções:** (A) conteúdo encontrado; (B) estrutura íntegra; (C) coerência pedagógica e gramatical revisada; (D) contrato de avaliação autorizado; (E) homologação visual/acústica humana. PASS de (B) não implica PASS de (C/D/E).

## Entregável 2 — inventário de autoria WHY
| Experience | Pergunta EN | Status |
|---|---|---|
| S1 shopping-for-dinner | Why do you prefer this one? | Referente de *this one* depende da seleção concreta; falta `reasonGrounding` com razão, alternativas contrastivas e traduções |
| S2 preparing-dinner | Why are we preparing this dinner together? | Contexto cozinha/cena especial; falta `reasonGrounding` e contrastes canônicos em EN/ES/PT |
| S3 having-dinner | Why is this dinner special? | Grounded em `prepared-together`, PRESENT/AFFIRMATIVE |
| S4 after-dinner-conversation | Why do you enjoy this conversation? | Grounded em `talking-together`, PRESENT/AFFIRMATIVE |

São **duas entradas × três traduções = seis lacunas**. Até a aprovação de autoria, o runtime deve sinalizar conteúdo não autorado; não usar frase lexical genérica.

## Candidatos para estudo, NÃO corpus aprovado
- **S1, somente após resolver referente de `this one`:** EN "Because it is fresh and mild."; ES "Porque es fresco y suave."; PT "Porque é fresco e suave." Exemplo condicionado a *cheese/queso/queijo*, sem alteração do critério WHICH nem invenção de evidência.
- **S2:** EN "Because we want to prepare a special dinner together."; ES "Porque queremos preparar una cena especial juntos."; PT "Porque queremos preparar um jantar especial juntos." Hipótese compatível com `purpose=prepare-a-special-dinner` e `company=together`; requer revisão de tautologia e distrator contextual.

**Antes de escrever em experience-seeds:** definir ID estável e único, pergunta/refente fixado, dimension/target, aceitação e distrator, contexto de origem, tense/mode explicitamente autorizado, revisão idiomática EN/ES/PT e contrato de avaliação independente. Autorizar a autoria final em ELO separado.

## Gate de continuidade
1. Confirmar CI 90C.2 corrigido e capturas Chromium; documentar RED ou GREEN sem confundir causa de navegação com falha pedagógica.
2. Verificar identidade real de deployment do preview 90C.2; link presumido não comprova publicação.
3. Validar S1→S4 portrait e áudio real, Learning Trail/Word Path e WHY 2/3→3/3.
4. Executar este inventário retroativo e revisar respostas de WHICH/WHAT/WHERE/WHY semanticamente, sem alterar evidência do aluno.
5. Somente após homologação, preparar pacote de integração 90D/90E, com os 12 controles externos e autorização específica para staging/PR/main.

**STOP:** não conectar Worker/D1, não modificar runtime avaliativo, nem declarar PAST/FUTURE ou novos modos homologados por existir `dialogueForms`.

## PROVA GREEN: 23/10/2026 (registrada sem ampliar a autoridade)
- **90C.2 run 39887857301**, source commit `a692498`: jobs `authority` PASS e `portrait` PASS. Chromium 390×844: EN, ES, PT 3/3; WHY S3→S4 Trail 3/3; imagens e relatórios no artifact ID `12473725975`, `jaguar-90c2-contextual-coherence-portrait`. A prova inclui ausência de frase genérica em LINES e aviso sem resposta falsa em PAST, mas não valida áudio humano.
- **90C.3 run 39953968467**, source commit `267ffc5`: `retro-coherence` PASS, 4 Experiences, 21 QW entries, 63 textos de pergunta localizados, 45 pares de diálogo tempo/modo encontrados, 6 WHY fundamentados S3/S4 e 6 lacunas WHY S1/S2 inventariadas, sem novas lacunas inesperadas. Verificação estrutural, não chancela semântica universal.
- **Preview isolado:** `jaguar/explorer-portrait-preview-90c2` atualizado em fonte na revisão `d50f091`. As URLs hipotéticas de alias Cloudflare testadas retornaram 404; não há build remoto/deployment SHA confirmados. Não considerar preview publicado nem aceitar homologação visual/acústica real até identificar e abrir um deployment legítimo. Branch antiga 90C.1 permanece intacta.
- **Segurança:** 12 external staging gates BLOCKED; `main`, PR #3, Worker/D1 remotos e produção intocados. Promoção 90D/90E continua bloqueada.

Links de evidência: https://github.com/siyayoacademy/siyayo-academy/actions/runs/39887857301 e https://github.com/siyayoacademy/siyayo-academy/actions/runs/39953968467

**Próximo bloqueio concreto:** diagnosticar/deployar somente o preview estático de branch, comprovar identidade do build e capturar homologação humana portrait/acústica; em paralelo, continuar revisão das propostas de autoria WHY S1/S2 antes de editar corpus.

## Correção factual 90C.2 — Cloudflare Pages LIVE em preview isolado
**Confirmação em 23/10/2026 às 10:07 BRT:** usuário forneceu captura do Cloudflare Workers & Pages com deployment **success**, ID `9a55d7c9-896e-44a2-b8cb-748219ab9b80`, Git commit `776d6e40796a333ad02b553a21998360ea290804` e duração 12s. Logs evidenciam `HEAD is now at 776d6e4`, 305 assets processados (303 já enviados, 2 novos), `Success: Assets published!` e `Success: Your site was deployed!`. A opção `No build command specified`, a ausência de `/functions` e de Wrangler são esperadas nesta publicação estática; não é liberação de Worker/D1.
- **URL imutável de deployment comprovada:** https://9a55d7c9.siyayo-academy.pages.dev/
- **Alias real do Pages comprovado:** https://jaguar-explorer-portrait-pre-9973.siyayo-academy.pages.dev/
- **Rota do Explorer:** https://9a55d7c9.siyayo-academy.pages.dev/verb-explorer.html?mode=experience&experience=shopping-for-dinner
- **Leitura externa independente:** root de deployment e alias retornam título `SIYAYO · JAGUAR 90C.2 · Preview Portrait`; manifesto `preview-manifest.json` e página do Explorer disponíveis. O alias antigo adivinhado `jaguar-explorer-portrait-preview-90c2` não era o alias real e retornava 404. Este parágrafo **substitui a pendência anterior quanto à identidade de implantação**; não reescreve o histórico de investigação.
- **Aceite visual anterior:** usuário informou ter revisado as 15 capturas portrait e considerá-las corretas. Trata-se de conferência de artefatos de CI; **não** atesta áudio real, uso físico de smartphone nem homologação completa do Pages.
- **Gates preservados:** `main`, PR #3, Worker/D1 remoto e produção não recebem mudanças; 12 controles externos bloqueados. Avançar à inspeção da interface online, contraste EN/ES/PT, Word Path, áudio humano e registro explícito de aceite antes de integração.
