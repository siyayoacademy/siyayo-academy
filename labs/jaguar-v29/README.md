# SIYAYO JAGUAR V29 — integração local experimental

Base direta dos pacotes fornecidos V26/V27/V28. A regra Python V28 foi portada para Web Crypto no Worker; o estado permanece exclusivamente `pending`.

## Requisitos e execução local no Codespaces

1. Instale Wrangler (ou use a instalação local existente). **Não faça deploy, não torne a porta pública.**
2. Crie `.dev.vars` dentro desta pasta com `V29_SIM_SECRET=<valor aleatório de laboratório com pelo menos 24 caracteres>`; nunca use segredos de produção.
3. `wrangler d1 migrations apply siyayo-jaguar-v29-local --local --config wrangler.toml`
4. `wrangler dev --local --ip 127.0.0.1 --port 8797 --config wrangler.toml`.
5. Para uma credencial de teste use `python3 mint_local_token.py` (lê a mesma `V29_SIM_SECRET` de `.dev.vars`). Use `Authorization: Bearer <token>` em POST `/__lab/v29/occurrence` com `{"occurrenceId":"demo1","event":{"choice":"books"}}`; GET `/__lab/v29/occurrence/demo1`.
6. `node --test test/*.test.mjs` testa fluxos em ambiente simulado, **não substitui o smoke D1/Worker real**.

## Segurança / limites

- V29 não implementa autenticação real. A autoridade HMAC é **simulada** (V28); o segredo do emissor é compartilhado somente no laboratório.
- `V29_LOCAL_ONLY` impede ativação acidental sem a variável, mas **NÃO é uma barreira suficiente contra deploy**; manter porta privada e não publicar no Cloudflare.
- Propriedade de evento, proveniência pedagógica, CHOICE/USE/TRANSFER, Green Pass, revogação, anti-replay de token e controles operacionais permanecem fora do escopo.
- Escopo permitido é um único escopo canônico de laboratório, não autorização multi-scope de produção.
- Nenhum código altera o Explorer, repositório oficial ou o Sprite Financeiro.
