import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarClock, Check, ChevronRight, Clock, MessageCircle, ShieldCheck, X } from 'lucide-react';
import {
  getPublicServiceBySlug,
  getPublicServiceSlugs,
  getPublicServices,
} from '@/lib/server-catalog';
import { DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { BookingForm } from '@/components/service/BookingForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, serviceSchema } from '@/lib/seo';
import { getSlot } from '@/lib/media/slots';
import { ServiceMedia } from '@/components/service/ServiceMedia';
import { PcStage } from '@/components/three/PcStage';
import type { SceneMode } from '@/components/three/PcExplodeScene';
import { MobileActionBar } from '@/components/ui/MobileActionBar';
import { Price } from '@/components/ui/Price';

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

  // Pratinjau tautan: ilustrasi jasa bila ada, kalau tidak gambar servis umum.
  const preview = getSlot(`jasa.${service.slug}`) ?? getSlot('home.hero.servis');
  const images = preview ? [{ url: preview.desktop, alt: preview.alt }] : undefined;

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
      images,
    },
    twitter: {
      card: 'summary_large_image',
      images,
      title: service.title,
      description: service.description,
    },
  };
}

/** Jasa yang bagian kerjanya ada pada model 3D. Jasa lain tidak menampilkan model. */
const MODEL_BY_SLUG: Record<string, { mode: SceneMode; note: string }> = {
  'rakit-pc-custom': { mode: 'rakit', note: 'Semua bagian dipasang dan kabel ditata.' },
  'rakit-pc-cable-management-premium': { mode: 'rakit', note: 'Jalur kabel disorot warna oranye.' },
  'deep-cleaning-repaste': { mode: 'cleaning', note: 'Pendingin prosesor dan kipas disorot warna oranye.' },
  'upgrade-ssd-nvme': { mode: 'upgrade', note: 'Slot RAM dan SSD disorot warna oranye.' },
  'upgrade-tambah-ram': { mode: 'upgrade', note: 'Slot RAM dan SSD disorot warna oranye.' },
};

const WORK_STEPS = [
  'Konfirmasi jadwal & keluhan via WhatsApp',
  'Pemeriksaan awal dan estimasi biaya',
  'Pengerjaan oleh teknisi + quality check',
  'Serah terima, garansi, dan laporan hasil',
];

