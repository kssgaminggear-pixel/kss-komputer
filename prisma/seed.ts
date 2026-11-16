import { MOCK_HARDWARE_PARTS, MOCK_PREBUILT_PCS, MOCK_ACCESSORIES, MOCK_SERVICES } from '../src/lib/mock-data';

/**
 * Kontrak minimal Prisma Client yang dipakai seeder.
 * Didefinisikan lokal karena `@prisma/client` belum dipasang di proyek ini.
 */
type SeedRecord = Record<string, unknown>;

interface SeedDelegate {
  upsert(args: { where: SeedRecord; update?: SeedRecord; create?: SeedRecord }): Promise<unknown>;
}

export type SeedPrismaClient = Record<string, SeedDelegate>;

/**
 * Script Seed Database Produksi KSS Komputer
 * Memindahkan mock-data awal ke PostgreSQL
 */
export async function seedDatabase(prisma: SeedPrismaClient) {
  console.log('--- SEEDING KSS KOMPUTER DATABASE ---');

  // 1. Seed Hardware Parts
  for (const part of MOCK_HARDWARE_PARTS) {
    await prisma.hardwarePart.upsert({
      where: { sku: part.sku },
      update: {
        costPrice: part.costPrice,
        sellPrice: part.sellPrice,
        retailPrice: part.retailPrice || part.sellPrice,
        wattage: part.wattage,
        specs: part.specs,
      },
      create: {
        id: part.id,
        sku: part.sku,
        name: part.name,
        slug: part.slug,
        brand: part.brand,
        category: part.category.toUpperCase(),
        costPrice: part.costPrice,
        sellPrice: part.sellPrice,
        retailPrice: part.retailPrice || part.sellPrice,
        isRetailAvailable: !!part.retailPrice,
        stockStatus: 'READY',
        wattage: part.wattage,
        warrantyYears: part.warrantyYears,
        officialDistributor: part.officialDistributor,
        specs: part.specs,
      },
    });
  }
  console.log(`✓ Seeded ${MOCK_HARDWARE_PARTS.length} Hardware Parts`);

  // 2. Seed Prebuilts
  for (const pkg of MOCK_PREBUILT_PCS) {
    await prisma.prebuiltPC.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: {
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
        assemblyFee: pkg.assemblyFee,
        tokopediaUrl: pkg.tokopediaUrl,
        warrantyYears: pkg.warrantyYears,
      },
    });
  }
  console.log(`✓ Seeded ${MOCK_PREBUILT_PCS.length} Prebuilt PCs`);

  // 3. Seed Accessories
  for (const acc of MOCK_ACCESSORIES) {
    await prisma.accessory.upsert({
      where: { sku: acc.sku },
      update: {
        retailPrice: acc.retailPrice,
      },
      create: {
        id: acc.id,
        sku: acc.sku,
        name: acc.name,
        slug: acc.slug,
        brand: acc.brand,
        category: acc.category.toUpperCase(),
        retailPrice: acc.retailPrice,
        costPrice: acc.costPrice,
        stockStatus: 'READY',
        warrantyYears: acc.warrantyYears,
        officialDistributor: acc.officialDistributor,
        features: acc.features || [],
        specs: acc.specs,
      },
    });
  }
  console.log(`✓ Seeded ${MOCK_ACCESSORIES.length} Accessories`);

  // 4. Seed Services
  for (const srv of MOCK_SERVICES) {
    await prisma.servicePackage.upsert({
      where: { slug: srv.slug },
      update: {},
      create: {
        id: srv.id,
        title: srv.title,
        slug: srv.slug,
        price: srv.price,
        duration: srv.duration,
        description: srv.description,
        features: srv.features,
        popular: !!srv.popular,
        badge: srv.badge,
      },
    });
  }
  console.log(`✓ Seeded ${MOCK_SERVICES.length} Service Packages`);

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}
