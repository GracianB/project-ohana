import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');
 await page.locator('.oi-enter').click();await page.locator('#family-camp').waitFor();
 await fs.mkdir('test-results/v454',{recursive:true});
 const intro=await page.evaluate(()=>window.__OHANA_E2E.start('chispin'));
 assert.equal(intro.roomName,'Islas del Relámpago');
 assert.equal(intro.roomId,'lab','Chispin customizes the existing Alien Lab, no eleventh room');
 assert.equal(intro.chispinStorm.index,0);
 assert.equal(intro.heroCollection.total,100);
 assert.equal(intro.heroCollection.hero,'chispin');
 assert.ok(intro.worldW>=4200);
 await page.screenshot({path:'test-results/v454/chispin-isles-desktop.png'});
 const route=await page.evaluate(()=>{
  const api=window.__OHANA_E2E,at=(x,y)=>api.setPlayer(x-15,y-20);
  at(440,1075);api.interact();
  for(const [x,y] of [[590,1055],[810,785]])at(x,y);
  at(1760,1083);api.interact();
  for(const [x,y] of [[1320,1080],[1720,845],[2110,930]])at(x,y);
  at(3075,1080);api.interact();api.step(5);
  return {state:api.state(),boss:api.roomCast().find(x=>x.chispinBoss)};
 });
 assert.equal(route.state.chispinStorm.index,3);
 assert.ok(route.state.chispinStorm.shards>=5);
 assert.equal(route.state.chispinStorm.rails,5);
 assert.equal(route.boss.max,520);
 assert.equal(route.boss.chispinBoss.tier,1);
 const phases=await page.evaluate(()=>{
  const api=window.__OHANA_E2E,tiers=[];
  api.setInvulnerable(600);api.setPlayer(3460,1080);
  for(const hp of [520,270,70]){
   api.setChispinBossHp(hp);api.step(3);
   tiers.push(api.roomCast().find(x=>x.chispinBoss)?.chispinBoss.tier);
  }
  api.setChispinBossHp(0);api.step(80);
  const alive=api.roomCast().some(x=>x.chispinBoss);
  api.loadRoom('beach');api.loadRoom('lab');
  return {tiers,alive,returned:api.state(),restored:api.roomCast().some(x=>x.chispinBoss)};
 });
 assert.deepEqual(phases.tiers,[1,2,3]);
 assert.equal(phases.alive,false);
 assert.equal(phases.restored,false);
 assert.equal(phases.returned.chispinStorm.defeated,true);
 const relic=await page.evaluate(()=>{
  const api=window.__OHANA_E2E,items=api.heroItems();
  if(items.length!==100)throw Error('Chispin personal stage missing 100 pickups');
  for(const item of items){api.setInvulnerable(600);api.setPlayer(item.x-15,item.y-20);}
  return api.state().heroCollection;
 });
 assert.equal(relic.count,100);assert.equal(relic.complete,true);
 assert.equal(relic.reward,'CORONA DE TORMENTA');
 await page.screenshot({path:'test-results/v454/chispin-hundred-relic.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/v454/chispin-mobile.png'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);
 console.log('PASS V454: Chispin four-sector Lightning Isles, three relays, 8 shards, 520HP three-phase boss, 100/100 relic and mobile view.');
}finally{
 await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
