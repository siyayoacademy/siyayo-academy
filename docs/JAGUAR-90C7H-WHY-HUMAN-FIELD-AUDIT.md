# JAGUAR 90C.7H — HUMAN FIELD AUDIT · WHY S1–S4 · 2026-10-23

## Evidência do usuário
Origem: montagem de capturas S1/S2/S3/S4 produzidas no preview Cloudflare 90C.7 `https://c90c95b0.siyayo-academy.pages.dev/`. Os áudios e a coerência contextual foram aceitos visual/acusticamente pelo usuário como OK no teste realizado. **Não inferir** que os fluxos avaliativos foram homologados.

| Experience | Aceite observado | Lacuna ou observação |
|---|---|---|
| S1 Shopping — WHY | texto e áudio contextual OK; exploração livre | `Dependency Focus` e `Dependency Head Probe` ausentes; verificar módulos pedagogicamente aplicáveis |
| S2 Preparing — WHY | texto e áudio contextual OK; exploração livre | `Dependency Focus` e `Dependency Head Probe` ausentes |
| S3 Having — WHY | texto/áudio OK, Dependency Focus e Head Probe visíveis | usuário não observou novas evidências de WHY em Learning Trail / Word Path |
| S4 After-Dinner — WHY | texto/áudio OK, Dependency Focus e Head Probe visíveis | usuário não observou registro da transferência WHY |

## Causas e distinções comprovadas pelo código
1. Em S1 e S2, `thinkingMind[why].presentationGrounding` foi adicionado no 90C.6, mas não existem `dependencyFocus` nem `dependencyHeadProbe` em WHY. Em S3/S4 existem ambos e o componente mostra os painéis somente quando metadados e estruturas EN/ES/PT estão resolvidos. **Falta real de autoria estrutural**, não erro de CSS.
2. `Determiner Use` é implementado exclusivamente para `WHICH` e demanda sessão `which.use.determiner`. WHY é advérbio interrogativo e possui contrato `why.use.contextual-reason`; **não copiar Determiner Use para WHY**. Validar somente que seu retorno à QW WHICH preserva o módulo.
3. `LINES` aciona áudio; não produz Attempt/Evidence. `Dependency Head Probe`, fora de sessão compatível, registra observação livre, nunca crédito canônico. Na captura S3/S4 aparece a condição `EXPLORING WHY · ASSESSMENT WHICH`. Esta é a evidência de **ausência de avaliação WHY ativa** na reprodução, não prova de perda de progresso salvo. **Investigar ativação WHY após WHICH anterior** antes de alterar qualquer avaliação.
4. A suíte 90C.7 anteriormente GREEN exercita início WHY em S3 após fluxo anônimo S1/S2; os testes 90C.4 de troca protegida cobriram WHAT→WHY. Acrescentar teste crítico **WHICH(S1) → S2 → WHY(S3) → S4** com e sem evidência anterior, em EN/ES/PT e com preservação do histórico.
5. Diferenciar: `corpus mostrado`, `assessment selected`, `attempt event`, `evidence accepted`, `Trail/Word Path projection`, `human approval`.

## Próximo ELO técnico autorizado somente após auditoria
- Autorar ou mapear estruturas de dependência WHY S1/S2 EN/ES/PT, respeitando frase de referência que aparece efetivamente em LINES; montar Dependency Focus e Head Probe em **prática livre**; não inventar avaliações S1/S2.
- Reproduzir e diagnosticar WHICH→WHY em navegador; confirmar `assessmentScope` (learner, language, origin) e `0/3→2/3→3/3` apenas em respostas avaliativas autorizadas.
- Verificar visualmente feedback verde somente para o botão avaliativo aceito; nunca porque tocou áudio ou Head Probe exploratório.
- Confirmar que WHICH Determiner Use continua acessível sob WHICH e que alternância não reinicia os históricos.
- Expandir gate para EN/ES/PT portrait/landscape/desktop após os negativos.
- Sem merge, sem alteração na main, PR #3, Worker/D1 remoto, Pages oficial. 12 gates externos BLOCKED.

**Status deste registro:** auditoria documental humana; não declarar esses quatro pontos corrigidos. O preview 90C.7 anterior permanece intacto.
