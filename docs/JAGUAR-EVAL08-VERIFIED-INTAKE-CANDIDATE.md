# JAGUAR EVAL-08 — Candidato de admissão verificada

Base: prévia WHY `ee7041bde5a588aa5d1d5f68db5dcfa03bf27414`.

Novo módulo: `server/assessment/eval08-verified-intake-candidate.mjs`. É uma **fronteira servidora modular**, não rota HTTP e não deploy. Ela aceita apenas `sessionHandle`, `actionKey`, `eventId`; exige adaptadores independentes para sujeito verificado e não revogado, ação direta comprovada, contrato pedagógico autorizado, avaliador confiável e gravação atômica de Attempt/Evidence. Preserva explicitamente sujeito×skill/QW×idioma×Experience de origem. Uma resposta falha não cria Evidence; um único resultado positivo não emite Green Pass. Os consumidores Word Path/Trail requerem leitura durável do armazenamento real em etapa futura.

A verificação não promove nenhuma declaração pedagógica. WHY S1/S2 permanece **context-only** e é bloqueado antes do avaliador. O ciclo canônico WHY S3→S4 e os caminhos WHAT/WHERE/WHICH declarados ficam elegíveis **somente se** serviços confiáveis emitirem contratos e ações coerentes. PATITA, áudio, NICK visual e metadados fornecidos pelo cliente não autorizam tentativas.

**Limites explícitos:** os testes usam adaptadores simulados em memória, não provam login real ou gravação D1 transacional. Não existe implementação do writer real nem autoridade de configuração; os retornos simulados não podem ser conectados ao Explorer de produção. Nenhuma mudança em main, PR #3, Cloudflare, Worker ou banco remoto. HG-01..15 e DG-01..07 continuam abertos.

Próxima etapa de engenharia: adapter de identidade real, revisão dos contratos autorizados em servidor, D1 staging com atomicidade e outbox, readback idempotente e homologação humana dos WHY S1/S2 antes de um lançamento.
