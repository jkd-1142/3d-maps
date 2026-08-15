import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
    reporters: ['default'],
  },
  coverage: {
    provider: 'v8',
    include: [
      'src/interaction-state.js',
      'src/projection.js',
      'src/card-view.js',
      'src/province-catalog.js',
      'tools/shape-core.mjs',
      'tools/server-core.mjs',
    ],
    reporter: ['text', 'json-summary'],
    thresholds: { lines: 100, functions: 100, statements: 100, branches: 100 },
  },
});
