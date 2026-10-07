# Explorer — AUTO / PORTRAIT / LANDSCAPE e Dependency Focus

**Checkpoint:** JAGUAR-LIVE-47  
**Registro:** 2026-10-07, America/Sao_Paulo  
**Branch:** `jaguar/verb-explorer-resume-live-wire` — PR #3 existente  
**Base:** `050b3c8c98698fa0a7990dd5b90827399575d6ec`  
**Estado:** implementação publicada; regressões e conferência dos três formatos concluídas; homologação humana dos novos ajustes no celular em WAIT.

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
| 8 | Conferência humana dos ajustes no celular pelo usuário | WAIT |

**Retomada:** passo 8 — usuário confere os novos ajustes no celular. Não refazer
os circuitos humanos já demonstrados para preencher pendências antigas.

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
ao contêiner. O registro permanece WAIT até a conferência humana dos ajustes.

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

A homologação humana dos novos ajustes no celular permanece WAIT. CI/deploy
bem-sucedidos isoladamente não encerram a homologação visual.
