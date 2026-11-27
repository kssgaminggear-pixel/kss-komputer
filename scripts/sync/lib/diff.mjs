/**
 * Aturan diff dan ambang pengaman sinkron katalog. Fungsi murni tanpa I/O.
 * Semua keputusan harga, takedown, dan boleh-tidaknya auto-merge ada di sini.
 */
import { createHash } from 'node:crypto';
import { parseSold } from '../../marketplace/parse-sold.mjs';

const STORE_PREFIX = 'https://www.tokopedia.com/ksskomputer/';

export const LIMITS = {
  priceJump: 0.4, // perubahan harga satu produk
  missingShare: 0.2, // produk hilang dalam satu run
  changedShare: 0.3, // produk yang harganya berubah
  visibleDrop: 0.25, // penurunan jumlah produk tampil
  newProducts: 50,
  rejectedShare: 0.1, // baris sumber tidak terbaca
  takedownRuns: 2,
};

export const sha1 = (value) => createHash('sha1').update(value).digest('hex');

export const isShown = (p) => p.status === 'active' && p.rating > 0 && p.sold > 0;

export function kebab(value, max = 70) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');
}

/** URL gambar Tokopedia bertanda tangan; hanya path-nya yang stabil. */
export function imageHash(url) {
  try {
    return sha1(new URL(url).pathname);
  } catch {
    return '';
  }
}

function toProduct(row, old, shelfIds, now) {
  const next = {
    id: row.id,
    slug: old?.slug || `${kebab(row.name)}-${row.id.slice(-6)}`,
    name: row.name.replace(/\s+/g, ' ').trim(),
    etalaseIds: row.etalaseIds.filter((id) => shelfIds.has(id)),
    // Keputusan pemilik: situs memakai harga normal toko, bukan harga setelah diskon Tokopedia.
    priceIdr: Math.max(row.price, row.originalPrice || 0),
    rating: Math.round(row.rating * 10) / 10,
    ...parseSold(row.soldLabel),
    stock: row.soldOut ? 'out_of_stock' : 'ready',
    description: old?.description || '',
    ...(old?.descriptionHash ? { descriptionHash: old.descriptionHash, descriptionBy: old.descriptionBy } : {}),
    image: old?.image || '',
    ...(old?.imageSourceHash ? { imageSourceHash: old.imageSourceHash } : {}),
    tokopediaUrl: row.url,
    status: 'active',
    missingRuns: 0,
    firstSeenAt: old?.firstSeenAt || now,
    syncedAt: old?.syncedAt || now,
  };
  // syncedAt hanya maju bila isi produk berubah, agar diff harian tetap kecil.
  if (old && JSON.stringify(comparable(old)) !== JSON.stringify(comparable(next))) next.syncedAt = now;
  return next;
}

const comparable = (p) => [
  p.name, p.etalaseIds, p.priceIdr, p.rating, p.sold, p.soldLabel, p.stock, p.tokopediaUrl, p.status,
];

