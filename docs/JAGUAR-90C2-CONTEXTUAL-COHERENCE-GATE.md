# JAGUAR 90C.2 · Verificador permanente de coerência CORPUS → HOW TO SHOW

**Origem:** inspeção humana homologada de seis prints PORTRAIT S3 e S4 para EN/ES/PT. **Commit-base:** `53c6dc9b8039937bc5f6bf13e800cd5e08c5b5da`. **Escopo autorizado:** três refinamentos; sem modificar os contratos/evidências de WHICH, WHAT, WHERE, WHY nem produção.

## Peraí comprovado
`experienceLines()` mostrava a pergunta WHY sobre o jantar/conversa, mas `canonicalExperienceLine()` recuperava a sentença genérica de conjugação do verbo `eat/talk`, por exemplo "I eat breakfast every day." Isso **não** é resposta contextual à pergunta WHY, embora o avaliador e Green Pass fossem válidos. Precisamos de verificador de **coerência semântica da autoria** independente do avaliador.

## Mudanças
1. `js/verb-explorer-contextual-coherence.js`: fonte de resolução **somente leitura**. Para WHY em PRESENT/AFFIRMATIVE, recupera question + accepted reason da mesma Experience, `reasonGrounding.acceptedReasonId`. Falha fechada em falta de grounding, resposta, tradução ou ID único. Para outros tempos/modos não autorados, apresenta **aviso de autoria pendente sem speaker de falsa resposta**, nunca inventa diálogo.
2. PT concordância: o sujeito nominal `jantar` (masculino) não pode ser retomado por `a`; `Porque preparamos o jantar juntos.` permanece em `prepared-together`, sem mudança de identificadores ou pontuação. ES `Porque la preparamos juntos` retoma `la cena`, feminino, adequado.
3. Word Path: ordenar `QUESTION WORD → IDIOMA DA AVALIAÇÃO → outros idiomas` por `scope.language` (se válido; caso contrário, idioma exibido), com primeira coluna sticky e scroll somente na tabela. Nenhum registro, escopo, origin, evidencia ou histórico é reescrito.

## Verificador reutilizável para ELOs futuros
O teste `scripts/test-jaguar-contextual-coherence-90c2.js` e a auditoria PORTRAIT `scripts/experimental-90c2-contextual-portrait.py` fazem parte do gate obrigatório de 90C.1, 90D, 90E e novas QWs.

**Toda pergunta-resposta contextual requer**, antes de HOW TO SHOW: Experience de origem, questionWord, target/dimension e suporte, texto por EN/ES/PT, ID canônico/autor do grounding, validade para tempo e modo, adequação gramatical da resposta, preservação do contraste correto versus distrator, bloqueio explícito das combinações não autoradas e a separação entre exploração e avaliação. Falta em qualquer requisito é **STOP / corpus gap**, nunca copiar uma sentença lexical genérica nem conceder crédito com efeito visual.

**Invariantes:** 3/3 WHY somente após transferência válida S4; S3 2/3 não vira 3/3 por abrir Trail, responder livremente, ouvir áudio ou clicar NEXT. `POR QUÉ` e `POR QUÊ` preservados. NICK/idioma/origem e quatro QWs preservados. Não alterar 12 controles externos bloqueados nem considerar PAST/FUTURE homologados.

O código está em branch experimental. Segue-se **novo preview estático PORTRAIT e homologação humana**; a antiga branch preview `jaguar/explorer-portrait-preview-90c1` continua intacta como comparação.


## Peraí 90C.2.1 — inventário obrigatório das lacunas S1/S2
O verificador encontrou **6 lacunas de autoria** (S1 Shopping e S2 Preparing × EN/ES/PT), sem `reasonGrounding` WHY completo. Estas não são aprovações e não devem ser mascaradas como corpus fundamentado. A auditoria rejeita qualquer lacuna em S3/S4 e também rejeita novas lacunas fora do inventário S1/S2. Para S1/S2, o renderizador mostra aviso não-autorável quando houver WHY sem grounding, evitando sentença genérica tratada como resposta. A futura expansão dessas perguntas necessita autorização de novos contratos e corpus contextual. A pontuação avaliativa existente segue independente.


## 90C.2.2 · Browser RED initial: sequence S1→S2→S3 must await navigation
Run 39887385284: authority CI PASS but strict portrait RED 0/3 because script clicked NEXT twice without awaiting intermediate S2; second click may be dropped during render and timeout followed. Browser test fixed with explicit S2 navigation wait; no production evaluator modification. Retest required before green.


## 90C.2.3 · Root cause: premature NEXT click before runtime wire
Run 39887584937 failed from S1 because the new browser audit waited for a runtime symbol but **not** for `#nextExperience.onclick` wiring. Screenshot proved the page remained in Shopping with no learner, not an incorrect WHY answer. Fixed to wait for installed click handler, as already used in GREEN 90C script. No pedagogical runtime changed. Rerun required.
