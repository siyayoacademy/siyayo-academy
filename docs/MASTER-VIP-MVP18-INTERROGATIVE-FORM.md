# JAGUAR MVP18 — Use Interrogative Form
Data: 2026-10-30
Branch: `jaguar/master-vip-modular-site-print-20261026`
Status: SOURCE IMPORTED / CATALOG INTEGRATED; BROWSER QA, PHYSICAL A4 AND HUMAN HOMOLOGATION PENDING.

## Origem
Fonte canônica: STRUCTURE-KIND OF WORDS.docx (25/10/2026), seção "VERB TO BE – USE INTERROGATIVE FORM", a partir de P04432, precedendo "TO BE – OTHER FORMS". Tabela de 60 exercícios numerados, expressão de tempo, sujeito/predicativo de partida e campos de construção vazios. Extraída da tabela original do DOCX; nomes, tempos, datas e grafia preservados. O XML granular e IDs P finais ainda requerem conferência.

## HOW TO DO / RECORD
JSON `master-vip/data/use-interrogative-form-mvp18-source.json` registra 60 itens, com expressões temporais e enunciados originais; nenhum gabarito ou tradução criada. Catálogo `master-vip/data/catalog.json` versão 0.16.0: 797 módulos anteriores + 61 novos (orientação + 60 exercícios) = 858. Sete seções novas (orientação e seis grupos de dez). IDs únicos verificados no lote.

## HOW TO SHOW
Mantém o renderizador existente do capítulo To Be; exercícios ficam em SOURCE_EXERCISE, sem preenchimento. Exige futura conferência visual do quadro original (tempo, sujeito, VERB, THE REST), navegação, Speech, portrait e print. Não afirmar que a tabela de construção já tenha sido recomposta no slide.

## HOW TO CHECK
Validações estrutural e contagem executadas antes do commit; ainda pendentes testes automatizados da branch, preview Cloudflare, revisão humana, proveniência XML fina e prova física A4. Não alterar deploy de main, DNA Explorer, Mestre Canto Ensino nem D1.

## Próximo ELO
MVP19 — TO BE – OTHER FORMS, a delimitar na fonte após o presente bloco. A auditoria Dependency Bridge permanece registrada como trabalho futuro, não bloqueador.