export function diffCatalog(oldProducts, oldEtalase, snapshot) {
  const abort = (reason) => ({ aborted: reason });
  if (snapshot.failures?.length) return abort(`pengumpulan tidak lengkap: ${snapshot.failures.join(', ')}`);
  if (!snapshot.products?.length) return abort('snapshot tidak berisi produk');
  if (!snapshot.etalase?.length) return abort('snapshot tidak berisi etalase');

  const now = snapshot.fetchedAt;
  const rows = new Map();
  let rejected = 0;
  for (const row of snapshot.products) {
    if (!row.id || !row.name || !(row.price > 0) || !row.url?.startsWith(STORE_PREFIX)) rejected += 1;
    else rows.set(row.id, row);
  }
  if (rejected / snapshot.products.length > LIMITS.rejectedShare) {
    return abort(`${rejected} dari ${snapshot.products.length} baris sumber tidak terbaca`);
  }

  const oldShelves = new Map(oldEtalase.map((shelf) => [shelf.id, shelf]));
  const usedSlugs = new Set();
  const etalase = snapshot.etalase.map((shelf) => {
    let slug = oldShelves.get(shelf.id)?.slug || kebab(shelf.name);
    if (!slug || usedSlugs.has(slug)) slug = `${slug || 'etalase'}-${shelf.id}`;
    usedSlugs.add(slug);
    return { id: shelf.id, slug, name: shelf.name, position: shelf.position };
  });
  const shelfIds = new Set(etalase.map((shelf) => shelf.id));
  const previous = new Map(oldProducts.map((p) => [p.id, p]));

  // Produk yang baru kali ini tidak terlihat, dibanding yang run lalu masih terlihat.
  const present = oldProducts.filter((p) => p.status === 'active' && p.missingRuns === 0);
  const newlyMissing = present.filter((p) => !rows.has(p.id));
  const massMissing = present.length > 0 && newlyMissing.length / present.length > LIMITS.missingShare;

  const summary = { added: [], priceChanges: [], newlyMissing: [], takenDown: [], returned: [], rejected };
  const products = [];

  for (const row of rows.values()) {
    const old = previous.get(row.id);
    const next = toProduct(row, old, shelfIds, now);
    if (!old) summary.added.push(next);
    else {
      if (old.status === 'hidden') summary.returned.push(next);
      if (old.priceIdr !== next.priceIdr) {
        summary.priceChanges.push({ id: next.id, name: next.name, from: old.priceIdr, to: next.priceIdr, ratio: (next.priceIdr - old.priceIdr) / old.priceIdr });
      }
    }
    products.push(next);
  }

  for (const old of oldProducts) {
    if (rows.has(old.id)) continue;
    const kept = { ...old, etalaseIds: old.etalaseIds.filter((id) => shelfIds.has(id)) };
    // Bila terlalu banyak yang hilang, run dianggap tidak sah untuk takedown.
    if (!massMissing) {
      kept.missingRuns = old.missingRuns + 1;
      if (kept.missingRuns >= LIMITS.takedownRuns && old.status === 'active') {
        kept.status = 'hidden';
        kept.syncedAt = now;
        summary.takenDown.push(kept);
      }
    }
    if (old.status === 'active' && old.missingRuns === 0) summary.newlyMissing.push(kept);
    products.push(kept);
  }
  products.sort((a, b) => a.id.localeCompare(b.id));

  const shownBefore = oldProducts.filter(isShown).length;
  const shownAfter = products.filter(isShown).length;
  if (shownAfter === 0) return abort('tidak ada produk yang memenuhi syarat tampil');

  const flags = [];
  const jumps = summary.priceChanges.filter((c) => Math.abs(c.ratio) > LIMITS.priceJump);
  if (jumps.length) flags.push(`${jumps.length} produk berubah harga lebih dari ${LIMITS.priceJump * 100}%`);
  if (massMissing) flags.push(`${newlyMissing.length} dari ${present.length} produk hilang sekaligus (lebih dari ${LIMITS.missingShare * 100}%); hitungan takedown tidak dinaikkan`);
  if (oldProducts.length && summary.priceChanges.length / oldProducts.length > LIMITS.changedShare) {
    flags.push(`${summary.priceChanges.length} produk berubah harga sekaligus`);
  }
  if (shownBefore && (shownBefore - shownAfter) / shownBefore > LIMITS.visibleDrop) {
    flags.push(`produk tampil turun dari ${shownBefore} ke ${shownAfter}`);
  }
  if (oldProducts.length && summary.added.length > LIMITS.newProducts) flags.push(`${summary.added.length} produk baru dalam satu run`);

  return {
    products,
    etalase,
    meta: { schemaVersion: 1, lastSuccessAt: now },
    summary,
    flags,
    counts: { total: products.length, shownBefore, shownAfter },
  };
}

const rupiah = (n) => `Rp${n.toLocaleString('id-ID')}`;

/** Laporan Markdown untuk isi PR. */
export function renderReport(result, extra = []) {
  const { summary, counts, flags } = result;
  const lines = [
    `Tampil: ${counts.shownBefore} -> ${counts.shownAfter}. Total baris: ${counts.total}.`,
    `Baru ${summary.added.length}, harga berubah ${summary.priceChanges.length}, baru hilang ${summary.newlyMissing.length}, disembunyikan ${summary.takenDown.length}, kembali ${summary.returned.length}, baris ditolak ${summary.rejected}.`,
    ...extra,
  ];
  if (flags.length) lines.push('', '**Perlu tinjauan manusia (tidak di-merge otomatis):**', ...flags.map((f) => `- ${f}`));
  const section = (title, items, format) => {
    if (!items.length) return;
    lines.push('', `### ${title}`, ...items.slice(0, 40).map((item) => `- ${format(item)}`));
    if (items.length > 40) lines.push(`- dan ${items.length - 40} lainnya`);
  };
  section(
    'Perubahan harga',
    [...summary.priceChanges].sort((a, b) => Math.abs(b.ratio) - Math.abs(a.ratio)),
    (c) => `${c.name}: ${rupiah(c.from)} -> ${rupiah(c.to)} (${c.ratio > 0 ? '+' : ''}${Math.round(c.ratio * 100)}%)`
  );
  section('Disembunyikan (hilang dua run)', summary.takenDown, (p) => p.name);
  section('Tidak ditemukan run ini', summary.newlyMissing, (p) => p.name);
  section('Produk baru', summary.added, (p) => `${p.name} (${rupiah(p.priceIdr)})`);
  section('Muncul kembali', summary.returned, (p) => p.name);
  return `${lines.join('\n')}\n`;
}
