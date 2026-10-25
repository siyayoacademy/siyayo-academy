# SIYAYO XPR-01 — Cross-Project Registry

**Estado:** registro documental estático, testável localmente, **não é sincronização ou vigilância automática** de branches. Este ELO não modifica os repositórios de origem nem qualquer runtime ou produção.
**Projeto hospedeiro:** `siyayoacademy/siyayo-academy` · documentação em branch isolada de governança.
**Chaves globais:** `<PROJECT>:<MODULE>` como `SIA:RS-01` e `MCE:MCE-RS-01`. Os módulos preservam seus identificadores locais e seus donos.

## Índice vivo como documento, não cópia de runtime

| Código | Registro próprio | Commit verificado do registro | Módulos catalogados |
|---|---|---|---|
| **SIA** | [SIYAYO Academy](https://github.com/siyayoacademy/siyayo-academy/tree/jaguar/module-governance-reg03-impact-20261025) | `b73b0e728058652620119bdb737d2cf29bb92178` | 18 |
| **MCE** | [Mestre Canto Ensino](https://github.com/siyayoacademy/mestrecantoensino/tree/jaguar/mce-modular-governance-reg123-20261025) | `aaa118507e760ea670b9d608fb83e732d91d0a99` | 21 |

Os dois projetos já possuem REG-01/02/03. Este XPR-01 referencia os seis registros originais pelo caminho e por SHA de referência; não inventa novas autoridades, bases de dados nem exigência de deploy.

## O que existe e o que pode ser reutilizado

| Relação | Fonte → destino | Categoria | Decisão de leitura |
|---|---|---|---|
| `XPR-LINK-01` | `SIA:RS-01` → `MCE:MCE-RS-01` | `adapted_implementation_confirmed` | implemented separately needs cross-site regression |
| `XPR-LINK-02` | `SIA:RS-01` → `MCE:MCE-STAGE-06` | `governance_methodology` | conceptual guidance only |
| `XPR-LINK-03` | `SIA:LIVE-07` → `MCE:MCE-HYM-A` | `content_presentation_analogy_only` | separate business semantics |
| `XPR-LINK-04` | `SIA:SPEECH-A` → `MCE:MCE-SPEECH-21` | `future_design_candidate` | MCE planned not implemented |
| `XPR-LINK-05` | `SIA:SPEECH-A` → `MCE:MCE-SHARE-22` | `future_design_candidate` | MCE planned not implemented |
| `XPR-LINK-06` | `SIA:TRAIL-10` → `MCE:MCE-HYM-HUB-13` | `cataloging_analogy_only` | no equivalent canonical evidence |
| `XPR-LINK-07` | `SIA:EXP-01` → `MCE:MCE-HEAD-01` | `visual_design_candidate` | independent site identity |

**Não confundir classificação com homologação.** `adapted_implementation_confirmed` afirma que código diferente e funcionalmente análogo existe em ambas as referências; não afirma que testes de regressão cruzada foram executados ou que o componente seja copiável sem modificações.

## Caso RS-01: diferença real entre as adaptações

| Contrato | SIYAYO Academy | Mestre Canto Ensino |
|---|---|---|
| Módulo | `RS-01` | `MCE-RS-01` |
| JS | `js/siyayo-responsive-preview.js` | `js/ris-responsive-preview.js` |
| CSS | `css/siyayo-responsive-stage.css` | `css/ris-responsive-stage.css` |
| Chave localStorage | `siyayo-responsive-preview-mode` | `ris-responsive-preview-mode` |
| Evento | `siyayo:responsive-preview-changed` | `ris:responsive-preview-changed` |
| API | `window.SIYAYOResponsivePreview` | `window.RISResponsivePreview` |
| Comportamento compartilhado | AUTO, Portrait 430px, Landscape 844px, touch-first AUTO | AUTO, Portrait 430px, Landscape 844px, touch-first AUTO |

**Blobs verificados:** SIA JS `1fe4d10615f3206b0ca1595462ad83e7e314491f` e CSS `fde13b86d574464dba65ce8ca31479f0a2501ef7`; MCE JS `1b0085b9467fc933e93423c74d0435030519cf75` e CSS `e0c00c819f160f9818ed3d685e376aed021da822`. Os SHA são distintos — **adaptação, não arquivo idêntico**.

## Mudanças e divergências já registradas

1. **MCE Santo Cruzeiro Universal:** `data/santo-cruzeiro-universal.json` é referência documental, mas o `index.html` contém o texto exibido em HTML e **não busca o JSON**. Uma edição JSON não altera automaticamente a leitura publicada.
2. **MCE Model B de estrofes:** o JSON `data/modelo-b-componente.json` descreve gap de referência; a aparência efetiva depende da implementação CSS/HTML. Não declarar medidas homologadas sem comparar o DOM/CSS.
3. **MCE módulos planejados:** Fine Art, Speech e Share por hino/estrofe permanecem `planned`. Não declarar biblioteca de mídia ou áudio já instalada.
4. **SIA pedagogia exclusiva:** `EVAL-08`, PATITA, Learning Trail, Word Path, NICK, Skill Contracts e V30.3.85C não são dependências de MCE nem migráveis por analogia.
5. **Fontes musicais, religiosas, históricas e Fine Art:** revisar origem, integridade e permissões de uso antes de importar, adaptar ou publicar mídias.

## Método compartilhado — cinco HOW TO e três REG

**REG-01:** módulo, proprietário, identidade, seletores e apresentação. **REG-02:** bastidores, fornecedores/consumidores, eventos e estado. **REG-03:** impacto, testes, bloqueios e decisão de integração. **HOW TO DO/RECORD/SHOW/CHECK/SPEAK:** fronteiras documentadas por projeto; nem todos os módulos precisam das cinco funções implementadas.

## Procedimento obrigatório antes de adaptar

1. `LOCATE` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
2. `PIN_BOTH_HEADS` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
3. `COMPARE_CONTRACT_AND_BLOB` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
4. `CLASSIFY_RELATIONSHIP` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
5. `CHECK_PROVENANCE_AND_RIGHTS` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
6. `MAP_CONSUMERS_EVENTS_STATE` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
7. `ADAPT_IN_ISOLATED_BRANCH` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
8. `TEST_SCREEN_AUDIO_DOCUMENT_AND_BOUNDARIES` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
9. `HUMAN_HOMOLOGATION_IF_APPLICABLE` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.
10. `SELECTIVE_GO_NO_GO` — registrar evidência de leitura ou decisão, incluindo HEADs de ambos os repositórios.

**Proteções:** não tocar em `main`, produção, bancos reais, autorização pedagógica ou integridade de documentos/hinários. Um módulo pode inspirar outro mas não transferir estado, HTML, direitos, autenticadores ou permissões sem análise própria.

## Consulta pelo nome e pelos identificadores

- **Origem:** procurar `SIA:<CODE>` ou `MCE:<CODE>` em `docs/siyayo-cross-project-registry.json`. Cada entrada aponta para o projeto dono, versão do registro e fonte principal.
- **Equivalente:** consultar `cross_project_links` pelo par `from`/`to` e sua classificação. Ausência de aresta **não** significa inexistência de módulo; significa que nenhuma relação foi documentada nesse snapshot.
- **Mudança:** verificar os dois HEADs atuais, percorrer os registros REG-02/REG-03 originais, registrar decisão em formato `audit_log_template`, aprovar somente modificações seletivas e reversíveis.
- **Conferência:** executar `node scripts/validate-siyayo-cross-project-registry.mjs` na raiz deste ramo. Verifica integridade interna do snapshot, não consulta o GitHub remoto.

## Comando pronto para qualquer chat do ecossistema

> JAGUAR, consulte o Cross-Project Registry XPR-01 no GitHub SIYAYO Academy, branch jaguar/cross-project-registry-xpr01-20261025. Localize SIA:RS-01 e MCE:MCE-RS-01, compare os HEADs atuais e as diferenças de controlador, evento, armazenamento, CSS e testes, e me traga análise de impacto e GO/NO-GO sem alterar os sites.

## Revalidação futura

Este registro é um **snapshot auditado**, não acompanha commits automaticamente. Revalidar quando qualquer projeto alterar seus catálogos, controladores, conteúdo JSON, eventos, APIs, estados de módulos ou versão de apresentação. Cada revisão exigirá um novo commit documental e uma decisão humana, preservando o histórico.

## Links canônicos

- [SIYAYO REG-01/02/03](https://github.com/siyayoacademy/siyayo-academy/tree/jaguar/module-governance-reg03-impact-20261025/docs)
- [MCE REG-01/02/03](https://github.com/siyayoacademy/mestrecantoensino/tree/jaguar/mce-modular-governance-reg123-20261025/docs)
- [XPR-01 arquivo de dados](./siyayo-cross-project-registry.json)

## XPR-02 — Read-only drift audit

A [auditoria de divergências](./SIYAYO-CROSS-PROJECT-DRIFT-AUDITOR.md) compara HEADs expressamente inscritos em uma [watchlist](./siyayo-cross-project-watchlist.json), analisa arquivos modificados e aponta consumidores candidatos. O script não monitora continuamente, não descobre branches automaticamente e não integra código.
