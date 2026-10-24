# 🔔🐆 JAGUAR H14.23 — FUNC-13 adaptador do Gear Stack real

Estado: **pronto para integração seletiva — não montado e não ativado**. O módulo permanece **OCULTO na navegação normal do Explorer**.

Novo arquivo `js/verb-explorer-h14-23-gear-snapshot-adapter.js`: `SIYAYOH1423GearSnapshotAdapter.read({document,runtime,navigation})`. Consulta exclusivamente três getters existentes do `SIYAYOVerbExplorerExperienceRuntime`: `activeExperienceId()`, `activeLanguage()`, `activeQuestionWord()`. Confere as seleções visuais marcadas `.active` dentro dos contêineres existentes: `experienceLanguageGear`, `experienceTenseGear`, `experienceModeGear`, `wordTypeGear`, `perspectiveGear`. O Experience Navigation verifica que a QW pertence à Experience.

O adaptador não altera nenhum Gear, não envia eventos, não altera o runtime, não cria PATITA, contrato, Evidence, Attempt ou Green Pass. Não lê classes globalmente: exige uma seleção válida por contêiner e coerência entre idioma do DOM e runtime. Conserva `perspective:null` quando não selecionada. Expõe `grammarLocked` para evitar ignorar TENSE/MODE bloqueados pelo próprio Explorer. `period:null` e `periodSource:'UNAVAILABLE_IN_CURRENT_GEAR_STACK'` documentam a lacuna `GEAR-06-PERIOD-GAP`.

Integração futura: importar o adaptador *depois* do carregamento do runtime e injetar seus snapshots na `SIYAYOH1418FunctionWindow.inspect()` usando as fontes já estudadas, em um painel default-OFF e homologado separadamente. Nenhum Observer, timer ou renderização automática é instalado pelo adaptador. Isso evita duplicar a lógica de seleção e limita impactos nos circuitos avaliativos. A UI experimental H14.14 ainda possui leituras próprias de DOM e não foi substituída neste ELO; a integração final precisará trocar esse consumo cuidadosamente.

**Próxima retomada antes do FUNC-13:** auditoria das diferenças atuais entre `main` e o Explorer experimental sem merge amplo; ampliar preservação de assets/checkpoints; planilhar lacunas semânticas de cada Experience/QW EN/ES/PT e contrato independente; trazer a discussão de PERIOD ao Gear Stack quando o foco retornar a esse módulo. Avaliação e homologação pedagógica seguem separadas.

Proteções: `main`, PR #3, Worker/D1, Cloudflare e código oficial do Explorer inalterados.
