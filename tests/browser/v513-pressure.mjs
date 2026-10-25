// Actual controls approach the first authored pair, then compare idle with
// jump/ranged/melee play. No target replacement, health or position grants.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';import {advanceTerrainControls} from './authored-terrain-controls.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});const report=[];
 for(const [mode,policy] of [['easy','idle'],['normal','idle'],['hard','idle'],['normal','active']]){
  const page=await browser.newPage({viewport:{width:1440,height:900}});await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
  await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
  await page.evaluate(mode=>{localStorage.clear();localStorage.setItem('ohana-difficulty',mode);const e=window.__OHANA_E2E;e.setSeed(73);e.startWorld1('kilo');e.step(600);e.step(300);},mode);
  await page.locator('#game').focus();let s=await page.evaluate(()=>window.__OHANA_E2E.state()),frames=0;
  const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return page.evaluate(()=>window.__OHANA_E2E.state());};
  for(let i=0;i<100&&s.hp>0&&s.player.x<2000;i++){await page.keyboard.down('d');s=await step(14);await page.keyboard.up('d');}
  for(;frames<1200&&s.hp>0;frames+=20){
   if(policy==='active'){
    const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast());
    const near=foes.filter(e=>e.hp>0&&Math.abs(e.x-s.player.x)<430).sort((a,b)=>Math.abs(a.x-s.player.x)-Math.abs(b.x-s.player.x))[0];
    if(near){await page.keyboard.down(near.x>s.player.x?'d':'a');await step(1);await page.keyboard.up('d');await page.keyboard.up('a');await page.keyboard.press('j');await page.keyboard.press('h');if(frames%80===0)await page.keyboard.down('w');}
   }
   s=await step(20);await page.keyboard.up('w');
  }
  report.push({mode,policy,frames,hp:s.hp,maxHp:s.maxHealth,damage:s.combatReport.damage,hits:s.combatReport.hits,faults:s.runtimeFaults});console.log('PRESSURE',JSON.stringify(report.at(-1)));assert.equal(s.runtimeFaults,0);await page.close();
 }
 const normal=report.find(r=>r.mode==='normal'&&r.policy==='idle'),active=report.find(r=>r.policy==='active');
 assert.ok(normal.damage>0,'normal enemies must hurt a player ignoring them');
 assert.ok(active.damage<normal.damage,'jumping and attacking must beat passive tanking');
 await fs.mkdir('test-results/v513',{recursive:true});await fs.writeFile('test-results/v513/pressure.json',JSON.stringify(report,null,2));
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
