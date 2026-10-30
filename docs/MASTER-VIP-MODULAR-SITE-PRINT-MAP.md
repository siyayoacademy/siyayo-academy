# Master VIP The Ten Kinds of Words
> Histórico do MVP02. O subsite avançou até o MVP10; consulte MASTER-VIP-CONTENT-PROGRESS.md para a cobertura atual e MASTER-VIP-READABILITY-SPEECH-PLAN.md para o plano de leitura/speech ainda não implementado.

## MVP 02 Mapeamento modular do subsite e da edição imprimível

Data: 2026-10-26. Estado: ESPECIFICADO. Esta entrega registra arquitetura e backlog; não declara subsite, editor, compartilhamento, impressão ou habilidade instalados.

## Origem e destino
Repositório siyayoacademy/siyayo-academy. Branch própria: jaguar/master-vip-modular-site-print-20261026. Base isolada: main em c2149f5e63b8de716cf9b9dcdede213bd328344e. A base mantém INDEX/CHAPTERS existentes; esta etapa adiciona somente documentação e manifest inicial. Governança mais recente é consultada por referência, sem copiar laboratórios para a base.
Destino previsto: /master-vip/index.html, título Master VIP The Ten Kinds of Words. Nenhuma URL de preview é considerada existente antes da confirmação do deploy.

Original preservado: STRUCTURE-KIND OF WORDS.docx, Biblioteca libfile_aa3a9cd10ef88191ba4dd2b11dfc2e4a, SHA256 99c63e41b4bb3ad74133dbf8a272993494fcef1cd4cd398b8f0ed2256aaf553c. IDs Pxxxxx do inventário são localizadores desta revisão, não IDs pedagógicos permanentes. Reconhecer eventual versão diferente antes de reutilizar paginação histórica.

## Referências consultadas
Branch jaguar/module-governance-reg03-impact-20261025:
- docs/SIYAYO-WORK-MAP.md (blob b37cecb8764f03f6478b788520a40487538c796b)
- docs/siyayo-canonical-development-map.md (blob 4f2851f9bae5289ff01efdc72a97252e188f451f)
- docs/SIYAYO-MODULE-GOVERNANCE-REGISTRY.md
- docs/SIYAYO-BACKSTAGE-FLOW-REGISTRY.md
- docs/SIYAYO-IMPACT-INTEGRATION-MAP.md
- docs/JAGUAR-90C4-LOGIC-HOW-TO-SHOW-PRINT-GATE.md
- docs/JAGUAR-90C7H5-MASTER-VIP-REFERENCE-MAP.md (blob 1b3d3ac79123796e3c00e96b881715774952291a)
- docs/JAGUAR-H14-7-MASTER-VIP-FIVE-FUNCTION-MATRIX.md (blob 67de83aade64ef5d6e25f1d4f9e5a66733c80661)
INDEX consultado em main (blob 5a94456f4235994e93787acad1135c921a4d87b1). Fontes Quicksand/Nunito Sans e paleta homologada já identificadas no CSS e reiteradas pelo WORK MAP.
A leitura é seletiva dos mapas pertinentes, não auditoria de todos os arquivos docs. Referências históricas descrevem snapshots, não o estado atual de todos os laboratórios.

## Decisão arquitetural
Uma base de conteúdo versionada alimenta dois renderizadores: leitura em contêineres/slides e composição contínua A4. Um slide não equivale a uma página impressa. Não manter três transcrições divergentes para as edições EN→PT, EN→ES e EN→ES→PT.
Unidade estável → capítulos/seções → projeção web e projeção print. Alteração editorial é uma mudança de fonte com revisão; abrir um módulo ou mover slides não altera contratos ou gera Evidence.

## Hierarquia identificável
| Nível | Identidade proposta | Responsabilidade |
|---|---|---|
| Portal | MVP:INDEX | Índice integral e busca por título, termo, classe e eixo |
| Capítulo | MVP:CH:EXISTENCE | Contêiner de leitura, sumário local e referências |
| Seção | MVP:SEC:EXISTENCE:PRESENT | Divisão pedagógica reutilizável |
| Slide | MVP:SL:EXISTENCE:PRESENT:MODEL:001 | Unidade de apresentação, ordem versionada |
| Conteúdo | MVP:UNIT:EXISTENCE:EXAMPLE:001 | Texto, tabela, exercício ou explicação independente da tela |
| Figura | MVP:ASSET:0001 | Arquivo original e derivados com proporção preservada |
| Frase | MVP:SENT:000001 | Alinhamento EN/ES/PT, contexto e variantes |
| Palavra | MVP:TERM:000001 | Lema e função no contexto, remissões |
| Perfil de saída | MVP:EXPORT:A4:EN-ES-PT | Seleção, idioma, paginação e versão |

