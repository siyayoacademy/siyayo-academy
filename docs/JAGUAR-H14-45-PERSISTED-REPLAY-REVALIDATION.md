# JAGUAR H14.45 — Replay persistido e revalidação no laboratório

Base: H14.44 `557ff26a9b279b9ed73e1833b299ba3dc0eef5e1`. Primeiro adaptador de laboratório que combina o preparador H14.44 com o armazenamento 85C original. Não substitui a tabela existente. Nenhuma rota HTTP, ligação ao Explorer, migração ou implantação é criada.

## Fluxo implementado

1. Adaptador desativado por padrão; teste precisa fornecer `enabled:true` e dependências de servidor simuladas.
2. Validar pedido estrito e identidade atual. O sujeito é resolvido pelo servidor; nunca pelo NICK ou pedido.
3. Consultar sujeito + UUID na tabela 85C. Reutilizar o leitor 85C para conferir integridade e isolamento; validar também binding versionado e coerência com as colunas externas.
4. Se a ocorrência corresponder ao alvo, referência da ação e intenção originais, retornar recibo `duplicate`, sem preparar outro `start` e sem consultar autoridade atual para uma nova tentativa.
5. Sem ocorrência, executar preparo H14.44 duas vezes, resolver alvo/ação/escopo novamente e comparar integralmente os envelopes. Mudança de binding ou revogação detectada bloqueia gravação.
6. Revalidar identidade, conferir novamente a existência do UUID e usar `writeOccurrence85C` original. A chave única e a comparação original continuam tratando duplicatas/conflitos no insert.

O recibo não retorna a resposta do aluno e mantém `evaluationAllowed:false` e `evidenceAllowed:false`. Sucesso representa somente `pending` armazenado. Um alvo revogado pode ter seu recibo histórico recuperado pelo mesmo sujeito autenticado; isso não o reautoriza. Uma nova submissão ao alvo revogado é bloqueada.

## Persistência real nos testes

O driver de teste executa as consultas do módulo JavaScript 85C em SQLite com arquivo temporário, usando Python como ponte de teste. Cada operação abre uma nova conexão; um novo adaptador sobre o mesmo arquivo comprova replay após reinicialização do componente. A migração 0004 e storage-contract.mjs permanecem sem alterações. Não é um novo banco de ocorrências de produto nem prova de D1 distribuído.

**18 testes novos:** gravação pending; retry start com escopo existente; resposta perdida depois do insert; conflitos de alvo/ação/intenção; recibo após revogação; revogação e mudança de versão entre preparos; identidade expirada e troca de principal; isolamento entre sujeitos; digest adulterado; registro legado; adaptador desativado; falha de lookup; rascunho bloqueado; EN/ES/PT e transferência explícita antes de prova local.

Também executadas as regressões H14.39–H14.44, 85C, SQLite e WHY S3→S4. Todos os sujeitos, alvos e ações são sintéticos. Os resolvers são mocks; nenhum contrato S1/S2 real recebeu status autorizado.

## Limites que permanecem abertos

A dupla resolução reduz a janela de dados desatualizados, mas **não é transação atômica de autorização + gravação**. Uma revogação após a última verificação ainda exige fencing/versionamento transacional futuro. O contrato 85C protege unicidade por sujeito/UUID, não exclusividade de uma actionReference sob UUIDs diferentes. A criação/reserva de escopo também não foi implementada atomicamente.

Para replay, o cliente continua enviando somente referências estáveis e intenção original. A troca posterior de idioma ou Experience não reatribui a linha já gravada. Alteração de conteúdo sob uma mesma actionReference deve ser proibida pelo futuro serviço confiável de ações; o adaptador não trata uma referência mutável como uma nova resposta.

`legacy_unbound` bloqueia upgrade implícito, preservando a linha antiga. Falha na consulta não é tratada como ausência, evitando gravação por fallback. O hash confirma integridade, sem comprovar autorização ou significado. Nenhuma ocorrência é convertida em Evidence.

DG-01 ganha protótipo combinado com persistência local; as sete lacunas do manifesto H14.43 continuam abertas. Próximo foco: reserva/consumo de ação e escopo, com revisão da fronteira transacional de autorização. Autenticação real, contratos EVAL-08, homologação, Evidence/outbox e staging continuam requisitos próprios.

Preservados main, PR #3, produção, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto e WHY S3→S4. Nenhuma Evidence ou Green Pass emitido.

```bash
node --test labs/jaguar-v30-3/test/h14-45/persisted-replay-lab.test.mjs
```
