'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Pause, Play } from 'lucide-react';
import { SlotImage } from '@/components/ui/SlotImage';
import { Price } from '@/components/ui/Price';

export interface HeroSlide {
  slug: string;
  tab: string;
  slot: string;
  title: string;
  summary: string;
  duration: string;
  priceFrom: number;
  chatUrl: string;
}

const SLIDE_MS = 7000;
const SWIPE_PX = 40;
const REDUCED = '(prefers-reduced-motion: reduce)';

function subscribeMotion(notify: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

/** Di server dianggap mengurangi gerak, sehingga tidak ada animasi sebelum hydration. */
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED).matches,
    () => true
  );

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  // Gambar slide lain baru dipasang setelah browser senggang agar tidak bersaing dengan LCP.
  const [allImages, setAllImages] = useState(false);
  const reducedMotion = useReducedMotion();
  const swipeStart = useRef<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const load = () => setAllImages(true);
    let idle = 0;
    let timer = 0;
    const schedule = () => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(load, { timeout: 3000 });
      else timer = setTimeout(load, 1500) as unknown as number;
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const total = slides.length;
  const autoplay = playing && !reducedMotion && total > 1;

  /** Pilihan manual menghentikan putar otomatis. */
  const choose = (next: number) => {
    setAllImages(true);
    setPlaying(false);
    setIndex((next + total) % total);
  };

  const onTabKey = (event: React.KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + total) % total;
    choose(next);
    tabs.current[next]?.focus();
  };

  const hold = {
    onPointerEnter: (event: React.PointerEvent) => event.pointerType === 'mouse' && setHeld(true),
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Layanan unggulan"
      className="relative mx-2 mt-2 h-[max(500px,calc(100svh-136px))] touch-pan-y overflow-hidden rounded-lg bg-block-ink md:mx-3 md:mt-3 md:h-[clamp(600px,calc(100svh-120px),820px)] md:rounded-xl"
      onPointerDown={(event) => {
        swipeStart.current = event.pointerType === 'mouse' ? null : event.clientX;
      }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return;
        const distance = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(distance) >= SWIPE_PX) choose(index + (distance < 0 ? 1 : -1));
      }}
    >
      {slides.map((slide, i) => {
        const active = i === index;
        const Title = i === 0 ? 'h1' : 'h2';
        return (
          <div
            key={slide.slug}
            id={`hero-slide-${i}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${total}: ${slide.tab}`}
            inert={!active}
            className={`absolute inset-0 transition-opacity duration-500 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            {(i === 0 || allImages) && (
              <SlotImage
                slot={slide.slot}
                sizes="(min-width: 1440px) 1416px, 100vw"
                lcp={i === 0}
                labelClassName="right-4 top-4 md:right-6 md:top-6"
              />
            )}
            {/* Scrim fungsional agar teks di atas foto tetap terbaca. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(0deg,rgb(20_20_20/0.94)_0%,rgb(20_20_20/0.82)_38%,rgb(20_20_20/0)_68%)] md:bg-[linear-gradient(90deg,rgb(20_20_20/0.9)_0%,rgb(20_20_20/0.72)_36%,rgb(20_20_20/0)_68%)]"
            />
            <div className="kss-container relative flex h-full flex-col justify-end pb-24 md:justify-center md:pb-20">
              <div className="max-w-[36rem]" {...hold}>
                <p className="text-body-sm font-semibold text-zinc-200">Service &amp; Assembly Center</p>
                <Title
                  data-hero-text
                  className="mt-3 max-w-[13ch] font-display text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-balance text-white"
                >
                  {slide.title}
                </Title>
                <p data-hero-text className="mt-4 hidden max-w-[48ch] text-body text-zinc-200 md:block">
                  {slide.summary}
                </p>
                <p data-hero-text className="mt-4 flex flex-wrap items-baseline gap-x-2 text-body-sm text-zinc-200">
                  <span>{slide.duration}</span>
                  <span aria-hidden>·</span>
                  {slide.priceFrom > 0 ? (
                    <span className="flex items-baseline gap-1.5">
                      Mulai <Price value={slide.priceFrom} className="text-[17px] text-white" />
                    </span>
                  ) : (
                    <span>Gratis</span>
                  )}
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link href={`/jasa/${slide.slug}`} className="kss-btn-primary h-12 px-6 text-sm">
                    Lihat layanan
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                  <a
                    href={slide.chatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kss-btn-outline-dark hidden h-12 border-white/50 px-6 text-sm text-white sm:inline-flex"
                  >
                    <MessageCircle aria-hidden className="h-4 w-4" />
                    Chat teknisi
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Dirapatkan ke kiri agar tidak tertutup tombol CS di kanan bawah; di HP tombol jeda di depan. */}
      {total > 1 && (
        <div className="kss-container pointer-events-none absolute inset-x-0 bottom-3 flex flex-row-reverse items-end justify-end gap-3 md:bottom-6 md:flex-row md:justify-start md:gap-4">
          <div className="pointer-events-auto grid w-[7.5rem] grid-cols-3 gap-2 md:w-[min(36rem,52vw)] md:gap-3">
            {slides.map((slide, i) => {
              const active = i === index;
              return (
                <button
                  key={slide.slug}
                  ref={(node) => {
                    tabs.current[i] = node;
                  }}
                  type="button"
                  aria-controls={`hero-slide-${i}`}
                  aria-current={active ? 'true' : undefined}
                  aria-label={slide.tab}
                  onClick={() => choose(i)}
                  onKeyDown={onTabKey}
                  className="flex min-h-11 flex-col justify-end gap-2 text-left"
                >
                  <span className={`hidden text-body-sm font-semibold md:block ${active ? 'text-white' : 'text-zinc-300'}`}>
                    {slide.tab}
                  </span>
                  <span className="block h-0.5 overflow-hidden bg-white/30">
                    {active && (
                      <span
                        data-hero-progress
                        className="block h-full origin-left bg-white"
                        style={
                          autoplay
                            ? {
                                animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
                                animationPlayState: held ? 'paused' : 'running',
                              }
                            : undefined
                        }
                        onAnimationEnd={() => setIndex((current) => (current + 1) % total)}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-auto flex shrink-0 gap-2">
            <button type="button" onClick={() => choose(index - 1)} aria-label="Slide sebelumnya" className={`${CONTROL} hidden md:inline-flex`}>
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </button>
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => {
                  setAllImages(true);
                  setPlaying((value) => !value);
                }}
                aria-label={playing ? 'Jeda putar otomatis' : 'Putar otomatis'}
                className={`${CONTROL} inline-flex`}
              >
                {playing ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
              </button>
            )}
            <button type="button" onClick={() => choose(index + 1)} aria-label="Slide berikutnya" className={`${CONTROL} hidden md:inline-flex`}>
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const CONTROL =
  'h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-ink/70 text-white transition-colors hover:border-white';
