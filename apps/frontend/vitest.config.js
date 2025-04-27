import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import config from '../../vitest.config.js';

export default mergeConfig(
  config,
  defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
      include: ['./src/**/*.test.{ts,tsx}', './tests/**/*.test.{ts,tsx}'],
      coverage: {
        include: ['src/**'],
        exclude: ['**/*.stories.js', '**/*.stories.tsx'],
      },
    },
    define: {
      APPLICATION_VERSION: JSON.stringify('1.0.0'),
    },
  }),
);
