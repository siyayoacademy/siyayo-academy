# JAGUAR H14.5 — WHY S1→S2 · Coerência contextual e transferência candidata

**H14.4 confirmado GREEN**: [Actions run 40051943134](https://github.com/siyayoacademy/siyayo-academy/actions/runs/40051943134). Esta rodada registra um *estudo autoral verificável* — **não** um novo Pass Contract ou ativação da UI.

## Definição canônica de pergunta e resposta

| Etapa | EN | ES | PT |
|---|---|---|---|
| S1 pergunta | Why do you prefer the fresh cheese? | ¿Por qué prefieres el queso fresco? | Por que você prefere o queijo fresco? |
| S1 causa | Because the fresh, mild cheese pairs well with the salmon. | Porque el queso fresco y suave combina bien con el salmón. | Porque o queijo fresco e suave combina bem com o salmão. |
| S2 pergunta | Why are we preparing this dinner together? | ¿Por qué estamos preparando esta cena juntos? | Por que estamos preparando este jantar juntos? |
| S2 causa | Because preparing it together lets us share the experience. | Porque prepararla juntos nos permite compartir la experiencia. | Porque prepará-lo juntos nos permite compartilhar essa experiência. |

**Proveniência:** as oito células de pergunta e resposta estão presentes nos `presentationGrounding` originais EN/ES/PT. São exemplos da adaptação SIYAYO ao contexto, **não citações da Master VIP**. A pergunta geral S1 usa `this one/este/este`, mas a apresentação autorada fornece uma `questionOverride` explícita com `fresh cheese` para eliminar ambiguidade. A referência lexical ao queijo não obriga terminar WHICH antes de iniciar WHY.

**S1 — motivo da escolha:** *ingredient-pairing*, preferência pelo queijo fresco porque combina com o salmão; distrator `shopping-finished` é resposta gramatical, porém não responde ao motivo da preferência.

**S2 — motivo da colaboração:** *shared-preparation*, o ato de preparar o jantar juntos permite compartilhar a experiência; distrator `still-shopping` é incompatível com a cena doméstica da cozinha.

**PT/ES:** a retomada referencial foi mantida: em espanhol *prepararla* se relaciona a *la cena*; em português *prepará-lo* se relaciona a *o jantar*. A equivalência comunicativa é contextual, não tradução literal de formas; sujeito, verbo e tempos requerem análise por língua.

## Hipótese e limitação da transferência

S1 pergunta **por que um ingrediente é preferido**; S2 pergunta **por que uma atividade conjunta é realizada**. Os domínios causais (preferência de alimento × cooperação) são distinguíveis e oferecem uma transferência candidata de competência interrogativa WHY. **Isso não prova que um aprendiz transferiu sua habilidade.** Duas respostas com IDs diferentes não são duas evidências; o estudante ainda deverá reconhecer a função da pergunta e formular/selecionar uma nova causa adequada no novo contexto.

O JSON atual tem duas alternativas por cena; uso como prova avaliativa exigirá estudar chances de acerto casual, qualidade de distratores, apoio oferecido e gesto/ação observável. A condição `PRESENT + AFFIRMATIVE` é o recorte da apresentação, não autorização para `PAST/FUTURE` nem `PERIOD`. Exercícios de transformação `INTERROGATIVE` em S1 não são evidência direta de resposta causal.

## Implementação de estudo, sem alterações no runtime

`scripts/jaguar-h14-5-why-context-projection.js` projeta **somente leitura** a pergunta e as duas alternativas EN/ES/PT a partir dos JSON executáveis existentes e **falha fechado** em divergências importantes (perda de referente, alternativa, idioma, autorização falsa ou promoção de target). Não devolve specification avaliativa nem `Attempt`, `Evidence` ou `Green Pass`.

`scripts/test-jaguar-h14-5-why-s1-s2-context-transfer.js` confirma fidelidade trilíngue, respeito às duas razões distintas, ausência de autoridade, proteção a mutações e contrafactuais inválidos. A consulta de conteúdo independe de `toroidalNext` e de histórico WHICH/HOW. **Isso não remove a exigência de transferência adjacente do resolver ativo.** A ampliação dessa capacidade deve ocorrer futuramente mediante contrato e regressão própria.

## Master VIP e hierarquia de fontes

O original de Biblioteca `STRUCTURE- KIND OF WORDS.docx` confirma **WHY → reason** e **HOW → manner** em sua seção de Question Words. A distinção entre palavra interrogativa, verbo e coerência da resposta informa o estudo, mas não impõe abrir a QW HOW nem conquistar pontos em WHICH. `THERE + TO BE`, `THERE IS/THERE ARE` e a função **EXISTENCE** continuam separados no índice `master-vip-existence-v0.1.json`, com candidatos S1–S4 sem avaliação.

## H14.6 — portão futuro (não autorizado neste checkpoint)

Se houver homologação contextual e contratual, especificar **um contrato WHY por origem** com provas `question-function + reason-answer(local) + reason-answer(transfer)`; separar parâmetros local/transfer e identificar a origem do escopo, protegendo a origem canônica S3 e os registros PATITA. Qualquer possibilidade de uma Experience atuar como local para um circuito e transferência para outro precisa de uma regra de seleção não ambígua; não inferir origem pelo número da cena. Só então adaptar resolver e interface, em branch exclusiva, com validação EN/ES/PT e teste de não regressão.

**Não alterado:** `data/learning/experience-seeds.json`, `data/learning/skills/why.json`, `js/`, PATITA, `main`, PR #3, produção Cloudflare, Worker/D1 remoto e apostila privada da Master VIP.
