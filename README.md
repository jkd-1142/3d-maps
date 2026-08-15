# Đài Loan 3D — 22 huyện thị

Một bản đồ Three.js tương tác, chạy hoàn toàn bằng file tĩnh và không gọi CDN ở
runtime. Rê chuột hoặc chọn một huyện thị để vùng đất nhô lên, landmark low-poly
xuất hiện và thẻ thông tin tiếng Việt được mở.

## Yêu cầu

- Node.js 20 trở lên (đã kiểm chứng bằng Node 24.19.0).
- Trình duyệt hỗ trợ WebGL; nếu không, giao diện tự chuyển sang chế độ đọc thông
  tin bằng danh sách 22 huyện thị.

## Chạy

```powershell
npm install
npm run vendor
npm run build:shapes
npm run serve
```

Mở `http://127.0.0.1:4173`. `vendor` và `build:shapes` chỉ cần khi dựng lại asset;
các file đã sinh được commit nên bản deploy tĩnh không cần Node hoặc mạng.

## Kiểm chứng

```powershell
npm run gauntlet
```

Lệnh duy nhất này xóa report cũ rồi chạy coverage 100%, type-check, lint, test
shuffle, Stryker mutation, Playwright desktop/mobile, axe accessibility, ảnh
nghiệm thu, negative controls, license/secret scan, `npm audit` và source hash.

## Nguồn dữ liệu

- Ranh giới: `ronnywang/twgeojson`, file `twcounty2010.2.json`.
- Dân số: ước lượng 2024 đã làm tròn, theo đặc tả dự án.
- Three.js r160 được vendored theo giấy phép MIT.

Chi tiết hợp đồng xem `SPEC.md`; kết quả gauntlet cuối xem `EVIDENCE.md`.
