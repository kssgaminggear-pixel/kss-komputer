import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createProxyServer } from '../../../scripts/cs-proxy-lib.mjs';

const SECRET = 'rahasia-uji';
const seen: { authorization?: string; extra?: string; body: string }[] = [];
const servers: http.Server[] = [];

const listen = (server: http.Server) =>
  new Promise<string>((resolve) => {
    servers.push(server);
    server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`));
  });

let upstream = '';
let proxy = '';

beforeAll(async () => {
  upstream = await listen(
    http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        seen.push({ authorization: req.headers.authorization, extra: req.headers['x-kss-tunnel'] as string, body });
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{"ok":true}');
      });
    })
  );
  proxy = await listen(
    createProxyServer({ upstream, upstreamKey: 'kunci-asli', secret: SECRET, limits: { bodyBytes: 2000, chatPerMinute: 3 } })
  );
});

afterAll(() => {
  for (const server of servers) server.close();
});

const chat = (body: string, token = SECRET) =>
  fetch(`${proxy}/v1/chat/completions`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body });

describe('proxy CS', () => {
  it('menolak tanpa secret atau secret salah, dan rute lain', async () => {
    expect((await chat('{}', 'salah')).status).toBe(401);
    expect((await fetch(`${proxy}/v1/models`)).status).toBe(401);
    expect((await fetch(`${proxy}/dashboard`, { headers: { 'x-kss-tunnel': SECRET } })).status).toBe(404);
    expect(seen).toHaveLength(0);
  });

  it('meneruskan dengan kunci asli, membatasi max_tokens, tanpa header dari luar', async () => {
    const response = await chat(JSON.stringify({ model: 'm', messages: [], max_tokens: 999_999 }));
    expect(response.status).toBe(200);
    expect(seen[0].authorization).toBe('Bearer kunci-asli');
    expect(seen[0].extra).toBeUndefined();
    expect(JSON.parse(seen[0].body).max_tokens).toBe(1024);
  });

  it('menolak body terlalu besar dan body yang bukan permintaan chat', async () => {
    expect((await chat('x'.repeat(5000))).status).toBe(413);
    expect((await chat('bukan json')).status).toBe(400);
    expect(seen).toHaveLength(1);
  });

  it('membatasi jumlah permintaan chat per menit', async () => {
    expect((await chat(JSON.stringify({ model: 'm', messages: [] }))).status).toBe(429);
  });
});
