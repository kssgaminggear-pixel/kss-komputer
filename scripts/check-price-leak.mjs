/**
 * Guard zero part-price leak.
 *
 * Memeriksa bundle client di `.next/static` agar nilai harga internal tidak ikut
 * terkirim ke browser. Nama field boleh muncul di chunk admin (kode form), tapi
 * nominal literal seperti `costPrice:530000` tidak boleh ada di mana pun.
 *
 * Jalankan setelah `npm run build`, atau lewat CI.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), '.next', 'static');
const EXTENSIONS = new Set(['.js', '.mjs', '.json']);

/** Literal angka setelah nama field harga = data katalog bocor. */
const FORBIDDEN = [
  { label: 'costPrice literal', pattern: /costPrice\s*:\s*\d/ },
  { label: 'sellPrice literal', pattern: /sellPrice\s*:\s*\d/ },
  { label: 'retail cost literal', pattern: /"costPrice"\s*:\s*\d/ },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }

  return files;
}

if (!fs.existsSync(ROOT)) {
  console.error(`[price-guard] folder ${ROOT} tidak ditemukan. Jalankan npm run build dulu.`);
  process.exit(1);
}

const hits = [];

for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const { label, pattern } of FORBIDDEN) {
    const match = text.match(pattern);
    if (match) {
      hits.push(`${path.relative(process.cwd(), file)} -> ${label} (${match[0]})`);
    }
  }
}

if (hits.length > 0) {
  console.error('[price-guard] Ditemukan nominal harga internal di bundle publik:');
  for (const hit of hits) console.error(`  - ${hit}`);
  process.exit(1);
}

console.log('[price-guard] Bersih: tidak ada nominal costPrice/sellPrice di bundle client.');
