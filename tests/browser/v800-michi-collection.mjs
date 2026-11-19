// Continues the actual saved keyboard journey, never grants album items or echoes.
import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:'/usr/bin/chromium'}),out='test-results/v800';
try{
 const saved=JSON.parse(await fs.readFile(process.env.OHANA_MICHI_COLLECTION_RESUME||out+'/earned-boss-storage.json','utf8')),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(items=>{if(localStorage.getItem('ohana'))return;for(const it of items)localStorage.setItem(it.name,it.value);},saved.origins[0].localStorage);
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.waitForFunction(()=>window.__OHANA_E2E);await page.evaluate(()=>window.__OHANA_E2E.manualClock());await page.locator('.atlas-resume').click();
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state()),world=()=>page.evaluate(()=>window.__OHANA_E2E.michiSanctuaryState()),step=n=>page.evaluate(n=>window.__OHANA_E2E.step(n),n),key=async(k,n=1)=>{await page.keyboard.down(k);const s=await step(n);await page.keyboard.up(k);return s;};
 const scenes=new Set();async function film(){for(let i=0;i<20;i++){const s=await state();if(!s.world1Cine)break;scenes.add(s.world1Cine);await page.screenshot({path:out+'/story-'+s.world1Cine+'.png'});await step(270);}await page.locator('#game').focus();}
 let s=await state();assert.equal((await world()).guardianDefeated,true);assert.equal(s.evo,4);await film();
 async function go(x){let last=-999,stuck=0;for(let i=0;i<450;i++){s=await state();if(s.world1Cine){await film();continue;}assert.ok(s.hp>0,'physical collection route died');const p=s.player,dx=x-p.x-p.w/2;if(Math.abs(dx)<13){for(let b=0;b<12&&Math.abs(s.player.vx)>.25;b++)s=await key(s.player.vx>0?'a':'d',1);return;}
  stuck=Math.abs(p.x-last)<2?stuck+1:0;last=p.x;await page.keyboard.down(dx>0?'d':'a');if(stuck>2)await page.keyboard.down(' ');await step(Math.abs(dx)<100?3:10);await page.keyboard.up(' ');await page.keyboard.up(dx>0?'d':'a');}throw Error('walk stalled '+x+' '+JSON.stringify((await state()).player));}
 async function passage(x){x=({3870:3670,5340:5550,3540:9430})[x]||x;await go(x);const destination=await page.evaluate(async x=>(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-cat'].michiSanctuary.passages.filter(a=>a.x===x).sort((a,b)=>Math.abs(a.floor-(window.__OHANA_E2E.state().player.y+window.__OHANA_E2E.state().player.h))-Math.abs(b.floor-(window.__OHANA_E2E.state().player.y+window.__OHANA_E2E.state().player.h)))[0],x);if(destination?.walkThrough){await go(destination.toX);console.log('NATURAL TRAIL',destination.id);return;}const before=(await state()).player;for(let i=0;i<70;i++){let here=(await state()).player;if(Math.abs(here.x+here.w/2-x)>35){await go(x);here=(await state()).player;}const feet=here.y+here.h;if(destination&&Math.abs(feet-destination.floor)>90)await key(feet<destination.floor?'ArrowDown':' ',3);else await key('e',1);await step(12);const p=(await state()).player;if(destination&&Math.abs(p.x+p.w/2-destination.toX)<120&&Math.abs(p.y+p.h-destination.toFloor)<100){console.log('TUNNEL',x,(await world()).zone);await film();return;}}throw Error('tunnel '+x+' '+JSON.stringify((await state()).player));}
 async function echo(x,y){await go(x);for(let i=0;i<130;i++){const ex=await page.evaluate(()=>window.__OHANA_E2E.expeditionState()),p=(await state()).player;if(ex.done.length===3||ex.done.includes('w1-cat-v2-trial-'+(x===4100?0:x===5070?1:2)))break;await key(p.y+p.h/2<y-20?'ArrowDown':' ',4);await step(1);}console.log('ECHO',await page.evaluate(()=>window.__OHANA_E2E.expeditionState()));await film();}
 async function collect(zone,floor){
  const items=(await world()).remaining.filter(m=>Math.abs(m.y-(floor-27))<1).sort((a,b)=>a.x-b.x);if(!items.length)return;
  // Hold descent through the sweep: fresh Down enters arches, held Down doesn't.
  await page.keyboard.down('ArrowDown');for(const m of items){await go(m.x);await step(35);await key('j',1);await key('k',1);}await page.keyboard.up('ArrowDown');await film();const w=await world();console.log('ALBUM',zone,w.album.found.length,'remaining',w.remaining.filter(m=>m.y===floor-27).map(m=>m.id));await page.screenshot({path:out+'/zone-'+zone+'.png'});
 }
 if(!process.env.OHANA_MICHI_COLLECTION_RESUME){await passage(8340);await passage(7820);await collect('court',1134);for(const x of [1800,1360,1580]){await go(x);await step(40);await key('e',1);await step(5);}await echo(4100,930);await echo(5070,930);
 await passage(3870);await collect('crypt',1860);await passage(1150);await collect('gallery',820);await passage(610);await passage(5340);await collect('maze',1134);await passage(6180);await collect('canopy',620);await page.context().storageState({path:out+'/earned-canopy-storage.json'});}await passage(6180);await go(6790);await step(40);await key('e',1);await step(40);assert.ok((await world()).gardenSecrets.includes('w1-cat-garden-wind'),'native wind flower');await passage(7580);await collect('tide',300);await go(1740);await step(40);await key('e',1);await step(60);await passage(2860);
 for(const m of (await world()).remaining.filter(m=>m.id>=97)){
  await go(m.x);
  for(let i=0;i<140;i++){
   if(!(await world()).remaining.some(q=>q.id===m.id))break;
   const p=(await state()).player,dx=m.x-p.x-p.w/2,dy=m.y-p.y-p.h/2;
   if(Math.abs(dx)>10)await key(dx>0?'d':'a',1);
   await key(dy<0?' ':'ArrowDown',3);await step(1);
  }
  assert.ok(!(await world()).remaining.some(q=>q.id===m.id),'high wind-route memory '+m.id);
 }
 await echo(7400,450);
 let w=await world();assert.equal(w.album.found.length,100,'100 physically collected memories');assert.equal(w.album.relic,true);assert.ok(scenes.has('chapterHundred'));assert.equal((await state()).world1.sealed,true);await page.context().storageState({path:out+'/earned-100-storage.json'});
 await page.reload();await page.waitForFunction(()=>window.__OHANA_E2E);await page.evaluate(()=>window.__OHANA_E2E.manualClock());await page.locator('.atlas-resume').click();await film();w=await world();assert.equal(w.album.found.length,100);assert.equal(w.guardianDefeated,true);assert.equal((await state()).world1.sealed,true);assert.notEqual((await state()).world1Cine,'chapterHundred');
 const restored=(await world()).zone;if(restored==='canopy')await passage(7780);if(restored==='court')await passage(5340);await passage(8030);await passage(3540);await film();assert.ok(scenes.has('chapterExit'));await page.screenshot({path:out+'/exit-dock.png'});
 await fs.writeFile(out+'/collection.json',JSON.stringify({count:w.album.found.length,relic:w.album.relic,sealed:true,scenes:[...scenes],errors},null,2));assert.deepEqual(errors,[]);console.log('PASS native hundred memories, echoes, seal, ceremony and Continue');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
