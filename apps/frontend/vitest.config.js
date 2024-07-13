import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import config from '../../vitest.config.js';

export default mergeConfig(
  config,
  defineConfig({
    plugins: [react(), TanStackRouterVite({})],
    test: {
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
    },
    define: {
      APPLICATION_VERSION: JSON.stringify('1.0.0'),
    },
  }),
);
