'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PcStage } from '@/components/three/PcStage';
import { Price } from '@/components/ui/Price';
import type { SceneMode } from '@/components/three/PcExplodeScene';

export interface ExplodeTab {
  mode: SceneMode;
  tab: string;
  slug: string;
  title: string;
  summary: string;
  priceFrom: number;
}

export function HomePcExplode({ tabs }: { tabs: ExplodeTab[] }) {
  const [index, setIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const active = tabs[index];

  const onTabKey = (event: React.KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + tabs.length) % tabs.length;
    setIndex(next);
    buttons.current[next]?.focus();
  };

  return (
    <section
      aria-labelledby="judul-bedah"
      className="mx-2 mb-4 mt-3 rounded-lg bg-block-ink py-10 text-zinc-100 md:mx-3 md:mb-6 md:rounded-xl lg:py-16"
    >
      <div className="kss-container grid gap-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <h2 id="judul-bedah" className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
            Bedah PC
          </h2>
          <p className="mt-2 text-body text-zinc-300">Lihat bagian yang kami kerjakan di tiap layanan.</p>

          <div role="tablist" aria-label="Layanan pada model PC" className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab, i) => (
              <button
                key={tab.mode}
                ref={(node) => {
                  buttons.current[i] = node;
                }}
                type="button"
                role="tab"
                id={`bedah-tab-${tab.mode}`}
                aria-selected={i === index}
                aria-controls="bedah-panel"
                tabIndex={i === index ? 0 : -1}
                onClick={() => setIndex(i)}
                onKeyDown={onTabKey}
                className={`inline-flex h-11 items-center rounded-full border px-5 text-[13px] font-semibold transition-colors ${
                  i === index ? 'border-white bg-white text-ink' : 'border-white/30 text-white hover:border-white'
                }`}
              >
                {tab.tab}
              </button>
            ))}
          </div>

          <div id="bedah-panel" role="tabpanel" aria-labelledby={`bedah-tab-${active.mode}`} className="mt-6 min-h-52">
            <h3 className="font-display text-xl font-bold text-white">{active.title}</h3>
            <p className="mt-2 max-w-[46ch] text-body-sm text-zinc-300">{active.summary}</p>
            <p className="mt-3 flex items-baseline gap-1.5 text-body-sm text-zinc-300">
              {active.priceFrom > 0 ? (
                <>
                  Biaya jasa mulai <Price value={active.priceFrom} className="text-lg text-white" />
                </>
              ) : (
                'Gratis'
              )}
            </p>
            <Link href={`/jasa/${active.slug}`} className="kss-btn-outline-dark mt-5 h-11 border-white/40 px-5 text-white">
              Lihat layanan
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7">
          <PcStage mode={active.mode} label={active.tab} sizes="(min-width: 1024px) 700px, 100vw" />
        </div>
      </div>
    </section>
  );
}
