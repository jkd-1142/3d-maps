# EVIDENCE — Taiwan 3D Map

## Kết luận

**PASS — Assurance Tier 2.** Toàn bộ 17 tiêu chí hành vi, 8 ràng buộc phi chức năng và 11 lớp gauntlet đã đạt trên commit mã nguồn `ccc39eca2fb415ffdb6849a254f2d8244027f728`.

Đây là bằng chứng có thể chạy lại, không phải tuyên bố rằng phần mềm bất khả lỗi. Entry point duy nhất để tái kiểm chứng là:

```powershell
npm ci
npm run gauntlet
```

## Phạm vi và phê duyệt

- Đặc tả: `SPEC.md`, bản 1 cùng Revision 2; tài liệu được giữ append-only.
- Phê duyệt của người dùng: “duyệt hãy thực hiện dự án ngay” và “duyệt tất cả, hãy chạy dự án tới hoàn thành 100%”.
- Tier: **2** — không yêu cầu verifier độc lập. Không có API, cơ sở dữ liệu, xác thực, tiền tệ hay concurrency trong phạm vi; các lớp đó được đánh dấu không áp dụng thay vì bỏ qua im lặng.
- Dữ liệu và runtime: 22 tỉnh/thành, 22 landmark duy nhất, Three.js r160 được vendored; không phụ thuộc CDN khi chạy.

## Trạng thái nguồn có thể tái tạo

| Thuộc tính | Giá trị |
|---|---|
| Commit mã đã kiểm chứng | `ccc39eca2fb415ffdb6849a254f2d8244027f728` |
| Số file trong source-state manifest | 43 |
| SHA-256 của source-state manifest | `411565f497284ef7631c7cd14b176324eeedc9bf04715307d78b1ac1bbc9cbf3` |
| Hệ điều hành kiểm chứng | Windows |
| Node.js / npm | 24.19.0 / 11.17.0 |
| Vitest / TypeScript / ESLint | 4.1.10 / 7.0.2 / 10.8.1 |
| Playwright / Stryker | 1.62.1 / 10.0.0 |
| Three.js | 0.160.0 (r160) |

Commit chứa riêng báo cáo này có thể mới hơn commit mã đã kiểm chứng; nội dung ứng dụng và test không thay đổi sau dấu vân tay trên.

## Ma trận SPEC → bằng chứng thực thi

| ID | Hợp đồng | Bằng chứng |
|---|---|---|
| S01 | Build dữ liệu thành công | `shape-core.test.js`, `npm run build:shapes`, asset verifier |
| S02 | Dữ liệu lỗi thất bại an toàn | Unit cases cho geometry thiếu/sai/thoái hóa |
| S03 | Catalog 22 đơn vị nhất quán | Catalog + landmark tests; asset verifier; E2E S05 |
| S04 | Tên trùng không nhập nhằng | ID ổn định cho Hsinchu/Chiayi city–county trong catalog tests |
| S05 | Khởi động và render | Playwright S05: WebGL, 22 mesh, không runtime error |
| S06 | Hover desktop | Playwright S06/S07/S09 |
| S07 | Chọn và camera bay | Playwright S06/S07/S09 |
| S08 | Drag không thành click | Playwright S08/S10 |
| S09 | Reset bằng biển/Escape | Playwright S06/S07/S09 |
| S10 | Zoom và giới hạn camera | Playwright S08/S10 |
| S11 | Cảm ứng/mobile | Playwright S11/S12 trên mobile project |
| S12 | Responsive/resize | Mobile overflow + renderer/camera resize E2E |
| S13 | Accessibility/reduced motion | axe critical scan + reduced-motion E2E |
| S14 | Nội dung thẻ/locale | `card-view.test.js` |
| S15 | Hiệu năng và vòng render | E2E 3 lần khởi động đều dưới 3000 ms; xác nhận không CDN |
| S16 | Server tĩnh an toàn/MIME | Server unit tests + E2E traversal/HEAD |
| S17 | WebGL fallback | E2E ép WebGL failure có kiểm soát và kiểm tra fallback hữu ích |
| N01 | Static, không backend/runtime install | Asset, server và supply-chain checks |
| N02 | 22 mô hình low-poly duy nhất | Catalog/landmark tests và asset verifier |
| N03 | Geometry được sinh có kiểm chứng | Builder unit tests + deterministic build script |
| N04 | Không request ngoài | Playwright network assertion |
| N05 | Evidence-first, lịch sử append-only | `SPEC.md`, git checkpoints, báo cáo này |
| N06 | Supply chain/capability/secret | License allowlist, secret scan, audit high/critical gate |
| N07 | Hỗ trợ reduced motion | Playwright S13 |
| N08 | Acceptance desktop/mobile | PNG trong `artifacts/acceptance/` |

