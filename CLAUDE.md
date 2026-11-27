# KSS Komputer — Next.js 16 + Tailwind 4 · balas berbahasa Indonesia

## Hemat token (wajib)
- Jangan list/rekursif/grep: node_modules, .next, .git, package-lock.json, tsconfig.tsbuildinfo. List hanya `src/<subfolder>` satu per satu.
- File besar jangan dibaca utuh; pakai `grep -n` lalu `sed -n 'a,bp'`: src/lib/mock-data.ts (74KB), HomeClient.tsx (35KB), FilterSidebar.tsx (28KB), KonsultasiClient.tsx (25KB), PaketDetailClient.tsx (22KB). WORK_ORDERS.md (46KB, riwayat) jangan dibaca kecuali diminta.
- Batch tool independen; jangan baca ulang file yang baru ditulis.
- Eksplorasi/audit besar → sub-agent, ringkasan ≤15 baris. Hasil panjang ke file.
- Laporan akhir: apa berubah + apa belum diverifikasi. Jangan ulangi isi dokumen.

## Lingkungan (container cloud ↔ PC pemilik via device bridge)
- Jika tak ada `device_bash`/node_modules/jaringan npm (cek dulu, jangan asumsi) → tsc/lint/build dijalankan pemilik.
- Alur: `device_stage_files` (seperlunya) → edit di /mnt/user-data/outputs/<path relatif> → `device_commit_files` → minta pemilik jalankan: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run check:price`.
- Cek ikon lucide: stage sekali `node_modules/lucide-react/dist/lucide-react.d.ts`, lalu `grep "declare const NamaIkon:"`. Jangan list folder icons.
- AGENTS.md §2 "jangan sub-agent" (agen OpenCode lama) ditimpa instruksi pemilik: sub-agent dipakai (Opus merancang, Sonnet mengerjakan).

- File ini menimpa urutan baca di README.md & AGENTS.md §2 ("baca semua dokumen dulu"): baca dokumen hanya sesuai peta di bawah.

## Aturan bisnis
- Dilarang harga satuan part di publik; hanya total paket, delta upgrade, harga jasa. Data harga hanya lewat server-catalog/server-pricing + DTO tersanitasi (AGENTS.md §1.1).

## Visual v2 (detail: DESIGN.md; sumber kebenaran: src/app/globals.css)
- Hero & footer chapter gelap `bg-zinc-950`, isi terang; hairline, bukan shadow besar.
- Satu aksi orange-700 per layar. WhatsApp = tombol ink; hijau `#00803F` hanya Tokopedia.
- Radius maks 6px. Tanpa gradient, blur, shadow besar, emoji, ikon `Sparkles`. Sentence case.
- Angka `font-mono tabular-nums` via komponen `Price`; pakai kelas `kss-*` dari globals.css.
- DESIGN.md & UI_FIGCRAFT_SKILL.md sudah v2. WORK_ORDERS.md §2 usang (CTA biru) — abaikan.
- Profesional, modern, tidak "AI slop". Tanpa `// TODO`.

## Baca hanya bila relevan
- AGENTS.md (±5KB): aturan kerja & bisnis — saat ragu soal harga/alur.
- DESIGN.md: token — hanya saat mengubah UI.
- UI_FIGCRAFT_SKILL.md: pola komponen — saat membuat/mengubah komponen.
- ARCHITECTURE.md: arsitektur data — hanya saat menyentuh data/route/harga.
- ROADMAP.md: progres — saat ditanya status/fase.
- README.md: fitur & route — jarang perlu.
- design/figcraft: sumber desain — hanya bila diminta.
- public/images/tokopedia/README.md: daftar foto — saat memilih foto.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
