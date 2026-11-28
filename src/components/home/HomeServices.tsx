import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SlotImage } from '@/components/ui/SlotImage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Price } from '@/components/ui/Price';
import type { ServicePackage } from '@/lib/types';

export function HomeServices({ services }: { services: ServicePackage[] }) {
  return (
    <section className="kss-section-alt">
      <div className="kss-container">
        <SectionHeader
          eyebrow="Layanan teknisi"
          title="Jasa rakit, servis & maintenance"
          action={{ href: '/jasa', label: 'Semua layanan' }}
        />
        <ul className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {services.map((service) => (
            <li key={service.id} className="kss-card kss-card-hover overflow-hidden">
              <Link href={`/jasa/${service.slug}`} className="group flex h-full flex-col">
                <span className="relative block aspect-[4/3]">
                  <SlotImage
                    slot={`jasa.${service.slug}`}
                    sizes="(max-width: 1023px) 50vw, 304px"
                  />
                </span>
                <span className="flex flex-1 flex-col p-3 sm:p-4">
                  <span className="kss-label text-zinc-500">{service.duration}</span>
                  <h3 className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-950 sm:text-title">
                    {service.title}
                  </h3>
                  <span className="mt-auto flex items-end justify-between pt-4">
                    <span>
                      <span className="kss-label block text-zinc-500">Biaya jasa</span>
                      {service.price === 0 ? (
                        <span className="kss-price text-lg text-zinc-950">Gratis</span>
                      ) : (
                        <Price value={service.price} className="text-lg text-zinc-950" />
                      )}
                    </span>
                    <ArrowUpRight aria-hidden className="h-4 w-4 text-zinc-400 group-hover:text-orange-600" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
