import { afterEach, describe, expect, it } from 'vitest';
import { isCsConfigured, isPrivateBase } from '@/lib/cs-health';

const ENV_KEYS = ['NINEROUTER_BASE_URL', 'NINEROUTER_API_KEY', 'VERCEL'] as const;
const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = saved[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('isPrivateBase', () => {
  it('menolak host loopback dan jaringan privat', () => {
    for (const url of [
      'http://localhost:20128/v1',
      'http://127.0.0.1:20128/v1',
      'http://10.1.2.3/v1',
      'http://192.168.1.9/v1',
      'http://172.16.0.4/v1',
    ]) {
      expect(isPrivateBase(url)).toBe(true);
    }
  });

  it('menerima host publik dan URL tidak valid dianggap privat', () => {
    expect(isPrivateBase('https://api.9router.ai/v1')).toBe(false);
    expect(isPrivateBase('bukan-url')).toBe(true);
  });
});

describe('isCsConfigured', () => {
  it('butuh API key', () => {
    process.env.NINEROUTER_API_KEY = '';
    expect(isCsConfigured()).toBe(false);
  });

  it('menolak upstream privat saat berjalan di Vercel', () => {
    process.env.NINEROUTER_API_KEY = 'test-key';
    process.env.NINEROUTER_BASE_URL = 'http://127.0.0.1:20128/v1';
    process.env.VERCEL = '1';
    expect(isCsConfigured()).toBe(false);
  });

  it('menerima upstream publik di Vercel', () => {
    process.env.NINEROUTER_API_KEY = 'test-key';
    process.env.NINEROUTER_BASE_URL = 'https://api.9router.ai/v1';
    process.env.VERCEL = '1';
    expect(isCsConfigured()).toBe(true);
  });
});
