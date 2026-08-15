import { describe, expect, it } from 'vitest';
import { PROVINCES, assertCatalog } from '../../src/province-catalog.js';

describe('S03/S04 catalog consistency', () => {
  it('S03 exposes exactly 22 complete, unique provinces', () => {
    expect(() => assertCatalog(PROVINCES)).not.toThrow();
    expect(PROVINCES).toHaveLength(22);
    expect(new Set(PROVINCES.map(({ id }) => id)).size).toBe(22);
    for (const item of PROVINCES) {
      expect(item).toMatchObject({ id: expect.any(String), zh: expect.any(String), name: expect.any(String), type: expect.any(String), pop: expect.any(Number) });
      expect(item.pop).toBeGreaterThan(0);
    }
  });

  it('S04 keeps duplicate Vietnamese names distinct by stable id', () => {
    const byId = Object.fromEntries(PROVINCES.map((item) => [item.id, item]));
    expect(byId['hsinchu-city'].name).toBe(byId['hsinchu-county'].name);
    expect(byId['hsinchu-city'].type).not.toBe(byId['hsinchu-county'].type);
    expect(byId['chiayi-city'].name).toBe(byId['chiayi-county'].name);
    expect(byId['chiayi-city'].type).not.toBe(byId['chiayi-county'].type);
  });

  it('S03 rejects incomplete, duplicate, or invalid catalog records', () => {
    expect(() => assertCatalog(null)).toThrow('exactly 22');
    expect(() => assertCatalog(PROVINCES.slice(1))).toThrow('exactly 22');
    expect(() => assertCatalog(PROVINCES.map((item, index) => index === 1 ? { ...item, id: PROVINCES[0].id } : item))).toThrow('non-empty and unique');
    expect(() => assertCatalog(PROVINCES.map((item, index) => index === 0 ? { ...item, id: '' } : item))).toThrow('non-empty and unique');
    expect(() => assertCatalog(PROVINCES.map((item, index) => index === 0 ? { ...item, name: '' } : item))).toThrow('text is incomplete');
    expect(() => assertCatalog(PROVINCES.map((item, index) => index === 0 ? { ...item, pop: 0 } : item))).toThrow('population is invalid');
  });
});
