# SIYAYO — paleta de cores homologada

**Homologação do usuário:** 2026-10-08, America/Sao_Paulo.  
**Fonte visual:** `image(20261008-152408).png`.  
**Fonte CSS compartilhada:** [`css/siyayo-palette.css`](../css/siyayo-palette.css).

Cada espectro possui três opções. Os valores abaixo foram extraídos dos centros
uniformes dos seis blocos do anexo; a identificação usa os blocos de referência,
preservando a numeração e os nomes dos dourados definidos pelo usuário.

| Espectro | Opção homologada | HEX | RGB | Token CSS |
|---|---|---|---|---|
| Dourado | 1 — Dourado padrão | `#D7B35A` | `215, 179, 90` | `--siyayo-gold-standard` |
| Dourado | 2 — Dourado médio | `#F2D88A` | `242, 216, 138` | `--siyayo-gold-medium` |
| Dourado | 3 — Dourado brilhante | `#FCEC5B` | `252, 236, 91` | `--siyayo-gold-bright` |
| Azul espectral | Azul escuro | `#071F41` | `7, 31, 65` | `--siyayo-blue-dark` |
| Azul espectral | Azul médio | `#0A2A58` | `10, 42, 88` | `--siyayo-blue-medium` |
| Azul espectral | Azul brilhante | `#0307B2` | `3, 7, 178` | `--siyayo-blue-bright` |

## Fontes, fundos e aplicação inicial

- **Dourado padrão:** referência principal da identidade SIYAYO, molduras e título
  da Experience. O título “Shopping for a Nice Dinner”, apontado no anexo como
  “Demasiado alaranjado”, passa a usar explicitamente essa opção.
- **Dourado médio:** títulos do Explorer, rótulos e interface já apresentados
  nessa tonalidade. `--siyayo-gold-primary` e `--siyayo-gold-light` apontam para ele.
- **Dourado brilhante:** opção de realce luminoso. No Explorer, identifica o
  contorno de foco por teclado nos tokens, seletor de idioma/QW e abas de modo.
- **Azul escuro e médio:** referências de fundo; o fundo externo do Explorer
  usa essas duas opções no gradiente. Fundos translúcidos internos continuam
  compondo a profundidade do palco.
- **Fundo externo da Home:** azul escuro uniforme `#071F41`, via
  `--siyayo-blue-dark`, no desktop e na regra móvel (JAGUAR-LIVE-51).
- **Azul brilhante:** terceira opção disponível para superfícies e detalhes
  da identidade, seguindo o bloco saturado do anexo.

As fontes homologadas continuam **Quicksand** para títulos/interface e
**Nunito Sans** para leitura/corpo. A paleta define cores; o tipo de fonte
continua no contrato tipográfico compartilhado.

## Herança entre páginas e branches

Importar `css/siyayo-palette.css` antes dos estilos da página e referenciar os
tokens. O Explorer faz essa importação no HTML; a Home herda os tokens por
`css/style.css`. Os aliases antigos de azul passam a resolver as três opções
homologadas. O alias legado `--siyayo-gold-dark` da Home resolve o dourado padrão.

Uma variação de cor herdada deve usar uma das três opções do seu espectro.
Transparência, sombra e estados semânticos mantêm suas funções visuais. O verde
de conexão/resultado e as cores de diagnóstico conservam suas autoridades.

Outros espectros recebem seus próprios três valores quando forem homologados.

## Conferência da amostragem

| Bloco | Região central amostrada, pixels `(x1, y1, x2, y2)` | Cor predominante |
|---|---|---|
| Dourado 1 | `(1490, 750, 1800, 870)` | `#D7B35A` |
| Dourado 2 | `(1270, 990, 1780, 1060)` | `#F2D88A` |
| Dourado 3 | `(1270, 1120, 1780, 1210)` | `#FCEC5B` |
| Azul médio, bloco superior | `(90, 800, 230, 875)` | `#0A2A58` |
| Azul brilhante, bloco central | `(90, 925, 230, 1025)` | `#0307B2` |
| Azul escuro, bloco inferior | `(90, 1090, 230, 1170)` | `#071F41` |

Imagem de referência: `1920 × 1248` pixels. O texto vermelho, sombras, setas e
bordas das anotações foram excluídos da seleção da cor de cada bloco.
