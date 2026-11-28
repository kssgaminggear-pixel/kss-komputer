import type { Metadata } from 'next';
import CekPesananClient from './CekPesananClient';
import { getPublicBuildTrackings } from '@/lib/server-catalog';

export const metadata: Metadata = {
  title: 'Contoh Pelacakan Pesanan — KSS Komputer',
  // Masih memakai data contoh; jangan diindeks sampai data asli tersedia.
  robots: { index: false, follow: true },
  description:
    'Contoh tampilan pelacakan tahapan perakitan PC KSS Komputer: persiapan komponen, perakitan, stress test, QC final, hingga siap diambil.',
  alternates: {
    canonical: '/cek-pesanan',
  },
};

export default function CekPesananPage() {
  return <CekPesananClient trackings={getPublicBuildTrackings()} />;
}
