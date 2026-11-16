'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Cpu,
  MessageSquareCheck,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';
import type { ServicePackage } from '@/lib/types';
import {
  formatIDR,
  generateConsultationWAMessage,
  generateServiceBookingWAMessage,
  DEFAULT_WHATSAPP_PHONE,
} from '@/lib/format';
import { SERVICE_DEVICE_TYPES } from '@/lib/constants';

type Goal = 'rakit' | 'upgrade' | 'servis';

interface KonsultasiClientProps {
  prebuilts: PublicPrebuiltPCDTO[];
  services: ServicePackage[];
}

const GOAL_OPTIONS: { id: Goal; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: 'rakit',
    label: 'Rakit PC Baru',
    description: 'Mulai dari nol sesuai budget dan kebutuhan.',
    icon: Cpu,
  },
  {
    id: 'upgrade',
    label: 'Upgrade PC Lama',
    description: 'Tambah performa tanpa membeli unit baru.',
    icon: Sparkles,
  },
  {
    id: 'servis',
    label: 'Konsultasi Servis',
    description: 'PC/laptop bermasalah dan butuh diagnosis.',
    icon: Wrench,
  },
];

const USAGE_OPTIONS = [
  { id: 'gaming-1080p', label: 'Gaming 1080p', tags: ['gaming-1080p'] },
  { id: 'gaming-1440p', label: 'Gaming 1440p', tags: ['gaming-1440p'] },
  { id: 'gaming-4k', label: 'Gaming 4K', tags: ['sultan-4k'] },
  { id: 'creator', label: 'Editing / Desain', tags: ['creator'] },
  { id: 'workstation', label: '3D / AI / Workstation', tags: ['workstation'] },
  { id: 'office', label: 'Office / Administrasi', tags: ['office'] },
];

const SERVICE_NEEDS = [
  'Tidak menyala / mati total',
  'Cepat panas / restart sendiri',
  'Sangat lambat / lemot',
  'Upgrade SSD atau RAM',
  'Instalasi ulang OS',
  'Deep cleaning & repaste',
];

const BUDGET_MIN = 4_000_000;
const BUDGET_MAX = 50_000_000;
const BUDGET_STEP = 500_000;

