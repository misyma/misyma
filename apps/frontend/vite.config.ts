import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    APPLICATION_VERSION: JSON.stringify(process.env.APPLICATION_VERSION),
  },
});
