# JAGUAR EVAL-08 · Pré-migração · revisão 0001

Checkpoint real informado pelo agente Cloudflare: Worker `siyayo-academy-staging-api` HTTP 404, com `workers.dev`/previews desativados; D1 `siyayo-academy-staging` criado e binding `ASSESSMENT_DB` associado; banco com **zero tabelas**, sem SQL executado. **Não é prova de acesso à identidade real.**

Esta revisão reforça a migração candidata 0001, ainda **NÃO AUTORIZADA PARA SQL REMOTO**:

- Ocorrências exploratórias podem existir sem ação avaliativa; apenas ocorrências `assessment/pending` exigem ação direta e vínculo consistente por sujeito, evento, idioma, origem e QW.
- Tentativas devem ter ação consumida, contrato com `authorized=1` e não revogado, sessão não revogada, janela de tempo coerente, escopo e JSON canônicos. Não basta afirmar `issuer_key`: comprovação criptográfica da identidade exige serviço confiável separado.
- Evidence só existe para tentativa `pass` com mesmo packet/escopo; outbox de Evidence exige Evidence existente; tentativa `fail` só pode gerar evento de tentativa rejeitada.
- Ações são imutáveis exceto transição única 0→1 de consumo; ocorrências, tentativas e Evidence são imutáveis. A inserção da tentativa, Evidence e outbox **deve ocorrer em lote atômico** com rechecagem real, não apenas triggers.
- Zero tabelas ou registros são criados nesta branch; os testes usam SQLite local em memória.

**Bloqueios antes da migração remota:** revisar o desenho de privacidade/retention e auth, conferir Time Travel/bookmark remoto de forma read-only, verificar hash da migração e backup/rollback. A compatibilidade D1 ainda não foi testada remotamente. HG, DG, autenticação e contratos WHY S1/S2 continuam abertos. Não copiar tabelas `lab_*` nem semear sujeitos artificiais no D1 remoto.
