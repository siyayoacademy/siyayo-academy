# Gold Seed — plano futuro de animação interativa

**Registro:** `JGS-VIDEO-PLAN-20261008`  
**Data:** 2026-10-08 · America/Sao_Paulo  
**Status:** PLANEJADO — aguardando roteiro final e homologação dos arquétipos.  
**Escopo deste registro:** documentação do desenvolvimento futuro. Produção de vídeo, controlador, novos portais e publicação desta variante ainda não foram realizados.

## Decisão de desenvolvimento

Aldo Esteban definiu a ordem: concluir o passo a passo da Jornada em desenvolvimento, definir e homologar todos os arquétipos finais e, depois, criar a versão de animações pelo método vídeo + WAIT/swipe + camada interativa.

A variante também servirá como experiência demonstrável no portfólio da **Agência SIYAYO Academy Fine Digital Art**. A página, o local de publicação e a forma de apresentação no portfólio permanecem OPEN.

O registro é uma linha futura da Gold Seed. Ele preserva o checkpoint pedagógico ativo, as versões recuperadas da Jornada e as homologações com seus respectivos escopos.

## Condição para iniciar a produção

A produção começa após registrar:

- roteiro final e sequência dos WAITs/swipes;
- todos os arquétipos finais, suas funções, IDs, arquivos e versões homologadas;
- enquadramentos retrato/paisagem e poses de contato/pouso aprovados;
- destinos dos portais e comportamento de retorno definidos no mapa de navegação.

A aprovação desta ideia de desenvolvimento não homologa automaticamente artes de estudo ou o roteiro final. Os estudos `JGS-ART-001` a `JGS-ART-005` mantêm seus estados registrados; incorporar uma imagem como estudo substituível não a torna um arquétipo final. Seus IDs continuam independentes da numeração W.

## Arquitetura prevista

| Parte | Função | Situação |
|---|---|---|
| Animação pré-renderizada | Giro da câmera, aproximação da Frondosa e do chão, contatos, pouso e encontro com Patita | Planejada |
| Controlador da Jornada | Interpretar o gesto e executar somente a transição até o próximo WAIT | Planejado |
| Camada HTML | Controles, textos PT/ES/EN, portas e acesso aos palcos/páginas aprovados | Planejada |
| Manifesto da Jornada | Relacionar estados, mídia, versões, enquadramentos, portais e retorno | Planejado |

Método inicial recomendado: **um clipe por transição entre WAITs**, acompanhado por uma imagem exportada da composição exata de cada parada. O WAIT é um estado do site, mantido pelo tempo desejado pela pessoa.

O movimento da câmera e os contatos ficam definidos na animação. Alterações posteriores do percurso exigem editar os clipes ou acrescentar camadas em tempo real com composição e oclusão deliberadas. Um vídeo mestre com marcadores de tempo permanece uma alternativa a avaliar posteriormente; não é uma escolha de produção homologada.

## Procedimentos e entregáveis

| Ordem | Procedimento | Entregável / critério de conclusão |
|---|---|---|
| 1 | Finalizar roteiro e arquétipos | Registro das homologações, funções narrativas, IDs e versões dos assets. |
| 2 | Construir storyboard dos movimentos e WAITs | Composição inicial/final de cada trecho, câmera, contatos e área visível de cada portal em retrato e paisagem. |
| 3 | Produzir a animação | Continuidade de poses, escala, iluminação e posição da semente; oclusão ao passar entre folhas/galhos; pouso diante da Trilha do Jaguar e encontro com Patita. |
| 4 | Exportar mídia e manifesto | Clipes por transição, imagens correspondentes de WAIT e mapa versionado de cenas, enquadramentos e acessos. |
| 5 | Implementar o controlador WAIT/swipe | Um gesto inicia um trecho; conclusão da mídia chega ao WAIT; controles Voltar/Continuar, carregamento e falhas tratados. |
| 6 | Integrar portais e retorno | Hotspots HTML nos WAITs, textos PT/ES/EN, destinos aprovados e recuperação da mesma parada após visitar outro palco. |
| 7 | Adaptar celular e acessibilidade | Retrato/paisagem, controles de som, reprodução dentro da página, acesso direto e percurso equivalente com movimento reduzido. |
| 8 | Construir piloto isolado W3 → W4 | Dois WAITs, uma transição de aproximação da Frondosa e uma porta com destino aprovado, nos dois enquadramentos. |
| 9 | Homologar dispositivos e interações | Evidências dos testes em smartphones físicos e laptop, com correção dos problemas observados. |
| 10 | Expandir e integrar ao portfólio | Percurso completo homologado e apresentação interativa reutilizável da Agência. |

O W3 → W4 é o piloto proposto; não declara uma nova cena implementada. A sequência W0–W8 continua sendo a referência narrativa, e eventuais WAITs intermediários devem ser explicitamente identificados no roteiro final.

### Direção visual e produção

A aparente queda pode manter a semente próxima ao foco enquanto o entorno gira e se aproxima. Ao pousar, a semente passa a ocupar uma posição coerente no chão; a câmera seguinte deve preservar essa localização ao revelar Patita.

Os enquadramentos retrato/paisagem precisam conservar os mesmos acontecimentos e checkpoints. A primeira versão pode trocar a mídia no WAIT seguinte à mudança de orientação. Rotação durante o movimento deve preservar o estado lógico e não pular ou repetir uma etapa. O comportamento final será homologado no piloto.

Exportar a arte sem textos de interface ou botões embutidos, para permitir ajustes e troca de idioma na camada HTML. A semente pode participar da animação renderizada; se for uma camada separada, sua passagem atrás de folhas/galhos requer máscaras ou camadas de primeiro plano.

