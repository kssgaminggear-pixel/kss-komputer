import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  if (!match) throw new Error(`token --color-${name} tidak ditemukan`);
  return match[1];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const LIGHT = ['paper', 'paper-deep', 'block-clay', 'block-steel', 'block-butter'];

describe('kontras warna V3', () => {
  it.each(LIGHT)('teks di atas %s terbaca (>= 4.5:1)', (background) => {
    // zinc-500 = abu paling terang yang dipakai untuk teks; accent-hover = orange-800 untuk eyebrow.
    for (const text of ['ink', 'ink-soft', 'zinc-500', 'accent-hover']) {
      expect(contrast(token(text), token(background)), `${text} di ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('putih di tombol orange dan abu di area gelap terbaca', () => {
    expect(contrast('#ffffff', token('accent'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#8b8b94', token('block-ink'))).toBeGreaterThanOrEqual(4.5);
  });
});
