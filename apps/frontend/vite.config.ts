import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [react(), !process.env.VITEST ? checker({ typescript: true }) : undefined],
  define: {
    APPLICATION_VERSION: JSON.stringify(process.env.APPLICATION_VERSION),
  },
});
