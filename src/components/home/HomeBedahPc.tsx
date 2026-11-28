import React from 'react';
import { HomePcExplode, type ExplodeTab } from '@/components/home/HomePcExplode';
import type { SceneMode } from '@/components/three/PcExplodeScene';
import type { ServicePackage } from '@/lib/types';

const TABS: Array<{ mode: SceneMode; tab: string; slug: string }> = [
  { mode: 'rakit', tab: 'Rakit', slug: 'rakit-pc-custom' },
  { mode: 'cleaning', tab: 'Cleaning', slug: 'deep-cleaning-repaste' },
  { mode: 'upgrade', tab: 'Upgrade', slug: 'upgrade-ssd-nvme' },
];

const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/u)?.[0] ?? text;

/** Teks tiap tab berasal dari data layanan; slug yang tidak ada dilewati. */
export function HomeBedahPc({ services }: { services: ServicePackage[] }) {
  const tabs: ExplodeTab[] = TABS.flatMap((config) => {
    const service = services.find((item) => item.slug === config.slug && item.isActive);
    if (!service) return [];
    return [
      {
        ...config,
        title: service.title,
        summary: firstSentence(service.description),
        priceFrom: service.price,
      },
    ];
  });

  return tabs.length ? <HomePcExplode tabs={tabs} /> : null;
}
