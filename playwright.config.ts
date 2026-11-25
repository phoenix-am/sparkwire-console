import { defineConfig, devices } from '@playwright/test';

/**
 *   npm run build && npm run test:e2e
 * Locally, PW_CHROME=/path/to/chrome runs Chromium only, with that browser.
 */
const localChrome = process.env.PW_CHROME;

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { baseURL: 'http://localhost:4174', locale: 'en-IN', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://localhost:4174', reuseExistingServer: !process.env.CI, timeout: 60_000 },
  projects: localChrome
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: localChrome } } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'mobile-safari', use: { ...devices['iPhone 13'] }, grep: /@mobile/ },
      ],
});
