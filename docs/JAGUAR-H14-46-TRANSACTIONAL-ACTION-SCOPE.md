# JAGUAR H14.46 — Reserva transacional de ação e escopo

Base: H14.45 `1926c60e38e311f5c983ea1501cc37b66720dd19`. **Resultado: modelo transacional SQLite local testado, sem integração ao Explorer/Worker/D1.** A tabela e a migração 85C permanecem intactas.

## Responsabilidade do incremento

H14.45 executa o contrato JavaScript original e revalida antes do write, mas mantém janela entre autorização e gravação. H14.46 ensaia outra fronteira: uma transação `BEGIN IMMEDIATE` que lê autorização simulada e grava reserva de escopo, consumo da ação e ocorrência na tabela 85C. Não altera o adaptador H14.45 nem afirma que o gap dele foi resolvido em produção.

O modelo é Python/SQLite dentro de `test/h14-46`. As tabelas `mock_sessions`, `mock_targets`, `mock_actions`, `mock_scope_reservations` e `mock_action_consumption` são metadados auxiliares criados somente no arquivo temporário dos testes. **Não contêm uma segunda cópia de ocorrências.** Não há nova migração de produto; qualquer schema futuro deverá passar por revisão aditiva própria.

## Regras exercitadas

- A sessão simulada fornece o sujeito dentro da transação; NICK/sujeito do pedido são rejeitados.
- O alvo deve pertencer ao sujeito, estar autorizado, não revogado, vigente e na revisão esperada. Dimensão/origem/idioma vêm da fonte simulada do servidor.
- O escopo inclui sujeito, skill, idioma, origem, ID/versão do contrato e QW; dimensão não divide artificialmente o mesmo ciclo.
- `start` reserva um escopo novo; `resume`/`transfer` exigem escopo existente. A transferência não exige prova local prévia.
- A ação direta tem consumo único por **sujeito + actionReference**, independente de UUID/alvo/dimensão. Uma ação não satisfaz duas dimensões. Nova resposta independente exige nova referência de ação.
- O consumo, a criação de escopo e o insert 85C fazem parte da mesma transação. Falha ou expiração antes do commit reverte os três.
- Uma revisão de autorização desatualizada falha sem reservar nada. O relógio é consultado depois de adquirir o lock e novamente antes do commit.
- Um retry idêntico lê o recibo histórico antes de tentar iniciar/reservar novamente. Ele não reautoriza avaliação. Sessão revogada não acessa nem esse recibo.

## Evidência local

**20 testes** com SQLite persistente e conexões independentes incluem: oito retries concorrentes; corrida entre duas ações iniciando o mesmo escopo; UUIDs diferentes disputando uma ação nova; revogação concorrente; rollback após claim; revisão stale; expiração antes do commit; isolamento por sujeito/idioma; scope ausente; PATITA/exposição desconhecida bloqueadas; transferência antes de prova local; recibo histórico após revogação.

Na corrida com revogação existem dois resultados válidos: a revogação vence e bloqueia o insert; ou a gravação vence enquanto autorizada, e a revogação ocorre depois. O teste confere que ocorrência/escopo/consumo permanecem consistentes em ambos. Não é promessa de cancelamento retroativo de uma gravação já confirmada.

```bash
python3 labs/jaguar-v30-3/test/h14-46/transactional_lab_test.py -v
```

A workflow também executa H14.39–H14.45, os contratos 85C e a regressão canônica WHY S3→S4 EN/ES/PT. Metadados e sessões são exclusivamente sintéticos; o flag de autorização dos testes não autoriza contratos reais S1/S2.

## Limites e próximo trabalho

A garantia de serialização local depende de todos os escritores de autorização e ocorrência usarem **o mesmo banco e protocolo transacional**. Uma autorização externa não participa desse lock. Alterações de identidade/revogação em outro serviço requerem protocolo próprio de revisão/fencing e não estão resolvidas por SQLite local. Expiração é verificada antes do commit; nenhum sistema garante retroativamente autorização após a transação concluída.

O modelo reproduz o insert na tabela 85C, não chama o contrato JavaScript dentro da transação Python. O H14.45 e seus testes continuam comprovando o caminho JavaScript; o H14.46 comprova separadamente o modelo transacional. Transportar esse protocolo para a API e as garantias reais do Worker/D1 requer estudo e validação de staging. Não foi implementado código de deploy ou endpoint.

Também permanecem abertos: importação/compatibilidade de reservas com escopos legados, persistência imutável de referências de ação, identidade real, aprovação EVAL-08, consumo canônico e Evidence/outbox. Reserva de armazenamento não é avaliação aceita. Os sete portões H14.43 continuam abertos.

Próximo foco: especificar e verificar a compatibilidade entre o adaptador JavaScript, o protocolo transacional e os registros anteriores, antes de definir um patch executável para staging.

Preservados main, PR #3, Explorer, PATITA, Trail/Word Path, FUNC-13 oculto, WHY S3→S4 e produção. Nenhuma Evidence ou Green Pass emitido.
