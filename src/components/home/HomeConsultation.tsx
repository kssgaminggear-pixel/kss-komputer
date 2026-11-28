import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { SlotImage } from '@/components/ui/SlotImage';
import { DEFAULT_WHATSAPP_PHONE } from '@/lib/format';

const POINTS = [
  'Tanpa biaya konsultasi',
  'Rekomendasi bebas bottleneck',
  'Penawaran resmi, satu harga total',
  'Bisa lanjut rakit atau beli komponen saja',
];

export function HomeConsultation() {
  return (
    <section id="konsultasi-budget" className="kss-section scroll-mt-20">
      <div className="kss-container">
        <div className="grid grid-cols-1 overflow-hidden rounded-md border border-zinc-200 bg-white lg:grid-cols-12">
          <div className="relative aspect-video lg:col-span-7 lg:aspect-auto lg:min-h-[400px]">
            <SlotImage slot="home.konsultasi" sizes="(max-width: 1023px) 100vw, 709px" />
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-8 lg:col-span-5">
            <p className="kss-eyebrow">
              <span aria-hidden className="h-1.5 w-1.5 bg-orange-600" />
              Konsultasi gratis
            </p>
            <h2 className="mt-3 text-h2 text-balance text-zinc-950">Belum yakin spesifikasinya?</h2>
            <ul className="mt-5 space-y-2.5">
              {POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 text-body-sm text-zinc-800">
                  <Check aria-hidden className="h-4 w-4 shrink-0 text-zinc-900" />
                  {point}
                </li>
              ))}
            </ul>
            <Link href="/konsultasi" className="kss-btn-primary mt-6 h-11 w-full px-5 text-sm sm:w-fit">
              Mulai konsultasi
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-link mt-4 inline-flex items-center gap-2 text-body-sm"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              Butuh jawaban cepat? Chat teknisi
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
