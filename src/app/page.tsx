import React from 'react';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeCategories } from '@/components/home/HomeCategories';
import { HomePackages } from '@/components/home/HomePackages';
import { HomeTopSellers } from '@/components/home/HomeTopSellers';
import { HomeServices } from '@/components/home/HomeServices';
import { HomeConsultation } from '@/components/home/HomeConsultation';
import { HomeWhyKss } from '@/components/home/HomeWhyKss';
import { getTopSellers } from '@/lib/marketplace/server';
import { getPackageImage } from '@/lib/package-images';
import { getPublicPrebuilts, getPublicServices } from '@/lib/server-catalog';

export default function HomePage() {
  const prebuilts = getPublicPrebuilts();
  const topSellers = getTopSellers(8);
  // Paket unggulan tampil di hero, jadi tiga kartu di bawahnya mendahulukan yang lain.
  const featured = prebuilts.find((pkg) => pkg.featured) ?? prebuilts[0];
  const packages = prebuilts
    .filter((pkg) => pkg !== featured)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 3);
  // Foto kartu kategori memakai unit yang berbeda dari hero.
  const second = packages[0] ?? featured;

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHero featured={featured} />
      <HomeCategories packageImage={second && getPackageImage(second.slug)} tokoImage={topSellers[0]?.image} />
      <HomePackages packages={packages} total={prebuilts.length} />
      <HomeTopSellers products={topSellers} />
      <HomeServices services={getPublicServices().slice(0, 4)} />
      <HomeConsultation />
      <HomeWhyKss unitImage={featured && getPackageImage(featured.slug)} />
    </div>
  );
}
