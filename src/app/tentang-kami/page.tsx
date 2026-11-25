import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  PhoneCall,
  Wrench,
  Users,
  Cpu,
  CheckCircle2,
  Award,
  Truck,
  MessageSquareCheck,
} from 'lucide-react';
import {
  STORE_ADDRESS,
  STORE_OPERATIONAL_HOURS,
  STORE_WARRANTY_TEXT,
  ADMIN_WHATSAPP,
} from '@/lib/constants';
import { DEFAULT_WHATSAPP_PHONE, generateCustomBuildWAMessage } from '@/lib/format';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema } from '@/lib/seo';
import { STORE_FAQS } from '@/lib/faq';

export const metadata: Metadata = {
  title: 'Tentang Kami — Bengkel Rakit & Servis PC KSS Komputer',
  description:
    'Profil KSS Komputer: bengkel rakit dan servis PC di Mangga Dua Mall Jakarta. Teknisi berpengalaman, standar QC, garansi toko, dan alur klaim yang jelas.',
  alternates: {
    canonical: '/tentang-kami',
  },
};

const TEAM = [
  {
    role: 'Lead System Integrator',
    focus: 'Perakitan, BIOS tuning, dan validasi kompatibilitas komponen.',
    icon: Cpu,
  },
  {
    role: 'Hardware & Servicing Specialist',
    focus: 'Diagnosis kerusakan, repaste thermal, dan upgrade hardware.',
    icon: Wrench,
  },
  {
    role: 'QC & Cable Management',
    focus: 'Stress test, kerapian kabel, dan pemeriksaan akhir sebelum serah terima.',
    icon: ShieldCheck,
  },
];

export default function TentangKamiPage() {
  const waUrl = `https://wa.me/${ADMIN_WHATSAPP}`;

  return (
    <div className="kss-container py-8">
      <JsonLd data={faqSchema(STORE_FAQS)} />
      <nav className="mb-4 flex items-center gap-1.5 font-mono text-xs text-zinc-500">
        <Link href="/" className="hover:text-orange-700">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Tentang Kami</span>
      </nav>

      {/* Hero */}
      <section className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8">
        <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-tight text-orange-700 dark:text-orange-400">
          <Wrench className="h-3.5 w-3.5" />
          <span>Bengkel Rakit &amp; Servis PC</span>
        </div>
        <h1 className="max-w-3xl text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Bukan sekadar toko online — kami merakit, menguji, dan merawat PC Anda.
        </h1>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-500 sm:text-sm">
          KSS Komputer beroperasi sebagai system integrator dan service center di Mangga Dua
          Mall, Jakarta. Setiap unit melewati pemeriksaan kompatibilitas, perakitan rapi,
          stress test, dan quality control sebelum diserahkan ke konsumen.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: '8+', label: 'Tahun Pengalaman' },
            { value: '2.500+', label: 'Unit Dirakit' },
            { value: '3', label: 'Teknisi Inti' },
            { value: '4.9/5', label: 'Rating Konsumen' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="font-mono text-lg font-black tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
                {stat.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-tight text-zinc-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Konsultasi via WhatsApp</span>
          </a>
          <Link
            href="/konsultasi"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2.5 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <MessageSquareCheck className="h-4 w-4 text-orange-700 dark:text-orange-400" />
            <span>Mulai Wizard Konsultasi</span>
          </Link>
        </div>
      </section>

      {/* Nilai / Standar */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Standar Perakitan',
            body: 'Penanganan antistatik, routing kabel rapi, dan pengecekan ulang setiap konektor sebelum unit dinyalakan.',
            icon: Wrench,
          },
          {
            title: 'Stress Test & QC',
            body: 'Pengujian beban CPU/GPU, pemantauan suhu, dan verifikasi stabilitas sebelum unit diserahkan.',
            icon: Award,
          },
          {
            title: 'Garansi & After-Sales',
            body: 'Garansi resmi distributor ditambah garansi toko. Klaim ditangani langsung oleh teknisi yang merakit.',
            icon: ShieldCheck,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <Icon className="mb-2 h-5 w-5 text-orange-700 dark:text-orange-400" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
                {item.body}
              </p>
            </div>
          );
        })}
      </section>

      {/* Tim & Bengkel */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Users className="h-4 w-4 text-orange-700 dark:text-orange-400" />
            <span>Tim Teknisi</span>
          </h2>
          <div className="space-y-3">
            {TEAM.map((member) => {
              const Icon = member.icon;
              return (
                <div
                  key={member.role}
                  className="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                    <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {member.role}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
                      {member.focus}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Cpu className="h-4 w-4 text-orange-700 dark:text-orange-400" />
            <span>Workstation &amp; Area Kerja</span>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { title: 'Meja Perakitan', text: 'Area kerja antistatik dengan pencahayaan merata.' },
              { title: 'Bench Diagnosis', text: 'Pengecekan komponen, memori, dan storage.' },
              { title: 'Stress Test Station', text: 'Uji beban dan pemantauan suhu sebelum QC.' },
              { title: 'Packing & Serah Terima', text: 'Packing aman untuk pickup maupun ekspedisi.' },
            ].map((area) => (
              <div
                key={area.title}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>{area.title}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-500">
                  {area.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lokasi */}
      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
          <iframe
            title="Lokasi KSS Komputer di Mangga Dua Mall Jakarta"
            src="https://www.google.com/maps?q=Mangga%20Dua%20Mall%20Jakarta&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0"
          />
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Lokasi &amp; Jam Operasional
          </h2>
          <ul className="space-y-3 text-[11px] text-zinc-600 dark:text-zinc-500">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-700 dark:text-orange-400" />
              <span>{STORE_ADDRESS}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-700 dark:text-orange-400" />
              <span>{STORE_OPERATIONAL_HOURS}</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{STORE_WARRANTY_TEXT}</span>
            </li>
          </ul>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Buka di Google Maps</span>
          </a>
        </div>
      </section>

      {/* Garansi */}
      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Prosedur Klaim Garansi</span>
        </h2>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'Hubungi teknisi dengan kode order / nota.',
            'Jelaskan gejala dan sertakan foto bila ada.',
            'Unit dicek ulang untuk verifikasi penyebab.',
            'Perbaikan atau penggantian sesuai cakupan garansi.',
          ].map((step, index) => (
            <li
              key={step}
              className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-tight text-orange-700 dark:text-orange-400">
                Langkah {index + 1}
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-500">
                {step}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
          <Truck className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <span>
            Untuk unit kiriman luar kota, biaya ekspedisi klaim ditanggung konsumen kecuali
            disepakati lain saat pembelian.
          </span>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Pertanyaan Umum
        </h2>
        <div className="divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
          {STORE_FAQS.map((faq) => (
            <details key={faq.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <span>{faq.q}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-500">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-8 flex flex-col items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row">
        <div>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Siap merakit PC atau butuh servis?
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
            Teknisi kami siap membantu memilih spesifikasi yang paling masuk akal untuk budget Anda.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <a
            href={generateCustomBuildWAMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-700 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-orange-800"
          >
            <MessageSquareCheck className="h-4 w-4" />
            <span>Konsultasi Rakit via WA</span>
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2.5 text-xs font-bold text-zinc-800 transition-colors hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <PhoneCall className="h-4 w-4 text-emerald-500" />
            <span>WhatsApp</span>
          </a>
        </div>
      </section>

      <p className="mt-4 text-center font-mono text-[10px] text-zinc-500">
        KSS Komputer · {DEFAULT_WHATSAPP_PHONE.replace(/^62/, '0')} · {STORE_ADDRESS}
      </p>
    </div>
  );
}
