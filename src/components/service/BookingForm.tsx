'use client';

import React, { useState } from 'react';
import { CalendarClock, MessageSquareCheck, ShieldCheck } from 'lucide-react';
import { generateServiceBookingWAMessage } from '@/lib/format';
import { SERVICE_DEVICE_TYPES, TECHNICIAN_WHATSAPP } from '@/lib/constants';

export interface BookingFormProps {
  serviceTitle: string;
}

const TIME_OPTIONS = ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export function BookingForm({ serviceTitle }: BookingFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerWa, setCustomerWa] = useState('');
  const [deviceType, setDeviceType] = useState<string>(SERVICE_DEVICE_TYPES[0]);
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerName.trim() || !customerWa.trim() || !problemDescription.trim()) {
      setError('Nama, nomor WhatsApp, dan keluhan wajib diisi.');
      return;
    }

    setError(null);
    const url = generateServiceBookingWAMessage(TECHNICIAN_WHATSAPP, {
      serviceTitle,
      customerName: customerName.trim(),
      deviceType,
      problemDescription: problemDescription.trim(),
      preferredDate: preferredDate || undefined,
      preferredTime: preferredTime || undefined,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="booking-name" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
          Nama Lengkap
        </label>
        <input
          id="booking-name"
          type="text"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder="Contoh: Budi Santoso"
          className="w-full rounded-sm border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label htmlFor="booking-wa" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
          No. WhatsApp
        </label>
        <input
          id="booking-wa"
          type="tel"
          value={customerWa}
          onChange={(event) => setCustomerWa(event.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full rounded-sm border border-zinc-300 bg-white px-3 py-2 font-mono text-xs tabular-nums text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label htmlFor="booking-device" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
          Tipe Perangkat
        </label>
        <select
          id="booking-device"
          value={deviceType}
          onChange={(event) => setDeviceType(event.target.value)}
          className="w-full rounded-sm border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {SERVICE_DEVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="booking-problem" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
          Keluhan / Kebutuhan
        </label>
        <textarea
          id="booking-problem"
          rows={3}
          value={problemDescription}
          onChange={(event) => setProblemDescription(event.target.value)}
          placeholder="Ceritakan gejala kerusakan atau kebutuhan Anda..."
          className="w-full rounded-sm border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="booking-date" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
            Tanggal
          </label>
          <input
            id="booking-date"
            type="date"
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
            className="w-full rounded-sm border border-zinc-300 bg-white px-2.5 py-2 font-mono text-xs text-zinc-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <div>
          <label htmlFor="booking-time" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
            Jam
          </label>
          <select
            id="booking-time"
            value={preferredTime}
            onChange={(event) => setPreferredTime(event.target.value)}
            className="w-full rounded-sm border border-zinc-300 bg-white px-2.5 py-2 font-mono text-xs text-zinc-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="">Fleksibel</option>
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time} WIB
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-sm border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
      >
        <MessageSquareCheck className="h-4 w-4" />
        <span>Kirim Booking via WhatsApp</span>
      </button>

      <div className="flex items-start gap-2 border-t border-zinc-100 pt-3 text-[10px] text-zinc-500 dark:border-zinc-800">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
        <span>
          Pesan akan dibuat otomatis dan dikirim ke teknisi KSS. Jadwal dikonfirmasi
          manual sebelum pengerjaan.
        </span>
      </div>

      <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
        <CalendarClock className="h-3 w-3" />
        <span>Senin - Sabtu, 09:00 - 18:00 WIB</span>
      </div>
    </form>
  );
}
