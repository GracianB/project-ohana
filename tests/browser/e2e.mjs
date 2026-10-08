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
  page.on('response', (response) => { if (response.status() >= 400 && response.url().startsWith(base)) errors.push('response: ' + response.status() + ' ' + response.url()); });
  await page.goto(base + '?e2e=1', { waitUntil:'networkidle' });
  const titleIntroState = await page.evaluate(() => {
    const el = document.querySelector('#ohana-intro');
    const style = el ? getComputedStyle(el) : null;
    return {
      active: !!el?.classList.contains('show'),
      visible: !!style && style.display !== 'none' && style.visibility !== 'hidden',
      complete: document.body.classList.contains('intro-complete')
    };
  });
  assert.ok(titleIntroState.active && titleIntroState.visible, label + ': V45 comic family welcome no aparece');
  await page.waitForTimeout(1350);
  const heldOpening = await page.evaluate(() => ({
    complete:document.body.classList.contains('intro-complete'),
    mode:document.querySelector('#ohana-intro')?.dataset.openingMode || '',
    cast:Number(document.querySelector('#ohana-intro')?.dataset.v45Cast || 0),
    ready:document.querySelector('#ohana-intro')?.classList.contains('ready') || false
  }));
  assert.equal(heldOpening.complete, false, label + ': V45 avanza al carrusel sin acción del usuario');
  assert.equal(heldOpening.mode, 'family-welcome', label + ': modo de apertura V45 incorrecto');
  assert.equal(heldOpening.cast, 10, label + ': bienvenida no contiene los 10 héroes');
  assert.equal(heldOpening.ready, true, label + ': CTA de entrada no se activa');
  const gameSource = await page.evaluate(async () => {
    const response = await fetch('/game.js?v=ohana-230', { cache:'no-store' });
    return { ok: response.ok, status: response.status, source: await response.text() };
  });
  assert.equal(gameSource.ok, true, label + ': game.js no servido por el servidor');
  assert.equal(gameSource.status, 200, label + ': game.js HTTP inválido');
  assert.match(gameSource.source, /CombatFX,\s*combatTier/, label + ': game.js servido no contiene combatTier');
  await page.locator('#ohana-intro .oi-enter').click();
  await page.locator('#ohana-intro').waitFor({ state:'detached', timeout:2500 }).catch(() => {});
  await page.waitForSelector('#btn-play', { state:'visible', timeout:2500 });
  const titleLayout = await page.evaluate(() => {
    const rect = (selector) => {
      const r = document.querySelector(selector)?.getBoundingClientRect();
      return r ? { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height } : null;
    };
    const cards = [...document.querySelectorAll('#chars-grid .char-card')];
    const visibleCards = cards.filter((card) => {
      const box = card.getBoundingClientRect();
      const style = getComputedStyle(card);
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 2 && box.height > 2;
    });
    const selected = rect('#chars-grid .char-card.selected');
    const title = rect('.title-stack');
    const hero = rect('.hero-stage');
    const controls = rect('.title-controls');
    const dossier = rect('.hero-dossier');
    const menu = rect('#char-select');
    const center = (box) => box ? box.left + box.width / 2 : NaN;
    return {
      visibleCards: visibleCards.map((card) => card.dataset.id),
      selected, title, hero, controls, dossier, menu,
      selectedCenter: center(selected),
      titleCenter: center(title),
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      introComplete: document.body.classList.contains('intro-complete')
    };
  });
  assert.equal(titleLayout.introComplete, true, label + ': intro no entrega el menú');
  assert.equal(titleLayout.visibleCards.length, label === 'mobile' ? 3 : 5, label + ': selector V45 con profundidad incorrecta');
  assert.ok(Math.abs(titleLayout.selectedCenter - titleLayout.viewport.width / 2) <= titleLayout.viewport.width * 0.12, label + ': héroe seleccionado fuera del eje central');
  assert.ok(Math.abs(titleLayout.titleCenter - titleLayout.viewport.width / 2) <= titleLayout.viewport.width * 0.08, label + ': título fuera del eje central · ' + JSON.stringify(titleLayout));
  assert.ok(titleLayout.title.top < titleLayout.hero.top + titleLayout.hero.height * 0.35, label + ': título cae dentro del carrusel');
  assert.ok(titleLayout.controls.top > titleLayout.title.bottom, label + ': controles invaden la cabecera');
  assert.ok(titleLayout.controls.bottom <= titleLayout.viewport.height + 2, label + ': controles fuera del viewport');
  assert.ok(titleLayout.dossier.bottom <= titleLayout.controls.top + 12, label + ': dossier invade los controles');
  assert.ok(titleLayout.scrollWidth <= titleLayout.viewport.width + 2, label + ': portada desborda horizontalmente');
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
      '/systems/hero-mastery.js',
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

  if (label === 'desktop') {
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(1350);
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(140);
    const heldJump = await page.evaluate(() => window.__OHANA_E2E?.state());
    assert.equal(heldJump?.input?.right, true, 'V46: ArrowUp cancela ArrowRight mantenido');
    assert.equal(heldJump?.input?.axisX, 1, 'V46: intención horizontal se pierde al saltar');
    assert.equal(heldJump?.input?.jump, true, 'V46: salto físico no queda activo');
    assert.ok((heldJump?.player?.vx || 0) > 0, 'V46: el personaje pierde velocidad horizontal durante el salto');
    await page.keyboard.up('ArrowUp');
    await page.waitForTimeout(120);
    const afterJumpRelease = await page.evaluate(() => window.__OHANA_E2E?.state());
    assert.equal(afterJumpRelease?.input?.right, true, 'V46: soltar salto también suelta la dirección');
    assert.equal(afterJumpRelease?.input?.axisX, 1, 'V46: dirección mantenida no se recupera tras soltar salto');
    await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(80);
    const releasedDirection = await page.evaluate(() => window.__OHANA_E2E?.state());
    assert.equal(releasedDirection?.input?.right, false, 'V46: ArrowRight queda atascado tras keyup');
    assert.equal(releasedDirection?.input?.axisX, 0, 'V46: axisX no vuelve a cero tras keyup');
  }

  const gameplay = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    if (!api) throw new Error('E2E gameplay API ausente');

    const messageSnapshot = () => {
      const nodes = [...document.querySelectorAll('#notification-container .game-notification')];
      return {
        count: nodes.length,
        classes: nodes.map((node) => node.className),
        title: nodes[0]?.querySelector('h2')?.textContent || '',
        text: nodes[0]?.querySelector('p')?.textContent || '',
        objective: document.querySelector('#notification-container .game-notification.objective')?.textContent || '',
      };
    };

    const snapshots = [];
    snapshots.push({ state: api.state(), message: messageSnapshot() });

    const beforeRoomMessages = messageSnapshot();
    if (beforeRoomMessages.count > 1) {
      throw new Error('E2E: más de un mensaje simultáneo al iniciar');
    }

    const castStart = api.cast(0);
    snapshots.push(castStart);
    const castAfter = api.step(8);
    snapshots.push(castAfter);

    const dashBefore = api.state();
    api.dash();
    const dashAfter = api.step(4);
    snapshots.push({ dashBefore, dashAfter });

    const evolved = api.setXp(55);
    snapshots.push({ evolved, message: messageSnapshot() });
    if (evolved.evo < 1) throw new Error('E2E: la evolución 0→1 no se produjo al alcanzar XP');

    const lab = api.loadRoom('lab');
    const labMessage = messageSnapshot();
    snapshots.push({ lab, message: labMessage });
    if (lab.roomId !== 'lab') throw new Error('E2E: no pudo entrar en Lab');
    if (labMessage.count !== 1) throw new Error('E2E: entrar en Lab debe mostrar exactamente un mensaje');
    if (!/Lab/i.test(labMessage.title) || !labMessage.text) {
      throw new Error('E2E: mensaje de sala incompleto: ' + JSON.stringify(labMessage));
    }

    const speciesStart = api.step(1);
    snapshots.push({ speciesStart });
    if (!Array.isArray(speciesStart.enemyAI) || !speciesStart.enemyAI.length ||
        speciesStart.enemyAI.some((enemy) => !enemy.family || !enemy.signature || !enemy.variant || !enemy.speciesMode)) {
      throw new Error('E2E V42: identidad de especie incompleta · ' + JSON.stringify(speciesStart.enemyAI));
    }
    if (!speciesStart.enemyAI.some((enemy) => enemy.relation && enemy.relation !== 'NONE')) {
      throw new Error('E2E V42: no emerge ninguna relación entre especies · ' + JSON.stringify(speciesStart.enemyAI));
    }

    const rainStart = api.forceRain();
    const rainAfter = api.step(36);
    snapshots.push({ rainStart, rainAfter });
    if (!rainAfter.rain) throw new Error('E2E: la lluvia radiactiva no arrancó');
    if (rainAfter.enemyDirector?.ecology !== 'circuit' || rainAfter.enemyDirector?.formation !== 'CIRCUIT') {
      throw new Error('E2E V41: ecología de Lab incorrecta · ' + JSON.stringify(rainAfter.enemyDirector));
    }
    if (!Array.isArray(rainAfter.enemyAI) || !rainAfter.enemyAI.length || rainAfter.enemyAI.some((enemy) => enemy.biome !== 'circuit' || enemy.formation !== 'CIRCUIT')) {
      throw new Error('E2E V41: enemigos de Lab sin identidad ecológica · ' + JSON.stringify(rainAfter.enemyAI));
    }

    const finalForm = api.setEvo(4);
    snapshots.push({ finalForm, message: messageSnapshot() });
    if (finalForm.evo !== 4) throw new Error('E2E: no pudo alcanzar forma final');

    const bossRoom = api.loadRoom('boss');
    const bossMessage = messageSnapshot();
    snapshots.push({ bossRoom, message: bossMessage });
    if (bossMessage.count !== 1) throw new Error('E2E: entrada al boss debe mostrar un único mensaje');
    if (!/REINA DEL NIDO/i.test(bossMessage.title)) {
      throw new Error('E2E: título del mensaje de boss incorrecto: ' + bossMessage.title);
    }
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

    api.setBossHp(1000);
    const phaseTwo = api.step(1);
    snapshots.push({ phaseTwo });
    if (!phaseTwo.boss || phaseTwo.boss.phase !== 2) {
      throw new Error('E2E: transición fase1→fase2 inválida · ' + JSON.stringify(phaseTwo.boss));
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

  const messageLayout = await page.evaluate(() => {
    const node = document.querySelector('#notification-container .game-notification');
    const box = node?.getBoundingClientRect();
    const boss = document.querySelector('#boss-wrap');
    const ability = document.querySelector('#ability-bar');
    const touch = document.querySelector('#touch');
    const intersects = (a, b) => !!a && !!b &&
      a.left < b.right && a.right > b.left &&
      a.top < b.bottom && a.bottom > b.top;
    return {
      messageCount: document.querySelectorAll('#notification-container .game-notification').length,
      bossOverlap: intersects(box, boss?.getBoundingClientRect()),
      abilityOverlap: intersects(box, ability?.getBoundingClientRect()),
      touchOverlap: intersects(box, touch?.getBoundingClientRect()),
    };
  });

  assert.ok(messageLayout.messageCount <= 1, label + ': más de un mensaje visual simultáneo');
  assert.equal(messageLayout.bossOverlap, false, label + ': mensaje solapa la barra del boss');
  assert.equal(messageLayout.abilityOverlap, false, label + ': mensaje solapa habilidades');
  if (label === 'mobile') {
    assert.equal(messageLayout.touchOverlap, false, label + ': mensaje solapa controles táctiles');
  }

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
    const productionResources = resources.filter((r) => {
      try { return !new URL(r.name).searchParams.has('e2e'); }
      catch (_) { return true; }
    });
    const js = productionResources.filter((r) => r.name.includes('.js')).reduce((n,r) => n + (r.transferSize || 0), 0);
    const css = productionResources.filter((r) => r.name.includes('.css')).reduce((n,r) => n + (r.transferSize || 0), 0);
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
  assert.ok(audit.js < 1500000, label + ': JS > 1.5 MB · ' + audit.js + ' bytes');
  assert.ok(audit.css < 500000, label + ': CSS > 500 KB');
  assert.ok(audit.fcp < 4000, label + ': FCP > 4 s');
  assert.ok(gameplay.length >= 10, label + ': secuencia de gameplay incompleta');
  assert.match(audit.title, /PROJECT OHANA/i);
  assert.ok(audit.canvasLabel.length > 0, label + ': Canvas sin aria-label');
  assert.ok(audit.buttons.every((b) => b.name.length > 0), label + ': botón sin nombre accesible');
  assert.ok(audit.dialogs.every((d) => d.labelled && d.modal), label + ': diálogo sin etiquetado/modal accesible');
  assert.ok(audit.bars.every((v) => Number.isFinite(v) && v >= 0 && v <= 100), label + ': progressbar fuera de rango');
  await page.screenshot({ path:'test-results/ohana-' + label + '.png', fullPage:false, timeout:10000 });
  if (errors.length) throw new Error(label + ': ' + errors.join('\n'));

  const deterministic = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    const run = () => {
      api.setSeed(123456789);
      api.start('kilo');
      api.setXp(55);
      api.setEvo(2);
      api.cast(1);
      api.dash();
      api.step(36);
      return api.state();
    };
    return { first: run(), second: run() };
  });
  assert.deepEqual(deterministic.first, deterministic.second, label + ': gameplay no determinista con semilla idéntica');

  const fault = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('kilo');
    return api.injectFault('nan');
  });
  assert.ok(Number.isFinite(fault.score), label + ': score no recuperado tras NaN');
  assert.ok(Number.isFinite(fault.hp) && Number.isFinite(fault.xp), label + ': estado crítico no recuperado tras NaN');
  assert.ok(fault.projectiles <= 128, label + ': colección no acotada tras inyección');

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
  await page.waitForTimeout(1350);
  const reloadOpening = page.locator('#ohana-intro .oi-enter');
  if (await reloadOpening.count()) {
    await reloadOpening.click();
    await page.locator('#ohana-intro').waitFor({ state:'detached', timeout:2500 }).catch(() => {});
  }
  await page.waitForSelector('#btn-play', { state:'visible', timeout:2500 });
  await page.locator('#btn-play').click();
  await page.waitForTimeout(500);

  assert.notEqual(await page.locator('#hud').getAttribute('aria-hidden'), 'true', 'desktop: HUD no aparece');
  const secondaryErrors = [];
  page.on('pageerror', (error) => secondaryErrors.push('pageerror: ' + (error.stack || error.message)));
  page.on('console', (message) => { if (message.type() === 'error') secondaryErrors.push('console: ' + message.text()); });
  page.on('requestfailed', (request) => secondaryErrors.push('requestfailed: ' + request.url() + ' · ' + (request.failure()?.errorText || 'unknown')));
  await page.locator('#game').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await page.keyboard.press('KeyJ');

  // V34.1 — Pizza L real. L se desbloquea en forma 3 (evo 2).
  await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('pizza');
    api.setEvo(2);
  });
  await page.locator('#game').focus();
  await page.keyboard.press('l');
  await page.waitForTimeout(80);

  const pizzaL = await page.evaluate(() => window.__OHANA_E2E.state());

  assert.equal(
    pizzaL.lastAbilityId,
    'oven',
    'desktop: Pizza L no dispara oven'
  );

  assert.equal(
    pizzaL.lastAbilitySlot,
    2,
    'desktop: Pizza L no usa slot 2'
  );

  // V39 — Dragón: agota sus saltos normales y obtiene una Batida de Alas real.
  await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('dragon');
    api.setEvo(4);
    api.setPlayer(520, 920);
    api.setPlayerVelocity(0, 2);
    api.exhaustPlayerJumps();
    api.resetInput();
  });
  await page.locator('#game').focus();
  await page.keyboard.down('Space');
  const dragonMastery = await page.evaluate(() => window.__OHANA_E2E.step(1));
  await page.keyboard.up('Space');
  await page.evaluate(() => window.__OHANA_E2E.step(1));
  assert.equal(dragonMastery.mastery?.id, 'wingbeat', 'desktop: Dragón no expone Batida de Alas');
  assert.ok(dragonMastery.mastery?.wingUsed >= 1, 'desktop: Dragón no consigue una batida extra tras agotar saltos');
  assert.equal(dragonMastery.mastery?.move, 'wingbeat', 'desktop: la batida extra no deja señal de maestría');
  assert.ok(dragonMastery.player?.vy < 0, 'desktop: la Batida de Alas no impulsa a Dragón');

  // V39 — Chispín: una nube de Cloudstep entra en la física solo para él.
  const chispinSetup = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('chispin');
    api.setEvo(2);
    api.loadRoom('hub');
    api.setInvulnerable(600);
    api.resetInput();
    const state = api.state();
    if (state.input.left || state.input.right || state.input.jump || state.input.down) {
      throw new Error('Cloudstep: input residual ' + JSON.stringify(state.input));
    }
    const cloud = state.masteryPlatforms.find((p) => p.mastery === 'cloudstep');
    if (!cloud) throw new Error('Cloudstep: no hay nube en hub');
    const startX = cloud.x + Math.min(28, cloud.w * 0.2);
    api.setPlayer(startX, cloud.y - 132);
    api.setPlayerVelocity(0, 0);
    const neutral = api.step(6);
    if (Math.abs(neutral.player.x - startX) > 0.5) {
      throw new Error('V39: deriva horizontal sin input · ' + JSON.stringify({ startX, player:neutral.player, input:neutral.input, debug:neutral.debug }));
    }
    api.setPlayer(startX, cloud.y - 96);
    api.setPlayerVelocity(0, 7);
    return { cloud };
  });
  const chispinCloud = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    let state = api.state();
    for (let i = 0; i < 48 && !state.mastery?.cloud; i++) state = api.step(1);
    return state;
  });
  assert.equal(chispinCloud.mastery?.id, 'cloudstep', 'desktop: Chispín no expone Cloudstep');
  assert.equal(
    chispinCloud.mastery?.cloud,
    true,
    'desktop: Chispín no aterriza sobre la nube de Cloudstep · ' + JSON.stringify({ player:chispinCloud.player, cloud:chispinSetup.cloud, mastery:chispinCloud.mastery, input:chispinCloud.input })
  );
  assert.equal(chispinCloud.player?.grounded, true, 'desktop: nube Cloudstep no sostiene al jugador');
  assert.ok(
    Math.abs((chispinCloud.player.y + 36) - chispinSetup.cloud.y) < 12,
    'desktop: Chispín atraviesa la nube · ' + JSON.stringify({ player:chispinCloud.player, cloud:chispinSetup.cloud })
  );

  // V40 — caída física Beach → Reef. El hueco tiene prioridad sobre floor rescue.
  const beachDrop = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('kilo');
    api.loadRoom('beach');
    api.resetInput();
    api.setPlayer(1085, 1060);
    api.setPlayerVelocity(0, 8);
    let state = api.state();
    for (let i = 0; i < 36 && state.roomId === 'beach'; i++) state = api.step(1);
    return state;
  });
  assert.equal(beachDrop.roomId, 'reef', 'desktop: pozo Beach no transfiere realmente a Reef');

  // V40 — magma real en Caldera.
  const magmaDeath = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('kilo');
    api.setEvo(4);
    api.loadRoom('volcano');
    api.resetInput();
    api.setPlayer(1120, 1120);
    api.setPlayerVelocity(0, 8);
    let state = api.state();
    for (let i = 0; i < 24 && state.hp > 0; i++) state = api.step(1);
    return state;
  });
  assert.equal(magmaDeath.roomId, 'volcano', 'desktop: magma cambia de sala inesperadamente');
  assert.equal(magmaDeath.hp, 0, 'desktop: pozo mortal de magma no mata');

  // V40 — Dragón obtiene una única salida heroica del mismo magma.
  const dragonPit = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    api.start('dragon');
    api.setEvo(4);
    api.loadRoom('volcano');
    api.resetInput();
    api.setPlayer(1120, 1120);
    api.setPlayerVelocity(0, 8);
    let state = api.state();
    for (let i = 0; i < 48 && state.hp > 0 && !state.hazardEscape; i++) state = api.step(1);
    return state;
  });
  assert.ok(dragonPit.hp > 0, 'desktop: Dragón no sobrevive a su última batida en magma');
  assert.match(dragonPit.hazardEscape || '', /magma-pit/, 'desktop: rescate de Dragón no registra el hazard real');
  assert.ok(dragonPit.player?.vy < 0, 'desktop: última batida de Dragón no lo expulsa del pozo');

  // V40 — World Graph avanzado reemplaza la vieja cuadrícula.
  await page.locator('#btn-map').click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#map-overlay').getAttribute('aria-hidden'), 'false', 'desktop: mapa V40 no abre');
  assert.equal(await page.locator('#map-grid .world-map-v40').count(), 1, 'desktop: World Graph V40 ausente');
  assert.equal(await page.locator('#map-grid .wm-node').count(), 10, 'desktop: mapa V40 no contiene diez salas');
  assert.ok(await page.locator('#map-grid .wm-edge.wm-catapult').count() >= 1, 'desktop: mapa no muestra catapultas');
  assert.ok(await page.locator('#map-grid .wm-edge.wm-vortex').count() >= 1, 'desktop: mapa no muestra vórtices');
  assert.ok(await page.locator('#map-grid .wm-edge.wm-drop').count() >= 1, 'desktop: mapa no muestra caídas');
  assert.equal(await page.locator('#map-grid .wm-node.here').count(), 1, 'desktop: mapa no marca sala actual');
  await page.locator('#btn-close-map').click();
  await page.waitForTimeout(50);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#pause-overlay').getAttribute('aria-hidden'), 'false', 'desktop: pausa');
  await page.locator('#btn-resume').click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#pause-overlay').getAttribute('aria-hidden'), 'true', 'desktop: la pausa no se cierra al reanudar');
  assert.equal(await page.locator('#pause-overlay').evaluate((el) => el.classList.contains('open')), false, 'desktop: overlay de pausa sigue abierto al reanudar');

  const helpButton = page.locator('#btn-help');
  await helpButton.click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#help').getAttribute('aria-hidden'), 'false', 'desktop: ayuda');
  assert.equal(await page.evaluate(() => document.activeElement?.closest?.('#help')?.id || ''), 'help', 'desktop: foco no entra en ayuda');
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.closest?.('#help')?.id || ''), 'help', 'desktop: Tab escapa del diálogo');
  }
  await page.locator('#btn-close-help').click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#help').getAttribute('aria-hidden'), 'true', 'desktop: ayuda no se cierra');
  assert.equal(await page.evaluate(() => document.activeElement?.id || ''), 'btn-help', 'desktop: foco no vuelve al disparador');

  const reducedPage = page;
  await reducedPage.emulateMedia({ reducedMotion: 'reduce' });
  await reducedPage.reload({ waitUntil:'networkidle' });
  await reducedPage.waitForTimeout(1350);
  const reducedOpening = reducedPage.locator('#ohana-intro .oi-enter');
  if (await reducedOpening.count()) {
    await reducedOpening.click();
    await reducedPage.locator('#ohana-intro').waitFor({ state:'detached', timeout:2500 }).catch(() => {});
  }
  await reducedPage.waitForSelector('#btn-play', { state:'visible', timeout:2500 });
  assert.equal(await reducedPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true, 'desktop: reduced motion no emulado');
  await reducedPage.locator('#btn-play').click();
  await reducedPage.waitForTimeout(250);
  assert.notEqual(await reducedPage.locator('#hud').getAttribute('aria-hidden'), 'true', 'desktop: reduced motion no inicia');

  const perfMs = await reducedPage.evaluate(() => {
    const api = window.__OHANA_E2E;
    const start = performance.now();
    api.step(120);
    return performance.now() - start;
  });
  assert.ok(perfMs < 1000, 'desktop: presupuesto de simulación excedido · ' + perfMs.toFixed(1) + ' ms');
  const offlineErrorStart = secondaryErrors.length;
  const offlineRequestStart = secondaryErrors.filter((item) => item.startsWith('requestfailed:')).length;
  const offlineBoot = async () => page.evaluate(async () => {
    const paths = [
      '/game.js?v=ohana-230',
      '/style.css?v=ohana-230',
      '/assets/sprites/bodies/cuerno-idle.svg?v=ohana-230',
    ];
    const results = [];
    for (const path of paths) {
      const response = await fetch(path, { cache: 'no-store' });
      results.push({
        path,
        ok: response.ok,
        status: response.status,
        type: response.headers.get('content-type') || ''
      });
    }
    const sw = navigator.serviceWorker;
    return {
      controller: !!sw.controller,
      title: document.title,
      results,
      canvas: !!document.querySelector('#game')
    };
  });

  await page.context().setOffline(true);
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1350);
  await page.locator('#ohana-intro .oi-enter').click();
  await page.locator('#ohana-intro').waitFor({ state:'detached', timeout:2500 }).catch(() => {});
  await page.waitForSelector('#btn-play', { state:'visible', timeout:2500 });
  const offline = await offlineBoot();
  assert.equal(offline.controller, true, 'desktop: SW no controla la recarga offline');
  assert.match(offline.title, /PROJECT OHANA/i, 'desktop: título offline ausente');
  assert.equal(offline.canvas, true, 'desktop: Canvas ausente offline');
  assert.ok(offline.results.every((item) => item.ok && item.status === 200), 'desktop: asset offline no servido: ' + JSON.stringify(offline.results));
  assert.equal(secondaryErrors.length, offlineErrorStart, 'desktop: errores durante arranque offline\\n' + secondaryErrors.slice(offlineErrorStart).join('\\n'));
  assert.equal(secondaryErrors.filter((item) => item.startsWith('requestfailed:')).length, offlineRequestStart, 'desktop: request fallida durante arranque offline');

  await page.locator('#btn-play').click();
  await page.waitForTimeout(500);
  assert.notEqual(await page.locator('#hud').getAttribute('aria-hidden'), 'true', 'desktop: gameplay no arranca offline');
  const offlineGame = await page.evaluate(() => ({
    hook: !!window.__OHANA_E2E,
    canvasLabel: document.querySelector('#game')?.getAttribute('aria-label') || ''
  }));
  assert.equal(offlineGame.hook, true, 'desktop: E2E no arranca offline');
  assert.ok(offlineGame.canvasLabel.length > 0, 'desktop: Canvas sin etiqueta offline');

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