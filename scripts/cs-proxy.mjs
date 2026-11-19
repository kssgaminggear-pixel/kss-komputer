/**
 * Proxy sempit untuk KSS CS Agent.
 *
 * 9Router berjalan di 127.0.0.1:20128 dan tidak boleh dibuka mentah-mentah ke
 * internet. Skrip ini hanya meneruskan dua endpoint yang dipakai CS Agent,
 * mewajibkan secret, lalu meneruskan permintaan ke 9Router memakai API key asli.
 *
 * Jalankan: node scripts/cs-proxy.mjs
 * Env yang dibaca dari .env.local:
 *   NINEROUTER_API_KEY        - API key 9Router (tidak pernah dikirim ke publik)
 *   NINEROUTER_TUNNEL_SECRET  - secret yang dipakai Vercel untuk memanggil proxy
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env.local');
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const getEnv = (key) => env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim();

const UPSTREAM = process.env.NINEROUTER_UPSTREAM || 'http://127.0.0.1:20128';
const UPSTREAM_KEY = process.env.NINEROUTER_API_KEY || getEnv('NINEROUTER_API_KEY');
const SECRET = process.env.NINEROUTER_TUNNEL_SECRET || getEnv('NINEROUTER_TUNNEL_SECRET');
const PORT = Number(process.env.NINEROUTER_PROXY_PORT || 20129);

if (!UPSTREAM_KEY || !SECRET) {
  console.error('NINEROUTER_API_KEY dan NINEROUTER_TUNNEL_SECRET wajib diisi di .env.local');
  process.exit(1);
}

const ALLOWED = new Set(['POST /v1/chat/completions', 'GET /v1/models']);

const server = http.createServer((req, res) => {
  const pathname = (req.url || '/').split('?')[0];
  const route = `${req.method} ${pathname}`;
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const presented = req.headers['x-kss-tunnel'] || bearer;

  if (presented !== SECRET) {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }

  if (!ALLOWED.has(route)) {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const upstream = http.request(
      `${UPSTREAM}${pathname}`,
      {
        method: req.method,
        headers: {
          'content-type': req.headers['content-type'] || 'application/json',
          'content-length': body.length,
          authorization: `Bearer ${UPSTREAM_KEY}`,
        },
      },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode || 502, {
          'content-type': upstreamRes.headers['content-type'] || 'application/json',
        });
        upstreamRes.pipe(res);
      }
    );

    upstream.setTimeout(60_000, () => upstream.destroy(new Error('upstream timeout')));
    upstream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(502, { 'content-type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'upstream_unreachable' }));
    });
    upstream.end(body);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[cs-proxy] listening on 127.0.0.1:${PORT} -> ${UPSTREAM}`);
});