## Kết quả gauntlet cuối

| Lớp | Kết quả |
|---|---|
| Asset integrity | PASS — 22 province, 22 landmark, Three.js r160 |
| Unit + integration | PASS — 7 file, 19/19 test |
| Coverage | PASS — statements 109/109, branches 84/84, functions 28/28, lines 100/100 |
| Typecheck | PASS — 0 lỗi |
| Lint | PASS — 0 lỗi, 0 cảnh báo |
| Shuffled order | PASS — seed `20260816`, 19/19 test |
| Property-based | PASS — 2 property, 100 case/property (fast-check) |
| Mutation | PASS — 96,12%, 248/258 mutant bị diệt, 10 sống sót tương đương/dư thừa |
| Browser acceptance | PASS — 9 pass, 9 expected project-skip, 18 lượt được lập lịch, 1 worker ổn định |
| Checker negative controls | PASS — license và secret fixture đều trả exit code 1 |
| Supply chain + audit | PASS gate — 331 package, 0 secret/39 file, 0 high/critical |
| Source state | PASS — commit và SHA-256 khớp bảng trên |

Kết quả tổng: **`GAUNTLET PASS: 11/11 layers`**.

### Phân loại mutation sống sót

10 mutant còn lại đã được xem xét và đều không thay đổi hành vi quan sát được:

- So sánh epsilon `<` → `<=` chỉ đổi đúng biên của ring vốn đã suy biến và bị loại.
- Nhánh easing `< 0.5` → `<= 0.5` tương đương vì hai công thức bằng nhau tại 0.5.
- Đảo dấu tổng shoelace tương đương sau phép `abs`.
- Các biến thể lọc Polygon/MultiPolygon rỗng đều hội tụ về không có ring hợp lệ ở bước kế tiếp.
- Optional chaining tại feature đã match là dư thừa do predicate bảo đảm `properties` tồn tại.

## Supply chain

- License inventory: 0BSD 1, Apache-2.0 52, BSD-2-Clause 6, BSD-3-Clause 8, BlueOak-1.0.0 2, CC-BY-4.0 1, ISC 13, MIT 234, MPL-2.0 14.
- Secret scan: 0 phát hiện trong 39 file.
- `npm audit`: 0 high, 0 critical; còn **2 moderate** trong dependency phát triển bắc cầu `qs` qua `typed-rest-client`. `npm audit fix --dry-run` không tạo thay đổi; runtime ứng dụng tĩnh không dùng chuỗi này. Đây là rủi ro được ghi nhận, không bị che giấu.

## Nhật ký RED → GREEN và negative evidence

Các thất bại quan trọng đã được quan sát thật trước khi sửa:

