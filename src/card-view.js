import { normalizeLocale } from './i18n.js';

export function provinceCardView(province, landmark, locale = 'vi') {
  if (!province || !Number.isFinite(province.pop)) {
    throw new Error('Expected a finite population');
  }
  if (!Number.isFinite(province.area)) {
    throw new Error('Expected a finite area');
  }
  if (!landmark || typeof landmark.title !== 'string' || typeof landmark.desc !== 'string') {
    throw new Error('Expected a complete landmark');
  }
  const normalized = normalizeLocale(locale);
  if (normalized === 'zh-TW') {
    if (![province.zh, province.typeZh, landmark.titleZh, landmark.descZh].every((value) => typeof value === 'string' && value.length > 0)) {
      throw new Error('Expected complete Traditional Chinese content');
    }
    const population = (province.pop / 10000).toLocaleString('zh-TW', { maximumFractionDigits: 2 });
    return {
      type: province.typeZh,
      name: province.zh,
      landmark: landmark.titleZh,
      description: landmark.descZh,
      stats: `${population} 萬人 · ${province.area.toLocaleString('zh-TW')} 平方公里`,
    };
  }
  const population = (province.pop / 1e6).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return {
    type: province.type,
    name: province.name,
    landmark: landmark.title,
    description: landmark.desc,
    stats: `${population} triệu dân · ${province.area.toLocaleString('vi-VN')} km²`,
  };
}
