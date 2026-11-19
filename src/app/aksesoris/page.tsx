import type { Metadata } from 'next';
import AksesorisClient from './AksesorisClient';
import { getPublicAccessories } from '@/lib/server-catalog';

export const metadata: Metadata = {
  title: 'Aksesoris & Gaming Gear — KSS Komputer',
  description:
    'Aksesoris pendukung PC dan gaming gear bergaransi resmi: monitor, keyboard, mouse, headset, dan lainnya di KSS Komputer.',
  alternates: {
    canonical: '/aksesoris',
  },
};

export default function AksesorisPage() {
  return <AksesorisClient accessories={getPublicAccessories()} />;
}
