'use client';

import React, { useState } from 'react';
import { getImageProps } from 'next/image';
import { MediaImage } from '@/components/ui/MediaImage';
import { getSlot, type MediaSlot } from '@/lib/media/slots';

export interface SlotImageProps {
  slot: string;
  /** Wajib: tanpa `sizes`, browser menganggap gambar selebar layar. */
  sizes: string;
  /** Hanya untuk satu gambar LCP per halaman. */
  lcp?: boolean;
}

/**
 * Gambar yang bisa diganti lewat src/lib/media/slots.json. Mengisi induknya
 * (induk wajib `relative` dan berasio tetap). Ilustrasi selalu diberi label.
 */
export function SlotImage({ slot: id, sizes, lcp = false }: SlotImageProps) {
  const slot = getSlot(id);
  return (
    <>
      {slot?.mobile ? (
        <ArtDirected slot={slot} mobile={slot.mobile} sizes={sizes} lcp={lcp} />
      ) : (
        <PositionedImage slot={slot} sizes={sizes} lcp={lcp} />
      )}
      {slot?.kind === 'illustration' && (
        <span aria-hidden className="kss-tag kss-tag-on-dark absolute left-2 top-2">
          Ilustrasi
        </span>
      )}
    </>
  );
}

function PositionedImage({ slot, sizes, lcp }: { slot?: MediaSlot; sizes: string; lcp: boolean }) {
  return (
    <span
      className="absolute inset-0 block bg-zinc-900 [&_img]:[object-position:var(--focus)]"
      style={{ '--focus': slot?.focus?.desktop ?? '50% 50%' } as React.CSSProperties}
    >
      <MediaImage src={slot?.desktop} fallbackSrc={slot?.fallback} alt={slot?.alt ?? ''} sizes={sizes} lcp={lcp} />
    </span>
  );
}

/** Gambar berbeda untuk layar sempit lewat <picture> (docs Next: Art direction). */
function ArtDirected({ slot, mobile, sizes, lcp }: { slot: MediaSlot; mobile: string; sizes: string; lcp: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <PositionedImage slot={{ ...slot, desktop: slot.fallback ?? '' }} sizes={sizes} lcp={lcp} />;

  const common = { alt: slot.alt, sizes, fill: true } as const;
  const { props: small } = getImageProps({ ...common, src: mobile });
  const { props: large } = getImageProps({ ...common, src: slot.desktop });

  return (
    <span
      className="absolute inset-0 block bg-zinc-900"
      style={
        {
          '--focus': slot.focus?.desktop ?? '50% 50%',
          '--focus-mobile': slot.focus?.mobile ?? '50% 50%',
        } as React.CSSProperties
      }
    >
      <picture>
        <source media="(max-width: 767px)" srcSet={small.srcSet} sizes={sizes} />
        <img
          {...large}
          alt={slot.alt}
          loading={lcp ? 'eager' : 'lazy'}
          fetchPriority={lcp ? 'high' : 'auto'}
          onError={() => setFailed(true)}
          className="object-cover [object-position:var(--focus-mobile)] md:[object-position:var(--focus)]"
        />
      </picture>
    </span>
  );
}
