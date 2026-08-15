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
});
