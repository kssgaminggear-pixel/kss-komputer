import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import {
  getPublicPrebuilts,
  getPublicServices,
} from '@/lib/server-catalog';
import { getMarketplaceEtalase, getMarketplaceProducts, getMarketplaceMeta } from '@/lib/marketplace/server';

const STATIC_ROUTES = [
  '/',
  '/paket-rakitan',
  '/jasa',
  '/toko',
  '/konsultasi',
  '/tentang-kami',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === '/' || route === '/paket-rakitan' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route === '/paket-rakitan' ? 0.9 : 0.7,
  }));

  const packages: MetadataRoute.Sitemap = getPublicPrebuilts().map((pkg) => ({
    url: `${SITE_URL}/paket-rakitan/${pkg.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const services: MetadataRoute.Sitemap = getPublicServices().map((service) => ({
    url: `${SITE_URL}/jasa/${service.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const synced = getMarketplaceMeta().lastSuccessAt;
  const store: MetadataRoute.Sitemap = [
    ...getMarketplaceEtalase().map((shelf) => ({
      url: `${SITE_URL}/toko/etalase/${shelf.slug}`,
      lastModified: synced,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
    ...getMarketplaceProducts().map((product) => ({
      url: `${SITE_URL}/toko/${product.slug}`,
      lastModified: synced,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
  ];

  return [...staticEntries, ...packages, ...services, ...store];
}
