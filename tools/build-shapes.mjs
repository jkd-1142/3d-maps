import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PROVINCES } from '../src/province-catalog.js';
import { buildProvinceEntries, serializeProvinceModule } from './shape-core.mjs';

const SOURCE_URL = 'https://raw.githubusercontent.com/ronnywang/twgeojson/master/twcounty2010.2.json';
const outputUrl = new URL('../data/province-shapes.js', import.meta.url);
const temporaryUrl = new URL(`../data/.province-shapes-${process.pid}.tmp`, import.meta.url);

async function fetchGeoJson() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(SOURCE_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`GeoJSON request failed: HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const geoJson = await fetchGeoJson();
  const entries = buildProvinceEntries(geoJson, PROVINCES);
  const moduleText = serializeProvinceModule(entries);
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  await writeFile(temporaryUrl, moduleText, { encoding: 'utf8', flag: 'wx' });
  await rm(outputUrl, { force: true });
  await rename(temporaryUrl, outputUrl);
  console.log(`Built ${entries.length} provinces -> ${fileURLToPath(outputUrl)}`);
}

main().catch(async (error) => {
  await rm(temporaryUrl, { force: true });
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
