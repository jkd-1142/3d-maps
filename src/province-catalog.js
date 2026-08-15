export const PROVINCES = Object.freeze([
  { id: 'taipei', zh: '臺北', name: 'Đài Bắc', type: 'Thành phố trực thuộc TW', pop: 2510000 },
  { id: 'new-taipei', zh: '新北', name: 'Tân Bắc', type: 'Thành phố trực thuộc TW', pop: 4030000 },
  { id: 'taoyuan', zh: '桃園', name: 'Đào Viên', type: 'Thành phố trực thuộc TW', pop: 2330000 },
  { id: 'taichung', zh: '臺中', name: 'Đài Trung', type: 'Thành phố trực thuộc TW', pop: 2860000 },
  { id: 'tainan', zh: '臺南', name: 'Đài Nam', type: 'Thành phố trực thuộc TW', pop: 1860000 },
  { id: 'kaohsiung', zh: '高雄', name: 'Cao Hùng', type: 'Thành phố trực thuộc TW', pop: 2730000 },
  { id: 'keelung', zh: '基隆', name: 'Cơ Long', type: 'Thành phố', pop: 360000 },
  { id: 'hsinchu-city', zh: '新竹市', name: 'Tân Trúc', type: 'Thành phố', pop: 450000 },
  { id: 'chiayi-city', zh: '嘉義市', name: 'Gia Nghĩa', type: 'Thành phố', pop: 260000 },
  { id: 'hsinchu-county', zh: '新竹縣', name: 'Tân Trúc', type: 'Huyện', pop: 590000 },
  { id: 'miaoli', zh: '苗栗', name: 'Miêu Lật', type: 'Huyện', pop: 530000 },
  { id: 'changhua', zh: '彰化', name: 'Chương Hóa', type: 'Huyện', pop: 1240000 },
  { id: 'nantou', zh: '南投', name: 'Nam Đầu', type: 'Huyện', pop: 480000 },
  { id: 'yunlin', zh: '雲林', name: 'Vân Lâm', type: 'Huyện', pop: 660000 },
  { id: 'chiayi-county', zh: '嘉義縣', name: 'Gia Nghĩa', type: 'Huyện', pop: 480000 },
  { id: 'pingtung', zh: '屏東', name: 'Bình Đông', type: 'Huyện', pop: 800000 },
  { id: 'yilan', zh: '宜蘭', name: 'Nghi Lan', type: 'Huyện', pop: 450000 },
  { id: 'hualien', zh: '花蓮', name: 'Hoa Liên', type: 'Huyện', pop: 320000 },
  { id: 'taitung', zh: '臺東', name: 'Đài Đông', type: 'Huyện', pop: 210000 },
  { id: 'penghu', zh: '澎湖', name: 'Bành Hồ', type: 'Huyện', pop: 110000 },
  { id: 'kinmen', zh: '金門', name: 'Kim Môn', type: 'Huyện', pop: 140000 },
  { id: 'lienchiang', zh: '連江', name: 'Liên Giang (Mã Tổ)', type: 'Huyện', pop: 13000 },
]);

export function assertCatalog(catalog) {
  if (!Array.isArray(catalog) || catalog.length !== 22) {
    throw new Error('Catalog must contain exactly 22 provinces');
  }
  const ids = new Set();
  for (const item of catalog) {
    if (!item || typeof item.id !== 'string' || item.id.length === 0 || ids.has(item.id)) {
      throw new Error('Catalog ids must be non-empty and unique');
    }
    if (![item.zh, item.name, item.type].every((value) => typeof value === 'string' && value.length > 0)) {
      throw new Error(`Catalog text is incomplete for ${item.id}`);
    }
    if (!Number.isFinite(item.pop) || item.pop <= 0) {
      throw new Error(`Catalog population is invalid for ${item.id}`);
    }
    ids.add(item.id);
  }
  return true;
}
