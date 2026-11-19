// Rendering and access fixtures, separate from the earned Michi journey.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:'/usr/bin/chromium'}),out='test-results/v801';
try{
 await fs.mkdir(out,{recursive:true});const p=await browser.newPage({viewport:{width:1500,height:880}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await p.waitForFunction(()=>window.__OHANA_E2E);
 const gallery=await p.evaluate(async()=>{
  const {ROSTER}=await import('/characters/roster.js'),{drawCharacter}=await import('/characters/draw.js');
  const canvas=document.createElement('canvas');canvas.id='cast-sheet';canvas.width=1500;canvas.height=850;canvas.style.cssText='position:fixed;inset:0;z-index:2147483647;width:1500px;height:850px';document.body.append(canvas);const c=canvas.getContext('2d'),rows=['ia','nacar','yomi'],report=[];
  for(let row=0;row<3;row++)for(let form=0;form<5;form++){
   const id=rows[row],def=ROSTER.find(h=>h.id===id),f=def.forms[form],x=form*300,y=row*280;c.fillStyle=['#142e40','#123c4b','#302b40'][row];c.fillRect(x,y,298,278);c.fillStyle='#e9dac0';c.font='600 14px sans-serif';c.fillText(f.name,x+18,y+30,270);
   const actor={id,evo:form,x:x+150-f.w/2,y:y+230-f.h,w:f.w,h:f.h,color:f.color,visualScale:1.4,grounded:true,facing:1,vx:0,vy:0,health:f.hp,maxHealth:f.hp,abilities:def.abilities,cds:{}};
   for(const state of ['idle','run','jump','attack','hurt','victory']){const a={...actor,vx:state==='run'?3:0,grounded:state!=='jump',attackT:state==='attack'?10:0};const physical=o=>JSON.stringify([o.x,o.y,o.w,o.h,o.evo,o.vx,o.vy,o.health]);const before=physical(a);c.save();drawCharacter(c,a,{x:0,y:0},73,{reduceMotion:true});c.restore();if(physical(a)!==before)throw Error('renderer changed actor '+id);}
   c.fillStyle=['#142e40','#123c4b','#302b40'][row];c.fillRect(x,y+45,298,230);drawCharacter(c,actor,{x:0,y:0},73,{reduceMotion:true});report.push({id,form});
  }return report;
 });
 assert.equal(gallery.length,15);await p.locator('#cast-sheet').screenshot({path:out+'/michi-nacar-yomi.png'});await p.locator('#cast-sheet').evaluate(el=>el.remove());
 await p.evaluate(()=>{const e=window.__OHANA_E2E;e.manualClock();e.startWorld1('nacar');e.step(600);});let s=await p.evaluate(()=>window.__OHANA_E2E.state());assert.equal(s.hero,'nacar');assert.equal(s.roomId,'w1-nacar');assert.equal(s.evo,0);
 for(let evo=1;evo<=4;evo++){
  await p.evaluate(evo=>dispatchEvent(new CustomEvent('ohana-evolve',{detail:{id:'nacar',evo}})),evo);await p.locator('#evo-stage.show').waitFor({timeout:10000});await p.screenshot({path:out+'/nacar-evolution-'+evo+'.png'});await p.locator('#evo-stage .evo-skip').click();await p.waitForTimeout(150);
 }
 await p.evaluate(()=>{const e=window.__OHANA_E2E;e.setEvo(4);e.cast(2);e.step(40);});assert.equal((await p.evaluate(()=>window.__OHANA_E2E.state())).runtimeFaults,0);assert.deepEqual(errors,[]);
 const native=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});native.on('pageerror',e=>errors.push(e.message));await native.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await native.locator('#ohana-intro .oi-enter').click();await native.locator('.char-card[data-id=nacar]').click();assert.equal(await native.locator('#atlas-stage-index').textContent(),'11 / 12');for(let i=0;i<3;i++)await native.locator('#atlas-next').click();await native.waitForFunction(()=>window.__OHANA_E2E?.state().running);const chosen=await native.evaluate(()=>window.__OHANA_E2E.state());assert.equal(chosen.hero,'nacar');assert.equal(chosen.roomId,'w1-nacar');assert.equal(chosen.evo,0);await native.close();
 const ai=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});ai.on('pageerror',e=>errors.push(e.message));await ai.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await ai.locator('#ohana-intro .oi-enter').click();await ai.locator('.char-card[data-id=ia]').click();assert.equal(await ai.locator('#atlas-stage-index').textContent(),'12 / 12');for(let i=0;i<3;i++)await ai.locator('#atlas-next').click();await ai.waitForFunction(()=>window.__OHANA_E2E?.state().running);const aiState=await ai.evaluate(()=>window.__OHANA_E2E.state());assert.equal(aiState.hero,'ia');assert.equal(aiState.roomId,'w1-yomi');assert.deepEqual(errors,[]);await ai.close();
 
 await fs.writeFile(out+'/cast.json',JSON.stringify({gallery,marineEntry:true,independentIAEntry:true,evolutionMovies:4,errors},null,2));console.log('PASS 15 production forms, 90 state renders, marine chapter entry, four evolution movies');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
