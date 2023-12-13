import { mergeConfig } from 'vite';
import { defineConfig, configDefaults } from 'vitest/config';

export default mergeConfig(
  defineConfig({
    test: {
      globalSetup: ['src/tests/globalSetup.ts'],
      testNamePattern: new RegExp(`^(?!.*#O).*$`, 'gi'),
      name: 'E2E',
      include: [...configDefaults.exclude, '**/*.e2e.test.ts'],
      exclude: [...configDefaults.watchExclude, '**/*.unit.test.ts', '**/*.integration.test.ts', '**/*.js'],
      singleThread: true,
      testTimeout: 50000,
      teardownTimeout: 30000,
      useAtomics: true,
      globals: false,
      passWithNoTests: true,
    },
  }),
);
