import React from 'react';
import { HomeHeroServices } from '@/components/home/HomeHeroServices';
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
  const packages = [...prebuilts]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 3);
  const featured = packages[0];
  // Foto kartu kategori memakai unit yang berbeda dari blok "Kenapa KSS".
  const second = packages[1] ?? featured;
  const services = getPublicServices();

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeroServices services={services} />
      <HomeCategories packageImage={second && getPackageImage(second.slug)} tokoImage={topSellers[0]?.image} />
      <HomePackages packages={packages} total={prebuilts.length} />
      <HomeTopSellers products={topSellers} />
      <HomeServices services={services.slice(0, 4)} />
      <HomeConsultation />
      <HomeWhyKss unitImage={featured && getPackageImage(featured.slug)} />
    </div>
  );
}
