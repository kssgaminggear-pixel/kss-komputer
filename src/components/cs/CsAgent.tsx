'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Loader2, MessageCircle, PhoneCall, Send, ShieldCheck, X } from 'lucide-react';
import { DEFAULT_WHATSAPP_PHONE } from '@/lib/format';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Rekomendasi PC budget 10 juta',
  'Beda paket vs rakit sendiri',
  'Jasa cleaning / servis',
  'Cara cek pesanan',
];

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'Halo, saya KSS CS Agent. Saya aktif 24 jam. Ceritakan budget dan kebutuhan Anda—gaming, desain, office, atau servis—nanti saya arahkan ke paket atau layanan yang paling cocok.',
};

export function CsAgent() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/penawaran')) {
    return null;
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setIsOffline(false);

    try {
      const response = await fetch('/api/cs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await response.json()) as { reply?: string; message?: string };

      if (!response.ok || !data.reply) {
        setIsOffline(true);
        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            content:
              'Koneksi ke CS AI sedang terputus. Anda tetap bisa lanjut ke WhatsApp teknisi KSS untuk respon manual.',
          },
        ]);
        return;
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply as string },
      ]);
    } catch {
      setIsOffline(true);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'CS AI tidak dapat dihubungi saat ini. Silakan lanjut ke WhatsApp teknisi KSS.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const waUrl = `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
    'Halo KSS Komputer, saya ingin konsultasi dari website.'
  )}`;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-md border border-orange-500/30 bg-orange-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-500 md:bottom-6 print:hidden"
          aria-label="Buka CS Agent KSS 24 jam"
        >
          <MessageCircle className="h-4 w-4" />
          <span>CS 24 Jam</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="KSS CS Agent 24 jam"
          className="fixed bottom-20 right-4 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm md:bottom-6 print:hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 bg-orange-600 px-3.5 py-3 text-white">
            <Image
              src="/images/brand/kss-logo-light.png"
              width={32}
              height={32}
              alt="KSS Komputer"
              className="h-8 w-8 rounded-sm bg-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black tracking-tight">KSS CS Agent</div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-orange-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>Online 24 Jam · AI + teknisi</span>
              </div>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center gap-1 rounded-sm bg-white/15 px-2 text-[10px] font-bold text-white transition-colors hover:bg-white/25"
            >
              <PhoneCall className="h-3 w-3" />
              WA
            </a>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              aria-label="Tutup CS Agent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-zinc-50 p-3" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-md px-3 py-2 text-[11px] leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'border border-zinc-200 bg-white text-zinc-700'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-2 text-[11px] text-zinc-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Mengetik...
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-sm border border-zinc-200 bg-white px-2 py-1 text-left text-[10px] font-semibold text-zinc-600 transition-colors hover:border-orange-300 hover:text-orange-600"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-200 bg-white p-2.5">
            <form onSubmit={handleSubmit} className="flex items-end gap-1.5">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={1000}
                placeholder="Tulis pertanyaan Anda..."
                className="max-h-24 min-h-9 flex-1 resize-none rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-600 text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
                aria-label="Kirim pesan"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[9px] text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Harga part tidak ditampilkan
              </span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold transition-colors hover:text-emerald-600 ${
                  isOffline ? 'text-emerald-600' : 'text-zinc-500'
                }`}
              >
                Lanjut ke WhatsApp teknisi
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
