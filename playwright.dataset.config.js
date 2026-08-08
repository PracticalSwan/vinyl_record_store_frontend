import { defineConfig, devices } from '@playwright/test';
import seedConfig from './playwright.config.js';

export default defineConfig({
  ...seedConfig,
  testDir: './tests/dataset-e2e',
  outputDir: './output/playwright/dataset-results',
  globalTeardown: undefined,
  projects: [
    {
      name: 'dataset-chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'dataset-chromium-mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 } },
    },
  ],
});
