import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

function validateLicense(name, license) {
  if (typeof license !== 'string' || license.trim() === '' || /UNLICENSED|SEE LICENSE/i.test(license)) {
    throw new Error(`Unacceptable or missing license: ${name} (${license || 'missing'})`);
  }
}

function validateSecrets(relative, content) {
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bghp_[A-Za-z0-9]{30,}\b/,
    /\bsk-[A-Za-z0-9_-]{30,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
  ];
  if (patterns.some((pattern) => pattern.test(content))) {
    throw new Error(`Potential secret in ${relative}`);
  }
}

if (process.argv.includes('--negative-license')) {
  validateLicense('known-bad-fixture', 'UNLICENSED');
  console.log('LICENSE CHECKER FAILED OPEN');
  process.exit(0);
}
if (process.argv.includes('--negative-secret')) {
  validateSecrets('known-bad-fixture', '-----BEGIN ' + 'PRIVATE KEY-----');
  console.log('SECRET CHECKER FAILED OPEN');
  process.exit(0);
}

const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const installed = Object.entries(lock.packages)
  .filter(([path]) => path.startsWith('node_modules/') && !path.slice('node_modules/'.length).includes('/node_modules/'));
const licenses = new Map();
for (const [path, metadata] of installed) {
  const name = path.slice('node_modules/'.length);
  validateLicense(name, metadata.license);
  licenses.set(metadata.license, (licenses.get(metadata.license) ?? 0) + 1);
}

const root = new URL('../', import.meta.url);
const listed = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' });
let scanned = 0;
for (const relative of listed.split('\0').filter(Boolean)) {
  if (!/\.(?:js|mjs|json|md|html|css|yml|yaml|txt)$/i.test(relative)) {
    continue;
  }
  validateSecrets(relative, await readFile(new URL(relative.replaceAll('\\', '/'), root), 'utf8'));
  scanned += 1;
}
console.log(`Supply chain verified: ${installed.length} top-level installed packages; licenses=${JSON.stringify(Object.fromEntries([...licenses].sort()))}; secrets=0/${scanned} files`);
