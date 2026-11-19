import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import {
  getPublicHardwareParts,
  getPublicPrebuilts,
  getPublicServices,
} from '@/lib/server-catalog';

const STATIC_ROUTES = [
  '/',
  '/paket-rakitan',
  '/jasa',
  '/komponen',
  '/aksesoris',
  '/simulasi',
  '/konsultasi',
  '/tentang-kami',
  '/cek-pesanan',
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

  const parts: MetadataRoute.Sitemap = getPublicHardwareParts().map((part) => ({
    url: `${SITE_URL}/komponen/${part.slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticEntries, ...packages, ...services, ...parts];
}
