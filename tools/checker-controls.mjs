import { spawnSync } from 'node:child_process';

for (const flag of ['--negative-license', '--negative-secret']) {
  const result = spawnSync(process.execPath, ['tools/supply-chain.mjs', flag], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
  if (result.status === 0) {
    throw new Error(`Negative control failed open: ${flag}`);
  }
  console.log(`Negative control passed: ${flag} produced exit ${result.status}`);
}
