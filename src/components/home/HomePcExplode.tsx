'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { MediaImage } from '@/components/ui/MediaImage';
import { Price } from '@/components/ui/Price';
import type { SceneHandle, SceneMode } from '@/components/three/PcExplodeScene';

export interface ExplodeTab {
  mode: SceneMode;
  tab: string;
  slug: string;
  title: string;
  summary: string;
  priceFrom: number;
}

const REDUCED = '(prefers-reduced-motion: reduce)';

interface DeviceHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/** 3D hanya untuk perangkat yang mampu dan pengguna yang tidak membatasi gerak atau data. */
function canRun3d(): boolean {
  const hints = navigator as Navigator & DeviceHints;
  if (window.matchMedia(REDUCED).matches || hints.connection?.saveData) return false;
  if ((hints.deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency || 8) < 4) return false;
  return Boolean(document.createElement('canvas').getContext('webgl2'));
}

function subscribe(notify: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

let supported: boolean | undefined;
/** Hasil disimpan agar konteks WebGL percobaan tidak dibuat berulang. */
const getSupport = () => {
  if (window.matchMedia(REDUCED).matches) return false;
  supported ??= canRun3d();
  return supported;
};

export function HomePcExplode({ tabs }: { tabs: ExplodeTab[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<'poster' | 'ready' | 'failed'>('poster');
  const enabled = useSyncExternalStore(subscribe, getSupport, () => false);
  const stage = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const scene = useRef<SceneHandle | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const latest = useRef({ mode: tabs[0].mode, paused: false });
  const active = tabs[index];

  useEffect(() => {
    latest.current = { mode: active.mode, paused };
    scene.current?.setMode(active.mode);
  }, [active.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    latest.current.paused = paused;
    scene.current?.setPaused(paused);
  }, [paused]);

  // Pustaka 3D baru diunduh saat bagian ini mendekati layar, setelah halaman selesai dimuat.
  useEffect(() => {
    const target = stage.current;
    const host = canvasHost.current;
    if (!enabled || !target || !host) return;
    let cancelled = false;
    let idle = 0;
    let canvas: HTMLCanvasElement | null = null;

    const start = async () => {
      try {
        const { createPcScene } = await import('@/components/three/PcExplodeScene');
        if (cancelled) return;
        canvas = document.createElement('canvas');
        canvas.className = 'h-full w-full cursor-grab touch-pan-y active:cursor-grabbing';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.addEventListener('webglcontextlost', () => setStatus('failed'));
        host.appendChild(canvas);
        scene.current = createPcScene(canvas, latest.current.mode, () => setStatus('ready'));
        scene.current.setPaused(latest.current.paused);
      } catch {
        if (!cancelled) setStatus('failed');
      }
    };

    const schedule = () => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => void start(), { timeout: 2000 });
      else void start();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (document.readyState === 'complete') schedule();
        else window.addEventListener('load', schedule, { once: true });
      },
      { rootMargin: '300px' }
    );
    observer.observe(target);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener('load', schedule);
      if (idle) window.cancelIdleCallback(idle);
      scene.current?.dispose();
      scene.current = null;
      canvas?.remove();
      setStatus('poster');
    };
  }, [enabled]);

  const onTabKey = (event: React.KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + tabs.length) % tabs.length;
    setIndex(next);
    buttons.current[next]?.focus();
  };

  const live = enabled && status === 'ready';

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
          <div ref={stage} data-bedah-stage data-state={live ? '3d' : 'poster'} className="relative aspect-[4/3] w-full">
            {!live && (
              <MediaImage
                src={`/images/3d/ilu-bedah-pc-${active.mode}.webp`}
                alt={`Ilustrasi model 3D PC: ${active.tab}`}
                sizes="(min-width: 1024px) 700px, 100vw"
                className="object-contain"
              />
            )}
            <div ref={canvasHost} className={`absolute inset-0 ${live ? '' : 'opacity-0'}`} />
            <span data-bedah-overlay className="kss-tag kss-tag-on-dark absolute left-2 top-2">
              Ilustrasi 3D
            </span>
            {live && (
              <button
                data-bedah-overlay
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? 'Putar animasi model' : 'Jeda animasi model'}
                className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-ink/70 text-white hover:border-white"
              >
                {paused ? <Play aria-hidden className="h-4 w-4" /> : <Pause aria-hidden className="h-4 w-4" />}
              </button>
            )}
          </div>
          {live && <p className="mt-2 text-center text-meta text-zinc-400">Geser model untuk memutar.</p>}
        </div>
      </div>
    </section>
  );
}
