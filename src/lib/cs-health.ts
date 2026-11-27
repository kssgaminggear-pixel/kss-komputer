/**
 * Status kesehatan upstream CS (9Router).
 *
 * Dipakai oleh `/api/cs` (GET) dan `/api/health` agar logika konfigurasi,
 * deteksi endpoint privat, dan cache reachability tidak terduplikasi.
 */

const HEALTH_CACHE_MS = 30_000;

export interface CsUpstream {
  baseUrl: string;
  apiKey?: string;
  model: string;
}

export function isPrivateBase(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    );
  } catch {
    return true;
  }
}

export function getCsUpstream(): CsUpstream {
  return {
    baseUrl: (process.env.NINEROUTER_BASE_URL || 'http://127.0.0.1:20128/v1').replace(/\/+$/, ''),
    apiKey: process.env.NINEROUTER_API_KEY,
    model: process.env.NINEROUTER_MODEL || 'New-Combo',
  };
}

export function isCsConfigured(): boolean {
  const { baseUrl, apiKey } = getCsUpstream();
  if (!apiKey) return false;
  if (process.env.VERCEL && isPrivateBase(baseUrl)) return false;
  return true;
}

let healthCache = { at: 0, ok: false };

/** Cek nyata ke 9Router, di-cache 30 detik agar tidak membebani tiap request. */
export async function isCsReachable(): Promise<boolean> {
  if (Date.now() - healthCache.at < HEALTH_CACHE_MS) return healthCache.ok;

  const { baseUrl, apiKey } = getCsUpstream();
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    healthCache = { at: Date.now(), ok: response.ok };
  } catch {
    healthCache = { at: Date.now(), ok: false };
  }
  return healthCache.ok;
}

export interface CsHealth {
  configured: boolean;
  reachable: boolean;
  ok: boolean;
}

export async function getCsHealth(): Promise<CsHealth> {
  const configured = isCsConfigured();
  const reachable = configured ? await isCsReachable() : false;
  return { configured, reachable, ok: configured && reachable };
}
