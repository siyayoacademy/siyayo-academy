# JAGUAR 90A — Consolidação V30.3→89Z sem perder a autoria nem alterar produção

**Proposta executada em branch isolada:** reunir fisicamente o laboratório `labs/jaguar-v30-3/` com o código-fonte do Explorer experimental 89Z, *sem ativar* o Worker ou as rotas de persistência. O laboratório é importado como **objeto Git tree original**, sem regravar seus bytes; `data/canonical/siyayo-integration-continuity-90a.json` é o manifesto de proveniência e das fronteiras.

## Proveniência: sem promessas de recuperação impossível

Os nomes V40/V50/V60/V70/V80 mencionados pelo usuário foram etapas internas no percurso V30.3, não branches de Git separadas encontradas na inspeção. **Não inventar SHA específico para cada subversão.** O `labs/jaguar-v30-3/README.md` e `evidence/PROVENANCE.md` registram que os oito arquivos V30.3.6 foram recuperados dos anexos, mas o Worker HTTP original V30.3.78/79 foi reconstruído, os bytes originais do log V30.3.80 e do backup anterior ao guard não foram recuperados, e dados originais D1 não foram restaurados. A integridade comprovada é do **arquivo preservado atual**, não de artefatos históricos inexistentes.

O ramo de recuperação original continua em `jaguar/v30-3-recovery-archive` @ `1463d6105d90b60c0fb31ed80baf90693cc0cb59`, e o Explorer do laboratório 89Z em `jaguar/verb-explorer-pronoun-contrast-89z` @ `725e6fb23e5e4d8859393490d18548e867afaaca`. O novo ramo é derivado do 89Z e anexa exatamente o subtree `5ee77257551593b8e4960dd6971cc7ed069fcd56` ao caminho `labs/jaguar-v30-3/`. Os workflows históricos da branch recovery permanecem no SHA recovery, sem copiar suas regras de disparo para a branch de integração.

## O que está integrado agora e o que NÃO está

**Incluído sem perder componentes:** código exploratório HOW TO SHOW 89U–89Z (ES/PT, speakers, Questions≠Responses, Learning Trail, Word Path), scripts e mapas do Explorer; código, migrations, scripts, segurança simulada, testes e evidências do laboratório V30.3.6→89T; manifesto comum e verificação cruzada em CI.

**NÃO conectado no Explorer final:** mock identity ≠ sessão segura, SQLite temporário ≠ D1 remoto, experimento Worker ≠ rota autorizada, observação longitudinal ≠ Evidence/Green Pass. Não ativar nem importar `worker-v30-integration.mjs` para produção. A página local pode rodar sem Worker/D1. Não criar no HTML scripts que façam referência aos módulos de segurança sem revisão de Access e autoridade.

**WHY no S4:** SIM, conclusão pedagógica em laboratório: S3 question-function, reason-answer local e transferência autorizada em S4 produz `3/3 GREEN PASS`; visitar S4, ouvir pergunta, clicar NEXT ou abrir REVIEW não produz crédito. **Não foi validado em conta autenticada + D1 real + aparelho físico.** NEXT continua sob controle do aluno e não é sinônimo de fechamento.

## Sequência de promoção — bloqueio explícito

1. **90A (este ELO):** consolidar os bytes, registrar origem, executar CI local dos dois percursos e garantir que bloqueios externos sigam BLOCKED.
2. **90B:** revisão de diferenças entre runtime 89Z, laboratório V30.3 e especificações pedagógicas; registrar conflito por componente e testes atualizados. Fazer ensaio de navegador integrada em `390×844 portrait` por prioridade atual, sem considerar áudio físico homologado.
3. **90C:** obter homologação humana do HOW TO SHOW em portrait e do circuito S1→S4 com WHY; atualizar a branch oficial do Explorer somente após revisão de PR e regressões; ainda sem alterar `main`.
4. **90D:** proposta de staging de identidade/D1 somente com Access, issuer/AUD, JWKS/revogação e 12 external gates efetivamente verificados. Exige autorização independente para qualquer deploy remoto.
5. **90E:** uso real em smartphone, áudio EN/ES/PT, continuidade por aluno/QW/idioma/Experience após reload, backups e rollback. Produção apenas com aceite final explícito.

## Fechamento de aprendizado e mapa

Contrato visual continua `docs/SIYAYO-HOW-TO-SHOW-POSSIBLE-QUESTIONS-RESPONSES-CONTRACT.md`. WHAT S1→S2 ou S2→S3 têm origens distintas; WHERE continua `isolated-candidate`, WHICH S1→S2, WHY S3→S4. Pronome ES CUÁL/CUÁLES e PT QUAL/QUAIS é prática livre e não altera determinante WHICH. 14 QWs são plano maior; PAST/FUTURE e QWs sem autorização são **pendências**, não avaliações completas.

O registro `labs/jaguar-v30-3/security/prestaging-readiness.json` aponta **12 controles externos bloqueados**; o pipeline 90A deve **falhar** se isso desaparecer ou se declarar `releaseAuthorized:true`. Os testes são locais e não autorizam autenticação remota. Screenshots do GitHub Actions expiram; conservar visual homologado em arquivo durável após consentimento.

**Não tocar na PR #3, na branch oficial `jaguar/verb-explorer-resume-live-wire`, na `main`, nem publicar no Pages por essa consolidação.** O marcador `[CF-Pages-Skip]` sinaliza intenção de não implantar, mas a configuração real dos gatilhos Pages deve ser conferida independentemente.


## Sucessor 90B — roteiro de promoção obrigatório
Leia [JAGUAR 90B→90E](JAGUAR-90B-TO-90E-MASTER-ROADMAP.md) antes de qualquer novo ELO. Falha do teste histórico WHY em 90A localizada: após refatoração 89U, `children[0]` é row de speaker/resposta, não o botão; corrigir seletor sem reduzir contrato. Registrar futura matriz WHICH/WHAT/WHERE/WHY, outras 14 QWs, PRESENT/PAST/FUTURE e AFFIRMATIVE/NEGATIVE/INTERROGATIVE.
