/**
 * Utilitas Server-Sent Events minimal.
 *
 * Dipakai bersama oleh route `/api/cs` (membaca stream 9Router dan menulis SSE
 * ke browser) dan widget `CsAgent` (membaca SSE). Modul ini murni supaya bisa
 * diuji tanpa jaringan.
 */

export interface SseEvent {
  event: string;
  data: string;
}

/** Format satu event SSE. `data` diserialisasi sebagai JSON. */
export function formatSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Parse satu blok SSE (tanpa pemisah `\n\n` di akhir).
 * Baris komentar (`:`) dan keep-alive diabaikan.
 */
export function parseSseBlock(block: string): SseEvent | null {
  let event = 'message';
  const data: string[] = [];

  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (!line || line.startsWith(':')) continue;

    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data.push(line.slice(5).replace(/^ /, ''));
    }
  }

  if (data.length === 0) return null;
  return { event, data: data.join('\n') };
}

/**
 * Pisahkan blok SSE yang sudah lengkap dari sisa buffer yang belum tuntas.
 * Aman untuk chunk yang terpotong di tengah baris maupun di tengah `\r\n`.
 */
export function drainSseBuffer(buffer: string): { blocks: SseEvent[]; rest: string } {
  const normalized = buffer.replace(/\r\n/g, '\n');
  const parts = normalized.split('\n\n');
  const rest = parts.pop() ?? '';
  const blocks: SseEvent[] = [];

  for (const part of parts) {
    const parsed = parseSseBlock(part);
    if (parsed) blocks.push(parsed);
  }

  return { blocks, rest };
}
