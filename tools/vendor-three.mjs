import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const copies = [
  ['../node_modules/three/build/three.module.js', '../vendor/three.module.js'],
  ['../node_modules/three/examples/jsm/controls/OrbitControls.js', '../vendor/addons/controls/OrbitControls.js'],
];

for (const [source, destination] of copies) {
  const from = fileURLToPath(new URL(source, import.meta.url));
  const to = fileURLToPath(new URL(destination, import.meta.url));
  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
  console.log(`Vendored ${to}`);
}
