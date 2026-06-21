// eslint.config.js — ESLint v9 flat config for the FazAI monorepo
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ─── Ignored paths ──────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.vercel/**',
      'openspec/**',
    ],
  },

  // ─── Backend: Node.js TypeScript ────────────────────────────────────────
  {
    files: ['apps/backend/src/**/*.ts'],
    ignores: ['apps/backend/src/**/*.test.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './apps/backend/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Allow namespace declarations (used in Express augmentation in auth.ts)
      '@typescript-eslint/no-namespace': 'off',
      'prefer-const': 'error',
      'no-console': 'off',
    },
  },

  // ─── Backend: Test files — relaxed rules ────────────────────────────────
  {
    files: ['apps/backend/src/**/*.test.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './apps/backend/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      // Test files use mocks that need 'any' for partial implementations
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-console': 'off',
    },
  },


  // ─── Frontend: React + TypeScript ───────────────────────────────────────
  {
    files: ['apps/frontend/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './apps/frontend/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      // Enforce strict typing — no 'any'
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // React hooks
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
    },
  },
];
