import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // сгенерированные отчёты и старый скрипт из первых лабораторных не проверяем
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results', 'script.js']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // компонентные тесты: describe/test/expect/vi без импорта (globals: true в vite.config.js)
  {
    files: ['src/**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.vitest } },
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  // Node: конфиги и E2E (process.env)
  {
    files: ['*.config.js', 'src/e2e/**'],
    languageOptions: { globals: globals.node },
  },
  // контекст экспортирует и провайдер, и хук useAuth — это нормально
  {
    files: ['src/context/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
