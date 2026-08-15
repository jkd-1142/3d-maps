import { rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const stale = ['coverage', 'mutation-report', 'playwright-report', 'test-results', 'artifacts/acceptance'];
for (const relative of stale) {
  await rm(new URL(relative, root), { recursive: true, force: true });
}

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error('npm_execpath is unavailable; run this entry point through `npm run gauntlet`');
}
const npmArgs = (...args) => [npmCli, ...args];
const layers = /** @type {Array<[string, string, string[]]>} */ ([
  ['assets + generated data', process.execPath, ['tools/verify-assets.mjs']],
  ['tests + fail-closed coverage', process.execPath, npmArgs('run', 'test:coverage')],
  ['static types', process.execPath, npmArgs('run', 'typecheck')],
  ['lint + style', process.execPath, npmArgs('run', 'lint')],
  ['suite health (shuffle seed 20260816)', process.execPath, npmArgs('test', '--', '--sequence.shuffle', '--sequence.seed=20260816')],
  ['browser + a11y + visual + real execution', process.execPath, npmArgs('run', 'test:e2e')],
  ['mutation', process.execPath, npmArgs('run', 'mutate')],
  ['checker negative controls', process.execPath, ['tools/checker-controls.mjs']],
  ['license + secret scan', process.execPath, ['tools/supply-chain.mjs']],
  ['dependency audit (high/critical gate)', process.execPath, npmArgs('audit', '--audit-level=high')],
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
