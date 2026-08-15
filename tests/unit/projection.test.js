import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { easeInOutCubic, easeOutBack, project, ringArea, ringCentroid } from '../../src/projection.js';

describe('projection and geometry properties', () => {
  it('S03 projects the Taiwan origin to zero and preserves finite coordinates', () => {
    expect(project(120.95, 23.75)).toEqual({ x: 0, z: -0 });
    fc.assert(fc.property(
      fc.double({ min: 118, max: 123, noNaN: true }),
      fc.double({ min: 21, max: 27, noNaN: true }),
      (lon, lat) => {
        const result = project(lon, lat);
        return Number.isFinite(result.x) && Number.isFinite(result.z);
      },
    ));
  });

  it('S01 computes area and centroid of a concrete square', () => {
    const square = [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]];
    expect(ringArea(square)).toBe(4);
    expect(ringCentroid(square)).toEqual([1, 1]);
  });

  it('S07 easing has exact endpoints and bounded cubic range', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    fc.assert(fc.property(fc.double({ min: 0, max: 1, noNaN: true }), (t) => {
      const eased = easeInOutCubic(t);
      return eased >= 0 && eased <= 1;
    }));
    expect(easeOutBack(0)).toBeCloseTo(0, 10);
    expect(easeOutBack(1)).toBe(1);
  });
});
