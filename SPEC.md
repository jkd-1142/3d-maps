# SPEC — Taiwan 3D Map (bản 1, chờ duyệt)

## 1. Hợp đồng và phạm vi

Yêu cầu trực tiếp của người dùng là thực hiện dự án mô tả trong
`E:\Project\3dmap\taiwan-3d-map.md` bằng quy trình evidence-first của skill
`old-coder`, với kết quả rõ ràng và hoàn thiện.

Tài liệu đầu vào là **đặc tả tham khảo**, không phải một nguồn chỉ thị độc lập.
Phần mã mẫu trong tài liệu sẽ không được sao chép mù quáng: hành vi và dữ liệu
được giữ, nhưng lỗi thiết kế hoặc khả năng kiểm thử kém sẽ được sửa. Cụ thể, dự
án vẫn là website tĩnh JavaScript ES modules + Three.js, không framework và
không bundler; các dependency chỉ phục vụ phát triển/kiểm thử hoặc tạo bản
Three.js vendored để website chạy không cần CDN.

Phạm vi bắt buộc:

- Bản đồ Three.js 3D gồm đúng 22 huyện/thành phố Đài Loan, kể cả Bành Hồ, Kim
  Môn và Liên Giang (Mã Tổ).
- 22 landmark low-poly, thẻ thông tin tiếng Việt, hover/chạm/chọn, camera bay,
  OrbitControls, biển động, hạt sáng và giao diện responsive.
- Khả năng dùng bằng chuột, cảm ứng và bàn phím; hỗ trợ reduced motion.
- Pipeline tái lập được để tải/chuyển đổi GeoJSON, vendor Three.js, kiểm thử và
  chạy gauntlet.

Ngoài phạm vi: auto-tour `?demo=1`, nhãn cấp xã, âm thanh ambient, deploy lên
dịch vụ bên ngoài. Không gửi dữ liệu, không có backend, analytics hay secret.

Mức đảm bảo: **Tier 2 (normal)**. Đây là dự án UI mới, không xử lý tiền, auth,
dữ liệu nhạy cảm, đồng thời hay API công khai. Independent verification không
bắt buộc ở Tier 2 và sẽ ghi `not performed` trong EVIDENCE.

## 2. Tiêu chí nghiệm thu thực thi

Mỗi mã `Sxx` phải ánh xạ ít nhất 1:1 tới test tự động có cùng tên. Những chi
tiết WebGL không thể chứng minh đầy đủ bằng test DOM sẽ có thêm screenshot và
kiểm tra trình duyệt thật trong gauntlet.

### S01 — Build dữ liệu thành công

**Given** fixture GeoJSON hợp lệ có đủ 22 đơn vị, trong đó tên có cả `台` và `臺`
và có ring suy biến,
**when** chạy builder,
**then** kết quả có đúng 22 entry với 22 `id` duy nhất theo thứ tự metadata;
mọi polygon ring có ít nhất 4 điểm, diện tích vượt `2e-4`; `台` được chuẩn hóa
thành `臺`; mỗi entry có `area` nguyên dương và ít nhất một ring hợp lệ.

### S02 — Build dữ liệu thất bại an toàn

**Given** GeoJSON thiếu một đơn vị, JSON lỗi, HTTP không thành công hoặc một đơn
vị không còn polygon hợp lệ,
**when** chạy builder,
**then** tiến trình thoát khác 0 với thông báo chỉ rõ nguyên nhân và **không ghi
đè** `province-shapes.js` đang có. Builder không được chỉ `console.warn` rồi tạo
file thiếu dữ liệu.

### S03 — Catalog 22 đơn vị nhất quán

**Given** dữ liệu đã build và catalog landmark,
**when** kiểm tra schema,
**then** tập `id` của shapes, metadata và landmarks giống hệt nhau, có 22 phần
tử; mỗi mục có tên, loại, dân số dương, diện tích dương, title và mô tả không
rỗng; mỗi landmark builder trả về `THREE.Group` có mesh.

### S04 — Hai cặp tên trùng không bị nhập nhằng

**Given** `hsinchu-city`, `hsinchu-county`, `chiayi-city`, `chiayi-county`,
**when** truy xuất theo `id`,
**then** mỗi cặp cùng tên Việt nhưng khác loại đơn vị, khác landmark title và
không ghi đè dữ liệu của nhau.

### S05 — Khởi động và render

