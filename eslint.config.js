import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

export default [
  eslint.configs.recommended,
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**']
  },
  {
    files: ['jest.config.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        module: 'readonly'
      }
    }
  },
  {
    files: ['src/**/*.ts', 'src/**/*.test.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.test.json']
      },
      globals: {
        fetch: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        global: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier
    },
    rules: {
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'prettier/prettier': ['error', {
        'semi': false,
        'singleQuote': true,
        'trailingComma': 'none',
        'printWidth': 100
      }]
    }
  }
]
