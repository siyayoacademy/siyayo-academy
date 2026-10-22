# JAGUAR V30.3.89T · navegador real, contexto isolado
Estado: experimental, sem homologação de áudio acústico ou smartphone físico.

## Escopo
Executa navegador Chromium real no GitHub runner sobre o Explorer original c7e83709, servido somente de localhost. Sem DOM injetado, sem simuladores de tela gerados artificialmente, sem D1 remoto, Access, deploy ou publicações oficiais.

- S1: WHICH, R1/R2, feedback antes de REVIEW, REVIEW correto em EN/ES/PT; a escolha contextual não gera automaticamente crédito 0/3→3/3.
- S3: WHY da Experience Having, avaliação iniciada apenas por seleção explícita e NICK sintético. Dois requisitos geram 2/3.
- S4: visita via NEXT mantém origem S3 e 2/3; apenas resposta TRANSFER canônica chega a 3/3.
- UI: desktop 1440x900, viewport emulada portrait 390x844 e landscape 844x390; verifica clipping global e guarda screenshots e report.json.
- Botões de áudio observados, mas áudio acústico, qualidade de pronúncia e smartphone físico NÃO homologados.
- Execução estrita: se um teste falhar, CI RED e evidência de erro; sem afrouxar critérios para tornar GREEN.

## Autoridade e governança
Branch experimental jaguar/v30-3-recovery-archive; Explorer fixado e preservado; main, Pages e produção inalterados.
A identidade sintética/NICK não equivale a autenticação servidor. WHERE continua isolated-candidate.
Disciplina: crédito canônico ≠ observação exploratória ≠ feedback contextual ≠ NEXT.

## V30.3.89T.1 — correção de sincronização do ensaio
A execução 39810942229 falhou em três testes WHY antes de chegar a S2: o primeiro clique em NEXT foi feito tão logo as QWs ficaram visíveis, antes de o script garantir a instalação assíncrona do handler do NEXT. Os testes de REVIEW e viewport foram aprovados. A execução seguinte deve aguardar explicitamente o handler nativo instalado e a disponibilidade do Coordinator, preservando a navegação real pelo clique do aprendiz. Erro de timeout de inicialização é RED e registra estado do navegador. Nenhum código do Explorer ou do contrato foi modificado.
