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
  // La intro es una animación autodestruible. El E2E no debe clicar un elemento
  // que puede desaparecer entre el descubrimiento del locator y su evaluación.
  await page.locator('#ohana-intro').waitFor({ state:'detached', timeout:7000 }).catch(() => {});
  await page.waitForSelector('#btn-play', { state:'visible', timeout:7000 });
  const moduleProbe = await page.evaluate(async () => {
    const paths = [
      '/characters/rig.js',
      '/characters/draw.js',
      '/characters/art/index.js',
      '/characters/art/kilo.js',
      '/characters/art/stitcho.js',
      '/characters/art/chispin.js',
      '/characters/art/cat.js',
      '/characters/art/dragon.js',
      '/characters/art/dino.js',
      '/characters/art/frita.js',
      '/characters/art/pizza.js',
      '/characters/art/yomi.js',
      '/characters/art/cuerno.js',
      '/characters/sprites.js',
      '/characters/look.js',
      '/systems/abilities.js',
      '/engine/input.js'
    ];
    const results = [];
    for (const path of paths) {
      try {
        await import(path + '?probe=1');
        results.push({ path, ok: true });
      } catch (error) {
        let parse = null;
        try {
          const response = await fetch(path + '?source-probe=1', { cache: 'no-store' });
          const source = await response.text();
          const normalized = source
            .replace(/^import[^;]+;\\s*$/gm, '')
            .replace(/\\bexport\\s+(?=(const|let|var|function|class))/g, '');
          new Function(normalized);
        } catch (parseError) {
          parse = { message: parseError?.message || String(parseError), stack: parseError?.stack || '' };
        }
        results.push({ path, ok: false, message: error?.message || String(error), stack: error?.stack || '', parse });
      }
    }
    return results;
  });
  const failedModules = moduleProbe.filter((item) => !item.ok);
  if (failedModules.length) {
    throw new Error(label + ': module probe failed\n' + failedModules.map((item) => item.path + ' · ' + item.message + '\n' + item.stack).join('\n'));
  }
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

  const gameplay = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    if (!api) throw new Error('E2E gameplay API ausente');
    const snapshots = [];

    snapshots.push(api.state());

    const castStart = api.cast(0);
    snapshots.push(castStart);
    const castAfter = api.step(8);
    snapshots.push(castAfter);

    const dashBefore = api.state();
    api.dash();
    const dashAfter = api.step(4);
    snapshots.push({ dashBefore, dashAfter });

    const evolved = api.setXp(55);
    snapshots.push(evolved);
    if (evolved.evo < 1) throw new Error('E2E: la evolución 0→1 no se produjo al alcanzar XP');

    const lab = api.loadRoom('lab');
    snapshots.push(lab);
    if (lab.roomId !== 'lab') throw new Error('E2E: no pudo entrar en Lab');

    const rainStart = api.forceRain();
    const rainAfter = api.step(36);
    snapshots.push({ rainStart, rainAfter });
    if (!rainAfter.rain) throw new Error('E2E: la lluvia radiactiva no arrancó');

    const finalForm = api.setEvo(4);
    snapshots.push(finalForm);
    if (finalForm.evo !== 4) throw new Error('E2E: no pudo alcanzar forma final');

    const bossRoom = api.loadRoom('boss');
    snapshots.push(bossRoom);
    if (bossRoom.roomId !== 'boss' || !bossRoom.boss) throw new Error('E2E: no pudo entrar al Nido');

    api.setInvulnerable(600);
    api.step(90);

    let boss = api.state().boss;
    if (!boss) throw new Error('E2E: boss ausente tras entrar al Nido');

    api.setPlayer(boss.x - 42, boss.y + 8);
    boss = api.state().boss;
    const hpBeforeHit = boss.hp;
    api.setBossHp(600);
    api.setPlayer(boss.x - 42, boss.y + 8);
    api.attack();
    const combatAfter = api.step(4);
    snapshots.push({ hpBeforeHit, combatAfter });

    if (!combatAfter.boss || !(combatAfter.boss.hp < 600) || combatAfter.boss.hp <= 0) {
      throw new Error('E2E: el ataque real no dañó a la Reina del Nido sin matarla');
    }

    api.setBossHp(300);
    const phaseAfter = api.step(12);
    snapshots.push({ phaseAfter });
    if (!phaseAfter.boss || phaseAfter.boss.phase < 3 || phaseAfter.boss.dying) {
      throw new Error('E2E: fase3 inválida · ' + JSON.stringify(phaseAfter.boss));
    }

    return snapshots;
  });

  if (errors.length) throw new Error(label + ': runtime errors during gameplay audit\n' + errors.join('\n'));

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
  assert.ok(gameplay.length >= 10, label + ': secuencia de gameplay incompleta');
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

  // La auditoría de gameplay manipula deliberadamente el estado. Reiniciamos
  // antes de comprobar pausa/entrada normal para no mezclar ambos escenarios.
  await page.reload({ waitUntil:'networkidle' });
  await page.locator('#ohana-intro').waitFor({ state:'detached', timeout:7000 }).catch(() => {});
  await page.waitForSelector('#btn-play', { state:'visible', timeout:7000 });
  await page.locator('#btn-play').click();
  await page.waitForTimeout(500);

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