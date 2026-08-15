import * as THREE from 'three';

const emptyOptions = /** @type {any} */ ({});

function material(color, options = emptyOptions) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.72,
    metalness: options.metalness ?? 0.08,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.opacity !== undefined,
    opacity: options.opacity ?? 1,
  });
}

function mesh(geometry, color, options = emptyOptions) {
  const model = new THREE.Mesh(geometry, material(color, options));
  model.position.set(options.x ?? 0, options.y ?? 0, options.z ?? 0);
  model.rotation.set(options.rx ?? 0, options.ry ?? 0, options.rz ?? 0);
  model.scale.set(options.sx ?? 1, options.sy ?? 1, options.sz ?? 1);
  model.castShadow = true;
  model.receiveShadow = true;
  return model;
}

const box = (width, height, depth, color, options) => mesh(new THREE.BoxGeometry(width, height, depth), color, options);
const cylinder = (top, bottom, height, color, options = emptyOptions) => mesh(new THREE.CylinderGeometry(top, bottom, height, options.segments ?? 12), color, options);
const cone = (radius, height, color, options = emptyOptions) => mesh(new THREE.ConeGeometry(radius, height, options.segments ?? 10), color, options);
const sphere = (radius, color, options) => mesh(new THREE.SphereGeometry(radius, 14, 10), color, options);
const torus = (radius, tube, color, options) => mesh(new THREE.TorusGeometry(radius, tube, 8, 18), color, options);

function group(...children) {
  const result = new THREE.Group();
  result.add(...children);
  return result;
}

function taipei101() {
  const result = group(box(3.6, 0.45, 3.6, '#244f4c', { y: 0.23 }));
  for (let index = 0; index < 8; index += 1) {
    const width = 2.9 - index * 0.25;
    result.add(box(width, 0.88, width, index % 2 ? '#57b8ab' : '#76d6c7', { y: 0.95 + index * 0.88 }));
  }
  result.add(cylinder(0.08, 0.25, 2.25, '#e8fff9', { y: 8.95 }));
  return result;
}

function lanternVillage() {
  return group(
    box(4.2, 0.4, 3, '#344852', { y: 0.2 }),
    box(2.8, 1.45, 2.2, '#6d4b35', { y: 1.1 }),
    cone(2.2, 1.05, '#98382e', { y: 2.35, segments: 4, ry: Math.PI / 4 }),
    sphere(0.42, '#ff5a47', { x: -1.35, y: 1.55, z: 1.25, emissive: 0xff2211, emissiveIntensity: 1.1 }),
    sphere(0.42, '#ff5a47', { x: 1.35, y: 1.55, z: 1.25, emissive: 0xff2211, emissiveIntensity: 1.1 }),
  );
}

function airplane() {
  return group(
    box(5.4, 0.18, 3.2, '#3c5665', { y: 0.1 }),
    cylinder(0.42, 0.5, 4.5, '#e9f3f8', { y: 1.3, rz: Math.PI / 2 }),
    cone(0.5, 1.15, '#e9f3f8', { x: 2.8, y: 1.3, rz: -Math.PI / 2 }),
    box(0.4, 0.55, 4.8, '#99c8df', { x: -0.2, y: 1.3 }),
    box(0.32, 1.25, 1.2, '#70a9c4', { x: -2, y: 2 }),
  );
}

function bubbleTea() {
  const result = group(
    cylinder(1.05, 0.82, 2.6, '#ca8b55', { y: 1.3, opacity: 0.88, roughness: 0.28 }),
    cylinder(1.08, 1.08, 0.12, '#f3d2a5', { y: 2.62 }),
    cylinder(0.11, 0.11, 2.5, '#ff7197', { x: 0.45, y: 3.05, rz: 0.22 }),
  );
  const pearls = [[-0.45, -0.2], [0.1, 0.35], [0.5, -0.35], [-0.1, -0.5], [0.35, 0.1], [-0.5, 0.45]];
  for (const [x, z] of pearls) {
    result.add(sphere(0.2, '#24140f', { x, y: 0.35, z }));
  }
  return result;
}

