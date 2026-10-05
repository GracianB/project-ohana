import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { startServer } from './server.mjs';

const server = await startServer(4174);
const base = 'http://127.0.0.1:4174/';
const resultsDir = 'test-results/visual';
const screenshots = [];

function withinViewport(rect, width, height, margin = 2) {
  return rect.width > 0 && rect.height > 0 &&
    rect.left >= -margin &&
    rect.top >= -margin &&
    rect.right <= width + margin &&
    rect.bottom <= height + margin;
}

async function capture(page, name) {
  await page.screenshot({ path: resultsDir + '/' + name + '.png', fullPage: true });
  screenshots.push(name);
}

async function auditLayout(page, name) {
  const data = await page.evaluate(() => {
    const selectors = ['#hud', '#ability-bar', '#notification-container', '#boss-wrap', '#combo-chip', '#touch'];
    const viewport = { width: innerWidth, height: innerHeight };
    const boxes = {};
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      boxes[selector] = el ? (() => {
        const r = el.getBoundingClientRect();
        return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height, visible:r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' };
      })() : null;
    }

    const canvas = document.querySelector('#game');
    const ctx = canvas?.getContext('2d');
    let corners = [];
    if (ctx && canvas.width && canvas.height) {
      const pts = [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]];
      corners = pts.map(([x,y]) => {
        const p = ctx.getImageData(x,y,1,1).data;
        return [p[0],p[1],p[2],p[3]];
      });
    }

    return {
      viewport,
      boxes,
      corners,
      messageCount: document.querySelectorAll('#notification-container .game-notification').length,
      roomBanner: !!document.querySelector('#room-banner'),
      demoLegacy: !!document.querySelector('#demo-ribbon, #demo-obj, #demo-tut'),
      introBars: document.querySelector('#ohana-intro')?.classList.contains('show') || false,
    };
  });

  assert.equal(data.roomBanner, false, name + ': room banner legacy presente');
  assert.equal(data.demoLegacy, false, name + ': overlay demo legacy presente');

  for (const [selector, box] of Object.entries(data.boxes)) {
    if (!box || !box.visible) continue;
    assert.ok(
      withinViewport(box, data.viewport.width, data.viewport.height),
      name + ': ' + selector + ' fuera del viewport · ' + JSON.stringify(box)
    );
  }

  assert.ok(
    data.messageCount <= 1,
    name + ': más de un mensaje visual'
  );

  return data;
}

try {
  await fs.mkdir(resultsDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });

  await page.goto(base + '?visual=1&e2e=1', { waitUntil: 'networkidle' });
  await page.locator('#ohana-intro').waitFor({ state:'detached', timeout:7000 }).catch(() => {});
  await page.waitForSelector('#btn-play', { state:'visible', timeout:7000 });
  await capture(page, '01-character-select');

  await page.locator('#btn-play').click();
  await page.waitForTimeout(500);
  await auditLayout(page, '02-hub');
  await capture(page, '02-hub');

  await page.evaluate(() => window.__OHANA_E2E.loadRoom('lab'));
  await page.waitForTimeout(100);
  await auditLayout(page, '03-room-lab');
  await capture(page, '03-room-lab');

  await page.evaluate(() => window.__OHANA_E2E.setXp(55));
  await page.waitForTimeout(100);
  await capture(page, '04-evolution');

  await page.evaluate(() => window.__OHANA_E2E.setEvo(4));
  await page.evaluate(() => window.__OHANA_E2E.loadRoom('boss'));
  await page.waitForTimeout(120);
  const bossLayout = await auditLayout(page, '05-boss');
  assert.ok(bossLayout.boxes['#boss-wrap']?.visible, '05-boss: barra de boss no visible');
  await capture(page, '05-boss');

  await page.evaluate(() => window.__OHANA_E2E.start('kilo'));
  await page.waitForTimeout(80);
  await page.locator('#btn-map').click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#map-overlay').getAttribute('aria-hidden'), 'false', '06-map: mapa no visible');
  await capture(page, '06-map');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  await page.locator('#btn-help').click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#help').getAttribute('aria-hidden'), 'false', '07-help: ayuda no visible');
  await capture(page, '07-help');

  await browser.close();
  console.log('OHANA VISUAL MATRIX PASS');
  console.log('Screenshots: ' + screenshots.join(', '));
} finally {
  server.close();
}
