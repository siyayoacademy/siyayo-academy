# SIYAYO XPR-02 — Supervisão de HEADs e Divergências

**Modalidade:** verificador executável de leitura GitHub, com testes offline. Não é monitoramento contínuo, não faz merge, nem cria Evidence, Green ou publicação.

## Procedimento

1. Ler `docs/siyayo-cross-project-registry.json` (XPR-01) e a watchlist `docs/siyayo-cross-project-watchlist.json`.
2. Para as cinco branches expressamente listadas, comparar o HEAD atual com SHA congelado.
3. Classificar `MATCH`, `DRIFT_REVIEW_REQUIRED` ou `UNKNOWN`. Erro ou API indisponível não equivale a sucesso.
4. Em divergência, buscar a comparação GitHub e identificar arquivos, possíveis módulos consumidores e links entre projetos. Arquivos sem regra são `UNMAPPED_REVIEW_REQUIRED`.
5. Produzir `reports/xpr02-report.json` e `reports/xpr02-report.md`. Não aprovar nenhuma integração automaticamente.

## Execução

Teste offline (4 cenários sintéticos):

```bash
node scripts/test-siyayo-xpr02-drift-audit.cjs
```

Consulta atual dos repositórios GitHub (somente GET, gera arquivos locais):

```bash
node scripts/siyayo-xpr02-drift-audit.cjs --live --strict --output-dir reports
```

Existe workflow em `.github/workflows/siyayo-xpr02-drift-audit.yml` com `contents:read`, evento push limitado à branch XPR-02 e upload de relatório via artifact. Sem schedule. `workflow_dispatch` pode não aparecer na interface até o arquivo existir na branch default, que não foi alterada; a execução push permanece possível conforme políticas do repositório.

## Provisões de governança

- A watchlist inicial inclui SIYAYO REG-03, Explorer H14.19, laboratório H14.40, MCE REG-01/02/03 e MCE Portal V25.
- **Branches H14.41–H14.43 não são automaticamente descobertas.** Acrescentar novos trabalhos à watchlist mediante auditoria e aprovação.
- Uma atualização em `data/santo-cruzeiro-universal.json` do MCE não atualiza automaticamente a página, cujo texto é renderizado diretamente no HTML.
- Mudanças no responsive controller RIS sugerem possível impacto em `MCE:MCE-RS-01` e sua relação de adaptação `SIA:RS-01`; os eventos e chaves de armazenamento não são idênticos.
- Migrações V30.3.85C permanecem estudo local: nenhuma integração e nenhuma autoridade avaliativa.
- `MATCH` significa apenas HEAD idêntico ao registrado, não homologação funcional ou pedagógica.
- Comparações grandes (300 arquivos ou mais) exigem conferência independente de completude. Mudanças não-fast-forward exigem inspeção manual.

**Preservação:** documentações e scripts somente; nenhuma modificação a `main`, PR #3, Explorer, Mestre Canto Ensino, Cloudflare ou D1.
