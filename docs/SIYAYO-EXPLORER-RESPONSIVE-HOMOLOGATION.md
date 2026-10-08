# Explorer — AUTO / PORTRAIT / LANDSCAPE e Dependency Focus

**Checkpoint atual:** JAGUAR-LIVE-55  
**Registro atualizado:** 2026-10-08, America/Sao_Paulo  
**Branch:** `jaguar/verb-explorer-resume-live-wire` — PR #3 existente  
**Base desta revisão:** `b553d08c3e5c7ff3b294ab6ec54ef4283ba3fb80`  
**Estado atual:** marcador ◐ em avaliação selecionada a 0/3 reproduzido e corrigido para ○; ausência em tela estrangeira explicada pela língua dona da avaliação. Cinco novas capturas acrescentam comparação EN/ES/PT e navegação parcial. Entrada WHAT após WHERE concluído em Preparing tem lacuna concreta OPEN. T7 áudio pendente; T8 parcial. Homologação física do novo marcador e matriz visual completa continuam parciais.

## Objetivo e autorização

O usuário autorizou adotar o modelo compartilhado do Pianinho Mágico no Explorer,
começar pela correção das fontes e conferir cartões e setas nos três formatos.
Pediu registrar o passo a passo para recuperar a continuidade do trabalho; a
conferência dos ajustes no celular será realizada por ele após receber o preview.
Usar o branch e a PR existentes. Não fazer merge nem criar outra PR.

## Origem recuperada

- Branch de origem: `jaguar/piano-stage-v0.1`.
- Snapshot conferido: `349bde65c7986843ad21ecef549d206631bea305`.
- Contrato: `docs/SIYAYO-STAGE-CONTAINER-RESPONSIVE-CONTRACT.md`.
- CSS comum: `css/siyayo-responsive-stage.css`, blob `fde13b86d574464dba65ce8ca31479f0a2501ef7`.
- JS comum: `js/siyayo-responsive-preview.js`, blob `1fe4d10615f3206b0ca1595462ad83e7e314491f`.
- Os dois arquivos comuns são adotados sem alteração. O Explorer define somente
  seus ajustes de layout, sem criar outro controlador de preview.

## Passo a passo e ponto de retomada

| Passo | Trabalho e critério | Estado |
|---|---|---|
| 1 | Conferir HEAD, fonte do Pianinho, contrato e arquivos da cópia local | DONE: arquivos da base conferidos pelos blobs Git |
| 2 | Instalar barra AUTO/PORTRAIT/LANDSCAPE e contêiner comum no Explorer | DONE |
| 3 | Fazer o layout responder à largura do contêiner nos três formatos | DONE: consultas de largura usam o contêiner nomeado |
| 4 | Corrigir fontes, densidade dos cartões e legibilidade das relações | DONE: palavras inteiras, metadados legíveis e rolagem interna |
| 5 | Recalcular setas após largura/formato/fontes, preservando o foco | DONE: atualização visual sem refazer a avaliação |
| 6 | Executar regressões pertinentes e conferir composição nos três formatos | DONE: 267/267 comandos Node dos workflows; conferência de apresentação no navegador |
| 7 | Publicar no branch existente; verificar arquivos, CI e preview | DONE: readback exato; 3 workflows PASS; deploy do commit funcional confirmado |
| 8 | Conferência humana dos ajustes no celular pelo usuário | PARTIAL: 20 capturas recebidas; leitura EN/portrait e PT/landscape, percurso com áudio e nova ocorrência de rolagem registrados abaixo |

**Retomada:** investigar a retenção da rolagem do Dependency Focus ao apontar
outro token da mesma frase; depois conferir alternâncias de idioma/QW e os três
formatos. Não refazer os circuitos humanos já demonstrados para preencher
pendências antigas. A solicitação atual é de investigação; a correção de rolagem
descrita abaixo ainda não foi implementada.

## Modos e composição

| Modo | Largura e comportamento |
|---|---|
| AUTO | Usa a largura disponível e as regras responsivas da página |
| PORTRAIT | Contêiner limitado a 430 px, com composição estreita no laptop |
| LANDSCAPE | Contêiner limitado a 844 px, com composição larga no laptop |
| Touch real | Resolve para AUTO; barra de preview oculta; não herda simulação salva do desktop |

A barra é uma ferramenta de conferência visual. Não é um controle de avaliação.
O modo é salvo pela chave comum `siyayo-responsive-preview-mode`, separada das
autoridades de learner/Session/Skill. O evento comum declara
`pedagogicalChange:false`, `evaluated:false`, `evidenceProduced:false`.

O Explorer consulta a largura do contêiner `siyayo-explorer`. Assim, uma janela
larga de laptop pode mostrar a composição PORTRAIT. Unidades relativas à largura
também usam esse contêiner. O diagnóstico Xespirito recebe apenas os ajustes
locais necessários para acompanhar o formato; seu arquivo compartilhado fica
intacto.

## Registro — Dependency Focus / mobile portrait

Evidência: `image(20261007-183912).png`, anotado pelo usuário, e o print mobile
`WhatsApp Image 2026-10-07 at 14.18.13.jpeg`. Palavras e tipos invadiam cartões
vizinhos. O usuário pediu estudar fonte, altura, organização das informações e a
camada das setas.

Causa de apresentação conferida: regras tipográficas posteriores sobrescreviam
os tamanhos menores de mobile; cartões eram comprimidos em colunas iguais sem
largura suficiente para palavras inteiras.

| Informação | Fonte preservada |
|---|---|
| Palavra | `token.form` |
| Tipo de palavra no idioma ativo | `token.pedagogy.wordType[language]`, com o fallback já existente |
| Relação com o foco selecionado | `structure.relations`, projetada pelas views existentes |

A terceira linha é condicional ao foco. Por exemplo, `o -> salmão` é `det`; ao
focar `encontrar`, são projetadas as relações diretas `advmod`, `aux` e `obj`.
Não inventar uma relação apenas para preencher visualmente três linhas.

Os cartões mantêm Quicksand/Nunito Sans, palavras inteiras e metadados completos.
Onde falta largura, o diagrama tem rolagem horizontal, barra visível e instrução
localizada somente quando há overflow. O restante da página continua ajustado
ao contêiner. O novo lote humano abaixo confirma legibilidade nas composições
observadas; a retenção da rolagem e a revisão visual geral continuam abertas.

As setas continuam usando dependente -> head a partir do corpus. São redesenhadas
com as posições atuais dos cartões após ResizeObserver, mudança de preview,
redimensionamento e carregamento das fontes. Essa atualização preserva o foco e
não cria ação/resposta pedagógica.

## Evidência humana já recebida antes deste ajuste

