// Focused browser acceptance for Dino/Dragon. This is intentionally separate
// from the full campaign, whose older selector/intro failures are tracked in #452.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

const server=await startServer(0);
let browser;
try {
  browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
  await fs.mkdir('test-results/dino-dragon',{recursive:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.clock.install({time:new Date('2026-11-09T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-09T12:00:01Z'));
  const base='http://127.0.0.1:'+server.address().port+'/';
  await page.goto(base+'?e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.__OHANA_E2E);

  const results=[];
  for(const world of ['dino','dragon']){
    const observation=await page.evaluate(async world=>{
      const source=world==='dino'
       ? await import('/systems/dino-chapter-art-v613.js')
       : await import('/systems/dragon-chapter-art-v611.js');
      const draw=world==='dino'?source.drawDinoCreature:source.drawDragonCreature;
      const roster=world==='dino'
       ? [['cucaracho','PERSECUCIÓN'],['rana','SALTO'],['cangrejo','ESCUDO'],['libelula','VUELO'],['abeja','DISPARO']]
       : [['escoria','PERSECUCIÓN'],['rana','SALTO'],['planta','ESCUDO'],['murcielago','VUELO'],['brasita','DISPARO']];
      const render=(kind,phase,tick,reduced)=>{
        const c=document.createElement('canvas');c.width=200;c.height=140;
        const ctx=c.getContext('2d',{willReadFrequently:true});
        ctx.fillStyle='#122635';ctx.fillRect(0,0,c.width,c.height);
        const baseline=ctx.getImageData(0,0,c.width,c.height).data;
        const e={
          x:65,y:78,w:58,h:42,hp:82,max:82,roomId:'w1-'+world,kind,
          facing:1,invuln:0,stun:0,_alertT:0,
          _campaign:{wind:phase==='wind'?16:0,active:phase==='attack'?16:0,aim:1}
        };
        draw(ctx,e,{x:0,y:0},tick,reduced);
        const after=ctx.getImageData(0,0,c.width,c.height).data;
        let altered=0;let hash=2166136261;
        for(let i=0;i<after.length;i++){
          if(after[i]!==baseline[i])altered++;
          hash=Math.imul(hash^after[i],16777619);
        }
        return {canvas:c,altered,hash:hash>>>0};
      };
      document.getElementById('ohana-threat-atlas')?.remove();
      const atlas=document.createElement('section');
      atlas.id='ohana-threat-atlas';
      atlas.style.cssText='position:fixed;inset:0 auto auto 0;z-index:2147483000;width:1220px;height:760px;overflow:hidden;background:#081824;color:#f3ead3;padding:16px 20px;box-sizing:border-box;font:600 14px sans-serif;';
      const title=document.createElement('h1');
      title.textContent=(world==='dino'?'DINO · VALLE FÓSIL':'DRAGÓN · CALDERA')+' | ANTICIPACIÓN → ATAQUE';
      title.style.cssText='margin:0 0 12px;font:800 24px sans-serif';
      atlas.appendChild(title);
      const grid=document.createElement('div');
      grid.style.cssText='display:grid;grid-template-columns:repeat(5,200px);gap:12px 24px;';
      const metrics=[];
      for(const phase of ['idle','wind','attack']){
        for(const [kind,role] of roster){
          const painted=render(kind,phase,33,false);
          const cell=document.createElement('div');
          const label=document.createElement('div');
          label.textContent=kind.toUpperCase()+' · '+role+' · '+phase.toUpperCase();
          label.style.cssText='min-height:30px;color:#fff0c7;font:700 11px/1.3 sans-serif;';
          cell.append(label,painted.canvas);grid.append(cell);
          metrics.push({kind,phase,altered:painted.altered});
          if(painted.altered<100)throw Error(world+' '+kind+' '+phase+' rendered blank');
          const calm0=render(kind,phase,0,true),calm1=render(kind,phase,143,true);
          if(calm0.hash!==calm1.hash)throw Error(world+' '+kind+' reduced-motion pixels vary with time');
        }
      }
      atlas.append(grid);document.body.append(atlas);
      const flyer=world==='dino'?'libelula':'murcielago';
      const moving0=render(flyer,'idle',0,false);
      const moving1=render(flyer,'idle',64,false);
      if(moving0.hash===moving1.hash)throw Error(world+' normal wing animation has frozen');
      return {world,metrics,normalFlyerMoves:true,staticReduced:true};
    },world);
    assert.equal(observation.metrics.length,15);
    results.push(observation);
    await page.locator('#ohana-threat-atlas').screenshot({path:'test-results/dino-dragon/'+world+'-enemy-telegraphs.png'});
    await page.evaluate(()=>document.getElementById('ohana-threat-atlas')?.remove());
    await page.evaluate(world=>{
      localStorage.clear();
      const e=window.__OHANA_E2E;
      e.startWorld1(world);e.loadRoom('w1-'+world);e.step(600);
    },world);
    await page.clock.runFor(32);
    const state=await page.evaluate(()=>window.__OHANA_E2E.state());
    assert.equal(state.roomId,'w1-'+world,'actual level entry');
    assert.equal(state.runtimeFaults,0,'native level render has no runtime exceptions');
    await page.screenshot({path:'test-results/dino-dragon/'+world+'-chapter-desktop.png'});
    await page.setViewportSize({width:390,height:844});
    await page.clock.runFor(32);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
      'mobile view must not cause horizontal page overflow');
    await page.screenshot({path:'test-results/dino-dragon/'+world+'-chapter-mobile.png'});
    await page.setViewportSize({width:1280,height:900});
  }
  assert.deepEqual(errors,[],'page-level JavaScript errors');
  await fs.writeFile('test-results/dino-dragon/acceptance.json',JSON.stringify(results,null,2)+'\n');
  console.log('DINO + DRAGON VISUAL PASS: 30 creature/phase frames, 60 reduced-motion pixel checks, both worlds desktop/mobile.');
}finally{
 await browser?.close();
 server.closeAllConnections?.();
 await new Promise(resolve=>server.close(resolve));
}
