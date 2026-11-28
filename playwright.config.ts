import { defineConfig } from '@playwright/test';

const PORT = 3123;
const external = process.env.AUDIT_BASE_URL;

// Memakai Google Chrome yang sudah terpasang; tidak mengunduh browser.
export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'test-results/playwright',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  reporter: 'list',
  use: { baseURL: external || `http://localhost:${PORT}`, channel: 'chrome' },
  webServer: external
    ? undefined
    : {
        // Jalankan `npm run build` lebih dulu.
        command: `npx next start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
      },
});
