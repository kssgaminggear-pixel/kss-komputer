// Memeriksa src/lib/media/slots.json. Jalankan: npm run media:check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSlots } from './validate-slots.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'lib', 'media', file), 'utf8'));

const slots = read('slots.json');
const manifest = read('manifest.json');
const errors = validateSlots(slots, manifest);

for (const url of Object.keys(manifest)) {
  if (!fs.existsSync(path.join(ROOT, 'public', url))) errors.push(`file hilang: ${url}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`slot gambar: ${Object.keys(slots).length} valid`);
