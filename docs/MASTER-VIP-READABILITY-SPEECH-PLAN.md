# Master VIP — leitura clara, submódulos e speech

29 de outubro de 2026. Proposta originalmente registrada como indagação. A solicitação posterior autorizou executar a sequência com a ressalva: o cartão textual inteiro ativa speech; speaker dourado decorativo à esquerda; sem botões especializados para repetir/parar. Registro de execução: MASTER-VIP-MVP11-READABILITY-SPEECH.md. As descrições de baseline abaixo são históricas; o estado atual está no registro MVP11.

## Entendimento confirmado

A Master VIP deve combinar consulta modular, leitura nítida e interação por voz, com apresentação própria para impressão. Referência visual: Chapters/DNA Explorer e LINES/POSSIBLE RESPONSES, especialmente o Corpus Speech Card homologado, com speaker SVG dourado à esquerda e frase centralizada. Reutilizar o componente e o SVG exatos após identificar sua origem/versão; não criar um ícone semelhante nem importar dependências avaliativas para obter aparência.

Aumentar especificamente a legibilidade dos textos explicativos destinados ao usuário. Não ampliar globalmente títulos, metadados, exemplos e exercícios de maneira indiscriminada. Explicação, exemplo e exercício devem ser reconhecíveis por título de função, tipografia, respiro e organização, sem depender apenas da cor. O humor do pedido — fácil leitura para o velhinho que virou criança — orienta uma experiência confortável, simples e acessível.

## O que já existe e o que é proposto

Baseline de referência: catálogo 0.9.0, 374 unidades em cinco destinos parcialmente disponíveis. IDs de capítulo MVP:CH, seção MVP:SEC, unidade MVP:UNIT; várias frases já usam MVP:SENT. A função renderUnit cria o contêiner/slide de apresentação de cada unidade, e languageBlock organiza idiomas. Isso constitui conteúdo modular identificado, não significa que cada unidade seja um pacote JS independente ou um componente de speech instalado.

IDs de frase existentes devem ser reutilizados. Parágrafos de origem Pxxxxx são localizadores da revisão do DOCX, não substitutos de IDs pedagógicos. Nem todo bloco explicativo, fragmento original ou célula de tabela tem hoje uma identidade independente de frase/speech. Essa complementação é pendente.

Atualmente a Master VIP não incorpora speech/speaker próprio; o CSS observado usa 14px para parágrafos gerais do slide e valores menores em rótulos/notas. Há perfis de impressão e seleção por unidade/seção/capítulo, mas tamanho maior na tela e speaker não estão implementados. Não confundir recursos existentes no Explorer com recursos já instalados na Master VIP.

## Estrutura prevista

Capítulo → seção → unidade/slide → subcontêiner especializado → texto/frase por idioma.

| Camada | Responsabilidade |
|---|---|
| Unidade/slide | Preservar ID, título, fonte, relações e seleção |
| Explicação | Orientação pedagógica com corpo maior e identificação clara |
| Exemplo resolvido | Frase, termo-alvo e contexto, com speaker do idioma |
| Exercício | Enunciado/instrução falável e área de trabalho |
| Gabarito | Resposta em submódulo próprio, aberto por escolha explícita |
| Tabela/figura/glossário | Leitura por texto pertinente ou item selecionado; preservar seus registros |
| Speech Card | Speaker SVG dourado à esquerda e texto centralizado, segundo padrão homologado |

O componente visual pode ser reutilizado; cada instância mantém identidade e vínculo próprios. Não multiplicar cópias de conteúdo nem exigir número fixo de slides. Navegação, consulta e áudio livres, sem NICK ou contrato avaliativo.

## Seis etapas propostas

| Etapa | Execução futura | Entrega / verificação |
|---|---|---|
| 1 — Identidade e referências | Completar identificação dos subblocos; resolver a origem/versão do Corpus Speech Card, SVG e serviço de voz homologados; mapear consumidores e contratos de apresentação | Mapa de submódulos e reaproveitamento, com IDs existentes preservados e lacunas explícitas |
| 2 — Leitura e hierarquia web | Especializar Explicação, Exemplo e Exercício; ampliar exclusivamente o corpo explicativo; organizar largura, contraste e respiro; alinhar a coluna do speaker entre módulos | Prova visual para portrait e desktop; explicação distinta do exemplo/exercício; proposta inicial 20–22px no corpo explicativo e entrelinha 1,5–1,7, sujeita à conferência |
| 3 — Speech reutilizável | Integrar o speaker SVG dourado e a leitura do texto correto por idioma; ativar leitura pelo clique no cartão inteiro, sem botões extras para repetir/parar; impedir sobreposição e interromper ao mudar de unidade | Operação por clique/teclado, indicação acessível do estado e idioma correto, sem autoplay |
| 4 — Piloto THERE + TO BE | Aplicar aos submódulos de explicação, exemplo, exercício e gabarito de Existence, incluindo situações EN→PT, EN→ES e EN→ES→PT efetivamente disponíveis | Conferência humana do padrão visual e áudio antes da expansão; registrar separadamente implementação, testes e homologação |
| 5 — Aplicação aos módulos existentes | Usar o mesmo componente nos cinco destinos e nas 374 unidades do baseline onde houver texto falável; tratar tabelas, figuras e glossários conforme sua função | Cobertura por tipo de conteúdo e idioma; remissões e IDs estáveis; novos capítulos passam a adotar o padrão |
| 6 — Print e validação final | Conferir saída A4 independente da escala web; retirar botões de áudio da saída; preservar textos e escolha de gabaritos; verificar acessibilidade e regressões | Web, conteúdo, voz e impressão com estados próprios; prova física A4 e revisão portrait/desktop |