function fort() {
  return group(
    box(3.8, 1.2, 2.8, '#a95338', { y: 0.6 }),
    box(1.65, 1, 1.6, '#ca7951', { y: 1.7 }),
    cylinder(0.05, 0.05, 1.7, '#e8edf0', { y: 2.95 }),
    box(0.9, 0.46, 0.08, '#e7463a', { x: 0.42, y: 3.45 }),
  );
}

function harborTower() {
  return group(
    box(0.95, 3.2, 0.9, '#5a9cbd', { x: -0.75, y: 1.6 }),
    box(0.95, 3.2, 0.9, '#5a9cbd', { x: 0.75, y: 1.6 }),
    box(2.7, 3.5, 1, '#82c1dd', { y: 4.75 }),
    cone(0.4, 1.1, '#a4d9ec', { y: 7.05 }),
    box(5.2, 0.18, 2.8, '#247aa0', { y: 0.09 }),
  );
}

function lighthouse(red = '#e14d44') {
  return group(
    cylinder(0.46, 0.72, 2.5, '#f2f5f4', { y: 1.25 }),
    cylinder(0.55, 0.55, 0.42, red, { y: 2.35 }),
    sphere(0.34, '#ffe49c', { y: 2.9, emissive: 0xffc84d, emissiveIntensity: 1.5 }),
    cone(0.68, 0.62, red, { y: 3.37 }),
  );
}

function semiconductor() {
  const result = group(
    box(2.9, 0.45, 2.9, '#283942', { y: 0.23 }),
    box(1.65, 0.3, 1.65, '#101d24', { y: 0.6 }),
    sphere(1.25, '#62d5ff', { y: 2, opacity: 0.5, metalness: 0.35, emissive: 0x168cb0, emissiveIntensity: 0.55 }),
  );
  for (let index = -1; index <= 1; index += 1) {
    result.add(box(0.12, 0.1, 0.75, '#e3b84d', { x: index * 0.55, y: 0.82, z: 1.25 }));
  }
  return result;
}

function turkeyRice() {
  return group(
    sphere(1.55, '#bd493f', { y: 0.85, sy: 0.56 }),
    sphere(1.18, '#fff4dc', { y: 1.12, sy: 0.5 }),
    cylinder(0.28, 0.45, 1.1, '#9e572f', { x: 0.45, y: 1.75, rz: -0.2 }),
    sphere(0.34, '#c77a43', { x: 0.55, y: 2.3 }),
  );
}

function teaHouse() {
  return group(
    cylinder(0.92, 0.7, 1.5, '#dfc99c', { y: 0.75 }),
    cylinder(0.8, 0.8, 0.2, '#b76a28', { y: 1.45 }),
    cone(1.25, 0.8, '#70472b', { y: 2.05 }),
    torus(0.7, 0.1, '#88b66c', { x: 1.2, y: 1.15, rz: Math.PI / 2 }),
  );
}

function hakkaRoundhouse() {
  return group(
    cylinder(1.6, 1.72, 1.75, '#cfaa69', { y: 0.88, segments: 18 }),
    cone(1.92, 1, '#77472a', { y: 2.25, segments: 18 }),
    box(0.58, 1, 0.12, '#49301d', { y: 0.5, z: 1.65 }),
  );
}

function buddha() {
  return group(
    box(3, 0.55, 3, '#765d52', { y: 0.28 }),
    sphere(1.15, '#e6b84f', { y: 1.55, sy: 1.15 }),
    sphere(0.66, '#f1ca63', { y: 3 }),
    sphere(0.2, '#f1ca63', { y: 3.78 }),
  );
}

function sunMoonLake() {
  return group(
    cylinder(2.25, 2.4, 0.26, '#2589c9', { y: 0.13, segments: 22, roughness: 0.25 }),
    box(0.88, 0.82, 0.88, '#a73a34', { y: 0.8 }),
    cone(1.12, 0.7, '#27333a', { y: 1.55, segments: 4, ry: Math.PI / 4 }),
    sphere(0.28, '#ffd66b', { x: 1.25, y: 0.5, emissive: 0xe9a700, emissiveIntensity: 0.45 }),
  );
}