function ServicePrice({ price, priceMax, className }: { price: number; priceMax?: number; className: string }) {
  if (price === 0) return <span className={`kss-price ${className}`}>Gratis</span>;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <Price value={price} className={className} />
      {priceMax && priceMax > price ? (
        <span className="text-body-sm text-zinc-600">
          sampai <Price value={priceMax} className="text-ink" />
        </span>
      ) : null}
    </span>
  );
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

  const model = MODEL_BY_SLUG[service.slug];
  // Unik per jasa: Next menyimpan halaman sebelumnya secara tersembunyi di DOM.
  const formId = `booking-${service.slug}`;
  const askUrl = `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
    `Halo KSS Komputer, saya ingin tanya layanan: *${service.title}*`
  )}`;
  const excludes = service.excludes?.length ? service.excludes : ['Biaya komponen pengganti (dihitung terpisah)'];

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

      <section className="mx-2 mt-2 rounded-lg bg-block-clay md:mx-3 md:mt-3 md:rounded-xl">
        <div className="kss-container py-6 lg:py-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-body-sm text-zinc-600">
            <Link href="/" className="hover:text-ink">
              Beranda
            </Link>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <Link href="/jasa" className="hover:text-ink">
              Jasa &amp; servis
            </Link>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <span aria-current="page" className="font-semibold text-ink">
              {service.title}
            </span>
          </nav>

          <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                {service.badge && <span className="kss-tag kss-tag-neutral bg-white">{service.badge}</span>}
                <span className="kss-label flex items-center gap-1.5 text-ink">
                  <Clock aria-hidden className="h-4 w-4" />
                  {service.duration}
                </span>
              </div>
              <h1 className="mt-3 text-[clamp(1.875rem,4vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink">
                {service.title}
              </h1>
              <p className="mt-3 max-w-[56ch] text-body text-ink">{service.description}</p>
              <div className="mt-5">
                <span className="kss-label block text-zinc-600">Biaya jasa mulai</span>
                <ServicePrice price={service.price} priceMax={service.priceMax} className="text-2xl text-ink" />
              </div>
              <div className="mt-5 hidden gap-2 md:flex">
                <a href={askUrl} target="_blank" rel="noopener noreferrer" className="kss-btn-dark h-12 px-6 text-sm">
                  <MessageCircle aria-hidden className="h-4 w-4" />
                  Tanya teknisi
                </a>
                <a href={`#${formId}`} className="kss-btn-primary h-12 px-6 text-sm lg:hidden">
                  <CalendarClock aria-hidden className="h-4 w-4" />
                  Booking
                </a>
              </div>
            </div>
            <div className="order-1 overflow-hidden rounded-lg lg:order-2 lg:col-span-5">
              <ServiceMedia slug={service.slug} sizes="(min-width: 1024px) 520px, 100vw" lcp />
            </div>
          </div>
        </div>
      </section>

      <div className="kss-container grid grid-cols-1 gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-12">
        <div className="space-y-8">
          <section aria-labelledby="cakupan">
            <h2 id="cakupan" className="font-display text-2xl font-bold text-ink">
              Cakupan pekerjaan
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 rounded-md border border-line bg-white p-3 text-body-sm text-ink">
                  <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-2">
              {[
                { title: 'Yang termasuk', items: service.includes || service.features, Icon: Check },
                { title: 'Yang tidak termasuk', items: excludes, Icon: X },
              ].map(({ title, items, Icon }) => (
                <details key={title} className="group rounded-md border border-line bg-white px-4">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {title}
                    <ChevronRight aria-hidden className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <ul className="space-y-1.5 pb-4">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-body-sm text-zinc-600">
                        <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          {model && (
            <section aria-labelledby="bagian-dikerjakan" className="rounded-lg bg-block-ink p-4 text-zinc-100 sm:p-6">
              <h2 id="bagian-dikerjakan" className="font-display text-2xl font-bold text-white">
                Bagian yang dikerjakan
              </h2>
              <p className="mt-1 text-body-sm text-zinc-300">{model.note}</p>
              <div className="mx-auto mt-3 max-w-2xl">
                <PcStage mode={model.mode} label={service.title} sizes="(min-width: 1024px) 672px, 100vw" />
              </div>
            </section>
          )}

          <section aria-labelledby="alur">
            <h2 id="alur" className="font-display text-2xl font-bold text-ink">
              Alur pengerjaan
            </h2>
            <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {WORK_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3 rounded-md bg-block-butter p-4">
                  <span className="kss-num text-body-sm font-semibold text-orange-800">0{index + 1}</span>
                  <span className="text-body-sm text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div id={formId} data-booking-form className="scroll-mt-24 rounded-lg border border-line bg-white p-5">
            <h2 className="font-display text-xl font-bold text-ink">Booking jadwal</h2>
            <p className="mb-4 mt-1 text-body-sm text-zinc-600">Isi form singkat, lalu pesan WhatsApp terbuka otomatis.</p>
            <BookingForm serviceTitle={service.title} />
          </div>
          <div className="flex items-start gap-2.5 rounded-md border border-line bg-white p-4 text-body-sm text-zinc-600">
            <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
            <p>
              <span className="font-semibold text-ink">Garansi pengerjaan KSS.</span> Jika masalah yang sama muncul
              kembali dalam masa garansi, pengecekan ulang tidak dikenakan biaya jasa.
            </p>
          </div>
        </aside>
      </div>

      {relatedServices.length > 0 && (
        <section aria-labelledby="terkait" className="kss-container pb-10 lg:pb-14">
          <h2 id="terkait" className="font-display text-2xl font-bold text-ink">
            Layanan terkait
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedServices.map((related) => (
              <li key={related.slug} className="overflow-hidden rounded-md border border-line bg-white">
                <Link href={`/jasa/${related.slug}`} className="flex h-full flex-col">
                  <ServiceMedia slug={related.slug} sizes="(min-width: 640px) 33vw, 100vw" />
                  <span className="flex flex-1 flex-col p-4">
                    <span className="kss-label text-zinc-500">{related.duration}</span>
                    <span className="mt-1 font-display text-lg font-bold leading-snug text-ink">{related.title}</span>
                    <span className="mt-auto block pt-3">
                      <ServicePrice price={related.price} className="text-lg text-ink" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <MobileActionBar hideNear={formId}>
        <div className="min-w-0">
          <span className="block text-meta text-zinc-600">Biaya jasa mulai</span>
          <ServicePrice price={service.price} className="text-lg text-ink" />
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href={askUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tanya teknisi lewat WhatsApp"
            className="kss-btn-dark h-11 w-11 px-0"
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
          </a>
          <a href={`#${formId}`} className="kss-btn-primary h-11 px-5 text-sm">
            Booking
          </a>
        </div>
      </MobileActionBar>
    </>
  );
}
