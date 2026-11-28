import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HomeServiceIntro({ total }: { total: number }) {
  return (
    <section className="py-12 lg:py-24">
      <div className="kss-container grid gap-5 lg:grid-cols-12 lg:items-end">
        <h2 className="max-w-[18ch] text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-balance text-ink lg:col-span-6">
          Layanan jasa rakit, servis &amp; maintenance
        </h2>
        <div className="lg:col-span-5 lg:col-start-8">
          <p className="max-w-[46ch] text-body text-ink-soft">
            Dari rakit PC baru sampai servis dan perawatan. Lihat durasi dan biaya jasanya, lalu booking lewat
            WhatsApp.
          </p>
          <Link href="/jasa" className="kss-btn-outline mt-5">
            Semua layanan · {total}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
