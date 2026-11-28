import { getSlot } from '@/lib/media/slots';

/**
 * Foto unit paket rakitan KSS.
 * Aset berasal dari etalase resmi Tokopedia KSS Komputer, dipotong ke bagian
 * unit PC agar tidak memuat teks promo/harga.
 */
const PACKAGE_IMAGE_BY_SLUG: Record<string, string> = {
  'kss-office-cashier-hemat': '/images/tokopedia/package-office-case.webp',
  'kss-esports-champion-1080p': '/images/tokopedia/package-esports-case.webp',
  'kss-apex-am5-gaming-1080p-ultra': '/images/tokopedia/package-apex-case.webp',
  'kss-studio-pro-1440p-creator': '/images/tokopedia/package-studio-case.webp',
  'kss-titan-ai-workstation-3d': '/images/tokopedia/package-titan-case.webp',
  'kss-valhalla-ultimate-4k-sultan': '/images/tokopedia/package-valhalla-case.webp',
};

/** Foto asli yang didaftarkan di slot `paket.<slug>` menggantikan potongan foto etalase. */
export function getPackageImage(slug: string): string | undefined {
  return getSlot(`paket.${slug}`)?.desktop ?? PACKAGE_IMAGE_BY_SLUG[slug];
}
