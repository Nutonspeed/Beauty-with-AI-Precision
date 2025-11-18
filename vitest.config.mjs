import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    // Use thread pool instead of forks to avoid startup timeouts in constrained environments
    pool: 'threads',
    testTimeout: 30000,
    environmentOptions: {
      happyDOM: {
        // emulate a browser-like URL for APIs relying on location
        url: 'http://localhost:3000'
      }
    },
    setupFiles: './__tests__/setup.ts',
    exclude: [
      '**/__tests__/e2e/**',
      '**/*.e2e.spec.ts',
      '**/node_modules/**',
      '**/scanning-project/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'dist/',
        '.next/',
        'out/',
        'public/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
