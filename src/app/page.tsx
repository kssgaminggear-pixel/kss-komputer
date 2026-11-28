import React from 'react';
import { HomeHeroServices } from '@/components/home/HomeHeroServices';
import { HomeServiceIntro } from '@/components/home/HomeServiceIntro';
import { HomeServiceShelf } from '@/components/home/HomeServiceShelf';
import { HomeBedahPc } from '@/components/home/HomeBedahPc';
import { HomeFacts } from '@/components/home/HomeFacts';
import { HomeConsultBanner } from '@/components/home/HomeConsultBanner';
import { HomeFaqMosaic } from '@/components/home/HomeFaqMosaic';
import { HomeShop } from '@/components/home/HomeShop';
import { getHomeCatalog } from '@/lib/catalog/server';
import { getMarketplaceEtalase, getMarketplaceProducts } from '@/lib/marketplace/server';
import { getPublicServices } from '@/lib/server-catalog';

export default function HomePage() {
  const catalog = getHomeCatalog();
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
      <HomeBedahPc services={services} />
      <HomeFacts services={services.filter((service) => service.isActive)} />
      <HomeConsultBanner />
      <HomeShop
        {...catalog}
        shelves={[...getMarketplaceEtalase()].sort((a, b) => b.count - a.count).slice(0, 6)}
        totalProducts={getMarketplaceProducts().length}
      />
      <HomeFaqMosaic />
    </div>
  );
}
