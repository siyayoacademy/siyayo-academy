# Jaguar — Session S3 e ciclo WHY

Status: **costura canônica S2→S3 e provas WHY S3→S4 conectadas; CI verde; homologação visual humana pendente.**

| Acontecimento | Autoridade | Efeito |
|---|---|---|
| WHAT em S2: função + tomates | Session S2 | 2/3, ainda sem Green |
| Visitar S3 e responder salmon/salmão | transferência WHAT da Session S2 | 3/3, Green Pass WHAT; a visita permanece livre |
| Escolher “começar meu progresso aqui” em S3 | `VisitedSessionAdoptionAuthority`, `NextAssessmentTarget`, `NextSessionActivation` | Session S3 WHY nasce em 0/3; Evidence operacional vazia; histórico WHAT preservado |
| WHY em S3: função da pergunta e `prepared-together` | Result → EvidenceBridge → AttemptBoundary → Coordinator | 1/3 e 2/3, conforme Pass Contract |
| Visitar S4 e responder `talking-together` | transferência WHY da Session S3 | 3/3 e Green Pass WHY pela autoridade canônica |

As alternativas e perguntas estão ancoradas em `data/learning/experience-seeds.json` e `data/learning/skills/why.json`, com realizações EN/ES/PT. A resposta WHAT em S3 pertence à Session S2; a resposta WHY em S4 pertence à Session S3. O painel WHY envia apenas Attempts observados. A política `green-pass-authority.json` inclui WHY, e somente o Cycle avalia o contrato. O avanço por NEXT não executa adoção ou Green.

A inspeção de adoção aceita exatamente S1 WHICH→S2 e S2 WHAT→S3 depois de um pacote de transferência aprovado e do registro `green-pass-contract` confirmado. O gesto do aluno é requerido para a nova Session. `NextAssessmentTarget` valida o alvo e as três especificações em EN/ES/PT; `NextSessionActivation` inicia contexto operacional sem herdar Evidence anterior.

Testes do bootstrap verificam adoção, interface WHY, origem/destino da transferência, rastro longitudinal e Green canônico em EN/ES/PT. O próximo passo é validar o percurso na interface publicada e, então, auditar a habilidade própria de S4; a transferência `talking-together` não deve ser reaproveitada como prova da nova Session.
