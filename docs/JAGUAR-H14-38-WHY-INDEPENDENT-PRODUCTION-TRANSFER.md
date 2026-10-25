# 🔔🐆 JAGUAR H14.38 — Fase 3 · Produção independente e transferência WHY

## Objetivo
Continuação exata da Fase PH3 de H14.35: portões **HG-04** (razão local), **HG-05** (transferência), **HG-09** (revisão independente) e **HG-10** (mediação).

**Status:** especificação de revisão pedagógica, não avaliador de respostas reais e não autorização contratual. Os módulos PATITA-12 e EVAL-08 permanecem separados: PATITA observa; somente o EVAL-08 com contrato específico validado poderá avaliar e registrar Evidence.

## Seis planos, dezoito posições
S1→S2 e S2→S1, cada uma em EN, ES e PT. Cada plano reúne três dimensões do contrato WHY original:

- **Question function:** instrução pedagógica proposta do H14.27 pergunta **que informação WHY solicita**, sem fornecer a razão do cenário. O H14.26 ainda assinala a tarefa como pendente de autoria independente; sua instrução proposta não a homologa.
- **Reason-answer(local):** pergunta contextual da Experience de origem. Resposta própria independente; não basta repetir a referência ou a frase do Corpus Speech Card.
- **Reason-answer(transfer):** pergunta contextual da outra Experience com nova razão e origem avaliativa explicitamente identificada. A cena S2 pode ser local no circuito S2→S1 ou transferência no S1→S2; a seleção deve preservar a intenção e o escopo. A ordem S1/S2 **não é requisito** para explorar ambas.

As respostas-modelo e os contrastes constam exclusivamente em `teacherOnly`. **Advertência de integração:** esses campos não podem ser enviados ao cliente do aluno quando houver uma avaliação formal. O protótipo H14.38 é um arquivo de estudo e não implementa proteção servidor/autoridade para acesso aos modelos.

## Controle de ações simuladas
O verificador `inspectIllustrativeCandidate` compara **somente metadados de demonstração**: intenção, origem, Experience de destino, idioma, QW, dimensão, identificador de ocorrência e forma da ação.

Bloqueia ou encaminha à revisão os seguintes casos: clique de navegação, reprodução do speaker, ausência da ação autoral, origem/idioma conflitantes, intenção de transferência ausente, ocorrência ausente/repetida, modelo exposto antes da tentativa e qualquer entrada contendo dados pessoais ou texto livre real.

O resultado mais favorável é `CANDIDATE_FOR_HUMAN_TASK_REVIEW_ONLY`. **Isso NÃO comprova independência, compreensão causal, competência linguística nem evidência avaliativa.** Mesmo um registro dizendo que o modelo não foi exibido precisaria de prova operacional independente e contrato previamente autorizado. O monitor de duplicidade opera **somente dentro do lote simulado**; o EVAL-08 futuro deverá tratar idempotência global entre origens no backend real.

## Prontidão e homologação
Nenhuma revisão real por professores foi coletada e nenhum dos quatro portões foi homologado. Os seis planos são rascunhos, e suas 18 posições são elementos de estudo, não exercícios aprovados.

O próximo passo recomendado após esta Fase é testar o instrumento com casos adversos, verificar a qualidade do contrato de autoria independente e documentar como evitar dupla evidência de uma ocorrência entre origens. Não construir produção nem promover estados do estudo a créditos.

## Integração seletiva
O manifesto H14.36 mantém 14 hashes de origem e proíbe merge integral da linhagem de estudo na `main`. No dia da integração, consultar novamente os HEADs e o SIYAYO Module Registry, verificar consumidores e alterações da `main`, portar somente componentes homologados e executar regressões EN/ES/PT, QW, EVAL-08, PATITA, Learning Trail e S3→S4.

FUNC-13 segue oculto. PERIOD continua como pendência geral de GEAR-06. Nenhum arquivo do Explorer oficial, `main`, PR #3, Worker/D1 ou produção foi alterado.
