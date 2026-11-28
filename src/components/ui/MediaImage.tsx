'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FALLBACK_ART, mediaBlur, mediaCandidates } from '@/lib/media/resolve';

export interface MediaImageProps {
  src?: string | null;
  /** Sampul cadangan sebelum jatuh ke ilustrasi. */
  fallbackSrc?: string;
  alt: string;
  /** Wajib: tanpa `sizes`, browser menganggap gambar selebar layar. */
  sizes: string;
  className?: string;
  /** Label di atas ilustrasi cadangan. Kosongkan untuk thumbnail kecil. */
  fallbackLabel?: string;
  /** Hanya untuk satu gambar LCP per halaman. */
  lcp?: boolean;
}

/**
 * Gambar yang mengisi induknya (induk wajib `relative` dan berasio tetap).
 * Tidak pernah meninggalkan kotak kosong atau ikon gambar rusak.
 */
export function MediaImage(props: MediaImageProps) {
  // key mereset hitungan gagal saat sumber berganti.
  return <MediaImageInner key={`${props.src ?? ''}|${props.fallbackSrc ?? ''}`} {...props} />;
}

function MediaImageInner({
  src,
  fallbackSrc,
  alt,
  sizes,
  className = 'object-cover',
  fallbackLabel,
  lcp = false,
}: MediaImageProps) {
  const [failed, setFailed] = useState(0);
  const current = mediaCandidates(src, fallbackSrc)[failed];
  const loading = lcp ? ({ loading: 'eager', fetchPriority: 'high' } as const) : {};

  if (!current) {
    return (
      <span data-media-fallback className="absolute inset-0 block bg-zinc-900">
        <Image
          src={FALLBACK_ART}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          className={`object-contain ${fallbackLabel ? 'pb-6' : ''}`}
          {...loading}
        />
        {fallbackLabel && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-1.5 truncate px-2 text-center font-mono text-micro uppercase text-zinc-400"
          >
            {fallbackLabel}
          </span>
        )}
      </span>
    );
  }

  const blur = mediaBlur(current);

  return (
    <Image
      key={current}
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      placeholder={blur ? 'blur' : 'empty'}
      blurDataURL={blur}
      onError={() => setFailed((count) => count + 1)}
      {...loading}
    />
  );
}
