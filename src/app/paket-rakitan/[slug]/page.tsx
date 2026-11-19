import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PaketDetailContent from './PaketDetailClient';
import { getPublicPrebuiltDetail, getPublicPrebuilts } from '@/lib/server-catalog';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, productSchema } from '@/lib/seo';
import { getPackageImage } from '@/lib/package-images';

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

  const image = getPackageImage(pkg.slug);

  return {
    title: `${pkg.name} — Paket PC Rakitan KSS Komputer`,
    description: pkg.description,
    alternates: {
      canonical: `/paket-rakitan/${pkg.slug}`,
    },
    openGraph: {
      type: 'website',
      title: pkg.name,
      description: pkg.description,
      url: `/paket-rakitan/${pkg.slug}`,
      ...(image ? { images: [{ url: image, alt: pkg.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: pkg.name,
      description: pkg.description,
      ...(image ? { images: [image] } : {}),
    },
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

  return (
    <>
      <JsonLd
        data={[
          productSchema(pkg),
          breadcrumbSchema([
            { name: 'Beranda', path: '/' },
            { name: 'Paket Rakitan', path: '/paket-rakitan' },
            { name: pkg.name, path: `/paket-rakitan/${pkg.slug}` },
          ]),
        ]}
      />
      <PaketDetailContent pkg={pkg} />
    </>
  );
}
