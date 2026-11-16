import React from 'react';
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

// Detail paket hanya berisi data statis; tidak perlu validasi instant navigation.
export const instant = false;

export default async function PaketDetailPage({ params }: PaketDetailPageProps) {
  const { slug } = await params;
  const pkg = getPublicPrebuiltDetail(slug);

  if (!pkg) {
    notFound();
  }

  return <PaketDetailContent pkg={pkg} />;
}
