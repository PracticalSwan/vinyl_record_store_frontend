import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const frontendDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(frontendDirectory, '..', 'vinyl_record_store_backend');

export default defineConfig({
  testDir: './tests/failure-e2e',
  outputDir: './output/playwright/mongodb-failure-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:3011' },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3011',
    cwd: backendDirectory,
    env: {
      ...process.env,
      CATALOG_DATA_SOURCE: 'mongodb',
      MONGODB_URI: 'mongodb://127.0.0.1:1',
      MONGODB_DB_NAME: 'vinyl_record_store_unavailable_probe',
      AUTH_SECRET: 'pers09-isolated-mongodb-failure-probe-secret',
      FRONTEND_ORIGIN: 'http://localhost:5173',
      PERS_ME_ENDPOINT: 'true',
    },
    url: 'http://127.0.0.1:3011/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: 'mongodb-failure-contract' }],
});
