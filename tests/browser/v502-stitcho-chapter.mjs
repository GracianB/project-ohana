import {advanceTerrainControls} from './authored-terrain-controls.mjs';
// Physical Stitcho pilot. Direct chapter entry is the only access fixture:
// no position, experience, health, form or enemy/victory setters are used.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-24T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-24T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.evaluate(()=>{localStorage.clear();const e=window.__OHANA_E2E;e.setSeed(73);e.startWorld1('stitcho');e.loadRoom('w1-stitcho');});
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return page.evaluate(()=>window.__OHANA_E2E.state());};
 let s=await step(600),deaths=0,resumed=false;const forms=new Set([s.evo]);
 await page.locator('#game').focus();await fs.mkdir('test-results/v502',{recursive:true});
 for(let i=0;i<2200&&!s.world1.sealed;i++){
  if(s.hp<=0){assert.ok(++deaths<=8,'too many natural deaths');await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(600);}
  if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);await page.locator('#game').focus();}
  forms.add(s.evo);
  const data=await page.evaluate(async()=>({room:(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-stitcho'],workshop:window.__OHANA_E2E.stitchoChapterState()}));
  const rail=data.workshop.railDone,done=s.world1.done;
  let target;
  if(done===1&&!rail)target=s.player.x+s.player.w/2<2930?2940:3380;
  else if(done<3){const part=data.room.seal.stations[done];target=data.workshop.carry!=null?part.target.x:part.x;}
  else target=8580;
  const p=s.player,dx=target-(p.x+p.w/2);
  const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast());
  const near=foes.filter(e=>e.hp>0&&Math.hypot(e.x+e.w/2-(p.x+p.w/2),e.y+e.h/2-(p.y+p.h/2))<450).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
  if(Math.abs(dx)>25)await page.keyboard.down(dx>0?'d':'a');
  if(done===1&&!rail&&p.x+p.w/2>=2920&&p.x+p.w/2<3000)await page.keyboard.press('k');
  if(near){await page.keyboard.press('h');await page.keyboard.press('j');if(i%10===0)await page.keyboard.press('u');if(s.evo>=2&&i%20===0)await page.keyboard.press('l');if(near.stitchoBoss?.phase==='warn'&&i%3===0)await page.keyboard.press('Space');}
  if(p.grounded&&p.y<1000)await page.keyboard.down('s');else await page.keyboard.up('s');
  s=await step(Math.abs(dx)>25?Math.min(12,Math.max(1,Math.floor(Math.abs(dx)/7))):20);
  await page.keyboard.up('d');await page.keyboard.up('a');
  if(!resumed&&s.world1.done===2){await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('kilo');});s=await step(600);assert.equal(s.hero,'stitcho');assert.equal(s.world1.done,2);assert.ok(s.xp>=260);resumed=true;await page.locator('#game').focus();}
  if(i%100===0){console.log('STITCHO',JSON.stringify({i,x:s.player.x,y:s.player.y,hp:s.hp,xp:s.xp,evo:s.evo,done:s.world1.done,carry:s.world1.carry,target,boss:foes.find(e=>e.stitchoBoss)?.hp}));await page.screenshot({path:'test-results/v502/stitcho-debug.png'});}
 }
 assert.equal(s.world1.sealed,true);assert.equal(resumed,true);assert.deepEqual([...forms].sort(),[0,1,2,3,4]);assert.deepEqual(errors,[]);
 await page.screenshot({path:'test-results/v502/stitcho-complete.png'});
 const mobile=await browser.newContext({storageState:await page.context().storageState(),viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
 await phone.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await phone.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('stitcho');window.__OHANA_E2E.step(600);});
 await phone.locator('.touch-btn[data-k="k"]').tap();
 await phone.waitForFunction(()=>window.__OHANA_E2E.stitchoChapterState().move==='roll');
 await phone.screenshot({path:'test-results/v502/stitcho-mobile-roll.png'});await mobile.close();
 for(let n=0;n<12&&s.world1Cine;n++){await page.keyboard.press('Enter');s=await step(120);}
 await page.locator('#game').focus();
 for(let n=0;n<90&&s.roomId==='w1-stitcho';n++){await page.keyboard.down('d');s=await step(20);}
 await page.keyboard.up('d');
 assert.equal(s.roomId,'w1-chispin');assert.equal(s.hero,'chispin');assert.equal(s.evo,0);
 await page.screenshot({path:'test-results/v502/stitcho-next-chispin.png'});
 await fs.writeFile('test-results/v502/stitcho-pilot.json',JSON.stringify({deaths,forms:[...forms],resumed,mobileRoll:true,nextChapter:s.roomId,nextHero:s.hero,nextEvo:s.evo},null,2));
 assert.deepEqual(errors,[]);
 console.log('STITCHO PHYSICAL PILOT PASS');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
