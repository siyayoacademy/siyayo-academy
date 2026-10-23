# JAGUAR 90C — HOW TO SHOW · LEARNING TRAIL · WORD PATH

**Status: auditoria por CI em ramo isolado, não homologação visual humana nem produção.** Origem `f221f351143f5e2517313f69601bff76dbbe4172`. Acordos exatos em `docs/SIYAYO-HOW-TO-SHOW-POSSIBLE-QUESTIONS-RESPONSES-CONTRACT.md`.

## Acesso, pedagogia e divisão de responsabilidades
1. A pergunta autorizada aparece em **um único cartão integral** com **speaker SVG dourado dentro** da pergunta, sem divisor. QW dourada atômica somente se não entregar a resposta.
2. **Cada resposta** ocupa uma linha inteira em duas regiões: speaker à esquerda (fala apenas) e botão avaliativo à direita (pode produzir um Attempt apenas sob contrato autorizado). O azul escuro preserva opção incorreta/exploratória/assistida; o verde avaliativo fica reservado a acerto independente aceito, sem atribuir Green Pass a clique qualquer.
3. LINES mantém corpus sem cabeçalhos redundantes visíveis, com roles preservadas por ARIA. EN/ES/PT e corpus original preservados.
4. **Learning Trail e Word Path** são projeções SOMENTE de evidência canônica de aluno/QW/idioma/origem. Família e gramática legíveis em linhas separadas, `POR QUÉ` (ES) e `POR QUÊ` (PT) sem quebra; tabela rola dentro do painel. 0/3→2/3→3/3 é do Pass Contract, não de CSS, visita, NEXT ou speaker.
5. WHERE continua `isolated-candidate`, apoio áudio vale apenas após `onstart` real e não concede crédito automaticamente. CUÁL/CUÁLES e QUAL/QUAIS são exploração livre e não integram crédito WHICH.

## Gate 90C · somente PORTRAIT
- Reexecutar invariantes canônicos de WHICH, WHAT, WHERE, WHY, NICK/retention, REVIEW e NEXT a partir de `f221f35`.
- Playwright `scripts/experimental-90c-what-where-portrait.py` (derivado de 89X.2 sem eliminar asserts): 390×844 EN/ES/PT WHAT 2/3 → WHERE 2/3 → WHAT 2/3 restaurado, confirmação de origem e idioma; perguntas e respostas visualmente distintas, speech-only, LINES, Trail e Word Path.
- Playwright `scripts/experimental-90c-why-trail-portrait.py` (derivado de 89U): WHY S3 2/3, S4 antes de responder 2/3, S4 após transferência válida 3/3 e Green Pass, com Trail e Word Path refletindo o estado e áudios sem evidências.
- Playwright `scripts/experimental-89z-portrait.py`: ES/PT singular/plural com feedback exploratório e nenhuma mudança canônica.
- Evidências: imagens reais renderizadas em GitHub Actions, não ilustrações; retenção 14 dias. A aprovação humana dessas imagens e áudio físico é etapa **90C.1**.
- Segurança: `labs/jaguar-v30-3` preservado bit a bit na árvore `5ee77257551593b8e4960dd6971cc7ed069fcd56`. 12 barreiras externas ainda BLOCKED. Sem Access/Worker/D1 remoto, `main`, PR #3 nem deploy de produção.

## Ordem de promoção obrigatória
90C CI → 90C.1 preview isolado e homologação portrait → 90D staging com 12 gates externos e autorização separada → 90E PR #3 e produção somente após revisão e autorização final. Fora de escopo pendente: demais QWs, PRESENT ampliado, PAST/FUTURE e AFFIRMATIVE/NEGATIVE/INTERROGATIVE cruzados com Experiências e Contextos.
