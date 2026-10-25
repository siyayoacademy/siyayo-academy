# JAGUAR H14.50 — Candidato JavaScript de lote protegido

Base: H14.49 `fa3cf9bcffa3e88b7addfa047cffd1d59ffd0b4c`. **Resultado: candidato executável com interface prepare/bind/batch, testado em SQLite local. Não é validação de D1 real.** Não há endpoint, binding remoto, deploy ou integração ao Explorer.

## O que foi implementado

O candidato JavaScript reutiliza o preparador H14.44 e o leitor 85C, conserva a tabela de ocorrências e usa as reservas e a fronteira local H14.46/H14.48. É desativado por padrão. Pedido estrito não aceita sujeito/autoridade do cliente. Serviços de identidade/alvo/ação continuam simulados.

Um recibo histórico autenticado é lido antes de preparar novo start. Para uma submissão nova, o preparador constrói binding e policy de servidor. O lote protege novamente autorização, revisão, sessão vigente, binding, ação e escopo diretamente no banco, evitando tratar o preparo JavaScript como decisão final.

As seis instruções preparadas enviadas a `db.batch()` são:

1. Inserir uma asserção SQL: precondições inválidas resultam em CHECK failure real.
2. Reservar escopo de start, quando não há ocorrência anterior.
3. Consumir a ação uma única vez por sujeito/actionReference.
4. Inserir pending na tabela 85C existente.
5. Remover a asserção temporária usada pelo lote.
6. Ler a ocorrência para verificar o recibo.

A tabela `mock_h1450_assertion` é metadado de teste, não outro armazenamento de ocorrências. Seu CHECK(ok=1) transforma autorização sem nenhuma linha correspondente em erro SQL, em vez de um UPDATE bem-sucedido com changes=0. Após commit bem-sucedido ela fica vazia; falha também não deixa resíduos, pois é revertida pelo lote.

Os predicados usam dados do banco, revisão esperada e tempo SQL `unixepoch()` na avaliação da guarda. Não há BEGIN/COMMIT emitido pelo JavaScript nem espera/intercalação JS entre as instruções do lote. A igualdade de um evento já gravado durante a janela de preparo evita outra inserção e produz duplicate. A assinatura compara o envelope canônico e seu hash; o hash não concede autoridade.

## Driver e escopo da prova

`batch_driver.py` fornece uma interface semelhante ao D1 usando uma única transação de SQLite com arquivo. Ele executa exatamente as instruções preparadas pelo candidato. Esse driver comprova a semântica SQL local e rollback, não a implementação de batch, o isolamento distribuído ou a replicação de Cloudflare D1.

É uma implementação candidata do contrato H14.49, não uma afirmação de que os MOCK schemas/triggers estão aprovados para produto. Usa Node crypto nos testes; compatibilidade de runtime/bundling Worker ainda deve ser verificada. Nenhum banco remoto foi consultado ou modificado.

## Validação

**17 testes novos** cobrem criação atômica; opt-in; revogação após preparo; zero linhas de autorização; revisão stale; sessão revogada/alvo expirado; binding alterado; falhas após reservas e após insert; retry; ação reutilizada com UUID distinto; conflito no UUID; gate desativado; EN/ES/PT pelo leitor 85C; campos forjados; resposta perdida após commit; ocorrência idêntica inserida entre preparo/lote; e retomada com ação independente.

O teste zero-row confere explicitamente o erro CHECK(ok=1), além de verificar ausência de ocorrência/reservas. Isso evita um falso positivo causado por falha genérica do driver. Injeções após gravação comprovam rollback do lote; perda de resposta depois do commit comprova recuperação por recibo sem duplicação.

```bash
node --test labs/jaguar-v30-3/test/h14-50/guarded-batch-candidate.test.mjs
```

A workflow mantém todas as regressões H14.39–H14.49, 85C e WHY S3→S4 EN/ES/PT. Nenhuma fonte anterior ou migração foi alterada.

## Limites e decisão

A vigência temporal é conferida na guarda do lote. Ainda falta comprovar política de expiração durante execução/commit no destino, autenticação real, ação/revisão imutáveis e autorização externa. A preleitura de replay precisa de política de consistência no D1, sem confiar em réplica arbitrariamente desatualizada.

A instalação H14.48 só aceita bancos locais consistentes; o candidato pressupõe essas precondições de schema/controladores. Não reconcilia registros legados ou autoriza usar schemas antigos sem reservas. Não há avaliação semântica, crédito, Evidence/outbox ou Green Pass.

**GO para ensaio local do candidato; NO-GO para staging/produção/Explorer.** Os sete portões H14.43 permanecem abertos. Próxima validação deve executar este protocolo em um ambiente D1 compatível e conferir concorrência, consistência e tempos reais antes de qualquer publicação.

Preservados main, PR #3, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto, WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.
