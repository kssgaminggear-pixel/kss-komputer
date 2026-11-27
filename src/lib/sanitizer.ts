import {
  ConsultationQuote,
  HardwarePart,
  PrebuiltPC,
  PrebuiltPCItem,
  ProductCategory,
  PublicHardwarePart,
} from './types';

/**
 * Public Hardware Part — aman dikirim ke client.
 * `costPrice`, `sellPrice`, dan alias `price` tidak pernah ikut.
 */
export type PublicHardwarePartDTO = PublicHardwarePart;

/**
 * Satu komponen di dalam paket PC rakitan yang boleh ditampilkan publik.
 */
export interface PublicPrebuiltPartDTO {
  category: ProductCategory;
  partId: string;
  name: string;
  quantity: number;
  part: PublicHardwarePart;
}

/**
 * Public Paket Rakitan PC — hanya 1 Total Bundle Price + daftar komponen.
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
  baseParts: Partial<Record<ProductCategory, PrebuiltPCItem>>;
  parts: PublicPrebuiltPartDTO[];
}

/**
 * Opsi upgrade dengan Delta Price (bukan harga satuan part).
 */
export interface PublicUpgradeOptionDTO {
  part: PublicHardwarePart;
  deltaPrice: number;
}

/**
 * Detail paket untuk halaman /paket-rakitan/[slug].
 * Total paket dihitung server-side; client hanya menambahkan delta.
 */
export interface PublicPrebuiltDetailDTO extends PublicPrebuiltPCDTO {
  baseTotalPrice: number;
  upgradeOptions: Partial<Record<ProductCategory, PublicUpgradeOptionDTO[]>>;
}

/**
 * Sanitize HardwarePart sebelum dikirim ke browser.
 * Tidak ada field harga yang disalin. Daftar field ditulis eksplisit agar
 * field harga baru tidak ikut terbawa.
 */
export function sanitizeHardwarePartForPublic(part: HardwarePart): PublicHardwarePart {
  return {
    id: part.id,
    sku: part.sku,
    name: part.name,
    slug: part.slug,
    brand: part.brand,
    category: part.category,
    stockStatus: part.stockStatus,
    wattage: part.wattage,
    warrantyYears: part.warrantyYears,
    officialDistributor: part.officialDistributor,
    specs: part.specs,
    updatedAt: part.updatedAt,
  };
}

/**
 * Sanitize PrebuiltPC sebelum dikirim ke browser.
 */
export function sanitizePrebuiltPCForPublic(
  pkg: PrebuiltPC,
  partsMap: Record<string, HardwarePart>
): PublicPrebuiltPCDTO {
  const partsList: PublicPrebuiltPartDTO[] = [];
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
        part: sanitizeHardwarePartForPublic(part),
      });
      rawParts.push(part);
    }
  }

  const totalBundlePrice =
    rawParts.reduce((sum, part) => sum + (part.sellPrice || part.price || 0), 0) +
    Math.max(0, pkg.assemblyFee);

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
    baseParts: pkg.baseParts,
    parts: partsList,
  };
}

/**
 * Detail paket + opsi upgrade ber-delta untuk halaman publik.
 * Hanya kategori yang sudah ada di baseParts yang boleh di-upgrade agar
 * Delta Price selalu punya harga pembanding.
 */
export function sanitizePrebuiltDetailForPublic(
  pkg: PrebuiltPC,
  allParts: HardwarePart[],
  partsMap: Record<string, HardwarePart>,
  upgradeableCategories: ProductCategory[]
): PublicPrebuiltDetailDTO {
  const base = sanitizePrebuiltPCForPublic(pkg, partsMap);
  const upgradeOptions: Partial<Record<ProductCategory, PublicUpgradeOptionDTO[]>> = {};

  for (const category of upgradeableCategories) {
    const baseItem = pkg.baseParts[category];
    if (!baseItem) continue;

    const basePart = partsMap[baseItem.partId];
    if (!basePart) continue;

    upgradeOptions[category] = allParts
      .filter((part) => part.category === category)
      .map((part) => ({
        part: sanitizeHardwarePartForPublic(part),
        deltaPrice: part.sellPrice - basePart.sellPrice,
      }));
  }

  return {
    ...base,
    baseTotalPrice: base.totalBundlePrice,
    upgradeOptions,
  };
}

/**
 * Sanitize ConsultationQuote untuk tampilan publik.
 */
export function sanitizeQuoteForPublic(quote: ConsultationQuote) {
  return {
    quoteCode: quote.quoteCode,
    customerName: quote.customerName,
    customerWa: quote.customerWa,
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

export type PublicQuoteDTO = ReturnType<typeof sanitizeQuoteForPublic>;
