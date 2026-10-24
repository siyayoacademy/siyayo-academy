# 🔔🐆 JAGUAR H14.9 — Estudo fino das 80 relações potenciais

**Base verificada:** H14.8 GREEN após correção sintática `3daec8286f87e00bfdb468aa991e2468aca23fe2`. As 80 combinações são o produto de 5 funções × 4 Experiences × 4 Perspectives, não 80 exercícios ou 80 competências homologadas. Em EN/ES/PT há 240 **visualizações potenciais**, não 240 respostas já avaliáveis.

## Rubrica — parecer preliminar, não homologação

- **P = SOURCE_CLOSE:** exemplos já têm forte convergência semântica diretamente legível; ainda requer exercício próprio e revisão.
- **B = BRIDGE:** relacionamento viável, mas depende de autoria contextual, ajuste referencial, tempo ou justificativa.
- **C = CONTRAST:** exemplo atual não cabe diretamente nessa perspectiva ou afirma hábito/temporalidade sem lastro; útil para contraste, não pode ser usado como resposta validada da cena.

Os pareceres são um **primeiro estudo crítico do assistente**, não homologação humana. Cada um dos 80 possui `reason` individual no JSON. Os dois conjuntos de frases são mantidos separados e copiados das fontes já existentes, nunca concatenados artificialmente.

### S1 · Shopping

| Função | DESCRIBING | NARRATING | DEBATING | CONCLUDING |
|---|---|---|---|---|
| QUALITY | B | C | B | B |
| STATE | B | B | B | B |
| MOVEMENT | B | B | B | C |
| ACTION | C | C | C | C |
| EXISTENCE | B | B | B | B |

### S2 · Preparing

| Função | DESCRIBING | NARRATING | DEBATING | CONCLUDING |
|---|---|---|---|---|
| QUALITY | B | B | B | C |
| STATE | B | B | B | B |
| MOVEMENT | B | B | B | B |
| ACTION | C | C | C | C |
| EXISTENCE | B | B | B | B |

### S3 · Having

| Função | DESCRIBING | NARRATING | DEBATING | CONCLUDING |
|---|---|---|---|---|
| QUALITY | B | B | B | B |
| STATE | P | B | B | B |
| MOVEMENT | B | B | B | C |
| ACTION | C | C | C | C |
| EXISTENCE | B | B | B | B |

### S4 · After-Dinner

| Função | DESCRIBING | NARRATING | DEBATING | CONCLUDING |
|---|---|---|---|---|
| QUALITY | B | C | B | B |
| STATE | B | B | B | B |
| MOVEMENT | B | B | B | C |
| ACTION | C | C | C | C |
| EXISTENCE | B | B | B | B |

## Revisão semântica marcante

- **S3 STATE × DESCRIBING:** *The salmon is delicious* e *The salmon tastes delicious* compartilham forte conteúdo. Não quer dizer mesma função discursiva em todas as línguas; verificar linguagem e circunstância em tempo.
- **S1 STATE × DESCRIBING / DEBATING:** a Perspective diz *looks fresh* ou *looks fresher*. A amostra STATE diz *is fresh*. O segundo é mais categórico; preservar a diferença entre aparência e confirmação.
- **S2 MOVEMENT × NARRATING:** `We are preparing dinner` versus `We came home... started preparing dinner`. Pode haver percurso narrativo, mas o aspecto temporal é distinto.
- **S4 STATE × DESCRIBING:** a formulação em português muda de `é agradável` na Perspective para `está agradável` na função. Não declarar equivalência automática de QUALITY/STATE.
- **S4 MOVEMENT × CONCLUDING:** `We are talking together` é progressivo atual; `It was a pleasant evening together` é retrospectivo. Sem conversão situada, o par serve somente ao contraste temporal.
- **ACTION × Perspectives:** todos os quatro exemplos da função ACTION H14.7 introduzem hábito hipotético (`every Friday`, `usually`, `often`) que as respectivas Experiences não estabeleceram. Nenhum deve ser lido como dado real da história.
- **EXISTENCE:** `There is/are/was` permite um módulo de presença/ocorrência, mas não gera resposta automática para HOW MANY, WHERE ou WHAT; é necessário quantificar e localizar na situação.

## Totais interpretativos

| Rubrica | Relações | O que significa |
|---|---:|---|
| SOURCE_CLOSE | 1 | Convergência forte das amostras atuais |
| BRIDGE | 57 | Conexão plausível, necessita autoria e revisão |
| CONTRAST | 22 | Não usar diretamente como frase equivalente/ resposta |
| **Total** | **80** | **0 novas avaliações autorizadas** |

Esses números são **classificações autorais revisáveis**, não métricas cientificamente validadas do método, e não podem ser exibidos como progresso do aprendiz. Cada parecer individual deve ser reconsiderado à medida que a Experience ganhe contexto efetivamente autorado.

## Integração futura

O portão seguinte transforma **um par com B em proposta de exercício real** com proveniência Master VIP, distinção de função verbal, PERSPECTIVE, frase EN/ES/PT, tempo/modo/período, QW quando relevante, resposta e critérios de prova. Depois de teste autoral e homologação humana, a oportunidade poderá ser incorporada aos módulos especializados, nunca por promoção em massa.

Preservar as quatro cores, o domínio próprio EXISTENCE, a definição MOVEMENT da Master VIP, PATITA como observador e os contratos S3→S4 canônicos. Branch isolada, sem alterações de código executável, produção, PR #3 ou Worker remoto.
