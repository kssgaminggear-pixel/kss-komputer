import { expect, test, type Page } from '@playwright/test';

test('alamat kanonis, sitemap, dan robots memakai www.kssgo.com', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/www\.kssgo\.com\/?$/);
  for (const path of ['/robots.txt', '/sitemap.xml']) {
    const body = await (await request.get(path)).text();
    expect(body).toContain('https://www.kssgo.com');
    expect(body).not.toContain('vercel.app');
  }
});

const search = async (page: Page, query: string) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Cari (Ctrl+K)' }).click();
  const dialog = page.getByRole('dialog', { name: 'Cari di situs' });
  await dialog.getByRole('searchbox').fill(query);
  return dialog;
};

test('pencarian menemukan jasa dan paket bertanda hubung', async ({ page }) => {
  const cleaning = await search(page, 'cleaning');
  await expect(cleaning.locator('a[href="/jasa/deep-cleaning-repaste"]')).toBeVisible();
  const esports = await search(page, 'esports');
  await expect(esports.locator('a[href="/paket-rakitan/kss-esports-champion-1080p"]')).toBeVisible();
});

test('keranjang tidak terbuka sendiri setelah muat ulang dan bisa ditutup', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#toko-kss button[aria-label$="ke keranjang"]:enabled').first().click();
  const drawer = page.getByRole('dialog', { name: 'Keranjang toko' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Tutup keranjang' })).toBeFocused();

  await page.reload({ waitUntil: 'networkidle' });
  await expect(drawer).toHaveCount(0);
  await page.getByRole('button', { name: /^Keranjang eceran, 1 item$/ }).click();
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
});

test('data keranjang lama yang menyimpan panel terbuka diabaikan', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'kss-retail-cart-storage-v3',
      JSON.stringify({ state: { items: [], isOpen: true }, version: 0 })
    );
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('dialog', { name: 'Keranjang toko' })).toHaveCount(0);
});

test('paling banyak satu tombol orange terlihat per layar di halaman utama', async ({ page }) => {
  for (const path of ['/', '/jasa', '/tentang-kami', '/paket-rakitan/kss-esports-champion-1080p']) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('footer .kss-btn-primary')).toHaveCount(0);
  }
  await page.goto('/tentang-kami');
  await expect(page.locator('main .kss-btn-primary')).toHaveCount(0);
});