Estes IDs pertencem ao novo namespace editorial proposto; não substituem SIA:FUNC-13 ou IDs existentes de corpus. Conexões com a Academy são arestas com proveniência e tipo de relação, não equivalências presumidas. Seções recorrentes compartilham tipo de componente, mas cada instância tem identidade e conteúdo próprios.

## Mapa inicial de capítulos
| ID local | Conteúdo identificado na apostila | Seções recorrentes e relações |
|---|---|---|
| ORIENTATION | Homework Control, Itinerary, A Nice Party, General Checklist | Apresentação, uso, plano e checklist |
| FOUNDATIONS | Dez tipos, cinco funções, ordem, English Face | Conceito, diagrama, exemplo e prática |
| TOOLS | To Be/To Do, auxiliares, Curious Hands, English In Your Hand | Modelo, comparação, figura e remissão |
| TO-BE | Quality/State, pessoas, possessivos, perguntas | Regra, tabela, exemplo, speaking e gabarito |
| QUESTIONS | Question Words e construção interrogativa | Intenção, pergunta/resposta e contrastes |
| MOVEMENT | To Be + ing | Conceito, timeline, exemplo, exercício e resposta |
| ACTION-PRESENT | Rotina/hábito e presente | Modelo, mixing, construção, QW e speaking |
| ACTION-FUTURE | Will/going to | Comparação contextual, construção e prática |
| ACTION-PAST | Passado e regulares/irregulares | Modelo, contraste e prática |
| PERFECT-PERIOD | Present Perfect/Past Perfect e PERIOD | Linha temporal, exemplo, contraste e revisão |
| EXISTENCE | THERE + TO BE | Singular/plural, tempo/modo, quantidade, contexto e prática |
| VERBAL-SYSTEMS | Passiva, sujeito, condicionais e modais | Explicação, quadro e aplicação |
| WORD-CLASSES | Nouns, Pronouns, Articles, Adjectives, Adverbs, Prepositions, Conjunctions, Numbers, Interjections | Subcapítulo autônomo por classe |
| VERB-LEXICON | Studying Verbs, irregulares e phrasal verbs | Glossários, famílias, uso e remissões |
| REFERENCE | Índices, respostas e glossários transversais | Links bidirecionais com unidade de origem |

Esta organização é inicial: fronteiras e títulos finais exigem reconciliação com todos os blocos do inventário. As seções de respostas podem aparecer no livro ao final, mas permanecem ligadas aos exercícios de origem.
WORD-CLASSES terá nove subcapítulos autônomos; VERB continua explicitamente nos capítulos verbais. Não reduzir o método a nove tipos. MOVEMENT mantém seu sentido didático original, distinguindo progressivo de deslocamento lexical.

## Tipos recorrentes de seção
INTRODUCTION, CONCEPT, MODEL, TABLE, TIMELINE, FIGURE, EXAMPLE, CONTRAST, GUIDED_PRACTICE, FREE_PRACTICE, SPEAKING, REVIEW, CHECKLIST, ANSWER_KEY, GLOSSARY, CROSS_REFERENCE.
Cada capítulo usa apenas os tipos pertinentes; não preencher automaticamente todos. Cabeçalho mostra título legível e código consultável. Descrição editorial e status ficam em área de bastidores, sem poluir o material do aluno.

## Navegação do INDEX e do capítulo
O mesmo INDEX contém lista de capítulos e índice de palavras-chave. Abre capítulo/ seção/slide por link estável, mantendo retorno ao INDEX, breadcrumb e anterior/próximo opcionais. Navegação livre e acesso direto; nenhuma conclusão obrigatória para desbloquear outro capítulo. Busca combina termo e aliases, idioma, classe, função, TENSE, MODE e QW.
Rota proposta: /master-vip/?module=MVP%3ACH%3AEXISTENCE&section=MVP%3ASEC%3AEXISTENCE%3APRESENT&edition=en-es-pt#MVP-SL-EXISTENCE-PRESENT-MODEL-001.
O roteador deverá validar IDs e apresentar recuperação ao índice quando um ID não existir. Links antigos recebem alias/redirect mapeado. Navegação por teclado, foco após troca de slide, URL e histórico devem funcionar juntos.

