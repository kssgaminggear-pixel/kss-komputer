/**
 * Inti proxy CS Agent. Dipisah dari cs-proxy.mjs agar bisa diuji.
 * Proxy ini terjangkau dari internet, jadi semua input dianggap tidak tepercaya.
 */
import http from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';

export const DEFAULT_LIMITS = {
  bodyBytes: 128 * 1024,
  maxTokens: 1024,
  // Semua permintaan datang lewat satu tunnel, jadi batasnya berlaku global.
  chatPerMinute: 40,
  modelsPerMinute: 120,
  failedAuthPerMinute: 30,
  upstreamTimeoutMs: 60_000,
};

const ROUTES = new Map([
  ['POST /v1/chat/completions', 'chat'],
  ['GET /v1/models', 'models'],
]);

const digest = (value) => createHash('sha256').update(String(value)).digest();

/** Perbandingan waktu-konstan; hash menyamakan panjang kedua nilai. */
const sameSecret = (presented, secret) => timingSafeEqual(digest(presented), digest(secret));

function createWindow(limit, now) {
  let count = 0;
  let resetAt = 0;
  return () => {
    if (now() >= resetAt) {
      count = 0;
      resetAt = now() + 60_000;
    }
    count += 1;
    return count <= limit;
  };
}

function reply(res, status, error) {
  if (res.headersSent) return res.end();
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error }));
}

/** Membatasi bentuk permintaan chat sebelum diteruskan. Null berarti ditolak. */
function sanitizeChatBody(raw, maxTokens) {
  let body;
  try {
    body = JSON.parse(raw.toString('utf8'));
  } catch {
    return null;
  }
  if (!body || typeof body.model !== 'string' || !Array.isArray(body.messages)) return null;
  const requested = Number(body.max_tokens);
  body.max_tokens = requested > 0 ? Math.min(requested, maxTokens) : maxTokens;
  return Buffer.from(JSON.stringify(body));
}

export function createProxyServer({ upstream, upstreamKey, secret, limits = {}, now = Date.now }) {
  const config = { ...DEFAULT_LIMITS, ...limits };
  const allow = {
    chat: createWindow(config.chatPerMinute, now),
    models: createWindow(config.modelsPerMinute, now),
  };
  const allowFailedAuth = createWindow(config.failedAuthPerMinute, now);

  const server = http.createServer((req, res) => {
    const pathname = (req.url || '/').split('?')[0];
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const presented = req.headers['x-kss-tunnel'] || bearer || '';

    if (!sameSecret(presented, secret)) {
      return reply(res, allowFailedAuth() ? 401 : 429, 'unauthorized');
    }

    const route = ROUTES.get(`${req.method} ${pathname}`);
    if (!route) return reply(res, 404, 'not_found');
    if (!allow[route]()) return reply(res, 429, 'rate_limited');

    const chunks = [];
    let size = 0;
    let rejected = false;
    req.on('data', (chunk) => {
      if (rejected) return;
      size += chunk.length;
      if (size > config.bodyBytes) {
        rejected = true;
        chunks.length = 0;
        reply(res, 413, 'payload_too_large');
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (rejected) return;
      let body = Buffer.concat(chunks);
      if (route === 'chat') {
        body = sanitizeChatBody(body, config.maxTokens);
        if (!body) return reply(res, 400, 'bad_request');
      }

      const forward = http.request(
        `${upstream}${pathname}`,
        {
          method: req.method,
          // Hanya header ini yang diteruskan; header dari luar tidak pernah ikut.
          headers: {
            'content-type': 'application/json',
            'content-length': body.length,
            authorization: `Bearer ${upstreamKey}`,
          },
        },
        (upstreamRes) => {
          res.writeHead(upstreamRes.statusCode || 502, {
            'content-type': upstreamRes.headers['content-type'] || 'application/json',
          });
          upstreamRes.pipe(res);
        }
      );

      forward.setTimeout(config.upstreamTimeoutMs, () => forward.destroy(new Error('upstream timeout')));
      forward.on('error', () => reply(res, 502, 'upstream_unreachable'));
      res.on('close', () => forward.destroy());
      forward.end(body);
    });
  });

  // Menutup koneksi yang sengaja mengirim lambat.
  server.headersTimeout = 10_000;
  server.requestTimeout = 20_000;
  return server;
}
