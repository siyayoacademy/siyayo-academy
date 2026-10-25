# JAGUAR H14.44 — Primeiro incremento do patch seletivo

**Resultado:** preparador isolado de envelope 85C em modo dry-run. Não está ligado ao Explorer, Worker, rota HTTP ou banco. É um componente de laboratório sob `labs/.../test/h14-44`, candidato a futura implementação de DG-01, não um adaptador de produção.

## Base verificada

H14.43: `94bfc9ce9d171d7024ec6bbd641aab2cb5d27333`. A consulta ao GitHub confirmou os mesmos HEADs do snapshot: main `c2149f5e63b8de716cf9b9dcdede213bd328344e`, PR #3 `c7e83709cacf8479847df0f3cee4ed8a563aaae6`, Registry `719f259d78ca27d444bdfacecd3ccd2091818980`. Nenhuma branch protegida foi alterada. O manifesto H14.43 permanece congelado e sua allowlist de aplicação ao runtime continua vazia.

## Contrato implementado no laboratório

O pedido aceita somente sessionHandle, UUID, targetId, actionReference e intenção. Não aceita NICK/sujeito, origem, dimensão, nota ou campos de autoridade do cliente. Serviços injetados representam dependências futuras do servidor:

| Dependência | Responsabilidade futura |
| --- | --- |
| resolveIdentity | Verificar sessão real, revogação e principal autenticado |
| resolveTarget | Resolver alvo autorizado, sujeito, idioma, origem, dimensão e vigência |
| resolveScope | Resolver escopo exato incluindo ID e versão do contrato; detectar início versus retomada |
| resolveAction | Resolver ação direta e sua proveniência/exposição, vinculadas ao alvo |
| now | Relógio confiável do servidor |

Essas dependências são MOCKS nos testes. Um objeto que contém status AUTHORIZED não cria autoridade real: somente um serviço futuro confiável poderia fornecê-lo. Não há verificadores reais ou contratos novos autorizados neste incremento.

O preparador rejeita S1/S2 com os status DRAFT_NOT_AUTHORIZED reais do H14.6, mesmo existindo metadados de WHY nessas cenas. O retorno de sucesso é `PREPARED_ONLY_NOT_STORED`, com `evaluationAllowed:false` e `evidenceAllowed:false`.

O envelope usa campos compatíveis com 85C e binding H14.41 no evento JSON. A saída não contém sessionHandle ou objeto de autenticação; o sujeito permanece na policy de servidor, não no payload do cliente. A estrutura retornada fica congelada e não mantém referências mutáveis aos dados dos resolvers.

## Flexibilidade preservada

`start` não reinicia escopo existente. `resume` e `transfer` exigem escopo já existente na origem exata. Uma transferência pode ser tentada antes da prova local, sem depender de avaliação anterior WHICH/HOW. S2 como origem local e S2 como destino de S1 permanecem distintos. A exposição ao modelo é registrada, incluindo `exposed`; o preparador não declara independência nem avalia significado. PATITA_OBSERVATION não é aceita como ação direta.

## Limites e próximos passos

O preparador é sem estado e não reserva UUID, não grava, não cria escopo e não resolve replay persistido. O futuro adaptador deverá consultar primeiro a ocorrência já gravada por sujeito/UUID e comparar o envelope imutável; um retry de `start` não deve ser reinterpretado como novo início quando o escopo já existe. Resolver dupla submissão de uma mesma referência de ação, revogação entre preparo e gravação e transações concorrentes exige desenho/teste adicional. Preparar duas vezes retorna o mesmo envelope sob o mesmo snapshot de dependências, sem comprovar exactly-once.

O escopo 85C externo não possui coluna de contractId/dimensão; esses campos ficam no evento e devem ser conferidos por um futuro leitor avaliativo. Não foi criada consulta avaliativa nova. Nenhum retorno deste módulo pode ser passado diretamente pelo navegador como prova de autorização.

DG-01 avança de especificação para protótipo testado; as sete lacunas permanecem abertas. A próxima implementação deve tratar replay e revalidação no adaptador isolado antes de conectar qualquer caminho ao Explorer. Identidade real, EVAL-08 autorizado, atomicidade Evidence/outbox, staging e homologação humana continuam requisitos independentes.

## Validação

14 testes verificam pedidos adulterados, identidade expirada, alvos revogados/rascunhos, conflito de escopo, S2 em duplo papel, transferência antes da prova local, ação versus PATITA, exposição conhecida/desconhecida, erros de resolver e EN/ES/PT. A workflow também executa a verificação H14.43 e todas as regressões H14.39–H14.42/85C/WHY S3→S4.

```bash
node --test labs/jaguar-v30-3/test/h14-44/server-binding-dry-run.test.mjs
```

Preservados main, PR #3, produção, schema 85C, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto e ciclo WHY S3→S4. Nenhuma Evidence ou Green Pass emitido.
