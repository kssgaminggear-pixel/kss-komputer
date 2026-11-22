/**
 * Guard harga CS Agent KSS.
 *
 * Modul ini murni (tanpa I/O) supaya bisa diuji dengan Vitest tanpa menyalakan
 * Next.js atau 9Router. Aturan bisnisnya: satu-satunya nominal rupiah yang boleh
 * tampil ke publik adalah total paket rakitan dan harga layanan jasa.
 */

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface PriceSource {
  packages: { totalBundlePrice: number }[];
  services: { price: number; priceMax?: number }[];
}

export const MAX_MESSAGES = 12;
export const MAX_CHARS = 1200;
export const REDACTION = '(harga part tidak ditampilkan)';

/** Kumpulan nominal sah, dinormalisasi menjadi digit saja. */
export function getAllowedAmounts(source: PriceSource): Set<string> {
  const allowed = new Set<string>();

  for (const pkg of source.packages) {
    if (Number.isFinite(pkg.totalBundlePrice) && pkg.totalBundlePrice > 0) {
      allowed.add(String(pkg.totalBundlePrice));
    }
  }

  for (const service of source.services) {
    if (service.price > 0) allowed.add(String(service.price));
    if (service.priceMax && service.priceMax > 0) allowed.add(String(service.priceMax));
  }

  return allowed;
}

export function normalizeDigits(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
  return digits === '' ? '0' : digits;
}

/**
 * Hapus nominal rupiah yang bukan total paket / harga jasa.
 * Menangani bentuk "Rp 1.650.000", "Rp1.650.000", dan "1.650.000".
 */
export function sanitizeReply(
  reply: string,
  allowed: Set<string>
): { text: string; redacted: boolean } {
  let redacted = false;

  const replaceAmount = (match: string, raw: string): string => {
    if (allowed.has(normalizeDigits(raw))) return match;
    redacted = true;
    return REDACTION;
  };

  let text = reply.replace(/\bRp\.?\s?([\d][\d.,]*)/gi, replaceAmount);
  text = text.replace(/\b\d{1,3}(?:\.\d{3})+\b/g, (match) => {
    if (allowed.has(normalizeDigits(match))) return match;
    redacted = true;
    return REDACTION;
  });
  // Bentuk jarang: "1 650 000" (pemisah spasi).
  text = text.replace(/\b\d{1,3}(?:[ ]\d{3})+\b/g, (match) => {
    if (allowed.has(normalizeDigits(match))) return match;
    redacted = true;
    return REDACTION;
  });

  return { text, redacted };
}

/**
 * Sanitizer untuk balasan streaming.
 *
 * Teks ditahan sampai ada batas kalimat/baris, lalu diredaksi utuh. Ini
 * mencegah nominal terpotong antar-chunk lolos sebagai teks biasa.
 */
export function createStreamGuard(allowed: Set<string>) {
  let pending = '';
  let redacted = false;

  const drain = (final: boolean): { text: string; redacted: boolean } => {
    if (final) {
      const rest = pending;
      pending = '';
      if (!rest) return { text: '', redacted };
      const result = sanitizeReply(rest, allowed);
      redacted = redacted || result.redacted;
      return { text: result.text, redacted };
    }

    let cut = 0;
    for (const match of pending.matchAll(/[.!?](?=\s)|\n/g)) {
      cut = (match.index ?? 0) + match[0].length;
    }
    if (cut === 0) return { text: '', redacted };

    const ready = pending.slice(0, cut);
    pending = pending.slice(cut);
    const result = sanitizeReply(ready, allowed);
    redacted = redacted || result.redacted;
    return { text: result.text, redacted };
  };

  return {
    push(chunk: string) {
      pending += chunk;
      return drain(false);
    },
    flush() {
      return drain(true);
    },
    get redacted() {
      return redacted;
    },
  };
}

export function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => {
      const role = item.role === 'assistant' ? 'assistant' : item.role === 'user' ? 'user' : null;
      const content = typeof item.content === 'string' ? item.content.trim() : '';
      if (!role || !content) return null;
      return { role, content: content.slice(0, MAX_CHARS) } satisfies ChatMessage;
    })
    .filter((item): item is ChatMessage => item !== null)
    .slice(-MAX_MESSAGES);
}
