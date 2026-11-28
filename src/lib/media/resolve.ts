import manifest from './manifest.json';

export interface MediaEntry {
  width: number;
  height: number;
  kind: 'photo' | 'illustration' | 'brand';
  alt: string;
  /** Kosong untuk vektor. */
  blurDataURL: string;
  source: string;
}

export const MEDIA_MANIFEST = manifest as Record<string, MediaEntry>;

/** Ilustrasi terakhir bila foto dan sampul cadangan tidak bisa dimuat. */
export const FALLBACK_ART = '/images/kss-pc-blueprint.svg';

/** Urutan yang dicoba: foto, lalu sampul cadangan. Nilai kosong dan duplikat dibuang. */
export function mediaCandidates(...sources: (string | null | undefined)[]): string[] {
  return [...new Set(sources.filter((src): src is string => Boolean(src)))];
}

export function mediaBlur(src: string): string | undefined {
  return MEDIA_MANIFEST[src]?.blurDataURL || undefined;
}
