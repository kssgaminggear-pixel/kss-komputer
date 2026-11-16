import { notFound } from 'next/navigation';
import PenawaranClient from './PenawaranClient';
import { getPublicQuoteByCode, getPublicQuoteCodes } from '@/lib/server-catalog';

interface PenawaranPageProps {
  params: Promise<{ code: string }>;
}

export function generateStaticParams() {
  return getPublicQuoteCodes().map((code) => ({ code }));
}

export default async function PenawaranPage({ params }: PenawaranPageProps) {
  const { code } = await params;
  const quote = getPublicQuoteByCode(code);

  if (!quote) {
    notFound();
  }

  return <PenawaranClient quote={quote} />;
}
