export default {
  testRunner: 'vitest',
  mutate: [
    'src/interaction-state.js',
    'src/projection.js',
    'src/card-view.js',
    'tools/shape-core.mjs',
  ],
  thresholds: { high: 95, low: 90, break: 90 },
  reporters: ['clear-text', 'html'],
  htmlReporter: { fileName: 'mutation-report/index.html' },
  coverageAnalysis: 'perTest',
};
