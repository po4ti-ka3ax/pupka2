import { defineConfig, devices } from '@playwright/test';

// Данные фермера для E2E (E2E_FARMER_EMAIL / E2E_FARMER_PASSWORD) — из .env.e2e, не из кода
try {
  process.loadEnvFile('.env.e2e');
} catch {
  // файла нет — тесты фермера будут пропущены
}

// BASE_URL — адрес сайта (для smoke на продакшене). E2E_BASE_URL — старое имя, оставлено для совместимости
const remoteURL = process.env.BASE_URL || process.env.E2E_BASE_URL;
const baseURL = remoteURL || 'http://localhost:5173';

export default defineConfig({
  testDir: './src/e2e',
  timeout: 60_000, // бесплатный Render «просыпается» до ~50 с
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure', // трейс упавшего теста — в npx playwright show-report
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // локально Playwright сам поднимет Vite; для продакшена (BASE_URL) — нет
  webServer: remoteURL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
      },
});
