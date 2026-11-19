import type { Metadata } from 'next';
import SimulasiClient from './SimulasiClient';
import { getPublicHardwareParts } from '@/lib/server-catalog';

export const metadata: Metadata = {
  title: 'Simulasi Rakit PC & Cek Kompatibilitas — KSS Komputer',
  description:
    'Rakit PC sendiri dengan validasi kompatibilitas deterministik: socket, chipset, daya PSU, dan ukuran casing diperiksa sebelum checkout.',
  alternates: {
    canonical: '/simulasi',
  },
};

export default function SimulasiPage() {
  return <SimulasiClient parts={getPublicHardwareParts()} />;
}
