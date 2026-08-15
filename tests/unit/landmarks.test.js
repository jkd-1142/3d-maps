import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { PROVINCES } from '../../src/province-catalog.js';
import { LANDMARKS } from '../../src/landmarks.js';

describe('S03/S04 landmark catalog', () => {
  it('has one non-empty Three group for every stable province id', () => {
    expect(Object.keys(LANDMARKS).sort()).toEqual(PROVINCES.map(({ id }) => id).sort());
    for (const province of PROVINCES) {
      const landmark = LANDMARKS[province.id];
      expect(landmark).toMatchObject({ titleZh: expect.any(String), descZh: expect.any(String) });
      expect(landmark.title.length).toBeGreaterThan(2);
      expect(landmark.desc.length).toBeGreaterThan(10);
      const model = landmark.build();
      expect(model).toBeInstanceOf(THREE.Group);
      expect(model.children.length).toBeGreaterThan(0);
    }
    expect(LANDMARKS['hsinchu-city'].title).not.toBe(LANDMARKS['hsinchu-county'].title);
    expect(LANDMARKS['chiayi-city'].title).not.toBe(LANDMARKS['chiayi-county'].title);
  });
});
