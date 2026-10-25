// Presentation fixtures are labelled; they do not claim an earned campaign win.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.keyboard.press('Escape');await page.clock.runFor(100);
 await fs.mkdir('test-results/v512',{recursive:true});
 await page.screenshot({path:'test-results/v512/chapter-selection.png',fullPage:true});
 const gallery=await page.evaluate(async()=>{
  const {ROSTER}=await import('/characters/roster.js'),{drawCharacter}=await import('/characters/draw.js');
  const {buildWorld1Scene}=await import('/systems/world1-cine.js');
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=2200;const ctx=canvas.getContext('2d');
  const before=[];
  for(let row=0;row<ROSTER.length;row++)for(let form=0;form<5;form++){
   const hero=ROSTER[row],f=hero.forms[form],x=form*240,y=row*220;
   if(buildWorld1Scene('roomEnter',hero.id).length!==1)throw Error('duplicate arrival '+hero.id);
   ctx.fillStyle=row%2?'#243b50':'#1b3045';ctx.fillRect(x,y,240,220);
   ctx.fillStyle='#ffe4b0';ctx.font='15px sans-serif';ctx.fillText(hero.name+' · '+(form+1),x+10,y+20);
   const actor={...hero,...f,id:hero.id,evo:form,x:x+120-f.w/2,y:y+200-f.h,w:f.w,h:f.h,vx:0,vy:0,grounded:true,facing:1,visualScale:1,invuln:0,melee:0,_poseOverride:'idle',_introForceCanvas:true};
   const box=[actor.x,actor.y,actor.w,actor.h];drawCharacter(ctx,actor,{x:0,y:0},80,{reduceMotion:true});
   if(JSON.stringify(box)!==JSON.stringify([actor.x,actor.y,actor.w,actor.h]))throw Error('mutated hitbox');
   before.push({hero:hero.id,form,w:f.w,h:f.h});
  }
  return {png:canvas.toDataURL().split(',')[1],forms:before};
 });
 await fs.writeFile('test-results/v512/fifty-forms.png',Buffer.from(gallery.png,'base64'));
 const companions=[];
 for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){
  const result=await page.evaluate(hero=>{
   const e=window.__OHANA_E2E;localStorage.clear();e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(600);e.step(600);e.setEvo(4);
   e.setPlayer(700,1000);e.step(60);e.setInvulnerable(1000);e.campaignContactTarget({isolateRewards:true});
   const cast=e.cast(3);e.step(400);const guest=e.companionActorState(),state=e.state();
   e.step((guest?.life||80)+12);return {cast,guest,ended:e.companionActorState()===null,faults:state.runtimeFaults};
  },hero);
  assert.ok(result.guest,hero+' companion must still exist after six seconds');
  assert.equal(result.guest.age+result.guest.life,480,hero+' exact active-tick lifetime excludes impact freezes');
  assert.ok(Math.abs(result.guest.y-result.guest.heroFoot)<28,hero+' companion stays on hero floor');
  assert.ok(Math.abs(result.guest.x-result.guest.heroX)<=130,hero+' companion stays beside hero');
  assert.equal(result.ended,true,hero+' companion finishes after eight seconds');
  assert.equal(result.faults,0);companions.push({hero,...result});
  if(['kilo','cuerno','cat','yomi'].includes(hero)){
   await page.clock.runFor(100);const rendered=await page.evaluate(()=>window.__OHANA_E2E.state());assert.equal(rendered.runtimeFaults,0,JSON.stringify(rendered));await page.screenshot({path:`test-results/v512/${hero}-final-form.png`});
  }
 }
 await page.evaluate(()=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1('kilo');e.step(600);e.step(250);});
 assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().world1Cine),null,'intro does not chain a second arrival');
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.loadRoom('w1-final');e.step(600);e.step(600);});
 assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().boss),null,'final boss cannot spawn with missing seals');
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{const e=window.__OHANA_E2E;e.startWorld1('cuerno');e.loadRoom('w1-cuerno');e.step(600);e.setEvo(4);e.setInvulnerable(600);});
 await page.clock.runFor(32);await page.screenshot({path:'test-results/v512/cuerno-final-mobile.png'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/v512/review.json',JSON.stringify({forms:gallery.forms.length,companions,errors},null,2));
 console.log('PASS: 50 real forms, ten single arrivals, ten eight-second grounded companions, intro handoff, missing-seal guard and mobile');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
