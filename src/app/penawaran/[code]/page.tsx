import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PenawaranClient from './PenawaranClient';
import { getPublicQuoteByCode, getPublicQuoteCodes } from '@/lib/server-catalog';

interface PenawaranPageProps {
  params: Promise<{ code: string }>;
}

export function generateStaticParams() {
  return getPublicQuoteCodes().map((code) => ({ code }));
}

export default function PenawaranPage({ params }: PenawaranPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-16 text-center font-mono text-xs text-zinc-500">
          Memuat surat penawaran resmi...
        </div>
      }
    >
      <PenawaranContent params={params} />
    </Suspense>
  );
}

async function PenawaranContent({ params }: PenawaranPageProps) {
  const { code } = await params;
  const quote = getPublicQuoteByCode(code);

  if (!quote) {
    notFound();
  }

  return <PenawaranClient quote={quote} />;
}
