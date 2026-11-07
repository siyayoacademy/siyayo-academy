# SIYAYO FINE DIGITAL ART AGENCY — PIANINHO MÁGICO
## Registro de implementação, homologação e portfólio · RESUME-04.5
**Data:** 2026-11-07  
**Projeto:** Piano SIYAYO Stage / Pianinho Mágico  
**Portfólio:** SIYAYO Fine Digital Art Agency  
**Repositório:** siyayoacademy/siyayo-academy  
**Branch de trabalho:** jaguar/piano-stage-v0.1  
**Referência homologada:** RESUME-04.5, commit `3cefd00a7bee366ff3b963640448dada5af70d03`  
**Estado:** composição visual do aro HOMOLOGADA pelo autor com captura de tela; não equivale a homologação de todos os comportamentos, dispositivos ou módulos.

### 1. Visão autoral e escopo
Registrar como case de arte digital interativa: personagem Pianinho Mágico com identidade visual preservada, teclado semicircular, aro musical cromático, geometria algébrica responsiva, som e iluminação. O princípio de produção é **não alterar a obra visual aprovada ao corrigir a camada interativa**. O design homologado é a referência para Portrait e não deve ser reconstruído arbitrariamente em cada breakpoint.

### 2. Inventário de camadas e responsabilidades
| Camada | Responsabilidade | Fonte / evidência |
|---|---|---|
| Palco / viewport responsivo | Organizar Auto, Portrait e Landscape, sem deformar a composição | `piano/index.html`, `stageViewport` |
| Arte visual autoral | Preservar rosto, estrela, asas, corpo, pés e teclado ilustrado | `piano/assets/pianinho-semicircular-homologado.png` |
| Matriz de composição | Sistema de referência de **690 × 460 px**, escala uniforme no Portrait | `resume04-matrix-viewport`, `resume04-matrix` |
| Aro musical | 13 círculos posicionados em arco, com identidade cromática por nota | `.mirror-ring`, `.mirror-node` |
| Teclado interativo independente | 22 regiões de acionamento musical, sem redesenhar a imagem | `.resume03-keys`, `.resume03-key` |
| Som e feedback | Encaminhar acionamentos ao motor existente quando disponível; iluminação de interação | `piano/pianinho-resume03.js` |
| Contratos pedagógicos | Separar exploração musical de avaliação e créditos | evento `siyayo:mirror-extension-note`, `evaluation:false`, `evidence:false` |
| Ambiente visual | Manter controles de tema, clima e demais componentes do palco sem regressão | `piano/index.html` |

### 3. HOW TO DO — método técnico reproduzível
1. Fixar a arte homologada como base, sem geração/reinterpretação durante ajustes de layout.
2. Usar **uma única matriz lógica de 690 × 460 px** para arte, aro, teclado e efeitos; no Portrait aplicar a **mesma escala uniforme** a todas as camadas.
3. Tratar a posição de cada nota como **coordenada semântica identificada por `data-note`**, não dependente de ordem DOM ou de `nth-child`.
4. Gerar os centros das 13 notas a partir da metade esquerda de uma elipse inferior e espelhar as contrapartes pela vertical do centro. Centro: FÁ♯4.
5. Distribuir as posições por **comprimento físico do arco** na matriz 690 × 460, evitando aglomeração visual perto do eixo central.
6. Aplicar tamanhos distintos: círculos sustenidos com diâmetro relativo de **60%** dos naturais; ciano para sustenidos, dourado para naturais, DÓ inicial/final destacados.
7. Manter a matriz do teclado como camada de interação separada, com mapeamento cromático G3–E5 (22 notas: 13 brancas, 9 pretas); verificar geometria e alinhamento sobre a arte antes de declarar o teclado homologado.
8. Não mudar o modo legado nem o Piano Plano ao aperfeiçoar o módulo opt-in; preservar os demais controles do palco.

**Geometria de referência — RESUME-04.5:** `cx=50`, `cy=48`, `rx=44`, `ry=43` (percentuais da matriz). Para uma ordenada `Y` da elipse inferior:
```text
X_esquerda = 50 - 44 * sqrt(1 - ((Y - 48)/43)^2)
X_direita  = 100 - X_esquerda
Y_direita  = Y_esquerda
F#4        = (50%, 91%)
```
**Nota de precisão:** a equação inversa define a curva; os valores finais de Y são obtidos amostrando o comprimento de arco em pixels (2048 passos), e não escolhidos por espaçamento vertical uniforme.

