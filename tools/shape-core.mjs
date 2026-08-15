function ringArea(ring) {
  let sum = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    sum += ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1];
  }
  return Math.abs(sum / 2);
}

function normalizeChinese(value) {
  return value.replaceAll('台', '臺');
}

function outerRings(geometry) {
  if (!geometry || !Array.isArray(geometry.coordinates)) {
    throw new Error('Invalid GeoJSON geometry');
  }
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.length > 0 ? [geometry.coordinates[0]] : [];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .filter((polygon) => Array.isArray(polygon) && polygon.length > 0)
      .map((polygon) => polygon[0]);
  }
  throw new Error(`Unsupported GeoJSON geometry: ${geometry.type}`);
}

export function buildProvinceEntries(geoJson, metadata) {
  if (!geoJson || !Array.isArray(geoJson.features)) {
    throw new Error('Invalid GeoJSON FeatureCollection');
  }
  const entries = metadata.map((meta) => {
    const feature = geoJson.features.find((candidate) => {
      const county = candidate?.properties?.county;
      return typeof county === 'string' && normalizeChinese(county).startsWith(meta.sourceZh ?? meta.zh);
    });
    if (!feature) {
      throw new Error(`Missing GeoJSON feature: ${meta.zh} (${meta.id})`);
    }
    const polys = outerRings(feature.geometry)
      .filter((ring) => Array.isArray(ring) && ring.length >= 4 && ringArea(ring) > 2e-4)
      .map((ring) => ring.map(([lon, lat]) => [Number(lon.toFixed(3)), Number(lat.toFixed(3))]));
    if (polys.length === 0) {
      throw new Error(`No valid polygon rings: ${meta.zh} (${meta.id})`);
    }
    const areaSquareMeters = feature.properties?.area;
    if (!Number.isFinite(areaSquareMeters) || areaSquareMeters <= 0) {
      throw new Error(`Invalid area: ${meta.zh} (${meta.id})`);
    }
    return {
      id: meta.id,
      zh: meta.zh,
      name: meta.name,
      type: meta.type,
      typeZh: meta.typeZh,
      pop: meta.pop,
      area: Math.round(areaSquareMeters / 1e6),
      polys,
    };
  });
  if (entries.length !== 22 || new Set(entries.map(({ id }) => id)).size !== 22) {
    throw new Error('Builder must produce exactly 22 unique provinces');
  }
  return entries;
}

export function serializeProvinceModule(entries) {
  return `// Generated atomically by tools/build-shapes.mjs — do not edit\nexport const PROVINCE_SHAPES = ${JSON.stringify(entries)};\n`;
}
