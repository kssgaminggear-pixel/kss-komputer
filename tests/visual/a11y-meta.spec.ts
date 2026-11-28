import { expect, test } from '@playwright/test';

test('tautan lewati ke konten muncul saat Tab pertama dan memindahkan fokus', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Lewati ke konten' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('#konten')).toBeFocused();
});

test('fokus tidak keluar dari panel keranjang', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#toko-kss button[aria-label$="ke keranjang"]:enabled').first().click();
  const drawer = page.getByRole('dialog', { name: 'Keranjang toko' });
  await expect(drawer).toBeVisible();
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press(i % 5 === 4 ? 'Shift+Tab' : 'Tab');
    expect(await drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
});

test('cek pesanan tidak bergeser saat dimuat', async ({ page }) => {
  await page.goto('/cek-pesanan', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const shift = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), 500);
      })
  );
  expect(shift).toBeLessThan(0.1);
});

test('judul beranda berfokus jasa dan tiap jasa punya gambar pratinjau', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^Servis, Rakit & Upgrade PC/);
  for (const slug of ['rakit-pc-custom', 'upgrade-ssd-nvme']) {
    await page.goto(`/jasa/${slug}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.kssgo\.com\/images\//);
  }
});

test('konsultasi menyebut empat pertanyaan secara konsisten', async ({ page }) => {
  await page.goto('/konsultasi', { waitUntil: 'networkidle' });
  await expect(page.getByText('Pertanyaan 1 dari 4')).toBeVisible();
});
