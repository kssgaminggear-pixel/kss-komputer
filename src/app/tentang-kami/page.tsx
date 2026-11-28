import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MapPin, Truck, MessageCircle, ArrowUpRight, Plus } from 'lucide-react';
import {
  STORE_ADDRESS,
  STORE_AREA,
  STORE_OPERATIONAL_HOURS,
  STORE_WARRANTY_TEXT,
  ADMIN_WHATSAPP,
} from '@/lib/constants';
import { generateCustomBuildWAMessage } from '@/lib/format';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
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

const STATS = [
  { value: '24 jam', label: 'Stress test rakitan' },
  { value: '24 jam', label: 'CS online' },
  { value: String(getPublicServices().length), label: 'Layanan jasa' },
];

const STANDARDS = [
  {
    title: 'Standar perakitan',
    body: 'Routing kabel rapi, dan pengecekan ulang setiap konektor sebelum unit dinyalakan.',
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

function Breadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-micro text-zinc-500"
    >
      <Link href="/" className="transition-colors hover:text-zinc-950">
        Beranda
      </Link>
      <span aria-hidden className="text-zinc-300">
        /
      </span>
      <span aria-current="page" className="text-zinc-950">
        Tentang kami
      </span>
    </nav>
  );
}

export default function TentangKamiPage() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS)}`;
  const waUrl = `https://wa.me/${ADMIN_WHATSAPP}`;

  return (
    <>
      <JsonLd data={faqSchema(STORE_FAQS)} />

      <PageHeader
        breadcrumb={<Breadcrumb />}
        eyebrow="Bengkel rakit & servis PC"
        title="Kami merakit, menguji, dan merawat PC Anda."
        description="KSS Komputer adalah system integrator dan service center di Mangga Dua, Jakarta. Setiap unit melewati cek kompatibilitas, perakitan rapi, stress test, dan QC sebelum diserahkan."
        actions={
          <>
            <a
              href={generateCustomBuildWAMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-dark"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              Konsultasi via WhatsApp
            </a>
            <Link href="/konsultasi" className="kss-btn-outline">
              Mulai wizard konsultasi
            </Link>
          </>
        }
      />

      {/* Stat */}
      <div className="border-b border-zinc-200 bg-white">
        <dl className="kss-container grid grid-cols-2 divide-zinc-200 sm:grid-cols-3 sm:divide-x">
          {STATS.map((s) => (
            <div key={s.label} className="border-b border-zinc-200 py-6 sm:border-b-0 sm:px-6 sm:first:pl-0">
              <dt className="kss-label text-zinc-500">{s.label}</dt>
              <dd className="mt-2 font-mono text-[28px] font-semibold leading-none tracking-tight tabular-nums text-zinc-950">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Standar */}
      <section className="kss-section">
        <div className="kss-container">
          <SectionHeader eyebrow="Standar kerja" title="Tiga hal yang tidak kami tawar" />
          <ol className="kss-grid-hairline sm:grid-cols-3">
            {STANDARDS.map((s, i) => (
              <li key={s.title} className="p-6">
                <span className="kss-num text-micro font-semibold text-orange-700">0{i + 1}</span>
                <h3 className="mt-4 text-title text-zinc-950">{s.title}</h3>
                <p className="mt-2 text-body-sm text-zinc-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tim & area kerja */}
      <section className="kss-section-alt">
        <div className="kss-container grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-h3 text-zinc-950">Tim teknisi</h2>
            <dl className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
              {TEAM.map((m) => (
                <div key={m.role} className="grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <dt className="text-[14px] font-semibold text-zinc-950">{m.role}</dt>
                  <dd className="text-body-sm text-zinc-600">{m.focus}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-h3 text-zinc-950">Area kerja bengkel</h2>
            <dl className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
              {AREAS.map((a) => (
                <div key={a.title} className="grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <dt className="text-[14px] font-semibold text-zinc-950">{a.title}</dt>
                  <dd className="text-body-sm text-zinc-600">{a.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Klaim garansi */}
      <section className="kss-section">
        <div className="kss-container">
          <SectionHeader eyebrow="After-sales" title="Prosedur klaim garansi" />
          <ol className="kss-grid-hairline sm:grid-cols-2 lg:grid-cols-4">
            {CLAIM_STEPS.map((step, i) => (
              <li key={step} className="p-5">
                <span className="kss-num text-micro font-semibold text-orange-700">0{i + 1}</span>
                <p className="mt-3 text-body-sm text-zinc-800">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-start gap-2 text-body-sm text-zinc-600">
            <Truck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            Untuk unit kiriman luar kota, biaya ekspedisi klaim ditanggung konsumen kecuali
            disepakati lain saat pembelian.
          </p>
        </div>
      </section>

      {/* Lokasi */}
      <section className="kss-section-alt">
        <div className="kss-container grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="overflow-hidden rounded-md border border-zinc-200 lg:col-span-8">
            <iframe
              title={`Lokasi KSS Komputer di ${STORE_AREA}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0"
            />
          </div>
          <div className="lg:col-span-4">
            <h2 className="text-h3 text-zinc-950">Lokasi &amp; jam</h2>
            <dl className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200 text-body-sm">
              {[
                ['Alamat', STORE_ADDRESS],
                ['Jam', STORE_OPERATIONAL_HOURS],
                ['Garansi', STORE_WARRANTY_TEXT],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-3 py-3">
                  <dt className="kss-label pt-0.5 text-zinc-500">{k}</dt>
                  <dd className="text-zinc-800">{v}</dd>
                </div>
              ))}
            </dl>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-outline mt-5 w-full"
            >
              <MapPin aria-hidden className="h-4 w-4" />
              Buka di Google Maps
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-link mt-4 inline-flex items-center gap-2 text-body-sm"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              Chat teknisi di WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="kss-section">
        <div className="kss-container max-w-3xl">
          <h2 className="text-h2 text-zinc-950">Pertanyaan umum</h2>
          <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
            {STORE_FAQS.map((faq) => (
              <details key={faq.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold text-zinc-950 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <Plus
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150 group-open:rotate-45"
                  />
                </summary>
                <p className="pb-5 pr-8 text-body text-zinc-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
