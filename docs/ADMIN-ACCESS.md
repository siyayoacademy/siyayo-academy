# SIYAYO Admin — configuração e homologação

Branch isolado: `jaguar/admin-dashboard`. Página: `/admin/` e `/admin/index.html`, servidas por Pages Function; não existe HTML administrativo estático para contornar a função. Não foi alterado o index público nem adicionado o botão Admin: conectar após homologação.

## Estado

Painel inicial com mapas e pautas. Autenticação preparada, NÃO ativada na conta Cloudflare. Sem configuração a função retorna 503; sem token válido o plugin redireciona ao login, e identidade não autorizada retorna 403. Não usar o modo de publicação somente estático nem exportar o HTML do painel para assets públicos.

Verificação local: `node docs/admin-access.test.mjs` — dez casos aprovados usando chaves RSA de teste e o plugin real, cobrindo acesso válido, outra conta, ausência de configuração/token, token inválido/expirado, emissor/audience incorretos, ausência de expiração e validade futura. Homologação do login online e layout em aparelhos permanece pendente.

## Ativação Cloudflare

1. Configurar Google como provedor de identidade no Cloudflare Zero Trust, seguindo https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/google/ . As credenciais OAuth ficam na configuração Cloudflare, nunca no repositório.
2. Criar aplicação Access para o hostname efetivo e caminho `/admin` e descendentes; incluir também o endpoint de índice. Confirmar cobertura dos hosts de preview e produção, ou negar os hosts alternativos. Não proteger toda a Academy pública inadvertidamente.
3. Política Allow: seletor Emails com SOMENTE o endereço do proprietário informado privadamente; exigir o provedor Google. Não usar Everyone, domínio gmail.com, Bypass ou Service Auth.
4. Configurar no Pages (preview desta branch): `ACCESS_TEAM_DOMAIN` = URL https://TEAM.cloudflareaccess.com sem barra final; `ACCESS_AUD` = audience da aplicação; `ADMIN_ALLOWED_EMAIL` = endereço do proprietário informado privadamente. Configurar novamente em produção se promovido. Não publicar o endereço pessoal no repositório.
5. Instalar dependências de package.json e publicar com Pages Functions incluídas. Validar a compilação antes de liberar o link.

O plugin oficial valida a assinatura e os claims do JWT. A função aplica uma segunda checagem do e-mail autorizado e usa `Cache-Control: private, no-store`. Não há senha no JavaScript, desbloqueio por localStorage nem interpretação de token sem validação.

## Homologação obrigatória antes de declarar concluído

- Conta autorizada: Google → painel e logout.
- Outra conta Google: acesso negado.
- Janela privada, token falso/expirado, token de outra aplicação: sem painel.
- Abrir `/admin`, `/admin/`, `/admin/index.html` diretamente nos hosts de branch, deploy e produção; proteção idêntica.
- Configuração ausente: 503, nenhum conteúdo administrativo.
- Verificar mapas, JSON, Jornada V52 e estudo da Frondosa pelos links do painel.
- Retrato e paisagem sem transbordamento.

Dados que já existem publicamente no repositório continuam públicos: Access restringe o painel e futuras rotas privadas, não torna os mapas públicos secretos. Novas APIs administrativas devem aplicar a mesma validação e não expor dados sensíveis em diretórios públicos.

Fontes: https://developers.cloudflare.com/pages/functions/plugins/cloudflare-access/ e https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/ .
