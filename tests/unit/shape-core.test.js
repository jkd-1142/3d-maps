import { describe, expect, it } from 'vitest';
import { PROVINCES } from '../../src/province-catalog.js';
import { buildProvinceEntries, serializeProvinceModule } from '../../tools/shape-core.mjs';

function makeGeoJson({ missingLast = false, invalidLast = false, polygonFirst = false, unsupportedLast = false, invalidAreaLast = false } = {}) {
  const source = missingLast ? PROVINCES.slice(0, -1) : PROVINCES;
  return {
    type: 'FeatureCollection',
    features: source.map((meta, index) => ({
      type: 'Feature',
      properties: { county: meta.zh.replaceAll('臺', '台') + (meta.type === 'Huyện' ? '縣' : '市'), area: invalidAreaLast && index === source.length - 1 ? 0 : (index + 1) * 1_000_000 },
      geometry: {
        type: unsupportedLast && index === source.length - 1 ? 'Point' : polygonFirst && index === 0 ? 'Polygon' : 'MultiPolygon',
        coordinates: invalidLast && index === source.length - 1
          ? [[[[0, 0], [0, 0]]]]
          : polygonFirst && index === 0
            ? [[[120, 23], [120.1, 23], [120.1, 23.1], [120, 23.1], [120, 23]]]
            : [[[[120, 23], [120.1, 23], [120.1, 23.1], [120, 23.1], [120, 23]]], [[[0, 0], [0, 0]]], null],
      },
    })),
  };
}

describe('GeoJSON shape builder', () => {
  it('S01 creates 22 valid entries and removes degenerate rings', () => {
    const entries = buildProvinceEntries(makeGeoJson(), PROVINCES);
    expect(entries).toHaveLength(22);
    expect(entries.map(({ id }) => id)).toEqual(PROVINCES.map(({ id }) => id));
    expect(entries[0].area).toBe(1);
    expect(entries[0].polys[0]).toEqual([[120, 23], [120.1, 23], [120.1, 23.1], [120, 23.1], [120, 23]]);
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

  it('S02 rejects malformed collections, geometry, area, and duplicate metadata ids', () => {
    expect(() => buildProvinceEntries(null, PROVINCES)).toThrow('Invalid GeoJSON FeatureCollection');
    expect(() => buildProvinceEntries({ type: 'FeatureCollection', features: null }, PROVINCES)).toThrow('Invalid GeoJSON FeatureCollection');
    const missingGeometry = makeGeoJson();
    missingGeometry.features[0].geometry = null;
    expect(() => buildProvinceEntries(missingGeometry, PROVINCES)).toThrow('Invalid GeoJSON geometry');
    const emptyPolygon = makeGeoJson();
    emptyPolygon.features[0].geometry = { type: 'Polygon', coordinates: [] };
    expect(() => buildProvinceEntries(emptyPolygon, PROVINCES)).toThrow('No valid polygon rings');
    expect(() => buildProvinceEntries(makeGeoJson({ unsupportedLast: true }), PROVINCES)).toThrow('Unsupported GeoJSON geometry');
    expect(() => buildProvinceEntries(makeGeoJson({ invalidAreaLast: true }), PROVINCES)).toThrow('Invalid area');
    expect(() => buildProvinceEntries(makeGeoJson({ polygonFirst: true }), PROVINCES)).not.toThrow();
    const duplicateMetadata = PROVINCES.map((item, index) => index === 1 ? { ...item, id: PROVINCES[0].id } : item);
    expect(() => buildProvinceEntries(makeGeoJson(), duplicateMetadata)).toThrow('exactly 22 unique provinces');
    expect(() => buildProvinceEntries(makeGeoJson(), [...PROVINCES, PROVINCES[0]])).toThrow('exactly 22 unique provinces');
    expect(() => buildProvinceEntries(makeGeoJson({ missingLast: true }), PROVINCES.slice(0, -1))).toThrow('exactly 22 unique provinces');
  });

  it('S01 enforces ring shape and area thresholds at their exact boundaries', () => {
    const shortTriangle = makeGeoJson();
    shortTriangle.features[0].geometry.coordinates = [[[[0, 0], [1, 0], [0, 1], [0, 0]]]];
    expect(buildProvinceEntries(shortTriangle, PROVINCES)[0].polys[0]).toHaveLength(4);

    const thresholdRing = [[0, 0], [0.02, 0], [0.02, 0.01], [0, 0.01], [0, 0]];
    const thresholdGeo = makeGeoJson();
    thresholdGeo.features[0].geometry.coordinates = [[thresholdRing]];
    expect(() => buildProvinceEntries(thresholdGeo, PROVINCES)).toThrow('No valid polygon rings');

    const malformedButArrayLike = /** @type {any} */ ({ 0: [0, 0], 1: [1, 0], 2: [1, 1], 3: [0, 1], 4: [0, 0], length: 5 });
    const guardedGeo = makeGeoJson();
    guardedGeo.features[0].geometry.coordinates.unshift([malformedButArrayLike]);
    guardedGeo.features.unshift(/** @type {any} */ (null), /** @type {any} */ ({ properties: {} }), /** @type {any} */ ({ properties: { county: 42 } }));
    expect(() => buildProvinceEntries(guardedGeo, PROVINCES)).not.toThrow();
  });
});
