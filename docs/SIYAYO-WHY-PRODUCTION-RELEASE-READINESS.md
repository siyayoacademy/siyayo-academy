# 🔔🐆 SIYAYO Academy — WHY: passagem à fase de produção

**Situação:** produção **preparada sob bloqueio seguro**. Este é um pacote de revisão de release, não um deploy. A fonte H14.67 está GREEN na execução de CI [40410398591](https://github.com/siyayoacademy/siyayo-academy/actions/runs/40410398591).

## Decisão de produção

- **GO:** auditoria de prontidão, matriz de dependências, preparação de um patch seletivo e QA de preview **sem Evidence ou Green Pass**, em uma branch isolada.
- **NO-GO:** promoção dos contratos WHY S1→S2 / S2→S1, autorização de avaliações, gravação remota D1, publicação Cloudflare e merge na `main` ou PR #3.
- **Preservar:** WHY canônico S3→S4, navegação livre por QW/Experience/idioma, PATITA observacional, EVAL-08 autorizado separadamente, Learning Trail/Word Path apenas Evidence canônica aceita, FUNC-13 oculto e histórico congelado.

## Checagem do GitHub

| Origem | HEAD verificado | Observação |
|---|---|---|
| H14.67 experimental | `03f8ebb95c5770c5a38b8f9458fd699addd30070` | CI GREEN |
| main | `c2149f5e63b8de716cf9b9dcdede213bd328344e` | Divergente do laboratório |
| PR #3 | `c7e83709cacf8479847df0f3cee4ed8a563aaae6` | Não mesclada |

A comparação H14.67 versus `main` indicou 1.801 commits à frente e 1 atrás; versus PR #3, 289 commits à frente e nenhum atrás. O retorno limitado a 300 caminhos não estabelece diff exaustivo. Antes de integrar, refazer comparação com HEAD atualizado e seleção de arquivos e módulos afetados.

## O que falta antes da ativação

- HG-01: parecer pedagógico real ainda não concluído
- HG-02: parecer pedagógico real ainda não concluído
- HG-03: parecer pedagógico real ainda não concluído
- HG-04: parecer pedagógico real ainda não concluído
- HG-05: parecer pedagógico real ainda não concluído
- HG-06: parecer pedagógico real ainda não concluído
- HG-07: parecer pedagógico real ainda não concluído
- HG-08: parecer pedagógico real ainda não concluído
- HG-09: parecer pedagógico real ainda não concluído
- HG-10: parecer pedagógico real ainda não concluído
- HG-11: parecer pedagógico real ainda não concluído
- HG-12: parecer pedagógico real ainda não concluído
- HG-13: parecer pedagógico real ainda não concluído
- HG-14: parecer pedagógico real ainda não concluído
- HG-15: parecer pedagógico real ainda não concluído

Além disso, os sete portões DG-01–DG-07 permanecem abertos, especialmente autorizar conteúdo de S1/S2, autenticação de sujeito/ação, Evidence/outbox e D1 staging. O `HIST-01` continua parcialmente reconstruído.

## Estratégia de liberação gradual

1. **Release-candidate read-only:** verificar corpus, funções, QWs e apresentação, mantendo WHY S1/S2 somente para exploração livre.
2. **Homologação humana:** obter julgamentos de dois revisores verificáveis, mediação quando necessário, critérios EN/ES/PT e autorização independente de contratos.
3. **Backend de avaliação:** confirmar identidade de servidor, integridade de ação direta, contrato aplicável por origem/idioma, atomicidade de Evidence e idempotência.
4. **Staging Cloudflare/D1:** executar testes reais de concorrência, recuperação, rollback e regressões sem expor público.
5. **Homologação UX:** desktop, smartphone portrait/landscape, speaker EN/ES/PT, Learning Trail e Word Path, no estado correto.
6. **Aprovação final:** somente após 15 HG + 7 DG e revisões, considerar PR seletiva e deploy, com consentimento explícito.

## Segurança de execução

`node scripts/jaguar-why-production-safety-gate.cjs` verifica os 25 blobs críticos preservados pelo H14.67, contratos WHY draft, fonte S3 canônica, portões HG/DG abertos e proíbe mudanças executáveis. `node scripts/test-jaguar-why-production-safety-gate.cjs` verifica que manipular status, aprovações ou caminho de deploy não desbloqueia a liberação.

O workflow foi deliberadamente configurado com permissão **contents: read**, sem secrets, sem Cloudflare token e sem comandos de deploy. O GREEN deste workflow significa que **o bloqueio de produção está funcionando**, não que a produção esteja aprovada.
