import { describe, expect, it } from 'vitest';
import { PROVINCES } from '../../src/province-catalog.js';
import { buildProvinceEntries, serializeProvinceModule } from '../../tools/shape-core.mjs';

function makeGeoJson({ missingLast = false, invalidLast = false } = {}) {
  const source = missingLast ? PROVINCES.slice(0, -1) : PROVINCES;
  return {
    type: 'FeatureCollection',
    features: source.map((meta, index) => ({
      type: 'Feature',
      properties: { county: meta.zh.replaceAll('臺', '台') + (meta.type === 'Huyện' ? '縣' : '市'), area: (index + 1) * 1_000_000 },
      geometry: {
        type: 'MultiPolygon',
        coordinates: invalidLast && index === source.length - 1
          ? [[[[0, 0], [0, 0]]]]
          : [[[[120, 23], [120.1, 23], [120.1, 23.1], [120, 23.1], [120, 23]]], [[[0, 0], [0, 0]]]],
      },
    })),
  };
}

describe('GeoJSON shape builder', () => {
  it('S01 creates 22 valid entries and removes degenerate rings', () => {
    const entries = buildProvinceEntries(makeGeoJson(), PROVINCES);
    expect(entries).toHaveLength(22);
    expect(entries.map(({ id }) => id)).toEqual(PROVINCES.map(({ id }) => id));
    for (const entry of entries) {
      expect(entry.polys).toHaveLength(1);
      expect(entry.polys[0].length).toBeGreaterThanOrEqual(4);
      expect(entry.area).toBeGreaterThan(0);
    }
    expect(serializeProvinceModule(entries)).toMatch(/^\/\/ Generated atomically/);
  });

  it('S02 fails closed for missing province or no valid ring', () => {
    expect(() => buildProvinceEntries(makeGeoJson({ missingLast: true }), PROVINCES)).toThrow('Missing GeoJSON feature');
    expect(() => buildProvinceEntries(makeGeoJson({ invalidLast: true }), PROVINCES)).toThrow('No valid polygon rings');
  });
});
