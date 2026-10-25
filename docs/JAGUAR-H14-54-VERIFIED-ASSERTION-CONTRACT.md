# 🔔🐆 JAGUAR H14.54 — Contrato de asserção verificável (emissor fictício)

**Base:** H14.53 `43468d39255dcebb13e944ef79ef054d6883cf68`, CI [40214707859](https://github.com/siyayoacademy/siyayo-academy/actions/runs/40214707859) GREEN. Trabalho isolado, sem autenticação de usuário real, deploy ou migração.

## Implementação

`labs/jaguar-v30-3/test/h14-54/fixture-identity-verifier.mjs` fornece um contrato de verificação substituível por um verificador autorizado no futuro. O emissor atual é **exclusivamente de laboratório** e usa HMAC-SHA256 com chave gerada no ambiente de teste, jamais em arquivos versionados. Verifica assinatura por comparação em tempo constante, versão estrutural exata, `issuer`, `audience`, `subject`, `sessionHandle`, `sessionId`, `actionKey`, `eventId`, `intent` e intervalo temporal estrito.

O Worker candidato `worker-entry.mjs` passa a aceitar um envelope assinado `{proof,actionKey,eventId,intent}` somente por RPC local com dois flags de habilitação. A asserção assinada vincula os três campos ao sujeito/sessão na base `mock_sessions`, sem aceitar campos de autoridade avulsos. Reutiliza o gateway H14.53, preparador H14.44, batch H14.50, leitura 85C e D1 local. As rotas HTTP continuam 404. O código não assume um provedor, nem emite cookies, tokens de login ou identidades reais.

## Evidências e limitações

- Testes herméticos demonstram assinatura válida, adulteração, chave errada, issuer/audience incorretos, expiração, tempo futuro, campos indevidos e inspeção do bundle.
- O contrato representa uma **abstração testada**, não um autenticador de produção, nem instalação comprovada de provedor ou criação de evento autenticado no Explorer.
- Sessão de origem ainda sintética; o portão DG-04 permanece **ABERTO** e as demais seis lacunas H14.43 permanecem abertas.
- `proof` e a chave HMAC de ensaio não devem ser confundidos com token legítimo de usuário; um futuro emissor real necessita política de emissão, revogação, anti-replay, proteção contra roubo de sessão, CSRF/canal de transporte, rotatividade de chaves, relógio e limites.
- A prova assinada não concede avaliação, Evidence, Green Pass, publicação nem ativação de rotas HTTP.

## Integração futura

O [Inventário Mestre para o Explorer](./JAGUAR-H14-54-EXPLORER-INTEGRATION-INVENTORY.md) reúne 18 módulos REG-01 e a cadeia H14.39–H14.54, com fonte, classificação, dependências e sete portões. O [JSON de inventário](../data/learning/references/jaguar-h14-54-explorer-integration-inventory-v0.1.json) pode ser processado por ferramentas sem editar o Explorer.

## Execução

```bash
npm ci --prefix labs/jaguar-v30-3/test/h14-54 --no-audit --no-fund
npm test --prefix labs/jaguar-v30-3/test/h14-54
```

O workflow desta branch também verifica regressões H14.53/H14.52/50/44/85C e WHY. **Nenhum dos resultados substitui autenticação, D1 remoto, homologação pedagógica ou revisão do código do Explorer real.**

**GO** para prova isolada do contrato somente após CI bem-sucedida; **NO-GO** para staging, produção, Evidence, Green Pass ou merge.
