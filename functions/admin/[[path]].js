import cloudflareAccessPlugin from '@cloudflare/pages-plugin-cloudflare-access';

const headers = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
};
const respond = (body, status = 200) => new Response(body, { status, headers });

export async function authorize(context, validate = cloudflareAccessPlugin) {
  const { ACCESS_TEAM_DOMAIN: domain, ACCESS_AUD: aud, ADMIN_ALLOWED_EMAIL: email } = context.env;
  if (!domain || !aud || !email || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain)) {
    return respond('<h1>Admin aguardando ativação</h1><p>A configuração de acesso restrito ainda não foi concluída.</p>', 503);
  }
  try {
    return await validate({ domain, aud })({ ...context, next: async () => {
      const claims = context.data.cloudflareAccess?.JWT?.payload;
      const now = Math.floor(Date.now() / 1000);
      if (!claims || claims.iss !== domain || !Array.isArray(claims.aud) || !claims.aud.includes(aud) ||
          typeof claims.exp !== 'number' || claims.exp <= now ||
          (claims.nbf !== undefined && (typeof claims.nbf !== 'number' || claims.nbf > now))) {
        return respond('<h1>Acesso restrito</h1>', 403);
      }
      const identity = claims.email;
      if (typeof identity !== 'string' || identity.toLowerCase() !== email.trim().toLowerCase()) {
        return respond('<h1>Acesso restrito</h1>', 403);
      }
      const response = await context.next();
      const secured = new Response(response.body, response);
      for (const [key, value] of Object.entries(headers)) secured.headers.set(key, value);
      return secured;
    }});
  } catch {
    return respond('<h1>Acesso restrito</h1><p>Não foi possível validar sua sessão.</p>', 403);
  }
}

const repo = 'https://github.com/siyayoacademy/siyayo-academy';
const cards = [
  ['Mapa canônico · JSON', repo + '/blob/jaguar/verb-explorer-resume-live-wire/data/canonical/siyayo-development-map.json', 'Contrato e registros de desenvolvimento.'],
  ['Mapa arquitetural · MD', repo + '/blob/jaguar/verb-explorer-resume-live-wire/docs/siyayo-canonical-development-map.md', 'Visão humana da arquitetura.'],
  ['Mapa de trabalho · MD', repo + '/blob/jaguar/verb-explorer-resume-live-wire/docs/SIYAYO-WORK-MAP.md', 'Herança e integração dos ambientes.'],
  ['Jornada · V52', 'https://journey-v51-network-preview.siyayo-academy.pages.dev/journey-v52/', 'Ambiente de preview da jornada original.'],
  ['Frondosa · estudo da descida', 'https://journey-v51-network-preview.siyayo-academy.pages.dev/journey-v52/descent', 'Estudo separado: aproximação, folhas e WAIT.'],
  ['Roteiro do estudo', repo + '/blob/journey-v51-network-preview/docs/JOURNEY-GOLD-SEED-DESCENT-STUDY.md', 'Documentação do experimento visual.'],
];

export async function page(context) {
  if (!['GET', 'HEAD'].includes(context.request.method)) return respond('Método não permitido', 405);
  const path = new URL(context.request.url).pathname;
  if (!['/admin', '/admin/', '/admin/index.html'].includes(path)) return respond('Página não encontrada', 404);
  const body = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>SIYAYO · Admin</title>
  <style> *{box-sizing:border-box}body{margin:0;background:#081b20;color:#edf4ee;font:17px/1.6 'Nunito Sans',system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:32px 24px}h1,h2,h3{font-family:Quicksand,system-ui,sans-serif;line-height:1.25;color:#e9c46a}header{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}a{color:#e9c46a;text-underline-offset:4px}a:focus-visible{outline:3px solid #85dcb6;outline-offset:5px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}article,section{border:1px solid #b99a4b66;border-radius:18px;padding:22px;background:#10282c}section{margin-top:24px}article h3{margin-top:0}.muted{color:#b6c9c2}li{margin:8px 0}nav{display:flex;gap:20px;align-items:center}footer{padding-top:28px;color:#b6c9c2}@media(max-width:480px){main{padding:24px 16px}}</style>
  <main><header><div><p class="muted">LIONS GATE · PRODUÇÃO</p><h1>SIYAYO Academy · Admin</h1><p>Mapas, experiências e próximos elos.</p></div><nav aria-label="Conta"><a href="/">Academy</a><a href="/cdn-cgi/access/logout">Sair</a></nav></header>
  <h2>Mapas e ambientes</h2><div class="grid">${cards.map(([name, url, description]) => `<article><h3><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a></h3><p>${description}</p></article>`).join('')}</div>
  <section><h2>Jornada da Gold Seed · roteiro definido</h2><p>Jaguar → Águia → IRIS → Eagle Dive → Stage 4 → Frondosa → Copa → Folhas / WAIT → Tronco → Raízes → Patita → Lions Gate → Gold Words → Portais → Nice Party → Pianinho.</p><p class="muted">Roteiro de produção: a sequência completa ainda não está integrada. A jornada original e o estudo da descida são ambientes separados.</p></section>
  <section><h2>Pautas de produção</h2><ul><li>Integrar a entrada do Jaguar e conectar Stage 4 à descida.</li><li>Aplicar Auto Portrait / Landscape à jornada original e homologar em celular.</li><li>Catalogar imagens com ID, variantes, transparência e função.</li><li>Preparar cristais, Fadinha Dourada, Gold Leaves e palco de cristal.</li><li>Teclado translúcido sobre bandeira escurecida; conferir Brasil, USA e Espanha.</li><li>Adjetivos positivos trilíngues, 14 Question Words, Gold Words e discos.</li><li>Conectar Chapters 1–10, Verbs DNA, Experiences, Xespirit e Pianinho.</li><li>Definir Sobre, Quem somos e Contato.</li></ul></section>
  <section><h2>Biblioteca visual e corpus</h2><p>O catálogo unificado de assets e os editores de JSON estão pendentes. Este painel inicial reúne acessos e pautas; a edição continua no repositório.</p></section>
  <footer>Admin · primeira etapa · sessão verificada no servidor</footer></main></html>`;
  return respond(context.request.method === 'HEAD' ? null : body);
}

export const onRequest = [authorize, page];
