# SIYAYO F0 — AUDITORIA DO CÓDIGO REAL / BASELINE 4+1
Data: 2026-11-04
Status: AUDITORIA ESTÁTICA DO REPOSITÓRIO CONCLUÍDA; TESTES DE NAVEGADOR E ÁUDIO AINDA PENDENTES
Branch exclusiva: jaguar/piano-stage-v0.1
Escopo: somente leitura dos fontes e registro documental. Sem mudança de runtime, publicação, main, Master VIP ou DNA Explorer.

## 1. Inventário verificado
- piano/index.html: 214 linhas. M1 oito hotspots C4,D4,E4,F4,G4,A4,B4,C5; M2 quatorze folhas Question Words; M3 três coleções, cinco atividades, três camadas nominais, seis modos de escuta/idioma; M4 keyboard DOM gerado por JS.
- piano/piano.js: 4005 linhas, ~145 KB. Estado e lógica de M1–M4 estão majoritariamente no mesmo IIFE. Não há MX autônomo formal.
- piano/piano.css: 2800 linhas, ~75 KB, com diversas sobreposições e media queries; exige revisão de cascata antes de expansão.
- piano/keyboard-map.json: 13 notas C4–C5 (8 brancas, 5 pretas), identidade musical independente da semântica. ATENÇÃO: piano.js contém seu próprio array keys (linhas 52–66) e não há leitura direta do keyboard-map.json no runtime examinado; risco de duas fontes de verdade.
- piano/content-collection-engine.js: 83 linhas, registro/ativação de coleções, emite siyayo:content-collection-changed e rejected.
- js/siyayo-environment-controller.js: 174 linhas; carrega registry, mantém estado de ambiente e clima, eventos e fallback.
- js/siyayo-responsive-preview.js: 69 linhas; preview de orientação com evento.
- HTML carrega collection engine, responsive preview, environment controller e piano.js nessa ordem.

## 2. Fluxos existentes e pontos de integração
- piano.js linhas 1516–1552: activeCollectionId, registro de question-words/nouns/verbs e evento externo siyayo:activate-content-collection.
- linhas 1554–1565: mode=sound, activeActivity=explore, pedagogicalLanguage=en; Web Audio criado sob demanda.
- linhas 1960–1977: matriz efetiva de disponibilidade: questions só QW; classify só nouns; morphology/function só verbs.
- linhas 1971–2105: setActivity e setMode alteram stage.dataset, botões, labels, speech e Frondosa. Modo e idioma parcialmente acoplados; caso especial Questions preserva lente EN/ES/PT, Morphology restringe ES/PT/Tripiano.
- linhas 2108–2139: activateKey toca áudio, emite siyayo:musical-event e atualiza UI/fala.
- linhas 2143–2168: teclas DOM geradas do array keys; pointerdown chama activateKey; oito brancas renderizadas antes de cinco pretas.
- linhas 2838–2860: refreshFrondosaLabels altera visibilidade/rótulos conforme coleção.
- linhas 3276–3374: consumidor global de siyayo:musical-event: rastreia acorde somente se source=pianinho-magico; ressoa folhas por semântica ou dataset.note, personagem por note; notas pretas têm tratamento cromático especial sem ativação semântica.
- linhas 3376–3559: folhas fazem dispatch semântico, chamam activateKey com source=frondosa e têm ramificações de nouns/verbs/Question Words.
- linhas 3561+: oito hotspots M1 têm click handlers que procuram a nota no array e ativam tecla do M4.
- linhas 3203–3240: sequência C4 E4 G4 C5 e acorde/resonance; preservar.
- linhas 3940–4005: escuta evento siyayo:external-evaluation-complete apenas de canonical-adaptive-authority e apresenta resultado externo; isso NÃO concede autoridade avaliativa ao Pianinho. Atenção a não interferir com fluxo de navegação já presente.
- ambiente/clima e responsive preview são controladores independentes; MX não deve assumir propriedade deles.

