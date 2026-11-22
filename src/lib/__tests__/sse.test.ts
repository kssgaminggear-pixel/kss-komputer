import { describe, expect, it } from 'vitest';
import { drainSseBuffer, formatSseEvent, parseSseBlock } from '@/lib/sse';

describe('formatSseEvent', () => {
  it('menulis event dan data JSON dengan pemisah blok', () => {
    expect(formatSseEvent('delta', { text: 'Halo' })).toBe(
      'event: delta\ndata: {"text":"Halo"}\n\n'
    );
  });
});

describe('parseSseBlock', () => {
  it('memakai event "message" untuk format OpenAI tanpa event', () => {
    const parsed = parseSseBlock('data: {"choices":[{"delta":{"content":"Halo"}}]}');

    expect(parsed).toEqual({
      event: 'message',
      data: '{"choices":[{"delta":{"content":"Halo"}}]}',
    });
  });

  it('membaca event kustom dan membuang spasi setelah titik dua', () => {
    const parsed = parseSseBlock('event: done\ndata: {"redacted":true}');

    expect(parsed).toEqual({ event: 'done', data: '{"redacted":true}' });
  });

  it('menggabungkan beberapa baris data', () => {
    const parsed = parseSseBlock('data: baris-1\ndata: baris-2');

    expect(parsed?.data).toBe('baris-1\nbaris-2');
  });

  it('mengabaikan komentar keep-alive', () => {
    expect(parseSseBlock(': keep-alive')).toBeNull();
    expect(parseSseBlock('')).toBeNull();
  });
});

describe('drainSseBuffer', () => {
  it('mengurai dua blok lengkap dan menyisakan buffer terakhir', () => {
    const chunk =
      'event: delta\ndata: {"text":"Halo"}\n\n' +
      'event: delta\ndata: {"text":" dunia"}\n\n' +
      'event: delta\ndata: {"text":"!';

    const { blocks, rest } = drainSseBuffer(chunk);

    expect(blocks).toEqual([
      { event: 'delta', data: '{"text":"Halo"}' },
      { event: 'delta', data: '{"text":" dunia"}' },
    ]);
    expect(rest).toBe('event: delta\ndata: {"text":"!');
  });

  it('menangani blok yang terpotong antar-panggilan', () => {
    const first = drainSseBuffer('event: delta\ndata: {"te');
    expect(first.blocks).toEqual([]);
    expect(first.rest).toBe('event: delta\ndata: {"te');

    const second = drainSseBuffer(`${first.rest}xt":"Halo"}\n\n`);
    expect(second.blocks).toEqual([{ event: 'delta', data: '{"text":"Halo"}' }]);
    expect(second.rest).toBe('');
  });

  it('menangani akhir baris CRLF', () => {
    const { blocks, rest } = drainSseBuffer(
      'event: done\r\ndata: {"ok":true}\r\n\r\n'
    );

    expect(blocks).toEqual([{ event: 'done', data: '{"ok":true}' }]);
    expect(rest).toBe('');
  });
});
