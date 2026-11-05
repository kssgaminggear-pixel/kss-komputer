import { HardwarePart, PrebuiltPC, ConsultationQuote, ProductCategory } from './types';
import { calculateBundleTotal } from './compatibility';

/**
 * Public Sanitized DTO untuk Komponen Hardware
 * Memastikan 'costPrice' dan 'sellPrice' toko tidak pernah bocor ke client-side.
 */
export interface PublicHardwarePartDTO {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  retailPrice?: number;
  isRetailAvailable?: boolean;
  stockStatus: string;
  wattage: number;
  warrantyYears: number;
  officialDistributor?: string;
  specs: HardwarePart['specs'];
  updatedAt: string;
}

/**
 * Public Sanitized DTO untuk Paket Rakitan PC
 * Menampilkan 1 Total Bundle Price dan daftar komponen tanpa harga satuan per part.
 */
export interface PublicPrebuiltPCDTO {
  id: string;
  name: string;
  slug: string;
  tier: string;
  categoryTag: string;
  platform: string;
  description: string;
  highlights: string[];
  targetResolution: string;
  estimatedFps: PrebuiltPC['estimatedFps'];
  totalBundlePrice: number;
  warrantyYears: number;
  tokopediaUrl: string;
  featured?: boolean;
  parts: {
    category: ProductCategory;
    partId: string;
    name: string;
    quantity: number;
  }[];
}

/**
 * Sanitize HardwarePart sebelum dikirim ke browser
 */
export function sanitizeHardwarePartForPublic(part: HardwarePart): PublicHardwarePartDTO {
  return {
    id: part.id,
    sku: part.sku,
    name: part.name,
    slug: part.slug,
    brand: part.brand,
    category: part.category,
    retailPrice: part.isRetailAvailable ? part.retailPrice || part.sellPrice : undefined,
    isRetailAvailable: part.isRetailAvailable,
    stockStatus: part.stockStatus,
    wattage: part.wattage,
    warrantyYears: part.warrantyYears,
    officialDistributor: part.officialDistributor,
    specs: part.specs,
    updatedAt: part.updatedAt,
  };
}

/**
 * Sanitize PrebuiltPC sebelum dikirim ke browser
 */
export function sanitizePrebuiltPCForPublic(
  pkg: PrebuiltPC,
  partsMap: Record<string, HardwarePart>
): PublicPrebuiltPCDTO {
  const partsList: { category: ProductCategory; partId: string; name: string; quantity: number }[] = [];
  const rawParts: HardwarePart[] = [];

  for (const [cat, item] of Object.entries(pkg.baseParts)) {
    if (!item) continue;
    const part = partsMap[item.partId];
    if (part) {
      partsList.push({
        category: cat as ProductCategory,
        partId: item.partId,
        name: part.name,
        quantity: item.quantity,
      });
      rawParts.push(part);
    }
  }

  const totalBundlePrice = calculateBundleTotal(rawParts, pkg.assemblyFee);

  return {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    tier: pkg.tier,
    categoryTag: pkg.categoryTag,
    platform: pkg.platform,
    description: pkg.description,
    highlights: pkg.highlights,
    targetResolution: pkg.targetResolution,
    estimatedFps: pkg.estimatedFps,
    totalBundlePrice,
    warrantyYears: pkg.warrantyYears,
    tokopediaUrl: pkg.tokopediaUrl,
    featured: pkg.featured,
    parts: partsList,
  };
}

/**
 * Sanitize ConsultationQuote untuk tampilan publik
 */
export function sanitizeQuoteForPublic(quote: ConsultationQuote) {
  return {
    quoteCode: quote.quoteCode,
    customerName: quote.customerName,
    usageNeed: quote.usageNeed,
    selectedParts: quote.selectedParts.map((p) => ({
      category: p.category,
      name: p.name,
      quantity: p.quantity,
    })),
    finalBundlePrice: quote.finalBundlePrice,
    totalWattage: quote.totalWattage,
    recommendedPsuWatt: quote.recommendedPsuWatt,
    notes: quote.notes,
    validUntil: quote.validUntil,
    createdAt: quote.createdAt,
  };
}
