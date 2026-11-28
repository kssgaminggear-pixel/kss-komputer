import React from 'react';
import { Price } from '@/components/ui/Price';
import type { ServicePackage } from '@/lib/types';

const PROCESS_STEPS: Array<[string, string]> = [
  ['Validasi', 'Cek socket, RAM, clearance, dan daya.'],
  ['Rakit', 'Perakitan rapi dengan cable management.'],
  ['Stress test', 'Uji beban CPU/GPU, pantau suhu.'],
  ['Serah terima', 'QC akhir, packing aman, garansi aktif.'],
];

const NUMBER = 'text-[clamp(2.5rem,5vw,4.5rem)] leading-none text-ink';

/** Angka hanya berasal dari data layanan atau copy yang sudah tayang. */
export function HomeFacts({ services }: { services: ServicePackage[] }) {
  const prices = services.map((service) => service.price).filter((price) => price > 0);
  return (
    <section aria-labelledby="alur-kerja" className="kss-block-butter kss-wave-top py-12 lg:py-20">
      <div className="kss-container">
        <h2 id="alur-kerja" className="text-h2 text-ink">
          Dari cek sampai serah terima
        </h2>

        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          <li>
            <span className={`kss-num block font-semibold ${NUMBER}`}>{services.length}</span>
            <span className="mt-2 block text-body text-ink-soft">layanan jasa</span>
          </li>
          {prices.length > 0 && (
            <li>
              <Price value={Math.min(...prices)} className={`block ${NUMBER}`} />
              <span className="mt-2 block text-body text-ink-soft">biaya jasa paling rendah</span>
            </li>
          )}
          <li>
            <span className={`kss-num block font-semibold ${NUMBER}`}>Gratis</span>
            <span className="mt-2 block text-body text-ink-soft">konsultasi kebutuhan PC</span>
          </li>
        </ul>

        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map(([title, detail], index) => (
            <li key={title} className="rounded-lg bg-paper p-5">
              <span className="kss-num text-micro font-semibold text-orange-800">0{index + 1}</span>
              <h3 className="mt-3 text-title text-ink">{title}</h3>
              <p className="mt-1 text-body-sm text-ink-soft">{detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
