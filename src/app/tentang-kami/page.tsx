import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight, MapPin, MessageCircle, Plus, Truck } from 'lucide-react';
import {
  STORE_ADDRESS,
  STORE_AREA,
  STORE_OPERATIONAL_HOURS,
  STORE_WARRANTY_TEXT,
  ADMIN_WHATSAPP,
} from '@/lib/constants';
import { generateCustomBuildWAMessage } from '@/lib/format';
import { JsonLd } from '@/components/seo/JsonLd';
import { SlotImage } from '@/components/ui/SlotImage';
import { faqSchema } from '@/lib/seo';
import { STORE_FAQS } from '@/lib/faq';
import { getPublicServices } from '@/lib/server-catalog';

export const metadata: Metadata = {
  title: 'Tentang Kami — Bengkel Rakit & Servis PC KSS Komputer',
  description:
    'Profil KSS Komputer: bengkel rakit dan servis PC di Mangga Dua, Jakarta. Standar QC, garansi toko, dan alur klaim yang jelas.',
  alternates: {
    canonical: '/tentang-kami',
  },
};

const TEAM = [
  {
    role: 'Lead System Integrator',
    focus: 'Perakitan, BIOS tuning, dan validasi kompatibilitas komponen.',
  },
  {
    role: 'Hardware & Servicing Specialist',
    focus: 'Diagnosis kerusakan, repaste thermal, dan upgrade hardware.',
  },
  {
    role: 'QC & Cable Management',
    focus: 'Stress test, kerapian kabel, dan pemeriksaan akhir sebelum serah terima.',
  },
];

const AREAS = [
  { title: 'Meja perakitan', text: 'Area kerja untuk merakit dan menata kabel.' },
  { title: 'Bench diagnosis', text: 'Pengecekan komponen, memori, dan storage.' },
  { title: 'Stress test station', text: 'Uji beban dan pemantauan suhu sebelum QC.' },
  { title: 'Packing & serah terima', text: 'Packing aman untuk pickup maupun ekspedisi.' },
];

const STANDARDS = [
  {
    title: 'Standar perakitan',
    body: 'Routing kabel rapi dan pengecekan ulang setiap konektor sebelum unit dinyalakan.',
  },
  {
    title: 'Stress test & QC',
    body: 'Pengujian beban CPU/GPU, pemantauan suhu, dan verifikasi stabilitas sebelum unit diserahkan.',
  },
  {
    title: 'Garansi & after-sales',
    body: 'Garansi resmi distributor ditambah garansi toko. Klaim ditangani langsung oleh teknisi yang merakit.',
  },
];

const CLAIM_STEPS = [
  'Hubungi teknisi dengan kode order / nota.',
  'Jelaskan gejala dan sertakan foto bila ada.',
  'Unit dicek ulang untuk verifikasi penyebab.',
  'Perbaikan atau penggantian sesuai cakupan garansi.',
];

const SECTION_TITLE = 'font-display text-2xl font-bold text-ink lg:text-3xl';

