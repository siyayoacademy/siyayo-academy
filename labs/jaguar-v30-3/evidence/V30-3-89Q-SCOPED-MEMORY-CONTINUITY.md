# Jaguar V30.3.89Q — continuidade S1→S4 sem perda de identidade ou origem

Auditoria técnica isolada em `jaguar/v30-3-recovery-archive`; fonte Explorer imutável `c7e83709`.

1. Cada uma das quatro famílias avaliativas representadas (WHICH, WHAT, WHERE, WHY) × EN/ES/PT tem escopo separado: `learnerId × skill × language × originExperienceId`. Outros corpus QWs permanecem conteúdo de navegação, não contratos aceitos.
2. Navegar S1→S2→S3→S4 não reescreve a origem. WHAT pode ser autorizado a iniciar em S1 ou S2 em circuitos independentes; este ensaio usa S2 como origem sintética.
3. Duas pessoas com NICK igual não têm a mesma identidade; o código não usa NICK como substituto de principal autenticado.
4. Observação transferida para S4 em WHY não é fechamento Green. Apenas `source=green-pass-contract`, `status=transfer-confirmed`, `confirmed=true`, `contractStatus=GREEN_PASS` pode alterar o marcador grande, condicionado ao escopo.
5. Contrato 1/3→2/3→3/3 só é calculado pelos requisitos explícitos do avaliador, não por contagem de eventos ou pela apresentação.
6. Teste deliberadamente sintético; não é autenticação real, áudio real, evidência de aluno nem homologação visual.
7. Zero Trust adiado sem cobrança; 12 controles externos de staging permanecem bloqueados. Branch principal, Explorer homologado e Cloudflare intactos.

Executar `node --test test/scoped-memory-continuity-89q.test.mjs` no laboratório com checkout fixo e conferir execução CI antes de afirmar resultados.
