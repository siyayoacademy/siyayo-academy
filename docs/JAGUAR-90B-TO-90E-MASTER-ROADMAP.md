# SIYAYO JAGUAR · Mapa obrigatório 90B → 90E e expansão pedagógica

**P0 / LEITURA OBRIGATÓRIA A CADA CORTE DE CHAT, NOVO ELO OU RETOMADA.** Este documento formaliza o roteiro explicitamente aprovado pelo usuário em 22/10/2026 e complementa `docs/JAGUAR-90A-CROSS-LINEAGE-INTEGRATION.md`. A fonte estruturada correspondente é `data/canonical/siyayo-integration-roadmap-90b.json`. Não substituir esses acordos por um resumo informal.

## Histórico preservado
A continuidade inclui V30.3→.40/.50/.60/.70/.80, auditorias 89O–89T, visual 89U–89Y e 89Z CUÁL/CUÁLES/QUAL/QUAIS. Os marcos internos V40/V50/V60/V70/V80 não foram comprovados como branches independentes. Arquivos históricos não recuperados em bytes originais permanecem explicitamente declarados no manifesto 90A. A consolidação **90A reúne fisicamente códigos**, não significa conexão automática de Worker ou D1 real.

## ELO 90B · Resolver incompatibilidade (ATUAL)
Falha 90A em `scripts/test-s3-why-live-assessment.js` linha 52. O teste ainda clicava `possible responses.children[0]`, anteriormente botão e agora **linha com speaker independente e botão de resposta**. Ajustar o teste para clicar **apenas o botão avaliativo real**; adicionar caso negativo de clique no speaker. Avaliador WHY, requisito FUNCTION/LOCAL ANSWER/TRANSFER e NEXT ficam **intocados**. Exigir CI de reconciliação das duas linhas e segurança bloqueada.

## ELO 90B.1 · Auditoria integral da integração
Conferir identidade/NICK, escopo aluno + QW + idioma de avaliação + Experience de origem, memória local/retorno, contratos e evidências autorizadas, WHICH REVIEW e R1/R2, WHAT S1/S2 com origens separadas, WHERE suporte onstart (isolated-candidate), WHY S3→S4, Green Pass e NEXT independente. Provar que os módulos V30 Worker/D1 foram arquivados com seu hash original e **não** conectados ao Explorer oficial.

## ELO 90C · HOW TO SHOW + LEARNING TRAIL + WORD PATH
Usar o contrato `docs/SIYAYO-HOW-TO-SHOW-POSSIBLE-QUESTIONS-RESPONSES-CONTRACT.md` sem reinvenção. **POSSIBLE QUESTIONS**: uma pergunta por cartão integral semirretangular, speaker SVG dourado integrado, QW dourada atômica quando não revela resposta. **POSSIBLE RESPONSES**: uma alternativa por linha integral, speaker dourado independente à esquerda e resposta avaliativa centralizada à direita. Learning Trail/Word Path **mostram** escopo, tentativas válidas, função, resposta local, transferência, palavras e marcadores; jamais criam pontuação. Portrait com linhas gramaticais legíveis e formas ES/PT separadas. Inclui prática livre ES CUÁL/CUÁLES e PT QUAL/QUAIS do 89Z, **sem Green Pass canônico**.

## ELO 90C.1 · Preview isolado e homologação do usuário
Priorizar imagens e ensaios **PORTRAIT 390×844**, como último acordo, para S1→S4. Conferir áudio/pronúncia EN/ES/PT em smartphone físico, elementos dourados, cartões, navegação livre, Learning Trail e Word Path. O Explorer real só recebe as alterações após homologação visual; o CI sozinho não a substitui.

## ELO 90D · Persistência e segurança reais
Cloudflare Access, Worker e D1 exclusivamente em staging isolado, depois de **12 controles externos** de `labs/jaguar-v30-3/security/prestaging-readiness.json` serem verificados com evidências independentes e autorização específica. Provar associação a aluno autenticado (NICK ≠ identidade), JWT/JWKS/AUD, revogação, backup, recuperação após recarga, isolamento entre alunos, privacidade e rollback. Nada remoto é habilitado por teste de laboratório.

## ELO 90E · Homologação e publicação final
Somente após aprovar as etapas anteriores, revisar a integração para `jaguar/verb-explorer-resume-live-wire` / PR #3, fazer regressões, testes reais e obtenção de aprovação explícita para merge/publicação em produção. A `main` e a produção permanecem intactas durante 90B–90D.

## PENDÊNCIAS PEDAGÓGICAS QUE NÃO PODEM SUMIR DO MAPA
| Dimensão | Necessidade posterior |
|---|---|
| WHICH, WHAT, WHERE, WHY | Homologação integrada no Explorer real, por QW/idioma/origem |
| Demais Question Words da família de 14 QWs | Novos contratos, evidências e HOW TO SHOW específicos |
| PRESENT | Ampliar cobertura avaliativa, sem confundir corpus e evidência validada |
| PAST | Desenvolver/testar contratos próprios por contexto e modo |
| FUTURE | Desenvolver/testar contratos próprios por contexto e modo |
| AFFIRMATIVE / NEGATIVE / INTERROGATIVE | Verificar cada modo para PRESENT, PAST e FUTURE, todas as QWs e Experiences relevantes |

**Regra:** estes itens estão mapeados, mas **não estão todos implementados/homologados**. Não declarar o programa completo apenas porque WHY S4 fechou em laboratório. Próximo passo 90B.1 após CI 90B; manter exigência de auditoria cruzada, imagens de aprovação e testes de persistência de aluno real.

## Preservação e integridade
Manter SHA de origem, `labs/jaguar-v30-3` árvore `5ee77257551593b8e4960dd6971cc7ed069fcd56`, manifesto 90A, histórico de CI e documentação específica. Artefatos visuais temporários do Actions expiram; capturas homologadas precisam destino durável. Não alterar registro original de avaliação para passar um teste antigo. Não alterar `main`, PR #3, Worker remoto, D1 remoto ou Pages.
