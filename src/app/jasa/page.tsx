import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Clock,
  ShieldCheck,
  PhoneCall,
  ChevronRight,
  Check,
} from 'lucide-react';
import { getPublicServices } from '@/lib/server-catalog';
import { formatIDR, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema } from '@/lib/seo';
import { SERVICE_FAQS } from '@/lib/faq';

export const metadata: Metadata = {
  title: 'Jasa Rakit, Servis & Maintenance PC — KSS Komputer',
  description:
    'Layanan rakit PC, servis, upgrade, instalasi ulang, dan maintenance oleh teknisi KSS Komputer di Mangga Dua Mall Jakarta. Booking via WhatsApp.',
  alternates: {
    canonical: '/jasa',
  },
};

export default function JasaLayananPage() {
  const services = getPublicServices();

  return (
    <div>
      <JsonLd data={faqSchema(SERVICE_FAQS)} />
      <PageHeader
        eyebrow="Service & Assembly Center"
        title="Layanan Jasa Rakit, Servis & Maintenance"
        description="Dikerjakan teknisi KSS dengan penanganan antistatik, thermal paste premium, dan pengujian stabilitas sebelum serah terima."
        actions={
          <>
            <a
              href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                'Halo Teknisi KSS Komputer, saya ingin konsultasi jadwal service/rakit PC'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-wa"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Chat Teknisi</span>
            </a>
            <Link href="/konsultasi" className="kss-btn-outline">
              Konsultasi Budget
            </Link>
          </>
        }
      />

      <div className="kss-container py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-zinc-500">
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{services.length}</span> layanan tersedia
          </div>
          <div className="flex items-center gap-1.5 font-mono text-meta text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Garansi pengerjaan toko
          </div>
        </div>

        {/* Grid Layanan Jasa */}
        <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((srv) => (
            <article
              key={srv.id}
              className="group flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/10">
                    <Clock className="h-4 w-4 text-orange-700 dark:text-orange-400" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {srv.badge && (
                      <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-micro font-bold uppercase text-amber-700 dark:text-amber-400">
                        {srv.badge}
                      </span>
                    )}
                    <span className="font-mono text-micro text-zinc-500">{srv.duration}</span>
                  </div>
                </div>

                <h2 className="text-base font-bold leading-snug tracking-tight text-zinc-900 dark:text-zinc-100">
                  {srv.title}
                </h2>

                <div className="kss-price mt-2 text-lg text-zinc-900 dark:text-zinc-100">
                  {srv.price === 0 ? 'GRATIS' : formatIDR(srv.price)}
                  {srv.priceMax && srv.priceMax > srv.price && (
                    <span className="ml-1 text-xs font-semibold text-zinc-500">
                      - {formatIDR(srv.priceMax)}
                    </span>
                  )}
                </div>

                <p className="mt-2 line-clamp-2 text-meta leading-relaxed text-zinc-500 dark:text-zinc-500">
                  {srv.description}
                </p>

                <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <div className="mb-1.5 font-mono text-micro font-bold uppercase tracking-wider text-zinc-500">
                    Cakupan
                  </div>
                  <ul className="space-y-1">
                    {srv.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-meta text-zinc-600 dark:text-zinc-500">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href={`/jasa/${srv.slug}`} className="kss-btn-outline h-9 px-2">
                  <span>Lihat Detail</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                    `Halo KSS Komputer, saya ingin booking layanan: *${srv.title}*`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kss-btn-dark h-9 px-2"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Booking</span>
                </a>
              </div>
            </article>
          ))}
        </div>

      {/* FAQ Jasa */}
      <section id="faq" className="mb-8 scroll-mt-24">
        <h2 className="text-sm font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-700" />
          <span>Pertanyaan yang Sering Diajukan</span>
        </h2>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
          {SERVICE_FAQS.map((faq) => (
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
        <div className="mt-3 text-center text-meta text-zinc-500">
          Butuh layanan lain?{' '}
          <a
            href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-700 hover:text-emerald-700 dark:text-emerald-400"
          >
            Hubungi teknisi kami langsung via WhatsApp.
          </a>
        </div>
      </section>

      {/* Standar Prosedur Operasional (SOP) Teknisi KSS */}
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
          <ShieldCheck className="h-4 w-4 text-orange-700" />
          <span>Standar Mutu Layanan Teknisi KSS</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 text-xs text-zinc-600 dark:text-zinc-500 sm:grid-cols-3">
          <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">1. Anti-Static Handling</div>
            <p className="text-meta leading-relaxed">
              Peralatan antistatik digunakan untuk melindungi motherboard dan prosesor dari lonjakan listrik statis yang tidak kasat mata.
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">2. Thermal Paste Berlisensi</div>
            <p className="text-meta leading-relaxed">
              Menggunakan pasta termal resmi Thermal Grizzly Kryonaut atau Arctic MX-4 dengan konduktivitas panas di atas 8.5 W/mK.
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">3. Laporan Uji Suhu &amp; Beban</div>
            <p className="text-meta leading-relaxed">
              Setelah pengerjaan, unit melalui pengujian Cinebench &amp; Furmark dengan dokumentasi suhu idle dan full load sebelum diserahkan.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
