import type { Metadata } from 'next';
import PaketRakitanClient from './PaketRakitanClient';
import { getPublicPrebuilts } from '@/lib/server-catalog';

export const metadata: Metadata = {
  title: 'Paket PC Rakitan Siap Pakai — KSS Komputer',
  description:
    'Paket PC gaming, workstation, office, dan AI dengan satu harga total. Sudah dirakit, cable management, stress test, dan bergaransi toko KSS Komputer.',
  alternates: {
    canonical: '/paket-rakitan',
  },
};

export default function PaketRakitanPage() {
  return <PaketRakitanClient packages={getPublicPrebuilts()} />;
}
