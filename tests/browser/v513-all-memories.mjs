// The access fixture reopens each already earned chapter from the legitimate
// full-campaign save. Every pickup uses movement/jumps/flight: no position,
// collection, XP, form, invulnerability, enemy or reward grants.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
 const checkpoint='test-results/v513/memory-checkpoint-storage.json';
 const source=await fs.access(checkpoint).then(()=>checkpoint,()=> 'test-results/v513/earned-campaign-storage.json');
 const earned=JSON.parse(await fs.readFile(source,'utf8'));
 // The test server chooses a new port; move the untouched earned backup to that origin.
 for(const origin of earned.origins)origin.origin=`http://127.0.0.1:${server.address().port}`;
 const context=await browser.newContext({viewport:{width:1440,height:900},storageState:earned});
 const page=await context.newPage(),errors=[],report=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 const order=await page.evaluate(async()=>(await import('/systems/world1-rooms.js')).WORLD1_ORDER);
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return page.evaluate(()=>window.__OHANA_E2E.state());};
 async function films(){for(let i=0;i<14;i++){const s=await page.evaluate(()=>window.__OHANA_E2E.state());if(!s.world1Cine)break;await page.keyboard.press('Enter');await step(100);}await page.locator('#game').focus();}
 const read=hero=>page.evaluate(hero=>JSON.parse(localStorage.getItem('ohana-w1-collect-v1')||'{}').rooms?.[hero]?.found||[],hero);
 for(const hero of (process.env.OHANA_COLLECT_HERO?[process.env.OHANA_COLLECT_HERO]:order)){
  await page.evaluate(hero=>{localStorage.removeItem('ohana-resume');window.__OHANA_E2E.startWorld1(hero);},hero);await films();let s=await step(5);
  console.log('REOPEN',JSON.stringify({hero,actual:s.hero,evo:s.evo,xp:s.xp,seals:s.world1Seals,room:s.roomId,world1:s.world1,film:s.world1Cine}));assert.equal(s.hero,hero);assert.equal(s.evo,4,'growth must come from the earned chapter seal');assert.equal(s.world1Seals.length,10);
  const placements=await page.evaluate(async hero=>{const {WORLD1_ROOMS}=await import('/systems/world1-rooms.js'),{world1CollectPlacements}=await import('/systems/world1-collect.js');return world1CollectPlacements(WORLD1_ROOMS['w1-'+hero]);},hero);
  const terrain=await page.evaluate(()=>window.__OHANA_E2E.roomTraversal().terraces);
  let found=await read(hero),target=null,attempt=0,deaths=0,lastCount=found.length;
  for(let i=0;i<20000&&found.length<100;i++){
   assert.equal(s.roomId,'w1-'+hero,'collection must not accidentally leave the chapter');
   if(s.hp<=0){assert.ok(++deaths<=15,hero+' normal retry limit');await page.evaluate(()=>window.__OHANA_E2E.respawn());await films();s=await step(30);}
   found=await read(hero);const p=s.player,cx=p.x+p.w/2,cy=p.y+p.h/2;
   if(!target||found.includes(target.id)||attempt>300){
    const options=placements.filter(it=>!found.includes(it.id));
    if(!options.length)break;
    options.sort((a,b)=>(Math.abs(a.x-cx)+Math.abs(a.y-cy)*1.4)-(Math.abs(b.x-cx)+Math.abs(b.y-cy)*1.4));
    target=options[attempt>300&&options.length>1?1:0];attempt=0;
   }attempt++;
   let dx=target.x-cx,dy=target.y-cy;
   const support=terrain.find(tr=>p.x+p.w>tr.x&&p.x<tr.x+tr.w&&Math.abs(p.y+p.h-tr.y)<12);
   if(support&&dy>30){
    if(target.x>support.x+support.w)dx=support.x+support.w+p.w/2+25-cx;
    else if(target.x<support.x)dx=support.x-p.w/2-25-cx;
   }
   for(const k of ['a','d','w','s'])await page.keyboard.up(k);
   await page.evaluate(()=>window.__OHANA_E2E.step(1)); // release edge for a new platform drop
   if(hero==='kilo'&&s.kiloFlight?.mode!=='solar')await page.keyboard.press('k');
   const flight=hero==='kilo'&&(await page.evaluate(()=>window.__OHANA_E2E.state())).kiloFlight?.mode==='solar';
   if(Math.abs(dx)>20)await page.keyboard.down(dx>0?'d':'a');
   let jump=false;
   if(flight){const bank=terrain.find(tr=>{const gap=dx>0?tr.x-(p.x+p.w):p.x-(tr.x+tr.w);return Math.abs(dx)>20&&(dx>0?target.x>tr.x:target.x<tr.x+tr.w)&&gap>=-p.w&&gap<110&&p.y+p.h>tr.y+4;});if(bank)dy=Math.min(dy,bank.y-p.h/2-20-cy);if(Math.abs(dy)>12)await page.keyboard.down(dy>0?'s':'w');}
   else{
    if(p.grounded&&dy>30)await page.keyboard.down('s');
    if(dy< -24&&Math.abs(dx)<220&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps)){await page.keyboard.down('w');jump=true;}
   }
   // Defend with real, cooldown-limited attacks; the saved bosses stay defeated.
   if(i%8===0){await page.keyboard.press('j');await page.keyboard.press('h');}
   if(s.hp<s.maxHealth*.7&&i%50===0){await page.keyboard.press('l');await page.keyboard.press('u');}
   const n=jump?16:Math.abs(dx)>12?Math.max(1,Math.min(12,Math.floor(Math.abs(dx)/8))):8;
   s=await step(n);
   if(found.length>=lastCount+10){lastCount=found.length;console.log('COLLECTION',JSON.stringify({hero,found:found.length,i,x:Math.round(s.player.x),target:target.id,deaths}));}
   if(i%100===0)await context.storageState({path:checkpoint});
   if(i%500===0){await page.screenshot({path:`test-results/v513/${hero}-collection-debug.png`});console.log('COLLECT STATE',JSON.stringify({hero,i,found:found.length,target,player:s.player}));}
   assert.equal(s.runtimeFaults,0);
  }
  for(const k of ['a','d','w','s'])await page.keyboard.up(k);
  found=await read(hero);assert.equal(found.length,100,hero+' all real pickups must be reachable');
  await context.storageState({path:checkpoint});report.push({hero,found:found.length,deaths});await page.screenshot({path:`test-results/v513/${hero}-100-memories.png`});
  await fs.writeFile('test-results/v513/collection-progress.json',JSON.stringify(report,null,2));console.log('100 MEMORIES PASS '+hero);
 }
 assert.deepEqual(errors,[]);await context.storageState({path:'test-results/v513/all-memory-storage.json'});
 await fs.writeFile('test-results/v513/all-memories.json',JSON.stringify({report,total:report.reduce((n,r)=>n+r.found,0),errors},null,2));
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
