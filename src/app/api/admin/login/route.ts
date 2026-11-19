import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, createSession, isAdminConfigured } from '@/lib/admin-auth';

const WINDOW_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = attempts.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_ATTEMPTS;
}

/** Bandingkan dua string tanpa membocorkan panjang/isi lewat timing. */
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'ADMIN_NOT_CONFIGURED', message: 'Admin belum dikonfigurasi di server.' },
      { status: 503 }
    );
  }

  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Tunggu 5 menit.' },
      { status: 429 }
    );
  }

  let password = '';
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!password || !safeEqual(password, process.env.ADMIN_PASSWORD || '')) {
    return NextResponse.json(
      { error: 'INVALID_CREDENTIALS', message: 'Password admin salah.' },
      { status: 401 }
    );
  }

  const { token, maxAge } = await createSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
