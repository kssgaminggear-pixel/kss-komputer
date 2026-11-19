import type { Metadata } from 'next';
import KomponenClient from './KomponenClient';
import { getPublicHardwareParts } from '@/lib/server-catalog';

export const metadata: Metadata = {
  title: 'Katalog Komponen PC — KSS Komputer',
  description:
    'Daftar komponen PC yang tersedia untuk paket rakitan KSS: prosesor, motherboard, RAM, GPU, SSD, PSU, casing, dan cooler.',
  alternates: {
    canonical: '/komponen',
  },
};

export default function KomponenPage() {
  return <KomponenClient parts={getPublicHardwareParts()} />;
}
