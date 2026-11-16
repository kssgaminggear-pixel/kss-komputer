import type { Metadata } from 'next';
import KonsultasiClient from './KonsultasiClient';
import { getPublicPrebuilts, getPublicServices } from '@/lib/server-catalog';

export const metadata: Metadata = {
  title: 'Konsultasi Rakit & Servis PC Sesuai Budget — KSS Komputer',
  description:
    'Wizard konsultasi 5 langkah: pilih tujuan, budget, kebutuhan, preferensi, lalu dapatkan rekomendasi paket dan kirim kebutuhan via WhatsApp.',
};

export default function KonsultasiPage() {
  return (
    <KonsultasiClient
      prebuilts={getPublicPrebuilts()}
      services={getPublicServices()}
    />
  );
}
