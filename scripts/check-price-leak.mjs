/**
 * Guard zero part-price leak (AGENTS.md §1.1).
 *
 * Memeriksa dua tempat yang sampai ke browser:
 *  1. `.next/static`     : bundle client (tidak boleh ada nominal harga literal).
 *  2. `.next/server/app` : HTML dan payload RSC hasil prerender.
 *
 * `retailPrice` hanya boleh ada pada aksesoris eceran, yaitu di halaman
 * /aksesoris dan section aksesoris di beranda.
 *
 * Batasan: halaman yang dirender saat request (tanpa file prerender) tidak
 * terpindai di sini. Bentuk DTO-nya dijaga oleh unit test sanitizer.
 *
 * Jalankan setelah `npm run build`, atau lewat CI.
 */
import fs from 'node:fs';
import path from 'node:path';

const STATIC_ROOT = path.resolve(process.cwd(), '.next', 'static');
const SERVER_ROOT = path.resolve(process.cwd(), '.next', 'server', 'app');

const STATIC_EXTENSIONS = new Set(['.js', '.mjs', '.json']);
/** Keluaran prerender saja; `.js` di folder server adalah kode yang tidak dikirim ke browser. */
const PRERENDER_FILE = /\.(html|rsc|body|meta)$/;

const STATIC_FORBIDDEN = [
  { label: 'costPrice literal', pattern: /costPrice"?\s*:\s*\d/ },
  { label: 'sellPrice literal', pattern: /sellPrice"?\s*:\s*\d/ },
  { label: 'retailPrice literal', pattern: /retailPrice"?\s*:\s*\d/ },
];

const SERVER_FORBIDDEN = [
  { label: 'field costPrice', pattern: /"costPrice"\s*:/ },
  { label: 'field sellPrice', pattern: /"sellPrice"\s*:/ },
  // Kategori khusus komponen rakitan tidak boleh membawa harga, di halaman mana pun.
  {
    label: 'harga pada komponen rakitan',
    pattern: /"category":"(?:cpu|motherboard|cooler|ram|gpu|ssd|hdd|psu|case)","(?:retailPrice|originalPrice|price)"/,
  },
];

const ACCESSORY_PRICE = { label: 'field retailPrice di luar halaman aksesoris', pattern: /"retailPrice"\s*:/ };
const ACCESSORY_PAGES = /^(index|aksesoris)(\.|\/|$)/;

/** Halaman komponen tidak boleh menampilkan nominal rupiah sama sekali. */
const RENDERED_RUPIAH = { label: 'nominal rupiah di halaman komponen', pattern: /Rp(?:\s|&nbsp;| )?\d/ };
const COMPONENT_PAGES = /^komponen(\.|\/|$)/;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const root of [STATIC_ROOT, SERVER_ROOT]) {
  if (!fs.existsSync(root)) {
    console.error(`[price-guard] folder ${root} tidak ditemukan. Jalankan npm run build dulu.`);
    process.exit(1);
  }
}

const hits = [];

function scan(file, text, rules) {
  for (const { label, pattern } of rules) {
    const match = text.match(pattern);
    if (match) {
      hits.push(`${path.relative(process.cwd(), file)} -> ${label} (${match[0]})`);
    }
  }
}

for (const file of walk(STATIC_ROOT)) {
  if (!STATIC_EXTENSIONS.has(path.extname(file))) continue;
  scan(file, fs.readFileSync(file, 'utf8'), STATIC_FORBIDDEN);
}

let prerendered = 0;
let packagePages = 0;

for (const file of walk(SERVER_ROOT)) {
  const relative = path.relative(SERVER_ROOT, file).split(path.sep).join('/');
  // Area admin dikunci src/proxy.ts dan memang menampilkan harga internal.
  if (!PRERENDER_FILE.test(relative) || /^admin(\.|\/|$)/.test(relative)) continue;

  prerendered += 1;
  if (relative.startsWith('paket-rakitan/')) packagePages += 1;

  // Payload RSC di dalam HTML meng-escape tanda kutip; samakan dulu bentuknya.
  const text = fs.readFileSync(file, 'utf8').replace(/\\+"/g, '"');
  const rules = [...SERVER_FORBIDDEN];
  if (!ACCESSORY_PAGES.test(relative)) rules.push(ACCESSORY_PRICE);
  if (COMPONENT_PAGES.test(relative)) rules.push(RENDERED_RUPIAH);
  scan(file, text, rules);
}

// Tanpa halaman paket yang terpindai, hasil "bersih" tidak berarti apa-apa.
if (packagePages === 0) {
  console.error('[price-guard] Tidak ada halaman paket hasil prerender yang terpindai. Periksa struktur .next/server/app.');
  process.exit(1);
}

if (hits.length > 0) {
  console.error(`[price-guard] ${hits.length} temuan harga yang tidak boleh publik:`);
  for (const hit of hits.slice(0, 40)) console.error(`  - ${hit}`);
  if (hits.length > 40) console.error(`  ... dan ${hits.length - 40} lainnya`);
  process.exit(1);
}

console.log(`[price-guard] Bersih: bundle client dan ${prerendered} file prerender tanpa harga part.`);
