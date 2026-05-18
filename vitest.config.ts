import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  test: {
    env: {
      VITE_APP_ENV: 'test',
      VITE_USE_MOCKS: 'true',
      VITE_API_BASE_URL: '/api',
      VITE_CDN_BASE_URL: 'http://localhost',
      VITE_SENTRY_DSN: '',
    },
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10_000,
    hookTimeout: 10_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        'src/components/ui/**/*.{ts,tsx}': { branches: 70, functions: 70, lines: 70, statements: 70 },
        'src/features/**/pages/*.tsx': { branches: 50, functions: 50, lines: 50, statements: 50 },
      },
      exclude: [
        '**/*.config.*',
        '**/mocks/**',
        '**/types/**',
        '**/*.test.*',
        'src/main.tsx',
        'src/router.tsx',
      ],
    },
  },
});