1. 15/15 unit test đỏ trên stub, sau đó 15/15 xanh.
2. Landmark contract đỏ 1 test trước khi triển khai model catalog.
3. E2E S05 đỏ trên ứng dụng stub trước khi triển khai scene.
4. Coverage checker ban đầu fail-open; negative control chứng minh ngưỡng 87,5% trả non-zero sau khi sửa cấu hình, rồi suite đạt 100%.
5. Shape builder lần đầu thất bại vì thiếu thư mục `data/`; đã sửa đường tạo output.
6. WebGL fallback fixture ban đầu chưa ép đúng failure; test được làm chặt trước khi implementation đạt.
7. E2E chạy song song gây GPU timeout; harness được ổn định bằng một worker, không nới timeout hợp đồng.
8. Gauntlet runner lần đầu gặp `spawnSync npm.cmd EINVAL`; đã chuyển sang npm exec path hiện hành.
9. Fresh gauntlet phát hiện startup 3081 ms và mobile timeout; tối ưu asset/scene thực tế, giữ nguyên ngưỡng 3000 ms.
10. Mutation tăng từ 84,11% → 93,80% → 95,35% → 96,12% bằng test hành vi bổ sung.
11. Hai checker negative control cuối (license và secret) đều cố ý làm gauntlet con thất bại với exit code 1.

## Giới hạn và cách diễn giải

- Không có verifier độc lập vì Tier 2; đây là lớp duy nhất không thực hiện theo thiết kế assurance đã duyệt.
- API/DB/auth/concurrency không tồn tại trong kiến trúc static nên không áp dụng.
- Browser matrix dùng Chromium desktop/mobile emulation; không tuyên bố đã chạy Safari/Firefox hay thiết bị vật lý.
- “Hoàn thành 100%” ở đây nghĩa là 100% checklist/spec đã duyệt và 11/11 gauntlet, không phải chứng minh tuyệt đối rằng không thể có lỗi ngoài phạm vi.

## Revision 3 — Tiếng Trung phồn thể

**PASS** trên commit mã `17e2a4e000cc3579ad39b1dccbfce1e7ee01880b`.

| Thuộc tính | Kết quả |
|---|---|
| Phạm vi bản địa hóa | 2 locale; toàn bộ UI, a11y, trạng thái, fallback, 22 đơn vị và 22 địa danh |
| Unit/integration | 8 file, 22/22 test |
| Coverage | 100% statements 116/116, branches 93/93, functions 29/29, lines 106/106 |
| Browser acceptance | 10 pass, 10 expected project-skip; desktop + mobile Chromium |
| Bilingual contract | `?lang=zh-TW`, persistence, chuyển Việt ↔ 繁中 không mất lựa chọn |
| Mutation | 96,18%; 277/288 killed, 11 equivalent/redundant survivors |
| Typecheck / lint | 0 lỗi / 0 cảnh báo |
| Supply chain | 331 package; 0 secret trong 42 file; 0 high/critical; 2 moderate dev-transitive |
| Source-state | 47 file; SHA-256 `89aac256f5540e1bede959eebba38100b9fd7537a1aac3593221313eaa006d58` |
| Tổng gauntlet | **11/11 PASS** |

Hai mutant formatter tiếng Trung có hành vi quan sát được đã được đóng bằng case
làm tròn đơn vị vạn và dữ liệu giả dạng chuỗi, nâng mutation từ 95,49% lên
96,18%. Mutant default locale `'vi'` → `''` còn lại là tương đương vì cả hai đều
được `normalizeLocale` quy về tiếng Việt; 10 survivor cũ vẫn thuộc các nhóm biên
toán học hoặc nhánh rỗng hội tụ đã phân loại ở trên.

Fresh gauntlet đầu của revision phát hiện WebGL software renderer bị GPU stall
khi browser chạy ngay sau năm mutation worker: một lượt startup 4.434 ms cùng
timeout axe/screenshot. Không nới ngưỡng 3.000 ms. Runtime được sửa để giới hạn
30 FPS và render theo nhu cầu khi `prefers-reduced-motion`; browser gate được
chạy trên môi trường sạch trước mutation. Kết quả E2E ổn định còn 38–50 giây và
fresh gauntlet cuối đạt đủ 11/11 lớp.
