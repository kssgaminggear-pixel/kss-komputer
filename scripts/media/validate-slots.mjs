// Aturan slot gambar; dipakai `npm run media:check` dan unit test.
import path from 'node:path';

/** Slot yang hanya boleh berisi foto asli. */
const PHOTO_ONLY = /^(toko|paket|lookbook|qc|bengkel|tim)\./;
/** Gambar 1K lulus ambang ketajaman bila lebarnya minimal 1,5x lebar tampil. */
const MIN_DENSITY = 1.5;

export function validateSlots(slots, manifest) {
  const errors = [];
  for (const [id, slot] of Object.entries(slots)) {
    if (!slot.alt) errors.push(`${id}: alt kosong`);
    if (slot.kind !== 'photo' && slot.kind !== 'illustration') errors.push(`${id}: kind tidak dikenal`);
    if (slot.kind === 'illustration' && PHOTO_ONLY.test(id)) errors.push(`${id}: slot ini wajib foto asli`);
    if (slot.kind === 'illustration' && !slot.alt?.startsWith('Ilustrasi')) {
      errors.push(`${id}: alt ilustrasi harus diawali "Ilustrasi"`);
    }
    if (!slot.desktop) errors.push(`${id}: desktop kosong`);

    for (const url of [slot.desktop, slot.mobile, slot.fallback].filter(Boolean)) {
      const entry = manifest[url];
      if (!entry) {
        errors.push(`${id}: file tidak ada di manifest: ${url}`);
        continue;
      }
      const illustrated = path.posix.basename(url).startsWith('ilu-');
      const expected = url === slot.fallback ? false : slot.kind === 'illustration';
      if (illustrated !== expected) errors.push(`${id}: awalan "ilu-" tidak cocok dengan jenis slot: ${url}`);
    }

    // Versi mobile hanya tampil di layar sempit, jadi batas lebar berlaku untuk desktop.
    const width = manifest[slot.desktop]?.width;
    if (width && slot.maxCssWidth && width < slot.maxCssWidth * MIN_DENSITY) {
      errors.push(`${id}: lebar ${width}px kurang untuk tampil ${slot.maxCssWidth}px`);
    }
  }
  return errors;
}
