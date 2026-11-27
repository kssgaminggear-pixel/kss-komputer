import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TokoView } from '@/components/toko/TokoView';
import { getMarketplaceEtalase } from '@/lib/marketplace/server';

interface EtalasePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getMarketplaceEtalase().map((shelf) => ({ slug: shelf.slug }));
}

export const instant = false;

async function findShelf(params: EtalasePageProps['params']) {
  const { slug } = await params;
  return getMarketplaceEtalase().find((shelf) => shelf.slug === slug);
}

export async function generateMetadata({ params }: EtalasePageProps): Promise<Metadata> {
  const shelf = await findShelf(params);
  if (!shelf) return { title: 'Etalase tidak ditemukan' };
  return {
    title: `${shelf.name} — Toko KSS Komputer`,
    description: `${shelf.count} produk di etalase ${shelf.name} toko resmi KSS Komputer.`,
    alternates: { canonical: `/toko/etalase/${shelf.slug}` },
  };
}

export default async function EtalasePage({ params }: EtalasePageProps) {
  const shelf = await findShelf(params);
  if (!shelf) notFound();
  return <TokoView activeEtalaseSlug={shelf.slug} />;
}
