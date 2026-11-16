# FigCraft Design Sources — KSS Komputer

Folder ini berisi sumber desain **FigCraft asli** (bukan mockup gambar) yang dipakai
sebagai acuan implementasi UI KSS.

## Tool

- App: **FigCraft 0.18.1** — <https://github.com/storytold/figcraft>
- CLI: `figcraft-cli` 0.18.1 (Windows portable release)
- Skill pendukung: <https://github.com/midasmatterhorn/artcraft-skills> (`figcraft`)
- Lisensi FigCraft: MIT OR Apache-2.0

Binary CLI **tidak** disimpan di repo. Unduh dari release resmi, verifikasi
`SHA256SUMS.txt`, lalu jalankan dari PATH.

## Isi

| File | Isi |
|---|---|
| `package-card.json` | Script FigCraft untuk kartu paket 420×440 |
| `kss-package-card.figcraft` | Dokumen FigCraft native (bisa dibuka/diedit) |
| `kss-package-card.png` | Render 2× untuk QA visual |
| `blueprint.json` | Script ilustrasi PC case industrial |
| `kss-blueprint.figcraft` | Dokumen FigCraft ilustrasi |
| `kss-blueprint.svg` | Hasil ekspor vektor untuk web |
| `kss-blueprint.png` | Render QA ilustrasi |
| `code.json` | Script `inspect.code` (React + Tailwind) |
| `generated/PackageCard.figcraft.tsx` | Kode React + Tailwind hasil Developer Mode FigCraft |

## Regenerate

```bash
# Kartu paket
figcraft-cli run design/figcraft/package-card.json \
  --out design/figcraft/kss-package-card.figcraft
figcraft-cli export design/figcraft/kss-package-card.figcraft \
  -o design/figcraft/kss-package-card.png --scale 2

# Blueprint + SVG untuk web
figcraft-cli run design/figcraft/blueprint.json \
  --out design/figcraft/kss-blueprint.figcraft
figcraft-cli export design/figcraft/kss-blueprint.figcraft \
  -o design/figcraft/kss-blueprint.svg --node "PC Case Blueprint"
cp design/figcraft/kss-blueprint.svg public/images/kss-pc-blueprint.svg

# Kode React + Tailwind dari frame Package Card
figcraft-cli run design/figcraft/code.json \
  --in design/figcraft/kss-package-card.figcraft
```

## Aturan

- Semua perubahan visual wajib mengikuti `UI_FIGCRAFT_SKILL.md`.
- Harga satuan komponen tidak boleh masuk ke frame publik atau kode publik.
- File `.figcraft` adalah sumber desain; PNG/SVG hanya hasil ekspor.
- Jika mengubah frame, ekspor ulang PNG dan SVG, lalu perbarui komponen web
  yang terkait.

## Catatan QA

- FigCraft 0.18.1 masih alpha; selalu buka ulang `.figcraft` setelah batch edit.
- `inspect.code` menghasilkan Tailwind literal (hex/px). Saat dipindahkan ke web,
  nilai tersebut dipetakan ke token/utility proyek, bukan disalin mentah.
