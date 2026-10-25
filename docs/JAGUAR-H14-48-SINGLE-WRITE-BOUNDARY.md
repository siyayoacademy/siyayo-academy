# JAGUAR H14.48 — Ponto único de escrita no laboratório

Base: H14.47 `c96744fa5f216b0abe4411c28bf92f76d82e73e7`. **Resultado: bypass do escritor antigo bloqueado no banco SQLite de laboratório.** Não existe ligação ao Explorer, Worker/D1 ou produção.

## Problema resolvido neste escopo

H14.47 demonstrou que H14.45 podia gravar outra ocorrência para uma ação já consumida por H14.46. H14.48 instala uma fronteira obrigatória na tabela de ocorrências do arquivo temporário: toda inserção passa pelas mesmas verificações de reserva de ação, reserva de escopo, binding e revisão de autorização. O escritor H14.45 continua disponível como fonte histórica/teste, mas suas novas gravações são rejeitadas nesse banco protegido.

A implementação usa triggers SQLite **de laboratório** sobre `v30_85c_occurrences`, uma pequena tabela `mock_h1448_gate` de controle e os metadados auxiliares do H14.46. Nenhuma nova tabela de ocorrências, coluna ou cópia de respostas é criada. A migração 0004 e os módulos anteriores não foram alterados. Esse DDL não foi acrescentado às migrações do produto nem aplicado remotamente.

## Instalação e registros existentes

`install()` é desativado por padrão. Com habilitação explícita no teste, abre um banco existente, adquire `BEGIN IMMEDIATE`, executa a auditoria H14.47 e somente então instala DDL e controle na mesma transação. A auditoria retém um snapshot consistente enquanto o lock de escrita impede alterações concorrentes. Não se usa executescript, que encerraria implicitamente a transação de instalação.

| Estado do banco | Decisão |
| --- | --- |
| Vazio, com metadados sintéticos válidos | Pode instalar no laboratório |
| Ocorrências H14.46 com reservas consistentes | Pode instalar, preservando bytes e recibos |
| Ocorrências H14.45 sem reservas | Bloqueia; exige reconciliação explícita |
| Registros antigos sem binding | Bloqueia; não converte nem apaga |
| Claims órfãos, integridade divergente ou metadados ausentes | Bloqueia sem criar tabelas/autoridade |

A decisão para bancos legados é **não realizar cutover automático**. Leitura pelo caminho anterior continua disponível; a instalação recusada não torna esse banco apto a gravar com as novas garantias. O planejamento de reconciliação de cada conjunto de registros permanece aberto.

## Fronteira obrigatória

O trigger de insert exige gate ativo, pending/assessment/WHY, binding compatível com colunas externas, claim da mesma ação associado ao UUID, reserva do escopo exato e alvo autorizado na revisão do envelope. H14.46 grava reservas e ocorrência na mesma transação e atende essas condições. H14.45 não pode contorná-las com outro UUID.

Triggers adicionais impedem UPDATE e DELETE de ocorrências no banco protegido, inclusive pelo antigo caminho SQL. Isso preserva o envelope imutável; o histórico não é reescrito para preencher lacunas. A desativação coloca o gate em zero: bloqueia inserts novos, preserva leitores e permite recibos históricos sem nova avaliação. Reservas tentadas antes de um insert bloqueado são revertidas pela transação H14.46.

## Testes

**12 testes novos** exercitam instalação opt-in, transação aceita, escritor antigo rejeitado, reprodução do bypass agora bloqueada, leitura/replay, recusa de bancos não reconciliados, preservação de registros, desativação e rollback, imutabilidade, insert direto sem reservas e EN/ES/PT.

**Os 20 cenários H14.46 foram repetidos com a proteção instalada**, incluindo oito retries concorrentes, UUIDs disputando uma ação, escopo disputado, revogação e expiração antes do commit. A workflow mantém também todas as regressões H14.39–H14.47, 85C e WHY S3→S4.

```bash
node --test labs/jaguar-v30-3/test/h14-48/single-write-boundary.test.mjs
python3 -B labs/jaguar-v30-3/test/h14-48/guarded_transactions_test.py -v
```

## Limites e próxima etapa

Este é um modelo com acesso administrativo controlado ao banco de teste. Triggers não são barreira contra quem pode editar metadados de autoridade, remover triggers ou alterar o schema. Todos os alvos, sessões e ações são MOCKS; o sistema não autentica aprendizes reais. O trigger complementa a transação H14.46, que verifica sessão, ação e tempo; ele não substitui um autenticador, não chama serviços externos nem resolve autorização distribuída.

Não foi criado um escritor transacional JavaScript para Worker/D1. As garantias reais e o mecanismo de transação do destino precisam ser verificados antes de portar esse protocolo. Nenhum trigger deve ser copiado para staging/produção presumindo equivalência com SQLite local.

As sete lacunas H14.43 continuam abertas. Próxima etapa concreta: fechar o contrato do escritor único e sua política de reconciliação legada para o adaptador de destino, com diferenças entre garantias locais e distribuídas explícitas. Evidência de armazenamento não é Evidence pedagógica.

Preservados main, PR #3, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto, WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.
