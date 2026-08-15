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

  it('formats complete Traditional Chinese province and landmark content', () => {
    const result = provinceCardView(
      { id: 'taipei', type: 'Thành phố trực thuộc TW', typeZh: '直轄市', name: 'Đài Bắc', zh: '臺北市', pop: 2510000, area: 271 },
      { title: 'Tháp Taipei 101', desc: 'Mô tả', titleZh: '臺北 101', descZh: '臺北的代表性地標。' },
      'zh-TW',
    );
    expect(result).toEqual({
      type: '直轄市',
      name: '臺北市',
      landmark: '臺北 101',
      description: '臺北的代表性地標。',
      stats: '251 萬人 · 271 平方公里',
    });
    expect(() => provinceCardView(
      { typeZh: '直轄市', zh: '臺北市', pop: 1, area: 1 },
      { title: 'x', desc: 'x', titleZh: '', descZh: '說明' },
      'zh',
    )).toThrow('Traditional Chinese');
  });

  it('rejects missing or non-finite values', () => {
    expect(() => provinceCardView({ name: 'x', pop: Number.NaN, area: 1 }, { title: 'x', desc: 'x' })).toThrow('finite population');
    expect(() => provinceCardView({ name: 'x', pop: 1, area: Number.NaN }, { title: 'x', desc: 'x' })).toThrow('finite area');
    expect(() => provinceCardView({ name: 'x', pop: 1, area: 1 }, null)).toThrow('landmark');
    expect(() => provinceCardView({ name: 'x', pop: 1, area: 1 }, { title: 4, desc: 'x' })).toThrow('landmark');
    expect(() => provinceCardView({ name: 'x', pop: 1, area: 1 }, { title: 'x', desc: 4 })).toThrow('landmark');
  });
});
