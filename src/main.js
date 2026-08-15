import { PROVINCE_SHAPES } from '../data/province-shapes.js';
import { provinceCardView } from './card-view.js';
import { LANDMARKS } from './landmarks.js';
import { createTaiwanMap } from './map-app.js';
import { PROVINCES } from './province-catalog.js';

const byId = new Map(PROVINCE_SHAPES.map((province) => [province.id, province]));
const select = /** @type {HTMLSelectElement} */ (document.querySelector('#province-select'));
const resetButton = /** @type {HTMLButtonElement} */ (document.querySelector('#reset-view'));
const card = /** @type {HTMLElement} */ (document.querySelector('#province-card'));
const status = /** @type {HTMLElement} */ (document.querySelector('#app-status'));
const fallback = /** @type {HTMLElement} */ (document.querySelector('#fallback'));

if (!(select instanceof HTMLSelectElement) || !(resetButton instanceof HTMLButtonElement) || !(card instanceof HTMLElement) || !(status instanceof HTMLElement) || !(fallback instanceof HTMLElement)) {
  throw new Error('Required UI elements are missing');
}

for (const province of PROVINCES) {
  const option = document.createElement('option');
  option.value = province.id;
  option.textContent = `${province.name} · ${province.type}`;
  select.append(option);
}

function hideCard() {
  card.classList.remove('is-visible');
  card.removeAttribute('data-province-id');
}

function showCard(id) {
  const province = byId.get(id);
  const landmark = LANDMARKS[id];
  if (!province || !landmark) {
    hideCard();
    return;
  }
  const view = provinceCardView(province, landmark);
  document.querySelector('#card-type').textContent = view.type;
  document.querySelector('#card-name').textContent = view.name;
  document.querySelector('#card-landmark').textContent = `Địa danh · ${view.landmark}`;
  document.querySelector('#card-desc').textContent = view.description;
  document.querySelector('#card-stats').textContent = view.stats;
  card.dataset.provinceId = id;
  card.classList.add('is-visible');
}

let map = null;

function resetExperience() {
  select.value = '';
  hideCard();
  map?.reset();
}

select.addEventListener('change', () => {
  if (select.value) {
    showCard(select.value);
    map?.select(select.value);
  } else {
    resetExperience();
  }
});
resetButton.addEventListener('click', resetExperience);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    resetExperience();
  }
});

try {
  map = createTaiwanMap({
    mount: document.body,
    onActiveChange(id) {
      id ? showCard(id) : hideCard();
    },
    onSelectedChange(id) {
      select.value = id ?? '';
    },
  });
  status.dataset.state = 'ready';
  status.textContent = 'Bản đồ đã sẵn sàng';
  window.__TAIWAN_MAP__ = map.debug;
} catch (error) {
  console.warn('WebGL fallback:', error instanceof Error ? error.message : error);
  status.dataset.state = 'fallback';
  status.textContent = 'Đang dùng chế độ thông tin không WebGL';
  fallback.hidden = false;
  window.__TAIWAN_MAP__ = {
    provinceCount: PROVINCES.length,
    selected: null,
    cameraAspect: innerWidth / innerHeight,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}
