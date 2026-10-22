# JAGUAR V30.3.89H — Zero Trust adiado · testes locais mantidos

**Decisão expressa em 21/out/2026:** não contratar, não ativar Zero Trust e não cadastrar meio de pagamento por enquanto. O checkout real exibiu Zero Trust Free por US$ 0/mês, mas exigiu meio de pagamento e informou cobranças potenciais por uso excedente. O usuário decidiu **deixar pendente**, não aceitar checkout.

**Classificação de evidência:** não há confirmação de checkout concluído, assinatura Zero Trust ativa, aplicação Access criada ou política de proteção instalada. Um menu Zero Trust visível NÃO comprova configuração de equipe. A página de boas-vindas com Get started indicou onboarding disponível, não proteção pronta.

## Autorizado agora
- Regressões apenas de laboratório no GitHub CI, SQLite em arquivo local temporário, identidades simuladas e JWTs assinados com chaves sintéticas de teste.
- Restaurar observações com integridade e escopo por sujeito, habilidade, idioma, QW, origem e versão, sem transformar observações em créditos.
- Demonstrar EN/ES/PT, 4 QWs atualmente visíveis (WHICH, WHAT, WHERE, WHY), sessões simuladas, mudança de NICK, origem S1→S2→S3, logout/revogação simulada e renderização Word Path/Trail sem autoridade de avaliação.

## Proibido até decisão futura separada
- Ativar Zero Trust Free ou pago; informar cartão, Apple Pay, Google Pay ou PayPal; aceitar cobrança futura.
- Criar ou alterar Access, hostnames, Worker de staging, banco D1 remoto, bindings ou rotas.
- Relacionar unprotected Pages preview ao staging como autenticação.
- Registrar como aprovação de segurança os cenários sintéticos do laboratório.
- Alterar branch `main`, Explorer oficial `c7e83709` ou Worker visual `shiny-scene-4b76`.
- Conceder Evidence, CHOICE/USE/TRANSFER ou Green Pass a partir de status `pending` ou `observed_exploratory`.

O registro canônico de arquitetura V30.3.89D não será modificado retroativamente. **Os 12 bloqueios externos continuam abertos.**

## Sequência de teste
1. Confirmar pureza dos snapshots observacionais e matriz 4 QWs × EN/ES/PT.
2. Reexecutar testes de arquivo SQLite e restart; confronto de dois alunos usando o mesmo NICK.
3. Reexecutar leitura/recuperação com identidade e revogação sintéticas, sem alegar Cloudflare Access real.
4. Tratar qualquer real deploy / banco / autenticação como STOP independente.

**Publicação GitHub:** usar o prefixo `[CF-Pages-Skip]` para não gerar um novo preview automático, e verificar no painel Cloudflare em uma auditoria futura de leitura. Um evento "Skipped" pode aparecer no histórico de deployments, mas isso não é uma nova implantação funcional.
