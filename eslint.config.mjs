// Minimal ESLint flat config for TypeScript + React in Next.js 16
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  // Global ignores to prevent linting build artifacts and vendor code
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/playwright-report/**',
      '**/coverage/**',
      'scanning-project/**',
      '**/.venv/**',
      '**/venv/**',
      '**/site-packages/**',
      // Reduce lint noise from static assets and generated JS
      'public/**',
      'types/**',
      'scripts/**',
      'scripts/codemods/**',
      // Ignore embedded Python venv artifacts
      'ai-service/**/venv/**',
      // Vercel and build outputs
      '.vercel/**',
      '.vercel/output/**',
      '.output/**',
      'out/**',
      // Generated files
      '.next/cache/**',
      '.next/server/**',
      // Temporary and cache
      '.turbo/**',
      '.cache/**',
      'tmp/**',
      'temp/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    rules: {
      // Prefer removing unused imports automatically and quiet unused vars noise
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Targeted overrides to reduce common benign noise
  {
    files: [
      'app/**/page.tsx',
      'app/**/layout.tsx',
      'app/**/error.tsx',
      'app/**/loading.tsx',
      'app/**/api/**/route.ts',
    ],
    rules: {
      'unused-imports/no-unused-vars': 'off',
    },
  },
  // Relax rules for demo/experimental paths to reduce noise
  {
    files: [
      'app/**/demo/**',
      'app/**/*demo*/**',
      'components/demo/**',
      'hooks/demo/**',
    ],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
  // Relax rules for internal tooling/experimental libs to keep signal-to-noise high
  {
    files: [
      'lib/ai/**',
      'lib/audit/**',
      'lib/db/**',
      'lib/analytics/**',
      'lib/monitoring/**',
      'lib/rate-limit/**',
      'lib/elasticsearch/**',
      'lib/error/**',
      'lib/hooks/**',
    ],
    rules: {
      'unused-imports/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  // Relax rules for dashboard/tooling components (many are WIP and trigger benign warnings)
  {
    files: [
      'components/**/dashboard/**',
      'components/**/dashboards/**',
      'components/monitoring/**',
      'components/performance/**',
      'components/rate-limit/**',
      'components/reports/**',
      'components/security/**',
      'components/testing/**',
      'components/training/**',
      'components/sales/**',
      'components/db/**',
      'components/ar/**',
      'components/pwa/**',
    ],
    rules: {
      'unused-imports/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['components/sales/**'],
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  {
    files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
]