- Desktop PT, ordem invertida: cinco prints de `163327` a `164057` demonstram
  função correta, uso local errado, transferência em 2/3 e correção local em
  Shopping para 3/3. Os prints `165258` e `165559` mostram o retorno final a
  Preparing com ONDE/estrela, trilha 3/3 e feedback GREEN PASS corrigido. Esta
  pendência específica de LIVE-46 está encerrada no percurso testado.
- Mobile PT, ordem normal: 20 prints WhatsApp entre 14.18.13 e 14.31.30 mostram
  `New Pupil ONDE` em 0/3 -> 2/3 -> 3/3 com GREEN em Preparing e retorno a Shopping;
  a repetição com `Conferir learning trail Onde` acrescenta Trail Shopping 2/3 e
  retorno confirmado 3/3, partindo novamente de 0/3.
- English exibido com `DISPLAY EN · ASSESSMENT PT` não é uma conclusão própria EN.
  O retorno a PT conserva a estrela. Áudio efetivamente ouvido no celular não
  foi comprovado por esses prints.
- Estas capturas são da versão anterior aos ajustes LIVE-47. Não homologam por
  antecipação as novas fontes, cartões, contêiner ou setas.

## Autoridades e pendências preservadas

- Skill pertence exclusivamente a `session.decision.skill`.
- Choice Evidence Packet Bridge, contrato WHERE, evaluator, corpus, escopo,
  provenance, apoio de áudio e fechamento por scope permanecem intactos.
- Preview, tamanho de fonte, rolagem, foco visual e setas não confirmam domínio.
- VISUAL-PATITA-01 e VISUAL-CARDS-02 permanecem OPEN para a revisão visual global
  de todos os percursos, QWs e idiomas.
- ENTRY-WHERE-01 (ocorrência inicial com NOVO TESTE) permanece OPEN; os novos
  circuitos bem-sucedidos não reproduzem nem encerram aquela ocorrência.
- Sem merge, outra PR, NEXT automático, reinício automático ou mudança de idioma
  da avaliação causada por um formato de tela.

## Verificação desta implementação

O conjunto inicial de 44 regressões passou. Depois de completar a cópia local
dos scripts e fixtures usados pelo CI, passaram todos os 267 comandos Node
distintos declarados nos três workflows. A validação de sintaxe dos dois scripts
novos/alterados passou. Os arquivos recuperados de base foram conferidos pelos
blobs Git; os dois arquivos comuns conferem exatamente com os blobs do Pianinho.

O primeiro envio, `090e21d3a8e87e573945bcf0cb235b9a2b1d8b0a`, passou Resume,
mas falhou no guard de portrait e no teste da superfície de foco. O teste de
portrait procurava a antiga consulta `@media` em vez do contêiner adotado. O
segundo usava um DOM mínimo sem `querySelector`, válido para a projeção estática.
O follow-up preserva essa projeção e instala o observador somente quando há DOM
de geometria; o teste existente de portrait exige agora contêiner nomeado e
ligação ao preview comum. Não se contornou o CI nem se alteraram workflows.

**Commit funcional final:** `188e5603729020e60b609726d8ed4126023d69f3`.
Os oito arquivos do envio inicial e os dois arquivos do follow-up foram lidos
exatamente dos commits imutáveis. O diff final desde a base contém nove caminhos:
apresentação, três documentos e o teste de contenção de portrait. Corpus,
contratos, Session/Skill, Choice Bridge e workflows permanecem intactos.

