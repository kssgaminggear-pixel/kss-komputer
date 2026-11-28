import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { imageHash, isShown } from './diff.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class Blocked extends Error {}

/**
 * Mengunduh gambar produk tampil yang baru atau berganti ke folder sementara.
 * Produk diperbarui di tempat; gambar lama dipertahankan bila unduhan gagal.
 */
export async function syncImages(products, rows, { publicDir, stagingDir }) {
  const sources = new Map(rows.map((row) => [row.id, row.image]));
  let downloaded = 0;
  let failed = 0;

  for (const product of products.filter(isShown)) {
    const url = sources.get(product.id);
    if (!url) continue;
    const hash = imageHash(url);
    const exists = product.image && fs.existsSync(path.join(publicDir, product.image));
    if (exists && !product.imageSourceHash) {
      product.imageSourceHash = hash; // gambar dari impor awal
      continue;
    }
    if (exists && product.imageSourceHash === hash) continue;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (response.status === 403 || response.status === 429) {
        throw new Blocked(`unduhan gambar ditolak (${response.status})`);
      }
      if (!response.ok) throw new Error(`status ${response.status}`);
      fs.mkdirSync(stagingDir, { recursive: true });
      const info = await sharp(Buffer.from(await response.arrayBuffer()))
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(stagingDir, `${product.id}.webp`));
      product.image = `/images/marketplace/${product.id}.webp`;
      product.imageWidth = info.width;
      product.imageHeight = info.height;
      product.imageSourceHash = hash;
      downloaded += 1;
    } catch (error) {
      if (error instanceof Blocked) throw error;
      failed += 1;
    }
    await sleep(300);
  }
  return { downloaded, failed };
}
