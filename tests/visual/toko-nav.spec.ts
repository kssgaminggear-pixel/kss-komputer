import { expect, test, type Page } from '@playwright/test';

const cards = (page: Page) => page.locator('main article:visible');
const noOverflow = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

test('toko gabungan: kelompok paket, tab jenis, pencarian, dan urutan tersimpan di URL', async ({ page }) => {
  await page.goto('/toko', { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /^PC siap pakai/ })).toBeVisible();
  await expect(cards(page)).toHaveCount(6 + 24);

  await page.getByRole('button', { name: 'Paket PC', exact: true }).click();
  await expect(page).toHaveURL(/jenis=paket/);
  await expect(cards(page)).toHaveCount(6);
  await expect(cards(page).getByRole('button')).toHaveCount(0);

  await page.getByRole('button', { name: 'Produk toko', exact: true }).click();
  await expect(page.locator('main a[href^="/paket-rakitan/"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Semua', exact: true }).click();
  await page.getByLabel('Urutkan').selectOption('termurah');
  await expect(page).toHaveURL(/sort=termurah/);
  await page.getByRole('searchbox', { name: 'Cari di toko KSS Komputer' }).fill('zzzz tidak ada');
  await expect(page.getByText('Tidak ada barang yang cocok')).toBeVisible();
});

test('toko: tautan langsung ke jenis paket dan halaman etalase', async ({ page }) => {
  await page.goto('/toko?jenis=paket', { waitUntil: 'networkidle' });
  await expect(cards(page)).toHaveCount(6);

  const shelf = await page.locator('nav[aria-label="Etalase toko"] a[href^="/toko/etalase/"]').first().getAttribute('href');
  await page.goto(shelf!.split('?')[0], { waitUntil: 'networkidle' });
  await expect(page.locator('main a[href^="/paket-rakitan/"]')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Jenis barang' })).toHaveCount(0);
});

test('toko: tanpa gulir samping di berbagai lebar', async ({ page }) => {
  for (const width of [1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/toko', { waitUntil: 'networkidle' });
    await noOverflow(page);
  }
});

test('menu desktop: dropdown dibuka, ditutup dengan Esc, dan tidak melebar', async ({ page }) => {
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const nav = page.getByRole('navigation', { name: 'Navigasi utama' });
    const button = nav.getByRole('button', { name: 'Toko' });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link', { name: 'Paket PC siap pakai' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();

    // Logo tidak boleh menimpa menu kiri maupun aksi kanan.
    const boxes = await page.evaluate(() =>
      [...document.querySelector('header.sticky > div')!.children]
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .map((el) => el.getBoundingClientRect())
        .map((box) => ({ left: box.left, right: box.right }))
        .sort((a, b) => a.left - b.left)
    );
    for (let i = 1; i < boxes.length; i += 1) expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i - 1].right - 1);
    await noOverflow(page);
  }
});

test('menu bawah HP dan pencarian paket', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const bottom = page.getByRole('navigation', { name: 'Navigasi bawah' });
  await expect(bottom.getByRole('link')).toHaveText(['Beranda', 'Jasa', 'Toko', 'Konsultasi']);

  await page.getByRole('button', { name: 'Cari (Ctrl+K)' }).click();
  const dialog = page.getByRole('dialog', { name: 'Cari di situs' });
  await dialog.getByRole('searchbox').fill('valhalla');
  await expect(dialog.locator('a[href="/paket-rakitan/kss-valhalla-ultimate-4k-sultan"]')).toBeVisible();
  await expect(dialog).not.toContainText('Rp');
});
