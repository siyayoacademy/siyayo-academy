# SIYAYO WHY — Auditoria de impacto e proposta XPR-02

**Decisão: referência complementar e auditoria sob demanda. Proposta documental publicada separadamente; sem ativar watchlist, monitoramento, integração ou alteração do laboratório.** O roteiro técnico continua no H14.52 proposto. Esta revisão de governança não ocupa seu número nem modifica seu procedimento.

## Fontes consultadas e alcance

XPR-02 em `04ea14d92e028f832313aa3a973762b8c60c0b6e`, branch `jaguar/cross-project-registry-xpr02-20261025`. Foram lidos os quatro documentos solicitados e os JSON REG-02/REG-03 já incorporados nessa branch. Identificadores e fronteiras desses registros foram reaproveitados, sem criar outro catálogo de módulos.

Foram consultados por GET no GitHub os HEADs das 12 branches H14.40–H14.51, seus commits, arquivos acrescentados, referências JSON e runs de Actions. Os 12 HEADs coincidem com os checkpoints publicados e cada checkpoint possui run concluído com success. A cadeia de pais é linear entre esses checkpoints. Dez blobs relevantes do laboratório foram conferidos contra a árvore GitHub do H14.51. As observações e SHAs completos estão em `why-xpr02-impact-review-20261025.json`.

As cinco entradas da watchlist ativa também coincidem com seus SHAs de referência. Isso é ausência de drift nos HEADs observados, não comprovação de homologação ou dependências completas. Nenhuma supervisão contínua é criada.

**Atualização de contexto:** o comunicado cita H14.50; o checkpoint técnico efetivamente disponível já é **H14.51**, commit `bb2878e3746415a29f4e5b15c087a65ec31fd696`, com binding D1 local Miniflare/workerd testado. O candidato ainda roda no host Node acessando o binding; empacotamento dentro do Worker, D1 remoto e autenticação real não foram comprovados.

## Estado dos avanços

IMPLEMENTADO significa artefato/protótipo no escopo indicado, sem equivalência com produção. TESTADO LOCALMENTE deriva dos testes e referências publicados, com CI conferida nesta auditoria; os laboratórios não foram reexecutados por esta revisão documental. HOMOLOGADO exige evidência humana específica, especialmente HG-04/05/09/10; não foi localizada nas fontes lidas. INTEGRADO aqui significa conectado ao Explorer/produção, não apenas a ligação entre componentes de teste.

| ELO | Implementado no escopo indicado | Evidência de teste | Homologação pedagógica | Explorer/produção |
| --- | --- | --- | --- | --- |
| H14.40 | Reconciliação 85C e auditoria de reaproveitamento | TESTADO LOCALMENTE / CI success | PENDENTE | NÃO INTEGRADO |
| H14.41 | Especificação dimensão/intenção/ciclo | Modelo e regressões / CI success | PENDENTE | NÃO INTEGRADO |
| H14.42 | Ensaios de falha/recuperação | SQLite e contrato JS / CI success | PENDENTE | NÃO INTEGRADO |
| H14.43 | Manifesto seletivo e sete portões | Hashes e decisões / CI success | PENDENTE | NÃO INTEGRADO |
| H14.44 | Preparador dry-run de binding | Casos sintéticos / CI success | PENDENTE | NÃO INTEGRADO |
| H14.45 | Replay persistido e revalidação | JS + SQLite / CI success | PENDENTE | NÃO INTEGRADO |
| H14.46 | Modelo transacional Python | Reservas e corridas locais / CI success | PENDENTE | NÃO INTEGRADO |
| H14.47 | Auditor de compatibilidade | Bypass entre escritores reproduzido / CI success | PENDENTE | NÃO INTEGRADO |
| H14.48 | Fronteira de escrita em SQLite | Bypass bloqueado com proteção instalada / CI success | PENDENTE | NÃO INTEGRADO |
| H14.49 | Contrato de destino e plano legado | Plano read-only e semântica SQL / CI success | PENDENTE | NÃO INTEGRADO |
| H14.50 | Candidato JS de batch protegido | Driver SQLite / CI success | PENDENTE | NÃO INTEGRADO |
| H14.51 | Ensaio com binding D1 Miniflare | API D1 local, corridas e reinício / CI success | PENDENTE | NÃO INTEGRADO |

