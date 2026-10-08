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
  const opening = page.locator('#ohana-intro');
  await opening.waitFor({ state:'visible', timeout:2500 });
  await page.waitForTimeout(2020);
  const openingState = await opening.evaluate((el) => ({
    cast:Number(el.dataset.v45Cast || 0),
    shown:el.classList.contains('show'),
    ready:el.classList.contains('ready'),
    mode:el.dataset.openingMode || '',
    complete:document.body.classList.contains('intro-complete')
  }));
  assert.equal(openingState.cast, 10, '00-opening-family: V45 no expone los 10 héroes');
  assert.equal(openingState.shown, true, '00-opening-family: bienvenida no visible');
  assert.equal(openingState.ready, true, '00-opening-family: entrada no preparada');
  assert.equal(openingState.complete, false, '00-opening-family: avanza sola al carrusel');
  assert.equal(openingState.mode, 'family-welcome', '00-opening-family: modo visual incorrecto');
  await capture(page, '00-opening-family');
  await page.locator('#ohana-intro .oi-enter').click();
  await page.locator('#ohana-intro').waitFor({ state:'detached', timeout:2500 }).catch(() => {});
  await page.waitForSelector('#btn-play', { state:'visible', timeout:2500 });
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
      atriumOn: document.querySelector('#char-select')?.classList.contains('atrium-on') || false,
      selected: box('#chars-grid .char-card.selected'),
      title: box('.title-stack'),
      controls: box('.title-controls'),
      dossier: box('.hero-dossier'),
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  assert.equal(titleLayout.visible.length, titleLayout.atriumOn ? 10 : 5, '01-character-select: profundidad Atrium/carrusel incorrecta');
  assert.ok(Math.abs((titleLayout.selected.left + titleLayout.selected.width / 2) - titleLayout.width / 2) < titleLayout.width * .1, '01-character-select: héroe fuera del centro');
  assert.ok(Math.abs((titleLayout.title.left + titleLayout.title.width / 2) - titleLayout.width / 2) < titleLayout.width * .08, '01-character-select: título fuera del centro');
  assert.ok(titleLayout.controls.bottom <= titleLayout.height + 2, '01-character-select: controles fuera del viewport');
  assert.ok(titleLayout.dossier.bottom <= titleLayout.controls.top + 12, '01-character-select: dossier invade controles');
  assert.ok(titleLayout.scrollWidth <= titleLayout.width + 2, '01-character-select: overflow horizontal');
  await capture(page, '01-character-select-1680x900');

  await page.evaluate(() => { window.__OHANA_TITLE_EVO_OVERRIDE = 4; });
  await page.waitForTimeout(220);
  const finalFormFit = await page.evaluate(() => {
    const card=document.querySelector('#chars-grid .char-card.selected');
    const canvas=card?.querySelector('canvas');
    const r=card?.getBoundingClientRect();
    return {
      evo:Number(canvas?.dataset.evo ?? -1),
      scale:Number(canvas?.dataset.fitScale || 0),
      envelope:Number(canvas?.dataset.fitEnvelope || 0),
      cardEvo:card?.dataset.evo || '',
      backdrop:document.querySelector('#title-fx')?.dataset.backdrop || '',
      scene:document.querySelector('#title-fx')?.dataset.heroScene || '',
      card:r?{width:r.width,height:r.height}:null
    };
  });
  assert.equal(finalFormFit.evo, 4, '01c-final-form-fit: no entra en Forma 5');
  assert.equal(finalFormFit.cardEvo, '4', '01c-final-form-fit: tarjeta no conoce su evolución');
  assert.ok(finalFormFit.envelope >= 1.3, '01c-final-form-fit: Forma 5 sin margen de silueta');
  assert.ok(finalFormFit.scale >= .34, '01c-final-form-fit: escala inválida');
  assert.equal(finalFormFit.backdrop, 'hoku-gate', '01c-final-form-fit: fondo V47A incorrecto');
  assert.equal(finalFormFit.scene, 'kilo', '01c-final-form-fit: afinidad inicial incorrecta');
  await capture(page, '01c-character-select-final-form-fit');
  await page.evaluate(() => { window.__OHANA_TITLE_EVO_OVERRIDE = null; });
  await page.waitForTimeout(120);

  // V53 Dragon art audit: each evolutionary silhouette must draw in the selector.
  for(let n=0;n<4;n++) await page.locator('#roster-next').click();
  await page.waitForTimeout(280);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'dragon','01e-dragon: selección no llega a Dragón');
  for(let form=0;form<5;form++){
    await page.evaluate((f)=>{window.__OHANA_TITLE_EVO_OVERRIDE=f;},form);
    await page.waitForTimeout(160);
    const image=await page.evaluate(()=>{
      const card=document.querySelector('#chars-grid .char-card.selected');
      const cv=card?.querySelector('canvas'),ctx=cv?.getContext('2d');
      const data=ctx&&cv.width&&cv.height?ctx.getImageData(0,0,cv.width,cv.height).data:null;
      let signal=0;
      if(data)for(let i=3;i<data.length;i+=64)if(data[i]>20)signal++;
      return {form:Number(cv?.dataset.evo??-1),scale:Number(cv?.dataset.fitScale||0),signal};
    });
    assert.equal(image.form,form,'01e-dragon: forma no renderizada '+form);
    assert.ok(image.scale>.2&&image.signal>10,'01e-dragon: silueta invisible o sin escala '+JSON.stringify(image));
    await capture(page,'01e-dragon-solar-form-'+(form+1));
  }
  await page.evaluate(()=>{window.__OHANA_TITLE_EVO_OVERRIDE=null;});
  for(let n=0;n<4;n++) await page.locator('#roster-prev').click();
  await page.waitForTimeout(280);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'kilo','01e-dragon: selector no vuelve a Kilo');

  // V54 Frita: capture each form without modifying the parallel Atrium intro.
  for(let n=0;n<6;n++) await page.locator('#roster-next').click();
  await page.waitForTimeout(240);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'frita','01f-frita: selección no llega a Frita');
  for(let form=0;form<5;form++){
    await page.evaluate((f)=>{window.__OHANA_TITLE_EVO_OVERRIDE=f;},form);
    await page.waitForTimeout(180);
    const image=await page.evaluate(()=>{
      const card=document.querySelector('#chars-grid .char-card.selected');
      const cv=card?.querySelector('canvas'),ctx=cv?.getContext('2d');
      const data=ctx&&cv.width&&cv.height?ctx.getImageData(0,0,cv.width,cv.height).data:null;
      let pixels=0;
      if(data)for(let i=3;i<data.length;i+=64)if(data[i]>20)pixels++;
      return {form:Number(cv?.dataset.evo??-1),scale:Number(cv?.dataset.fitScale||0),pixels};
    });
    assert.equal(image.form,form,'01f-frita: forma incorrecta '+form);
    assert.ok(image.scale>.2&&image.pixels>10,'01f-frita: silueta invisible '+JSON.stringify(image));
    await capture(page,'01f-frita-crispy-form-'+(form+1));
  }
  await page.evaluate(()=>{window.__OHANA_TITLE_EVO_OVERRIDE=null;});
  for(let n=0;n<6;n++) await page.locator('#roster-prev').click();
  await page.waitForTimeout(260);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'kilo','01f-frita: selector no vuelve a Kilo');

  // V55 Pizza: five genuine Canvas portraits at every evolution stage.
  for(let n=0;n<7;n++) await page.locator('#roster-next').click();
  await page.waitForTimeout(260);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'pizza','01g-pizza: selector does not reach Pizza');
  for(let form=0;form<5;form++){
    await page.evaluate(f=>{window.__OHANA_TITLE_EVO_OVERRIDE=f;},form);
    await page.waitForTimeout(180);
    const rendered=await page.evaluate(()=>{
      const card=document.querySelector('#chars-grid .char-card.selected');
      const cv=card?.querySelector('canvas'),ctx=cv?.getContext('2d');
      const bytes=ctx&&cv.width&&cv.height?ctx.getImageData(0,0,cv.width,cv.height).data:null;
      let visible=0;
      if(bytes)for(let i=3;i<bytes.length;i+=64)if(bytes[i]>20)visible++;
      return {form:Number(cv?.dataset.evo??-1),scale:Number(cv?.dataset.fitScale||0),
        growth:Number(cv?.dataset.cuernoGrowth||0),visible};
    });
    assert.equal(rendered.form,form,'01g-pizza: unexpected form '+form);
    assert.ok(rendered.scale>.2&&rendered.visible>10,'01g-pizza: missing slice pixels '+JSON.stringify(rendered));
    await capture(page,'01g-pizza-molten-form-'+(form+1));
  }
  await page.evaluate(()=>{window.__OHANA_TITLE_EVO_OVERRIDE=null;});
  for(let n=0;n<7;n++) await page.locator('#roster-prev').click();
  await page.waitForTimeout(260);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'kilo','01g-pizza: selector did not return to Kilo');

  // V56 Yomi: verify the guardian-lantern is legible across five evolution silhouettes.
  for(let n=0;n<8;n++) await page.locator('#roster-next').click();
  await page.waitForTimeout(230);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'yomi','01h-yomi: selector does not reach Yomi');
  for(let form=0;form<5;form++){
    await page.evaluate(f=>{window.__OHANA_TITLE_EVO_OVERRIDE=f;},form);
    await page.waitForTimeout(160);
    const render=await page.evaluate(()=>{
      const card=document.querySelector('#chars-grid .char-card.selected');
      const cv=card?.querySelector('canvas'),ctx=cv?.getContext('2d');
      const bytes=ctx&&cv.width&&cv.height?ctx.getImageData(0,0,cv.width,cv.height).data:null;
      let pixels=0;
      if(bytes)for(let i=3;i<bytes.length;i+=64)if(bytes[i]>20)pixels++;
      return {form:Number(cv?.dataset.evo??-1),scale:Number(cv?.dataset.fitScale||0),pixels};
    });
    assert.equal(render.form,form,'01h-yomi: unexpected form '+form);
    assert.ok(render.scale>.2&&render.pixels>10,'01h-yomi: blank or cropped guardian '+JSON.stringify(render));
    await capture(page,'01h-yomi-guardian-form-'+(form+1));
  }
  await page.evaluate(()=>{window.__OHANA_TITLE_EVO_OVERRIDE=null;});
  for(let n=0;n<8;n++) await page.locator('#roster-prev').click();
  await page.waitForTimeout(260);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'kilo','01h-yomi: selector did not return to Kilo');

  // V59 Cuerno: the baby is a living horn, not a four-legged ball.
  for(let i=0;i<9;i++) await page.locator('#roster-next').click();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'cuerno','01i-cuerno: selector does not reach Cuerno');
  let cuernoLastGrowth=0;
  for(const form of [0,1,2,3,4]){
    await page.evaluate(f=>{window.__OHANA_TITLE_EVO_OVERRIDE=f;},form);
    await page.waitForTimeout(220);
    const state=await page.evaluate(()=>{
      const card=document.querySelector('#chars-grid .char-card.selected');
      const cv=card?.querySelector('canvas'),ctx=cv?.getContext('2d');
      const bytes=ctx&&cv.width&&cv.height?ctx.getImageData(0,0,cv.width,cv.height).data:null;
      let visible=0;
      if(bytes)for(let i=3;i<bytes.length;i+=64)if(bytes[i]>20)visible++;
      return {form:Number(cv?.dataset.evo??-1),scale:Number(cv?.dataset.fitScale||0),growth:Number(cv?.dataset.cuernoGrowth||0),visible};
    });
    assert.equal(state.form,form,'01i-cuerno: wrong form');
    assert.ok(state.scale>.2&&state.visible>12,'01i-cuerno: blank or cropped '+JSON.stringify(state));
    assert.ok(state.growth>.6&&state.growth<=1,'01i-cuerno: invalid stage growth '+JSON.stringify(state));
    if(form>0)assert.ok(state.growth>cuernoLastGrowth,'01i-cuerno: portrait progression reversed');
    cuernoLastGrowth=state.growth;
    await capture(page,'01i-cuerno-origin-form-'+(form+1));
    if(form===1) await capture(page,'01j-cuerno-destello-first-metamorphosis');
    if(form===2) await capture(page,'01l-cuerno-rainbow-foal-complete');
    if(form===3) await capture(page,'01k-cuerno-stellar-unicorn-adult');
    if(form===4) await capture(page,'01m-cuerno-aurora-final');
  }
  // V66 Cuerno soul: each authored comic beat is really drawn in the selector.
  await page.evaluate(()=>{window.__OHANA_TITLE_EVO_OVERRIDE=4;});
  for(const beat of ['curious','shy','prance','stargaze','sneeze','bow']){
    await page.evaluate(s=>{window.__OHANA_TITLE_CUERNO_BEAT=s;},beat);
    await page.waitForTimeout(180);
    const actual=await page.evaluate(()=>{
      const cv=document.querySelector('#chars-grid .char-card.selected canvas');
      return {beat:cv?.dataset.cuernoBeat,evo:Number(cv?.dataset.evo)};
    });
    assert.equal(actual.beat,beat,'01n-cuerno: showcase beat missing');
    assert.equal(actual.evo,4,'01n-cuerno: final form absent');
    await capture(page,'01n-cuerno-soul-'+beat);
  }
  // V67 four real horn-origin spells in the selector at final evolution.
  await page.evaluate(()=>{window.__OHANA_TITLE_CUERNO_BEAT=null;});
  for(const slot of [0,1,2,3]){
    await page.evaluate(n=>{
      window.__OHANA_TITLE_EVO_OVERRIDE=4;
      window.__OHANA_TITLE_CUERNO_MAGIC=n;
    },slot);
    await page.waitForTimeout(180);
    const actual=await page.evaluate(()=>{
      const card=document.querySelector('#chars-grid .char-card.selected');
      const cv=card?.querySelector('canvas');
      return {hero:card?.dataset.id||card?.querySelector('canvas')?.dataset.id,
        slot:Number(cv?.dataset.cuernoMagic),form:Number(cv?.dataset.evo)};
    });
    assert.equal(actual.slot,slot,'01o-cuerno: wrong magic slot');
    assert.equal(actual.form,4,'01o-cuerno: missing Aurora');
    await capture(page,'01o-cuerno-magia-viva-'+['j','k','l','u'][slot]);
  }
  // V69: verify victory is animated, not silently disabled when flourish is zero.
  // Compare genuine Canvas pixels with the hurt pose in each of the five forms.
  for(let form=0;form<5;form++){
    const samples=[];
    for(const pose of ['victory','hurt']){
      await page.evaluate(({f,p})=>{
        window.__OHANA_TITLE_EVO_OVERRIDE=f;
        window.__OHANA_TITLE_CUERNO_MAGIC=null;
        window.__OHANA_TITLE_CUERNO_BEAT=null;
        window.__OHANA_TITLE_CUERNO_STATE=p;
      },{f:form,p:pose});
      await page.waitForTimeout(170);
      const sample=await page.evaluate(()=>{
        const cv=document.querySelector('#chars-grid .char-card.selected canvas');
        const pixels=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
        let hash=2166136261;
        for(let i=0;i<pixels.length;i+=16)hash=Math.imul(hash^pixels[i],16777619)>>>0;
        return {state:cv.dataset.cuernoState,form:Number(cv.dataset.evo),hash};
      });
      assert.equal(sample.state,pose,'01p-cuerno: wrong QA pose');
      assert.equal(sample.form,form,'01p-cuerno: wrong evolution');
      samples.push(sample.hash);
      if(pose==='victory')await capture(page,'01p-cuerno-victory-form-'+(form+1));
    }
    assert.notEqual(samples[0],samples[1],'01p-cuerno: victory identical to injured form '+form);
  }
  await page.evaluate(()=>{
    window.__OHANA_TITLE_EVO_OVERRIDE=null;
    window.__OHANA_TITLE_CUERNO_BEAT=null;
    window.__OHANA_TITLE_CUERNO_MAGIC=null;
    window.__OHANA_TITLE_CUERNO_STATE=null;
  });
  for(let i=0;i<9;i++) await page.locator('#roster-prev').click();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('#char-select').getAttribute('data-hero'),'kilo','01i-cuerno: selector did not restore');

  await page.evaluate(() => { window.__OHANA_TITLE_STITCHO_PHASE = 60; });
  await page.locator('#roster-next').click();
  await page.waitForTimeout(520);
  const livingSelect = await page.evaluate(() => ({
    hero:document.querySelector('#char-select')?.dataset.hero || '',
    atriumOn:document.querySelector('#char-select')?.classList.contains('atrium-on') || false,
    scene:document.querySelector('#title-fx')?.dataset.heroScene || '',
    stitchoBeat:document.querySelector('#chars-grid .char-card.selected')?.dataset.stitchoBeat || '',
    visible:[...document.querySelectorAll('#chars-grid .char-card')].filter((card) => {
      const s=getComputedStyle(card),r=card.getBoundingClientRect();
      return s.display!=='none' && s.visibility!=='hidden' && r.width>2 && r.height>2;
    }).map((card)=>card.dataset.id)
  }));
  assert.equal(livingSelect.hero, 'stitcho', '01b-living-select: selección no avanza a Stitcho');
  assert.equal(livingSelect.scene, 'stitcho', '01b-living-select: fondo no reacciona al héroe');
  assert.equal(livingSelect.visible.length, livingSelect.atriumOn ? 10 : 5, '01b-living-select: profundidad Atrium/carrusel incorrecta');
  assert.equal(livingSelect.stitchoBeat, 'plasma-roll', '01d-stitcho: coreografía de selector incorrecta');
  await capture(page, '01b-character-select-stitcho-world');
  await capture(page, '01d-stitcho-plasma-roll');
  await page.evaluate(() => { window.__OHANA_TITLE_STITCHO_PHASE = null; });
  await page.locator('#roster-prev').click();
  await page.waitForTimeout(420);

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
  assert.equal(enemyState.enemyDirector?.ecology, 'circuit', '15-enemy-ecology: bioma de Lab incorrecto');
  assert.equal(enemyState.enemyDirector?.formation, 'CIRCUIT', '15-enemy-ecology: formación de Lab incorrecta');
  assert.ok(enemyState.enemyAI.every((e) => e.biome === 'circuit' && e.formation === 'CIRCUIT'), '15-enemy-ecology: lectura ecológica incompleta');
  assert.ok(enemyState.enemyAI.every((e) => e.family && e.signature && e.variant && e.speciesMode), '16-enemy-species: identidad de especie incompleta');
  assert.ok(enemyState.enemyAI.some((e) => e.relation && e.relation !== 'NONE'), '16-enemy-species: relaciones cooperativas ausentes');
  await capture(page, '03-room-lab');
  await capture(page, '03b-enemy-intelligence');
  await capture(page, '15-enemy-ecology-circuit');
  await capture(page, '16-enemy-species-evolution');

  // V39 · Cloudstep visible y físicamente activo.
  const cloudSetup = await page.evaluate(() => {
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
    if (!cloud) throw new Error('11-cloudstep: no hay nube de maestría');
    api.setPlayer(cloud.x + 24, cloud.y - 96);
    api.setPlayerVelocity(0, 7);
    return cloud;
  });
  const cloudState = await page.evaluate(() => {
    const api = window.__OHANA_E2E;
    let state = api.state();
    for (let i = 0; i < 48 && !state.mastery?.cloud; i++) state = api.step(1);
    return state;
  });
  assert.equal(
    cloudState.mastery?.cloud,
    true,
    '11-cloudstep: Chispín no pisa su nube · ' + JSON.stringify({ player:cloudState.player, cloud:cloudSetup, mastery:cloudState.mastery, input:cloudState.input })
  );
  assert.equal(cloudState.player?.grounded, true, '11-cloudstep: la nube no sostiene a Chispín');
  assert.ok(Math.abs((cloudState.player.y + 36) - cloudSetup.y) < 12, '11-cloudstep: geometría de nube inválida');
  await page.waitForTimeout(80);
  await capture(page, '11-hero-mastery-cloudstep');

  // V39 · Batida de Alas visible después de consumir los saltos normales.
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
  const wingState = await page.evaluate(() => window.__OHANA_E2E.step(1));
  assert.ok(wingState.mastery?.wingUsed >= 1, '12-wingbeat: Dragón no activa la batida extra');
  assert.equal(wingState.mastery?.move, 'wingbeat', '12-wingbeat: señal visual de batida ausente');
  await page.waitForTimeout(40);
  await capture(page, '12-hero-mastery-wingbeat');
  await page.keyboard.up('Space');
  await page.evaluate(() => window.__OHANA_E2E.step(1));

  // V40 · Living Worlds: las diez salas se auditan con su héroe afín.
  const livingPairs = [
    ['hub','kilo'],
    ['beach','frita'],
    ['jungle','stitcho'],
    ['cave','cat'],
    ['lab','chispin'],
    ['ridge','cuerno'],
    ['space','yomi'],
    ['reef','pizza'],
    ['volcano','dragon'],
    ['boss','dino'],
  ];
  for (const [room, hero] of livingPairs) {
    const living = await page.evaluate(({ room, hero }) => {
      const api = window.__OHANA_E2E;
      api.start(hero);
      api.setEvo(4);
      api.loadRoom(room);
      api.setInvulnerable(600);
      api.step(4);
      const cinema = document.querySelector('#world-cinema');
      if (cinema) {
        cinema.classList.remove('show');
        cinema.setAttribute('aria-hidden', 'true');
      }
      const notice = document.querySelector('#notification-container');
      if (notice) notice.replaceChildren();
      return api.state();
    }, { room, hero });
    assert.equal(living.roomId, room, 'V40 living: sala incorrecta ' + room);
    assert.equal(living.livingWorld?.hero, hero, 'V40 living: afinidad canónica incorrecta ' + room);
    assert.equal(living.livingWorld?.affinity, true, 'V40 living: la sala no reacciona a ' + hero);
    await page.waitForTimeout(45);
    await capture(page, '13-living-' + room + '-' + hero);
  }

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

  await page.evaluate(() => {
    dispatchEvent(new CustomEvent('ohana-evolve', { detail: {
      id:'dragon', name:'Dragón', evo:4, fromEvo:3,
      fromName:'Dragón Ascendido', toName:'Dragón Nova', color:'#ff8a45', final:true
    }}));
  });
  await page.waitForTimeout(1750);
  assert.equal(await page.locator('#evo-stage').evaluate((el) => el.classList.contains('show')), true, '04b-final-evolution: ascensión no visible');
  await capture(page, '04b-final-evolution-ascension');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);

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
  assert.equal(await page.locator('#map-grid .world-map-v40').count(), 1, '06-map: World Graph V40 ausente');
  assert.equal(await page.locator('#map-grid .wm-node').count(), 10, '06-map: World Graph incompleto');
  assert.ok(await page.locator('#map-grid .wm-edge.wm-catapult').count() >= 1, '06-map: ruta catapulta ausente');
  assert.ok(await page.locator('#map-grid .wm-edge.wm-vortex').count() >= 1, '06-map: ruta vórtice ausente');
  await capture(page, '06-map');
  await capture(page, '14-world-graph-v40');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  await page.locator('#btn-help').click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#help').getAttribute('aria-hidden'), 'false', '07-help: ayuda no visible');
  await capture(page, '07-help');
  await page.locator('#btn-close-help').click();

  await page.evaluate(() => dispatchEvent(new CustomEvent('ohana-win', { detail: {
    id:'kilo', evo:4, hero:'Kilo', form:'Kilo Flor Solar', rank:'S', time:'03:21', kills:42, best:'03:21'
  }})));
  await page.waitForTimeout(2450);
  const endingState = await page.locator('#win-cinema').evaluate((el) => ({
    show:el.classList.contains('show'),
    running:el.classList.contains('cinema-running'),
    mode:el.dataset.ending || ''
  }));
  assert.equal(endingState.show, true, '08-ending: final no visible');
  assert.equal(endingState.running, true, '08-ending: resultados sustituyen al cine');
  assert.equal(endingState.mode, 'v44-true-ending', '08-ending: final V44 no activo');
  await capture(page, '08-ending');
  await page.locator('#win-cinema .win-skip').click();
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#win-cinema').evaluate((el) => el.classList.contains('cinema-complete')), true, '08-ending: resultados no aparecen tras el cine');
  await page.locator('#win-continue').click();
  await page.waitForTimeout(100);

  await page.evaluate(() => window.__OHANA_E2E.start('kilo'));
  await page.evaluate(() => window.__OHANA_E2E.setEvo(4));
  await page.evaluate(() => window.__OHANA_E2E.setCombo(10));
  const previousSupremeGeneration = await page.evaluate(() => Number(document.querySelector('#supreme-cinema')?.dataset.generation || 0));
  const supremeAttempt = await page.evaluate(() => {
    const state = window.__OHANA_E2E.cast(3);
    const el = document.querySelector('#supreme-cinema');
    return {
      state,
      cinema: el ? {
        generation:Number(el.dataset.generation || 0),
        state:el.dataset.state || '',
        hidden:el.getAttribute('aria-hidden'),
        show:el.classList.contains('show'),
        duration:Number(el.dataset.duration || 0),
        mode:el.dataset.mode || '',
        story:el.dataset.story || '',
        camera:el.dataset.camera || '',
        beat:el.dataset.beat || '',
        assist:el.dataset.assist || ''
      } : null
    };
  });
  const supremeState = supremeAttempt.state;
  assert.equal(supremeState.lastAbilitySlot, 3, '09-supreme: U no se lanza como slot 3 · ' + JSON.stringify(supremeAttempt));
  assert.equal(supremeState.assist, 'stitcho', '09-supreme: OHANA ASSIST no invoca a Stitcho para Kilo · ' + JSON.stringify(supremeAttempt));
  assert.ok(supremeAttempt.cinema?.generation > previousSupremeGeneration, '09-supreme: la cinemática U no incrementa generación · ' + JSON.stringify(supremeAttempt));
  assert.equal(supremeAttempt.cinema?.state, 'active', '09-supreme: U no entra en active de forma síncrona · ' + JSON.stringify(supremeAttempt));
  // La activación ya se valida de forma síncrona arriba. No esperamos aquí:
  // un runner CI cargado puede reanudar Playwright después de que expire el
  // temporizador real de la cinemática y convertir una prueba visual en una
  // carrera de reloj de pared.
  const supremeCinemaState = await page.locator('#supreme-cinema').evaluate((el) => ({
    show: el.classList.contains('show'),
    state: el.dataset.state,
    hidden: el.getAttribute('aria-hidden'),
    duration: Number(el.dataset.duration || 0),
    mode:el.dataset.mode || '',
    story:el.dataset.story || '',
    camera:el.dataset.camera || '',
    beat:el.dataset.beat || '',
    assist:el.dataset.assist || ''
  }));
  assert.equal(supremeCinemaState.duration >= 1500, true, '09-supreme: duración cinematográfica insuficiente');
  assert.equal(supremeCinemaState.mode, 'storyboard', '09-supreme: no usa gramática V48');
  assert.equal(supremeCinemaState.story, 'pollen-bonk', '09-supreme: storyboard de Kilo incorrecto');
  assert.equal(supremeCinemaState.camera, 'rise', '09-supreme: cámara de Kilo incorrecta');
  assert.equal(supremeCinemaState.assist, 'stitcho', '09-supreme: assist no entra en el mini-film');
  assert.match(await page.locator('.ability-slot[data-supreme="1"] .name').textContent(), /OHANA SOLAR/, '09-supreme: HUD no muestra el nombre de U');
  await page.waitForTimeout(620);
  await capture(page, '09-supreme-u-assist');
  await page.waitForFunction(() => document.querySelector('#supreme-cinema')?.dataset.state === 'idle', null, { timeout: 3600 });

  await page.evaluate(() => {
    const api=window.__OHANA_E2E;
    api.start('yomi');
    api.setEvo(4);
    api.setCombo(0);
    api.cast(3);
  });
  await page.waitForTimeout(1600);
  const yomiSupreme = await page.locator('#supreme-cinema').evaluate((el) => ({
    mode:el.dataset.mode || '',story:el.dataset.story || '',camera:el.dataset.camera || '',active:el.dataset.activeId || '',
    assist:el.dataset.assist || '',duration:Number(el.dataset.duration || 0)
  }));
  assert.equal(yomiSupreme.active, 'yomi', '09b-supreme: héroe incorrecto');
  assert.equal(yomiSupreme.mode, 'storyboard', '09b-supreme: Yomi no usa storyboard');
  assert.equal(yomiSupreme.story, 'void-looks-back', '09b-supreme: gag de Yomi incorrecto');
  assert.equal(yomiSupreme.camera, 'pull', '09b-supreme: cámara de Yomi incorrecta');
  assert.equal(yomiSupreme.assist, 'cuerno', '09b-supreme: Cuerno ausente de la escena Yomi');
  assert.ok(yomiSupreme.duration >= 3800, '09b-supreme: Cuerno no tiene tiempo para actuar');
  await capture(page, '09b-supreme-yomi-story');
  await page.waitForFunction(() => document.querySelector('#supreme-cinema')?.dataset.state === 'idle', null, { timeout: 6800 });

  // V55 real U smoke test: catch runtime errors while Pizza's oven cinema draws.
  const pizzaCinemaErrors=[];
  const onPizzaError=(error)=>pizzaCinemaErrors.push(String(error.message||error));
  page.on('pageerror',onPizzaError);
  await page.evaluate(()=>{
    const api=window.__OHANA_E2E;
    api.start('pizza');api.setEvo(4);api.setCombo(0);api.cast(3);
  });
  await page.waitForTimeout(520);
  const pizzaU=await page.locator('#supreme-cinema').evaluate(el=>({
    active:el.dataset.activeId||'',story:el.dataset.story||'',mode:el.dataset.mode||''
  }));
  assert.equal(pizzaU.active,'pizza','09c-pizza-u: actor incorrecto');
  assert.equal(pizzaU.story,'oven-too-hot','09c-pizza-u: storyboard incorrecto');
  assert.equal(pizzaU.mode,'storyboard','09c-pizza-u: formato incorrecto');
  assert.deepEqual(pizzaCinemaErrors,[],'09c-pizza-u: error runtime en cinema');
  await capture(page,'09c-supreme-pizza-molten');
  await page.waitForFunction(()=>document.querySelector('#supreme-cinema')?.dataset.state==='idle',null,{timeout:3600});
  page.off('pageerror',onPizzaError);
  assert.deepEqual(pizzaCinemaErrors,[],'09c-pizza-u: error runtime al finalizar');

  // V56 J smoke: verify real casting and a simulation tick, not just string assertions.
  const jErrors=[];
  const onJError=err=>jErrors.push(String(err.message||err));
  page.on('pageerror',onJError);
  const jState=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;
    api.start('yomi');api.setEvo(3);api.cast(0);api.step(3);
    return api.state();
  });
  assert.equal(jState.lastAbilityId,'ofuda','09d-yomi-j: incorrect talisman ability');
  assert.equal(jState.lastAbilitySlot,0,'09d-yomi-j: J cast did not activate');
  assert.deepEqual(jErrors,[],'09d-yomi-j: runtime error after casting J');
  await capture(page,'09d-yomi-j-guardian-seal');
  page.off('pageerror',onJError);

  // V57 K/L smoke: cast both powers and catch actual browser runtime faults.
  const yomiPowerErrors=[];
  const onYomiError=err=>yomiPowerErrors.push(String(err.message||err));
  page.on('pageerror',onYomiError);
  const yomiK=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;api.start('yomi');api.setEvo(4);api.cast(1);api.step(3);return api.state();
  });
  assert.equal(yomiK.lastAbilityId,'sleeve','09e-yomi-k: no lanza mangas imán');
  assert.equal(yomiK.lastAbilitySlot,1,'09e-yomi-k: ranura K equivocada');
  await capture(page,'09e-yomi-k-visible-suction');
  const yomiL=await page.evaluate(()=>{const api=window.__OHANA_E2E;api.cast(2);api.step(6);return api.state();});
  assert.equal(yomiL.lastAbilityId,'maw','09f-yomi-l: no lanza mordida lunar');
  assert.equal(yomiL.lastAbilitySlot,2,'09f-yomi-l: ranura L equivocada');
  await capture(page,'09f-yomi-l-visible-jaws');
  assert.deepEqual(yomiPowerErrors,[],'09e/09f: K/L causó un error de ejecución');
  page.off('pageerror',onYomiError);

  // V65 circular rainbow L and boss-safe sleep U: cast in the actual Chromium game.
  const dreamErrors=[];
  const onDreamError=err=>dreamErrors.push(String(err.message||err));
  page.on('pageerror',onDreamError);
  const irisL=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;
    api.start('cuerno');api.setEvo(4);api.cast(2);api.step(9);return api.state();
  });
  assert.equal(irisL.lastAbilityId,'rainbow','09k-cuerno: L did not cast rainbow');
  assert.equal(irisL.lastAbilitySlot,2,'09k-cuerno: wrong L slot');
  await capture(page,'09k-cuerno-iris-fullscreen-l');
  const dreamU=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;api.cast(3);api.step(18);return api.state();
  });
  assert.equal(dreamU.lastAbilityId,'aurora','09l-cuerno: U not activated');
  assert.equal(dreamU.lastAbilitySlot,3,'09l-cuerno: wrong U slot');
  await capture(page,'09l-cuerno-rainbow-sleep-u');
  // V68: the real U has its own four-stage cinematic, not just a generic overlay.
  const cuernoCinema=await page.locator('#supreme-cinema').evaluate(el=>({
    id:el.dataset.activeId,story:el.dataset.story,phase:el.dataset.cuernoPhase,
    beat:el.dataset.beat,mode:el.dataset.mode,
    dreamTargets:Number(el.dataset.dreamTargets||0),
    finalForm:el.dataset.cuernoFinal
  }));
  assert.equal(cuernoCinema.id,'cuerno','09p-cuerno: wrong cinematic hero');
  assert.equal(cuernoCinema.story,'dream-rainbow','09p-cuerno: wrong U sequence');
  assert.equal(cuernoCinema.finalForm,'aurora','09r-cuerno: F4 film lacks final form crest');
  assert.equal(cuernoCinema.mode,'storyboard','09p-cuerno: wrong cinematic mode');
  assert.ok(Number.isInteger(cuernoCinema.dreamTargets)&&cuernoCinema.dreamTargets>=0,
    '09q-cuerno: U cinema missing real sleeper count');
  assert.ok(['breath','iris','dream','aurora'].includes(cuernoCinema.phase),'09p-cuerno: four acts absent');
  assert.match(cuernoCinema.beat,/ALIENTO.*CÍRCULO.*SUEÑO.*AURORA/);
  await capture(page,'09p-cuerno-u-grand-spectacle');
  // QA-only: briefly hide the film to capture the actual world while U is still alive.
  // Waiting until the 2.12 s film ends would miss a 150-tick gameplay field.
  const cinemaMask=await page.addStyleTag({content:'#supreme-cinema{visibility:hidden!important}'});
  await capture(page,'09r-cuerno-aurora-final-u-canopy');
  await cinemaMask.evaluate(tag=>tag.remove());
  assert.deepEqual(dreamErrors,[],'09k/09l: Cuerno L/U runtime exception');
  page.off('pageerror',onDreamError);

  // V64 Aurora final in real gameplay. No physics or hitbox mutation.
  const auroraErrors=[];
  const onAuroraError=err=>auroraErrors.push(String(err.message||err));
  page.on('pageerror',onAuroraError);
  const aurora=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;
    api.start('cuerno');api.setEvo(4);api.setPlayerVelocity(9,-8);api.step(16);
    return api.state();
  });
  assert.equal(aurora.evo,4,'09j-cuerno: missing Unicornio Aurora');
  assert.ok(Number.isFinite(aurora.player?.x),'09j-cuerno: invalid movement');
  await capture(page,'09j-cuerno-aurora-real-play');
  assert.deepEqual(auroraErrors,[],'09j-cuerno: draw error in final form');
  page.off('pageerror',onAuroraError);
  // V73 child's final edition: capture the actual J/K choreography, not static art.
  const finalJ=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;
    api.start('cuerno');api.setEvo(4);api.cast(0);api.step(5);return api.state();
  });
  assert.equal(finalJ.lastAbilityId,'gleam','09s-cuerno: astral lance J not cast');
  await capture(page,'09s-cuerno-v73-pearlescent-j');
  const finalK=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;api.cast(1);api.step(5);return api.state();
  });
  assert.equal(finalK.lastAbilityId,'gallop','09t-cuerno: radiant gallop K not cast');
  await capture(page,'09t-cuerno-v73-ribbon-gallop-k');

  // V63 Potro Iris in real gameplay with error monitoring.
  const foalErrors=[];
  const onFoalError=err=>foalErrors.push(String(err.message||err));
  page.on('pageerror',onFoalError);
  const foalStage=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;
    api.start('cuerno');api.setEvo(2);api.setPlayerVelocity(7,-8);api.step(16);
    return api.state();
  });
  assert.equal(foalStage.evo,2,'09i-cuerno: falta Potro Iris');
  assert.ok(Number.isFinite(foalStage.player?.x),'09i-cuerno: movimiento inválido');
  await capture(page,'09i-cuerno-rainbow-foal-real-play');
  assert.deepEqual(foalErrors,[],'09i-cuerno: error dibujando Potro Iris');
  page.off('pageerror',onFoalError);

  // V62 real adult motion and game transition: no browser exceptions at form 3.
  const stellarErrors=[];
  const onStellarError=err=>stellarErrors.push(String(err.message||err));
  page.on('pageerror',onStellarError);
  const stellar=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;
    api.start('cuerno');api.setEvo(3);api.setPlayerVelocity(7,-6);api.step(15);
    return api.state();
  });
  assert.equal(stellar.evo,3,'09h-cuerno: falta la forma Estelar');
  assert.ok(Number.isFinite(stellar.player?.x),'09h-cuerno: movimiento Estelar inválido');
  await capture(page,'09h-cuerno-stellar-real-play');
  assert.deepEqual(stellarErrors,[],'09h-cuerno: error dibujando Estelar en movimiento');
  page.off('pageerror',onStellarError);

  // V60 actual gameplay: first metamorphosis must draw in motion, not only in the roster.
  const cuernoErrors=[];
  const onCuernoError=err=>cuernoErrors.push(String(err.message||err));
  page.on('pageerror',onCuernoError);
  const cuernoStage=await page.evaluate(()=>{
    const api=window.__OHANA_E2E;
    api.start('cuerno');api.setEvo(1);api.step(8);
    return api.state();
  });
  assert.equal(cuernoStage.evo,1,'09g-cuerno: metamorfosis no aplicada');
  assert.ok(cuernoStage.player && Number.isFinite(cuernoStage.player.x),'09g-cuerno: personaje no activo');
  assert.deepEqual(cuernoErrors,[],'09g-cuerno: excepción al dibujar la forma naciente');
  await capture(page,'09g-cuerno-naciente-gameplay');
  page.off('pageerror',onCuernoError);

  await page.evaluate(() => window.__OHANA_E2E.die('hurt'));
  await page.evaluate(() => window.__OHANA_E2E.step(88));
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#cinematic-beat').count(), 0, '10-death-ghost: V44 no debe montar tarjeta fullscreen de muerte');
  await capture(page, '10-death-ghost');

  await browser.close();
  console.log('OHANA VISUAL MATRIX PASS');
  console.log('Screenshots: ' + screenshots.join(', '));
} finally {
  server.close();
}
