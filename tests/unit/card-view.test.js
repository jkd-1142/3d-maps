import { describe, expect, it } from 'vitest';
import { provinceCardView } from '../../src/card-view.js';

describe('S14 province card locale formatting', () => {
  it('formats Vietnamese population and area without unsafe markup', () => {
    const result = provinceCardView(
      { id: 'taipei', type: 'Thành phố trực thuộc TW', name: 'Đài Bắc', pop: 2510000, area: 271 },
      { title: 'Tháp Taipei 101', desc: '<b>Từng cao nhất</b>' },
    );
    expect(result).toEqual({
      type: 'Thành phố trực thuộc TW',
      name: 'Đài Bắc',
      landmark: 'Tháp Taipei 101',
      description: '<b>Từng cao nhất</b>',
      stats: '2,51 triệu dân · 271 km²',
    });
    expect(JSON.stringify(result)).not.toMatch(/undefined|NaN/);
    expect(provinceCardView(
      { id: 'x', type: 'Huyện', name: 'X', pop: 2500000, area: 12345 },
      { title: 'Mốc', desc: 'Mô tả' },
    ).stats).toBe('2,50 triệu dân · 12.345 km²');
  });

  it('rejects missing or non-finite values', () => {
    expect(() => provinceCardView({ name: 'x', pop: Number.NaN, area: 1 }, { title: 'x', desc: 'x' })).toThrow('finite population');
    expect(() => provinceCardView({ name: 'x', pop: 1, area: Number.NaN }, { title: 'x', desc: 'x' })).toThrow('finite area');
    expect(() => provinceCardView({ name: 'x', pop: 1, area: 1 }, null)).toThrow('landmark');
    expect(() => provinceCardView({ name: 'x', pop: 1, area: 1 }, { title: 4, desc: 'x' })).toThrow('landmark');
    expect(() => provinceCardView({ name: 'x', pop: 1, area: 1 }, { title: 'x', desc: 4 })).toThrow('landmark');
  });
});
