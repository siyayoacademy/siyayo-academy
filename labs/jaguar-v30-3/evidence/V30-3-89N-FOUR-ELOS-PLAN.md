# JAGUAR V30.3.89N.1 → N.4 · inspeção em lote de todas as QWs atualmente renderizadas

**Autorização:** o usuário pediu revisão de todas as QWs já implementadas em Learning Trail e Word Path e quatro inspeções visuais, perguntando quantos elos podem ser verificados simultaneamente. **Sem aprovação para alterar a interface publicada.** Este trabalho é auditoria somente com CSS/DOM candidate no Chrome descartável de CI.

## Matriz de cobertura

Quatro QWs com famílias de avaliação nomeadas no Word Path: `which.use.determiner`, `what.use.object-question`, `where.use.location-question`, `why.use.contextual-reason`. `WHERE` permanece com a anotação de fonte `isolated-candidate`; presente na visualização não significa homologado para produção. EN/ES/PT × desktop 1440×900 / portrait 390×844: **24 cenários**, com **quatro elos separados** e verificações independentes.

- **N.1 Linguística/layout:** ler a família e o papel gramatical originais para cada QW. No portrait ES/PT, simular duas linhas distintas em `learner-trail-meta` sem mudar o significado nem as definições; simular duas linhas `PALABRA/PALAVRA` e `INTERROGATIVA` no cabeçalho; dividir `POR QUÉ` / `POR QUÊ` na linha WHY. Desktop retém seu layout original. Candidate styling deve caber na largura do contêiner.
- **N.2 Cartões:** expandir realmente `details.wp-evidence-card`; observar 2 requisitos sintéticos aceitos + terceiro pendente. Nenhuma exploração livre gera Evidence.
- **N.3 Próxima Experience:** registrar juntos o estado `2/3`, marcador grande `◐` e a iluminação/invitação NEXT em EN/ES/PT, sem navegar.
- **N.4 Word Path:** demonstrar as 3 colunas, rolagem horizontal interna portrait, indicador textual `⇆ DESLIZE ...` apenas de prévia, ausência de overflow global, **SIMULAÇÃO** visível dentro de cada captura e isolação entre idiomas.

A Word Path canônica apresenta `POR QUÊ` na célula PT da linha WHY, enquanto a realização gramatical de `data/learning/skills/why.json` contém `por que`. **Diferença registrada**, sem corrigir a gramática automaticamente.

## Limites e entregáveis

O script `scripts/audit_four_qws_89n.py` executa os módulos canônicos fixados em `c7e83709cacf8479847df0f3cee4ed8a563aaae6`, alimentando-os com pacotes sintéticos e uma cópia DOM isolada. **Não modifica arquivos oficiais, não autentica alunos, não publica Pages, nem cria Worker/D1/Zero Trust.** Aplica quebras e rótulo de deslizar apenas no navegador descartável, como **proposta visual**; não estão implementados no produto.

CI: `.github/workflows/jaguar-v30-3-four-qw-visual-89n.yml`. Deve produzir 24 imagens, relatório detalhado por célula e diagnósticos se algo falhar. **Nunca anunciar GREEN CI deste elo sem confirmação da execução específica.**

Falhas de viewport, texto, card, seleção, identidade, 2/3 e NEXT são detectadas separadamente; classificar manualmente qualquer situação ainda não coberta. Revisão de smartphone físico e casos Green Pass reais permanecem separados. 12 gates externos continuam bloqueados; Zero Trust permanece adiado por decisão explícita.
