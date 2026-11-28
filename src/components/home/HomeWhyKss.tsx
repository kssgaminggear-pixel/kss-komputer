import React from 'react';
import Link from 'next/link';
import { Check, ChevronDown, MessageCircle } from 'lucide-react';
import { MediaImage } from '@/components/ui/MediaImage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { generateCustomBuildWAMessage } from '@/lib/format';

const PROCESS_STEPS: Array<[string, string]> = [
  ['Validasi', 'Cek socket, RAM, clearance, dan daya.'],
  ['Rakit', 'Perakitan rapi dengan cable management.'],
  ['Stress test', 'Uji beban CPU/GPU, pantau suhu.'],
  ['Serah terima', 'QC akhir, packing aman, garansi aktif.'],
];

const COMPARISON: Array<[string, string, string]> = [
  ['Harga', 'Satu harga total di awal', 'Total baru diketahui setelah semua part dibeli'],
  ['Perakitan', 'Teknisi KSS + cable management', 'Sendiri atau cari jasa terpisah'],
  ['Pengujian', 'Stress test & QC sebelum serah terima', 'Tidak terjamin'],
  ['Garansi', 'Toko + distributor, klaim dibantu KSS', 'Klaim ke tiap distributor'],
  ['Kompatibilitas', 'Divalidasi sebelum rakit', 'Risiko salah socket, RAM, atau casing'],
];

export function HomeWhyKss({ unitImage }: { unitImage?: string }) {
  return (
    <section className="kss-section-alt">
      <div className="kss-container">
        <SectionHeader eyebrow="Kenapa KSS" title="Standar toko, bukan rakitan amatir" />

        <div className="grid grid-cols-1 overflow-hidden rounded-md border border-zinc-200 bg-white lg:grid-cols-12">
          <div className="flex items-center justify-center border-b border-zinc-200 bg-zinc-100 py-6 lg:col-span-3 lg:border-b-0 lg:border-r">
            <span className="relative block aspect-[4/5] w-40 overflow-hidden rounded-sm">
              <MediaImage src={unitImage} alt="Foto unit PC rakitan KSS" sizes="160px" />
            </span>
          </div>
          <div className="p-5 sm:p-8 lg:col-span-9">
            <h3 className="text-h3 text-zinc-950">Tidak ada unit keluar tanpa diuji.</h3>
            <ol className="mt-5 grid grid-cols-2 border-t border-zinc-200 lg:grid-cols-4">
              {PROCESS_STEPS.map(([title, detail], index) => (
                <li key={title} className="border-b border-zinc-200 py-4 pr-3 lg:border-b-0">
                  <span className="kss-num text-micro font-semibold text-orange-700">0{index + 1}</span>
                  <div className="mt-2 text-[14px] font-semibold text-zinc-950">{title}</div>
                  <p className="mt-1 text-body-sm text-zinc-600">{detail}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a href={generateCustomBuildWAMessage()} target="_blank" rel="noopener noreferrer" className="kss-btn-dark">
                <MessageCircle aria-hidden className="h-4 w-4" />
                Konsultasi rakit via WA
              </a>
              <Link href="/paket-rakitan" className="kss-btn-outline">
                Lihat paket siap pakai
              </Link>
            </div>
          </div>
        </div>

        <details className="group mt-4 rounded-md border border-zinc-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[14px] font-semibold text-zinc-950 [&::-webkit-details-marker]:hidden">
            Paket KSS vs beli part &amp; rakit sendiri
            <ChevronDown aria-hidden className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div role="table" className="border-t border-zinc-200 px-5 text-body-sm">
            <div role="row" className="hidden grid-cols-[180px_1fr_1fr] gap-6 border-b border-zinc-200 py-3 sm:grid">
              <span role="columnheader" className="kss-label text-zinc-500">Aspek</span>
              <span role="columnheader" className="kss-label text-zinc-950">Paket rakitan KSS</span>
              <span role="columnheader" className="kss-label text-zinc-500">Rakit sendiri</span>
            </div>
            {COMPARISON.map(([aspect, kss, self]) => (
              <div
                role="row"
                key={aspect}
                className="grid grid-cols-1 gap-x-6 gap-y-1 border-b border-zinc-200 py-3 last:border-b-0 sm:grid-cols-[180px_1fr_1fr]"
              >
                <span role="rowheader" className="kss-label text-zinc-500 sm:pt-0.5">{aspect}</span>
                <span role="cell" className="flex gap-2 font-medium text-zinc-950">
                  <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                  {kss}
                </span>
                <span role="cell" className="text-zinc-500">{self}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
