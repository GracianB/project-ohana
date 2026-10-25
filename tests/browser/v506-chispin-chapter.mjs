import {advanceTerrainControls} from './authored-terrain-controls.mjs';
// Direct chapter entry is the only access fixture. The run earns forms and
// antennas with movement/combat: no position, XP, HP, enemy or victory setters.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 const antennas=await page.evaluate(async()=>{localStorage.clear();const e=window.__OHANA_E2E;e.setSeed(73);e.startWorld1('chispin');e.loadRoom('w1-chispin');return (await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-chispin'].seal.stations;});
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return page.evaluate(()=>window.__OHANA_E2E.state());};
 let s=await step(600),deaths=0,resumed=false,attacks=0,shortCircuitVerified=false;const forms=new Set([s.evo]),patterns=new Set();
 await page.locator('#game').focus();await fs.mkdir('test-results/v506',{recursive:true});
 for(let i=0;i<2200&&!s.world1.sealed;i++){
  if(s.hp<=0){assert.ok(++deaths<=8,'too many natural deaths');await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(600);}
  if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);await page.locator('#game').focus();}
  forms.add(s.evo);
  const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast()),boss=foes.find(e=>e.chispinBoss),b=boss?.chispinBoss;
  if(b){attacks=Math.max(attacks,b.attacksExecuted||0);if(b.phase==='warn')patterns.add(b.attack);}
  if(b?.phase==='warn'&&b.clock>=30&&s.world1.done===4)await page.screenshot({path:`test-results/v506/titan-warning-${b.attack}.png`});
  const p=s.player,near=foes.filter(e=>e.hp>0&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<430).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
  let target=s.world1.done<4?antennas[s.world1.done].x:(boss?.x||8750)-230;
  if(s.world1.done===4&&b?.phase==='warn'&&b.attack===3)target=p.x<8750?8290:9240;
  if(s.world1.done===4&&b?.phase==='warn'&&b.attack===1)target=p.x<boss.x?boss.x-390:boss.x+390;
  const dx=target-(p.x+p.w/2);
  if(Math.abs(dx)>25)await page.keyboard.down(dx>0?'d':'a');
  if(near&&(!b||!near.chispinBoss||b.phase==='rest')){await page.keyboard.press('h');await page.keyboard.press('j');if(i%10===0)await page.keyboard.press('u');if(s.evo>=2&&i%12===0)await page.keyboard.press('l');if(s.evo===4&&s.finisherCharge>=100)await page.keyboard.press('p');}
  // J cuts the nearby timed conductor. K can cross it; waiting remains viable.
  const gate=[2860,4460,6260].find(x=>Math.abs(p.x+p.w/2-x)<230);
  if(gate!=null){await page.keyboard.press('j');const gs=await page.evaluate(()=>window.__OHANA_E2E.chispinChapterState());if(gs.gates.some(g=>g.state==='silenced'))shortCircuitVerified=true;if(s.evo>=1&&p.x+p.w/2<gate&&Math.abs(p.x+p.w/2-gate)<125)await page.keyboard.press('k');}
  if(b?.phase==='warn'&&(b.attack===0||b.attack===2)&&i%3===0)await page.keyboard.press('Space');
  if(p.grounded&&p.y<1000)await page.keyboard.down('s');else await page.keyboard.up('s');
  s=await step(Math.abs(dx)>25?Math.min(14,Math.max(1,Math.floor(Math.abs(dx)/7))):20);
  await page.keyboard.up('d');await page.keyboard.up('a');
  if(!resumed&&s.world1.done===2){await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('kilo');});s=await step(600);assert.equal(s.hero,'chispin');assert.equal(s.world1.done,2);assert.ok(s.xp>=140);resumed=true;await page.locator('#game').focus();}
  if(i%100===0){console.log('CHISPIN',JSON.stringify({i,x:s.player.x,y:s.player.y,hp:s.hp,xp:s.xp,evo:s.evo,antennas:s.world1.done,boss:boss?.hp,phase:b?.phase,attacks}));await page.screenshot({path:'test-results/v506/chispin-debug.png'});}
 }
 assert.equal(s.world1.sealed,true);assert.equal(resumed,true);assert.equal(shortCircuitVerified,true);assert.deepEqual([...forms].sort(),[0,1,2,3,4]);assert.ok(attacks>=4);assert.deepEqual([...patterns].sort(),[0,1,2,3]);assert.deepEqual(errors,[]);
 await page.screenshot({path:'test-results/v506/chispin-complete.png'});
 const mobile=await browser.newContext({storageState:await page.context().storageState(),viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),phone=await mobile.newPage();
 await phone.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await phone.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('chispin');window.__OHANA_E2E.step(600);});
 const before=(await phone.evaluate(()=>window.__OHANA_E2E.state())).player.x;
 await phone.locator('.touch-btn[data-k="k"]').tap();
 assert.ok(Math.abs((await phone.evaluate(()=>window.__OHANA_E2E.state())).player.x-before)>80,'touch K performs a real blink');
 await phone.screenshot({path:'test-results/v506/chispin-mobile-blink.png'});await mobile.close();
 for(let n=0;n<12&&s.world1Cine;n++){await page.keyboard.press('Enter');s=await step(120);}
 await page.locator('#game').focus();for(let n=0;n<100&&s.roomId==='w1-chispin';n++){await page.keyboard.down('d');s=await step(20);}await page.keyboard.up('d');
 assert.equal(s.roomId,'w1-cat');assert.equal(s.hero,'cat');assert.equal(s.evo,0);
 await fs.writeFile('test-results/v506/chispin-pilot.json',JSON.stringify({deaths,forms:[...forms],resumed,shortCircuitVerified,attacks,patterns:[...patterns],mobileBlink:true,nextRoom:s.roomId,nextHero:s.hero,nextEvo:s.evo},null,2));
 console.log('CHISPIN PHYSICAL PILOT PASS');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
