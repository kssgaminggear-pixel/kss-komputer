import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PaketDetailContent from './PaketDetailClient';
import { getPublicPrebuiltDetail, getPublicPrebuilts } from '@/lib/server-catalog';

interface PaketDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPublicPrebuilts().map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({
  params,
}: PaketDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPublicPrebuiltDetail(slug);

  if (!pkg) {
    return { title: 'Paket PC Tidak Ditemukan — KSS Komputer' };
  }

  return {
    title: `${pkg.name} — Paket PC Rakitan KSS Komputer`,
    description: pkg.description,
  };
}

export default function PaketDetailPage({ params }: PaketDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center font-mono text-xs text-zinc-500">
          Memuat spesifikasi paket PC...
        </div>
      }
    >
      <PaketDetailContentServer params={params} />
    </Suspense>
  );
}

async function PaketDetailContentServer({ params }: PaketDetailPageProps) {
  const { slug } = await params;
  const pkg = getPublicPrebuiltDetail(slug);

  if (!pkg) {
    notFound();
  }

  return <PaketDetailContent pkg={pkg} />;
}
