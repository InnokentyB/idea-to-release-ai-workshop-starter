import { defineConfig } from '@playwright/test';
import productConfig from './playwright.config';

export default defineConfig({
  ...productConfig,
  webServer: {
    command: 'node server.mjs',
    env: { PORT: '5197' },
    url: 'http://127.0.0.1:5197/health',
    reuseExistingServer: false,
  },
});
