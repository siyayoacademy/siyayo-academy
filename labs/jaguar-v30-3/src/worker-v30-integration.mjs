// SIYAYO JAGUAR V30.3: reconstructed from the 2026-10-20 audit transcript.
// LOCAL DIAGNOSTIC ONLY. NEVER DEPLOY. Simulated identity is NOT authentication.
import {processLabOccurrence} from './bridge.mjs';

export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);

    // Preserve the local diagnostic of the fail-closed identity boundary.
    if (url.pathname === '/__lab/v30/probe' && request.method === 'GET') {
      const result = await processLabOccurrence({
        proof: null,
        request: {purpose: 'exploration', event: {}},
        registry: new Map(),
        policies: new Map(),
        db: env.ASSESSMENT_DB,
        now: 1000
      });
      return Response.json(result, {
        status: result.reason === 'unauthenticated' ? 200 : 500
      });
    }

    // V30.3.78: experimental D1 write/read routes disabled BEFORE any D1 call.
    // The original test-only handlers are deliberately NOT restored as live routes.
    if ([
      '/__lab/v30/write-once',
      '/__lab/v30/read-once',
      '/__lab/v30/read-other'
    ].includes(url.pathname)) {
      return Response.json({error: 'route_disabled'}, {status: 404});
    }

    // The health check is the only surviving D1 HTTP diagnostic.
    if (url.pathname !== '/__lab/v30/health' || request.method !== 'GET') {
      return Response.json({error: 'route_disabled'}, {status: 404});
    }
    if (!env.ASSESSMENT_DB) {
      return Response.json({error: 'storage_unavailable'}, {status: 503});
    }
    try {
      const row = await env.ASSESSMENT_DB.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='v30_occurrences'"
      ).first();
      return Response.json({ok: row?.name === 'v30_occurrences', table: row?.name ?? null});
    } catch {
      return Response.json({error: 'storage_failure'}, {status: 500});
    }
  }
};