Pequenos movimentos de ambiente durante um WAIT podem ser estudados depois. Eles não avançam a narrativa nem deslocam uma porta para longe de sua área de toque.

### Manifesto previsto

Definir, antes do controlador, os campos necessários para:

- ID da cena/transição e WAIT de origem/destino;
- fontes de vídeo e imagem de WAIT por enquadramento;
- versão da mídia e do roteiro;
- portais por `portalKey`, com rótulos PT/ES/EN e coordenadas normalizadas no quadro;
- pistas de som/legendas, quando existentes;
- checkpoint e regras de retorno.

As coordenadas dos hotspots devem acompanhar a escala, posição e recorte efetivos da imagem/vídeo. Percentuais do contêiner sem considerar o recorte podem deixar a porta desalinhada. Destinos reais vêm do mapa aprovado; este registro não inventa URLs de ambientes em construção.

### Controlador e carregamento

Usar o gesto para iniciar `play()` e confirmar se a reprodução realmente começou. Em clipes separados, `ended` determina a chegada ao próximo WAIT. Apresentar uma imagem própria da parada sobre a mídia; o atributo `poster` sozinho não representa toda a lógica dos WAITs.

Controlar carregamento, erros e eventos atrasados de um trecho anterior. Evitar acúmulo de swipes durante o movimento, distinguir toque de portal de gesto de avanço e tratar cancelamento de ponteiro. Atrasos de rede não devem provocar um avanço baseado apenas em temporizador.

Planejar `playsinline`, imagens de espera, carregamento do trecho atual/próximo e opção explícita de som. O valor de `preload` é uma indicação ao navegador, não garantia de download. Validar consumo e qualidade nos aparelhos antes de fixar resolução e compressão.

## Contratos de integração preservados

- O swipe continua sob controle da pessoa: movimento → revelação → ressonância → WAIT/próximo.
- A camada de portais solicita navegação pelo evento previsto `siyayo:journey-portal-request`; conferir o receptor e o mapa de destinos antes de conectá-los.
- Registrar o checkpoint e o idioma para retornar ao mesmo WAIT. A estratégia de memória/persistência e sua compatibilidade com versões da mídia permanecem OPEN.
- Animação, contato da semente, conclusão de vídeo, navegação e visita a um palco não produzem Attempt, Evidence, Green Pass ou transição de Session por si.
- O reconhecimento visual de DNA por Patita segue o contrato canônico; não fabrica competência ou histórico.
- Herdar os contratos compartilhados de responsividade e Motion DNA e a tipografia Quicksand/Nunito Sans. A interface segue os tokens homologados de dourado e azul espectral.
- Manter o acesso direto à Academy e uma sequência equivalente de imagens/controles para movimento reduzido.
- Na implementação futura, escolher uma linha isolada a partir da Jornada apropriada e preservar V51/V52 e o runtime pedagógico homologado. A branch de implementação ainda não foi escolhida.

## Homologação antes de ampliar

Conferir em Safari/iOS, Chrome/Android e laptop, com versões e aparelho registrados:

1. continuidade visual entre o final do clipe e a imagem de WAIT;
2. um avanço por swipe, Voltar/Continuar e cancelamento do gesto;
3. posições e áreas de toque dos portais nos enquadramentos;
4. rotação do aparelho durante WAIT e durante movimento;
5. carregamento lento, falha de reprodução e tentativa de recuperação;
6. abertura de palco e retorno ao mesmo WAIT;
7. textos/controles PT/ES/EN e som;
8. movimento reduzido, teclado/foco e acesso direto;
9. pouso da semente no chão e continuidade até Patita;
10. ausência de mudanças indevidas nas autoridades pedagógicas.

O ensaio W3 → W4 precisa ser homologado antes da produção e integração de todo o percurso.

## Integração futura no portfólio

Reutilizar a experiência interativa homologada como caso da **Agência SIYAYO Academy Fine Digital Art**, apresentando direção de arte, arquétipos, animação, composição responsiva e integração entre Jornada e palcos.

Definir então a página e a hospedagem, a entrada na experiência e a forma de retorno ao portfólio. Uma gravação linear pode ser um material adicional de apresentação; os portais funcionais pertencem à experiência web. Nenhuma página de portfólio é criada por este registro.

## Onde retomar

**NEXT GO desta linha:** concluir o roteiro da Jornada em desenvolvimento e homologar todos os arquétipos finais. Depois de registrar a condição de produção, retomar o storyboard e o piloto W3 → W4.

Esse NEXT GO é específico da Gold Seed e não substitui o NEXT GO do runtime pedagógico ativo.

## Referências de continuidade e técnica

- [WORK MAP](SIYAYO-WORK-MAP.md#jgs-video-plan-20261008)
- [Mapa canônico humano](siyayo-canonical-development-map.md#gold-seed--variante-futura-com-vídeo)
- [Mapa máquina](../data/canonical/siyayo-development-map.json): `animatedJourney.videoAnimationRoadmap`
- [Contrato da Jornada na branch própria](https://github.com/siyayoacademy/siyayo-academy/blob/journey-v51-network-preview/docs/SIYAYO-ANIMATED-JOURNEY-CONTRACT.md)
- [Motion DNA na branch da Jornada](https://github.com/siyayoacademy/siyayo-academy/blob/journey-v51-network-preview/data/motion/siyayo-motion-dna.json)
- [Paleta homologada](SIYAYO-COLOR-PALETTE.md)
- [MDN: elemento video](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video)
- [MDN: play() e falhas de reprodução](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play)
- [MDN: acompanhamento de quadros](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)
- [web.dev: desempenho de vídeo](https://web.dev/learn/performance/video-performance)
