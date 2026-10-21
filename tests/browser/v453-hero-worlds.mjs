import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

const server=await startServer(0);let browser;
try {
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');
 await page.locator('.oi-enter').click();
 await page.locator('#family-camp').waitFor();
 await fs.mkdir('test-results/v453',{recursive:true});
 const stage=await page.evaluate(()=>window.__OHANA_E2E.start('stitcho'));
 assert.equal(stage.roomName,'Archipiélago del Caos');
 assert.equal(stage.stitchoTrail.index,0);
 assert.equal(stage.heroCollection.total,100);
 assert.equal(stage.heroCollection.hero,'stitcho');
 assert.ok(stage.worldW>=4000);
 await page.screenshot({path:'test-results/v453/stitcho-archipelago-desktop.png'});
 const progress=await page.evaluate(()=>{
  const e=window.__OHANA_E2E;
  const at=(x,y)=>e.setPlayer(x-15,y-20);
  at(430,1074);e.interact();
  for(const [x,y] of [[540,1070],[830,836]])at(x,y);
  at(1720,1090);e.interact();
  for(const [x,y] of [[1480,1086],[2000,1084]])at(x,y);
  at(3050,1084);e.interact();e.step(5);
  return {state:e.state(),boss:e.roomCast().find(x=>x.stitchoBoss)};
 });
 assert.equal(progress.state.stitchoTrail.index,3);
 assert.equal(progress.state.stitchoTrail.shards>=4,true);
 assert.ok(progress.boss,'Stitcho must spawn an independent boss');
 assert.equal(progress.boss.max,480);
 assert.equal(progress.boss.stitchoBoss.tier,1);
 // Real authored three-tier reactions and changing warning phases.
 const phases=await page.evaluate(()=>{
  const e=window.__OHANA_E2E,tiers=[];
  e.setInvulnerable(600);e.setPlayer(3290,1080);
  for(const hp of [480,275,80]){
   e.setStitchoBossHp(hp);e.step(3);
   tiers.push(e.roomCast().find(x=>x.stitchoBoss)?.stitchoBoss.tier);
  }
  e.setStitchoBossHp(0);e.step(80);
  const killed=e.roomCast().some(x=>x.stitchoBoss);
  e.loadRoom('beach');e.loadRoom('hub');
  return {tiers,killed,returnState:e.state(),stillBoss:e.roomCast().some(x=>x.stitchoBoss)};
 });
 assert.deepEqual(phases.tiers,[1,2,3]);
 assert.equal(phases.killed,false,'boss must be removable by real death pipeline');
 assert.equal(phases.stillBoss,false,'boss defeat must survive room transitions');
 assert.equal(phases.returnState.stitchoTrail.cleared,true);
 // Each personal collection has exactly 100 actual positioned pickups.
 const stitchoMemories=await page.evaluate(()=>{
  const e=window.__OHANA_E2E,items=e.heroItems();
  if(items.length!==100)throw Error('Stitcho missing collectible placements');
  // A single teleport can be resolved against a platform/gate before the
  // pickup detector runs. Retry with small collider offsets; all successes
  // must still come from the real spatial pickup pipeline, never grantHeroItem.
  const attempts=[];
  for(const [dx,dy] of [[-15,-20],[-10,-18],[-16,-9],[0,-20],[-25,-25]]){
   for(const item of items){e.setInvulnerable(600);e.setPlayer(item.x+dx,item.y+dy);}
   attempts.push({dx,dy,count:e.state().heroCollection.count});
   if(e.state().heroCollection.count===100)break;
  }
  return {...e.state().heroCollection,attempts};
 });
 assert.equal(stitchoMemories.count,100,'Stitcho collectible collisions: '+JSON.stringify(stitchoMemories.attempts));
 assert.equal(stitchoMemories.complete,true);
 assert.equal(stitchoMemories.reward,'CORAZÓN GALÁCTICO');
 await page.screenshot({path:'test-results/v453/stitcho-hundred-memory-reward.png'});
 // Kilo's hundred-piece special is a different trophy, never inherited.
 const kilo=await page.evaluate(()=>{
  const e=window.__OHANA_E2E;e.start('kilo');
  const items=e.heroItems();
  if(items.length!==100)throw Error('Kilo missing collectible placements');
  // A single teleport can be resolved against a platform/gate before the
  // pickup detector runs. Retry with small collider offsets; all successes
  // must still come from the real spatial pickup pipeline, never grantHeroItem.
  const attempts=[];
  for(const [dx,dy] of [[-15,-20],[-10,-18],[-16,-9],[0,-20],[-25,-25]]){
   for(const item of items){e.setInvulnerable(600);e.setPlayer(item.x+dx,item.y+dy);}
   attempts.push({dx,dy,count:e.state().heroCollection.count});
   if(e.state().heroCollection.count===100)break;
  }
  return {...e.state().heroCollection,attempts};
 });
 assert.equal(kilo.count,100,'Kilo collectible collisions: '+JSON.stringify(kilo.attempts));
 assert.equal(kilo.complete,true);
 assert.equal(kilo.reward,'CANCIÓN DEL HOGAR');
 assert.notEqual(kilo.reward,stitchoMemories.reward);
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/v453/kilo-hundred-mobile.png'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);
 console.log('PASS V453: independent Stitcho stage, three gated acts, 480HP three-phase boss, persistent defeat, 100+100 personal relics and mobile render.');
} finally {
 await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
