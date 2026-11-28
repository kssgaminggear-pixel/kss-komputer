'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { SlotImage } from '@/components/ui/SlotImage';
import { Price } from '@/components/ui/Price';
import { getSlot } from '@/lib/media/slots';
import type { ServicePackage } from '@/lib/types';

export type ShelfService = Pick<ServicePackage, 'slug' | 'title' | 'duration' | 'price' | 'badge'>;

const SELECTED_BADGE = 'Paling Dicari';
const ARROW =
  'inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-opacity disabled:opacity-35';

/** Rak geser tanpa putar otomatis: sentuh/scroll biasa, ditambah panah dan titik halaman. */
export function HomeServiceShelf({ services }: { services: ShelfService[] }) {
  const rack = useRef<HTMLUListElement>(null);
  const [view, setView] = useState({ pages: 1, page: 0, atStart: true, atEnd: false });

  useEffect(() => {
    const element = rack.current;
    if (!element) return;
    const measure = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const pages = Math.max(1, Math.ceil((scrollWidth - 4) / clientWidth));
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 4;
      const page = atEnd ? pages - 1 : Math.min(pages - 1, Math.round(scrollLeft / clientWidth));
      setView({ pages, page, atStart: scrollLeft <= 4, atEnd });
    };
    // ResizeObserver juga memanggil measure sekali saat mulai mengamati.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', measure);
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const element = rack.current;
    const card = element?.firstElementChild as HTMLElement | null;
    if (element && card) element.scrollBy({ left: direction * (card.offsetWidth + 16) });
  };

  return (
    <section aria-labelledby="rak-jasa" className="kss-block-clay kss-wave-top mt-3.5 py-12 md:mt-6 lg:py-20">
      <div className="kss-container">
        <div className="flex items-end justify-between gap-4">
          <h2 id="rak-jasa" className="text-h2 text-ink">
            Pilih layanan
          </h2>
          <div className="hidden gap-2 sm:flex">
            <button type="button" aria-label="Layanan sebelumnya" disabled={view.atStart} onClick={() => step(-1)} className={ARROW}>
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Layanan berikutnya" disabled={view.atEnd} onClick={() => step(1)} className={ARROW}>
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ul
          ref={rack}
          className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-3 [scrollbar-width:none] motion-safe:scroll-smooth sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service) => (
            <li
              key={service.slug}
              className={`kss-card-float w-[17.5rem] shrink-0 snap-start overflow-hidden md:w-80 ${
                service.badge === SELECTED_BADGE ? 'kss-ring-selected' : ''
              }`}
            >
              <Link href={`/jasa/${service.slug}`} className="flex h-full flex-col">
                <ShelfMedia slug={service.slug} />
                <span className="flex flex-1 flex-col p-4">
                  <span className="flex min-h-5 flex-wrap items-center gap-2">
                    {service.badge && (
                      <span className={`kss-tag ${service.badge === SELECTED_BADGE ? 'kss-tag-accent' : 'kss-tag-neutral'}`}>
                        {service.badge}
                      </span>
                    )}
                    <span className="kss-label text-zinc-500">{service.duration}</span>
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold leading-snug text-ink">{service.title}</h3>
                  <span className="mt-auto block pt-4">
                    <span className="kss-label block text-zinc-500">Biaya jasa mulai</span>
                    {service.price === 0 ? (
                      <span className="kss-price text-xl text-ink">Gratis</span>
                    ) : (
                      <Price value={service.price} className="text-xl text-ink" />
                    )}
                  </span>
                  <span className="kss-btn-dark mt-4 w-full">Lihat detail</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {view.pages > 1 && (
          <div className="mt-3 flex justify-center gap-1">
            {Array.from({ length: view.pages }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Halaman layanan ${index + 1} dari ${view.pages}`}
                aria-current={index === view.page ? 'true' : undefined}
                onClick={() => rack.current?.scrollTo({ left: index * rack.current.clientWidth })}
                className="inline-flex h-6 min-w-6 items-center justify-center"
              >
                <span className={`block h-2 rounded-full ${index === view.page ? 'w-5 bg-ink' : 'w-2 bg-ink/30'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Urutan gambar: cutout khusus, lalu ilustrasi layanan, lalu ikon bila belum ada gambar. */
function ShelfMedia({ slug }: { slug: string }) {
  const slot = [`jasa.${slug}.cutout`, `jasa.${slug}`].find((id) => getSlot(id));
  return (
    <span className="relative flex aspect-[4/3] items-center justify-center bg-shape-clay">
      {slot ? (
        <SlotImage slot={slot} sizes="(min-width: 768px) 320px, 280px" />
      ) : (
        <Wrench aria-hidden className="h-10 w-10 text-ink/55" strokeWidth={1.5} />
      )}
    </span>
  );
}
