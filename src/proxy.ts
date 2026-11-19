import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, isAdminConfigured, verifySession } from '@/lib/admin-auth';

/**
 * Proxy (pengganti middleware di Next 16) untuk mengunci area admin.
 *
 * - /admin/login selalu terbuka.
 * - Endpoint login/logout selalu terbuka.
 * - Sisanya wajib punya cookie sesi yang valid.
 * - Jika env admin belum diatur, area admin ditutup total (fail closed).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  if (!isAdminConfigured()) {
    return new NextResponse(
      'Admin belum dikonfigurasi. Set ADMIN_PASSWORD dan ADMIN_SESSION_SECRET.',
      {
        status: 503,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      }
    );
  }

  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  if (await verifySession(session)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  if (pathname !== '/admin') loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
