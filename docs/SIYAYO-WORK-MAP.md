# SIYAYO Work Map — Master VIP

Checkpoint ativo desta branch: **JAGUAR-MVP-15-POSSESSIVES**, 29/10/2026.

Este mapa acompanha exclusivamente a branch `jaguar/master-vip-modular-site-print-20261026`. O Work Map geral permanece na branch do Explorer; não substituímos seu checkpoint nem copiamos sua arquitetura.

Referência geral: [SIYAYO-WORK-MAP do Explorer](https://github.com/siyayoacademy/siyayo-academy/blob/jaguar/verb-explorer-resume-live-wire/docs/SIYAYO-WORK-MAP.md).
Registro atual: [checkpoint JAGUAR](master-vip-jaguar-checkpoint.json), [mapa completo](MASTER-VIP-MODULAR-SITE-PRINT-MAP.md), [módulos](master-vip-modular-registry.v0.2.json), [apresentação](master-vip-presentation-registry.v1.json), [handoff XPR](master-vip-xpr-handoff.json).

## Homologação registrada

Professor aprovou o padrão visual e confirmou áudio funcional nos cartões revisados. Commits: `cfb3e696ea3a3f23c4db02fb4d0c89c797b85af7` e `4f585b014502700984f211ee70345b4440a4898e`. Homologação deste padrão não equivale à revisão de toda a apostila, de todas as vozes ou à prova física A4.

| Eixo | Guia para os capítulos restantes |
|---|---|
| HOW TO DO | Reutilizar renderUnit / moduleNode / speechCard e o controlador MasterVIPSpeech. Capítulo → seção → unidade → subbloco por função/idioma. Não clonar controladores por capítulo. |
| HOW TO RECORD | Preservar IDs e localizadores Pxxxxx, origem/hash, idiomas disponíveis, relações exercício/gabarito e figura; atualizar catálogo, mapa e cobertura por lote. Registro de apresentação é derivado, não segunda fonte de texto. |
| HOW TO SHOW | Quicksand/Nunito Sans, azul espectral/dourado; explicações 21px desktop/20px portrait, função identificada; speaker dourado à esquerda e texto centralizado. No quadro de classes: inicial maiúscula, classe em negrito com dois-pontos, quebra de linha antes da palavra-alvo. |
| HOW TO CHECK | Reutilizar testes já concluídos; verificar o delta: integridade do novo trecho, idioma, referências, gabarito isolado e seleção de impressão. Reabrir auditoria somente por mudança, falha ou divergência observada. |
| HOW TO SPEAK | Cartão textual inteiro clicável e operável por teclado; sem botões repetir/parar. Novo clique cancela a leitura anterior. EN/ES/PT corretos; sem autoplay ou leitura automática de respostas fechadas. |

O registro de apresentação v1.1 distingue pattern_homologated=true (padrão aprovado) de homologated=false (corpus completo e prova física ainda pendentes). O checkpoint registra o escopo vigente.

## Prioridade e próximo GO

**Prioridade primária: integrar a apostila inteira ao site com rapidez e rastreabilidade, usando o padrão homologado.** Novos refinamentos visuais ficam para seu momento, salvo defeitos que bloqueiem leitura, integridade ou navegação.

Próximo ELO executável: **MVP16 — P03916 To be · other forms**. Delimitar o próximo bloco da fonte já auditada, importar seus textos em módulos e registrar relações, lacunas e cobertura. Não iniciar outra arquitetura para realizar essa importação. Catálogo atual 0.13.0: 716 unidades; cobertura textual 14,7004%, não confundir arquitetura pronta com corpus completo.

Circuito de cada lote: Corpus Master VIP → Site interativo → HOW TO DO → HOW TO RECORD → HOW TO SHOW → conferência/homologação. Entrega deve fechar origem, exibição, navegação, speech aplicável e seleção print; pendências editoriais são explícitas. GEAR, Multiverse 360° e novas experiences são consumidores futuros desse circuito, não integrações já realizadas.

## Retomada sem regressão

1. Recuperar checkpoint, branch ativa e commits homologados.
2. Consultar este Work Map e registros de governança existentes.
3. Identificar bloqueios conhecidos e alternativas registradas no checkpoint.
4. Retomar o próximo ELO executável sem repetir auditorias concluídas.
5. Registrar somente decisões novas e resultados reais.

Sem alterações em main, PR #3, contratos avaliativos, D1 ou produção. Impressão física A4 permanece pendente. Supervisão contínua não é declarada instalada por este registro.


## Resultado MVP12

25 unidades QUALITY & STATE importadas; 151 novos alvos speech. Fonte P02430–P02682, tabela T0017, oito ocorrências de imagem e cinco composições XML. [Evidências e limites](MASTER-VIP-MVP12-QUALITY-STATE.md). Novo conteúdo implementado/testado localmente; revisão humana e composição visual pendentes. Padrão homologado anterior preservado.


## Resultado MVP13

39 módulos novos: P02683–P02794, To be in your hand e Noun Helpers. 129 alvos speech adicionais. Fonte preservada, 18 ocorrências pedagógicas de imagens e pixel técnico separado; seis composições XML registradas, revisão contextual/visual pendente. [Evidências e limites](MASTER-VIP-MVP13-IN-HAND-HELPERS.md). NEXT GO P02795 Substitution Drills. Padrão homologado reutilizado; nenhuma nova arquitetura ou auditoria de infraestrutura.


## Resultado MVP14

105 unidades de Substitution Drills / Build Sentences incorporadas; fonte P02795–P03523, T0019/T0020. 50 fichas históricas, dois modelos resolvidos e 48 exercícios sem gabarito fabricado. 323 novos alvos speech. [Evidências e limites](MASTER-VIP-MVP14-SUBSTITUTION-DRILLS.md). NEXT GO MVP15: P03524 Possessive Pronouns.


## Continuidade de publicação — incidente resolvido no MVP14

Arquivos temporários de empacotamento em /tmp desapareceram durante o envio; o corpus, os testes e os mapas em workspace permaneceram intactos. Retomada aplicada: refazer somente o pacote em qa/upload-m14 dentro do workspace, excluído do envio, preservando a importação e as verificações concluídas. Usar esse estágio de trabalho para novos lotes em vez de depender de /tmp; publicar arquivos pequenos por conteúdo na árvore e grandes por blob, com atualização de branch protegida por expected_sha. Isso é procedimento de publicação, sem mudança de arquitetura ou de autoridade pedagógica.


## Resultado MVP15

173 unidades de possessivos incorporadas, P03524–P03915. T0021/T0022/T0023: um modelo original resolvido e 145 exercícios sem gabarito criado. 244 novos alvos speech; 14 parágrafos fragmentados preservados sem ativação de voz e com aviso de revisão. [Evidências e limites](MASTER-VIP-MVP15-POSSESSIVES.md). NEXT GO MVP16: P03916 To be – other forms. Publicação retoma o estágio em qa no workspace, conforme o incidente já resolvido no MVP14.


### JAGUAR-MVP-15-R1 — refinamento de leitura · 2026-10-29
- HOW TO DO: manter o inventário de objetos Word em details técnico fechado; é rastreabilidade, não conteúdo pedagógico. Reprodução vetorial segue pendente, sem figura inventada.
- HOW TO SHOW: mapa de seções em contêiner expansível nativo, fechado inicialmente; seletor de seção continua disponível. Estado de abertura preservado na navegação interna.
- HOW TO CHECK: Anterior/Próximo e links internos focam slideSurface com preventScroll e rolam ao início do slide (margem 20px); não ao cabeçalho reading. Navegação sequencial e expansão verificadas em navegador; regressão de catálogo e 2387 alvos speech GREEN.
- HOW TO RECORD: corpus permanece 716 unidades, cobertura textual 14,70036%; nenhuma nova homologação humana ou física presumida. Escopo exclusivo Master VIP; main, PR #3, Explorer, D1 e produção preservados.
- Próximo ELO de corpus mantido: MVP16 · To Be — Other Forms · P03916.
