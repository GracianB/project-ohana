// Physical solo chapter pilot: no setPlayer, XP/form grants, healing or enemy
// replacement. Natural retries are recorded; the browser clock is controlled.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-24T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-24T12:00:01Z'));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'load'});
 const notes=await page.evaluate(async()=>{localStorage.clear();const e=window.__OHANA_E2E;e.setSeed(73);e.startWorld1('kilo');return (await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-kilo'].seal.stations;});
 const step=async n=>{await page.evaluate(n=>window.__OHANA_E2E.step(n),n);await page.clock.runFor(16);return page.evaluate(()=>window.__OHANA_E2E.state());};
 let s=await step(600),deaths=0,airResumed=false;await page.locator('#game').focus();
 await fs.mkdir('test-results/v501',{recursive:true});
 const forms=new Set([s.evo]),milestones=[],guardianPhases=new Set();
 for(let i=0;i<1800&&!s.world1.sealed;i++){
  if(s.hp<=0){assert.ok(++deaths<=8,'too many natural retries');await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(600);}
  if(await page.locator('#evo-stage.show .evo-skip').count()){
   await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);await page.locator('#game').focus();
  }
  forms.add(s.evo);
  const count=s.world1.done,air=await page.evaluate(()=>window.__OHANA_E2E.kiloAirState()),chime=count>=4?air.chimes.find(c=>!c.done):null;
  const target=count<4?notes[count].x:chime?chime.x:8470;
  if(chime&&s.kiloFlight.mode!=='solar')await page.keyboard.press('k');
  if(!chime&&s.kiloFlight.mode==='solar')await page.keyboard.press('k');
  const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast());
  for(const foe of foes)if(foe.guardian)guardianPhases.add(foe.guardian.phase);
  const p=s.player,near=foes.filter(e=>e.hp>0&&Math.hypot(e.x+e.w/2-(p.x+p.w/2),e.y+e.h/2-(p.y+p.h/2))<400).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
  if(count>=4&&near?.guardian&&['warn','rest'].includes(near.guardian.phase))await page.screenshot({path:`test-results/v501/kilo-guardian-${near.guardian.phase}.png`});
  const dx=target-(p.x+p.w/2),dir=dx>0?'d':'a';
  if(Math.abs(dx)>28){await page.keyboard.down(dir);}
  else if(near){const face=near.x+near.w/2>p.x+p.w/2?'d':'a';await page.keyboard.down(face);await step(1);await page.keyboard.up(face);}
  if(chime){
   const dy=chime.y-(p.y+p.h/2);
   if(dy<-15)await page.keyboard.down('w');else await page.keyboard.up('w');
   if(dy>15)await page.keyboard.down('s');else await page.keyboard.up('s');
  }else{await page.keyboard.up('w');
   if(count<4&&Math.abs(dx)<100&&p.grounded&&p.y<1000)await page.keyboard.down('s');else await page.keyboard.up('s');
  }
  if(near&&(!near.guardian||near.guardian.phase==='rest')){await page.keyboard.press('h');await page.keyboard.press('j');}
  if(i%10===0&&near&&(!near.guardian||near.guardian.phase==='rest'))await page.keyboard.press('u');
  if(count>=4&&s.kiloCombo.ready&&near?.guardian?.phase==='rest')await page.keyboard.press('i');
  if(s.evo>=2&&s.hp<s.maxHealth-15)await page.keyboard.press('l');
  if(count>=4&&!chime&&near&&i%4===0)await page.keyboard.press('Space');
  s=await step(Math.abs(dx)>28?Math.max(1,Math.min(24,Math.floor(Math.abs(dx)/7))):24);await page.keyboard.up('d');await page.keyboard.up('a');
  if(s.world1.done>milestones.length){milestones.push({notes:s.world1.done,xp:s.xp,evo:s.evo,x:s.player.x});console.log('KILO NOTE',JSON.stringify(milestones.at(-1)));await page.screenshot({path:`test-results/v501/kilo-note-${s.world1.done}.png`});
   if(milestones.length===2){
    await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('stitcho');});
    s=await step(600);assert.equal(s.hero,'kilo');assert.equal(s.world1.done,2);assert.ok(s.xp>=140);await page.locator('#game').focus();
   }
  }
  const earnedAir=await page.evaluate(()=>window.__OHANA_E2E.kiloAirState());
  if(!airResumed&&earnedAir.chimes.length===3&&earnedAir.chimes.every(c=>c.done)){
   await page.screenshot({path:'test-results/v501/kilo-air-trail-complete.png'});
   await page.evaluate(()=>{localStorage.setItem('ohana-resume','1');window.__OHANA_E2E.startWorld1('kilo');});
   s=await step(600);const restoredAir=await page.evaluate(()=>window.__OHANA_E2E.kiloAirState());
   assert.ok(restoredAir.chimes.every(c=>c.done));assert.equal(s.kiloFlight.mode,null,'Continue restores safe grounded control, not a suspended flight');
   assert.equal(s.evo,4);airResumed=true;await page.locator('#game').focus();
  }
  if(i%100===0)await page.screenshot({path:'test-results/v501/kilo-pilot-debug.png'});
  if(i%100===0)console.log('KILO PILOT',JSON.stringify({i,x:s.player.x,hp:s.hp,evo:s.evo,notes:s.world1.done,foes:near?.hp,y:s.player.y,grounded:s.player.grounded,vx:s.player.vx,dx}));
 }
 await page.clock.runFor(100);
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.kiloAirState())).chimes.filter(c=>c.done).length,3);
 assert.equal(s.world1.done,4);assert.equal(s.evo,4);assert.equal(s.world1.sealed,true);assert.ok(s.world1Seals.includes('kilo'));assert.ok(deaths<=8);
 assert.equal((await page.evaluate(()=>window.__OHANA_E2E.roomCast())).some(e=>e.miniBoss&&e.hp>0),false);
 assert.deepEqual([...forms],[0,1,2,3,4]);
 assert.ok(guardianPhases.has('warn'));assert.ok(guardianPhases.has('rest'));
 assert.ok(milestones.every((m,i)=>m.xp>=[55,140,260,420][i]));
 assert.equal(await page.locator('#ability-bar').isVisible(),false,'story hides combat powers');
 await page.screenshot({path:'test-results/v501/kilo-chapter-complete.png'});
 await step(600);await page.clock.runFor(100);await page.screenshot({path:'test-results/v501/kilo-stage-after-combat.png'});
 await fs.writeFile('test-results/v501/kilo-chapter-pilot.json',JSON.stringify({deaths,forms:[...forms],guardianPhases:[...guardianPhases],airChimes:3,airContinueVerified:airResumed,milestones,final:{hp:s.hp,evo:s.evo,sealed:s.world1.sealed}},null,2));
 assert.deepEqual(errors,[]);console.log('PASS Kilo physical chapter: four notes, earned five forms, solar flight and three earned air chimes, real guardian defeated, seal; natural retries '+deaths);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
