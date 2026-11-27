import {
  MOCK_ACCESSORIES,
  MOCK_BUILD_TRACKINGS,
  MOCK_CONSULTATION_QUOTES,
  MOCK_HARDWARE_PARTS,
  MOCK_PREBUILT_PCS,
  MOCK_SERVICES,
  PARTS_BY_ID,
} from './mock-data';
import {
  BuildOrderTracking,
  PublicAccessory,
  PublicHardwarePart,
  PartSearchEntry,
  ProductCategory,
  ServicePackage,
} from './types';
import { getProductSpecLabels } from '@/components/catalog/SpecBadges';
import {
  PublicPrebuiltDetailDTO,
  PublicPrebuiltPCDTO,
  sanitizeAccessoryForPublic,
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

export function getPartSearchEntries(): PartSearchEntry[] {
  return getPublicHardwareParts().map((part) => {
    const specLabels = getProductSpecLabels(part);
    return {
      id: part.id,
      slug: part.slug,
      sku: part.sku,
      name: part.name,
      brand: part.brand,
      category: part.category,
      stockStatus: part.stockStatus,
      specLabels: specLabels.slice(0, 4),
      keywords: [
        part.name,
        part.sku,
        part.brand,
        part.category,
        part.specs.socket,
        part.specs.chipset,
        part.specs.ramType,
        part.specs.formFactor,
        part.specs.vramType,
        part.specs.storageInterface,
        part.specs.efficiencyRating,
        ...specLabels,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    };
  });
}

export function getPublicAccessories(): PublicAccessory[] {
  return MOCK_ACCESSORIES.map(sanitizeAccessoryForPublic);
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

export function getPublicHardwarePartBySlug(slug: string): PublicHardwarePart | undefined {
  const part = MOCK_HARDWARE_PARTS.find((item) => item.slug === slug);
  return part ? sanitizeHardwarePartForPublic(part) : undefined;
}

export function getRelatedPublicHardwareParts(
  part: PublicHardwarePart,
  limit = 4
): PublicHardwarePart[] {
  return MOCK_HARDWARE_PARTS.filter(
    (item) => item.category === part.category && item.slug !== part.slug
  )
    .slice(0, limit)
    .map(sanitizeHardwarePartForPublic);
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
