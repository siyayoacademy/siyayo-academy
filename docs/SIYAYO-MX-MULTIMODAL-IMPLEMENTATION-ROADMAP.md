# SIYAYO — MAPA 4+1 E PLANO DE IMPLEMENTAÇÃO MULTIMODAL
Data: 2026-11-02 | Status: PROPOSTA DE ARQUITETURA, não implementação | Fonte: pesquisa anexada "SIYAYO — Arquitetura Multimodal Música–Linguagem e nomenclatura dos motores".

## 1. Decisões propostas
- M1: Pianinho Mágico / Character Instrument — gesto, personagem, resposta.
- M2: Árvore Frondosa / Semantic Tree — Question Words e relações semânticas.
- M3: **Study Deck / Mesa de Modos** — seleciona conteúdo, atividade, lente, escuta e língua. Não é o motor de comunicação.
- M4: Piano Plano / Chromatic Instrument — teclado, notas, som e solfejo.
- MX: **SIYAYO Conductor / Maestro de Interação** — recebe eventos, consulta estado e sincroniza módulos sem acoplamento direto.
Nomes são recomendações pendentes de homologação editorial. Não renomear IDs existentes antes de mapear dependências.

## 2. Princípios
- Separar superfície de interação, estado pedagógico, conteúdo, áudio e orquestração.
- O botão é uma porta de entrada, não a função em si.
- M3 define StudyState: content × activity × lens × listenMode × languageMode; combinações válidas devem ser declaradas.
- MX aplica roteamento de eventos com contratos versionados e adaptadores; não assumir que todo clique precisa ativar todos os módulos.
- EXISTENCE/THERE TO BE é Content Pack reutilizável, não uma nova central ou laboratório.
- Não transferir automaticamente contratos de avaliação, GREEN, NICK ou evidência do DNA Explorer para o Pianinho.

## 3. Eventos e contratos (rascunho)
- note.play {noteId, octave, source, mode, timestamp}
- semantic.select {questionWord, source}
- study.change {content, activity, lens, listenMode, languageMode}
- content.activate {packId, conceptId, context}
Campos e nomes são ilustrativos; validar contra código real antes de congelar API. Fluxo: M2 seleciona WHERE -> MX consulta M3 -> pack compatível -> M1/M4/áudio reagem apenas quando subscritos.

## 4. Expansão musical sem regressão
- **Anchor Octave**: preservar integralmente o alcance original e vínculos pedagógicos já existentes.
- **Lower Wing / Upper Wing**: até duas oitavas cromáticas adicionais, inicialmente EXCLUSIVAS para SOUND e SOLFEGE.
- Não atribuir gramática automaticamente a novas teclas. Separar noteId/frequency/solfege de semanticId.
- Auditar extensão exata, contagem e limites do teclado no código antes de implementar (não assumir 37 teclas sem verificar compartilhamento de notas-limite).
- Testar Web Audio, desbloqueio por gesto no mobile, latência, responsividade, scroll, acessibilidade e reprodução simultânea; Web MIDI é possibilidade futura, não requisito.

## 5. Fases e gates
### F0 — Inventário e baseline
Inspecionar M1–M4, listeners, estados, funções de áudio, arquivos de dados e rotas; registrar screenshots e smoke tests EN/ES/PT, Sound, Solfege, Tripiano, Frondosa e 13 teclas atuais. **Gate:** mapa real de dependências e comportamento baseline documentados.
### F1 — Naming e contratos
Homologar nomes M3/MX; definir schema StudyState, matriz de compatibilidade e eventos versionados. **Gate:** exemplos e testes de contrato, sem alteração de UI.
### F2 — MX mínimo em modo sombra
Criar adaptador/event bus observável, sem substituir handlers homologados; evitar eventos duplicados e loops. Feature flag OFF por padrão. **Gate:** logs e testes demonstram equivalência com baseline.
### F3 — Um fluxo vertical
Conectar uma folha M2 -> MX -> estado M3 -> reação M1/M4/escuta, com fallback legado. **Gate:** experiência end-to-end, idiomas e controles existentes preservados.
### F4 — Oitavas musicais
Implementar Lower/Upper Wing sob flag isolada e Sound/Solfege apenas; layout adaptativo e limites de polifonia. **Gate:** teste mobile/desktop e regressão da Anchor Octave.
### F5 — Content Pack EXISTENCE
Modelar estruturas declarativas, variantes e idiomas; conectar por adaptador ao MX e às lentes válidas do M3. **Gate:** rastreabilidade pedagógica e ausência de acoplamento à avaliação DNA.
### F6 — Expansão orientada a evidências
Ritmo/prosódia, contraste EN/ES/PT, sequências e futuro MIDI apenas após métricas e validação pedagógica. **Gate:** protótipos testados e benefício demonstrado.

## 6. Registro de evidências
Pesquisa anexada menciona W3C Multimodal Interaction Manager, Web Audio/Web MIDI, MusicSpeak, mySolfeggio, Learn with Antura, Solfege+, Tina Staff, Prodigies, Little Fox e Sound Jobs. São referências e pistas, não provas de eficácia da SIYAYO. Verificar bibliografia, estudos originais, licenças e resultados antes de alegações científicas ou reutilização de código.

## 7. Governança
- Somente documentação nesta etapa. Não editar aplicação, deploy, Cloudflare, main, Master VIP nem DNA.
- Branch de estudo: jaguar/piano-stage-v0.1; não fazer merge da PR #4.
- Toda fase exige diff limitado, feature flag, teste e rollback.
- Próxima ação: auditoria de código para substituir hipóteses por fatos e preparar tarefas pequenas, revisáveis.
