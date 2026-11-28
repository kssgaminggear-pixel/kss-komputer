import slots from './slots.json';

export interface MediaSlot {
  desktop: string;
  /** Dipakai di layar < 768px. */
  mobile?: string;
  alt: string;
  kind: 'photo' | 'illustration';
  /** Nilai object-position. */
  focus?: { desktop?: string; mobile?: string };
  /** Lebar tampil terbesar (px CSS); dipakai `npm run media:check`. */
  maxCssWidth?: number;
  /** Foto asli cadangan; kosong berarti jatuh ke gambar cadangan bawaan. */
  fallback?: string;
}

const SLOTS = slots as Record<string, MediaSlot>;

/**
 * Satu-satunya pintu gambar yang bisa diganti. Semua kode memanggil fungsi ini
 * agar nanti sumbernya bisa dipindah ke database panel admin tanpa mengubah komponen.
 */
export function getSlot(id: string): MediaSlot | undefined {
  return SLOTS[id];
}
