import React from 'react';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { SlotImage } from '@/components/ui/SlotImage';
import { SERVICE_FAQS } from '@/lib/faq';

const TILES = [
  'jasa.rakit-pc-custom',
  'jasa.rakit-pc-cable-management-premium',
  'jasa.deep-cleaning-repaste',
  'jasa.upgrade-ssd-nvme',
];

/** Kisi papan catur: kartu tanya jawab berselang-seling dengan ubin ilustrasi (ubin hanya di layar lebar). */
export function HomeFaqMosaic() {
  const cells = SERVICE_FAQS.slice(0, 4).flatMap((faq, index) => {
    const question = <Question key={faq.q} question={faq.q} answer={faq.a} />;
    const tile = <Tile key={TILES[index]} slot={TILES[index]} />;
    // Baris kedua (indeks 2 dan 3) dimulai dengan gambar.
    return index < 2 ? [question, tile] : [tile, question];
  });

  return (
    <section aria-labelledby="judul-faq" className="mt-3 bg-paper-deep py-12 lg:py-20">
      <div className="kss-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="judul-faq" className="text-h2 text-ink">
            Pertanyaan yang sering muncul
          </h2>
          <Link href="/jasa#faq" className="kss-btn-outline">
            Semua pertanyaan
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid items-start gap-3 lg:grid-cols-4">{cells}</div>
      </div>
    </section>
  );
}

function Question({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group h-full rounded-lg bg-white open:h-auto lg:min-h-full">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg p-5 [&::-webkit-details-marker]:hidden lg:min-h-48 lg:flex-col lg:justify-between">
        <span className="font-display text-lg font-bold leading-snug text-ink lg:text-xl">{question}</span>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white">
          <Plus aria-hidden className="h-4 w-4 transition-transform group-open:rotate-45" />
        </span>
      </summary>
      <p className="px-5 pb-5 text-body-sm text-ink-soft">{answer}</p>
    </details>
  );
}

function Tile({ slot }: { slot: string }) {
  return (
    <div className="relative hidden h-full min-h-48 overflow-hidden rounded-lg lg:block">
      <SlotImage slot={slot} sizes="304px" />
    </div>
  );
}
