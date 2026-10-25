import {advanceExpeditionControls} from './expedition-controls-v2.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
// Direct chapter entry is the access fixture. All forms, objectives and boss
// wins in these pilots use physical input, with no position/HP/XP/win setters.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 await fs.mkdir('test-results/v507',{recursive:true});
 for(const hero of (process.env.OHANA_PILOT_HERO?[process.env.OHANA_PILOT_HERO]:['cat','cuerno','dragon'])){
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 const stations=await page.evaluate(async hero=>{localStorage.clear();const e=window.__OHANA_E2E;e.setSeed(73);e.startWorld1(hero);e.loadRoom('w1-'+hero);return (await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-'+hero].seal.stations;},hero);
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return page.evaluate(()=>window.__OHANA_E2E.state());};
 let s=await step(600),deaths=0,resumed=false,attacks=0,thermal=false;const forms=new Set([s.evo]),patterns=new Set();
 await page.locator('#game').focus();
 for(let i=0;i<2500&&!s.world1.sealed;i++){
  if(s.hp<=0){assert.ok(++deaths<=8,'too many natural deaths in '+hero);await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(600);}
  if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);await page.locator('#game').focus();}
  forms.add(s.evo);
  const data=await page.evaluate(()=>window.__OHANA_E2E.nextChapterState()),foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast()),boss=foes.find(e=>e.chapterBoss),b=boss?.chapterBoss;
  thermal||=data.thermalFrames>0;
  if(b){attacks=Math.max(attacks,b.attacksExecuted||0);if(b.phase==='warn')patterns.add(b.attack);}
  const act2=await advanceExpeditionControls(page,s,hero,step);if(act2){s=act2;continue;}
  const p=s.player,stage=s.world1.done,station=stations[stage],near=foes.filter(e=>e.hp>0&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<430).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
  let target=hero==='cuerno'&&!data.mirror?1000:station?station.x:(boss?.x||8750)-210;
  if(!station&&b?.phase==='warn'&&(b.attack===0||b.attack===3))target=p.x<boss.x?Math.max(8290,boss.x-380):Math.min(9240,boss.x+380);
  const dx=target-p.x-p.w/2;let jumpHeld=false;
  if(Math.abs(dx)>24)await page.keyboard.down(dx>0?'d':'a');
  if(hero==='cuerno'&&!data.mirror&&Math.abs(dx)<200)await page.keyboard.press('j');
  if(hero==='dragon'&&station&&Math.abs(dx)<240){await page.keyboard.press('j');await page.keyboard.press('h');}
  if(hero==='cat'&&station&&Math.abs(dx)<300&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps&&p.y+p.h>station.y+45)){await page.keyboard.down('w');jumpHeld=true;}
  if(hero==='dragon'&&!thermal&&s.evo>=1&&Math.abs(p.x+p.w/2-3050)<120){await page.keyboard.down('w');jumpHeld=true;}
  if(near&&(!near.chapterBoss||b?.phase==='rest')){
   await page.keyboard.press('h');await page.keyboard.press('j');
   if(s.evo>=1&&i%18===0&&hero!=='dragon')await page.keyboard.press('k');
   if(s.evo>=2&&i%12===0)await page.keyboard.press('l');
   if(i%10===0)await page.keyboard.press('u');
   if(s.evo>=3&&i%15===0)await page.keyboard.press('i');
   if(s.evo===4&&s.finisherCharge>=100)await page.keyboard.press('p');
  }
  if(b?.phase==='warn'&&!station&&i%3===0){await page.keyboard.down('w');jumpHeld=true;}
  if(p.grounded&&p.y<1000&&hero!=='cat')await page.keyboard.down('s');else await page.keyboard.up('s');
  if(b?.phase==='warn'&&b.clock>=30&&!station)await page.screenshot({path:`test-results/v507/${hero}-boss-warning-${b.attack}.png`});
  s=await step(Math.abs(dx)>24?Math.min(14,Math.max(1,Math.floor(Math.abs(dx)/7))):20);await page.keyboard.up('d');await page.keyboard.up('a');if(jumpHeld){await page.keyboard.up('w');s=await step(1);}
  if(!resumed&&s.world1.done===2){await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('kilo');});s=await step(600);assert.equal(s.hero,hero);assert.equal(s.world1.done,2);resumed=true;await page.locator('#game').focus();}
  if(i%100===0){console.log('PILOT',JSON.stringify({hero,i,x:s.player.x,y:s.player.y,hp:s.hp,xp:s.xp,evo:s.evo,done:s.world1.done,boss:boss?.hp,phase:b?.phase,attacks,thermal}));await page.screenshot({path:`test-results/v507/${hero}-debug.png`});}
 }
 assert.equal(s.world1.sealed,true,hero+' must earn its seal');assert.equal(resumed,true);assert.deepEqual([...forms].sort(),[0,1,2,3,4]);assert.ok(attacks>=4);assert.ok(patterns.size>=2,'adaptive boss must execute distinct warnings');assert.ok([...patterns].every(n=>[0,1,2,3].includes(n))); /* V2 counter-patterns; full native cycle is unit-tested. */
 const data=await page.evaluate(()=>window.__OHANA_E2E.nextChapterState());if(hero==='cat')assert.equal(data.bridges,5);if(hero==='cuerno')assert.equal(data.mirror,true);if(hero==='dragon')assert.equal(thermal,true);
 for(let n=0;n<12&&s.world1Cine;n++){await page.keyboard.press('Enter');s=await step(120);}
 await page.locator('#game').focus();for(let n=0;n<100&&s.roomId==='w1-'+hero;n++){await page.keyboard.down('d');s=await step(20);}await page.keyboard.up('d');
 const next={cat:'cuerno',cuerno:'dragon',dragon:'dino'}[hero];assert.equal(s.roomId,'w1-'+next);assert.equal(s.hero,next);assert.equal(s.evo,0);assert.deepEqual(errors,[]);
 await fs.writeFile(`test-results/v507/${hero}-pilot.json`,JSON.stringify({deaths,forms:[...forms],resumed,attacks,patterns:[...patterns],thermal,next:s.roomId,nextEvo:s.evo},null,2));
 console.log('PHYSICAL CHAPTER PASS '+hero);await page.close();
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
