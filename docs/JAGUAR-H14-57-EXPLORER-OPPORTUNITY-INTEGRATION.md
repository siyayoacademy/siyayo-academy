# JAGUAR H14.57 — integração experimental de oportunidade PATITA → contrato declarado

**Escopo autorizado:** branch isolada baseada em H14.56. Este ELO conecta pela primeira vez um componente de inspeção (somente leitura) ao ciclo real de renderização do `verb-explorer.js`, sem mudar o seletor EVAL-08, definição de contrato, progresso, Evidence ou estado do aprendiz. Preview `?h14_57=inspect` apenas. Por padrão, painel oculto.

## Responsabilidades
1. PATITA fornece observações vinculadas ao NICK visual já ativo. NICK não é autenticação. Apenas `getVisibleRecords()` filtrado pelo mesmo NICK; nenhum `Attempt` é criado.
2. O módulo H14.57 resolve observações de Experience/QW/idioma para `experience-seeds.json` e consulta **somente** `SIYAYOQuestionWordAssessmentContract.inspect(question,null)`.
3. A saída diferencia `OPPORTUNITY_ONLY`, `DECLARED_TARGET_REQUIRES_AUTHORITY` e `RESUME_DECLARED_REQUIRES_ORIGIN`. Não chama `select()`, não inicia sessão, não decide rubrica, não altera palavras, idioma, Experience ou ordem de navegação.
4. Os componentes existentes EVAL-08, Trail, Word Path e PATITA continuam responsáveis por suas próprias funções; nenhuma `Evidence` ou `Green Pass` decorre do novo painel.
5. Entradas sem NICK, observação de outro NICK, idiomas desconhecidos e oportunidades não declaradas são fail-closed. O painel mostra apenas observações, não o catálogo completo de possibilidades.

## Débito histórico registrado e preservado
**HIST-01 — HISTORICAL_PRE_FUNC13_UNEXHAUSTED.** Ainda é necessária auditoria exaustiva das branches/commits anteriores a H14.1 (incluindo investigação PATITA, sucessão WHAT/WHICH/WHERE/WHY, V29/V30/90C, contratos, casos S1/S2, JSONs de origem, LINES, Trail/Word Path, retomadas e experimentos não promovidos). O manifesto H14.55 confirma as fontes de H14.2–H14.54, mas não substitui a conferência dos anteriores. Exigir comparação de git blobs/HEADs, PR #3 e MAIN e elaborar matriz por QW × Experience × idioma com autoria, status, dependência e lacunas reais sem preenchimento especulativo. Não declarar esta pendência concluída até fechamento documental validado.

## HOW TO
- **DO:** investigar oportunidades de interação por contexto, sem abrir automaticamente um contrato.
- **RECORD:** PATITA e contratos permanecem com seus registradores anteriores; a ponte H14.57 não grava.
- **SHOW:** um relatório de inspeção em `Learning Trail & Word Path`, oculto por padrão. Nunca mistura observação com conquistas aceitas.
- **CHECK:** 12 testes locais, corpus real, identidade NICK, EN/ES/PT, 21 slots, ausência de Evidence, regressões EVAL-08/Trail/Word Path.
- **SPEAK:** nenhum novo áudio. Speech de corpus e assessment permanece distinto.

## Próximo portão
Vincular no futuro descoberta de oportunidade a um resolvedor de autoridade EVAL-08 **sem selecionar nem submeter automaticamente**, com identidade real e escopos autorizados. O H14.57 é integração de inspeção, não integração avaliativa executável, e não fecha DG-01 a DG-07.

Preservados `main`, PR #3, Explorer em produção, D1 remoto, FUNC-13 oculto, PATITA observacional, trilhas canônicas e contratos anteriores.
