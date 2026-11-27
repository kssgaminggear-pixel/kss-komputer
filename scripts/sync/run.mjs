/**
 * Sinkron harian katalog Toko. Lihat docs/SYNC_PLAYBOOK.md.
 *
 *   node scripts/sync/run.mjs                 kumpulkan, terapkan, buka PR, merge bila aman
 *   node scripts/sync/run.mjs --no-publish    kumpulkan dan terapkan tanpa git
 *   node scripts/sync/run.mjs --dry-run       hanya laporan dari snapshot yang ada, tanpa jaringan
 * Opsi: --details N (halaman produk per run, bawaan 30), --snapshot <path>
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { diffCatalog, isShown, renderReport, sha1 } from './lib/diff.mjs';
import { cleanDescription, createPolisher } from './lib/describe.mjs';
import { syncImages } from './lib/images.mjs';

const ROOT = process.cwd();
const HOME = path.join(os.homedir(), '.kss-sync');
const OUT = path.join(ROOT, 'scripts', 'sync', '.out');
const DATA = path.join(ROOT, 'data', 'marketplace');
const PUBLIC = path.join(ROOT, 'public');
const SCRAPER = path.join(ROOT, 'tools', 'tokopedia-scraper');
const SITE = 'https://kss-komputer-seven.vercel.app';
const DATA_PATHS = ['data/marketplace', 'public/images/marketplace'];

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const option = (name, fallback) => (has(name) ? argv[argv.indexOf(name) + 1] : fallback);
const DRY = has('--dry-run');
const PUBLISH = !DRY && !has('--no-publish');
const DETAILS = Math.max(0, Math.min(100, Number(option('--details', 30))));
const SNAPSHOT = path.resolve(option('--snapshot', path.join(SCRAPER, 'out', 'store', 'snapshot.json')));
// Dengan --snapshot tidak ada pengumpulan ulang dari Tokopedia.
const COLLECT = !DRY && !has('--snapshot');

class Aborted extends Error {}

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 1)}\n`);
};
const log = (message) => console.log(`[sync ${new Date().toISOString().slice(11, 19)}] ${message}`);

/** Memuat %USERPROFILE%\.kss-sync\.env tanpa menimpa variabel yang sudah ada. */
function loadEnv() {
  const file = path.join(HOME, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

function lock() {
  const file = path.join(HOME, 'sync.lock');
  fs.mkdirSync(HOME, { recursive: true });
  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < 2 * 36e5) {
    throw new Aborted('run lain masih berjalan (sync.lock)');
  }
  fs.writeFileSync(file, String(process.pid));
  process.on('exit', () => fs.rmSync(file, { force: true }));
}

const exec = (command, args, options = {}) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024, ...options }).trim();
const git = (...args) => exec('git', args);
// Kredensial push memakai login `gh`; konfigurasi git global tidak diubah.
const gitRemote = (...args) => git('-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', ...args);
const gh = (...args) => exec('gh', args);

function npm(...args) {
  const result = spawnSync(`npm ${args.join(' ')}`, { shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    console.error(`${result.stdout}\n${result.stderr}`.slice(-4000));
    throw new Error(`pemeriksaan lokal gagal: npm ${args.join(' ')}`);
  }
}

function scraper(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd: SCRAPER, stdio: 'inherit', timeout: 20 * 60_000 });
  if (result.status === 2) throw new Aborted('Tokopedia memblokir permintaan (403/429/captcha); run dihentikan');
  if (result.status !== 0) throw new Aborted(`${script} gagal (exit ${result.status})`);
}

function ensureReadyToPublish() {
  const dirty = git('status', '--porcelain').split('\n').filter((line) => line && !line.includes('Claude outputs'));
  if (dirty.length) throw new Aborted('ada perubahan lokal yang belum di-commit; sinkron tidak menyentuhnya');
  if (git('branch', '--show-current') !== 'main') throw new Aborted('repo tidak sedang di branch main');
  gitRemote('pull', '--ff-only', '--quiet', 'origin', 'main');

  const open = JSON.parse(gh('pr', 'list', '--label', 'data-sync', '--state', 'open', '--json', 'number,createdAt'));
  for (const pr of open) {
    if (Date.now() - Date.parse(pr.createdAt) < 72 * 36e5) {
      throw new Aborted(`PR data-sync #${pr.number} masih menunggu; selesaikan atau tutup dulu`);
    }
    gh('pr', 'close', String(pr.number), '--comment', 'Ditutup otomatis: lebih dari 3 hari, diganti run baru.');
  }
}

