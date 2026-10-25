# JAGUAR XPR-03.1 — Compatibilidade e checkpoint H14.52

## Causa confirmada

HEAD XPR-03 conferido: `39b81289f1a05479701343325640b31bc7ded02b`.
O [Actions 40208560355](https://github.com/siyayoacademy/siyayo-academy/actions/runs/40208560355) falhou no teste XPR-02 com ENOENT ao abrir o relatório; os passos de consulta ao GitHub foram pulados. A reprodução local confirmou que a watchlist 1.1.0 era rejeitada pelo comparador, que aceitava exclusivamente 1.0.0, antes de escrever os relatórios. O teste lia o arquivo antes de mostrar stderr/status do subprocesso, ocultando a causa original.

## Correção restrita

- Comparador aceita explicitamente somente 1.0.0 e 1.1.0; versões desconhecidas/ausentes continuam rejeitadas. Validação de repositório por projeto, SHA e branch preservada.
- Testes XPR-02/XPR-03 mostram status, stdout e stderr se o relatório não for gerado; ambos verificam JSON e Markdown.
- Novo teste de manutenção cobre 13 casos de versão/segurança e preservação integral dos 16 checkpoints anteriores, com 17 IDs únicos.
- Watchlist adiciona somente SIA:H14.52. Snapshot e documentação registram seu alcance local.
- Workflow mantém contents: read, sem schedule, merge ou deploy; habilita push da branch de manutenção, valida o registro e a compatibilidade, executa testes e consultas GET. Checkout de dois commits permite verificar o checkpoint pai; ausência de artefatos agora é erro.

## Evidência e estados

**IMPLEMENTADO:** compatibilidade explícita e cadastro documental H14.52.
**TESTADO LOCALMENTE:** 13 casos de contrato/segurança; quatro cenários XPR-02 e quatro XPR-03; validador de registro (39 módulos, sete vínculos, dois projetos).
Consulta GitHub de 25/10/2026: 17 MATCH, zero DRIFT e zero UNKNOWN. Descoberta: 13 branches H14 WHY cadastradas e encontradas, zero novas ou ausentes. Os quatro arquivos JSON/Markdown foram gerados; são evidência pontual, não monitoramento contínuo.
**PENDENTE:** conclusão do CI desta manutenção no momento da autoria; consultar Actions do novo commit.
**HOMOLOGADO / INTEGRADO:** nenhuma nova homologação pedagógica ou integração de produto é concedida.

H14.52: branch `jaguar/h14-52-why-worker-local-bundle`, HEAD reconferido `677ced16460e9f0f5c88a40a379293beedb3c07f`, [Actions 40207453876 concluído com success](https://github.com/siyayoacademy/siyayo-academy/actions/runs/40207453876). Comprovou execução do candidato dentro de Worker local empacotado com D1 local. Não autoriza D1 remoto, autenticação real, Evidence, Green Pass ou publicação.

## Cinco eixos

| Eixo | Aplicação |
|---|---|
| HOW TO DO | Corrigir somente governança em branch filha do XPR-03 auditado. |
| HOW TO RECORD | SHA imutável, 16 checkpoints preservados, 17ª referência explícita. |
| HOW TO SHOW | JSON/Markdown e artefatos de Actions com resultado verificável. |
| HOW TO CHECK | Cenários positivos/negativos, fail-closed e consulta GET sob demanda. |
| HOW TO SPEAK | CI técnico e observação pontual, sem atribuir autoridade de integração. |

## Lacunas preservadas

Supervisão contínua não instalada. Descoberta limitada ao prefixo H14 WHY n≥40. Novas branches exigem revisão e cadastro explícitos; divergência ou indisponibilidade mantém REVIEW_REQUIRED e saída estrita não zero. Mapeamentos de caminho indicam consumidores potenciais; comparação GitHub pode truncar em 300 caminhos. Correspondência de HEAD não comprova homologação nem segurança de integração.

Nenhuma mudança em main, PR #3, Explorer, H14.52/H14.53, PATITA, Learning Trail, Word Path, contratos avaliativos, D1, produção ou Mestre Canto Ensino. As referências MCE são somente consultadas.
