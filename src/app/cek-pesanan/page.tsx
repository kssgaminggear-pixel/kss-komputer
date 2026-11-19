import type { Metadata } from 'next';
import CekPesananClient from './CekPesananClient';
import { getPublicBuildTrackings } from '@/lib/server-catalog';

export const metadata: Metadata = {
  title: 'Cek Status Pesanan & Perakitan — KSS Komputer',
  description:
    'Lacak tahapan perakitan PC KSS Komputer dengan kode order: persiapan komponen, perakitan, stress test, QC final, hingga siap diambil.',
  alternates: {
    canonical: '/cek-pesanan',
  },
};

export default function CekPesananPage() {
  return <CekPesananClient trackings={getPublicBuildTrackings()} />;
}
