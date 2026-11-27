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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProxyServer } from './cs-proxy-lib.mjs';

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

const server = createProxyServer({ upstream: UPSTREAM, upstreamKey: UPSTREAM_KEY, secret: SECRET });

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[cs-proxy] listening on 127.0.0.1:${PORT} -> ${UPSTREAM}`);
});
