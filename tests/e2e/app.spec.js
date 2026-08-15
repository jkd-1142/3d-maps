import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function collectRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => errors.push(`request: ${request.url()}`));
  return errors;
}

test.describe('Taiwan 3D map acceptance', () => {
  test('S05 boots WebGL with 22 provinces and no runtime errors', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop visual contract');
    const errors = await collectRuntimeErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('#app-status')).toHaveAttribute('data-state', 'ready');
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(page.locator('#province-select option')).toHaveCount(23);
    expect(await page.evaluate(() => window.__TAIWAN_MAP__?.provinceCount)).toBe(22);
    expect(errors).toEqual([]);
    await page.screenshot({ path: 'artifacts/acceptance/desktop-home.png', fullPage: true });
  });

  test('S06/S07/S09 selects, presents a card, and resets', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop interaction contract');
    await page.goto('/');
    await expect(page.locator('#app-status')).toHaveAttribute('data-state', 'ready');
    const point = await page.evaluate(() => window.__TAIWAN_MAP__?.screenPoint('taipei'));
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('#province-card')).toHaveAttribute('data-province-id', 'taipei');
    await page.mouse.click(point.x, point.y);
    await expect(page.locator('#province-card')).toHaveAttribute('data-province-id', 'taipei');
    await expect(page.locator('#card-name')).toHaveText('Đài Bắc');
    await expect(page.locator('#card-landmark')).toContainText('Taipei 101');
    await expect(page.locator('#card-stats')).toContainText('2,51 triệu dân');
    expect(await page.evaluate(() => window.__TAIWAN_MAP__?.selected)).toBe('taipei');
    await page.keyboard.press('Escape');
    await expect(page.locator('#province-card')).not.toHaveClass(/is-visible/);
    expect(await page.evaluate(() => window.__TAIWAN_MAP__?.selected)).toBe(null);
  });

  test('S08/S10 drag is not click and controls keep safe limits', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop pointer contract');
    await page.goto('/');
    await expect(page.locator('#app-status')).toHaveAttribute('data-state', 'ready');
    const point = await page.evaluate(() => window.__TAIWAN_MAP__?.screenPoint('taipei'));
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 20, point.y + 10, { steps: 3 });
    await page.mouse.up();
    expect(await page.evaluate(() => window.__TAIWAN_MAP__?.selected)).toBe(null);
    expect(await page.evaluate(() => window.__TAIWAN_MAP__?.controls)).toEqual({
      enablePan: false,
      minDistance: 18,
      maxDistance: 320,
      maxPolarAngle: Math.PI * 0.49,
    });
  });

  test('S11/S12 mobile selection fits without horizontal overflow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium', 'mobile contract');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('#app-status')).toHaveAttribute('data-state', 'ready');
    await page.selectOption('#province-select', 'hualien');
    await expect(page.locator('#card-name')).toHaveText('Hoa Liên');
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      card: document.querySelector('#province-card')?.getBoundingClientRect().width,
      aspect: window.__TAIWAN_MAP__?.cameraAspect,
    }));
    expect(dimensions.scroll).toBe(dimensions.viewport);
    expect(dimensions.card).toBeLessThanOrEqual(dimensions.viewport * 0.86 + 1);
    expect(dimensions.aspect).toBeCloseTo(page.viewportSize().width / page.viewportSize().height, 5);
    for (const locator of [page.locator('#province-select'), page.locator('#reset-view')]) {
      expect((await locator.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: 'artifacts/acceptance/mobile-selected.png', fullPage: true });
  });

  test('S13 passes critical accessibility checks and reacts to reduced motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'a11y contract');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('canvas')).toHaveAttribute('role', 'img');
    await expect(page.locator('canvas')).toHaveAttribute('aria-label', /bản đồ 3D/i);
    await expect(page.locator('#province-card')).toHaveAttribute('aria-live', 'polite');
    expect(await page.evaluate(() => window.__TAIWAN_MAP__?.reducedMotion)).toBe(true);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(() => page.evaluate(() => window.__TAIWAN_MAP__?.reducedMotion)).toBe(false);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(({ impact }) => ['critical', 'serious'].includes(impact))).toEqual([]);
  });

  test('S12 resize updates renderer and camera aspect', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop resize contract');
    await page.goto('/');
    for (const viewport of [{ width: 812, height: 375 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      await expect.poll(() => page.evaluate(() => window.__TAIWAN_MAP__?.cameraAspect)).toBeCloseTo(viewport.width / viewport.height, 5);
      const canvas = await page.locator('canvas').evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }));
      expect(canvas).toEqual(viewport);
    }
  });

  test('S17 provides a useful fallback when WebGL is unavailable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop fallback contract');
    await page.addInitScript(() => {
      window.__FORCE_WEBGL_FAILURE__ = true;
      const original = HTMLCanvasElement.prototype.getContext;
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        value(type, ...args) {
          return String(type).startsWith('webgl') ? null : original.call(this, type, ...args);
        },
      });
    });
    await page.goto('/');
    await expect(page.locator('#app-status')).toHaveAttribute('data-state', 'fallback');
    await expect(page.locator('#fallback')).toBeVisible();
    await expect(page.locator('#province-select option')).toHaveCount(23);
    await page.selectOption('#province-select', 'taipei');
    await expect(page.locator('#card-name')).toHaveText('Đài Bắc');
  });

  test('S16 server blocks traversal and implements HEAD', async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'single server contract');
    const head = await request.head('/src/main.js');
    expect(head.status()).toBe(200);
    expect(await head.body()).toHaveLength(0);
    expect(head.headers()['content-type']).toBe('text/javascript; charset=utf-8');
    expect((await request.get('/missing.txt')).status()).toBe(404);
    expect((await request.get('/%2e%2e%2fSPEC.md')).status()).toBe(403);
  });

  test('S15 becomes ready within 3000ms with no CDN requests', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop performance contract');
    const external = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.hostname !== '127.0.0.1') {
        external.push(request.url());
      }
    });
    const durations = [];
    for (let run = 0; run < 3; run += 1) {
      const started = Date.now();
      await page.goto(`/?performance-run=${run}`);
      await expect(page.locator('#app-status')).toHaveAttribute('data-state', 'ready');
      durations.push(Date.now() - started);
    }
    expect(durations).toHaveLength(3);
    expect(Math.max(...durations)).toBeLessThan(3000);
    expect(external).toEqual([]);
  });

  test('Revision 3 switches to complete Traditional Chinese without losing selection', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'single bilingual contract');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?lang=zh-TW');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    await expect(page).toHaveTitle('臺灣 3D — 22 縣市');
    await expect(page.locator('#brand-heading')).toHaveText('臺灣');
    await expect(page.locator('#province-select option')).toHaveCount(23);
    await expect(page.locator('#province-select option').nth(1)).toContainText('臺北市 · 直轄市');
    await page.selectOption('#province-select', 'taipei');
    await expect(page.locator('#card-name')).toHaveText('臺北市');
    await expect(page.locator('#card-landmark')).toHaveText('特色地標 · 臺北 101');
    await expect(page.locator('#card-stats')).toHaveText('251 萬人 · 269 平方公里');
    await expect(page.locator('canvas')).toHaveAttribute('aria-label', /臺灣 22 縣市/);
    await page.selectOption('#language-select', 'vi');
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(page).toHaveURL(/lang=vi/);
    await expect(page.locator('#province-card')).toHaveAttribute('data-province-id', 'taipei');
    await expect(page.locator('#card-name')).toHaveText('Đài Bắc');
    await page.selectOption('#language-select', 'zh-TW');
    await expect(page).toHaveURL(/lang=zh-TW/);
    await expect(page.locator('#card-name')).toHaveText('臺北市');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    await page.screenshot({ path: 'artifacts/acceptance/desktop-zh-tw.png', fullPage: true });
  });
});
