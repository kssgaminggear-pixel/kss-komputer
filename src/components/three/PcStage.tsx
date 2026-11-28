'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Pause, Play } from 'lucide-react';
import { MediaImage } from '@/components/ui/MediaImage';
import type { SceneHandle, SceneMode } from '@/components/three/PcExplodeScene';

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

/** Panggung model PC di atas latar gelap: gambar cadangan lebih dulu, 3D menyusul bila didekati. */
export function PcStage({ mode, label, sizes }: { mode: SceneMode; label: string; sizes: string }) {
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<'poster' | 'ready' | 'failed'>('poster');
  const enabled = useSyncExternalStore(subscribe, getSupport, () => false);
  const stage = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const scene = useRef<SceneHandle | null>(null);
  const latest = useRef({ mode, paused: false });

  useEffect(() => {
    latest.current.mode = mode;
    scene.current?.setMode(mode);
  }, [mode]);

  useEffect(() => {
    latest.current.paused = paused;
    scene.current?.setPaused(paused);
  }, [paused]);

  // Pustaka 3D baru diunduh saat panggung mendekati layar, setelah halaman selesai dimuat.
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

  const live = enabled && status === 'ready';

  return (
    <>
      <div ref={stage} data-bedah-stage data-state={live ? '3d' : 'poster'} className="relative aspect-[4/3] w-full">
        {!live && (
          <MediaImage
            src={`/images/3d/ilu-bedah-pc-${mode}.webp`}
            alt={`Ilustrasi model 3D PC: ${label}`}
            sizes={sizes}
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
    </>
  );
}
