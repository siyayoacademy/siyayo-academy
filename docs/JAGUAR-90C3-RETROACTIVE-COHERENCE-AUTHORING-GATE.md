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
