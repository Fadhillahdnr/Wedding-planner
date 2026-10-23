import { defineConfig } from '@playwright/test';

// Menjalankan smoke test terhadap server yang sudah berjalan (E2E_BASE_URL), tanpa mengunduh browser.
// Set E2E_CHROMIUM bila memakai Chromium yang sudah ada di mesin.
export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 60_000,
    workers: 1,
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8099',
        launchOptions: { executablePath: process.env.E2E_CHROMIUM || undefined },
    },
});
