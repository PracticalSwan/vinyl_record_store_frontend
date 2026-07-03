import path from 'node:path';
import process from 'node:process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const frontendDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(frontendDirectory, '..', 'vinyl_record_store_backend');
process.env.E2E_REGISTER_PASSWORD = randomBytes(18).toString('base64url');
process.env.E2E_REGISTER_USERNAME = `e2e_${randomBytes(8).toString('hex')}`;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './output/playwright/results',
  fullyParallel: false,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev -- --hostname 127.0.0.1',
      cwd: backendDirectory,
      env: {
        ...process.env,
        CATALOG_DATA_SOURCE: 'seed',
        FRONTEND_ORIGIN: 'http://localhost:5173',
        AUTH_SECRET: randomBytes(48).toString('base64url'),
      },
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1',
      cwd: frontendDirectory,
      env: {
        ...process.env,
        VITE_API_BASE_URL: 'http://localhost:3000',
      },
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'chromium-tablet',
      grep: /@smoke/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'firefox-desktop',
      grep: /@smoke/,
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'webkit-desktop',
      grep: /@smoke/,
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
