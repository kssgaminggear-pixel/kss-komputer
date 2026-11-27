import {
  MOCK_BUILD_TRACKINGS,
  MOCK_CONSULTATION_QUOTES,
  MOCK_HARDWARE_PARTS,
  MOCK_PREBUILT_PCS,
  MOCK_SERVICES,
  PARTS_BY_ID,
} from './mock-data';
import {
  BuildOrderTracking,
  PublicHardwarePart,
  ProductCategory,
  ServicePackage,
} from './types';
import {
  PublicPrebuiltDetailDTO,
  PublicPrebuiltPCDTO,
  sanitizeHardwarePartForPublic,
  sanitizePrebuiltDetailForPublic,
  sanitizePrebuiltPCForPublic,
  sanitizeQuoteForPublic,
} from './sanitizer';

/**
 * Katalog publik sisi server.
 *
 * HANYA boleh diimpor dari Server Component atau Route Handler.
 * Modul ini yang menjadi satu-satunya jembatan ke `mock-data.ts`
 * (yang berisi `costPrice`/`sellPrice`).
 */

export const UPGRADEABLE_CATEGORIES: ProductCategory[] = ['gpu', 'ram', 'ssd', 'cooler', 'case'];

export function getPublicHardwareParts(): PublicHardwarePart[] {
  return MOCK_HARDWARE_PARTS.map(sanitizeHardwarePartForPublic);
}

export function getPublicServices(): ServicePackage[] {
  return MOCK_SERVICES;
}

export function getPublicServiceBySlug(slug: string): ServicePackage | undefined {
  return MOCK_SERVICES.find((service) => service.slug === slug);
}

export function getPublicServiceSlugs(): string[] {
  return MOCK_SERVICES.map((service) => service.slug);
}

export function getPublicPrebuilts(): PublicPrebuiltPCDTO[] {
  return MOCK_PREBUILT_PCS.map((pkg) => sanitizePrebuiltPCForPublic(pkg, PARTS_BY_ID));
}

export function getPublicPrebuiltDetail(slug: string): PublicPrebuiltDetailDTO | undefined {
  const pkg = MOCK_PREBUILT_PCS.find((item) => item.slug === slug);
  if (!pkg) return undefined;

  return sanitizePrebuiltDetailForPublic(
    pkg,
    MOCK_HARDWARE_PARTS,
    PARTS_BY_ID,
    UPGRADEABLE_CATEGORIES
  );
}

export function getPublicBuildTrackings(): BuildOrderTracking[] {
  return MOCK_BUILD_TRACKINGS;
}

export function getPublicQuoteByCode(code: string) {
  const clean = code.trim().toUpperCase();
  const quote = MOCK_CONSULTATION_QUOTES.find(
    (item) => item.quoteCode.toUpperCase() === clean
  );
  return quote ? sanitizeQuoteForPublic(quote) : undefined;
}

export function getPublicQuoteCodes(): string[] {
  return MOCK_CONSULTATION_QUOTES.map((quote) => quote.quoteCode);
}
