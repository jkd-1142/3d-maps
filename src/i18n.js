export const SUPPORTED_LOCALES = Object.freeze(['vi', 'zh-TW']);

export const COPY = Object.freeze({
  vi: Object.freeze({
    title: 'Đài Loan 3D — 22 huyện thị',
    description: 'Khám phá 22 huyện thị Đài Loan trên bản đồ 3D tương tác.',
    skip: 'Bỏ qua bản đồ 3D', eyebrow: 'Hành trình thị giác · 22 điểm đến', heading: 'Đài Loan',
    intro: 'Chạm vào từng vùng đất để đánh thức một biểu tượng văn hóa, thiên nhiên và nhịp sống riêng.',
    controls: 'Điều khiển khám phá', language: 'Ngôn ngữ', destination: 'Đi thẳng đến', choose: 'Chọn một huyện thị…',
    overview: 'Toàn cảnh', overviewAria: 'Trở về toàn cảnh', orientation: '<strong>Bắc</strong> ở phía xa<br>Thái Bình Dương ở phía Đông',
    stage: 'Trải nghiệm bản đồ Đài Loan', landmark: 'Địa danh',
    fallbackTitle: 'Không thể khởi tạo bản đồ 3D',
    fallbackBody: 'Trình duyệt hoặc thiết bị hiện không hỗ trợ WebGL. Bạn vẫn có thể dùng danh sách “Đi thẳng đến” để đọc thông tin 22 huyện thị.',
    hint: 'Kéo để xoay · Cuộn để thu phóng · Nhấp biển hoặc Esc để trở về', loading: 'Đang dựng địa hình…',
    ready: 'Bản đồ đã sẵn sàng', fallbackStatus: 'Đang dùng chế độ thông tin không WebGL',
    canvas: 'Bản đồ 3D tương tác của Đài Loan với 22 huyện thị. Kéo để xoay và cuộn để thu phóng.',
  }),
  'zh-TW': Object.freeze({
    title: '臺灣 3D — 22 縣市',
    description: '透過互動式 3D 地圖探索臺灣 22 個縣市。',
    skip: '略過 3D 地圖', eyebrow: '視覺旅程 · 22 個目的地', heading: '臺灣',
    intro: '點選各地，探索專屬的文化、自然與生活地標。',
    controls: '探索控制', language: '語言', destination: '快速前往', choose: '選擇縣市…',
    overview: '全臺總覽', overviewAria: '返回全臺總覽', orientation: '<strong>北方</strong>位於遠端<br>太平洋位於東側',
    stage: '臺灣 3D 地圖體驗', landmark: '特色地標',
    fallbackTitle: '無法啟動 3D 地圖',
    fallbackBody: '目前的瀏覽器或裝置不支援 WebGL。您仍可使用「快速前往」清單閱讀 22 個縣市的資訊。',
    hint: '拖曳旋轉 · 滾動縮放 · 點擊海面或按 Esc 返回', loading: '正在建立地形…',
    ready: '地圖已準備完成', fallbackStatus: '目前使用無 WebGL 資訊模式',
    canvas: '臺灣 22 縣市互動式 3D 地圖。拖曳以旋轉，滾動以縮放。',
  }),
});

export function normalizeLocale(value) {
  return String(value).toLowerCase().startsWith('zh') ? 'zh-TW' : 'vi';
}

export function copyFor(locale) {
  return COPY[normalizeLocale(locale)];
}