**Pares de espelho (mesmo Y):** DÓ4 ↔ DÓ5; DÓ♯4 ↔ SI4; RÉ4 ↔ LÁ♯4; RÉ♯4 ↔ LÁ4; MI4 ↔ SOL♯4; FÁ4 ↔ SOL4. FÁ♯4 é o sétimo ponto e centro inferior.

### 4. HOW TO SHOW — contrato de apresentação
- **Portrait:** reproduzir a mesma composição homologada; apenas reduzir/ampliar o conjunto por fator de escala uniforme, mantendo X/Y relativos, ângulos, tamanhos relativos e simetria.
- **Auto / Landscape:** preservar comportamento anterior até validação específica; não assumir que a homologação do Portrait autoriza mudar outros modos.
- **Aro:** 13 botões visíveis, afastados da borda dourada, sem superposição indesejada entre si nem sobre regiões funcionais do teclado; o arco forma um sorriso.
- **Arte:** não cortar estrela, asas, teclado, pés ou círculos; manter proporções originais.
- **Feedback:** permitir interação e resposta musical sem substituir a arte nem deslocar os botões.
- **Acessibilidade:** botões devem continuar semanticamente identificáveis por nota; avaliar alvos de toque mínimos em telas pequenas como teste futuro.

### 5. HOW TO RECORD — evidências e governança
Para cada ELO registrar: identificador, branch, commit, arquivos afetados, matriz/algoritmo, modos testados, resolução de viewport, captura antes/depois, comportamento de som e iluminação, regressões observadas, decisão do autor e estado (PROPOSTO / EM TESTE / HOMOLOGADO / REGRESSÃO).

**Evidência atual:** captura de tela enviada pelo autor em 2026-11-07 e declaração explícita: “PARABENS PARA MIM!! HOMOLOGADO AGORA SIM!!”. A evidência comprova a aprovação visual do aro no cenário mostrado, não testes automatizados ou auditoria integral de áudio.

**Checkpoint técnico de referência:** commit `3cefd00a7bee366ff3b963640448dada5af70d03`. Não modificar a matemática homologada sem nova versão e comparação visual.

### 6. HOW TO VERIFY — testes obrigatórios antes de novos ELOS
- Contar exatamente **13 notas no aro**, uma por nota de C4 a C5, incluindo sustenidos.
- Confirmar FÁ♯4 no eixo X=50%, Y=91%; para cada par, verificar `X_esq + X_dir = 100%` e `Y_esq = Y_dir` (tolerância numérica).
- Verificar visualmente distâncias e ausência de sobreposição de botões, arte e regiões de teclado.
- Contar **22 regiões de teclado**, 13 brancas e 9 pretas, e testar som/feedback para cada uma.
- Validar Portrait real em smartphone e em emulação, depois Auto e Landscape; alternar modos repetidamente sem deslocamento cumulativo.
- Conferir preservação do Piano Plano, modo original, controles de ambiente, clima e outros módulos existentes.
- Se qualquer verificação falhar, registrar regressão e corrigir apenas a camada responsável, sem deshomologar silenciosamente a arte.

### 7. HOW TO INTEGRATE — fronteiras de contratos
A exploração livre de notas pertence ao módulo musical. `HOW TO SHOW` e `HOW TO DO` funcionam sem NICK e sem avaliação ativa. `HOW TO RECORD` registra a evidência de implementação/homologação; **não atribui créditos pedagógicos por tocar notas**. Uma avaliação futura exigirá contrato próprio e autorização de escopo, preservando a distinção entre observação e avaliação.

### 8. Portfólio SIYAYO Fine Digital Art Agency
**Título do case:** “Pianinho Mágico — arte digital interativa com geometria responsiva e música”.  
**Disciplinas:** ilustração digital; direção de arte; design de interação; geometria computacional; UI responsiva; áudio interativo; educação musical e multilíngue.  
**Diferencial:** a obra visual permanece intacta enquanto camadas funcionais independentes respondem a uma matriz geométrica reproduzível.  
**Materiais previstos:** imagem homologada; capturas Portrait/Auto/Landscape; demonstração da elipse e espelhamento; vídeo/GIF demonstrativo autorizado; ficha técnica e linha do tempo dos ELOS.  
**Publicação do case no site da Agency:** pendente de planejamento e aprovação editorial; este registro não publica automaticamente o portfólio.

### 9. Próximos ELOS — sem alteração automática da homologação
1. Consolidar documentação e snapshots de referência do RESUME-04.5.
2. Auditar alinhamento e interação do teclado de 22 regiões e o áudio.
3. Testar smartphone real, Auto e Landscape, incluindo áreas de toque e controles sobrepostos.
4. Preparar apresentação visual do case para a SIYAYO Fine Digital Art Agency.
