// Direct chapter entry is the access fixture. All forms, objectives and boss
// wins in these pilots use physical input, with no position/HP/XP/win setters.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 await fs.mkdir('test-results/v509',{recursive:true});
 const hero='pizza';
 {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 const allStations=await page.evaluate(async hero=>{localStorage.clear();const e=window.__OHANA_E2E;e.setSeed(73);e.startWorld1(hero);e.loadRoom('w1-'+hero);return (await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-'+hero].seal.stations;},hero);
 const stations=allStations.filter(s=>s.kind==='guest');
 const step=async n=>{await page.evaluate(n=>window.__OHANA_E2E.step(n),n);await page.clock.runFor(16);return page.evaluate(()=>window.__OHANA_E2E.state());};
 let s=await step(600),deaths=0,resumed=false,attacks=0;const forms=new Set([s.evo]),patterns=new Set();
 await page.locator('#game').focus();
 for(const foe of await page.evaluate(()=>window.__OHANA_E2E.roomCast()))assert.ok(foe.y+foe.h<=1134.1,'no enemy spawned through the floor');
 for(let i=0;i<2500&&!s.world1.sealed;i++){
  if(s.hp<=0){assert.ok(++deaths<=8,'too many natural deaths in '+hero);await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(600);}
  if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);await page.locator('#game').focus();}
  forms.add(s.evo);
  const data=await page.evaluate(()=>window.__OHANA_E2E.pizzaChapterState()),foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast()),boss=foes.find(e=>e.chapterBoss),b=boss?.chapterBoss;
  if(b){attacks=Math.max(attacks,b.attacksExecuted||0);if(b.phase==='warn')patterns.add(b.attack);}
  const p=s.player,stage=s.world1.done,station=stations[stage],near=foes.filter(e=>e.hp>0&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<430).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
  let target=station?(data.carry==='pizza'?station.x:data.ovens.at(-1)):(boss?.x||8750)-210;
  if(!station&&b?.phase==='warn'&&(b.attack===0||b.attack===3))target=p.x<boss.x?Math.max(8290,boss.x-380):Math.min(9240,boss.x+380);
  const dx=target-p.x-p.w/2;let jumpHeld=false;
  if(Math.abs(dx)>24)await page.keyboard.down(dx>0?'d':'a');
  if(near&&(!near.chapterBoss||b?.phase==='rest')){
   await page.keyboard.press('h');await page.keyboard.press('j');
   if(s.evo>=1&&i%18===0)await page.keyboard.press('k');
   if(s.evo>=2&&i%12===0)await page.keyboard.press('l');
   if(i%10===0)await page.keyboard.press('u');
   if(s.evo>=3&&i%15===0)await page.keyboard.press('i');
   if(s.evo===4&&s.finisherCharge>=100)await page.keyboard.press('p');
  }
  if(b?.phase==='warn'&&!station&&i%3===0){await page.keyboard.down('w');jumpHeld=true;}
  if(p.grounded&&p.y<1000)await page.keyboard.down('s');else await page.keyboard.up('s');
  if(b?.phase==='warn'&&!station)await page.screenshot({path:`test-results/v509/${hero}-boss-warning-${b.attack}.png`});
  s=await step(Math.abs(dx)>24?Math.min(14,Math.max(1,Math.floor(Math.abs(dx)/7))):20);await page.keyboard.up('d');await page.keyboard.up('a');if(jumpHeld){await page.keyboard.up('w');s=await step(1);}
  if(!resumed&&s.world1.done===2){await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('kilo');});s=await step(600);assert.equal(s.hero,hero);assert.equal(s.world1.done,2);resumed=true;await page.locator('#game').focus();}
  if(i%100===0){console.log('PILOT',JSON.stringify({hero,i,x:s.player.x,y:s.player.y,hp:s.hp,xp:s.xp,evo:s.evo,done:s.world1.done,boss:boss?.hp,phase:b?.phase,attacks}));await page.screenshot({path:`test-results/v509/${hero}-debug.png`});}
 }
 assert.equal(s.world1.sealed,true,hero+' must earn its seal');assert.equal(resumed,true);assert.deepEqual([...forms].sort(),[0,1,2,3,4]);assert.ok(attacks>=4);assert.deepEqual([...patterns].sort(),[0,1,2,3]);
 const data=await page.evaluate(()=>window.__OHANA_E2E.pizzaChapterState());assert.equal(data.baked,true);assert.equal(data.ovens.length,3);
 await page.screenshot({path:'test-results/v509/pizza-complete.png'});
 const mobile=await browser.newContext({storageState:await page.context().storageState(),viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),phone=await mobile.newPage();
 phone.on('pageerror',e=>errors.push(e.message));await phone.clock.install({time:new Date('2026-10-25T12:00:00Z')});await phone.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await phone.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await phone.evaluate(()=>{localStorage.setItem('ohana-resume','1');const e=window.__OHANA_E2E;e.startWorld1('pizza');e.step(600);});
 await phone.locator('.touch-btn[data-k="j"]').tap();await phone.evaluate(()=>window.__OHANA_E2E.step(1));assert.equal((await phone.evaluate(()=>window.__OHANA_E2E.state())).lastAbilitySlot,0);
 await phone.clock.runFor(32);await phone.screenshot({path:'test-results/v509/pizza-mobile.png'});await mobile.close();
 for(let n=0;n<12&&s.world1Cine;n++){await page.keyboard.press('Enter');s=await step(120);}
 await page.locator('#game').focus();for(let n=0;n<100&&s.roomId==='w1-'+hero;n++){await page.keyboard.down('d');s=await step(20);}await page.keyboard.up('d');
 const next='yomi';assert.equal(s.roomId,'w1-'+next);assert.equal(s.hero,next);assert.equal(s.evo,0);assert.deepEqual(errors,[]);
 await fs.writeFile(`test-results/v509/${hero}-pilot.json`,JSON.stringify({deaths,forms:[...forms],resumed,attacks,patterns:[...patterns],relayOvens:data.ovens,mobileJ:true,next:s.roomId,nextEvo:s.evo},null,2));
 console.log('PHYSICAL CHAPTER PASS '+hero);await page.close();
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
