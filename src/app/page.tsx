import React from 'react';
import { HomeHeroServices } from '@/components/home/HomeHeroServices';
import { HomeServiceIntro } from '@/components/home/HomeServiceIntro';
import { HomeServiceShelf } from '@/components/home/HomeServiceShelf';
import { HomeFacts } from '@/components/home/HomeFacts';
import { HomeCategories } from '@/components/home/HomeCategories';
import { HomePackages } from '@/components/home/HomePackages';
import { HomeTopSellers } from '@/components/home/HomeTopSellers';
import { HomeConsultBanner } from '@/components/home/HomeConsultBanner';
import { HomeFaqMosaic } from '@/components/home/HomeFaqMosaic';
import { getTopSellers } from '@/lib/marketplace/server';
import { getPackageImage } from '@/lib/package-images';
import { getPublicPrebuilts, getPublicServices } from '@/lib/server-catalog';

export default function HomePage() {
  const prebuilts = getPublicPrebuilts();
  const topSellers = getTopSellers(8);
  const packages = [...prebuilts]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 3);
  const second = packages[1] ?? packages[0];
  const services = getPublicServices();
  // Rak jasa: "Paling Dicari" paling depan, lalu layanan berlabel, lalu urutan data.
  const rank = (service: (typeof services)[number]) =>
    service.badge === 'Paling Dicari' ? 0 : service.popular || service.badge ? 1 : 2;
  const shelf = services
    .filter((service) => service.isActive)
    .sort((a, b) => rank(a) - rank(b))
    .map(({ slug, title, duration, price, badge }) => ({ slug, title, duration, price, badge }));

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeroServices services={services} />
      <HomeServiceIntro total={shelf.length} />
      <HomeServiceShelf services={shelf} />
      <HomeFacts services={services.filter((service) => service.isActive)} />
      <HomeConsultBanner />
      <HomeCategories packageImage={second && getPackageImage(second.slug)} tokoImage={topSellers[0]?.image} />
      <HomePackages packages={packages} total={prebuilts.length} />
      <HomeTopSellers products={topSellers} />
      <HomeFaqMosaic />
    </div>
  );
}
