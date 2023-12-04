import { defineConfig, devices } from '@playwright/test';
import config from 'config';

export default defineConfig({
  testDir: './src/tests',
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: config.get('baseUrl'),
    trace: 'on-first-retry',
    httpCredentials: {
      username: 'philoro',
      password: 'goldenhour',
    },
    actionTimeout: 5000,
  },
  timeout: 5 * 60 * 1000,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