/** Mengisi deskripsi bertahap: yang kosong dulu, lalu yang paling lama tidak diperiksa. */
async function syncDescriptions(products) {
  const stats = { checked: 0, changed: 0, polished: 0, llm: 'tidak dipakai' };
  const stateFile = path.join(HOME, 'state.json');
  const rawFile = path.join(HOME, 'raw-descriptions.json');
  const checked = readJson(stateFile, {});
  const raws = readJson(rawFile, {});

  if (COLLECT && DETAILS > 0) {
    const targets = products
      .filter(isShown)
      .sort((a, b) =>
        Number(Boolean(a.description)) - Number(Boolean(b.description)) ||
        (checked[a.id] || '').localeCompare(checked[b.id] || '') ||
        b.sold - a.sold
      )
      .slice(0, DETAILS);
    writeJson(path.join(OUT, 'targets.json'), targets.map((p) => ({ id: p.id, url: p.tokopediaUrl })));
    const resultFile = path.join(OUT, 'details.json');
    fs.rmSync(resultFile, { force: true });
    scraper('collect-details.mjs', [path.join(OUT, 'targets.json'), resultFile]);
    const now = new Date().toISOString();
    for (const [id, raw] of Object.entries(readJson(resultFile, {}))) {
      raws[id] = raw;
      checked[id] = now;
      stats.checked += 1;
    }
    writeJson(stateFile, checked);
    writeJson(rawFile, raws);
  }

  const polish = createPolisher();
  let calls = 0;
  for (const product of products) {
    const raw = raws[product.id];
    if (!raw) continue;
    const hash = sha1(raw);
    const changed = product.descriptionHash !== hash;
    if (changed) {
      product.description = cleanDescription(raw);
      product.descriptionHash = hash;
      product.descriptionBy = 'aturan';
      stats.changed += 1;
    }
    // Teks yang belum dirapikan model dicoba lagi saat model sudah merespons.
    if (polish && !DRY && product.descriptionBy === 'aturan' && product.description && calls < 30 && !polish.state.down) {
      calls += 1;
      const output = await polish(product.description);
      if (output) {
        product.description = output;
        product.descriptionBy = 'model';
        stats.polished += 1;
      }
    }
  }
  if (polish) stats.llm = polish.state.down ? `tidak merespons (${polish.state.down})` : `${stats.polished} dari ${calls} panggilan dipakai`;
  return stats;
}

function apply(result, stagingDir) {
  writeJson(path.join(DATA, 'products.json'), result.products);
  writeJson(path.join(DATA, 'etalase.json'), result.etalase);
  writeJson(path.join(DATA, 'meta.json'), result.meta);
  const target = path.join(PUBLIC, 'images', 'marketplace');
  fs.mkdirSync(target, { recursive: true });
  if (fs.existsSync(stagingDir)) {
    for (const file of fs.readdirSync(stagingDir)) fs.copyFileSync(path.join(stagingDir, file), path.join(target, file));
  }
}

/** Membuang perubahan data yang belum di-commit. Hanya menyentuh dua folder data. */
function revertData() {
  git('checkout', '--quiet', '--', ...DATA_PATHS);
  git('clean', '--quiet', '-f', '--', ...DATA_PATHS);
}