A edição visível não é idioma de avaliação. Não há requisito de NICK para consulta. Não carregar PATITA, avaliadores, banco ou escopo de progresso apenas para abrir a Master.

## Frases e palavras alvo
A frase conserva texto integral, idiomas alinhados, contexto, função, classe, tempo, modo e proveniência. Destaque é anotação por token/intervalo com versão do texto; nunca substituição global de uma palavra em todas as frases. A mesma palavra pode exercer funções diferentes.
Cada termo registra lema e formas por idioma, aliases, classe no contexto e links às frases e glossários. Traduções não precisam ter correspondência token a token. Vínculo exercício→gabarito e pergunta→resposta é explícito.
Conferir ortografia, acentos interrogativos, pessoa, número, intenção e equivalência; distinguir MASTER_ORIGINAL, SIYAYO_ADAPTATION e COMPLEMENTARY_STUDY. Texto não revisado não recebe rótulo HOMOLOGADO.

## Imagens em submódulos
Cada figura recebe slide/contêiner próprio e referências ao conceito/exemplo que ilustra. Registrar original, hash, formato, pixels, modo/cor, transparência, dimensões de uso no DOCX em mm, recorte e resolução efetiva. Preservar proporção; width proporcional ao espaço disponível, altura automática e limite de ampliação. Não esticar miniaturas.
O registro de asset e o registro de ocorrência são distintos: uma imagem pode aparecer em vários contextos e tamanhos. Preservar uso original como baseline; cada versão Fine Art é derivado identificado, sem sobrescrever o original.
Atualização: manter asset ID e versionar arquivo/metadata, conferir todas as ocorrências consumidoras, legenda, alt text, qualidade na impressão, direitos e aceite. Completar VML e reconciliação de alternativas antes de declarar inventário visual fechado.

## Visual web e impressão
Web: azuis espectrais, dourados homologados, Quicksand/Nunito Sans, contêineres semelhantes a INDEX/CHAPTERS e bordas do sistema. Usar tokens compartilhados onde existentes, com CSS escopado à Master para evitar alterações no Explorer.
Preservar A5/Chapters com contrato conciso de dez slides; a Master terá quantidade variável por capítulo. Analogia visual não impõe dez slides à apostila integral.
Print: fundo claro, texto legível, acentos e sinais que funcionem em P&B, A4, área para escrita, margens de encadernação e ordem contínua. Slides ocultos na tela não podem desaparecer por acidente da seleção de impressão. Imprimir capítulo deve incluir todos os seus itens selecionados, referências e gabarito conforme escolha; tabelas repetem cabeçalho e figuras preservam escala.
Web responsive e PDF imprimível têm verificações independentes. Diálogo de impressão é controlado pelo navegador; impressão direta silenciosa não é prometida.

## Fluxo de edição ágil
Primeira fase: editar arquivos de conteúdo e manifest na branch, com revisão Git e validação. Uma interface de leitura com botões não constitui editor persistente.
Fase futura: formulário editorial com rascunho, validação, diff e exportação de alterações; persistência no repositório exige mecanismo autenticado próprio. Não incluir token GitHub no navegador. Conflitos de revisão devem ser detectados antes de gravar.
Importação integral será por lotes, preservando original e inventário. Medir cobertura por blocos de conteúdo, tabelas e ocorrências de imagem, não por quantidade de slides. Unidade não mapeada aparece em relatório de lacunas. Nenhum descarte silencioso de material repetido.

## Compartilhamento e impressão modular
Componentes propostos MVP:SHARE e MVP:PRINT:
- Compartilhar link profundo com module/section/slide/edition, com fallback copiar link.
- Imprimir seleção de slide, seção, capítulo, vários capítulos ou livro.
- Escolher EN→PT, EN→ES ou EN→ES→PT e incluir/excluir gabaritos.
- Gerar saída com versão editorial, IDs e proveniência do conteúdo; só declarar PDF gerado quando o arquivo existir e for verificado.
- Futuro cartão/imagem compartilhável exige layout e revisão próprios; não confundir share de link com exportação visual.
Especificação de habilidade especializada futura: Master VIP Share Print Modular. Entradas: IDs, edição, perfil A4, seleção e gabaritos. Procedimento: resolver fonte e versão, validar relações e direitos, compor, renderizar, conferir e salvar. Saídas: link/arquivo e relatório de checagem. Estado ESPECIFICADA, não instalada. Sua criação instalável seguirá a habilidade skill-creator em ELO próprio.

