import type { Metadata } from 'next';
import { MOCK_HARDWARE_PARTS } from '@/lib/mock-data';
import AdminPricingClient from './AdminPricingClient';

/**
 * Server Component: harga modal hanya dikirim ke client admin lewat props,
 * tidak pernah ikut bundle halaman publik.
 */
export const metadata: Metadata = {
  title: 'Admin Pricing — KSS Komputer',
  robots: { index: false, follow: false },
  alternates: { canonical: '/admin/pricing' },
};

export default function AdminPricingPage() {
  return <AdminPricingClient parts={MOCK_HARDWARE_PARTS} />;
}
