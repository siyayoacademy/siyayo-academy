# JAGUAR — WHY: revisão pedagógica, prévia isolada

A branch contém a página `why-production-review-preview.html?why_production_review=preview`, isolada do Explorer oficial e alimentada somente pelo corpus público `data/learning/experience-seeds.json`. Apresenta EN/ES/PT, duas origens (S1/S2), três dimensões por origem, e indica que o enunciado de question-function requer autoria independente. Sem parâmetro opt-in o painel fica oculto.

**A página não carrega modelos do professor**, não captura NICK, não coleta respostas, não concede créditos e não modifica `assessmentTarget`. O JSON `siyayo-why-s1-s2-human-review-queue-v0.1.json` registra 18 tarefas para **futura revisão autenticada**, inicialmente vazias, com 15 HG + 7 DG abertos. Não enviar revisão preenchida sem origem humana verificável.

A prévia é uma página estática de branch, **não foi publicada em Cloudflare nem homologada em dispositivos reais**. Ela só funciona servida a partir da raiz do repositório por um servidor HTTP estático. A release guard anterior continua bloqueando deploy, merge e Evidence. H14.67 continua preservado.

Para confirmar: `node scripts/test-why-production-review-preview.cjs`. Executar também os testes de release guard e WHY S3→S4. Antes de usar com docentes externos, criar mecanismo real de identidade, permissões e armazenamento reservado dos pareceres; o arquivo público não pode receber dados identificadores de pessoas nem pareceres privados.
