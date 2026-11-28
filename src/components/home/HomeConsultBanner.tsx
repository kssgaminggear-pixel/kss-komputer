import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { SlotImage } from '@/components/ui/SlotImage';
import { DEFAULT_WHATSAPP_PHONE } from '@/lib/format';

/** Banner dua kolom; di HP gambar berada di atas teks. */
export function HomeConsultBanner() {
  return (
    <section
      id="konsultasi-budget"
      aria-labelledby="judul-konsultasi"
      className="mx-2 mt-3 scroll-mt-20 rounded-lg bg-block-steel py-5 text-ink md:mx-3 md:rounded-xl lg:py-14"
    >
      <div className="kss-container grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:order-2">
          <SlotImage slot="home.konsultasi" sizes="(max-width: 1023px) 100vw, 592px" />
        </div>
        <div className="flex flex-col items-center pb-4 text-center lg:pb-0">
          <p className="kss-eyebrow">Konsultasi gratis</p>
          <h2
            id="judul-konsultasi"
            className="mt-3 max-w-[14ch] text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-balance"
          >
            Belum yakin spesifikasinya?
          </h2>
          <p className="mt-4 max-w-[42ch] text-body text-ink-soft">
            Tanpa biaya konsultasi. Penawaran resmi dengan satu harga total.
          </p>
          <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href="/konsultasi" className="kss-btn-primary h-12 px-6 text-sm">
              Mulai konsultasi
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-dark h-12 px-6 text-sm"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              Chat WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
