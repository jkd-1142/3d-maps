import { describe, expect, it } from 'vitest';
import { COPY, SUPPORTED_LOCALES, copyFor, normalizeLocale } from '../../src/i18n.js';

describe('Revision 3 Traditional Chinese localization', () => {
  it('normalizes Chinese variants and safely falls back to Vietnamese', () => {
    expect(normalizeLocale('zh-TW')).toBe('zh-TW');
    expect(normalizeLocale('zh-Hant')).toBe('zh-TW');
    expect(normalizeLocale('vi-VN')).toBe('vi');
    expect(normalizeLocale(null)).toBe('vi');
  });

  it('publishes complete immutable UI dictionaries for both locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['vi', 'zh-TW']);
    expect(Object.keys(COPY.vi)).toEqual(Object.keys(COPY['zh-TW']));
    expect(Object.values(COPY.vi).every(Boolean)).toBe(true);
    expect(Object.values(COPY['zh-TW']).every(Boolean)).toBe(true);
    expect(copyFor('zh-Hant').title).toBe('臺灣 3D — 22 縣市');
    expect(copyFor('en').title).toBe('Đài Loan 3D — 22 huyện thị');
    expect(Object.isFrozen(COPY)).toBe(true);
    expect(Object.isFrozen(COPY['zh-TW'])).toBe(true);
  });
});