function glovePuppet() {
  return group(
    cone(1.05, 1.85, '#b52d35', { y: 0.93 }),
    sphere(0.58, '#ffd2aa', { y: 2.15 }),
    cone(0.74, 0.62, '#26333b', { y: 2.76 }),
    box(0.07, 1.45, 0.5, '#f0bd38', { x: 1.12, y: 1.55 }),
  );
}

function forestTrain() {
  return group(
    box(1.9, 1, 1.05, '#a92428', { y: 0.55 }),
    box(1.1, 0.82, 0.92, '#811e22', { x: -0.62, y: 1.38 }),
    cylinder(0.3, 0.3, 0.42, '#182329', { x: -0.7, y: 0.2, z: 0.56, rx: Math.PI / 2 }),
    cylinder(0.3, 0.3, 0.42, '#182329', { x: 0.55, y: 0.2, z: 0.56, rx: Math.PI / 2 }),
    cone(1.05, 2.5, '#2d7445', { x: 1.85, y: 1.25 }),
  );
}

function turtleIsland() {
  return group(
    sphere(1.62, '#397d52', { y: 0.75, sx: 1.35, sy: 0.58 }),
    sphere(0.52, '#4c9564', { x: 1.75, y: 0.58 }),
    sphere(0.3, '#397d52', { x: -0.9, y: 0.2, z: 1.05 }),
    cone(0.4, 1.05, '#315f43', { x: -0.35, y: 1.7 }),
  );
}

function tarokoGate() {
  return group(
    cylinder(0.28, 0.35, 2.7, '#dfddd4', { x: -1.4, y: 1.35 }),
    cylinder(0.28, 0.35, 2.7, '#dfddd4', { x: 1.4, y: 1.35 }),
    box(4.1, 0.48, 0.62, '#b52d35', { y: 2.8 }),
    box(4.65, 0.38, 0.72, '#8f2027', { y: 3.3 }),
    box(3.2, 0.16, 2.8, '#2692bc', { y: 0.08 }),
  );
}

function balloon() {
  return group(
    sphere(1.38, '#f06543', { y: 3, sy: 1.15 }),
    sphere(1.4, '#f7c948', { y: 3, sy: 1.17, opacity: 0.32 }),
    box(0.7, 0.6, 0.7, '#7c5039', { y: 0.78 }),
    cylinder(0.035, 0.035, 1.35, '#d9e2e7', { x: -0.45, y: 1.72, rz: -0.12 }),
    cylinder(0.035, 0.035, 1.35, '#d9e2e7', { x: 0.45, y: 1.72, rz: 0.12 }),
  );
}

function basaltHeart() {
  const result = group(cylinder(2.2, 2.35, 0.22, '#2197b7', { y: 0.11, segments: 22 }));
  for (let index = 0; index < 7; index += 1) {
    const angle = index / 7 * Math.PI * 2;
    result.add(cylinder(0.34, 0.4, 1.1 + (index % 3) * 0.38, '#455b66', {
      x: Math.cos(angle) * 1.15,
      y: 0.58 + (index % 3) * 0.19,
      z: Math.sin(angle) * 1.15,
      segments: 6,
    }));
  }
  return result;
}

function kaoliangBlade() {
  return group(
    cylinder(0.62, 0.72, 1.82, '#d86561', { y: 0.91 }),
    cylinder(0.18, 0.18, 0.78, '#d86561', { y: 2.2 }),
    box(0.16, 2.15, 0.48, '#9fb2bb', { x: 1.5, y: 1.2, rz: -0.12, metalness: 0.6 }),
    box(0.22, 0.56, 0.58, '#5d3f32', { x: 1.31, y: 0.2, rz: -0.12 }),
  );
}

