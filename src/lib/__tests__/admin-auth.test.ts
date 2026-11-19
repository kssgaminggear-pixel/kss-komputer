import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ADMIN_SESSION_TTL_SECONDS,
  createSession,
  isAdminConfigured,
  verifySession,
} from '@/lib/admin-auth';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'rahasia-test';
  process.env.ADMIN_SESSION_SECRET = 'secret-test-yang-cukup-panjang';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.useRealTimers();
});

describe('isAdminConfigured', () => {
  it('false bila password atau secret tidak ada', () => {
    delete process.env.ADMIN_PASSWORD;
    expect(isAdminConfigured()).toBe(false);

    process.env.ADMIN_PASSWORD = 'ada';
    delete process.env.ADMIN_SESSION_SECRET;
    expect(isAdminConfigured()).toBe(false);
  });

  it('true bila keduanya terisi', () => {
    expect(isAdminConfigured()).toBe(true);
  });
});

describe('session token', () => {
  it('menerima token yang baru dibuat', async () => {
    const { token, maxAge } = await createSession();

    expect(maxAge).toBe(ADMIN_SESSION_TTL_SECONDS);
    expect(await verifySession(token)).toBe(true);
  });

  it('menolak token yang diubah', async () => {
    const { token } = await createSession();
    const [payload, signature] = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 999 })
    ).toString('base64url');

    expect(payload).toBeTruthy();
    expect(await verifySession(`${tamperedPayload}.${signature}`)).toBe(false);
  });

  it('menolak signature palsu', async () => {
    const { token } = await createSession();
    const [payload] = token.split('.');

    expect(await verifySession(`${payload}.palsu`)).toBe(false);
  });

  it('menolak token kedaluwarsa', async () => {
    const { token } = await createSession();
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + (ADMIN_SESSION_TTL_SECONDS + 10) * 1000);

    expect(await verifySession(token)).toBe(false);
  });

  it('menolak token kosong atau rusak', async () => {
    expect(await verifySession(undefined)).toBe(false);
    expect(await verifySession('')).toBe(false);
    expect(await verifySession('tanpa-titik')).toBe(false);
  });
});