A preparação H14.40–H14.43 continua encerrada como 4/4. Os ELOs posteriores são implementação isolada e validação progressiva; não tornam retroativamente verdadeira uma integração em produção. Os trabalhos estão preservados por checkpoints e fontes, não são descartáveis.

## Origem, dependências e consumidores

| Componente/fonte | Dependência confirmada no laboratório | Impacto e fronteira |
| --- | --- | --- |
| H14.40 / REG-02 STORE-85C / REG-03 LAB-85C | Migração 0004 e contrato 85C existentes | Reusar chave sujeito/UUID; nenhum banco paralelo de ocorrências |
| H14.41 / INTENT-01 / AUTH-01 | Contratos de referência dimensão/intenção | Especificação não autoriza alvo EVAL-08 |
| H14.43 / GATE-01 | Manifesto e fontes congeladas | Sete portões permanecem abertos |
| H14.45 | Importa preparador H14.44 e contrato 85C | Replay não reinicia start; escritor anterior não possui reservas transacionais |
| H14.46 | Protocolo SQL na tabela 85C | Modelo Python local, não adaptador transacional JS |
| H14.48 | Importa auditor H14.47 e usa metadados H14.46 | Proteção vale apenas após instalação local; dados legados não são reconciliados automaticamente |
| H14.49 | Importa auditor H14.47 | Planeja tratamento sem escrever ou reparar dados |
| H14.50 | Importa H14.44 e leitor 85C; pressupõe schema protegido | Batch guarda autorização/reservas/ocorrência; asserção é metadado de teste |
| H14.51 | Importa H14.50 e leitor 85C; Miniflare fixado | Testa binding D1 local sem provar módulo dentro do Worker |

Os consumidores abaixo são **potenciais na futura integração**, não conexões já instaladas: `SIA:ID-05` (identidade visual não autentica), `SIA:EVAL-08` (contrato/avaliador), `SIA:TRAIL-10` e `SIA:WORD-11` (projeções read-only de Evidence aceita). `SIA:PATITA-12` permanece observacional; `SIA:LIVE-07` apresenta corpus; `SIA:FUNC-13` permanece oculto e sem crédito.

**Entradas e saídas reais do laboratório:** chamadas prepare/submit, pedido com UUID e referências, binding versionado no JSON, recibos created/duplicate e estado pending. Nenhum evento DOM, inscrição em eventos do Explorer, controlador de áudio ou emissor de Evidence foi conectado por esses ELOs. Não inventar uma ligação de eventos por semelhança de nomes.

## Cinco HOW TO aplicados

| Eixo | Aplicação neste laboratório |
| --- | --- |
| HOW TO DO | Preparar binding, reconhecer retry, reservar ação/escopo e executar batch protegido |
| HOW TO RECORD | Tabela 85C existente; UUID estável, sujeito verificado como requisito, proveniência e envelope imutável |
| HOW TO SHOW | Recibos e relatórios agora; Trail/Word Path futuros somente por Evidence canônica |
| HOW TO CHECK | Fontes fixadas, testes, corridas/falhas e XPR-02 sob demanda; CI não homologa |
| HOW TO SPEAK | Não aplicável ao backend atual; nenhum áudio novo e nenhum clique de speech convertido em tentativa |

## Divergências e riscos identificados

