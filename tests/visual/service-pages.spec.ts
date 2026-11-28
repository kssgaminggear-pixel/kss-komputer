import { expect, test } from '@playwright/test';

test('halaman jasa: 10 kartu bergambar dan cakupan dilipat', async ({ page }) => {
  await page.goto('/jasa', { waitUntil: 'networkidle' });
  const cards = page.locator('[data-service-card]');
  await expect(cards).toHaveCount(10);
  const first = cards.first();
  await expect(first.locator('details')).not.toHaveAttribute('open', /.*/);
  await first.getByText('Cakupan pekerjaan').click();
  await expect(first.locator('details li').first()).toBeVisible();
  await expect(page.locator('main .kss-btn-primary:visible')).toHaveCount(1);
});

test('detail jasa memakai ulang model 3D hanya pada jasa yang cocok', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/jasa/deep-cleaning-repaste', { waitUntil: 'networkidle' });
  const stage = page.locator('[data-bedah-stage]');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-state', '3d', { timeout: 20_000 });
  await page.goto('/jasa/instalasi-ulang-os', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-bedah-stage]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('detail jasa di HP: bar aksi menempel, tidak menutupi tombol CS, hilang di formulir', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/jasa/upgrade-ssd-nvme', { waitUntil: 'networkidle' });
  const bar = page.locator('[data-action-bar]');
  await expect(bar).toBeVisible();
  await expect(page.locator('main .kss-btn-primary:visible')).toHaveCount(1);
  const barBox = (await bar.boundingBox())!;
  const csBox = (await page.locator('[data-cs-fab]').boundingBox())!;
  expect(csBox.y + csBox.height).toBeLessThanOrEqual(barBox.y);
  await bar.getByRole('link', { name: 'Booking' }).click();
  await expect(page.locator('#booking-upgrade-ssd-nvme')).toBeInViewport();
  await expect(bar).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('detail jasa di desktop tanpa bar aksi', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/jasa/rakit-pc-custom', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-action-bar]')).toBeHidden();
});

test('pindah antarjasa lalu keluar: bar aksi tetap benar dan tombol CS kembali turun', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/jasa/upgrade-ssd-nvme', { waitUntil: 'networkidle' });
  const csGap = async () => {
    const box = (await page.locator('[data-cs-fab]').boundingBox())!;
    return 844 - (box.y + box.height);
  };
  const raised = await csGap();

  await page.locator('section[aria-labelledby="terkait"]:visible a').first().click();
  await expect(page).not.toHaveURL(/upgrade-ssd-nvme/);
  const bar = page.locator('[data-action-bar]:visible');
  await expect(bar).toHaveCount(1);
  await bar.getByRole('link', { name: 'Booking' }).click();
  await expect(page.locator('[data-booking-form]:visible')).toBeInViewport();
  await expect(page.locator('[data-action-bar]:visible')).toHaveCount(0);

  await page.locator('nav.fixed').getByRole('link', { name: 'Toko' }).click();
  await expect(page).toHaveURL(/\/toko$/);
  await expect.poll(csGap).toBeLessThan(raised);
});