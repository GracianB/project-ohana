import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium, devices } from 'playwright';
import { startServer } from './server.mjs';

const server = await startServer(0);
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  for (const [name, options] of [
    ['desktop', {viewport:{width:1280,height:800}}],
    ['mobile', devices['iPhone 13']],
  ]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    // This audit cannot consume any Netlify quota or rely on hosted fonts.
    await context.route('**/*', async route => {
      const url = route.request().url();
      if (url.startsWith(origin) && !url.includes('/.netlify/')) return route.continue();
      external.push(url);
      return route.abort();
    });
    await page.goto(origin+'/?e2e=1', {waitUntil:'networkidle'});
    await page.waitForFunction(() => !!window.__OHANA_E2E);
    await page.locator('#ohana-intro .oi-enter').click();
    await page.locator('#ohana-intro').waitFor({state:'detached'});
    const fonts = await page.evaluate(async () => {
      await Promise.all([document.fonts.load('700 20px Fredoka'), document.fonts.load('600 16px Outfit')]);
      return document.fonts.check('700 20px Fredoka') && document.fonts.check('600 16px Outfit');
    });
    assert.equal(fonts, true, name+': local fonts failed');
    const forms = await page.evaluate(() => {
      const api=window.__OHANA_E2E, results=[];
      for (const id of ['kilo','stitcho','chispin','cat','dragon','dino','frita','pizza','yomi','cuerno']) {
        api.start(id);api.setInvulnerable(600);
        for (let evo=0;evo<5;evo++) {
          api.setEvo(evo);api.step(12);
          const s=api.state();results.push({id,evo:s.evo,faults:s.runtimeFaults,x:s.player.x});
        }
      }
      return results;
    });
    assert.equal(forms.length,50);
    assert.ok(forms.every(s=>Number.isFinite(s.x)&&s.faults===0));
    await page.evaluate(() => {
      const api=window.__OHANA_E2E;api.start('kilo');
      // Queue a second strike within the first one, then pause synchronously.
      for(let i=0;i<2;i++)window.dispatchEvent(new KeyboardEvent('keydown',{key:'h'}));
      window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));
    });
    await page.locator('#pause-overlay.open').waitFor();
    const paused=await page.evaluate(()=>window.__OHANA_E2E.state());
    assert.equal(paused.paused,true);
    assert.deepEqual(paused.bufferedActions,{jump:0,dash:0,attack:0});
    await page.locator('#btn-resume').click();
    assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().paused),false);

    const idleWrites=await page.evaluate(async()=>{
      const {ExperienceDirector}=await import('/systems/experience.js');
      const d=new ExperienceDirector();d.ui=document.createElement('div');
      d.uiTitle=document.createElement('strong');d.uiNote=document.createElement('span');
      d.uiBar=document.createElement('i');d.ui.append(d.uiTitle,d.uiNote,d.uiBar);
      const g={combo:0,enemies:[],reduceMotion:false};d.update(g);
      const observer=new MutationObserver(()=>{});
      observer.observe(d.ui,{subtree:true,attributes:true,childList:true,characterData:true});
      observer.observe(document.body,{attributes:true});
      for(let i=0;i<120;i++)d.update(g);
      const count=observer.takeRecords().length;observer.disconnect();return count;
    });
    assert.equal(idleWrites,0,name+': idle UI still mutates every tick');
    const layout=await page.evaluate(()=>{
      const bounds=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom};};
      return {width:innerWidth,client:document.documentElement.clientWidth,hud:bounds('#hud'),
        cards:[...document.querySelectorAll('#hud .hud-block')].map(el=>{const r=el.getBoundingClientRect();return {x:r.x,right:r.right};}),
        keyboardHint:getComputedStyle(document.querySelector('#controls-hint')).display};
    });
    assert.ok(layout.cards.every(r=>r.x>=0&&r.right<=layout.client+1),name+': HUD overflows '+JSON.stringify(layout));
    if(name==='mobile')assert.equal(layout.keyboardHint,'none');
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!window.__OHANA_E2E);
    await page.locator('#ohana-intro .oi-enter').click();
    await page.locator('#ohana-intro').waitFor({state:'detached'});
    const offline=await page.evaluate(async()=>{
      await document.fonts.ready;
      const api=window.__OHANA_E2E;api.start('kilo');api.step(30);
      return {state:api.state(),fonts:document.fonts.check('700 20px Fredoka')&&document.fonts.check('600 16px Outfit')};
    });
    assert.equal(offline.fonts,true,name+': offline typography lost');
    assert.equal(offline.state.runtimeFaults,0);
    assert.ok(Number.isFinite(offline.state.player.x));
    const canvasFit=await page.evaluate(()=>{
      const c=document.querySelector('#game'),r=c.getBoundingClientRect();
      return {height:r.height,viewport:innerHeight,ratio:r.width/r.height,bufferRatio:c.width/c.height};
    });
    assert.ok(Math.abs(canvasFit.height-canvasFit.viewport)<2,name+': cropped canvas '+JSON.stringify(canvasFit));
    assert.ok(Math.abs(canvasFit.ratio-canvasFit.bufferRatio)<.01,name+': distorted canvas');
    await fs.mkdir('test-results/visual',{recursive:true});
    await page.screenshot({path:`test-results/visual/local-experience-${name}.png`});
    if(name==='mobile') {
      for(const size of [{width:320,height:568},{width:844,height:390}]) {
        await page.setViewportSize(size);await page.waitForTimeout(100);
        const fit=await page.evaluate(()=>{
          const c=document.querySelector('#game'),r=c.getBoundingClientRect();
          return {width:document.documentElement.clientWidth,height:innerHeight,canvas:r.height,
            cards:[...document.querySelectorAll('#hud .hud-block')].map(el=>{const b=el.getBoundingClientRect();return {x:b.x,right:b.right};})};
        });
        assert.ok(fit.cards.every(r=>r.x>=0&&r.right<=fit.width+1),JSON.stringify(fit));
        assert.ok(Math.abs(fit.canvas-fit.height)<2,JSON.stringify(fit));
      }
    }
    assert.deepEqual(errors,[],name+': browser exceptions');
    assert.deepEqual(external,[],name+': unexpected external dependency');
    console.log(`PASS local experience ${name}: 50 forms, pause buffers, zero idle UI writes, fonts and offline gameplay`);
    await context.close();
  }
} finally {
  await browser?.close();server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
