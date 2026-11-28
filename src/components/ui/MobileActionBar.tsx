'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Bar aksi yang menempel di atas menu bawah pada layar HP. Menghilang saat elemen
 * `hideNear` (misalnya formulir) terlihat agar tidak menutupinya.
 * Jarak tombol CS dan ruang bawah halaman diatur lewat [data-action-bar-active] di globals.css.
 */
export function MobileActionBar({ hideNear, children }: { hideNear?: string; children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  // Penanda dipasang hanya selama halaman ini tampil; efek dibersihkan saat halaman disembunyikan.
  useEffect(() => {
    const element = bar.current;
    if (!element || hidden) return;
    element.setAttribute('data-action-bar-active', '');
    return () => element.removeAttribute('data-action-bar-active');
  }, [hidden]);

  useEffect(() => {
    const target = hideNear ? document.getElementById(hideNear) : null;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting));
    observer.observe(target);
    return () => observer.disconnect();
  }, [hideNear]);

  return (
    <div
      ref={bar}
      data-action-bar
      hidden={hidden}
      className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-white px-4 py-2 md:hidden print:hidden"
    >
      <div className="flex items-center justify-between gap-3">{children}</div>
    </div>
  );
}
