import React from 'react';
import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel';
import { DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import type { ServicePackage } from '@/lib/types';

/** Urutan slide: servis di depan karena Beranda berfokus pada jasa. */
const HERO_SLIDES = [
  { slug: 'service-troubleshoot-hardware', tab: 'Servis & troubleshoot', slot: 'home.hero.servis' },
  { slug: 'rakit-pc-custom', tab: 'Rakit PC custom', slot: 'home.hero.rakit' },
  { slug: 'deep-cleaning-repaste', tab: 'Perawatan & upgrade', slot: 'home.hero.rawat' },
];

const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/u)?.[0] ?? text;

export function HomeHeroServices({ services }: { services: ServicePackage[] }) {
  const slides: HeroSlide[] = HERO_SLIDES.flatMap((config) => {
    const service = services.find((item) => item.slug === config.slug);
    if (!service) return [];
    return [
      {
        ...config,
        title: service.title,
        summary: firstSentence(service.description),
        duration: service.duration,
        priceFrom: service.price,
        chatUrl: `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
          `Halo KSS Komputer, saya ingin booking layanan: *${service.title}*`
        )}`,
      },
    ];
  });

  return slides.length ? <HeroCarousel slides={slides} /> : null;
}
