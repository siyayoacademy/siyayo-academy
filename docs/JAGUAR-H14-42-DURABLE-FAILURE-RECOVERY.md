# JAGUAR H14.42 — Falhas e recuperação do armazenamento durável

Base: H14.41 `9b06c9cc59990030dd4960f97a277720babeae0f`. Resultado: preparação técnica local validada; produção continua NO-GO.

## Escopo e resultados

Reutilizamos integralmente a migração e o contrato 85C, sem alterações. Não existe nova tabela de ocorrências, migração ou integração ao Explorer. Todos os sujeitos, eventos e referências são sintéticos; MOCK_ONLY não é alvo autorizado.

| Verificação | Método | Resultado local |
| --- | --- | --- |
| Morte antes do commit | Subprocesso SQLite encerrado via os._exit | Nenhuma gravação; retry cria uma linha |
| Commit com resposta perdida | Subprocesso encerrado após commit; nova conexão | Retry idêntico retorna duplicate |
| Oito retries simultâneos | Oito conexões SQLite sincronizadas por barreira | Um created, sete duplicate, uma linha |
| Três dimensões concorrentes, mesmo UUID | Três conexões com envelopes distintos | Um vencedor, dois conflitos; nenhuma sobrescrita |
| Mesmo UUID, sujeitos distintos | Conexões independentes | Duas linhas isoladas |
| Alterar idioma, dimensão ou intenção | Replay com envelope divergente | Conflito; original preservado |
| Banco ocupado | Lock de escrita e timeout controlado | Falha; retry após liberação funciona |
| Falha no meio de transação | Inserção seguida de violação de CHECK | Lote revertido; histórico anterior preservado |
| Rollback por desativação | Guarda simulada impede novas submissões | Leitor anterior e linhas legadas continuam disponíveis |
| Estado persistido | Reabertura e consulta de schema | pending/observed_exploratory; nenhuma tabela Evidence |
| Falhas no contrato JS 85C | DB double injeta falha antes/depois de insert e no read | storage_failure seguido de retry seguro |
| Binding alterado ou adulterado | Replay e leitura pelo contrato JS | occurrence_conflict ou integrity_failure |

Novos testes: **10 SQLite + 5 JavaScript**. Regressões: 24 testes do contrato 85C, 16 SQLite anteriores, H14.39, H14.40, H14.41 e ciclo canônico WHY S3→S4 em EN/ES/PT.

## Limites da comprovação

O teste SQLite usa arquivo real e conexões concorrentes, mas é um harness Python do protocolo SQL INSERT/read/compare, não o adaptador JavaScript executando dentro de D1. O teste JavaScript chama o contrato 85C original, mas usa DB double em memória. São verificações complementares, sem equivalência com concorrência distribuída Worker/D1.

A guarda de rollback é simulada; nenhum feature flag real ou caminho de produção foi criado. O ensaio transacional testa rollback de armazenamento, sem implementar atomicidade de decisão + Evidence/outbox. Hash protege integridade, sem conferir autoridade. Referências de ação e exposição são fictícias, sem demonstrar independência pedagógica.

DG-05 ganha evidência de concorrência LOCAL, permanecendo aberta para staging Worker/D1. DG-01/02/03/04/06/07 também continuam abertas para implementação/autorização, atomicidade avaliativa, identidade real, integração seletiva e homologação humana. H14.43 deve registrar esses bloqueios no manifesto GO/NO-GO.

## Reprodução

Executar da raiz do repositório:

```bash
python3 labs/jaguar-v30-3/test/h14-42-failure-recovery.sqlite.test.py -v
node --test labs/jaguar-v30-3/test/h14-42-storage-faults.test.mjs
```

A workflow H14.42 executa esses testes e todas as regressões listadas. Bancos de teste são temporários e removidos ao encerrar cada caso. Nenhuma credencial, sessão ou resposta de aprendiz real é necessária.

Preservados: main, PR #3, Explorer, PATITA, Learning Trail, FUNC-13 oculto, contratos WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.
