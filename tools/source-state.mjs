import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' });
const files = output.split('\0').filter(Boolean).sort();
const digest = createHash('sha256');
for (const relative of files) {
  digest.update(relative.replaceAll('\\', '/'));
  digest.update('\0');
  digest.update(await readFile(new URL(relative.replaceAll('\\', '/'), root)));
  digest.update('\0');
}
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
console.log(`Source state: commit=${commit} files=${files.length} sha256=${digest.digest('hex')}`);
