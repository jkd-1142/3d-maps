import { rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const stale = ['coverage', 'mutation-report', 'playwright-report', 'test-results', 'artifacts/acceptance'];
for (const relative of stale) {
  await rm(new URL(relative, root), { recursive: true, force: true });
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const layers = /** @type {Array<[string, string, string[]]>} */ ([
  ['assets + generated data', process.execPath, ['tools/verify-assets.mjs']],
  ['tests + fail-closed coverage', npm, ['run', 'test:coverage']],
  ['static types', npm, ['run', 'typecheck']],
  ['lint + style', npm, ['run', 'lint']],
  ['suite health (shuffle seed 20260816)', npm, ['test', '--', '--sequence.shuffle', '--sequence.seed=20260816']],
  ['mutation', npm, ['run', 'mutate']],
  ['browser + a11y + visual + real execution', npm, ['run', 'test:e2e']],
  ['checker negative controls', process.execPath, ['tools/checker-controls.mjs']],
  ['license + secret scan', process.execPath, ['tools/supply-chain.mjs']],
  ['dependency audit (high/critical gate)', npm, ['audit', '--audit-level=high']],
  ['source state', process.execPath, ['tools/source-state.mjs']],
]);

for (const [name, command, args] of layers) {
  console.log(`\n=== ${name.toUpperCase()} ===`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: false });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Gauntlet stopped at ${name}: exit ${result.status}`);
  }
}
console.log(`\nGAUNTLET PASS: ${layers.length}/${layers.length} layers`);
