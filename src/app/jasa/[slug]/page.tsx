import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ChevronRight,
  Clock,
  Check,
  X,
  ShieldCheck,
  PhoneCall,
  Wrench,
  CalendarClock,
} from 'lucide-react';
import {
  getPublicServiceBySlug,
  getPublicServiceSlugs,
  getPublicServices,
} from '@/lib/server-catalog';
import { formatIDR, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { BookingForm } from '@/components/service/BookingForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, serviceSchema } from '@/lib/seo';

interface JasaDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPublicServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: JasaDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getPublicServiceBySlug(slug);

  if (!service) {
    return { title: 'Layanan Tidak Ditemukan — KSS Komputer' };
  }

  return {
    title: `${service.title} — Layanan KSS Komputer`,
    description: service.description,
    alternates: {
      canonical: `/jasa/${service.slug}`,
    },
    openGraph: {
      type: 'website',
      title: service.title,
      description: service.description,
      url: `/jasa/${service.slug}`,
      ...(service.imageUrl ? { images: [{ url: service.imageUrl, alt: service.title }] } : {}),
    },
    twitter: {
      card: 'summary',
      title: service.title,
      description: service.description,
    },
  };
}

function getPriceLabel(price: number, priceMax?: number) {
  if (price === 0) return 'GRATIS';
  if (priceMax && priceMax > price) {
    return `${formatIDR(price)} — ${formatIDR(priceMax)}`;
  }
  return `Mulai ${formatIDR(price)}`;
}

// Detail layanan hanya berisi data statis; tidak perlu validasi instant navigation.
export const instant = false;

export default async function JasaDetailPage({ params }: JasaDetailPageProps) {
  const { slug } = await params;
  const service = getPublicServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const allServices = getPublicServices();
  const relatedServices = [
    ...allServices.filter((item) => item.category === service.category && item.slug !== service.slug),
    ...allServices.filter((item) => item.category !== service.category && item.popular),
  ]
    .filter((item, index, list) => list.findIndex((entry) => entry.slug === item.slug) === index)
    .slice(0, 3);

  const priceLabel = getPriceLabel(service.price, service.priceMax);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema(service),
          breadcrumbSchema([
            { name: 'Beranda', path: '/' },
            { name: 'Jasa & Servis', path: '/jasa' },
            { name: service.title, path: `/jasa/${service.slug}` },
          ]),
        ]}
      />
      <div className="kss-container py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 font-mono text-xs text-zinc-500">
        <Link href="/" className="hover:text-orange-700">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        <Link href="/jasa" className="hover:text-orange-700">
          Jasa &amp; Servis
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{service.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <header className="rounded-md border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-micro font-bold uppercase text-orange-700 dark:text-orange-400">
                Layanan Teknisi
              </span>
              {service.badge && (
                <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-micro font-bold text-amber-700 dark:text-amber-400">
                  {service.badge}
                </span>
              )}
              <span className="flex items-center gap-1 font-mono text-meta text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                {service.duration}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {service.title}
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-500 sm:text-sm">
              {service.description}
            </p>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div>
                <div className="font-mono text-micro font-bold uppercase tracking-tight text-zinc-500">
                  Estimasi Biaya Jasa
                </div>
                <div className="kss-price whitespace-nowrap text-xl text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                  {priceLabel}
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <a
                  href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                    `Halo KSS Komputer, saya ingin tanya layanan: *${service.title}*`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/15 dark:text-emerald-400"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Tanya Teknisi</span>
                </a>
                <a href="#booking-form" className="kss-btn-primary px-3 py-2 lg:hidden">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>Booking</span>
                </a>
              </div>
            </div>
          </header>

          <section className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              <Wrench className="h-4 w-4 text-orange-700 dark:text-orange-400" />
              <span>Cakupan Pekerjaan</span>
            </h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {service.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <section className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-mono text-micro font-bold uppercase tracking-tight text-emerald-700 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span>Termasuk</span>
              </h2>
              <ul className="space-y-1.5">
                {(service.includes || service.features).map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-md border border-amber-500/20 bg-amber-500/5 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-mono text-micro font-bold uppercase tracking-tight text-amber-700 dark:text-amber-400">
                <X className="h-3.5 w-3.5" />
                <span>Tidak Termasuk</span>
              </h2>
              <ul className="space-y-1.5">
                {(service.excludes && service.excludes.length > 0
                  ? service.excludes
                  : ['Biaya komponen pengganti (dihitung terpisah)']
                ).map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="mb-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Alur Pengerjaan Standar KSS
            </h2>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                'Konfirmasi jadwal & keluhan via WhatsApp',
                'Pemeriksaan awal dan estimasi biaya',
                'Pengerjaan oleh teknisi + quality check',
                'Serah terima, garansi, dan laporan hasil',
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-900 font-mono text-meta font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {index + 1}
                  </span>
                  <span className="text-xs text-zinc-700 dark:text-zinc-300">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {relatedServices.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Wrench className="h-4 w-4 text-orange-700 dark:text-orange-400" />
                <span>Layanan Terkait</span>
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {relatedServices.map((related) => (
                  <Link
                    key={related.id}
                    href={`/jasa/${related.slug}`}
                    className="flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
                  >
                    <div>
                      <div className="mb-1 font-mono text-micro font-bold uppercase tracking-tight text-zinc-500">
                        {related.duration}
                      </div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {related.title}
                      </div>
                    </div>
                    <div className="mt-3 font-mono text-xs font-bold text-orange-700 tabular-nums dark:text-orange-400">
                      {getPriceLabel(related.price, related.priceMax)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div id="booking-form" className="scroll-mt-24 rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              <Clock className="h-4 w-4 text-orange-700 dark:text-orange-400" />
              <span>Booking Jadwal</span>
            </h2>
            <p className="mb-4 text-meta text-zinc-500 dark:text-zinc-500">
              Isi form singkat, pesan WhatsApp terformat akan terbuka otomatis.
            </p>
            <BookingForm serviceTitle={service.title} />
          </div>

          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div className="text-meta leading-relaxed text-zinc-600 dark:text-zinc-500">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  Garansi pengerjaan KSS.
                </span>{' '}
                Jika masalah yang sama muncul kembali dalam masa garansi, pengecekan ulang
                tidak dikenakan biaya jasa.
              </div>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </>
  );
}
