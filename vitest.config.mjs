import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Allow tuning the worker pool via env to avoid runner timeouts
const poolEnv = process.env.VITEST_POOL
const isCI = process.env.CI === 'true' || process.env.CI === '1'
const resolvedPool = poolEnv || (isCI ? 'forks' : 'threads')
const singleThread = process.env.VITEST_SINGLE_THREAD === '1' || isCI

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    // Pool is configurable to mitigate startup issues in constrained environments
    pool: resolvedPool,
    poolOptions: {
      threads: {
        singleThread,
      },
    },
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
