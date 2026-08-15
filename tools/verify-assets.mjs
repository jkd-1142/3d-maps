import { stat } from 'node:fs/promises';
import { PROVINCE_SHAPES } from '../data/province-shapes.js';
import { LANDMARKS } from '../src/landmarks.js';
import { PROVINCES, assertCatalog } from '../src/province-catalog.js';

assertCatalog(PROVINCES);
const ids = PROVINCES.map(({ id }) => id).sort();
const shapeIds = PROVINCE_SHAPES.map(({ id }) => id).sort();
const landmarkIds = Object.keys(LANDMARKS).sort();
if (JSON.stringify(ids) !== JSON.stringify(shapeIds) || JSON.stringify(ids) !== JSON.stringify(landmarkIds)) {
  throw new Error('Asset id sets differ');
}
for (const province of PROVINCE_SHAPES) {
  if (!province.polys.length || province.polys.some((ring) => ring.length < 4)) {
    throw new Error(`Invalid generated shape: ${province.id}`);
  }
}
for (const relative of ['../vendor/three.module.js', '../vendor/addons/controls/OrbitControls.js']) {
  const info = await stat(new URL(relative, import.meta.url));
  if (!info.isFile() || info.size < 1_000) {
    throw new Error(`Vendored asset missing or truncated: ${relative}`);
  }
}
console.log(`Assets verified: ${PROVINCE_SHAPES.length} provinces, ${landmarkIds.length} landmarks, vendored Three.js r160`);
