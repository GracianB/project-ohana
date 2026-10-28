// Chapter entry is the access fixture. Everything after entry is earned with
// native input and ordinary retries; Continue reads the physically earned save.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
import {advanceStitchoEncounterControls} from './stitcho-encounter-controls-v607.mjs';
const server=await startServer(0),smoke=process.env.OHANA_STITCHO_SMOKE==='1',art='test-results/v607';let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await fs.mkdir(art,{recursive:true});
 await page.clock.install({time:new Date('2026-10-28T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-28T12:00:01Z'));
 const url=`http://127.0.0.1:${server.address().port}/?e2e=1`;
 await page.goto(url,{waitUntil:'load'});await page.waitForFunction(()=>window.__OHANA_E2E);await page.keyboard.press('Escape');await page.locator('#difficulty [data-diff="normal"]').click();
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.startWorld1('stitcho');e.loadRoom('w1-stitcho');});
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state()),step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
 async function films(){for(let n=0;n<24;n++){
  if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);continue;}
  if(!(await state()).world1Cine)break;await page.keyboard.press('Enter');await step(100);
 }await page.locator('#game').focus();}
 let s=await step(600);await films();s=await state();assert.equal(s.hero,'stitcho');assert.equal(s.evo,0);assert.equal(s.world1.expedition,null);
 const forms=new Set([0]),milestones=[],phases=new Set(),patterns=new Set(),captures=new Set();
 let deaths=0,minimumHp=s.hp,iterations=0,lastDone=0,railRecorded=false,resumed=false,attacks=0;
 for(let i=0;i<6000&&!s.world1.sealed;i++){
  iterations=i;if(s.hp<=0){assert.ok(++deaths<=12,'natural retry budget exhausted');await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(120);}
  if(s.world1Cine||await page.locator('#evo-stage.show').count()){await films();s=await state();}
  forms.add(s.evo);minimumHp=Math.min(minimumHp,s.hp);assert.equal(s.runtimeFaults,0);
  const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast()),boss=foes.find(e=>e.stitchoBoss&&e.hp>0),b=boss?.stitchoBoss;
  if(b){phases.add(b.phase);attacks=Math.max(attacks,b.attacksExecuted||0);if(b.phase==='attack')patterns.add(b.attack);}
  if(b?.phase==='warn'&&!captures.has('warn-'+b.attack)){captures.add('warn-'+b.attack);await page.screenshot({path:`${art}/stitcho-v607-guardian-warning-${b.attack}.png`});}
  s=await advanceStitchoEncounterControls(page,s,step,i);const w=await page.evaluate(()=>window.__OHANA_E2E.stitchoChapterState());
  if(!railRecorded&&w.railDone){railRecorded=true;milestones.push({kind:'rail',x:Math.round(s.player.x),xp:s.xp,evo:s.evo,hp:s.hp,iteration:i});console.log('STITCHO V607 RAIL',JSON.stringify(milestones.at(-1)));}
  if(s.world1.done>lastDone){lastDone=s.world1.done;milestones.push({kind:'module',module:lastDone,x:Math.round(s.player.x),xp:s.xp,evo:s.evo,hp:s.hp,iteration:i});console.log('STITCHO V607 MODULE',JSON.stringify(milestones.at(-1)));await films();s=await state();forms.add(s.evo);await page.screenshot({path:`${art}/stitcho-v607-module-${lastDone}.png`});}
  if(!smoke&&!resumed&&s.world1.done===2){await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('kilo');});s=await step(120);await films();s=await state();assert.equal(s.hero,'stitcho');assert.equal(s.world1.done,2);assert.equal((await page.evaluate(()=>window.__OHANA_E2E.stitchoChapterState())).railDone,true);assert.ok(s.xp>=260);resumed=true;}
  assert.ok(s.evo<=s.world1.done+(w.railDone?1:0),'XP cannot bypass a workshop lesson');
  if(i%100===0){console.log('STITCHO V607 ROUTE',JSON.stringify({i,x:Math.round(s.player.x),y:Math.round(s.player.y),hp:s.hp,evo:s.evo,done:s.world1.done,carry:w.carry,rail:w.railDone,released:w.stations?.map(n=>n.released),bossHp:boss?.hp,phase:b?.phase}));await fs.writeFile(`${art}/stitcho-v607-current.json`,JSON.stringify({s,w,foes,milestones,deaths},null,2));await page.screenshot({path:`${art}/stitcho-v607-current.png`});}
  if(smoke&&s.world1.done>=1)break;
 }
 const result={mode:smoke?'first-module-smoke':'full-physical-chapter',difficulty:'normal',deaths,minimumHp,iterations,forms:[...forms],milestones,phases:[...phases],patterns:[...patterns],attacks,resumed,final:{done:s.world1.done,evo:s.evo,sealed:s.world1.sealed,hp:s.hp,x:s.player.x},errors};
 await fs.writeFile(`${art}/stitcho-v607-${smoke?'smoke':'journey'}.json`,JSON.stringify(result,null,2));assert.equal(s.world1.done,smoke?1:3);assert.deepEqual(errors,[]);
 if(!smoke){
  assert.equal(s.world1.sealed,true);assert.equal(resumed,true);assert.deepEqual([...forms].sort(),[0,1,2,3,4]);assert.equal(railRecorded,true);assert.ok(attacks>=5);assert.deepEqual([...patterns].sort(),[0,1,2]);
  await films();s=await state();await page.context().storageState({path:`${art}/earned-stitcho-v607-storage.json`});
  const mobile=await browser.newContext({storageState:await page.context().storageState(),viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto(url,{waitUntil:'load'});await phone.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('stitcho');window.__OHANA_E2E.step(600);});
  for(let n=0;n<15&&await phone.locator('body.world1-story').count();n++){await phone.keyboard.press('Enter');await phone.evaluate(()=>window.__OHANA_E2E.step(100));}
  await phone.locator('.touch-btn[data-k="k"]').tap();await phone.waitForFunction(()=>window.__OHANA_E2E.stitchoChapterState().move==='roll');await phone.screenshot({path:`${art}/stitcho-v607-mobile-roll.png`});await mobile.close();
  for(let n=0;n<180&&s.roomId==='w1-stitcho';n++){await page.keyboard.down('d');s=await step(20);}await page.keyboard.up('d');assert.equal(s.roomId,'w1-chispin');assert.equal(s.hero,'chispin');assert.equal(s.evo,0);assert.deepEqual(errors,[]);
  result.mobileRoll=true;result.next={room:s.roomId,hero:s.hero,evo:s.evo};await fs.writeFile(`${art}/stitcho-v607-journey.json`,JSON.stringify(result,null,2));
 }
 console.log('PASS Stitcho V607 '+result.mode+': native controls, '+milestones.length+' earned milestones, '+deaths+' natural deaths; not human difficulty acceptance');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
