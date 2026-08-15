export default [
  {
    ignores: ['node_modules/**', 'coverage/**', 'mutation-report/**', 'playwright-report/**', 'test-results/**', 'vendor/**', 'data/province-shapes.js'],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        console: 'readonly', process: 'readonly', Buffer: 'readonly', URL: 'readonly',
        fetch: 'readonly', document: 'readonly', window: 'readonly', navigator: 'readonly',
        innerWidth: 'readonly', innerHeight: 'readonly', devicePixelRatio: 'readonly',
        matchMedia: 'readonly', requestAnimationFrame: 'readonly', performance: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly', AbortController: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unreachable': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    },
  },
];
