import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`,{waitUntil:'networkidle'});
 await page.locator('.oi-enter').click();await page.evaluate(()=>window.__OHANA_E2E.start('chispin'));
 await fs.mkdir('test-results/direction',{recursive:true});
 const audit=await page.evaluate(async()=>{
  const {drawEvolutionPresentation}=await import('/systems/evo-cine/presentation.js');
  const {ROSTER}=await import('/characters/roster.js');
  const {drawEnemy}=await import('/engine/enemies.js'),{makeFoe}=await import('/engine/foes.js');
  const {renderWorld,WORLDS}=await import('/worlds/index.js');
  const board=document.createElement('section');board.id='direction-board';board.style.cssText='position:absolute;z-index:10000;top:0;left:0;display:grid;grid-template-columns:repeat(2,500px);background:#102e35;gap:12px;padding:12px;';
  let frames=0;const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  for(const hero of ROSTER)for(let evo=1;evo<5;evo++)for(const [w,h] of [[1280,720],[320,568]]){
   canvas.width=w;canvas.height=h;
   for(const t of [0,.8,1.7,2.4,3.6]){const s=drawEvolutionPresentation(ctx,w,h,hero.id,evo,t);if(typeof s.message!=='string')throw Error('invalid copy');frames++;}
   drawEvolutionPresentation(ctx,w,h,hero.id,evo,3.2,true);const a=canvas.toDataURL();
   drawEvolutionPresentation(ctx,w,h,hero.id,evo,3.6,true);if(a!==canvas.toDataURL())throw Error('reduced reveal moves');
  }
  for(const hero of ROSTER){const c=document.createElement('canvas');c.width=500;c.height=420;c.dataset.hero=hero.id;drawEvolutionPresentation(c.getContext('2d'),500,420,hero.id,4,3.25);board.append(c);}
  document.body.append(board);
  const scene=document.createElement('section');scene.id='scenery-board';scene.style.cssText=board.style.cssText;scene.style.display='none';
  for(const world of WORLDS){const c=document.createElement('canvas');c.width=500;c.height=330;c.dataset.world=world.id;const cx=c.getContext('2d');renderWorld(cx,world,{x:180,y:0},60,500,330);cx.fillStyle='#fff0cf';cx.font='18px Fredoka';cx.fillText(world.name,20,30);scene.append(c);}
  document.body.append(scene);
  const enemies=document.createElement('canvas');enemies.id='enemy-board';enemies.width=1000;enemies.height=430;enemies.style.cssText='position:absolute;top:0;left:0;z-index:10001;display:none;background:#23464c;';const ec=enemies.getContext('2d');
  const kinds=['cangrejo','pez','medusa','anguila','avispa','libelula','rana','murcielago','arana','ufo'];
  let unchanged=0;
  for(let i=0;i<kinds.length;i++)for(let j=0;j<3;j++){
   const e=makeFoe(60+i%5*190,70+Math.floor(i/5)*200+j*45,kinds[i],'beach',i);
   e.hp=j===1?e.max*.4:e.max;e.elite=j===2;e.telegraph=j===2?20:0;
   const before=JSON.stringify(e);drawEnemy(ec,e,{x:0,y:0},60,{reduceMotion:true});if(before!==JSON.stringify(e))throw Error('art changed enemy');unchanged++;
  }document.body.append(enemies);return {frames,unchanged};
 });
 assert.equal(audit.frames,400);assert.equal(audit.unchanged,30);
 await page.locator('#direction-board').screenshot({path:'test-results/direction/evolutions.png'});
 await page.locator('#direction-board [data-hero="chispin"]').screenshot({path:'test-results/direction/chispa-evolution.png'});
 await page.evaluate(()=>{document.querySelector('#direction-board').remove();document.querySelector('#scenery-board').style.display='grid';});
 await page.locator('#scenery-board').screenshot({path:'test-results/direction/scenery.png'});
 await page.evaluate(()=>{document.querySelector('#scenery-board').remove();document.querySelector('#enemy-board').style.display='block';});
 await page.locator('#enemy-board').screenshot({path:'test-results/direction/enemies.png'});
 await page.evaluate(()=>document.querySelector('#enemy-board').remove());
 await page.evaluate(()=>window.__OHANA_E2E.setEvo(2));
 await page.locator('#btn-help').focus();
 await page.evaluate(async()=>{const {playEvolution}=await import('/systems/evo-cinema.js');playEvolution({id:'chispin',evo:2});});
 await page.locator('#evo-stage.show .evo-skip').waitFor();
 await page.waitForTimeout(900);await page.keyboard.press('ArrowRight');
 assert.equal(await page.locator('#evo-stage.show').count(),1,'movement must not skip evolution');
 assert.equal(await page.locator('.evo-skip').evaluate(el=>document.activeElement===el),true);
 await page.keyboard.press('Escape');await page.locator('#evo-stage.show').waitFor({state:'hidden'});
 assert.equal(await page.locator('#btn-help').evaluate(el=>document.activeElement===el),true);
 await page.screenshot({path:'test-results/direction/gameplay.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS 400 evolution frames, 80 static reduced-motion reveals, ten backdrops, 30 immutable enemy renders and real cinematic keyboard/focus lifecycle');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
