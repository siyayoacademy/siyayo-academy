# SIYAYO F0b.4 — Homologação manual e proposta M1 × MIX
Data: 2026-11-04
Branch: jaguar/piano-stage-v0.1
Origem: relatório manual do usuário e cinco capturas de tela de preview Cloudflare `6abed168.pianinho-magico-siyayo.pages.dev/piano/`.
Status: 22 PASS reportados pelo usuário; screenshots evidenciam estados selecionados. Não declarar teste automatizado, validação independente de áudio ou homologação do MIX.

## Evidências informadas
- T01–T06 PASS: Piano Plano, Sound, cromáticas, Solfege, hotspots M1, sequência C4–E4–G4–C5.
- T06: após DÓ↑, usuário observa sinal visual e som do acorde; preservar a assinatura musical de conclusão do Pianinho.
- T07–T10 PASS: 14 folhas, ressonância, 14 Questions, alternância.
- T11–T16 PASS: coleções, Classify, Morphology, Function, idiomas, Tripiano.
- T11: 14 QWs EN/ES/PT; Nouns Concrete/Abstract/Proper com exemplos teacher/cat/book/hotel; 14 folhas de verbos e EN/ES/PT/Tripiano.
- T17–T22 PASS: conexão M1–M4, áudio, portrait, landscape, desktop, ambiente.
- Capturas mostram seletores Portrait/Landscape, árvore QW ES, Nouns Concrete ES, Verbs ES, Classify Tripiano, Function EN. Capturas não provam todas as 22 ações individualmente.
- Ponto de atenção visual: controles flutuantes Environment e Weather cobrem parcialmente área inferior em alguns enquadramentos; verificar em mobile real antes de considerar acessibilidade e scroll homologados em todos os tamanhos.

## Nova necessidade pedagógica — M1 não deve ficar limitado a oito funcionalidades
Os oito hotspots são **identidades musicais da oitava âncora**, não teto de atividades ou de conteúdos. Manter os oito botões originais e a sequência de acorde, sem multiplicar hotspots no personagem como atalho para mais conteúdos.

### Alternativa a homologar: M1 como condutor de experiências, MIX como roteador de contratos
- M1: conserva avatar, gesto, sequência, acorde, animação e interação musical.
- M2 Frondosa: coleções de folhas e identidades semânticas, incluindo futura expansão de categorias (adjetivos positivos etc.) apenas após contratos.
- M3: modo/atividade/idioma, sem duplicar seu estado.
- M4: notas C4–C5 preservadas; expansão G#3–E5 somente SOUND/SOLFEGE na primeira etapa.
- MIX: observa eventos e autoriza rotas explícitas por versão, contexto, coleção e atividade; não assume avaliação, NICK, GREEN, Evidence ou D1.

### Próximo ELO pequeno
1. Desenhar contrato `m1-capability-registry.v0` em documento/JSON de proposta (OFF por padrão), separando 8 notas de capacidades pedagógicas.
2. Fazer inventário de todas as rotas M1→M4 existentes; testar não regressão.
3. Definir como uma experiência ativa é exibida pelo M1 sem reatribuir nota, leaf ou competência.
4. Só depois prototipar MIX em shadow mode, com feature flag OFF e sem mudança no runtime de produção.

## Gates de evidência
A homologação manual 22/22 é registrada como evidência de usuário, não prova automática. CI F0b está configurado, mas seu resultado precisa ser consultado. Não mexer em main, Explorer, Master VIP nem no deploy de produção durante desenho do contrato.
