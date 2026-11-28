'use client';

import React from 'react';
import { Wrench } from 'lucide-react';
import { SlotImage } from '@/components/ui/SlotImage';
import { getSlot } from '@/lib/media/slots';

/** Urutan gambar: cutout khusus, lalu ilustrasi layanan, lalu ikon bila belum ada gambar. */
export function ServiceMedia({ slug, sizes, lcp = false }: { slug: string; sizes: string; lcp?: boolean }) {
  const slot = [`jasa.${slug}.cutout`, `jasa.${slug}`].find((id) => getSlot(id));
  return (
    <span className="relative flex aspect-[4/3] items-center justify-center bg-shape-clay">
      {slot ? (
        <SlotImage slot={slot} sizes={sizes} lcp={lcp} />
      ) : (
        <Wrench aria-hidden className="h-10 w-10 text-ink/55" strokeWidth={1.5} />
      )}
    </span>
  );
}
