# SIYAYO — ELO M1-M2-M4 MIRROR 01
Data: 2026-11-04
Branch exclusiva: jaguar/piano-stage-v0.1
Status: arquitetura proposta, não implementada; sem mudança de runtime ou deploy.

## 1. Código examinado
- `piano/piano.js` linhas 2108–2139: `activateKey` toca instrumento, emite `siyayo:musical-event` com `source`, `note`, `solfege`, `pitch`, `mode`, `word`, `semantic`, `payload`; atualiza visual e fala.
- Linhas 2143–2168: teclas M4 geradas para todas as notas do array `keys`, `pointerdown` com source `piano-flat`.
- Linhas 3559–3566: oito hotspots M1 acionam a tecla correspondente com source `pianinho-magico`.
- Linhas 3276–3374: M2 reage a identidade semântica explícita ou, fora de Questions, a `data-note`; M1 ressoa por hotspot; teclas pretas geram resposta cromática global e `siyayo:chromatic-resonance`, sem ativação semântica.
- Linhas 3190–3269: sequência C4 E4 G4 C5 conta somente source `pianinho-magico`, completa com `CI ✓`, toca acorde e emite `siyayo:resonance-event`.
- Atualmente 13 notas C4–C5 no M4; M1 tem 8 hotspots físicos; M2 contém 14 folhas QW e outras coleções contextuais.

## 2. Diagnóstico: conexões e assimetrias
| Origem | Destino | Atual | Limite |
| --- | --- | --- | --- |
| M1 hotspot | M4 | ativa tecla/áudio/evento | somente oito notas naturais |
| M4 tecla natural | M1 | ressonância do hotspot | não constitui ativação pedagógica M1 |
| M4 tecla natural | M2 | ressonância por nota quando permitido | uma nota pode corresponder a múltiplas folhas; não equivale a escolha semântica |
| M4 cromática | M1 + M2 | ressonância global cromática | sem identidade semântica |
| M2 folha | M4 | nota e semântica contextual | não gera automaticamente gesto de M1 |
| M1 sequência | M1 + M2 | acorde CI e animação | preservação obrigatória |

## 3. Melhor forma proposta
**M1 = avatar musical e condutor de atividades; M4 = teclado completo; M2 = ator semântico; MIX = contrato de roteamento.**
- A. Manter oito hotspots no corpo do M1 e a assinatura CI.
- B. Criar futuramente aro/aba expansível de cinco cromáticas (C#4, D#4, F#4, G#4, A#4) para espelhamento 13/13; acesso exclusivamente SOUND/SOLFEGE, sem folhas/evidência.
- C. Acrescentar asas esquerda G#3,A3,A#3,B3 e direita C#5,D5,D#5,E5; total 21 notas, 12 brancas, 9 pretas. Não são duas oitavas completas. M1 e M4 compartilham identidade musical, não 21 semânticas.
- D. Oferecer seletor de foco `8 ORIGINAL | 13 CROMÁTICO | 21 EXPANDIDO`, preferencialmente junto ao Piano Plano; no M1, acesso visual compacto/expansível, não 21 hotspots sobre o corpo.
- E. Contrato de interação explícito `sourceActor`, `noteId`, `musicalScope=anchor|extension`, `semantic=null` por padrão, `evaluation=false`, `evidence=false`. Nunca reusar source `pianinho-magico` indiscriminadamente: a sequência CI depende dele.
- F. M2: reação musical decorativa permitida somente mediante regra clara, sem ativar QW, Nouns, Verbs, perguntas, classificação ou avaliação; futuros adjetivos positivos e novas folhas exigem contratos versionados.
- G. Evitar dupla reprodução: clique M1 deve reutilizar um único caminho `activateKey` (ou adaptador equivalente), não tocar o áudio duas vezes por espelhamento bidirecional.
- H. Não refatorar `mode` nem substituir `keys` antes de baseline de browser e fonte única de verdade.

## 4. Riscos e decisões
- M1 e M4 espelham **nota e ressonância**, mas não identidade semântica; o atual fallback `leaves.filter(data-note)` precisa de isolamento para futuras extensões.
- Notas pretas já têm `siyayo:chromatic-resonance`; nova UI deve reaproveitar esse contrato sem disparar `CI`.
- A origem `pianinho-magico` é sensível: exclusiva para oito hotspots de assinatura ou para ações explicitamente autorizadas, não para todos os botões cromáticos.
- Portrait/landscape: teclado de 12 brancas requer viewport isolado, foco/rolagem, alvos de toque; a UI do M1 deve continuar legível e não sobrepor Environment/Weather.
- Nunca criar autoridade de avaliação, NICK, GREEN, Evidence, PATITA ou D1 a partir de gesto musical.

## 5. Gate seguinte
Desenhar schema `m1-musical-mirror.v0` (read-only / OFF) com inventário 8+5+8, sem ativar handlers; depois preparar protótipo isolado e teste visual de M1/M4/M2 em 8/13/21, inclusive fonte única JSON e rollback.
