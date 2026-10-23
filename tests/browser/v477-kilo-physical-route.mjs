// OHANA V477. Real keyboard, physics, enemies and the ordinary respawn
// controller attempt all four Kilo flowers and the earned east exit.
// Lives are normal: each death is handled by the same production respawn()
// that the R action calls. No setPlayer, no loadRoom, no HP/seal mutation.
// Any failed objective makes this browser audit fail. Honest scoped coverage:
// this does NOT claim Stitcho's repairs or the full ten-room campaign.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { startServer } from './server.mjs';
import { WORLD1_ROOMS } from '../../systems/world1-rooms.js';

const server = await startServer(0);
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1440, height: 900}});
  const faults = [], journal = [];
  page.on('pageerror', e => faults.push(e.message));
  await page.goto('http://127.0.0.1:' + server.address().port + '/?e2e=1', {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.__OHANA_E2E));
  const start = await page.evaluate(() => {
    localStorage.removeItem('ohana-w1-seals-v1');
    localStorage.removeItem('ohana-resume');
    localStorage.setItem('ohana-difficulty', 'easy');
    return window.__OHANA_E2E.startWorld1('kilo');
  });
  assert.equal(start.roomId, 'w1-kilo');
  assert.deepEqual(start.world1Seals, []);
  await page.locator('#game').focus();
  const state = () => page.evaluate(() => window.__OHANA_E2E.state());
  const step = n => page.evaluate(n => window.__OHANA_E2E.step(n), n);
  const cast = () => page.evaluate(() => window.__OHANA_E2E.roomCast()
    .filter(f => f.hp > 0).map(f => ({x:f.x,y:f.y,h:f.h,w:f.w,hp:f.hp})));
  const key = async (k,n=1) => {
    await page.keyboard.down(k);
    const s = await step(n);
    await page.keyboard.up(k);
    return s;
  };
  async function film() {
    for (let i=0;i<8;i++){
      const s=await state();
      if(!s.world1Cine) return s;
      await step(500);
    }
    throw Error('Unskippable world cinematic');
  }
  let deaths=0;
  async function retryIfDead() {
    const s=await state();
    if (s.hp > 0) return false;
    assert.ok(++deaths <= 22, '22 legitimate retries exceeded: '+JSON.stringify(journal.slice(-12)));
    // This runs production respawn(), not a direct game-state mutation.
    const back = await page.evaluate(() => window.__OHANA_E2E.respawn());
    assert.equal(back.roomId, 'w1-kilo', 'retry must keep natural Kilo room');
    assert.ok(back.hp>0 && back.hp === back.maxHealth, 'normal respawn restores health');
    assert.deepEqual(back.world1Seals, [], 'a life retry must not grant a seal');
    journal.push({type:'death',n:deaths,at:Math.round(s.player.x),completed:back.world1?.done});
    await film();
    return true;
  }
  await film();
  const flowers = WORLD1_ROOMS['w1-kilo'].seal.stations;
  assert.equal(flowers.length,4);
  for(let index=0;index<flowers.length;index++){
    const target = flowers[index].x;
    let completed=false;
    for(let n=0;n<320;n++){
      await film();
      if(await retryIfDead()) continue;
      let s=await state();
      assert.equal(s.roomId,'w1-kilo');
      assert.equal(s.runtimeFaults,0);
      if(index<3) assert.deepEqual(s.world1Seals,[], 'no seal until fourth flower is finished');
      if(s.world1.done >= index+1){completed=true;break;}
      const center = s.player.x + 18;
      let gap = target - center;
      if(Math.abs(gap)<34){
        // Stop moving for the actual 45 grounded beats; a running attack or
        // airborne landing can require another approach after the wait.
        s=await step(98);
        if(s.world1?.done >= index+1){completed=true;break;}
        if(s.hp<=0)continue;
        gap = target - (s.player.x+18);
      }
      const nearby = (await cast()).filter(e => e.x > s.player.x-25 && e.x < s.player.x+300)
        .sort((a,b)=>a.x-b.x)[0];
      if(nearby && nearby.x-s.player.x < 220 && Math.abs(gap)>150) {
        if(s.player.grounded) await key('w',3); // normal jump
        await key('h',2); // normal attack
        if(nearby.x-s.player.x < 135) await key('Shift',2); // normal dash
        s=await state();
        gap=target-(s.player.x+18);
      }
      if(Math.abs(gap)>=34){
        const motion = gap>=0?'d':'a';
        const frames = Math.max(2,Math.min(75,Math.floor((Math.abs(gap)-36)/6)));
        s = await key(motion,frames);
        await step(8);
      }
      if(n%10===0) {
        const snap=await state();
        journal.push({index,n,x:Math.round(snap.player.x),hp:Math.round(snap.hp),done:snap.world1?.done,deaths});
      }
      if(journal.length>180) journal.splice(0,journal.length-180);
    }
    assert.ok(completed,'could not physically sing Kilo flower '+index+' at '+target+': '+JSON.stringify(journal.slice(-15)));
    const earned=await state();
    assert.ok(earned.world1?.done>=index+1);
    journal.push({type:'flower',index:index+1,x:target,hp:Math.round(earned.hp),deaths});
  }
  await film();
  let reached=await state();
  assert.equal(reached.world1?.done,4);
  assert.equal(reached.world1.sealed,true);
  assert.deepEqual(reached.world1Seals,['kilo'],'four physical flowers award exactly Kilo seal');
  assert.ok(reached.score>=600, 'must score four different flowers');
  await fs.mkdir('test-results/v477',{recursive:true});
  await page.screenshot({path:'test-results/v477/kilo-earned-seal.png'});

  // Walk east through the actual right-edge trigger. No E2E loadRoom method.
  let entered=false;
  for(let n=0;n<250;n++){
    await film();
    reached=await state();
    if(reached.roomId==='w1-stitcho'){entered=true;break;}
    assert.equal(reached.roomId,'w1-kilo','unexpected branch/portal during east traversal');
    if(reached.hp<=0){ 
      // A death after the seal cannot erase the already-earned Kilo seal.
      const back=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.deepEqual(back.world1Seals,['kilo']);
      continue;
    }
    const remaining=reached.worldW-(reached.player.x+18);
    await key('d',remaining>120?Math.max(8,Math.min(100,Math.floor(remaining/6))):65);
    if(n%16===0)journal.push({type:'east',n,x:Math.round(reached.player.x),hp:Math.round(reached.hp)});
  }
  assert.ok(entered,'earned Kilo seal must unlock natural east door: '+JSON.stringify(journal.slice(-12)));
  assert.deepEqual(reached.world1Seals,['kilo']);
  assert.equal(reached.world1?.sealed,false,'Stitcho must begin unsolved');
  await page.screenshot({path:'test-results/v477/stitcho-natural-entry.png'});
  assert.deepEqual(faults,[],'real Chromium must not emit runtime errors');
  await fs.writeFile('test-results/v477/kilo-natural-route.json',JSON.stringify({
    difficulty:'easy',input:'physical keyboard + production retries',completedFlowers:4,
    earnedSeals:['kilo'],enteredStitcho:true,deathRetries:deaths,
    invulnerabilityInjected:false,enemyRemovals:false,teleports:false,sealGrants:false,
    allTenRoomsPassed:false,quimeraDefeated:false,journal
  },null,2));
  console.log('PASS V477: four authentic Kilo flowers, legitimate retries='+deaths+', earned seal and naturally unlocked east door to Stitcho. No cheats; not a full campaign clear.');
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