## Acesso entre branches e publicação
Uma branch não serve páginas automaticamente. Reservar uma URL de preview confirmada da branch Master como referência consultável. Outras branches poderão apontar por URL absoluta e deep link, sem copiar o corpus. Links relativos só servem quando /master-vip/ existe no mesmo deploy. Registrar URL resolvida, commit e estado; nunca inventar URL Cloudflare a partir do nome da branch.
Referência móvel acompanha desenvolvimento; referência congelada identifica commit/versão para auditoria. Alterar link de entrada de outra branch será lote seletivo posterior. Nenhuma mudança no INDEX principal nesta etapa.
O mapa histórico tratava o original como privado e permitia apenas espelho de referência. A presente solicitação define intenção de subsite integral; a etapa atual publica apenas arquitetura sem conteúdo integral. Antes de publicar o corpus integral, resolver explicitamente audiência e direitos das mídias; preservação do original na Biblioteca não equivale a publicação pública do arquivo.

## Cinco eixos e dependências
HOW TO DO: unidades pedagógicas e modelos. HOW TO RECORD: IDs, proveniência, versões e cobertura. HOW TO SHOW: INDEX, contêineres, slides e print. HOW TO CHECK: validadores, revisão contextual, visual e preflight. HOW TO SPEAK: texto por locale e pronúncia futura, sem depender de áudio para consulta ou avaliação.
Reutilização documental REG-01/02/03; dependências candidatas: INDEX/CHAPTERS, palette, tipos e corpus de referência. FUNC-13 e master-existence são fontes de comparação, não autoridades copiadas. Não integrar código de EVAL/ID/TRAIL/WORD/PATITA para obter aparência de contêiner.
Eventos futuros, locais: master-vip:navigation-changed e master-vip:export-requested. Não emitir eventos canônicos de aprendizagem.

## Sequência executável
1. MVP 02 atual: branch própria, documento e manifest inicial.
2. MVP 03: reconciliar catálogo integral e fronteiras; assets/ocorrências VML; cobertura e fontes herdadas.
3. MVP 04: construir /master-vip/ com INDEX, contêiner, slides, busca, deep links, componentes acessíveis e estados vazios.
4. MVP 05: importar capítulo EXISTENCE completo com proveniência, figuras, tabelas e exercícios; revisar três edições e prova A4.
5. MVP 06: implementar share link e impressão modular; validar gabaritos, seleções e navegação.
6. MVP 07: importar demais capítulos por lotes com relatório de cobertura, atualização Fine Art e links cruzados.
7. MVP 08: habilidade instalável e edição assistida conforme contrato validado; validação de persistência.
8. MVP 09: regressão integral, homologação separada web/conteúdo/print, preview confirmado e entradas nas branches consumidoras.

Critérios: IDs únicos e referências resolvidas; seleção e ordem previsíveis; original íntegro; gabarito não revela resposta na questão; nenhuma evidência/contrato alterados; telas desktop/portrait/landscape; teclado; print A4 completo e P&B; fontes e figuras verificadas.
Estados independentes: ESPECIFICADO, IMPLEMENTADO, TESTADO_LOCALMENTE, PENDENTE, HOMOLOGADO, INTEGRADO e PUBLICADO. Cada estado exige evidência própria. CI GREEN não integra nem homologa.

## Resultado deste checkpoint
Somente mapa e manifest publicados na branch própria. Subsite e habilidade continuam pendentes. Não houve alteração de main, PR 3, produção, avaliações, D1 ou watchlist. O próximo ELO concreto é fechar cobertura e implementar o shell modular com o piloto THERE + TO BE.


## Atualização de entendimento — 29/10/2026 — leitura, submódulos e speech

Solicitação em modo de indagação: registrar o plano, sem implementar a interface. Estado deste refinamento: ESPECIFICADO / PENDENTE.

A hierarquia identificável já existe no catálogo 0.9.0 (374 unidades): capítulo → seção → unidade/slide e frases identificadas onde cadastradas. Complementar a identidade dos subblocos explicativos, exemplos e exercícios antes de torná-los Speech Cards. O mesmo componente especializado será reutilizado por instâncias com identidade própria, sem clonar conteúdo.

