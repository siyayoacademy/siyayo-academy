# 🔔🐆 JAGUAR H14.36 — Fase 1: fontes WHY e integração seletiva segura

## Duas garantias distintas
**Preservação verificável:** os arquivos das experiências e dos módulos permanecem rastreáveis por hashes e commits. **Integração correta ainda não homologada:** o Explorer experimental não pode substituir a `main` diretamente; será necessário reconciliar todos os códigos, dependências e branches contemporâneos.

Em 24/10/2026, a comparação GitHub de H14.35 com `main` retornou **1.765 commits à frente / 1 atrás**. O número é histórico, e deve ser recalculado no momento de integrar. Isso é um **bloqueio explícito a merge geral**.

## Fase PH1 — HG-01 / HG-02 / HG-03
Inspeção read-only dos seis registros S1/S2 × EN/ES/PT em `experience-seeds.json`:

- **S1 Shopping:** a pergunta genérica “Why do you prefer this one?” precisa ser contextualizada pelo `questionOverride`: queijo fresco, combinação com salmão, contraste de encerramento das compras. O campo lexical de WHICH é **apenas fonte de referente**, nunca pré-requisito para acessar WHY.
- **S2 Preparing:** a pergunta já aponta para preparação conjunta do jantar; referência causal em compartilhar a experiência, contraste com ainda estar no supermercado.
- **EN/ES/PT:** texto da pergunta, justificativa autorada, distraidor, função causal e Head Probe são confrontados com H14.5 e o resolvedor 90C.6. O Head Probe é dependência sintática, **não** prova independente de reconhecer WHY.
- **Tempo e modo:** somente PRESENT/AFFIRMATIVE é autorizado como referência exploratória nestes dois casos; haver diálogos gramaticais de outros tempos não significa autorização avaliativa para outras formas.
- **Limites:** seis checks de origem podem ficar GREEN sem que nenhum dos seis pacotes seja homologado pedagogicamente. `teacherQuestionApproval`, `teacherReferentApproval` e `teacherCausalFunctionApproval` permanecem `null`, todos os 15 gates H14.33 continuam abertos.

## Pré-voo de integração
`data/learning/references/jaguar-h14-36-main-integration-preflight-v0.1.json` preserva 14 hashes de blob para componentes e interfaces relevantes, identifica o commit de `main` no momento da inspeção e ordena:

1. Atualizar novamente HEADs, SIYAYO Module Registry e a lista de consumers; confirmar o commit exclusivo da `main`.
2. Conferir hash, fonte JSON, contrato e autoridade de cada módulo escolhido; escolher patches individualmente sobre `main` atual.
3. Executar regressões de Experience/QW EN/ES/PT, Gear Stack, PATITA, EVAL-08, Learning Trail, S3→S4 e visual. Evitar qualquer dupla concessão de evidência.
4. Somente após autorização e homologação visual, abrir PR/merge seletivo; produção requer autorização separada.

O preflight **não aplica patch, não cria PR e não permite deploy**, e os hashes apontam para a linhagem experimental, não para uma equivalência automática com a `main`.

## Preservação
`main`, PR #3, Explorer oficial, produção, PATITA, Learning Trail e contratos existentes não foram alterados. FUNC-13 permanece oculto e a lacuna PERIOD continua responsabilidade futura do GEAR-06. PATITA observa; exclusivamente um EVAL-08 autorizado poderia avaliar tentativa real. Esta fase entrega um mapa verificável, não autorização para integrar.
