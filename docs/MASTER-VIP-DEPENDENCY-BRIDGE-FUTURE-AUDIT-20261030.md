# MASTER VIP × SIYAYO Dependency Focus — auditoria e referência futura

Data: 2026-10-30. Estado: **AUDITADO / ESPECIFICADO PARA O FUTURO — NÃO IMPLEMENTADO**.
Escopo: planejamento reutilizável no Master VIP, sem modificação do Explorer, sua avaliação, D1, main ou publicação.

## Motivação e decisão autoral
A matriz original de construção de frases **QW | AUX. | SUBJECT | VERB | THE REST**, no bloco MVP17 — VERB TO BE / MAKING QUESTIONS, é complementar ao Dependency Focus do SIYAYO Academy e ao Thinking Mind/QWs. A primeira oferece posições de construção; Dependency Focus investiga tokens, classes, heads e dependências; Thinking Mind oferece a QW, intenção e contexto em foco. **Posição em coluna não equivale a classe ou relação sintática.** Não confundir pergunta interrogativa com presença obrigatória de QW lexical.

## Evidência conferida (branch de referência histórica, sem cópia)
Repositório `siyayoacademy/siyayo-academy`, branch `jaguar/verb-explorer-resume-live-wire`:
- `js/verb-explorer.js` — carregamento de mapas de dependências e contexto do Verb Explorer.
- `css/verb-explorer.css` — superfície `.dependency-focus-surface`, tokens, Head Probe e apresentação responsiva.
- `data/learning/dependencies/shopping-which-en.json` — frase “Which cheese should we choose?” com tokens, classes, relações `head/dependent/relation` (`det`, `obj`, `aux`, `nsubj`), pedagogy e `read-only-focus`.
- `data/learning/dependencies/preparing-which-en.json` — “Which carrots should we cook first?”, inclusive relação `advmod`.
- `docs/SIYAYO-WORK-MAP.md` — governança e correção `DEPENDENCY-DEFERRED-SVG-01`: não validar medições SVG 0×0 ou 1×1; esperar dimensões positivas e finitas; preservar overlay válido. Registra separação de Thinking Mind, Word Path, Head Probe, contratos e evidências.
A referência registra a arquitetura observada; **não** afirma que todos os arquivos do Explorer estejam homologados ou integrados à main.

## Contrato reutilizável proposto
- **HOW TO DO:** fonte/campo da Master → construção flexível da frase → QW/contexto/intenção → tokenização e vínculos de dependência por idioma; PRESENT/PAST/FUTURE e AFFIRMATIVE/NEGATIVE/INTERROGATIVE permanecem explícitos; não preencher resposta de exercício sem autorização pedagógica.
- **HOW TO RECORD:** guardar enunciado original, edição, modalidade, cinco campos, tokens, `wordClass`, `head`, `dependent`, `relation`, locale, proveniência e versão de contrato. Separar fonte original, proposta editorial, análise sugerida e respostas do aluno.
- **HOW TO SHOW:** módulo expansível e opcional de construção (QW/AUX/SUBJECT/VERB/THE REST), seguido da lente de análise com SVG responsivo e Head Probe; usar paleta homologada, EN→ES→PT, speaker no idioma correto e âncora de slide; oferecer alternativas para visão reduzida/sem SVG; evitar densidade excessiva em portrait.
- **HOW TO CHECK:** testes de integridade dos IDs, concordância/modalidade, relações e núcleos por idioma; responsividade AUTO/PORTRAIT/LANDSCAPE, medição SVG diferida, rolagem, speech e impressão A4; revisão humana do contexto e separação inequívoca entre exploração e avaliação.
- **HOW TO SPEAK:** cartões e frases por idioma, sem fala automática ou crédito avaliativo só por reproduzir áudio.
- **HOW TO INTEGRATE:** usar contratos/JSON e adaptadores versionados; não copiar JS/CSS completo ou misturar as branches. Dependências de dados e responsabilidade avaliativa permanecem com contratos específicos do Explorer, jamais atribuídas automaticamente ao Master VIP.

## Limites de autoridade
Dependency Focus e Thinking Mind **observam e explicam**, não concedem Green Pass, evidência, progresso, crédito ou alteração de D1. Head Probe e respostas livres exigem a própria autoridade contratual. Materiais originais e correções editoriais da Master não são modificados silenciosamente. Reutilização depende de análise contextual, tradução e homologação independente.

## Continuidade editorial
- MVP17 Making Questions: 50 exercícios + orientação = 51 unidades, catálogo 0.15.0 com 797 unidades na branch Master VIP; preview Cloudflare observado e exercício 01 e 02 conferidos. Conservam-se os overrides “Nikola Tesla/an inventor.” e “Jair and Bia/politicians.”, sem substituir a fonte.
- Ainda pendentes: quadro de cinco campos na apresentação, prova física A4, conferência integral dos 50 exercícios, associação granular ao DOCX canônico.
- **Próximo ELO editorial: MVP18 — Use Interrogative Form, a partir de P04432.** O Dependency Bridge permanece backlog futuro, não bloqueia MVP18.
- Referência deste registro no mapa principal e no checkpoint de governança. Sem merge em main, sem publicação, sem alteração do D1.
