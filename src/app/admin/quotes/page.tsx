import type { Metadata } from 'next';
import { MOCK_CONSULTATION_QUOTES, MOCK_HARDWARE_PARTS } from '@/lib/mock-data';
import AdminQuotesClient from './AdminQuotesClient';

export const metadata: Metadata = {
  title: 'Admin Quotation — KSS Komputer',
  robots: { index: false, follow: false },
  alternates: { canonical: '/admin/quotes' },
};

export default function AdminQuotesPage() {
  return (
    <AdminQuotesClient
      parts={MOCK_HARDWARE_PARTS}
      seedQuoteData={MOCK_CONSULTATION_QUOTES}
    />
  );
}