| Check do commit funcional final | Resultado |
|---|---|
| [Verb Explorer Adaptive Bootstrap 37681034661](https://github.com/siyayoacademy/siyayo-academy/actions/runs/37681034661) | PASS |
| [Resume Runtime Dispatch 37681034618](https://github.com/siyayoacademy/siyayo-academy/actions/runs/37681034618) | PASS |
| [Corpus Integrity 37681034660](https://github.com/siyayoacademy/siyayo-academy/actions/runs/37681034660) | PASS |
| Cloudflare Pages — HEAD `188e560` | Deploy successful; preview `3610852c` |

O navegador de conferência não alcança o servidor local (connection refused).
As verificações visuais foram feitas no preview publicado da mesma branch.
Não houve execução TinyFish.

### Conferência de apresentação no navegador

Nick de teste: `QA LIVE47 LAYOUT`, Shopping, avaliação PT/ONDE em 0/3, sem
responder aos probes ou ouvir áudio. Trocar AUTO -> PORTRAIT -> LANDSCAPE -> AUTO
preservou nick, foco `find`, ONDE e contrato 0/3; não confirmou evidência.

| Composição PT/ONDE | AUTO | PORTRAIT | LANDSCAPE |
|---|---|---|---|
| Largura do contêiner observada | 1348 px | 430 px | 844 px |
| Palavra / metadados | 15 / 12 px | 14 / 12 px | 15 / 12 px |
| Altura dos cartões observada | cerca de 89 px | cerca de 86 px | cerca de 89 px |
| Diagrama: largura disponível / conteúdo | 996 / 996 px | 394 / 539 px | 745 / 745 px |
| Rolagem e instrução | dispensadas | internas, instrução PT; teclado alcançou o fim, 145 px | dispensadas |
| Setas após concluir a transição | SVG 996 x 147 | SVG 539 x 144 | SVG 745 x 147 |

Nos três formatos, as palavras cabem inteiras nos próprios cartões. As setas
advmod/aux/obj continuam ligadas ao foco canônico. A transição animada pode ter
geometria intermediária; o observador refaz o SVG até a dimensão final.
O documento não apresentou overflow horizontal (scrollWidth = clientWidth).

Também foram conferidos metadados e instrução de rolagem em portrait ES e EN,
incluindo os seis tokens EN e a seta nsubj. Trocar apenas a exibição preservou
`ASSESSMENT PT`, sem adotar nem confirmar EN/ES. VERB DNA foi conferido em
portrait/landscape, com cartões empilhados/colunas e diagnóstico acompanhando
o contêiner. Esta inspeção é de apresentação pelo agente, não é homologação
humana de domínio ou de áudio.

**Preview funcional imutável, aberto e URL após redirecionamento conferida:**
[Shopping — LIVE-47](https://3610852c.siyayo-academy.pages.dev/verb-explorer?mode=experience&experience=shopping-for-dinner).

### Próximo elo humano — celular

1. Abrir o preview acima no celular: layout AUTO, sem barra de simulação.
2. Em Shopping/Português, escolher um nick e ONDE para exibir o diagrama.
3. Conferir palavra inteira, tipo completo e relação legível; conferir a altura
   dos cartões e deslizar o diagrama até o último cartão.
4. Conferir setas ligadas aos tokens certos, tanto no início quanto no fim da
   rolagem; repetir com o celular na horizontal.
5. Enviar o relato e os prints dos dois lados/posições observados. Se aparecer
   uma falha, registrar idioma, Experience, QW, orientação e ação que a provoca.

Este era o roteiro entregue antes do novo lote humano abaixo. CI/deploy
bem-sucedidos isoladamente não encerram a homologação visual.

## Retorno humano — 20 capturas e áudio · 2026-10-07

**Versão identificada:** as capturas com a barra de endereço mostram o preview
funcional `3610852c`. Ele corresponde ao commit funcional `188e560`; o HEAD
inspecionado nesta revisão, `8635dc1f64653b98c61cc87ce73f36b4d611b573`, acrescenta
somente os dois documentos de acompanhamento. Capturas recortadas, isoladamente,
não identificam um SHA. Os arquivos originais foram lidos localmente e preservados.

| Capturas | Evidência observada | Limite / resultado |
|---|---|---|
| `image(20261007-213405).png`; WhatsApp `18.02.00` | Celular vertical, Shopping/English/WHAT: frase inteira alcançável por rolagem, palavras e tipos legíveis, setas obj/xcomp/mark e cartões de Living Lines com texto quebrado dentro das bordas | Apresentação EN/WHAT observada; nick vazio não é avaliação EN concluída |
| `image(20261007-214110).png` | Celular horizontal, Shopping/PT/ONDE, nick Show: cinco tokens legíveis; advmod/aux/obj ligados a encontrar; diagnóstico correto observado fora do contrato; Trail 0/3 | Legibilidade nesta composição aprovada pelo relato; observação não satisfaz FUNÇÃO/USO/TRANSFERÊNCIA |
| WhatsApp `18.06.28`, `18.06.47`, `18.07.15`, `18.07.29` | ONDE, tipos, passado/afirmativa/perspectivas e Living Lines legíveis; próximo contexto apresentado como exploração livre | Exploração gramatical e visita não iniciam outra avaliação |
| WhatsApp `18.07.46`, `18.09.17`, `18.09.29`, `18.09.56` | FUNÇÃO preenchida; resposta correta de Shopping selecionada; aviso de apoio de áudio e exigência de evidência independente; Trail FUNÇÃO ● / USO ○ / TRANSFERÊNCIA ○, 1/3 | Resposta local foi registrada como assistida. A ausência de USO confirmado é o comportamento esperado |
| WhatsApp `18.12.17`, `18.12.34` | Preparing conserva WHERE 1/3 e origem Shopping; visita não inicia nova avaliação; ONDE exibido | Retenção do percurso e da origem demonstrada |
| WhatsApp `18.13.16`, `18.14.18` | Transferência correta em Preparing; Trail FUNÇÃO ● / USO ○ / TRANSFERÊNCIA ●, 2/3 | Transferência independente admitida; áudio local de Shopping não é fabricado como áudio em Preparing |
| WhatsApp `18.15.08`, `18.16.55` | Retorno a Shopping mantém 2/3 e a mensagem de apoio de áudio no uso local | Remontagem não apaga o apoio observado nesta Session/Experience. Este ensaio permanece sem USO independente e sem GREEN PASS |
| `image(20261007-214251).png`, `image(20261007-214342).png` | Laptop com barra AUTO e composição estreita do Explorer | Integração visual observada; não demonstra avaliação própria nem todos os formatos/idiomas |
| `image(20261007-220853).png` | Usuário aprova a barra branca do contexto; relata salto da rolagem do diagrama ao sair da barra com o mouse e ao apontar cook no celular | Nova pendência DEPENDENCY-SCROLL-01, detalhada abaixo |

O usuário confirma que o teste de áudio corresponde ao esperado. Registrar
**áudio efetivamente ouvido no ensaio móvel apresentado**; os prints PT do painel
corroboram o registro de apoio, mas imagem estática não prova escuta. Não ampliar
esse relato para todas as vozes, idiomas, QWs ou dispositivos. O lote acrescenta
evidência humana de apresentação e de apoio de áudio; não é somente um deploy
bem-sucedido. Ele não demonstra uma matriz completa de alternâncias EN/ES/PT.

### DEPENDENCY-SCROLL-01 — OPEN: retenção ao mudar o foco

**Relato:** após deslizar até o fim da frase, o usuário quer examinar palavras e
setas mantendo a posição. No laptop relata retorno ao início ao mover o mouse
da barra; no celular relata o mesmo ao apontar cook. A imagem registra a posição
e o relato, não uma sequência temporal automatizada.

**Inspeção do código publicado:**

- `js/verb-explorer-dependency-focus-interaction.js` muda o foco por hover
  (`pointerover`, exceto touch), apontar (`pointerup`) e teclado (`focusin`,
  Enter/Space). Uma mudança real de token chama `surface.render`.
- `js/verb-explorer-dependency-focus-surface.js` substitui `surface.innerHTML`
  e cria outro `.dependency-diagram-scroll` em cada renderização. Não captura nem
  restaura `scrollLeft` do contêiner anterior. Essa perda de estado explica o
  salto descrito quando o foco muda; não existe um handler específico de saída
  da barra que deliberadamente mande a rolagem para o início.
- A atualização de geometria por resize/fontes/preview usa `refresh` e não
  recria esse contêiner. O desenho calcula posições relativas ao stage; a
  rolagem deve conservar o alinhamento de cartões e setas.
- Os dois arquivos inspecionados conferem exatamente com os blobs do HEAD:
  surface `5e22ce450c8b694643e5665152506e6968c7d56d` e interaction
  `fb3767abfa7a325fa9d82d45d669d3d8e5549351`.

**Correção proposta, ainda não aplicada:** conservar a posição horizontal
enquanto muda somente o token focado da mesma frase canônica e idioma. Se a
renderização continuar substituindo o DOM, capturar a posição antes e restaurar
no novo contêiner, limitada ao intervalo válido após o layout; manter o desenho
das relações canônicas. Uma troca deliberada de frase/QW/idioma/Experience usa a
nova referência sem carregar a posição de outra frase. Não desativar o apontar
para esconder o problema. A barra branca do contexto foi aprovada e não faz
parte desta ocorrência.

**Critérios para o próximo elo:**

1. Deslizar até a parte direita; apontar going/cook com mouse e touch e conferir
   foco novo, posição retida e pontas das setas ligadas aos tokens corretos.
2. Repetir por teclado, conferindo acesso aos tokens sem salto para o início.
3. Alternar AUTO/PORTRAIT/LANDSCAPE com a mesma referência e verificar limites
   da rolagem e redesenho das setas.
4. Alternar EN -> ES -> PT -> EN e QWs disponíveis em Shopping e Preparing:
   frase/tipos/relações correspondem à referência selecionada; referência ausente
   não herda o diagrama anterior; voltar à referência mantém apresentação coerente.
5. Conferir que exploração/preview não produzem evidência, Session, closure ou
   adoção automática de Skill/idioma. Conservar as avaliações próprias retidas.

### Verificação da revisão e fila preservada

Passaram novamente **11 regressões existentes**: seleção e isolamento de idioma;
áudio de Choice; QWord/Dependency Focus; referência viva por idioma; interação;
interação acessível; superfície; WHERE vivo com áudio/remontagem; contrato WHERE;
Choice Evidence Packet Bridge (43 verificações). Os testes de interação não
verificam a retenção da rolagem; o resultado PASS não encerra DEPENDENCY-SCROLL-01.
Esta revisão não fez uma nova reprodução automatizada no navegador.

O HEAD `8635dc1` tem Bootstrap, Resume, Corpus e Cloudflare em success, conferidos
separadamente das capturas. Nenhum arquivo de runtime, teste ou CI foi alterado
por esta revisão; a publicação desta evidência é somente documental. Skill
continua exclusivamente em `session.decision.skill`; o contrato e o Choice
Bridge conservam as autoridades e restrições anteriores.

**WAIT geral permanece:** DEPENDENCY-SCROLL-01; revisão visual global
VISUAL-PATITA-01 / VISUAL-CARDS-02; ENTRY-WHERE-01; matriz humana ainda não
demonstrada de idiomas/QWs/formatos. Áudio e legibilidade observados neste lote
ficam registrados com seu escopo; não reabrir conclusões anteriores nem tratar
o ensaio assistido em 2/3 como perda de um GREEN PASS anterior.

## Retomada — JAGUAR-LIVE-48 / DEPENDENCY-SCROLL-01

**Base imutável:** `8c3333b14679d14cbfa55f3d4682161b69a23c59`. A revisão das 20 capturas e do áudio foi preservada. A chamada de workflow que ficou sem retorno no chat anterior não impede a retomada: Bootstrap, Resume, Corpus e Cloudflare do checkpoint já estavam concluídos.

**Correção implementada:** a interação em outro token solicita retenção da posição somente para a mesma superfície visível, estrutura canônica carregada e idioma. A renderização normal de contexto, QW ou idioma cria sua própria referência. A posição é restaurada e limitada à largura disponível após o layout. O token ou a região que tinha foco por teclado recupera esse foco com `preventScroll`; um guarda de ativação impede que o `focusin` de restauração reentre na renderização.

**Reprodução e regressão:** o teste existente de superfície, já executado pelo CI, usa os módulos de produção de superfície/interação/conectores e uma fixture que reproduz perda de rolagem/foco ao substituir o DOM. No checkpoint, apontar cook após 260 px falha: posição 0 em vez de 260. A correção passa essa reprodução, mouse/touch/teclado, Enter/Space sem render duplicado, foco da região, token inválido sem substituição, clamp ao novo limite, superfície escondida sem estado antigo, EN -> ES -> PT -> EN e referências WHAT/WHERE/WHICH de Shopping/Preparing. As coordenadas e relações das setas continuam canônicas em três larguras disponíveis. A fixture não é uma homologação humana nem uma escuta de áudio.

**Verificação local:** 14 comandos de regressão PASS: superfície, interação, interação acessível, referência viva, QW/Dependency Focus, DNA trilíngue, conectores, isolamento e seleção de idioma de avaliação, WHERE vivo, contrato WHERE, portrait containment, continuidade da visita QW e Choice Evidence Packet Bridge. O último mantém suas 43 verificações. Sintaxe dos três arquivos alterados PASS. Nenhum workflow, corpus, Session/Skill, suporte de áudio, contrato, Choice Bridge ou mecanismo de evidência foi alterado. Os resultados de publicação/CI e navegador servido ficam na PR #3.

**Estado ao concluir LIVE-48 (histórico):** implementação de DEPENDENCY-SCROLL-01 corrigida e coberta por regressão. Naquele momento, a conferência humana desta versão no telefone permanecia WAIT; a revisão visual geral, VISUAL-PATITA-01, VISUAL-CARDS-02, ENTRY-WHERE-01 e a matriz humana completa continuam abertas. As seções de diagnóstico anteriores descrevem o estado pré-correção do checkpoint.

**Próximo elo:** no preview corrigido, deslizar até a parte direita da frase, examinar outra palavra sem salto e conferir setas e foco nos formatos; depois alternar idiomas/QWs sem confundir exploração com evidência ou trocar a autoridade da avaliação.

## Confirmação móvel — JAGUAR-LIVE-49

**Data:** 2026-10-08, America/Sao_Paulo. **Implementação conferida:** `418f4c68c4385f7e6b38495dd650f67f0c5602d8`, preview de Shopping publicado na PR #3.

**Relato do usuário:** “sim corrigido”, após a solicitação de conferir a retenção da rolagem no celular. **DEPENDENCY-SCROLL-01: DONE no reteste móvel informado.** O relato confirma o comportamento temporal; as capturas abaixo registram estados visuais do ensaio.

| Captura recebida | Observação direta | Escopo |
|---|---|---|
| `WhatsApp Image 2026-10-08 at 10.37.03.jpeg` | EN/WHAT, “What are we going to cook?”; foco em `to / PARTICLE`; seta `to → cook` com `mark`; parte direita do diagrama visível | Celular retrato, foco e conexão legíveis com rolagem interna |
| `WhatsApp Image 2026-10-08 at 10.37.36.jpeg` | Mesma pergunta EN/WHAT; foco em `we / PRONOUN`; seta `we → going` com `nsubj`; outra faixa da frase visível | Celular retrato, exploração de outro token |
| `WhatsApp Image 2026-10-08 at 10.41.30.jpeg` | ES/WHICH, “¿Cuál queso deberíamos elegir?”; foco em `queso / SUSTANTIVO`; relação `Cuál → queso` com `det`; curva `obj` continua à direita, com verbo fora da faixa visível | Celular retrato; referência e diagnóstico correspondentes em espanhol |

**Limites da conferência:** nenhuma captura demonstra a sequência completa do gesto, teclado, formato paisagem/AUTO, alternância PT ou toda a matriz de QWs. O encerramento da falha neste reteste vem da confirmação explícita do usuário. A observação visual não produz nova evidência de domínio nem GREEN PASS.

**Continuidade:** próximo elo é a alternância dirigida EN -> ES -> PT -> EN/QWs e a comparação dos três formatos no celular/laptop. VISUAL-PATITA-01, VISUAL-CARDS-02, ENTRY-WHERE-01 e a matriz humana completa continuam OPEN. O áudio anteriormente ouvido e os circuitos já concluídos conservam seu escopo; a rota WHERE assistida em 2/3 permanece separada.

Esta revisão altera apenas o mapa e este registro; a implementação corrigida, os contratos e as autoridades de avaliação são preservados.

## Alternância de idiomas e paleta — JAGUAR-LIVE-50

**Autorização:** o usuário pede as checagens necessárias, informa que realizou testes nos três idiomas e envia quatro capturas móveis adicionais. Homologa três dourados e três azuis espectrais no anexo `image(20261008-152408).png`.

| Captura | Observação direta | Revisão |
|---|---|---|
| `WhatsApp Image 2026-10-08 at 10.58.48.jpeg` | PT, foco sintático em `estes` ligado a `livros` por `det`; diagnóstico pergunta o núcleo de `três`; aluno identificado; Trail QUAL | O foco explorado e o alvo do diagnóstico têm papéis próprios. Alterar o token visual conserva a pergunta canônica de diagnóstico |
| `WhatsApp Image 2026-10-08 at 10.59.11.jpeg` | PT, WHICH ativo em 0/3; WHERE guardado em 0/3; prova “Qual ___ devemos escolher?” | Estados observados do ensaio atual; sem demonstração de PASS ou perda de progresso de outro aluno/ensaio |
| `WhatsApp Image 2026-10-08 at 11.01.40.jpeg` | EN ativo na tela, aviso DISPLAY EN / ASSESSMENT PT; metadados da avaliação em PT; WHICH marcado “not started” | Aviso e idioma da avaliação corretos; cartão “not started” contradiz a avaliação já aberta |
| `WhatsApp Image 2026-10-08 at 11.02.02.jpeg` | ES na tela, CUÁL selecionado, resposta exploratória separada; WHICH “aún no iniciada”, WHERE guardado em 0/3 | Mesma inconsistência de apresentação ao mudar somente o idioma |

### TRAIL-DISPLAY-LANGUAGE-01 — corrigido

A comparação do cartão ativo em `journeyHtml` usava o idioma da tela, enquanto histórico, label e progresso já usavam o idioma de avaliação. Ao apresentar uma Session PT na tela EN/ES, o cartão perdia o estado ativo e podia mostrar “não iniciado”.

A correção compara com o idioma da avaliação. A Session conserva Skill, idioma, origem, progresso e Evidence; o aviso de tela/avaliação segue explícito. A regressão existente falhou antes da correção ao esperar WHICH ativo em 0/3. Depois, passou esse caso e **81 combinações** de idiomas de avaliação/tela, exploração WHICH/WHAT/WHERE e progresso 0/3, 1/3, 2/3, usando as projeções reais de label/histórico e verificando que o snapshot não muda.

### PALETA — homologação e aplicação inicial

Registro completo em [SIYAYO-COLOR-PALETTE](SIYAYO-COLOR-PALETTE.md); tokens em `css/siyayo-palette.css`.

| Espectro | Escuro/padrão | Médio | Brilhante |
|---|---|---|---|
| Dourado, opções 1/2/3 do usuário | Padrão `#D7B35A` | `#F2D88A` | `#FCEC5B` |
| Azul espectral | Escuro `#071F41` | `#0A2A58` | `#0307B2` |

Os blocos uniformes do anexo são a fonte dos seis valores. O Explorer importa a paleta antes de seus estilos; a Home recebe a mesma fonte por importação em `css/style.css`. Título da Experience: dourado padrão; rótulos/título do Explorer: médio; foco por teclado nos tokens, seletores e abas: brilhante. Fundo externo do Explorer: azul escuro/médio. Fontes Quicksand/Nunito Sans e estados semânticos mantêm seus contratos.

### Verificação e continuidade

**18 regressões existentes PASS**, incluindo a regressão ampliada de 81 casos; seleção/isolamento de idioma; Thinking Mind trilíngue; DNA e foco por QW; superfície/interação/acessibilidade/experiência; diagnóstico por identidade/idioma; observação/Trail; WHERE vivo e contrato; conectores; layout retrato; Choice Evidence Packet Bridge com suas 43 verificações. Sintaxe dos dois JS alterados PASS. O workflow Bootstrap já executa a regressão ampliada.

CI/publicação e observações posteriores no preview servido ficam registrados na PR #3. O relato do usuário nos três idiomas e as capturas são preservados separadamente dos ensaios automatizados. A homologação humana da nova aplicação de cores e dos três formatos continua parcial. Próximo elo: conferir o novo preview e seguir a matriz de alternância/formatos, mantendo as autoridades da avaliação.

## Fundo externo da Home — JAGUAR-LIVE-51

**Data:** 2026-10-08, America/Sao_Paulo. **Base:** `921ade16da82e37d06f2a34b25b35e606f282826`.

**Relato e autorização:** o usuário aprovou a aparência da nova paleta, enviou `image(20261008-171701).png` e pediu substituir o preto externo pelo azul escuro homologado. Na sequência, pediu conferir se já havia azul. A captura registra a Home do preview LIVE-50; não demonstra a correção abaixo.

**HOME-EXTERIOR-BLUE-01 — correção:** o CSS da base tinha um gradiente externo iniciado em `#0B2F62` e terminado em `#000`, além de preto no reset e na regra móvel. Em `css/style.css`, as três declarações passam a `background: var(--siyayo-blue-dark)`. O resultado definido é um fundo externo uniforme `#071F41` nos dois tamanhos, herdado de `css/siyayo-palette.css`.

**Verificação:** diff limitado às três declarações de fundo; importação/token homologado conferidos. Arte interna, sombras, fontes, layout, Explorer, JS e autoridades de avaliação intactos. A correção é apenas CSS; não se atribuem novos resultados aos testes de LIVE-50. Publicação/deploy e readback ficam na PR #3. Não houve nova validação visual servida por navegador, pois a abertura anterior do preview ficou bloqueada.

**Próximo elo:** revisão do fundo externo no novo preview da Home em laptop/celular, mantendo a continuidade da matriz de idiomas/QWs/formatos. VISUAL-PATITA-01, VISUAL-CARDS-02 e ENTRY-WHERE-01 seguem OPEN; a homologação humana completa permanece parcial.

## Confirmação visual e roteiro humano — JAGUAR-LIVE-52

**Data:** 2026-10-08, America/Sao_Paulo. **Implementação revisada pelo usuário:** `829b9c3f7be67af7e5769abaa904f19fd385269f`.

**Relato:** o usuário confirma que o efeito ficou como desejado/imaginado, “ficou perfeito”, “belo”, “elegante”, e que o dourado ficou mais coerente. **HOME-EXTERIOR-BLUE-01: DONE na vista aprovada pelo usuário.** O relato não identifica o dispositivo ou demonstra todos os formatos/páginas. Não há nova captura nem conferência independente por navegador nesta rodada.

**Escopo deste registro:** documentação da aprovação e da lista solicitada. CSS, JS, corpus, Session/Skill, evidência, contratos e layout permanecem intactos. Os resultados automatizados de LIVE-50 e o deploy de LIVE-51 conservam seu escopo original.

### Sequência humana T1–T8

[Preview fixo do Explorer](https://f9ff9ba1.siyayo-academy.pages.dev/verb-explorer.html?mode=experience&experience=shopping-for-dinner).

Antes de T1, anotar o nick, Experience, idioma da avaliação, QWord e progresso de uma avaliação em andamento, preferencialmente WHICH. Fazer primeiro a alternância de LANGUAGE sem trocar QWord, responder provas ou iniciar outra avaliação. Se não houver avaliação ativa, marcar T1 como não testado e informar esse estado; uma tela vazia não verifica a correção do cartão ativo.

| Teste | Ação humana | Resultado esperado | Estado |
|---|---|---|---|
| T1 — Idiomas / cartão ativo | Trocar somente LANGUAGE: PT → EN → ES → PT, mantendo a avaliação em andamento | Perguntas/exemplos acompanham a tela; o cartão continua representando a avaliação e seu progresso. O idioma de avaliação se conserva; o aviso de tela/avaliação diferente é esperado | PENDING |
| T2 — QWords / retorno | Em cada idioma, selecionar WHICH → WHAT → WHERE → WHICH | Pergunta/referência correspondem à QWord. Selecionar uma QWord com contrato pode ativar/restaurar a avaliação dela; ao voltar à mesma QWord, nick, idioma e origem, seu progresso é preservado. Progressos de idiomas diferentes permanecem separados | PENDING |
| T3 — Palavras / relações | Na frase atual, selecionar três tokens de tipos diferentes, onde disponíveis | Dependency Focus mostra o token, tipo e relações corretos. O diagnóstico de núcleo mantém seu alvo próprio; selecionar uma palavra não significa responder à prova | PENDING |
| T4 — Rolagem interna | Na mesma frase e idioma, deslizar o diagrama para a direita e apontar outro token | Rolagem permanece na faixa examinada, sem salto à esquerda; foco/setas correspondem ao token. Nova frase/idioma pode iniciar seu próprio diagrama | PENDING |
| T5 — Formatos no laptop | Na mesma tela, AUTO → PORTRAIT → LANDSCAPE → AUTO | Palavras inteiras, cartões legíveis e setas ligadas aos tokens; diagrama longo usa rolagem interna. Apenas trocar formato conserva avaliação/progresso | PENDING |
| T6 — Celular | Conferir retrato e girar para paisagem, sem recarregar | Conteúdo legível e controles acessíveis; fundo externo e dourados coerentes; rolagem interna quando necessária. No touch real, o layout usa AUTO e a barra de simulação pode ficar oculta | PENDING |
| T7 — Áudio | Ouvir uma frase e o cartão de pergunta do diagnóstico em EN, ES e PT | Texto/idioma correspondentes; uma reprodução por toque, sem fala duplicada. Ouvir uma prova pode registrar suporte de áudio no circuito, não domínio independente | PENDING |
| T8 — Visita / retorno | Em Shopping, anotar o percurso ativo; visitar Preparing via NEXT e retornar pelo controle de Experience, sem iniciar outra avaliação | Visita e avaliação de origem ficam distinguidas; a visita por si só não inicia outro circuito nem altera o progresso da avaliação de origem | PENDING |

**Como reportar:** `T1 OK; T2 OK; T3 problema; T4 não testado`. Se houver problema, informar dispositivo, formato, idiomas de tela/avaliação, QWord, Experience e progresso antes/depois; captura apenas se ajudar a localizar. Nenhum resultado é antecipado neste roteiro. Começar por T1 e devolver resultados em pequenos lotes.

**Continuidade:** aprovação desta vista não fecha VISUAL-PATITA-01, VISUAL-CARDS-02, ENTRY-WHERE-01 ou a matriz humana inteira. Testes já homologados não precisam ser repetidos integralmente; T4 e T7 são checagens pontuais após as alterações recentes.

## T1/T2 — investigação dos relatos — JAGUAR-LIVE-53

**Data:** 2026-10-08, America/Sao_Paulo. **Base de publicação:** `c0015414b07b1d10036659ad2d79200dfc6ac53f`. **UI ensaiada:** preview fixo `f9ff9ba1`, implementação `829b9c3f7be67af7e5769abaa904f19fd385269f`.

**Fontes humanas:** relato detalhado e `image(20261008-183603).png` / `image(20261008-185840).png`, ambos revistos diretamente. Os anexos são montagens anotadas de estados T1; não permitem inferir o dispositivo físico ou fechar a matriz de formatos. O usuário declara T3–T8 ainda não executados.

| Ensaio | Observação relatada | Conclusão e limite |
|---|---|---|
| T1, nick `f9ff9ba1`, avaliação EN | WHICH 0/3 → Choice 1/3; tela PT/ES conserva EN 1/3; resposta PT e comparação pronominal ES não avançam contrato EN | Retenção na troca somente de LANGUAGE confirmada. Respostas exploratórias/contextuais em outro idioma não pertencem ao contrato EN |
| T1, nick `T1 — Idiomas`, avaliação PT | QUAL 1/3 continua após tela EN. Clique explícito em WHICH cria EN 0/3. Tela ES/PT mantém avaliação EN; núcleo observado é prática livre | 0/3 corresponde ao novo circuito EN. Mudar só a tela para PT não seleciona o circuito PT. Recuperação do PT 1/3 após clique em QUAL é esperada e passou nos testes controlados; essa última seleção não consta do relato |
| T2, nick `T2 — QWs`, EN | WHICH núcleo observado 0/3; WHAT 2/3; WHERE 2/3; retorno WHICH 0/3, Choice 1/3; WHAT retorna 2/3 com os demais progressos guardados | Observação de núcleo separada do contrato; retenção parcial entre QWords demonstrada no relato |
| T2, retorno WHERE após WHICH 1/3 | Texto copiado permanece WHICH 1/3, incluindo “Try another word”; não há captura do seletor/aviso desse clique | **QWORD-RETURN-WHERE-01 OPEN.** Não é possível concluir se o botão foi aplicado e a restauração falhou, se o clique não chegou ou se a leitura foi transitória. A ocorrência não foi reproduzida nos módulos reais |

### Prova controlada e cobertura adicionada

A regressão existente `scripts/test-where-live-assessment.js` agora reproduz os dois ensaios em **EN/ES/PT × Node/browser VM**. O transporte de JSON e o DOM são fixtures; startup, corpus, fronteiras, avaliação e contadores são os módulos reais.

- **T1:** Choice canônica aceita em 1/3; LANGUAGE isolado conserva Session/contagem; resposta canônica em idioma estrangeiro é rejeitada antes de alterar a avaliação. Seleção explícita em outro idioma cria Session separada 0/3; retornar ao original e selecionar WHICH/QUAL restaura a mesma Session e seu 1/3. Retornar ao outro idioma restaura seu próprio 0/3.
- **T2:** WHICH 0/3 → WHAT 2/3 → WHERE 2/3 → WHICH 0/3 → Choice 1/3 → uso de determinante incorreto → WHERE 2/3 → WHAT 2/3 → WHICH 1/3. Retornos passam na primeira seleção; nenhum Attempt é repetido pela recuperação. O erro de uso mantém o Choice já aceito e WAIT.
- Choice usa Resolver, Reader, Evaluator, propriedade da ocorrência, Attempt, Bridge, Coordinator e Cycle de produção. WHAT/WHERE recebem cliques nos painéis reais com DOM controlado. O alvo incorreto de uso WHICH passa por Specification/Result/Evidence/Attempt reais.
- Sintaxe do teste alterado e **seis scripts de regressão PASS localmente**: WHERE live (ampliado), seleção de idioma, isolamento de idioma, aviso/Trail de 81 casos, fronteira de seleção Thinking Mind e Choice Evidence Packet Bridge de 43 verificações.
- O workflow Bootstrap já executa o teste ampliado. CSS, JS de runtime, corpus, Skill/Session, suporte de áudio e contratos permanecem intactos. Os resultados controlados não fecham a ocorrência física do clique em WHERE nem os testes T3–T8. Não houve nova observação do preview servido por navegador.

### Reteste mínimo para QWORD-RETURN-WHERE-01

Continuar na **mesma aba e nick** do T2, EN/Shopping, com WHAT 2/3, WHERE 2/3 e WHICH 1/3 guardados. Clicar WHERE uma vez, aguardar a atualização e conferir em conjunto:

1. O botão WHERE fica selecionado em THINKING MIND?
2. A Trail passa à avaliação WHERE 2/3, ou mostra WHICH e algum aviso de exploração/avaliação?
3. Surge o painel WHERE de função/localização?

Se persistir, enviar captura que reúna seletor e Trail/painel, com antes/depois. Preservar o ensaio sem recarregar: os circuitos retidos nesta implementação pertencem ao runtime da página atual. Essas perguntas delimitam o próximo dado necessário; não pressupõem a causa ou uma correção inexistente.

**Estados atuais:** T1 parcial (LANGUAGE confirmado; recuperação explícita original verificada automaticamente, aguardando relato humano); T2 parcial / QWORD-RETURN-WHERE-01 OPEN; **T3, T4, T5, T6, T7, T8 PENDING — não executados**. A homologação anterior de rolagem e cores permanece com o escopo já registrado. Nenhum GREEN é inferido dos testes de exploração ou deste registro.

## T2–T6 — capturas, densidade e redesenho — JAGUAR-LIVE-54

**Data:** 2026-10-08, America/Sao_Paulo. **Base:** `e024a85c0b7863cbd70c062c028e7e4e4f71b128`. A tabela do LIVE-52 e o estado do LIVE-53 acima são históricos; os relatos novos atualizam os testes abaixo.

**Anexos revistos:** `image(20261008-194411).png`, `image(20261008-194437).png`, `image(20261008-195350).png`, `image(20261008-200255).png`, `image(20261008-200839).png`; `WhatsApp Image 2026-10-08 at 17.36.49.jpeg`, `17.27.24.jpeg`, `17.25.52.jpeg`, `17.24.31.jpeg`, `17.37.36.jpeg` e `17.37.01.jpeg`. São capturas do preview anterior `f9ff9ba1`; não homologam antecipadamente o CSS deste checkpoint.

| Teste | Evidência nova e conclusão | Estado atual |
|---|---|---|
| T2 — QWords | Texto mostra WHICH 1/3 → WHERE 2/3, com WHAT 2/3 e WHICH salvos. O relato também menciona destaque WHICH. Os dois prints do seletor/Trail são de WHICH; falta captura conjunta do seletor no estado WHERE 2/3 | Recuperação da avaliação observada pelo usuário; destaque físico ainda OPEN em QWORD-RETURN-WHERE-01 |
| T3 — Palavras | All / these / three mostram tipos e det/nummod para books. O diagnóstico continua perguntando pelo núcleo de three; resposta correta é prática livre separada da avaliação | Parcial humano; relações observadas coerentes |
| T4 — Rolagem | Montagens mostram foco e faixas de rolagem em WHAT/WHERE/WHICH EN/ES. Palavras nas bordas estão parcialmente fora da área visível; isso não demonstra exclusão de tokens | Parcial; confirmação anterior de retenção no celular preservada |
| T5 — Laptop / formatos | Usuário relata possível palavra ausente e setas intermitentes; solicita rótulos azuis menores e caixas menos espaçadas | Ajuste implementado; reteste visual do novo preview pendente |
| T6 — Celular / orientação | Capturas Android em retrato/paisagem. Em retrato, foco the com can/we/find visíveis deixa the → salmon fora da faixa; em paisagem a relação det aparece na parte direita | Parcial humano; não comprova causa de falha no redesenho |
| T7 — Áudio | Usuário declara pendente | PENDING / não executado |
| T8 — Navegação | Usuário declara pendente | PENDING / não executado |

### Alterações aplicadas e limite da conclusão

- Tipo de palavra azul: **.75rem → .6875rem**, redução de aproximadamente 8%. Espaço entre caixas: **8px → 6px**. Gap interno: **5px → 4px**. Padding desktop: **8px/10px → 7px/8px**; estreito: **7px/8px → 6px/7px**. Largura mínima desktop/estreita: **86/82px → 80/76px**. A palavra principal mantém tamanho e forma inteira, os tipos podem quebrar linha e o diagrama longo continua rolável.
- `DEPENDENCY-DEFERRED-SVG-01`: regressão reproduz o renderer convertendo dimensão zero/NaN em SVG de 1×1 e sobrescrevendo o desenho. Falhou antes; passa com a correção que aguarda dimensão positiva/finita sem apagar o overlay válido. A superfície mantém o vínculo da interação à estrutura atual enquanto o SVG aguarda layout. Layout/resize/fontes/preview redesenham depois. Isso é uma falha de código confirmada, **não a causa demonstrada do relato físico**.
- O comportamento de seleção QWord não foi alterado: os handlers reais não reproduzem o destaque WHICH depois de selecionar WHERE nos testes controlados. Não fechar esse relato pelo resultado automático. O badge de prática marca o contrato; o destaque de exploração marca a QWord selecionada.

### Validação deste checkpoint

**14 scripts relevantes PASS localmente.** Três testes existentes ampliados continuam no workflow Bootstrap: conectores com dimensão inválida; superfície com o controlador compartilhado AUTO/PORTRAIT/LANDSCAPE, reflow/fontes e interação; e renderização/delegação real dos botões Thinking Mind. São **399 casos de token/formato nos 28 diagramas EN/ES/PT** e **189 casos de QWord/idioma/formato**, além de trocas apenas de idioma. Os tokens aparecem completos e na ordem canônica; as setas conservam origem/destino/rótulo e a mudança de formato conserva foco/rolagem e não seleciona outra avaliação. O primeiro render oculto seguido de exposição também conserva a estrutura correta para interação.

As regressões de T1/T2 com cadeia real, isolamento de idioma, as 81 projeções Trail e os 43 checks do Choice Bridge continuam passando. Cinco arquivos JS alterados passam sintaxe. Geometria DOM e transporte do seletor são controlados; a checagem não substitui CSS/navegador/dispositivo físico. Não há nova observação independente do preview servido. Publicação/Cloudflare e eventual estado Actions são registrados na PR #3 sem antecipar sucesso.

### Próximo reteste humano

No novo preview, conferir rótulos/cartões em AUTO → PORTRAIT → LANDSCAPE → AUTO e girar o celular, cruzando EN/ES/PT e as QWords utilizadas. Em frases longas, deslizar até o token focado e seu núcleo antes de conferir a seta. Se Trail WHERE 2/3 coexistir com botão WHICH destacado, registrar os dois juntos. T7/T8 seguem pendentes; não reiniciar circuitos completos já homologados. Cores aprovadas, áudio e evidência assistida conservam seus escopos. Revisão visual global e matriz humana completa continuam OPEN/parciais.

## Bolinha WHERE e comparação de idiomas — JAGUAR-LIVE-55

**Data:** 2026-10-08, America/Sao_Paulo. **Base:** `b553d08c3e5c7ff3b294ab6ec54ef4283ba3fb80`.

**Fontes:** relato de bolinha branca semipreenchida antes de responder sob novo nick e cinco montagens: `image(20261008-215215).png`, `image(20261008-220618).png`, `image(20261008-223506).png`, `image(20261008-224758).png`, `image(20261008-231110).png`. Todos revistos. As imagens mostram o nick `bbc9` e estados posteriores com respostas; não comprovam sozinhas a cronologia inicial antes da interação.

### Causa e correção visual

O código usava ◐ como badge da **Session selecionada**, mesmo com 0/3. Não era evidência aceita nem herança de competência, mas a reutilização do símbolo parcial confundia seleção e progresso. Agora o renderer consulta a projeção canônica das provas já aceitas, sem escrever avaliação:

| Situação do botão no idioma dono da avaliação | Badge | Significado |
|---|---|---|
| Avaliação selecionada, nenhuma exigência aceita | ○ | Avaliação selecionada / pronta, sem avanço demonstrado |
| Ao menos uma exigência do contrato aceita | ◐ | Avaliação em progresso |
| Fechamento confirmado registrado pela autoridade Green Pass | ★ | Green Pass conquistado |
| Só exploração ou tela em outro idioma sem selecionar seu circuito | Sem badge ativo daquele circuito | A seleção visual da QWord continua independente da avaliação |

Os títulos/ARIA de seleção estão em EN/ES/PT. A regra vale para WHICH/WHAT/WHY/WHERE. Um diagnóstico de núcleo observado ou uso assistido sozinho não transforma ○ em ◐; um conjunto completo de requisitos sem fechamento canônico não inventa ★. A marca de avaliação pronta não muda a cor/palavra selecionada nem produz Session/Evidence.

### O que a comparação demonstra

- A ausência do badge EN ao alternar apenas LANGUAGE para ES/PT segue o escopo: a avaliação continua EN, visível no aviso de tela/avaliação. Isso não demonstra perda de progresso. Selecionar DÓNDE/ONDE explicitamente escolhe ou recupera o circuito próprio daquele idioma.
- WHAT aparece como diagnóstico/prática exploratória nos três idiomas na primeira montagem; WHICH EN mantém 1/3 durante os displays ES/PT na segunda. As montagens WHERE mostram 2/3 no Shopping e fechamento 3/3 em Preparing, incluindo registros confirmados mantidos sob outro idioma de tela e estrelas após seleção explícita do idioma correspondente.
- A última montagem mostra **WHAT selecionado**, frase e diagnóstico WHAT atualizados, e avaliação **WHERE confirmada** preservada. Portanto o botão responde na exploração; a prova de WHAT não se abre porque a origem continua Shopping/WHERE e falta a rota explícita de adoção WHERE → WHAT em Preparing. Registrar **ENTRY-WHERE-TO-WHAT-01 OPEN**, sem contornar autoridade ou alterar o 3/3 concluído. Não confundir essa lacuna com o badge de 0/3.

### Testes e estados

O teste existente `test-verb-explorer-thinking-mind-trilanguage.js` falha antes com ◐ em 0/3 e passa após a correção. **288 casos** usam os módulos reais de contrato/progresso/Trail/marcador com quatro skills × três idiomas donos × oito estados de evidência × três idiomas de tela. Cobrem novo nick, resposta errada, núcleo exploratório, uso apenas assistido, uma/duas provas aceitas, três antes do fechamento e fechamento canônico. Repetir a projeção conserva o estado integral. Mantém os **189 casos** de QWord/idioma/formato e sua seleção visual.

O teste WHERE live reproduz em **seis circuitos EN/ES/PT × Node/browser VM** o bloqueio de WHAT no destino após WHERE 3/3: não nasce nova Session nem Evidence; a avaliação/provas/trace anteriores ficam idênticos e WHERE retorna com o painel preservado. Trata-se da fronteira atual e de uma lacuna de entrada ainda não integrada, não de uma funcionalidade concluída.

**10 scripts relevantes PASS localmente**, incluindo linguagem, cadeia real de avaliação, 81 casos Trail, 43 Choice Bridge e as autoridades de progresso/marcador. Três arquivos JS alterados passam sintaxe. DOM/input do marcador são controlados; a revisão física da nova apresentação ainda está pendente. CSS/paleta/diagramas, corpus e autoridades de ativação não foram alterados. Publicação/Cloudflare e eventual estado Actions ficam na PR #3.

**Continuidade:** T2/comparação de idiomas parcial; ENTRY-WHERE-TO-WHAT-01 OPEN; QWORD-RETURN-WHERE-01 anterior não reproduzido/não fechado globalmente; T7 áudio PENDING; T8 navegação agora parcial pela visita a Preparing e preservação do registro, sem homologar todo Back/Forward/retorno. Conferir ○ antes de responder, ◐ após prova aceita e manutenção do escopo ao trocar LANGUAGE no novo preview. Preservar o ensaio aberto anterior em outra aba.




