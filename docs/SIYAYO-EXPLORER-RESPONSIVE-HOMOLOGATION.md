# Explorer — AUTO / PORTRAIT / LANDSCAPE e Dependency Focus

**Checkpoint:** JAGUAR-LIVE-47  
**Registro:** 2026-10-07, America/Sao_Paulo  
**Branch:** `jaguar/verb-explorer-resume-live-wire` — PR #3 existente  
**Base:** `050b3c8c98698fa0a7990dd5b90827399575d6ec`  
**Estado:** implementação preparada; verificações e homologação visual em andamento.

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
| 2 | Instalar barra AUTO/PORTRAIT/LANDSCAPE e contêiner comum no Explorer | IMPLEMENTED |
| 3 | Fazer o layout responder à largura do contêiner nos três formatos | IMPLEMENTED: consultas de largura do Explorer usam o contêiner nomeado |
| 4 | Corrigir fontes, densidade dos cartões e legibilidade das relações | IMPLEMENTED: palavras inteiras, metadados legíveis e rolagem apenas do diagrama |
| 5 | Recalcular setas após largura/formato/fontes, preservando o foco | IMPLEMENTED: atualização visual sem refazer a avaliação |
| 6 | Executar regressões pertinentes e conferir composição nos três formatos | REGRESSIONS PASS: 44/44; conferência visual no preview em andamento |
| 7 | Publicar no branch existente; verificar arquivos, CI e preview | PENDING |
| 8 | Conferência humana dos ajustes no celular pelo usuário | WAIT |

**Retomada:** continuar pelo primeiro passo PENDING. Não refazer os circuitos
humanos já demonstrados para preencher pendências antigas.

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

Os 44 scripts existentes `scripts/test-*.js` passaram, sem alterações em testes
ou workflows. A validação de sintaxe dos dois scripts novos/alterados passou.
Os 369 arquivos de base disponíveis na cópia de trabalho conferem com os blobs
Git do HEAD, exceto os quatro arquivos de alteração autorizada; os dois arquivos
comuns conferem exatamente com os blobs do Pianinho.

O navegador de conferência não alcança o servidor local (connection refused).
As verificações visuais dos três formatos serão feitas no preview publicado da
mesma branch, após o deploy. Não houve execução TinyFish.

PENDING: registrar conferência visual, readback, CI e deploy efetivamente obtidos.
A homologação humana dos novos ajustes no celular permanece WAIT. CI/deploy
bem-sucedidos isoladamente não encerram a homologação visual.
