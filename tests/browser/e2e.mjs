import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium, devices } from 'playwright';
import { startServer } from './server.mjs';

const server = await startServer(4173);
const base = 'http://127.0.0.1:4173/';

async function auditPage(page, label) {
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + (e.stack || e.message)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', (request) => errors.push('requestfailed: ' + request.url() + ' · ' + (request.failure()?.errorText || 'unknown')));
  await page.goto(base + '?e2e=1', { waitUntil:'networkidle' });
  await page.waitForSelector('#btn-play');
  const sw = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported:false };
    const reg = await navigator.serviceWorker.ready;
    return { supported:true, active:!!reg.active, scope:reg.scope };
  });
  assert.ok(sw.supported, label + ': Service Worker no soportado');
  assert.ok(sw.active, label + ': Service Worker no activo');
  assert.ok(sw.scope.endsWith('/'), label + ': scope PWA incorrecto');
  await page.waitForTimeout(700);
  await page.locator('#btn-play').click();
  await page.waitForTimeout(800);
  if (errors.length) throw new Error(label + ': runtime errors before visual audit\n' + errors.join('\n'));

  const audit = await page.evaluate(async () => {
    const [{ ROSTER }, { ROOMS }, { ABILITY_DEFS }] = await Promise.all([
      import('/characters/roster.js?e2e=1'),
      import('/systems/map.js?e2e=1'),
      import('/systems/abilities.js?e2e=1'),
    ]);
    const canvas = document.querySelector('#game');
    const ctx = canvas?.getContext('2d');
    const data = ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height).data : null;
    let nonZero = 0, sum = 0;
    if (data) for (let i = 0; i < data.length; i += 32) { const v = data[i] + data[i+1] + data[i+2] + data[i+3]; sum += v; if (v > 12) nonZero++; }
    const route = (() => { const seen = new Set(['hub']), q = ['hub']; while (q.length) { const id = q.shift(); for (const d of Object.values(ROOMS[id].doors || {})) if (d && !seen.has(d)) { seen.add(d); q.push(d); } } return [...seen]; })();
    const resources = performance.getEntriesByType('resource');
    const js = resources.filter((r) => r.name.includes('.js')).reduce((n,r) => n + (r.transferSize || 0), 0);
    const css = resources.filter((r) => r.name.includes('.css')).reduce((n,r) => n + (r.transferSize || 0), 0);
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
    const buttons = [...document.querySelectorAll('button')].map((b) => ({ name: b.getAttribute('aria-label') || b.textContent.trim() || b.getAttribute('title') || '', disabled: b.disabled }));
    const dialogs = [...document.querySelectorAll('[role="dialog"]')].map((d) => ({ labelled: !!d.getAttribute('aria-label') || !!d.getAttribute('aria-labelledby'), modal: d.getAttribute('aria-modal') === 'true' }));
    const bars = [...document.querySelectorAll('[role="progressbar"]')].map((b) => Number(b.getAttribute('aria-valuenow')));
    return { chars:ROSTER.length, forms:ROSTER.reduce((n,p)=>n+p.forms.length,0), powers:ROSTER.reduce((n,p)=>n+p.forms.length*p.abilities.length,0), abilityDefs:Object.keys(ABILITY_DEFS).length, rooms:Object.keys(ROOMS).length, route, nonZero, sum, js, css, fcp, title:document.title, buttons, dialogs, bars, canvasLabel:canvas?.getAttribute('aria-label') || '' };
  });

  assert.equal(audit.chars, 10, label + ': personajes');
  assert.equal(audit.forms, 50, label + ': formas');
  assert.equal(audit.powers, 150, label + ': matriz poderes/formas');
  assert.equal(audit.abilityDefs, 30, label + ': definiciones de poder');
  assert.equal(audit.rooms, 10, label + ': salas');
  assert.equal(audit.route.length, 10, label + ': recorrido de salas');
  assert.ok(audit.nonZero > 100, label + ': Canvas vacío');
  assert.ok(audit.sum > 10000, label + ': Canvas sin señal visual');
  assert.ok(audit.js < 1500000, label + ': JS > 1.5 MB');
  assert.ok(audit.css < 500000, label + ': CSS > 500 KB');
  assert.ok(audit.fcp < 4000, label + ': FCP > 4 s');
  assert.match(audit.title, /PROJECT OHANA/i);
  assert.ok(audit.canvasLabel.length > 0, label + ': Canvas sin aria-label');
  assert.ok(audit.buttons.every((b) => b.name.length > 0), label + ': botón sin nombre accesible');
  assert.ok(audit.dialogs.every((d) => d.labelled && d.modal), label + ': diálogo sin etiquetado/modal accesible');
  assert.ok(audit.bars.every((v) => Number.isFinite(v) && v >= 0 && v <= 100), label + ': progressbar fuera de rango');
  await page.screenshot({ path:'test-results/ohana-' + label + '.png', fullPage:true });
  if (errors.length) throw new Error(label + ': ' + errors.join('\n'));
}

try {
  await fs.mkdir('test-results', { recursive:true });
  const desktop = await chromium.launch({ headless:true });
  const page = await desktop.newPage({ viewport:{width:1280,height:720}, deviceScaleFactor:1 });
  await auditPage(page, 'desktop');
  assert.notEqual(await page.locator('#hud').getAttribute('aria-hidden'), 'true', 'desktop: HUD no aparece');
  await page.locator('#game').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await page.keyboard.press('KeyJ');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#pause-overlay').getAttribute('aria-hidden'), 'false', 'desktop: pausa');
  await page.locator('#btn-resume').click();
  await page.reload({ waitUntil:'networkidle' });
  await page.context().setOffline(true);
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForSelector('#btn-play');
  await page.context().setOffline(false);
  await desktop.close();

  const mobile = await chromium.launch({ headless:true });
  const mobilePage = await mobile.newPage({ ...devices['iPhone 13'], isMobile:true, hasTouch:true });
  await auditPage(mobilePage, 'mobile');
  assert.ok(await mobilePage.locator('#touch').isVisible(), 'mobile: controles táctiles');
  await mobilePage.locator('.touch-btn[data-k="e"]').tap();
  await mobilePage.locator('.touch-btn[data-k="j"]').tap();
  await mobile.close();

  console.log('OHANA BROWSER AUDIT PASS');
} finally {
  server.close();
}