Adotar como referência o padrão homologado Chapters/DNA Explorer/LINES/POSSIBLE RESPONSES: speaker SVG dourado à esquerda e frase centralizada, com alinhamento consistente entre os módulos. Reutilização exata do SVG/componente depende da identificação da versão de referência, não de desenho aproximado. O speech não está instalado na Master VIP por este registro.

Ampliar especificamente a leitura dos textos explicativos para o usuário, diferenciando explicação, exemplo e exercício; proposta inicial de prova 20–22px para o corpo explicativo, sujeita à conferência. Não promover aumento global de fontes nem transpor a escala web ao A4.

Plano em seis etapas: (1) identidade/referências; (2) hierarquia e leitura web; (3) componente de speech; (4) piloto THERE + TO BE; (5) aplicação aos módulos existentes; (6) impressão/acessibilidade e validação final. A etapa 5 poderá ser dividida em lotes; seis etapas não significam seis commits garantidos.

Especificação completa: [Master VIP — leitura clara, submódulos e speech](MASTER-VIP-READABILITY-SPEECH-PLAN.md). Incluir controles por idioma/texto, ação explícita, ausência de sobreposição e leitura do gabarito somente quando escolhido. Preservar navegação livre, fonte original, IDs, impressão modular e independência de NICK/avaliação/D1.

Este lote registra somente documentação. Nenhuma alteração de HTML/CSS/JS, catálogo, fontes, PDF, main, PR #3, D1 ou produção. Testes visuais, vozes, integração e homologação deste refinamento continuam pendentes.



## ELO MVP11 — leitura e speech modular

Execução autorizada com a ressalva do cartão inteiro clicável, speaker dourado decorativo à esquerda e sem botões repetir/parar. Referência, dependências, estados e evidências em MASTER-VIP-MVP11-READABILITY-SPEECH.md. Registro de 374 unidades / 1.540 alvos em master-vip-presentation-registry.v1.json. Explicações 21px desktop/20px portrait; impressão independente. Testado localmente; homologação humana visual/áudio/A4 pendente. Catálogo e cobertura de conteúdo inalterados. Novos lotes devem adotar este contrato.


## ELO MVP11.1 — tipos de palavras em duas linhas

29/10/2026: professor confirmou áudio funcional nos cartões revisados. Confirmação humana parcial; não presume revisão integral de todas as vozes/blocos. Ajuste solicitado no WORD_TYPE_MAP: nome da classe com inicial maiúscula e demais letras minúsculas em EN/ES/PT, negrito e dois-pontos, quebra de linha explícita antes do exemplo. Aplicado pelo renderizador em tela e impressão; catálogo, IDs, alvos e comportamento speech preservados. Exemplo: Substantivo: / cenoura. Sem novos botões de áudio.


## JAGUAR-MVP-11.2 — homologação e continuidade

29/10/2026: professor homologou o padrão visual e confirmou áudio funcional nos cartões revisados, incluindo classe com inicial maiúscula e quebra de linha antes do exemplo. Este registro atualiza os estados históricos de pendência acima somente nesse escopo; conteúdo integral e A4 físico não estão homologados. Guia vigente HOW TO DO/RECORD/SHOW/CHECK/SPEAK: [Work Map](SIYAYO-WORK-MAP.md). [Checkpoint](master-vip-jaguar-checkpoint.json) e [referência XPR](master-vip-xpr-handoff.json). Prioridade primária: importar o restante da apostila com o componente aprovado. NEXT GO: MVP12, P02430 QUALITY & STATE; não repetir auditorias concluídas ou abrir arquitetura paralela.


## JAGUAR-MVP-12 — QUALITY & STATE

GO executado: P02430–P02682, 25 unidades originais, 253 parágrafos classificados, T0017, oito ocorrências de imagens e cinco composições XML preservadas. Catálogo 0.10.0, 399 unidades / 1.691 alvos speech; 10,6841% dos caracteres da fonte. Padrão de apresentação homologado reutilizado; novo conteúdo e composição visual ainda em revisão. Evidências: [MVP12](MASTER-VIP-MVP12-QUALITY-STATE.md). NEXT GO: P02683 To be in your hand, sem reabrir auditorias concluídas.


## JAGUAR-MVP-13 — To be in your hand / Noun Helpers

