# SIYAYO F0b — Contratos executáveis de compatibilidade (pré-expansão)
Data: 2026-11-04
Branch: `jaguar/piano-stage-v0.1`
Status: TESTE ESTÁTICO ADICIONADO; BROWSER / ÁUDIO / TOUCH PENDENTES

## Evidência e decisão
A auditoria F0a identifica `piano/keyboard-map.json` (13 notas) e o array `keys` em `piano/piano.js` como fontes duplicadas. O array atual contém conteúdo pedagógico EN/ES/PT e a oitava C4–C5 é consumida pelo personagem, pelas folhas e pelo evento `siyayo:musical-event`. Assim, **não substituir o array nem modificar os ouvintes durante F0b**.

### Invariantes para o primeiro gate
1. O Anchor Octave é exatamente `C4,C#4,D4,D#4,E4,F4,F#4,G4,G#4,A4,A#4,B4,C5`, com 8 teclas brancas e 5 pretas.
2. M1 mantém 8 hotspots; M2 mantém 14 folhas QW; M3 mantém Sound, Solfege, EN, ES, PT, Tripiano e atividades legadas.
3. `keyboard-map.json` e `piano.js` concordam em IDs, tipos e frequências da oitava âncora.
4. Extensão planejada: `G#3,A3,A#3,B3` à esquerda e `C#5,D5,D#5,E5` à direita; 21 notas, 12 brancas e 9 pretas no total. Não confundir esta expansão de oito notas com duas oitavas completas.
5. As notas externas são **musical.extension**, inicialmente somente SOUND/SOLFEGE, com `semantic:null`, `evaluated:false`, `evidenceProduced:false`. Nenhum encaminhamento automático para Frondosa, QW, Morphology, Function, NICK, Evidence, GREEN ou D1.
6. A expansão futura de folhas, Kind of Words (ex.: adjetivos positivos) e associações depende de contratos semânticos versionados, autorização explícita do MIX e homologação, nunca de correspondência automática por nota.
7. Portrait: teclado de 12 brancas precisa de viewport próprio, rolagem horizontal acessível e foco visível; preservar o posicionamento cromático e o anchor. O CSS atual possui regras de 8 colunas e overflow; **não alterar até testar cascata real**.

## Gate F0b
Execute: `node scripts/test-siyayo-piano-f0b-contracts.cjs`.

Esse comando prova **somente** invariantes estáticos do repositório; não prova Web Audio, fala, gestos touch, scroll, animações ou ausência de regressões visuais. Para aprovação completa, testar em navegador desktop e mobile: 8 hotspots, 14 folhas, 13 teclas, modos EN/ES/PT/Tripiano, Questions, Morphology, Function, eventos, acorde C4–E4–G4–C5, ambiente/clima, avaliação externa, foco e portrait/landscape.

## Gates seguintes
F0b-2: registrar rastreamento de eventos reais e screenshots antes/depois, sem modificar handlers.
F0b-3: definir envelope versionado e um adapter shadow-mode OFF por padrão.
F1: só após baseline de navegador e autorização, introduzir extensão isolada SOUND/SOLFEGE e viewport responsivo. Rollback: feature flag OFF.
