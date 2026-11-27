import { NextResponse } from 'next/server';
import { getPublicPrebuilts, getPublicServices } from '@/lib/server-catalog';
import { getCsHealth } from '@/lib/cs-health';

/**
 * Health check untuk uptime monitoring.
 * Tidak mengembalikan harga part, token, atau detail internal.
 */
export async function GET() {
  const prebuilts = getPublicPrebuilts();
  const services = getPublicServices();

  const catalogOk = prebuilts.length > 0 && services.length > 0;
  const pricingOk = prebuilts.every(
    (pkg) => Number.isFinite(pkg.totalBundlePrice) && pkg.totalBundlePrice > 0
  );
  const cs = await getCsHealth();

  const ok = catalogOk && pricingOk && cs.ok;

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      checks: {
        catalog: catalogOk ? 'ok' : 'fail',
        pricing: pricingOk ? 'ok' : 'fail',
        cs: cs.ok ? 'ok' : cs.configured ? 'unreachable' : 'not_configured',
      },
      counts: {
        packages: prebuilts.length,
        services: services.length,
      },
    },
    {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