function blueTears() {
  const result = group(cone(1.45, 1.15, '#263943', { y: 0.58 }));
  const points = [[-1.2, -0.5], [-0.8, 0.8], [-0.3, -1.1], [0.15, 0.8], [0.65, -0.6], [1.1, 0.45], [1.4, -0.9], [-1.5, 1.1], [0.4, 1.4]];
  for (let index = 0; index < points.length; index += 1) {
    const [x, z] = points[index];
    result.add(sphere(0.15, '#41e5ff', { x, y: 0.2 + (index % 3) * 0.25, z, emissive: 0x00c9ff, emissiveIntensity: 2 }));
  }
  return result;
}

export const LANDMARKS = Object.freeze({
  taipei: { title: 'Tháp Taipei 101', desc: 'Biểu tượng Đài Bắc, từng là tòa nhà cao nhất thế giới giai đoạn 2004–2010.', titleZh: '臺北 101', descZh: '臺北的代表性地標，曾於 2004 至 2010 年間為世界最高建築。', build: taipei101 },
  'new-taipei': { title: 'Cửu Phần & đèn lồng đỏ', desc: 'Phố cổ trên sườn núi nổi tiếng với quán trà, ngõ dốc và ánh đèn lồng ấm áp.', titleZh: '九份與紅燈籠', descZh: '依山而建的老街，以茶樓、石階巷弄與溫暖的紅燈籠聞名。', build: lanternVillage },
  taoyuan: { title: 'Sân bay quốc tế Đào Viên', desc: 'Cửa ngõ hàng không lớn nhất Đài Loan và một hub trung chuyển quan trọng của Đông Á.', titleZh: '桃園國際機場', descZh: '臺灣規模最大的國際航空門戶，也是東亞重要的轉運樞紐。', build: airplane },
  taichung: { title: 'Thủ phủ trà sữa trân châu', desc: 'Đài Trung thường được nhắc đến như nơi khai sinh thức uống trà sữa trân châu.', titleZh: '珍珠奶茶之都', descZh: '臺中常被視為珍珠奶茶的發源地，這款飲品如今風靡全球。', build: bubbleTea },
  tainan: { title: 'Pháo đài An Bình', desc: 'Dấu ấn của cố đô Đài Nam và pháo đài Zeelandia được xây dựng từ năm 1624.', titleZh: '安平古堡', descZh: '古都臺南的重要印記，前身熱蘭遮城始建於 1624 年。', build: fort },
  kaohsiung: { title: 'Tháp 85 & cảng Cao Hùng', desc: 'Đường chân trời của thành phố cảng lớn nhất miền Nam Đài Loan.', titleZh: '高雄 85 大樓與港灣', descZh: '85 大樓與港區共同勾勒出南臺灣最大港都的天際線。', build: harborTower },
  keelung: { title: 'Hải đăng cảng Cơ Long', desc: 'Ngọn đèn dẫn đường của thành phố cảng mưa nhiều ở cực Bắc.', titleZh: '基隆港燈塔', descZh: '燈光守護著這座多雨的北方港都，引導船隻平安入港。', build: lighthouse },
  'hsinchu-city': { title: 'Thủy tinh & bán dẫn', desc: 'Thành phố Tân Trúc là trung tâm công nghệ bán dẫn và có nghề thủy tinh lâu đời.', titleZh: '玻璃與半導體', descZh: '新竹市是臺灣半導體科技重鎮，也擁有歷史悠久的玻璃工藝。', build: semiconductor },
  'chiayi-city': { title: 'Cơm gà Hỏa Nhĩ', desc: 'Món cơm gà tây xé phay là hương vị đặc trưng của thành phố Gia Nghĩa.', titleZh: '嘉義火雞肉飯', descZh: '鋪上鮮嫩火雞肉絲的米飯，是嘉義市最具代表性的日常滋味。', build: turkeyRice },
  'hsinchu-county': { title: 'Trà lạnh Bắc Phố', desc: 'Huyện Tân Trúc gìn giữ văn hóa Khách Gia và trà Đông Phương Mỹ Nhân.', titleZh: '北埔擂茶', descZh: '新竹縣保存深厚的客家文化，也以北埔擂茶與東方美人茶聞名。', build: teaHouse },
  miaoli: { title: 'Nhà tròn Khách Gia', desc: 'Miêu Lật là một trung tâm văn hóa Khách Gia với kiến trúc cộng đồng đặc sắc.', titleZh: '客家圓樓', descZh: '苗栗是客家文化重鎮，圓樓展現獨具特色的聚落建築風貌。', build: hakkaRoundhouse },
  changhua: { title: 'Đại Phật Bát Quái Sơn', desc: 'Tượng Phật ngồi nhìn xuống đồng bằng Chương Hóa từ năm 1961.', titleZh: '八卦山大佛', descZh: '自 1961 年起，莊嚴坐佛便從八卦山俯瞰彰化平原。', build: buddha },
  nantou: { title: 'Nhật Nguyệt Đàm', desc: 'Hồ nước ngọt lớn nhất Đài Loan nằm giữa núi non Nam Đầu.', titleZh: '日月潭', descZh: '臺灣最大的天然湖泊，靜臥於南投群山環抱之中。', build: sunMoonLake },
  yunlin: { title: 'Rối vải Budaixi', desc: 'Vân Lâm là cái nôi của nghệ thuật múa rối vải truyền thống.', titleZh: '布袋戲', descZh: '雲林是臺灣傳統布袋戲的重要發源地與傳承中心。', build: glovePuppet },
  'chiayi-county': { title: 'A Lý Sơn — tàu rừng', desc: 'Tuyến tàu rừng trăm tuổi đi qua rừng bách đỏ và biển mây huyện Gia Nghĩa.', titleZh: '阿里山森林鐵路', descZh: '百年森林鐵路穿越嘉義縣的紅檜森林，駛向壯麗雲海。', build: forestTrain },
  pingtung: { title: 'Hải đăng Kenting', desc: 'Hải đăng Nga Loan Loan đứng bên bờ biển nhiệt đới ở cực Nam.', titleZh: '墾丁鵝鑾鼻燈塔', descZh: '潔白燈塔矗立於臺灣最南端，守望著墾丁的熱帶海岸。', build: () => lighthouse('#2d8a58') },
  yilan: { title: 'Đảo Quy Sơn', desc: 'Hòn đảo núi lửa mang dáng rùa nằm ngoài khơi Nghi Lan.', titleZh: '龜山島', descZh: '外形如龜的火山島，靜臥在宜蘭外海。', build: turtleIsland },
  hualien: { title: 'Hẻm núi Thái Lỗ Các', desc: 'Vách đá cẩm thạch và sông Lập Vụ tạo nên kỳ quan nổi tiếng của Hoa Liên.', titleZh: '太魯閣峽谷', descZh: '大理石峭壁與立霧溪共同雕刻出花蓮聞名世界的峽谷景觀。', build: tarokoGate },
  taitung: { title: 'Khinh khí cầu Lộc Dã', desc: 'Thung lũng Lộc Dã rực màu trong lễ hội khinh khí cầu mùa hè.', titleZh: '鹿野熱氣球', descZh: '每逢夏季，繽紛熱氣球讓鹿野高臺與縱谷天空充滿色彩。', build: balloon },
  penghu: { title: 'Bazan & trái tim đại dương', desc: 'Quần đảo Bành Hồ nổi bật với những cột bazan lục giác giữa biển xanh.', titleZh: '玄武岩與海洋之心', descZh: '澎湖群島以矗立碧海之間的六角柱狀玄武岩景觀著稱。', build: basaltHeart },
  kinmen: { title: 'Rượu cao lương & đao Kim Môn', desc: 'Hai sản vật gắn với lịch sử và đời sống trên đảo Kim Môn.', titleZh: '高粱酒與金門菜刀', descZh: '兩項名產承載著金門島嶼的戰地歷史與日常生活。', build: kaoliangBlade },
  lienchiang: { title: 'Nước mắt xanh Mã Tổ', desc: 'Tảo phát quang tạo nên những dải sáng xanh trên bờ biển Mã Tổ vào đêm hè.', titleZh: '馬祖藍眼淚', descZh: '夏夜裡，發光藻在馬祖海岸映出夢幻的藍色光帶。', build: blueTears },
});
