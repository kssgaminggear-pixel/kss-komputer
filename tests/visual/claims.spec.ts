import { expect, test } from '@playwright/test';

/** Klaim yang tidak dikonfirmasi pemilik tidak boleh muncul lagi. */
const REMOVED =
  /anti.?stati[ck]|mangga dua mall|harco|ksskomputer\.id|2\.500\+|4\.9\/5|tahun pengalaman|bebas biaya rakit|gratis packing kayu|garansi 99|\b99 th\b|tokopedia (resmi|official)|toko resmi|kryonaut|mx-[46]\b|real-time/i;

const PAGES = [
  '/',
  '/jasa',
  '/jasa/deep-cleaning-repaste',
  '/tentang-kami',
  '/toko',
  '/paket-rakitan',
  '/paket-rakitan/kss-esports-champion-1080p',
  '/cek-pesanan',
  '/cek-pesanan?code=TRK-KSS-001',
];

for (const path of PAGES) {
  test(`klaim dan alamat lama tidak tampil: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    const text = await page.evaluate(() =>
      [
        document.body.innerText,
        ...Array.from(document.querySelectorAll('meta[content]'), (el) => el.getAttribute('content')),
        ...Array.from(document.querySelectorAll('img[alt]'), (el) => el.getAttribute('alt')),
        ...Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (el) => el.textContent),
      ].join('\n')
    );
    expect(text.match(REMOVED)?.[0] ?? null).toBeNull();
    await expect(page.locator('footer')).toContainText('Mangga Dua Orion Dusit Lt 1 No 8');
    await expect(page.locator('footer')).toContainText('halo@kssgo.com (contoh)');
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  });
}

test('cek pesanan diberi tanda contoh dan tidak diindeks', async ({ page, request }) => {
  await page.goto('/cek-pesanan?code=TRK-KSS-001', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Contoh');
  await expect(page.locator('main, body').first()).toContainText('bukan pesanan asli');
  await expect(page.getByText('Kode Resi (contoh)')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/cek-pesanan');
});

test('pembayaran lewat WhatsApp dan janji same-day tidak berlaku untuk rakitan', async ({ page }) => {
  await page.goto('/paket-rakitan/kss-esports-champion-1080p', { waitUntil: 'networkidle' });
  await expect(page.locator('main')).not.toContainText(/same.?day|1 hari/i);
  const footer = page.locator('footer');
  await expect(footer).toContainText('Pembayaran dikonfirmasi lewat WhatsApp');
  await expect(footer).not.toContainText(/\b(BCA|Mandiri|QRIS|Shopee)\b/);
});