export default function TentangKamiPage() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS)}`;
  const waUrl = `https://wa.me/${ADMIN_WHATSAPP}`;
  const stats = [
    { value: '24 jam', label: 'Stress test rakitan' },
    { value: '24 jam', label: 'CS online' },
    { value: String(getPublicServices().length), label: 'Layanan jasa' },
  ];

  return (
    <>
      <JsonLd data={faqSchema(STORE_FAQS)} />

      <section className="mx-2 mt-2 rounded-lg bg-block-butter md:mx-3 md:mt-3 md:rounded-xl">
        <div className="kss-container grid gap-6 py-8 lg:grid-cols-12 lg:items-center lg:py-12">
          <div className="lg:col-span-6">
            <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
              Kami merakit, menguji, dan merawat PC Anda
            </h1>
            <p className="mt-3 max-w-[48ch] text-body text-ink">
              Bengkel rakit dan servis PC di Mangga Dua, Jakarta. Tiap unit dicek kompatibilitasnya, dirakit rapi, dan
              diuji sebelum diserahkan.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={generateCustomBuildWAMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="kss-btn-dark h-12 px-6 text-sm"
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                Konsultasi via WhatsApp
              </a>
              <Link href="/konsultasi" className="kss-btn-outline h-12 px-6 text-sm">
                Mulai konsultasi
              </Link>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg lg:col-span-6">
            <SlotImage slot="home.hero.rakit" sizes="(min-width: 1024px) 640px, 100vw" lcp />
          </div>
        </div>
        <dl className="kss-container grid grid-cols-3 gap-2 pb-6 lg:pb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse justify-end rounded-md bg-white p-3 sm:p-5">
              <dt className="mt-1 text-meta text-zinc-600">{stat.label}</dt>
              <dd className="kss-num text-xl font-semibold text-ink sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="standar-kerja" className="kss-container py-10 lg:py-14">
        <h2 id="standar-kerja" className={SECTION_TITLE}>
          Standar kerja
        </h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {STANDARDS.map((item, index) => (
            <li key={item.title} className="rounded-md border border-line bg-white p-5">
              <span className="kss-num text-body-sm font-semibold text-orange-800">0{index + 1}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{item.title}</h3>
              <p className="mt-1 text-body-sm text-zinc-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-2 rounded-lg bg-block-steel py-8 md:mx-3 md:rounded-xl lg:py-12">
        <div className="kss-container grid grid-cols-1 gap-8 lg:grid-cols-2">
          {[
            { title: 'Tim teknisi', rows: TEAM.map((member) => [member.role, member.focus]) },
            { title: 'Area kerja bengkel', rows: AREAS.map((area) => [area.title, area.text]) },
          ].map((group) => (
            <div key={group.title}>
              <h2 className={SECTION_TITLE}>{group.title}</h2>
              <div className="mt-4 space-y-2">
                {group.rows.map(([title, text]) => (
                  <details key={title} className="group rounded-md bg-white px-4">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                      {title}
                      <Plus aria-hidden className="h-4 w-4 shrink-0 transition-transform duration-150 group-open:rotate-45" />
                    </summary>
                    <p className="pb-4 text-body-sm text-zinc-600">{text}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="klaim-garansi" className="kss-container py-10 lg:py-14">
        <h2 id="klaim-garansi" className={SECTION_TITLE}>
          Prosedur klaim garansi
        </h2>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CLAIM_STEPS.map((step, index) => (
            <li key={step} className="rounded-md bg-block-clay p-5">
              <span className="kss-num text-body-sm font-semibold text-orange-800">0{index + 1}</span>
              <p className="mt-3 text-body-sm text-ink">{step}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-start gap-2 text-body-sm text-zinc-600">
          <Truck aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          Untuk unit kiriman luar kota, biaya ekspedisi klaim ditanggung konsumen kecuali disepakati lain saat
          pembelian.
        </p>
      </section>

      <section aria-labelledby="lokasi" className="kss-container grid grid-cols-1 gap-4 pb-10 lg:grid-cols-12 lg:pb-14">
        <div className="overflow-hidden rounded-lg border border-line lg:col-span-8">
          <iframe
            title={`Lokasi KSS Komputer di ${STORE_AREA}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full border-0 lg:h-full"
          />
        </div>
        <div className="rounded-lg border border-line bg-white p-5 lg:col-span-4">
          <h2 id="lokasi" className="font-display text-2xl font-bold text-ink">
            Lokasi &amp; jam
          </h2>
          <dl className="mt-4 divide-y divide-line border-y border-line text-body-sm">
            {[
              ['Alamat', STORE_ADDRESS],
              ['Jam', STORE_OPERATIONAL_HOURS],
              ['Garansi', STORE_WARRANTY_TEXT],
            ].map(([key, value]) => (
              <div key={key} className="grid grid-cols-[72px_1fr] gap-3 py-3">
                <dt className="kss-label pt-0.5 text-zinc-500">{key}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="kss-btn-outline mt-5 h-11 w-full">
            <MapPin aria-hidden className="h-4 w-4" />
            Buka di Google Maps
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="kss-link mt-4 inline-flex items-center gap-2 text-body-sm">
            <MessageCircle aria-hidden className="h-4 w-4" />
            Chat teknisi di WhatsApp
          </a>
        </div>
      </section>

      <section aria-labelledby="tanya-umum" className="kss-container max-w-3xl pb-10 lg:pb-14">
        <h2 id="tanya-umum" className={SECTION_TITLE}>
          Pertanyaan umum
        </h2>
        <div className="mt-5 space-y-2">
          {STORE_FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-md border border-line bg-white px-4">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <Plus aria-hidden className="h-4 w-4 shrink-0 transition-transform duration-150 group-open:rotate-45" />
              </summary>
              <p className="pb-4 pr-8 text-body text-zinc-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