async function publish(result, reportFile) {
  if (!git('status', '--porcelain', '--', ...DATA_PATHS)) return { status: 'ok', url: '' }; // tidak ada perubahan
  const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const taken = new Set(git('branch', '-a', '--format=%(refname:short)').split('\n').map((b) => b.replace(/^origin\//, '')));
  let branch = `data-sync/${day}`;
  for (let n = 2; taken.has(branch); n++) branch = `data-sync/${day}-${n}`;
  const title = `data(toko): sinkron ${day}`;

  git('switch', '--quiet', '-c', branch);
  try {
    git('add', '--', ...DATA_PATHS);
    git('commit', '--quiet', '-m', title);
    log('pemeriksaan lokal: tsc, lint, test, build, check:price');
    exec('npx tsc --noEmit', [], { shell: true });
    npm('run', 'lint');
    npm('test');
    npm('run', 'build');
    npm('run', 'check:price');

    gitRemote('push', '--quiet', '-u', 'origin', branch);
    gh('label', 'create', 'data-sync', '--force', '--color', '0E8A16');
    const url = gh('pr', 'create', '--base', 'main', '--head', branch, '--title', title, '--body-file', reportFile, '--label', 'data-sync');
    log(`PR: ${url}`);

    if (result.flags.length) {
      gh('label', 'create', 'needs-review', '--force', '--color', 'D93F0B');
      gh('pr', 'edit', url, '--add-label', 'needs-review');
      return { status: 'needs_review', url };
    }

    await new Promise((resolve) => setTimeout(resolve, 20_000)); // beri waktu check terdaftar
    gh('pr', 'checks', url, '--watch', '--fail-fast'); // melempar bila ada check gagal
    gh('pr', 'merge', url, '--squash');

    await new Promise((resolve) => setTimeout(resolve, 20_000));
    const sha = JSON.parse(gh('pr', 'view', url, '--json', 'mergeCommit')).mergeCommit.oid;
    const runs = JSON.parse(gh('run', 'list', '--commit', sha, '--event', 'push', '--limit', '1', '--json', 'databaseId'));
    if (!runs.length) throw new Error('run deploy tidak ditemukan setelah merge');
    gh('run', 'watch', String(runs[0].databaseId), '--exit-status');
    const site = await fetch(`${SITE}/toko`, { signal: AbortSignal.timeout(30_000) });
    if (!site.ok) throw new Error(`situs produksi menjawab ${site.status} setelah deploy`);
    return { status: 'ok', url };
  } finally {
    git('switch', '--quiet', 'main');
    gitRemote('pull', '--ff-only', '--quiet', 'origin', 'main');
  }
}

/** Notifikasi lewat issue GitHub. Repo publik: jangan sertakan path lokal atau rahasia. */
function notify(title, body) {
  try {
    const safe = body.split(os.homedir()).join('~').slice(0, 3000);
    gh('label', 'create', 'sync-failed', '--force', '--color', 'B60205');
    const open = JSON.parse(gh('issue', 'list', '--label', 'sync-failed', '--state', 'open', '--json', 'number'));
    if (open.length) gh('issue', 'comment', String(open[0].number), '--body', `${title}\n\n${safe}`);
    else gh('issue', 'create', '--title', title, '--body', safe, '--label', 'sync-failed');
  } catch {
    log('notifikasi GitHub gagal dikirim');
  }
}

async function main() {
  loadEnv();
  if (!DRY) lock();
  if (PUBLISH) ensureReadyToPublish();
  if (COLLECT) {
    fs.rmSync(SNAPSHOT, { force: true }); // jangan pernah memakai snapshot basi
    scraper('collect-store.mjs', []);
  }
  const snapshot = readJson(SNAPSHOT, null);
  if (!snapshot) throw new Aborted('snapshot tidak ditemukan');

  const result = diffCatalog(
    readJson(path.join(DATA, 'products.json'), []),
    readJson(path.join(DATA, 'etalase.json'), []),
    snapshot
  );
  if (result.aborted) throw new Aborted(result.aborted);

  const descriptions = await syncDescriptions(result.products);
  const stagingDir = path.join(OUT, 'images');
  fs.rmSync(stagingDir, { recursive: true, force: true });
  const images = DRY ? { downloaded: 0, failed: 0 } : await syncImages(result.products, snapshot.products, { publicDir: PUBLIC, stagingDir });

  const report = renderReport(result, [
    `Deskripsi: ${descriptions.checked} diperiksa, ${descriptions.changed} diperbarui. Hydrogen: ${descriptions.llm}.`,
    `Gambar: ${images.downloaded} diunduh, ${images.failed} gagal.`,
  ]);
  const reportFile = path.join(OUT, 'report.md');
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(reportFile, report);
  console.log(report.split('\n###')[0]);

  let outcome = { status: result.flags.length ? 'needs_review' : 'ok' };
  if (!DRY) {
    apply(result, stagingDir);
    try {
      exec(process.execPath, ['scripts/validate-marketplace.mjs']);
    } catch (error) {
      revertData();
      throw new Aborted(`data hasil sinkron tidak lolos validator: ${error.stderr || error.message}`);
    }
    if (PUBLISH) outcome = await publish(result, reportFile);
  }

  writeJson(path.join(OUT, 'run-result.json'), { ...outcome, flags: result.flags, counts: result.counts, descriptions, images, dryRun: DRY });
  log(`selesai: ${outcome.status}`);
  if (PUBLISH && outcome.status === 'needs_review') {
    notify('Sinkron Toko perlu ditinjau', `PR: ${outcome.url}\n\n${result.flags.map((f) => `- ${f}`).join('\n')}`);
  }
}

main().catch((error) => {
  const aborted = error instanceof Aborted || error.name === 'Blocked';
  const message = String(error.stderr || error.message || error);
  log(`${aborted ? 'dibatalkan' : 'gagal'}: ${message}`);
  writeJson(path.join(OUT, 'run-result.json'), { status: aborted ? 'aborted' : 'failed', flags: [message], dryRun: DRY });
  if (PUBLISH) notify(`Sinkron Toko ${aborted ? 'dibatalkan' : 'gagal'}`, message);
  process.exitCode = 1;
});
