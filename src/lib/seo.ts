import { SITE_URL, STORE_NAME, TOKOPEDIA_URL, STORE_STREET } from './constants';
import { DEFAULT_WHATSAPP_PHONE } from './format';
import { getPackageImage } from './package-images';
import type { PublicPrebuiltPCDTO } from './sanitizer';
import type { ServicePackage } from './types';

/** URL absolut untuk metadata, JSON-LD, dan sitemap. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_URL).toString();
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ComputerStore'],
    '@id': `${SITE_URL}/#organization`,
    name: STORE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/images/brand/kss-logo-light.png'),
    image: absoluteUrl('/images/tokopedia/banner-pc-store.webp'),
    description:
      'Custom PC system integrator dan pusat layanan jasa komputer di Mangga Dua, Jakarta. Paket PC rakitan siap pakai, upgrade terukur, dan servis bergaransi.',
    telephone: `+${DEFAULT_WHATSAPP_PHONE}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STORE_STREET,
      addressLocality: 'Jakarta',
      addressRegion: 'DKI Jakarta',
      addressCountry: 'ID',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [TOKOPEDIA_URL],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: STORE_NAME,
    url: SITE_URL,
    inLanguage: 'id-ID',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function productSchema(pkg: PublicPrebuiltPCDTO) {
  const image = getPackageImage(pkg.slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.name,
    description: pkg.description,
    sku: pkg.slug,
    brand: { '@type': 'Brand', name: STORE_NAME },
    category: pkg.categoryTag,
    ...(image ? { image: absoluteUrl(image) } : {}),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/paket-rakitan/${pkg.slug}`),
      priceCurrency: 'IDR',
      price: pkg.totalBundlePrice,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
    },
  };
}

export function serviceSchema(service: ServicePackage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    serviceType: service.category,
    url: absoluteUrl(`/jasa/${service.slug}`),
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'City', name: 'Jakarta' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: service.price,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(`/jasa/${service.slug}`),
      ...(service.priceMax
        ? {
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: service.price,
              maxPrice: service.priceMax,
              priceCurrency: 'IDR',
            },
          }
        : {}),
    },
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}
