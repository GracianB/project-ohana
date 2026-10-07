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
  const page = await browser.newPage({ viewport: { width: 1680, height: 900 }, deviceScaleFactor: 1 });

  await page.goto(base + '?visual=1&e2e=1', { waitUntil: 'networkidle' });
  await page.locator('#ohana-intro').waitFor({ state:'detached', timeout:7000 }).catch(() => {});
  await page.waitForSelector('#btn-play', { state:'visible', timeout:7000 });
  const titleLayout = await page.evaluate(() => {
    const visible = [...document.querySelectorAll('#chars-grid .char-card')].filter((card) => {
      const box = card.getBoundingClientRect();
      const style = getComputedStyle(card);
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 2 && box.height > 2;
    });
    const box = (selector) => {
      const r = document.querySelector(selector)?.getBoundingClientRect();
      return r ? { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height } : null;
    };
    return {
      visible: visible.map((card) => card.dataset.id),
      selected: box('#chars-grid .char-card.selected'),
      title: box('.title-stack'),
      controls: box('.title-controls'),
      dossier: box('.hero-dossier'),
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  assert.equal(titleLayout.visible.length, 3, '01-character-select: deben verse exactamente tres héroes');
  assert.ok(Math.abs((titleLayout.selected.left + titleLayout.selected.width / 2) - titleLayout.width / 2) < titleLayout.width * .1, '01-character-select: héroe fuera del centro');
  assert.ok(Math.abs((titleLayout.title.left + titleLayout.title.width / 2) - titleLayout.width / 2) < titleLayout.width * .08, '01-character-select: título fuera del centro');
  assert.ok(titleLayout.controls.bottom <= titleLayout.height + 2, '01-character-select: controles fuera del viewport');
  assert.ok(titleLayout.dossier.bottom <= titleLayout.controls.top + 12, '01-character-select: dossier invade controles');
  assert.ok(titleLayout.scrollWidth <= titleLayout.width + 2, '01-character-select: overflow horizontal');
  await capture(page, '01-character-select-1680x900');

  await page.locator('#btn-play').click();
  await page.waitForTimeout(500);
  await auditLayout(page, '02-hub');
  await capture(page, '02-hub');

  await page.evaluate(() => window.__OHANA_E2E.setEvo(1));
  const labLoad = await page.evaluate(() => window.__OHANA_E2E.loadRoom('lab'));
  assert.equal(labLoad.roomId, 'lab', '03-room-lab: no se pudo entrar al laboratorio con Forma 2');
  await page.evaluate(() => window.__OHANA_E2E.setInvulnerable(600));
  const enemyState = await page.evaluate(() => window.__OHANA_E2E.step(90));
  await page.waitForTimeout(100);
  await auditLayout(page, '03-room-lab');
  assert.equal(enemyState.enemyDirector?.roomId, 'lab', '03-room-lab: director no corresponde a la sala');
  assert.ok(enemyState.enemyDirector?.alive >= 3, '03-room-lab: encuentro sin población suficiente');
  assert.ok(enemyState.enemyDirector?.budget >= 1 && enemyState.enemyDirector?.budget <= 3, '03-room-lab: presupuesto de ataque inválido');
  assert.ok(Array.isArray(enemyState.enemyAI) && enemyState.enemyAI.length >= 3, '03-room-lab: snapshot IA ausente');
  assert.ok(enemyState.enemyAI.every((e) => e.role && e.intent), '03-room-lab: enemigo sin rol o intención');
  assert.ok(enemyState.enemyAI.filter((e) => e.permit).length <= enemyState.enemyDirector.budget + 1, '03-room-lab: dogpile fuera de presupuesto');
  await capture(page, '03-room-lab');
  await capture(page, '03b-enemy-intelligence');

  // V39 · Cloudstep visible y físicamente activo.
  const cloudSetup = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('chispin');
    api.setEvo(2);
    api.loadRoom('hub');
    const state = api.state();
    const cloud = state.masteryPlatforms.find((p) => p.mastery === 'cloudstep');
    if (!cloud) throw new Error('11-cloudstep: no hay nube de maestría');
    api.setPlayer(cloud.x + 24, cloud.y - 96);
    api.setPlayerVelocity(0, 7);
    return cloud;
  });
  const cloudState = await page.evaluate(() => window.__OHANA_E2E.step(18));
  assert.equal(cloudState.mastery?.cloud, true, '11-cloudstep: Chispín no pisa su nube');
  assert.equal(cloudState.player?.grounded, true, '11-cloudstep: la nube no sostiene a Chispín');
  assert.ok(Math.abs((cloudState.player.y + 36) - cloudSetup.y) < 12, '11-cloudstep: geometría de nube inválida');
  await page.waitForTimeout(80);
  await capture(page, '11-hero-mastery-cloudstep');

  // V39 · Batida de Alas visible después de consumir los saltos normales.
  await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('dragon');
    api.setEvo(4);
    api.setPlayer(520, 980);
    api.step(10);
  });
  await page.locator('#game').focus();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.down('Space');
    await page.evaluate(() => window.__OHANA_E2E.step(1));
    await page.keyboard.up('Space');
    await page.evaluate(() => window.__OHANA_E2E.step(1));
  }
  await page.keyboard.down('Space');
  const wingState = await page.evaluate(() => window.__OHANA_E2E.step(1));
  assert.ok(wingState.mastery?.wingUsed >= 1, '12-wingbeat: Dragón no activa la batida extra');
  assert.equal(wingState.mastery?.move, 'wingbeat', '12-wingbeat: señal visual de batida ausente');
  await page.waitForTimeout(40);
  await capture(page, '12-hero-mastery-wingbeat');
  await page.keyboard.up('Space');
  await page.evaluate(() => window.__OHANA_E2E.step(1));

  // Recupera Kilo para continuar la matriz cinematográfica original.
  await page.evaluate(() => window.__OHANA_E2E.start('kilo'));

  await page.evaluate(() => {
    dispatchEvent(new CustomEvent('ohana-evolve', { detail: {
      id:'kilo', name:'Kilo', evo:1, fromEvo:0,
      fromName:'Kilo Bebé', toName:'Kilo Crece', color:'#ffe66a', final:false
    }}));
  });
  await page.waitForTimeout(220);
  assert.equal(await page.locator('#evo-stage').evaluate((el) => el.classList.contains('show')), true, '04-evolution: cinemática no visible');
  await capture(page, '04-evolution');
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  assert.equal(await page.locator('#evo-stage').evaluate((el) => el.classList.contains('show')), false, '04-evolution: skip no devuelve al juego');

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
  await page.locator('#btn-close-help').click();

  await page.evaluate(() => dispatchEvent(new CustomEvent('ohana-win', { detail: {
    hero:'Kilo', form:'Forma final', rank:'S', time:'03:21', kills:42, best:'03:21'
  }})));
  await page.waitForTimeout(2450);
  assert.equal(await page.locator('#win-cinema').evaluate((el) => el.classList.contains('show')), true, '08-ending: final no visible');
  await capture(page, '08-ending');
  await page.locator('#win-continue').click();
  await page.waitForTimeout(100);

  await page.evaluate(() => window.__OHANA_E2E.start('kilo'));
  await page.evaluate(() => window.__OHANA_E2E.setEvo(4));
  await page.evaluate(() => window.__OHANA_E2E.setCombo(10));
  const previousSupremeGeneration = await page.evaluate(() => Number(document.querySelector('#supreme-cinema')?.dataset.generation || 0));
  const supremeState = await page.evaluate(() => window.__OHANA_E2E.cast(3));
  await page.waitForFunction((previousGeneration) => {
    const el = document.querySelector('#supreme-cinema');
    return Number(el?.dataset.generation || 0) > previousGeneration && el?.dataset.state === 'active';
  }, previousSupremeGeneration, { timeout: 1200 });
  await page.waitForTimeout(120);
  assert.equal(supremeState.lastAbilitySlot, 3, '09-supreme: U no se lanza como slot 3');
  assert.equal(supremeState.assist, 'stitcho', '09-supreme: OHANA ASSIST no invoca a Stitcho para Kilo');
  const supremeCinemaState = await page.locator('#supreme-cinema').evaluate((el) => ({
    show: el.classList.contains('show'),
    state: el.dataset.state,
    hidden: el.getAttribute('aria-hidden')
  }));
  assert.deepEqual(supremeCinemaState, { show:true, state:'active', hidden:'false' }, '09-supreme: cinemática U no permanece activa');
  assert.match(await page.locator('.ability-slot[data-supreme="1"] .name').textContent(), /OHANA SOLAR/, '09-supreme: HUD no muestra el nombre de U');
  await capture(page, '09-supreme-u-assist');
  await page.waitForFunction(() => document.querySelector('#supreme-cinema')?.dataset.state === 'idle', null, { timeout: 3600 });

  await page.evaluate(() => window.__OHANA_E2E.die('hurt'));
  await page.evaluate(() => window.__OHANA_E2E.step(88));
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#cinematic-beat').evaluate((el) => el.classList.contains('show')), true, '09-death: beat de muerte no visible');
  await capture(page, '10-death-ghost');

  await browser.close();
  console.log('OHANA VISUAL MATRIX PASS');
  console.log('Screenshots: ' + screenshots.join(', '));
} finally {
  server.close();
}
