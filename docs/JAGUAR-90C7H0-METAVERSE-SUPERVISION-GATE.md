# SIYAYO — JAGUAR 90C.7H.0 · SUPERVISÃO ANTES DA INTEGRAÇÃO

## Por que existe
Referência WHICH para execução ponta a ponta: HOW TO DO (ação canônica), HOW TO SHOW (representação visível), HOW TO RECORD (Evidence, Learning Trail, Word Path), seguida de SHARE/PRINT read-only e aceite. Um CI isolado não equivale a certificação de circuito completo.

## Supervision standard por QW × Experience × língua
1. **PROVENANCE**: SHA e fonte de pergunta, resposta e estrutura. Não confundir versão experimental com produção.
2. **CORPUS**: pergunta, resposta contextual, contrastes e coerência da cena; 3 idiomas, outros tempos/modos só se autorizados.
3. **HOW TO DO**: papel gramatical, Dependency Focus, Head Probe, escolha livre, áudio, botão de tentativa e assistência; rastreabilidade de origem/transferência por QW.
4. **ASSESSMENT**: verificar contrato autorizado, learner/NICK, language e origin; resposta livre/áudio não geram evidência. Eventos EVENT→RESULT→EVIDENCE→ATTEMPT→PASS 0/3,1/3,2/3,3/3.
5. **HOW TO SHOW**: texto, indicador de exploração versus avaliação, cartões, verde apenas para sucesso aceito, estados de foco e geometria portrait/landscape/desktop; acessibilidade e TTS.
6. **HOW TO RECORD**: ler perfil e contrato reais, comparar antes/depois do clique em cada QW; Trail e Word Path não criam avaliação, mas representam a mesma Evidence aceita; alternar idioma, QW, NICK, Experience e retornar sem perder o histórico.
7. **SHARE/PRINT**: relatório somente leitura com proveniência, evidências, progressos e versões; não existe ainda a certificação final, portanto bloquear status RELEASE_READY.
8. **REGRESSION**: teste negativo + teste positivo + teste de mudança de contrato anterior→novo. Ao falhar, registrar causa, screenshot e log, corrigir código e reexecutar todos os circuitos antigos.
9. **RELEASE**: fonte lab → preview estático → revisão humana visual/acústica → staging 90D (12 controles) → integração 90E com autorização específica. Não promover por somente CI GREEN.

## Matriz automática
`scripts/jaguar-90c7h0-supervisor.js` gera `visual-audit-90c7h0/supervision.json` e `supervision.md`, cobrindo todas as entradas QW presentes, três idiomas, metadados DF/DHP, status do contrato e pendências explícitas. **Não inventa** autoria para question words incompletas, nem considera estrutura existente como homologação.

## Gaps já confirmados
- S1/S2 WHY: resposta contextual já aprovada, mas DF/DHP sem autoria e dependências EN ES PT ainda ausentes.
- S3/S4 WHY após avaliação WHICH anterior: evidência humana de `EXPLORING WHY · ASSESSMENT WHICH`. Executar cenário de navegador com WHICH ativo e com tentativa anterior para reproduzir o problema; não reduzir isso a falha de áudio.
- WHICH Determiner Use pertence apenas a WHICH. Seu retorno precisa estar preservado quando outras QWs forem exploradas.
- Relatório SHARE/PRINT do Trail & Word Path não está certificado como read-only.
- Auditabilidade temporal: S4 CONCLUDE frase em PAST narrativo; modo PRESENT controla gramática e não promove exemplo narrativo a contrato.

## Regra de autorização para 90C.7H.1
Somente depois do resultado supervisor + Chromium WHICH→WHY, analisar a causa exata da seleção; implementar estruturas WHY S1/S2 em laboratório com Head Probe exploratório, sem avaliação, e revalidar WHICH e WHY EN/ES/PT. Toda nova autorização NEXT ELO deve consultar estes gates. PR #3/main, D1, Worker e produção seguem intocados.