export default function KonsultasiClient({ prebuilts, services }: KonsultasiClientProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal>('rakit');
  const [budget, setBudget] = useState(10_000_000);
  const [problem, setProblem] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  const [platform, setPlatform] = useState('Bebas');
  const [color, setColor] = useState('Bebas');
  const [formFactor, setFormFactor] = useState('PC only');
  const [deviceType, setDeviceType] = useState<string>(SERVICE_DEVICE_TYPES[0]);
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleNeed = (id: string) => {
    setNeeds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const selectedUsageTags = useMemo(
    () =>
      USAGE_OPTIONS.filter((option) => needs.includes(option.id)).flatMap((option) => option.tags),
    [needs]
  );

  const recommendations = useMemo(() => {
    if (goal === 'servis') {
      return [...services]
        .sort((a, b) => Number(b.popular || false) - Number(a.popular || false))
        .slice(0, 2);
    }

    const ranked = [...prebuilts].sort((a, b) => {
      const aMatch = selectedUsageTags.includes(a.categoryTag) ? 0 : 1;
      const bMatch = selectedUsageTags.includes(b.categoryTag) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return Math.abs(a.totalBundlePrice - budget) - Math.abs(b.totalBundlePrice - budget);
    });

    return ranked.slice(0, 2);
  }, [goal, services, prebuilts, selectedUsageTags, budget]);

  const activeNeeds = needs;
  const needsLabel = goal === 'servis'
    ? activeNeeds.length > 0
      ? activeNeeds.join(', ')
      : 'Konsultasi servis umum'
    : USAGE_OPTIONS.filter((option) => needs.includes(option.id))
        .map((option) => option.label)
        .join(', ') || 'Kebutuhan umum';

  const buildWaUrl = () => {
    if (goal === 'servis') {
      return generateServiceBookingWAMessage(DEFAULT_WHATSAPP_PHONE, {
        serviceTitle: 'Konsultasi Servis',
        customerName: customerName.trim() || 'Calon Konsumen',
        deviceType,
        problemDescription: `${problem.trim() || 'Butuh konsultasi servis.'}\nKebutuhan: ${needsLabel}`,
      });
    }

    return generateConsultationWAMessage(DEFAULT_WHATSAPP_PHONE, {
      customerName: customerName.trim() || undefined,
      budget,
      usageNeed: needsLabel,
      brandPreference: platform === 'Bebas' ? undefined : platform,
      targetResolution: color === 'Bebas' ? undefined : `Warna ${color} / ${formFactor}`,
      notes: problem.trim() || undefined,
    });
  };

  const handleNext = () => {
    if (step === 2 && goal === 'servis' && !problem.trim() && needs.length === 0) {
      setError('Ceritakan keluhan atau pilih minimal satu jenis penanganan.');
      return;
    }
    setError(null);
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    setStep(1);
    setGoal('rakit');
    setBudget(10_000_000);
    setProblem('');
    setNeeds([]);
    setPlatform('Bebas');
    setColor('Bebas');
    setFormFactor('PC only');
    setDeviceType(SERVICE_DEVICE_TYPES[0]);
    setCustomerName('');
    setError(null);
  };

  return (
    <div className="kss-container max-w-4xl py-8">
      <nav className="mb-4 flex items-center gap-1.5 font-mono text-xs text-zinc-500">
        <Link href="/" className="hover:text-blue-600">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Konsultasi Budget</span>
      </nav>

      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-tight text-blue-600 dark:text-blue-400">
          <MessageSquareCheck className="h-3.5 w-3.5" />
          <span>Wizard Konsultasi</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Konsultasi Rakit &amp; Servis Sesuai Budget
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">
          Jawab 4 pertanyaan singkat. Kami tampilkan rekomendasi terdekat dan siapkan
          pesan WhatsApp berisi kebutuhan Anda.
        </p>
      </header>

      {/* Progress */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-400">
          <span>Langkah {step} dari 5</span>
          <span>{Math.round((step / 5) * 100)}%</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`h-1.5 rounded-md ${
                index <= step ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-6">
        {step === 1 && (
          <section>
            <h2 className="mb-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Apa yang ingin Anda lakukan?
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {GOAL_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = goal === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setGoal(option.id);
                      setNeeds([]);
                      setError(null);
                    }}
                    className={`rounded-md border p-4 text-left transition-colors ${
                      isActive
                        ? 'border-blue-500/40 bg-blue-500/5'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <Icon className={`mb-2 h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`} />
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {option.label}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="mb-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {goal === 'servis' ? 'Ceritakan masalahnya' : 'Berapa budget Anda?'}
            </h2>
            <p className="mb-4 text-[11px] text-zinc-500 dark:text-zinc-400">
              {goal === 'servis'
                ? 'Jelaskan gejala yang muncul agar teknisi bisa menyiapkan estimasi.'
                : 'Geser slider untuk memperkirakan budget. Rekomendasi mengikuti angka ini.'}
            </p>

            {goal !== 'servis' ? (
              <>
                <div className="mb-2 font-mono text-2xl font-black tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
                  {formatIDR(budget)}
                </div>
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="w-full accent-blue-600"
                  aria-label="Budget konsultasi"
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400">
                  <span>{formatIDR(BUDGET_MIN)}</span>
                  <span>{formatIDR(BUDGET_MAX)}+</span>
                </div>
              </>
            ) : (
              <textarea
                rows={4}
                value={problem}
                onChange={(event) => setProblem(event.target.value)}
                placeholder="Contoh: PC menyala tapi tidak ada tampilan, kipas berputar kencang..."
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="mb-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {goal === 'servis' ? 'Jenis penanganan' : 'Kebutuhan utama'}
            </h2>
            <p className="mb-4 text-[11px] text-zinc-500 dark:text-zinc-400">
              Boleh pilih lebih dari satu.
            </p>
            <div className="flex flex-wrap gap-2">
              {(goal === 'servis'
                ? SERVICE_NEEDS
                : USAGE_OPTIONS.map((option) => option.label)
              ).map((label) => {
                const id = goal === 'servis'
                  ? label
                  : USAGE_OPTIONS.find((option) => option.label === label)?.id || label;
                const isActive = needs.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleNeed(id)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[11px] font-semibold transition-colors ${
                      isActive
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700'
                    }`}
                  >
                    {isActive && <Check className="h-3 w-3" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="mb-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Preferensi terakhir
            </h2>

            {goal === 'servis' ? (
              <div>
                <label htmlFor="device-type" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                  Tipe Perangkat
                </label>
                <select
                  id="device-type"
                  value={deviceType}
                  onChange={(event) => setDeviceType(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {SERVICE_DEVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                    Platform
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Bebas', 'AMD', 'Intel'].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPlatform(value)}
                        className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                          platform === value
                            ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            : 'border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                    Warna Casing
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Bebas', 'Hitam', 'Putih'].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setColor(value)}
                        className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                          color === value
                            ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            : 'border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                    Kelengkapan
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['PC only', 'Fullset'].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormFactor(value)}
                        className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                          formFactor === value
                            ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            : 'border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label htmlFor="consult-name" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                Nama (opsional)
              </label>
              <input
                id="consult-name"
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Nama Anda"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <h2 className="mb-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Rekomendasi untuk Anda
            </h2>
            <p className="mb-4 text-[11px] text-zinc-500 dark:text-zinc-400">
              {goal === 'servis'
                ? 'Layanan yang paling sering dipilih untuk keluhan serupa.'
                : `Paket terdekat dari budget ${formatIDR(budget)} dan kebutuhan Anda.`}
            </p>

            {goal === 'servis' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recommendations.map((service) => {
                  const srv = service as ServicePackage;
                  return (
                    <Link
                      key={srv.id}
                      href={`/jasa/${srv.slug}`}
                      className="flex flex-col justify-between rounded-md border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {srv.title}
                        </div>
                        <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {srv.description}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                          {srv.price === 0 ? 'GRATIS' : formatIDR(srv.price)}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">{srv.duration}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recommendations.map((pkg) => {
                  const prebuilt = pkg as PublicPrebuiltPCDTO;
                  return (
                    <Link
                      key={prebuilt.id}
                      href={`/paket-rakitan/${prebuilt.slug}`}
                      className="flex flex-col justify-between rounded-md border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                    >
                      <div>
                        <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-tight text-blue-600 dark:text-blue-400">
                          {prebuilt.categoryTag.replace(/-/g, ' ')}
                        </div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {prebuilt.name}
                        </div>
                        <div className="mt-1 font-mono text-[10px] text-zinc-400">
                          {prebuilt.parts.length} komponen · {prebuilt.targetResolution}
                        </div>
                      </div>
                      <div className="mt-3 font-mono text-sm font-black text-zinc-900 tabular-nums dark:text-zinc-100">
                        {formatIDR(prebuilt.totalBundlePrice)}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={buildWaUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <PhoneCall className="h-4 w-4" />
                <span>{goal === 'servis' ? 'Booking Servis via WA' : 'Minta Racikan Kustom via WA'}</span>
              </a>
              <Link
                href={goal === 'servis' ? '/jasa' : '/simulasi'}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <span>{goal === 'servis' ? 'Lihat Semua Layanan' : 'Coba Simulasi Rakit'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        )}

        {error && (
          <p className="mt-4 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
            >
              <span>Lanjut</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Mulai ulang</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-[11px] leading-relaxed text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <span>
          Harga paket yang tampil adalah harga total siap pakai. Harga satuan komponen
          tidak ditampilkan; penyesuaian upgrade dihitung sebagai selisih harga.
        </span>
      </div>
    </div>
  );
}
