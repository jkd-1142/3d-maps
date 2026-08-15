import { PROVINCE_SHAPES } from '../data/province-shapes.js';
import { provinceCardView } from './card-view.js';
import { copyFor, normalizeLocale } from './i18n.js';
import { LANDMARKS } from './landmarks.js';
import { createTaiwanMap } from './map-app.js';
import { PROVINCES } from './province-catalog.js';

const byId = new Map(PROVINCE_SHAPES.map((province) => [province.id, province]));
const select = /** @type {HTMLSelectElement} */ (document.querySelector('#province-select'));
const languageSelect = /** @type {HTMLSelectElement} */ (document.querySelector('#language-select'));
const resetButton = /** @type {HTMLButtonElement} */ (document.querySelector('#reset-view'));
const card = /** @type {HTMLElement} */ (document.querySelector('#province-card'));
const status = /** @type {HTMLElement} */ (document.querySelector('#app-status'));
const fallback = /** @type {HTMLElement} */ (document.querySelector('#fallback'));

if (!(select instanceof HTMLSelectElement) || !(languageSelect instanceof HTMLSelectElement) || !(resetButton instanceof HTMLButtonElement) || !(card instanceof HTMLElement) || !(status instanceof HTMLElement) || !(fallback instanceof HTMLElement)) {
  throw new Error('Required UI elements are missing');
}

const provinceOptions = new Map();
for (const province of PROVINCES) {
  const option = document.createElement('option');
  option.value = province.id;
  select.append(option);
  provinceOptions.set(province.id, option);
}

const requestedLocale = new window.URLSearchParams(window.location.search).get('lang')
  ?? window.localStorage.getItem('taiwan-map-locale')
  ?? navigator.language;
let locale = normalizeLocale(requestedLocale);
let map = null;

function element(id) {
  const result = document.querySelector(id);
  if (!(result instanceof HTMLElement)) {
    throw new Error(`Required UI element is missing: ${id}`);
  }
  return result;
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
  const copy = copyFor(locale);
  const view = provinceCardView(province, landmark, locale);
  element('#card-type').textContent = view.type;
  element('#card-name').textContent = view.name;
  element('#card-landmark').textContent = `${copy.landmark} · ${view.landmark}`;
  element('#card-desc').textContent = view.description;
  element('#card-stats').textContent = view.stats;
  card.dataset.provinceId = id;
  card.classList.add('is-visible');
}

function applyLocale() {
  const copy = copyFor(locale);
  document.documentElement.lang = locale;
  document.title = copy.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', copy.description);
  element('#skip-link').textContent = copy.skip;
  element('#eyebrow').textContent = copy.eyebrow;
  element('#brand-heading').textContent = copy.heading;
  element('#brand-copy').textContent = copy.intro;
  element('#language-label').textContent = copy.language;
  element('#province-label').textContent = copy.destination;
  element('#province-placeholder').textContent = copy.choose;
  element('#reset-view').textContent = copy.overview;
  element('#reset-view').setAttribute('aria-label', copy.overviewAria);
  element('#controls-panel').setAttribute('aria-label', copy.controls);
  element('#orientation').innerHTML = copy.orientation;
  element('#map-stage').setAttribute('aria-label', copy.stage);
  element('#fallback-title').textContent = copy.fallbackTitle;
  element('#fallback-body').textContent = copy.fallbackBody;
  element('#footer-hint').textContent = copy.hint;
  status.textContent = status.dataset.state === 'ready' ? copy.ready : status.dataset.state === 'fallback' ? copy.fallbackStatus : copy.loading;
  languageSelect.value = locale;
  for (const province of PROVINCES) {
    provinceOptions.get(province.id).textContent = locale === 'zh-TW'
      ? `${province.zh} · ${province.typeZh}`
      : `${province.name} · ${province.type}`;
  }
  map?.setCanvasLabel(copy.canvas);
  const activeId = card.dataset.provinceId;
  if (activeId) {
    showCard(activeId);
  }
}

applyLocale();

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
languageSelect.addEventListener('change', () => {
  locale = normalizeLocale(languageSelect.value);
  window.localStorage.setItem('taiwan-map-locale', locale);
  const url = new window.URL(window.location.href);
  url.searchParams.set('lang', locale);
  window.history.replaceState({}, '', url);
  applyLocale();
});
resetButton.addEventListener('click', resetExperience);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    resetExperience();
  }
});

try {
  const copy = copyFor(locale);
  map = createTaiwanMap({
    mount: document.body,
    canvasLabel: copy.canvas,
    onActiveChange(id) {
      id ? showCard(id) : hideCard();
    },
    onSelectedChange(id) {
      select.value = id ?? '';
    },
  });
  status.dataset.state = 'ready';
  status.textContent = copy.ready;
  window.__TAIWAN_MAP__ = map.debug;
} catch (error) {
  console.warn('WebGL fallback:', error instanceof Error ? error.message : error);
  status.dataset.state = 'fallback';
  status.textContent = copyFor(locale).fallbackStatus;
  fallback.hidden = false;
  window.__TAIWAN_MAP__ = {
    provinceCount: PROVINCES.length,
    selected: null,
    cameraAspect: innerWidth / innerHeight,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}
