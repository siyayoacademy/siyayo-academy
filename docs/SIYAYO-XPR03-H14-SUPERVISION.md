# 🔔🐆 SIYAYO XPR-03 — H14 Laboratory Supervision & Drift Discovery

**Escopo:** supervisão consultiva e verificável entre registros REG-01/02/03, XPR-01, XPR-02 e a evolução WHY H14.40–H14.51. **Não existe monitoramento contínuo.** Esta branch contém apenas documentação, scripts de auditoria, testes e um workflow com permissões somente de leitura.

## 1. O que evoluiu desde XPR-02

A [watchlist](./siyayo-cross-project-watchlist.json) foi ampliada de **5 para 16** referências exatas, com H14.41–H14.51 adicionados após conferência dos seus HEADs no GitHub. O H14.40 já estava cadastrado. Os projetos SIYAYO Academy e Mestre Canto Ensino preservam suas próprias branches, módulos e REGs.

O teste XPR-02 existente foi atualizado para validar o total dinâmico de watchpoints, sem alterar o comparador e sem presumir que cinco é o número definitivo.

## 2. Dois mecanismos complementares

**A. Comparação de HEAD (XPR-02):** compara cada branch explicitamente cadastrada contra SHA imutável; mudanças produzem `DRIFT_REVIEW_REQUIRED`, erros de API produzem `UNKNOWN` (fail-closed), e o relatório identifica caminhos, módulos candidatos e relações entre projetos.

**B. Descoberta de branches (XPR-03):** inspeciona branches do repositório SIYAYO com prefixo `jaguar/h14-<n>-why-` para ELO n≥40. Branch **nova não cadastrada** ou branch cadastrada **desaparecida** resulta em `REVIEW_REQUIRED`. A ferramenta nunca se inscreve sozinha como observadora dessa branch.

Esses dois mecanismos operam apenas quando executados; o workflow automatiza a verificação no push desta branch de governança, mas não monitora pushes externos em outras branches por si mesmo.

## 3. Evolução H14.50 → H14.51

- **H14.50**, commit `03ccf051e677309891987524fee6df7624c33fc4`: candidato de lote protegido, 17 novos testes usando driver SQLite local. CI confirmado: [run 40202361772](https://github.com/siyayoacademy/siyayo-academy/actions/runs/40202361772).
- **H14.51**, commit `bb2878e3746415a29f4e5b15c087a65ec31fd696`: executou o candidato H14.50 *sem alteração* via binding D1 **local Miniflare/workerd**, 14 novos testes, incluindo concorrência e recuperação. CI confirmado: [run 40203140595](https://github.com/siyayoacademy/siyayo-academy/actions/runs/40203140595).
- **Ainda NÃO demonstrado:** candidato empacotado dentro de um Worker, D1 remoto, autenticação real, replicação distribuída, migração legada ou Evidence canônica. Os sete gates H14.43 permanecem abertos segundo o relatório H14.51.

Os commits H14.41–H14.49 foram identificados e fixados individualmente como referências de branch; isso não é uma nova auditoria de CI ou homologação de cada ELO.

## 4. Comandos

```bash
node scripts/test-siyayo-xpr02-drift-audit.cjs
node scripts/test-siyayo-xpr03-h14-discovery.cjs
node scripts/siyayo-xpr02-drift-audit.cjs --live --strict --output-dir reports
node scripts/siyayo-xpr03-h14-discovery.cjs --live --strict --output-dir reports
```

Os dois últimos realizam exclusivamente GET na API pública GitHub e produzem arquivos locais de relatório em `reports/`. Se a API estiver indisponível, retorne UNKNOWN/REVIEW REQUIRED. O token de Actions, quando disponível, é usado apenas em cabeçalho de leitura e nunca escrito no relatório.

### GitHub Actions

`.github/workflows/siyayo-xpr03-h14-supervision.yml` roda no push da própria branch XPR-03, testa cenários offline e consulta o estado atual das branches. Publica os quatro relatórios como *artifacts* do job. O workflow possui `permissions: contents: read` e **não tem `schedule` ou escrita remota**. Um disparo manual via `workflow_dispatch` pode depender da presença do workflow na branch default, que não será modificada neste ELO.

## 5. Contratos de integração que não podem ser confundidos

- **Alimentação de JSON:** exige análise de fonte de verdade, consumidores, QW × Experience × idioma, verbos/tempos e eventuais contratos explícitos. Não converter nova fonte de texto em avaliação.
- **85C, idempotência e D1:** ocorrência `pending` não é Evidence. Mesmo um lote atômico local aprovado não cria autorização de avaliação.
- **Mestre Canto Ensino:** `data/santo-cruzeiro-universal.json` continua documental, não alimenta automaticamente o texto do Index. O Responsive Stage RIS tem contrato adaptado, APIs e eventos próprios.
- **Coerência/homologação:** GitHub Actions GREEN comprova somente os testes executados no job; não aprova o Explorer, um hinário, o estado visual ou integração em produção.

## 6. Fluxo diante de uma divergência

**Detectar → classificar → localizar arquivos → inferir consumidores potenciais → comparar contratos/dados → verificar testes → obter revisão humana quando necessária → decisão GO/NO-GO → integração seletiva separada.**

**Regra:** nenhum relatório altera o código do laboratório. Os checkpoints funcionam como referências imutáveis; quando uma branch evolui, criar novo checkpoint com evidência, sem substituir silenciosamente o anterior.

## 7. Próximos limites

A descoberta atual procura branches H14 WHY numeradas, não todos os laboratórios do ecossistema; PATITA, Fine Art e MCE possuem governança própria. A ampliação futura pode incluir índices específicos por projeto, mas nunca importará implementações ou permissões automaticamente.

**Preservado:** `main`, PR #3, Explorer, contratos pedagógicos, PATITA, Learning Trail, FUNC-13 oculto, projetos MCE e produção.
