# JAGUAR H14.24 — Experience × Question Word · Coerência e liberdade
## Intenção
Retomar o HOW TO DO pedagógico depois de FUNC-13. **Auditoria estritamente de leitura**, baseada em `data/learning/experience-seeds.json`, `js/question-word-assessment-contract.js` e `js/verb-explorer-contextual-coherence.js`. Não inventar frases/expansões nem gerar evidências.

## Quatro Experiences, 14 QWs do Toro
21 QW atualmente registradas (S1=6, S2=7, S3=4, S4=4). 14 QWs × 4 Experiences = 56 pares possíveis em termos de organização; **35 não registrados não são 35 lacunas obrigatórias para preencher**, e nenhuma nova pergunta é automaticamente viável no cenário. As 21 QWs em três idiomas produzem 63 vistas para auditoria. Somente fontes reais podem fundamentar a escrita.

A classificação é baseada exclusivamente na declaração: 5 `assessmentTarget` (S1 WHAT/WHERE/WHICH, S2 WHAT, S3 WHY), 2 `assessmentResumeTarget` (S2 WHERE/WHICH), 14 sem declaração. `ASSESSMENT_DECLARED` descreve uma **declaração já existente**, nunca aprovação de contrato novo nem evidência por visita/seleção. O motor real deve continuar verificando sua autoridade, escopo e tentativa observada.

## Como interpretar a inspeção
Cada slot conserva: Experience, QW, declaração anterior, origem do dado e marcadores separados de pergunta, referência contextual, `presentationGrounding`, `reasonGrounding`, `choiceContext`, `dependencyFocus` e `dependencyHeadProbe`. Cada vista EN/ES/PT mostra a pergunta literal e, **somente para WHY**, a resposta já autorizada como *referência de apresentação* pelo resolvedor 90C — não para pontuar. Para outras QWs, o campo de resposta permanece `null` até que uma auditoria especializada possa comprová-la; isto não significa ausência total de material no corpus.

## Critérios de escrita antes de autorização
1. Referente concreto, estável e explícito em cada Experience: quem, onde, quando, quantidade, motivação e temporalidade não devem ser inferidos.
2. Resposta contextual pertinente à pergunta e à cena, distinguindo correção gramatical de pertinência (adequação 0/4) e progresso contratual (0/3).
3. Lógica das cinco funções Master VIP: QUALITY, STATE, MOVEMENT=TO BE+ING, ACTION e EXISTENCE=THERE+TO BE (não é Question Word).
4. TENSE, MODE, PERIOD e suas premissas; `GEAR-06-PERIOD-GAP` continua pendência geral.
5. Traduções EN/ES/PT por autor/homologação humana; mudanças entre idiomas não transmitem créditos.
6. Avaliações independentes por Experience e QW **apenas mediante contrato autorizado e escopo learner × skill × language × originExperienceId**; transferências por intenção explícita, sem obrigar a passagem pelas cenas anteriores.
7. PATITA apenas observa; suas observações nunca substituem Evidence canônica nem conferem Green Pass.

## Preservação e reconciliação com main
A linhagem experimental difere historicamente da `main`. Não realizar merge generalizado. O ponto de partida deste checkpoint é H14.23, depois do adaptador real do Gear Stack. Preservar hashes da Experience, contrato QW, resolvedor WHY e proposta H14.6. `main`, PR #3, Explorer oficial, FUNC-13 oculto, PATITA, Learning Trail e produção não são modificados.

## Próxima fase
Estudo Fino prioritário por Experience/QW e tradução: começar por WHY S1/S2 com `presentationGrounding`, como registrado em H14.3–H14.6; distinguir S3 WHY contrato existente e S4 transferência, sem assumir que S2 pode ser origem e transferência no mesmo Attempt. Expandir as demais QWs mediante pré-análise contextual e sem criar fillers.