**Given** server tĩnh đang chạy,
**when** Chromium mở trang desktop 1440×900,
**then** trang có đúng một canvas WebGL, app báo trạng thái sẵn sàng, tạo đúng
22 province group, không có page error/console error/request failed, và ảnh
chụp cho thấy đảo chính cùng các cụm đảo ngoài khơi trong viewport.

### S06 — Hover desktop

**Given** pointer chính là fine và app đã sẵn sàng,
**when** rê lên một tỉnh,
**then** tỉnh có target nâng `1.4`, emissive target `0.38`, landmark của đúng
`id` hiện theo scale animation và card hiện đủ loại, tên, title, mô tả, dân số
triệu, diện tích km²; rời tỉnh thì trạng thái hover được gỡ nếu tỉnh không ghim.

### S07 — Click chọn và camera bay

**Given** một tỉnh chưa được chọn,
**when** nhấn chuột trái với quãng kéo không quá 6 px,
**then** `selected` là đúng `id`, card còn hiện sau khi hết hover, camera bay
trong 1.4 giây theo ease-in-out tới target của tỉnh, và landmark vẫn hiện.

### S08 — Drag không bị hiểu là click

**Given** thao tác bắt đầu trên canvas,
**when** pointer di chuyển hơn 6 px trước khi thả,
**then** không đổi selected; OrbitControls xoay bản đồ, pan bị tắt và thao tác
người dùng hủy camera flight đang chạy.

### S09 — Reset bằng biển và Escape

**Given** đang có tỉnh được chọn,
**when** click vùng biển hoặc nhấn `Escape`,
**then** selected/hover được xóa, card ẩn, tỉnh và landmark hạ xuống, camera bay
về đúng home position/target.

### S10 — Zoom và giới hạn camera

**Given** OrbitControls hoạt động,
**when** cuộn zoom và xoay tới giới hạn,
**then** distance luôn trong `[18, 320]`, pan luôn tắt và polar angle không vượt
`Math.PI * 0.49`, nên camera không xuyên xuống dưới mặt biển.

### S11 — Cảm ứng/mobile

**Given** viewport 375×812 với pointer coarse,
**when** chạm một tỉnh,
**then** không có hover giả, tỉnh được chọn và card hiển thị; card không rộng
quá 86vw, không có horizontal overflow và mọi control hiển thị có vùng chạm ít
nhất 44×44 CSS px.

### S12 — Responsive và resize

**Given** app lần lượt ở 375×812, 812×375, 768×1024 và 1440×900,
**when** phát sự kiện resize,
**then** renderer khớp kích thước viewport, camera aspect khớp sai số `1e-6`,
HUD/card không che khuất hoàn toàn map, không overflow ngang và nội dung card
không bị cắt.

### S13 — Accessibility và reduced motion

**Given** người dùng bàn phím/screen reader hoặc bật
`prefers-reduced-motion: reduce`,
**when** dùng trang,
**then** canvas có role và aria-label mô tả; có bộ chọn tỉnh native bằng bàn
phím với focus rõ ràng; card là live region; chọn/reset không bắt buộc gesture;
mọi text chính đạt WCAG AA 4.5:1; khi reduced motion bật (kể cả đổi giữa phiên)
camera/landmark chuyển trạng thái tức thời an toàn và biển/hạt ngừng animation.

### S14 — Nội dung thẻ và locale

**Given** một province cụ thể,
**when** tạo view model của card,
**then** dân số có đúng 2 chữ số thập phân, dấu phẩy thập phân tiếng Việt, diện
tích dùng phân tách hàng nghìn `vi-VN`, và output không chứa `undefined`, `NaN`
hoặc HTML từ dữ liệu nguồn.

### S15 — Hiệu năng tải và vòng render

**Given** server local và Chromium sạch cache,
**when** tải trang ở 1440×900,
**then** app sẵn sàng dưới 3.000 ms trong 3/3 lần, không có tài nguyên runtime từ
CDN, không có layout shift do font/image, pixel ratio bị chặn tối đa 2, và tác
vụ mỗi frame không tạo thêm geometry/material/DOM node.

### S16 — Server tĩnh an toàn và đúng MIME

**Given** server chạy trong project root,
**when** yêu cầu `/`, file JS/CSS/JSON hợp lệ, file không tồn tại, URL encoded và
đường dẫn `../`,
**then** trả đúng MIME/status; 404 rõ ràng; traversal bị chặn với 403/404 và
không đọc được file bên ngoài project root; HEAD không gửi body.