## 3. Riscos reais encontrados
R1 CRÍTICO: keyboard-map.json e array keys em piano.js são representações duplicadas; qualquer expansão deve declarar fonte de verdade e compatibilidade, sem alterar silenciosamente contratos antigos.
R2 ALTO: listeners existentes de musical-event associam notas a folhas/personagem; notas de extensão SOUND/SOLFEGE precisam de envelope musical explícito e filtro de domínio, não passar por fallback semântico.
R3 ALTO: mode combina Sound, Solfege, idiomas, Tripiano e Questions; refatorar diretamente quebra condições de Morphology, QW e fala.
R4 ALTO: CSS mobile/portrait em trechos ~668–690 e ~742–751 usa overflow-x:hidden e oito colunas; expansão exige viewport/scroll isolado e teste de cascata.
R5 MÉDIO: Web Audio e speechSynthesis compartilham disparo por gesto; garantir sem duplicação de fala, voz e notas.
R6 ALTO: canonical external evaluation/result e navigation events já existem; novo MX não deve consumir, modificar ou emitir eventos de avaliação.
R7 MÉDIO: fonte de gramática EXISTENCE no Explorer é referência/protótipo; não inferir conjugação/Question Word/elegibilidade nem produzir Evidence/GREEN.

## 4. Baseline verificável (código, NÃO execução)
M1: 8 hotspots; M2: 14 folhas; M3: 3 coleções, 5 atividades, 3 noun layers, 6 modos; M4: 13 notas C4–C5. Arquivo CSS contém layouts mobile/portrait/landscape. Event bus CustomEvent existe. Existem instrumentos Piano/Pianinho/Frondosa/Trio, solfejo e speech synthesis. Verificação é estrutural: sem screenshot, clique real, áudio real, dispositivo mobile ou execução de testes neste ELO.

## 5. Contrato proposto para MX mínimo
A. Em primeiro lugar somente OBSERVAR eventos existentes; não substituir setMode, setActivity, activateKey nem handlers de folhas.
B. Projetar envelopes versionados para domínio: musical.anchor | musical.extension | semantic.study; source, noteId, octave, semantic=null, evidenceProduced=false, evaluated=false; campos propostos, ainda não API final.
C. StudyState read-only derivado dos controles legados; não criar segundo estado independente que possa divergir.
D. Criar whitelist de roteamento para as duas Wing Octaves: somente SOUND/SOLFEGE; sem fallback automático para folhas, acorde, classificação, conteúdo ou avaliação.
E. Definir replay/snapshot de eventos para detectar loops, duplicação e diferenças no comportamento legado.
F. Feature flag OFF; rollback = desligar adaptador, sem migração de dados.

## 6. Próximas tarefas pequenas (F0b/F1)
- T1: verificar todas as ocorrências de keys, keyboard-map, CSS de posicionamento e eventos, inclusive a cascata final; fixar fonte de verdade.
- T2: criar inventário de eventos emitidos/consumidos e contrato de compatibilidade, com exemplos.
- T3: obter baseline executável em browser (desktop e mobile) com screenshots e smoke checks de 8/14/13, idiomas, 14 Questions, Morphology, Function, Sound/Solfege, Tripiano, acorde, ambiente/clima e fluxo externo.
- T4: homologar nomenclatura M3 Study Deck/Mesa de Modos e MX SIYAYO Conductor.
- T5: somente depois preparar MX shadow-mode e testes; não habilitar extensão musical até gates T1–T3.

## 7. Critério de conclusão
F0a auditoria estática: CONCLUÍDA.
F0b baseline de runtime, acessibilidade, áudio e responsividade: PENDENTE.
F1 implementação: NÃO INICIADA.
Nenhum teste automatizado ou visual foi executado nesta auditoria; não declarar regressões ausentes com base apenas em inspeção.
