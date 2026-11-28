import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check, ChevronDown, MessageCircle, Plus } from 'lucide-react';
import { getPublicServices } from '@/lib/server-catalog';
import { DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { ServiceMedia } from '@/components/service/ServiceMedia';
import { SlotImage } from '@/components/ui/SlotImage';
import { Price } from '@/components/ui/Price';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema } from '@/lib/seo';
import { SERVICE_FAQS } from '@/lib/faq';

export const metadata: Metadata = {
  title: 'Jasa Rakit, Servis & Maintenance PC — KSS Komputer',
  description:
    'Layanan rakit PC, servis, upgrade, instalasi ulang, dan maintenance oleh teknisi KSS Komputer di Mangga Dua, Jakarta. Booking via WhatsApp.',
  alternates: {
    canonical: '/jasa',
  },
};

const SELECTED_BADGE = 'Paling Dicari';

const STANDARDS = [
  {
    title: 'Thermal paste premium',
    body: 'Pemasangan ulang pendingin prosesor memakai thermal paste premium.',
  },
  {
    title: 'Laporan uji suhu & beban',
    body: 'Setelah pengerjaan, unit diuji dengan Cinebench & Furmark. Suhu idle dan beban penuh dicatat sebelum diserahkan.',
  },
];

const waLink = (message: string) => `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

export default function JasaLayananPage() {
  const services = getPublicServices();

  return (
    <>
      <JsonLd data={faqSchema(SERVICE_FAQS)} />

      <section className="mx-2 mt-2 overflow-hidden rounded-lg bg-block-clay md:mx-3 md:mt-3 md:rounded-xl">
        <div className="kss-container grid gap-6 py-8 lg:grid-cols-12 lg:items-center lg:py-12">
          <div className="lg:col-span-6">
            <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
              Rakit, servis & rawat PC
            </h1>
            <p className="mt-3 max-w-[44ch] text-body text-ink">
              Dikerjakan teknisi KSS, diuji stabilitasnya sebelum diserahkan.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/konsultasi" className="kss-btn-primary h-12 px-6 text-sm">
                Mulai konsultasi
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <a
                href={waLink('Halo Teknisi KSS Komputer, saya ingin konsultasi jadwal service/rakit PC')}
                target="_blank"
                rel="noopener noreferrer"
                className="kss-btn-dark h-12 px-6 text-sm"
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                Chat teknisi
              </a>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg lg:col-span-6">
            <SlotImage slot="home.hero.servis" sizes="(min-width: 1024px) 640px, 100vw" lcp />
          </div>
        </div>
      </section>

      <section aria-labelledby="daftar-jasa" className="kss-container py-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="daftar-jasa" className="text-h2 text-ink">
            Pilih layanan
          </h2>
          <p className="text-body-sm text-zinc-500">
            <span className="kss-num font-semibold text-ink">{services.length}</span> layanan · garansi pengerjaan toko
          </p>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li
              key={service.slug}
              data-service-card
              className={`flex flex-col overflow-hidden rounded-md border border-line bg-white ${
                service.badge === SELECTED_BADGE ? 'kss-ring-selected' : ''
              }`}
            >
              <Link href={`/jasa/${service.slug}`} tabIndex={-1} aria-hidden className="block">
                <ServiceMedia slug={service.slug} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex min-h-5 flex-wrap items-center gap-2">
                  {service.badge && (
                    <span className={`kss-tag ${service.badge === SELECTED_BADGE ? 'kss-tag-accent' : 'kss-tag-neutral'}`}>
                      {service.badge}
                    </span>
                  )}
                  <span className="kss-label text-zinc-500">{service.duration}</span>
                </div>
                <h3 className="mt-2 font-display text-xl font-bold leading-snug text-ink">{service.title}</h3>
                <div className="mt-3">
                  <span className="kss-label block text-zinc-500">Biaya jasa mulai</span>
                  {service.price === 0 ? (
                    <span className="kss-price text-xl text-ink">Gratis</span>
                  ) : (
                    <Price value={service.price} className="text-xl text-ink" />
                  )}
                </div>

                <details className="group mt-3 border-t border-line">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-body-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    Cakupan pekerjaan
                    <ChevronDown aria-hidden className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="space-y-1.5 pb-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-body-sm text-zinc-600">
                        <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                  <Link href={`/jasa/${service.slug}`} className="kss-btn-dark h-11" aria-label={`Lihat detail ${service.title}`}>
                    Lihat detail
                  </Link>
                  <a
                    href={waLink(`Halo KSS Komputer, saya ingin booking layanan: *${service.title}*`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kss-btn-outline h-11"
                    aria-label={`Booking ${service.title} lewat WhatsApp`}
                  >
                    <MessageCircle aria-hidden className="h-4 w-4" />
                    Booking
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="standar-jasa" className="mx-2 rounded-lg bg-block-butter py-8 md:mx-3 md:rounded-xl lg:py-12">
        <div className="kss-container">
          <h2 id="standar-jasa" className="text-h2 text-ink">
            Standar pengerjaan
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            {STANDARDS.map((item, index) => (
              <li key={item.title} className="rounded-md bg-white p-5">
                <span className="kss-num text-body-sm font-semibold text-orange-800">0{index + 1}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-body-sm text-zinc-600">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" aria-labelledby="tanya-jasa" className="kss-container max-w-3xl scroll-mt-24 py-10 lg:py-14">
        <h2 id="tanya-jasa" className="text-h2 text-ink">
          Pertanyaan yang sering diajukan
        </h2>
        <div className="mt-5 space-y-2">
          {SERVICE_FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-md border border-line bg-white px-4">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <Plus aria-hidden className="h-4 w-4 shrink-0 transition-transform duration-150 group-open:rotate-45" />
              </summary>
              <p className="pb-4 pr-8 text-body text-zinc-600">{faq.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-body-sm text-zinc-600">
          Butuh layanan lain?{' '}
          <a href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer" className="kss-link">
            Hubungi teknisi lewat WhatsApp
          </a>
          .
        </p>
      </section>
    </>
  );
}
