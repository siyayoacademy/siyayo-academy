# JAGUAR H14.29 — Falsos positivos, falsos negativos e ambiguidade semântica

**Resultado do ELO:** matriz comparativa de riscos para **48 exemplos novos de laboratório**, organizados em **24 pares** por Experience (S1/S2), idioma (EN/ES/PT) e tipo de contraste. Esses rótulos são hipóteses de estudo, **não são decisões sobre respostas reais de alunos**.

A matriz confronta quatro riscos centrais. **Falso negativo:** uma paráfrase coerente ou uma resposta com pequeno erro de língua é rejeitada apenas por divergir da referência literal. **Falso positivo:** uma frase bem escrita, mas incompatível com a situação, ou uma cópia do modelo sem independência, é tratada como prova suficiente. **Ambiguidade:** a razão é incompleta ou apoia-se em um fato não estabelecido pela cena. **Confusão de dimensão:** identificar a função causal de WHY não é a mesma competência que formular uma justificativa local.

As 24 comparações propõem contraste em pares: (1) paráfrase contextual × pequeno erro gramatical, (2) paráfrase contextual × razão plausível não verificada, (3) reconhecimento da função × repetição do modelo, (4) razão incompleta × contradição com a cena.

**Critérios antes de qualquer automação:** manter a análise independente de adequação contextual 0/4, qualidade linguística e progresso contratual 0/3. Não usar correspondência literal para aceitar/rejeitar; exigir referente, justificativa e premissas da Experience. Quando um dado não está disponível, solicitar esclarecimento ou revisão humana, nunca supor o fato. O rótulo de risco não é um escore e não implica evidência. A qualidade das paráfrases e os exemplos novos necessitam homologação pedagógica.

## Governança
HEAD-04 continua sintaxe, LIVE-07 e SPEECH-A continuam exibição/áudio, EVAL-08 é dono da fronteira canônica, PATITA-12 é observação. O SIYAYO Module Registry consultado em H14.27 permanece intacto. FUNC-13 continua oculto. PERIOD é uma pendência de GEAR-06.

Nenhuma alteração em `verb-explorer.html`, `experience-seeds.json`, `why.json`, PR #3, `main`, Learning Trail, PATITA ou produção. O código do H14.29 apenas lê os 48 exemplos e produz uma classificação **manual-assistida**, sem pontuação automática.
