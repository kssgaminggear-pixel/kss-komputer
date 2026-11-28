'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaImage } from '@/components/ui/MediaImage';

export interface PromoBannerItem {
  id: string;
  image: string;
  alt: string;
  href: string;
}

/** Carousel tanpa autoplay. Satu banner tampil statis tanpa kontrol. */
export function PromoBanner({ banners }: { banners: PromoBannerItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (banners.length === 0) return null;
  const many = banners.length > 1;

  const go = (index: number) => {
    const next = (index + banners.length) % banners.length;
    const element = track.current;
    if (element) element.scrollTo({ left: next * element.clientWidth });
    setActive(next);
  };

  return (
    <section
      aria-roledescription={many ? 'carousel' : undefined}
      aria-label="Promo toko"
      className="mx-auto w-full max-w-5xl"
      onKeyDown={(event) => {
        if (!many) return;
        if (event.key === 'ArrowLeft') go(active - 1);
        if (event.key === 'ArrowRight') go(active + 1);
      }}
    >
      <div
        ref={track}
        onScroll={(event) => {
          const element = event.currentTarget;
          setActive(Math.round(element.scrollLeft / element.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-md border border-zinc-200 motion-safe:scroll-smooth"
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            role={many ? 'group' : undefined}
            aria-roledescription={many ? 'slide' : undefined}
            aria-label={many ? `${index + 1} dari ${banners.length}` : undefined}
            inert={index !== active}
            className="relative aspect-[2/1] w-full shrink-0 snap-center"
          >
            <Link href={banner.href} className="kss-focusable block h-full">
              <MediaImage
                src={banner.image}
                alt={banner.alt}
                lcp={index === 0}
                sizes="(min-width:1100px) 1024px, 100vw"
                fallbackLabel="Promo toko"
              />
            </Link>
          </div>
        ))}
      </div>

      {many && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button type="button" onClick={() => go(active - 1)} className="kss-icon-btn" aria-label="Banner sebelumnya">
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>
          <span className="kss-num text-meta text-zinc-500">
            {active + 1} / {banners.length}
          </span>
          <button type="button" onClick={() => go(active + 1)} className="kss-icon-btn" aria-label="Banner berikutnya">
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