1. **Defasagem documental delimitada:** REG-02 conserva H14.41–H14.43 como pendentes no snapshot H14.40. Este suplemento atualiza a leitura até H14.51 sem reescrever a referência histórica. Isso não é drift de HEAD: os HEADs observados continuam MATCH.
2. **Cobertura incompleta da watchlist:** somente H14.40 está inscrito. H14.41–H14.51 não passam a ser monitorados por existirem ou terem CI verde.
3. **Limite do mapeador XPR-02:** `labs/jaguar-v30-3/` recebe LAB_ONLY_NO_RUNTIME_ADOPTION, sem consumidores. Certos JSON de referência, scripts de testes H14 e workflows Jaguar não têm regra e devem permanecer UNMAPPED_REVIEW_REQUIRED até revisão explícita. As dependências deste relatório são suplemento verificado, não ampliação silenciosa do motor.
4. **Escritores concorrentes:** H14.47 demonstrou bypass; H14.48 o bloqueou somente no banco local protegido. Não transportar dois caminhos de escrita para o destino presumindo a proteção em qualquer banco.
5. **Confusão de estados:** pending/created/duplicate/CI success/MATCH não equivalem a Evidence, GREEN, homologação ou integração.
6. **Escopo de runtime:** binding D1 local não é D1 remoto, autenticação real ou Worker empacotado. Reservas/asserções locais não são um schema de produto aprovado.
7. **Separação interprojetos:** MCE pode reutilizar o método de governança, sem importar WHY, identidade, contratos, PATITA, Evidence ou armazenamento por analogia.

## Proposta de watchlist — sem ativação

`docs/proposals/siyayo-cross-project-watchlist-why-proposal.json` preserva as cinco entradas ativas sem modificar SHAs e propõe mais 11 entradas: H14.41–H14.51, todas com checkpoint completo verificado. Total proposto: 16 watches; o H14.40 não é duplicado.

A watchlist ativa `docs/siyayo-cross-project-watchlist.json` permanece intocada. Para ativar futuramente, será necessária revisão própria na branch de governança XPR, com nova consulta aos HEADs e decisão explícita; divergência não deve ser apagada atualizando expected_sha automaticamente.

Reutilizamos o auditor XPR-02 original, sem alterá-lo, em diretório temporário com a lista proposta. O fixture contém observações reais coletadas por GET nesta auditoria. Esse replay OFFLINE retornou 16 MATCH, zero DRIFT e zero UNKNOWN no snapshot. Não é uma nova consulta live executada pelo script nem supervisão contínua.

## Próximos ELOs técnicos propostos

| Ordem proposta | Entrega concreta | Condição para avançar |
| --- | --- | --- |
| **H14.52** | Empacotar e executar o candidato dentro do Worker local com D1, mantendo rota externa desativada e mocks identificados | Imports/crypto/bundling e regressões dentro do runtime comprovados |
| **H14.53** | Definir e implementar a fronteira confiável de identidade, revisão de autorização e referências imutáveis de ação | Verificador de servidor escolhido e testado; nenhuma confiança em NICK ou flags do cliente; não fechar DG-04 apenas com mocks |
| **H14.54** | Preparar ensaio de staging D1 separado, com dados sintéticos, rollback e replay consistente | Requisitos de schema/identidade revisados e autorização própria para staging; concorrência/revogação/replicação medidas no destino |

Essa é uma sequência proposta, não execução nem promessa de encerramento em três ELOs. Resultados podem exigir refinamento pontual. Em trilha pedagógica paralela permanecem HG-04/05/09/10 e contratos WHY por origem EN/ES/PT; depois, atomicidade decisão + Evidence/outbox. Integração seletiva ao Explorer somente após convergência dessas provas, HEADs atualizados e homologação apropriada. Não fazer merge global da branch de laboratório.

A governança acompanha cada novo ELO registrando origem, função, dependências, consumidores, contratos, entradas/saídas, JSON, duplicação, testes, homologação e portões de integração. Sua consulta pode ser feita sob demanda; não há schedule, descoberta automática de branches ou aprovação automática.

## Verificação desta proposta

```bash
node scripts/validate-siyayo-cross-project-registry.mjs
node scripts/test-siyayo-xpr02-drift-audit.cjs
node scripts/validate-why-xpr02-impact-proposal.cjs
```

São verificações documentais/offline. A última valida a cadeia de checkpoints, evidência CI, preservação das entradas ativas e os cinco HOW; executa o auditor existente em uma cópia temporária com a proposta. Nenhum código do laboratório ou de MCE, contrato avaliativo, main, PR #3, D1 ou produção foi modificado.