P02683–P02794 incorporados: 39 módulos, 112 parágrafos classificados, T0018, 18 ocorrências de imagem e um pixel técnico, seis composições XML. Catálogo 0.11.0: 438 unidades / 1.820 alvos speech; 11,3924% dos caracteres da fonte. Contraste local em camadas transparentes, sem alterar seus bytes. Fonte e revisões contextuais separadas. [Registro completo](MASTER-VIP-MVP13-IN-HAND-HELPERS.md). NEXT GO MVP14: P02795 Substitution Drills, usando o circuito existente.


## JAGUAR-MVP-14 — Substitution Drills / Build Sentences

P02795–P03523: 105 unidades, 729 parágrafos classificados, duas tabelas. Cinquenta fichas históricas e cinquenta itens de construção; dois modelos preenchidos e 48 exercícios sem respostas fornecidas. Catálogo 0.12.0: 543 unidades / 2.143 alvos speech; 12,7095% dos caracteres de origem. Grade, número/modo/enunciado separados sem alterar a fonte. [Registro completo](MASTER-VIP-MVP14-SUBSTITUTION-DRILLS.md). NEXT GO MVP15: P03524 Possessive Pronouns.


## JAGUAR-MVP-15 — Possessive Pronouns

P03524–P03915: 173 unidades, 392 parágrafos classificados, três tabelas, oito ocorrências de imagens e pixel técnico separado, cinco composições XML. Três séries: 50/52/44 itens; um modelo preenchido na fonte e 145 exercícios sem gabarito acrescentado. Quatorze parágrafos truncados/concatenados permanecem como texto estático, sem falsa disponibilidade de áudio. Catálogo 0.13.0: 716 unidades / 2.387 alvos speech; 14,7004% dos caracteres de origem. [Registro completo](MASTER-VIP-MVP15-POSSESSIVES.md). NEXT GO MVP16: P03916 To be – other forms.


### JAGUAR-MVP-15-R1 — refinamento de leitura · 2026-10-29
- HOW TO DO: manter o inventário de objetos Word em details técnico fechado; é rastreabilidade, não conteúdo pedagógico. Reprodução vetorial segue pendente, sem figura inventada.
- HOW TO SHOW: mapa de seções em contêiner expansível nativo, fechado inicialmente; seletor de seção continua disponível. Estado de abertura preservado na navegação interna.
- HOW TO CHECK: Anterior/Próximo e links internos focam slideSurface com preventScroll e rolam ao início do slide (margem 20px); não ao cabeçalho reading. Navegação sequencial e expansão verificadas em navegador; regressão de catálogo e 2387 alvos speech GREEN.
- HOW TO RECORD: corpus permanece 716 unidades, cobertura textual 14,70036%; nenhuma nova homologação humana ou física presumida. Escopo exclusivo Master VIP; main, PR #3, Explorer, D1 e produção preservados.
- Próximo ELO de corpus mantido: MVP16 · To Be — Other Forms · P03916.


### JAGUAR-MVP-16-OTHER-FORMS · 2026-10-29
P03916–P04021 incorporado: 30 unidades, T0024, seis rótulos raster e 12 composições XML. Total 746 unidades / 2453 alvos de leitura; 45.307 caracteres (14,86%). HOW TO DO / RECORD / SHOW / CHECK / SPEAK em MASTER-VIP-MVP16-OTHER-FORMS.md. Refinamento 9a65954 homologado pelo professor: manter mapa expansível, detalhes técnicos recolhidos e âncora slideSurface. Próximo checkpoint MVP17 · P04022 Making Questions. Revisão integral, recomposição e impressão física pendentes; nenhuma integração ao Explorer ou alteração da watchlist central.


### JAGUAR · 2026-10-30 · Dependency Bridge — referência futura
Auditoria cruzada do quadro **QW | AUX. | SUBJECT | VERB | THE REST** com Thinking Mind/QWs, Dependency Focus (relações head/dependent, linhas SVG) e Head Probe registrada em [MASTER-VIP-DEPENDENCY-BRIDGE-FUTURE-AUDIT-20261030.md](MASTER-VIP-DEPENDENCY-BRIDGE-FUTURE-AUDIT-20261030.md). **Somente especificação de reutilização futura**: HOW TO DO/RECORD/SHOW/CHECK/SPEAK/INTEGRATE, fronteiras de autoridade, responsividade e medição SVG diferida. Não acoplar o Explorer nem atrasar o próximo ELO MVP18 · P04432.