São seis etapas funcionais, não seis commits garantidos. A abrangência da etapa 5 pode exigir lotes por tipo/capítulo, sem mudar a arquitetura ou repetir o desenvolvimento do componente. A execução autorizada está registrada no MVP11; a homologação humana permanece pendente.

## Parâmetros de leitura e alinhamento

Quicksand/Nunito Sans e azuis/dourados homologados como base. Tamanho proposto de 20–22px é hipótese de prova para explicações, não token homologado nem alteração atual de CSS. Usar unidades relativas quando apropriado, respeitar zoom do navegador e evitar bloqueio de ampliação. Contraste suficiente, identificação por texto e nenhuma instrução essencial reduzida a legenda pequena.

Speaker em coluna própria à esquerda dos Speech Cards, em posição consistente entre explicação falável, exemplo e exercício; frase centralizada no espaço de leitura, sem sobreposição do controle com o texto. Explicações longas precisam de largura/entrelinha e alinhamento de leitura próprios a conferir, em vez de forçar todo parágrafo longo a se comportar como uma frase curta. Portrait deve preservar speaker e texto legíveis sem deslocamento lateral.

## Contrato do áudio

Cada ação lê o texto do bloco/idioma correspondente. Não ler IDs técnicos, notas de bastidores, nomes de controles, códigos de fonte ou sequências decorativas de pontilhados. A referência de speech aponta para o conteúdo versionado; eventual preparação de pontuação/ornamentos precisa ser rastreável e não altera silenciosamente gramática ou sentido da fonte original.

Uma edição de três idiomas não transforma um texto original EN ou EN/PT em tradução ES pronta. Idioma ausente deve ser indicado, sem fabricar tradução ou usar voz errada. Qualidade/disponibilidade da voz depende do mecanismo/dispositivo escolhido e será conferida na implementação; não se promete a mesma voz em todos os aparelhos.

Ouvir um exercício lê o enunciado, não a resposta vinculada. Gabaritos só são lidos quando o usuário os abre/escolhe. Modelos resolvidos que já contêm resposta na fonte continuam identificados como modelos. Mudança de capítulo/unidade interrompe leitura anterior; novo clique reinicia a leitura e cancela a anterior; navegação também cancela. Não há botões adicionais para repetir/parar. Nenhum autoplay ao navegar. O componente deve ser operável por teclado, com nome acessível e foco visível. Pausa/retomada não fazem parte deste contrato.

Interação de estudo por áudio não produz avaliação, Evidence, Green Pass ou progresso contratual. Não carregar PATITA, NICK, D1 ou avaliadores como dependência do speech.

## Web e to print

Uma base editorial alimenta apresentações diferentes. A web ganha legibilidade ampliada, controles e subcontêineres; o print conserva composição contínua, margem de encadernação e áreas de escrita. Tamanho em pixels da web não é automaticamente transposto ao A4. Um slide continua diferente de uma página impressa. Botões/estados de áudio não são impressos, mas seus textos não podem desaparecer por estarem associados ao speaker.

Não criar transcrições concorrentes por idioma/saída. Compartilhamento e impressão continuam vinculados aos mesmos IDs. Gabaritos permanecem opcionais na seleção. Renderizar e conferir as provas A4 e P&B separadamente da tela.

## Relações e governança

Origem: solicitação do professor em 29/10/2026, posterior ao MVP10. Função: especialização de apresentação, leitura e voz. Consumidores: cinco destinos atuais e capítulos futuros da Master VIP. Dependências a resolver: referências homologadas Chapters/DNA Explorer/LINES, tokens visuais, SVG e serviço de speech. Risco de duplicação: copiar renderizadores, SVGs, textos ou engines de voz por unidade; prevenir com componente compartilhado e referências versionadas.

HOW TO DO: componente e instâncias. HOW TO RECORD: IDs, idioma e origem/versão. HOW TO SHOW: leitura e speaker alinhados. HOW TO CHECK: piloto, cobertura e provas independentes. HOW TO SPEAK: texto correto por idioma, com ação explícita.

Estado: ESPECIFICADO. Implementação: PENDENTE. Testes: PENDENTES. Homologação: PENDENTE. Integração ao Explorer: NÃO REALIZADA. Este lote altera somente documentação na branch Master VIP; não modifica HTML/CSS/JS, catálogo, PDFs, main, PR #3, avaliações, D1 ou produção.

## Estado atualizado — MVP11

IMPLEMENTADO na branch Master VIP: subcontêineres identificados, corpo explicativo 21px desktop/20px portrait, cartões speech em 372 das 374 unidades, 1.540 alvos. TESTADO LOCALMENTE: preservação textual, idiomas, cancelamento, renderização DOM de tela/print e ausência de controles de áudio impressos. HOMOLOGAÇÃO humana de visual, áudio e A4 físico: PENDENTE. INTEGRADO AO EXPLORER: NÃO. O navegador de teste não disponibilizou vozes e retornou synthesis-failed; o teste do controlador com vozes simuladas passou.
