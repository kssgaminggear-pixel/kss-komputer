/**
 * Sesi admin KSS.
 *
 * Token = payload base64url + HMAC-SHA256, ditandatangani dengan
 * `ADMIN_SESSION_SECRET`. Memakai Web Crypto supaya aman dipakai di Proxy
 * (Edge/Node) maupun Route Handler tanpa dependensi tambahan.
 */

export const ADMIN_COOKIE = 'kss_admin';
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || '';
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && getSecret());
}

export async function createSession(): Promise<{ token: string; maxAge: number }> {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET belum diatur');

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp: expiresAt })));
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));

  return {
    token: `${payload}.${toBase64Url(new Uint8Array(signature))}`,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  try {
    const key = await importKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(payload)
    );
    if (!valid) return false;

    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      exp?: number;
    };
    return typeof decoded.exp === 'number' && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
