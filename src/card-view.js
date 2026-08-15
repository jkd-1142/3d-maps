export function provinceCardView(province, landmark) {
  if (!province || !Number.isFinite(province.pop)) {
    throw new Error('Expected a finite population');
  }
  if (!Number.isFinite(province.area)) {
    throw new Error('Expected a finite area');
  }
  if (!landmark || typeof landmark.title !== 'string' || typeof landmark.desc !== 'string') {
    throw new Error('Expected a complete landmark');
  }
  const population = (province.pop / 1e6).toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return {
    type: province.type,
    name: province.name,
    landmark: landmark.title,
    description: landmark.desc,
    stats: `${population} triệu dân · ${province.area.toLocaleString('vi-VN')} km²`,
  };
}
