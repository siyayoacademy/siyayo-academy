# JAGUAR H14.40 — Contrato de idempotência durável, reaproveitando V30.3.85C

**Conclusão:** não duplicar o storage já estudado. V30.3.85C apresenta uma migração aditiva local SQLite/D1 com chave primária `(learner_subject,event_id)`, persistência, isolamento e testes. Nesta etapa esses arquivos são **somente consultados e preservados**, sem qualquer nova migração.

O laboratório H14.39 modelou um UUID global entre todos os perfis fictícios. Este modelo era conservador demais em relação ao contrato V30.3.85C: sujeitos distintos podem reutilizar UUIDs sem compartilhar dados, enquanto um mesmo sujeito não pode reaproveitar o UUID para outro idioma, origem ou payload. A futura integração seguirá a regra sujeita à identidade verificada do servidor. NICK continua identificação visual, jamais autenticador.

**Sete lacunas ainda abertas:** vinculação autoritativa de dimensão e intenção; contrato WHY S1/S2 autorizado; atomicidade de emissão Evidence; autenticação real; concorrência sob Worker/D1; reconciliação seletiva do Explorer com `main`; e homologação humana de HG-04/05/09/10.

O limite mais importante: `pending` não significa `pass`, e `observed_exploratory` nunca gera crédito. A migração 85C **não possui coluna dedicada para dimensão ou intenção**. Sua eventual evolução deve preservar tabelas e registros antigos e passar por migração aditiva separadamente revisada, não supor que campos ausentes já existem.

### Sequência de encerramento técnico proposta

1. **H14.40:** reconhecer V30.3.85C, resolver divergência de unicidade com H14.39 e auditar fontes.
2. **H14.41:** especificar dimensão/intenção e ciclo de tentativa em versão futura, sem acionar backend real.
3. **H14.42:** testes de falhas de restauração, replay, concorrência e rollback em laboratório isolado.
4. **H14.43:** entregar mapa final de integração seletiva e relatório GO/NO-GO, mantendo produção desativada.

Esses quatro ELOs são uma estimativa para **fechar a preparação técnica**, não para efetuar merge e lançamento. A homologação pedagógica, a identidade real, os contratos aprovados e a validação de staging permanecem portões próprios.

**Preservado:** Explorer, main, PR #3, Learning Trail, PATITA, FUNC-13 oculto, contratos canônicos S3→S4 e produção Cloudflare.
