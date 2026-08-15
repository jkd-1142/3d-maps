export const PROVINCES = Object.freeze([
  { id: 'taipei', zh: '臺北市', name: 'Đài Bắc', type: 'Thành phố trực thuộc TW', typeZh: '直轄市', pop: 2510000 },
  { id: 'new-taipei', zh: '新北市', name: 'Tân Bắc', type: 'Thành phố trực thuộc TW', typeZh: '直轄市', pop: 4030000 },
  { id: 'taoyuan', zh: '桃園市', sourceZh: '桃園', name: 'Đào Viên', type: 'Thành phố trực thuộc TW', typeZh: '直轄市', pop: 2330000 },
  { id: 'taichung', zh: '臺中市', name: 'Đài Trung', type: 'Thành phố trực thuộc TW', typeZh: '直轄市', pop: 2860000 },
  { id: 'tainan', zh: '臺南市', name: 'Đài Nam', type: 'Thành phố trực thuộc TW', typeZh: '直轄市', pop: 1860000 },
  { id: 'kaohsiung', zh: '高雄市', name: 'Cao Hùng', type: 'Thành phố trực thuộc TW', typeZh: '直轄市', pop: 2730000 },
  { id: 'keelung', zh: '基隆市', name: 'Cơ Long', type: 'Thành phố', typeZh: '市', pop: 360000 },
  { id: 'hsinchu-city', zh: '新竹市', name: 'Tân Trúc', type: 'Thành phố', typeZh: '市', pop: 450000 },
  { id: 'chiayi-city', zh: '嘉義市', name: 'Gia Nghĩa', type: 'Thành phố', typeZh: '市', pop: 260000 },
  { id: 'hsinchu-county', zh: '新竹縣', name: 'Tân Trúc', type: 'Huyện', typeZh: '縣', pop: 590000 },
  { id: 'miaoli', zh: '苗栗縣', name: 'Miêu Lật', type: 'Huyện', typeZh: '縣', pop: 530000 },
  { id: 'changhua', zh: '彰化縣', name: 'Chương Hóa', type: 'Huyện', typeZh: '縣', pop: 1240000 },
  { id: 'nantou', zh: '南投縣', name: 'Nam Đầu', type: 'Huyện', typeZh: '縣', pop: 480000 },
  { id: 'yunlin', zh: '雲林縣', name: 'Vân Lâm', type: 'Huyện', typeZh: '縣', pop: 660000 },
  { id: 'chiayi-county', zh: '嘉義縣', name: 'Gia Nghĩa', type: 'Huyện', typeZh: '縣', pop: 480000 },
  { id: 'pingtung', zh: '屏東縣', name: 'Bình Đông', type: 'Huyện', typeZh: '縣', pop: 800000 },
  { id: 'yilan', zh: '宜蘭縣', name: 'Nghi Lan', type: 'Huyện', typeZh: '縣', pop: 450000 },
  { id: 'hualien', zh: '花蓮縣', name: 'Hoa Liên', type: 'Huyện', typeZh: '縣', pop: 320000 },
  { id: 'taitung', zh: '臺東縣', name: 'Đài Đông', type: 'Huyện', typeZh: '縣', pop: 210000 },
  { id: 'penghu', zh: '澎湖縣', name: 'Bành Hồ', type: 'Huyện', typeZh: '縣', pop: 110000 },
  { id: 'kinmen', zh: '金門縣', name: 'Kim Môn', type: 'Huyện', typeZh: '縣', pop: 140000 },
  { id: 'lienchiang', zh: '連江縣', name: 'Liên Giang (Mã Tổ)', type: 'Huyện', typeZh: '縣', pop: 13000 },
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
    if (![item.zh, item.name, item.type, item.typeZh].every((value) => typeof value === 'string' && value.length > 0)) {
      throw new Error(`Catalog text is incomplete for ${item.id}`);
    }
    if (!Number.isFinite(item.pop) || item.pop <= 0) {
      throw new Error(`Catalog population is invalid for ${item.id}`);
    }
    ids.add(item.id);
  }
  return true;
}
