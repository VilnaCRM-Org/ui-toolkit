import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ignoreHTTPSErrors: boolean = process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS === 'true';

// Outside CI the key must be absent so Playwright applies its default worker
// count; `exactOptionalPropertyTypes` rejects an explicit `undefined`.
const workerOverride: { workers?: number } = process.env.CI ? { workers: 1 } : {};

export default defineConfig({
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  ...workerOverride,
  reporter: 'html',
  expect: { toHaveScreenshot: { threshold: 0, maxDiffPixels: 0, maxDiffPixelRatio: 0 } },
  use: {
    trace: 'on-first-retry',
    // Only relax TLS validation for explicit local/dev runs.
    ignoreHTTPSErrors,
    baseURL: process.env.REACT_APP_STORYBOOK_URL || 'http://127.0.0.1:6006',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-lcd-text',
            '--disable-gpu-rasterization',
            '--disable-skia-runtime-opts',
          ],
        },
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
