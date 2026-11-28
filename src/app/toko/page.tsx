import type { Metadata } from 'next';
import { TokoView } from '@/components/toko/TokoView';

export const metadata: Metadata = {
  title: 'Toko KSS Komputer',
  description: 'Produk toko KSS Komputer di Tokopedia yang sudah terjual dan punya rating.',
  alternates: { canonical: '/toko' },
};

export default function TokoPage() {
  return <TokoView />;
}