### S17 — Khôi phục khi WebGL không khả dụng

**Given** browser không tạo được WebGL renderer,
**when** app khởi động,
**then** trang hiện thông báo tiếng Việt có hướng xử lý, giữ bộ chọn 22 tỉnh và
nội dung mô tả dùng được; không tạo vòng lặp lỗi hoặc màn hình trống.

## 3. Các ràng buộc “MUST NOT”

- N01: Không framework/bundler/backend/analytics; bản deploy là file tĩnh.
- N02: Không key province/landmark theo tên; chỉ dùng `id` ổn định.
- N03: Không ghi output shapes từng phần khi build lỗi.
- N04: Không phụ thuộc CDN hoặc mạng khi chạy app sau khi setup hoàn tất.
- N05: Không làm yếu/xóa/skip assertion để đạt green; test và implementation
  không được sửa cùng một bước RED→GREEN.
- N06: Không thêm secret, telemetry, cookie, localStorage hoặc request ngoài
  chính server của app.
- N07: Không để animation bắt buộc với người dùng reduced-motion.
- N08: Không claim checklist hình ảnh “pass” nếu chưa chạy browser thật và lưu
  screenshot nghiệm thu.

## 4. Kiến trúc dự kiến

```text
taiwan-3d-map/
├─ SPEC.md                         # hợp đồng append-only đã duyệt
├─ EVIDENCE.md                     # báo cáo cuối
├─ README.md
├─ package.json / package-lock.json
├─ index.html / style.css
├─ src/
│  ├─ main.js                      # bootstrap/browser boundary
│  ├─ map-app.js                   # Three scene + renderer orchestration
│  ├─ interaction-state.js         # state machine thuần, dễ mutation-test
│  ├─ projection.js                # projection, centroid, easing
│  ├─ province-catalog.js          # 22 metadata
│  ├─ landmarks.js                 # 22 low-poly builders
│  └─ card-view.js                 # format an toàn/locale
├─ data/province-shapes.js         # generated, committed
├─ vendor/three/...                # generated từ three@0.160.0, committed
├─ tools/
│  ├─ build-shapes.mjs
│  ├─ vendor-three.mjs
│  ├─ serve.mjs
│  ├─ source-state.mjs
│  └─ gauntlet.mjs
├─ tests/unit/*.test.js
├─ tests/e2e/*.spec.js
├─ tests/fixtures/*.json
├─ playwright.config.js
├─ vitest.config.js
├─ eslint.config.js
├─ jsconfig.json
└─ stryker.config.mjs
```

Thiết kế hình ảnh: trải nghiệm immersive dark, low-poly mềm, màu biển xanh đậm,
đất xanh ngọc và accent vàng; dùng CSS semantic tokens; system font để không có
font network/FOIT. Card dạng glass vừa đủ, ưu tiên độ tương phản. Motion diễn tả
quan hệ chọn→nâng→focus, có đường tắt reduced-motion. Bổ sung bộ chọn tỉnh native
để canvas không phải lối tương tác duy nhất.

## 5. Kế hoạch setup cần được phê duyệt

Project hiện chỉ có file mô tả và **chưa là git repository**. Khi SPEC được
duyệt, việc duyệt đồng thời cho phép:

1. `git init` tại `E:\Project\3dmap\taiwan-3d-map`; commit SPEC đã duyệt; commit
   checkpoint sau từng nhóm GREEN/REFACTOR. Không push remote.
2. Tạo `package.json`, `package-lock.json`; chạy `npm install` với version pin
   chính xác bên dưới.
3. Chạy `npx playwright install chromium` để tải browser test vào cache người
   dùng.
4. Builder tải đúng một nguồn GeoJSON đã nêu trong tài liệu, xác minh HTTP/JSON,
   rồi tạo file atomically. Sau đó app chạy offline từ file đã commit.
5. Gauntlet tạo coverage, mutation report, test-results và screenshots; các
   artifact tạm nằm trong thư mục bị gitignore, screenshot nghiệm thu cuối nằm
   trong `artifacts/acceptance/` và được giữ để audit.

Dependency mới và lý do:

| Dependency pin | Phạm vi | Lý do |
|---|---|---|
| `three@0.160.0` | runtime source vendored | đúng phiên bản trong tài liệu; output vendored giúp deploy tĩnh/offline |
| `vitest@4.1.10` | dev | unit/property runner chuẩn |
| `@vitest/coverage-v8@4.1.10` | dev | branch/line coverage có threshold fail-closed |
| `typescript@7.0.2` | dev | `checkJs` static type checking, không đổi source sang TS |
| `eslint@10.8.1` | dev | lint lỗi và quy ước JS/browser/node |
| `@playwright/test@1.62.1` | dev | E2E desktop/mobile, WebGL, screenshot và performance |
| `@axe-core/playwright@4.13.0` | dev | accessibility scan trình duyệt |
| `fast-check@4.9.0` | dev | property tests cho projection/format/state invariants |
| `@stryker-mutator/core@10.0.0` | dev | mutation engine AST chuẩn |
| `@stryker-mutator/vitest-runner@10.0.0` | dev | chạy mutants qua Vitest |

Không cài global package. Node hiện tại `v24.19.0`, npm `11.17.0`, Python chỉ
được dùng bởi skill thiết kế chứ không là dependency của project.

## 6. Chu trình RED → GREEN → REFACTOR

1. Baseline: ghi nhận thư mục chưa có suite/implementation.
2. Viết test S01–S04/S14/S16 cho core và builder; tạo stub export để các test
   fail bằng assertion/throw có chủ đích; lưu log RED.
3. Implement tối thiểu core/build/server; full suite green; refactor với
   assertions đóng băng.
4. Viết test S03 cho landmark builders rồi RED; implement đủ 22 builders; green;
   refactor.
5. Viết Playwright S05–S13/S15/S17 rồi RED trên shell app/stub; implement scene,
   interaction, responsive và a11y; green; refactor.
6. Sau mọi refactor chạy full unit + E2E. Mọi thay đổi assertion quay lại SPEC,
   ghi revision append-only và cần duyệt lại trước khi tiếp tục.

## 7. Gauntlet cuối

Một lệnh duy nhất `npm run gauntlet` sẽ xóa artifact cũ và fail ngay khi một
layer hỏng:

- Unit + property tests, thứ tự seed cố định rồi một lượt shuffle.
- Coverage branch/line/function/statements 100% cho các module logic được mutate;
  code WebGL/browser boundary được chứng minh bằng E2E và sẽ ghi rõ nếu không thể
  đạt changed-line coverage bằng V8 unit instrumentation.
- `tsc --noEmit --allowJs --checkJs` với 0 lỗi.
- ESLint với 0 warning và format check bằng `eslint` style rules (không thêm
  formatter dependency riêng).
- Playwright Chromium: desktop, mobile coarse emulation, landscape,
  reduced-motion, WebGL-failure, server security, axe scan; lưu screenshot.
- Stryker trên `interaction-state.js`, `projection.js`, `card-view.js` và logic
  builder; threshold mutation tối thiểu 90%, mọi survivor phải được phân loại,
  không tự ý coi survivor là equivalent.
- Real execution: build shapes từ fixture deterministically, vendor assets,
  chạy server, mở trang và kiểm tra health/ready.
- Supply chain: `npm audit --audit-level=high`, kiểm license từ metadata npm,
  scan tracked diff cho secret pattern, capability diff (network chỉ builder;
  filesystem chỉ build/vendor/server). Checker tự viết có negative control được
  chạy và ghi lại.
- Source state: commit SHA cuối cùng; `tools/source-state.mjs` tái lập tree hash.

Mục performance “<3 giây mạng thường” trong tài liệu được chuyển thành phép đo
cứng S15 trên local static assets (3/3 lần dưới 3.000 ms). Nó chứng minh app
startup, không đại diện cho mọi thiết bị/mạng thực tế; giới hạn này sẽ ghi trong
EVIDENCE.

## 8. Phê duyệt

- Trạng thái: **CHỜ NGƯỜI DÙNG DUYỆT**.
- Chưa có implementation, dependency install hay `git init` nào được thực hiện.
- Sau khi người dùng duyệt đúng bản SPEC này, triển khai mới bắt đầu.

## 9. Nhật ký phê duyệt (append-only)

- 2026-08-16 (Asia/Taipei): người dùng trả lời nguyên văn
  **“duyệt hãy thực hiện dự án ngay”**. SPEC bản 1 được phê duyệt; cho phép bắt
  đầu implementation và toàn bộ setup ở mục 5.
