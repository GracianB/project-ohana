// OHANA V480. Real keyboard, physics, enemies and the ordinary respawn
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
  // Natural Stitcho delivery, immediately after the genuine Kilo door.
  // The first repair is part ID zero. The player must first pick up the
  // physical item and then carry it 520 world pixels to its own workshop.
  // Death drops an undelivered item and requires picking it up again.
  await film();
  const part = WORLD1_ROOMS['w1-stitcho'].seal.stations[0];
  assert.equal(part.id,0);
  assert.equal(reached.world1?.done,0);
  let delivered=false, stage='collect', repairDeaths=0;
  for(let n=0;n<350;n++){
    await film();
    let s=await state();
    assert.equal(s.roomId,'w1-stitcho','must stay in the room unlocked physically');
    if(s.world1?.done>=1){delivered=true;break;}
    if(s.hp<=0){
      assert.ok(++repairDeaths<=12,'Stitcho repair exceeded 12 normal lives: '+JSON.stringify(journal.slice(-15)));
      const back=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.ok(back.hp>0,'retry must heal normally');
      assert.equal(back.world1?.done,0,'unfulfilled part must not be granted on retry');
      assert.deepEqual(back.world1Seals,['kilo']);
      stage='collect';
      journal.push({type:'stitcho-death',n,death:repairDeaths,x:Math.round(s.player.x)});
      continue;
    }
    let target=stage==='collect'?part.x:part.target.x;
    let gap=target-(s.player.x+18);
    if(Math.abs(gap)<36){
      s=await step(100); // land: pickup needs the real player's vertical overlap
      if(s.hp<=0)continue;
      if(stage==='collect'){stage='deliver';target=part.target.x;gap=target-(s.player.x+18);}
      else if(s.world1?.done>=1){delivered=true;break;}
      else if(n%20===0){ // a premature airborne pickup requires re-approach
        stage='collect';target=part.x;gap=target-(s.player.x+18);
      }
    }
    const foe=(await cast()).filter(e=>e.x>s.player.x-20&&e.x<s.player.x+300)
      .sort((a,b)=>a.x-b.x)[0];
    if(foe&&foe.x-s.player.x<215&&Math.abs(gap)>150){
      if(s.player.grounded)await key('w',3);
      await key('h',2);
      if(foe.x-s.player.x<135)await key('Shift',2);
      s=await state();
      gap=target-(s.player.x+18);
    }
    if(Math.abs(gap)>=30){
      const dir=gap>0?'d':'a';
      await key(dir,Math.max(2,Math.min(75,Math.floor((Math.abs(gap)-32)/6))));
      await step(8);
    }
    if(n%12===0){const h=await state();journal.push({type:'repair',stage,n,x:Math.round(h.player.x),hp:Math.round(h.hp),done:h.world1?.done});}
    if(journal.length>220)journal.splice(0,journal.length-220);
  }
  assert.ok(delivered,'first physical Stitcho delivery failed: '+JSON.stringify(journal.slice(-15)));
  const deliveredState=await state();
  assert.equal(deliveredState.world1?.done,1,'part ID zero must reach its real target');
  assert.equal(deliveredState.world1?.sealed,false,'partial Stitcho repair cannot grant a seal');
  assert.deepEqual(deliveredState.world1Seals,['kilo'],'the only earned seal remains Kilo');
  await fs.mkdir('test-results/v478',{recursive:true});
  await page.screenshot({path:'test-results/v478/stitcho-delivered-part-zero.png'});
  // Complete Stitcho's second and third repairs on the same natural route.
  // The room's independent-delivery checkpoint survives ordinary death;
  // carried items do not survive and must be picked up from their source again.
  let moreDeaths=0;
  for(let index=1;index<=2;index++){
    const task=WORLD1_ROOMS['w1-stitcho'].seal.stations[index];
    assert.equal(task.id,index);
    let stage='collect', completed=false;
    for(let n=0;n<400;n++){
      await film();
      let s=await state();
      assert.equal(s.roomId,'w1-stitcho');
      if(s.world1?.done>=index+1){completed=true;break;}
      if(s.hp<=0){
        assert.ok(++moreDeaths<=22,'too many normal Stitcho retries: '+JSON.stringify(journal.slice(-16)));
        const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
        assert.equal(retry.roomId,'w1-stitcho');
        assert.ok(retry.world1.done>=index,'the already delivered repairs must survive death');
        assert.deepEqual(retry.world1Seals,['kilo'],'death must not award Stitcho');
        stage='collect';
        journal.push({type:'stitcho-retry',part:index,at:Math.round(s.player.x),n});
        continue;
      }
      const target=stage==='collect'?task.x:task.target.x;
      let gap=target-(s.player.x+18);
      if(Math.abs(gap)<38){
        s=await step(100);
        if(s.hp<=0)continue;
        if(s.world1?.done>=index+1){completed=true;break;}
        if(stage==='collect')stage='deliver';
        else if(n%18===0)stage='collect';
        gap=(stage==='collect'?task.x:task.target.x)-(s.player.x+18);
      }
      const foe=(await cast()).filter(e=>e.x>s.player.x-25&&e.x<s.player.x+290)
        .sort((a,b)=>a.x-b.x)[0];
      if(foe && foe.x-s.player.x<220 && Math.abs(gap)>155){
        if(s.player.grounded)await key('w',3);
        await key('h',2);
        if(foe.x-s.player.x<130)await key('Shift',2);
        s=await state();
        gap=(stage==='collect'?task.x:task.target.x)-(s.player.x+18);
      }
      if(Math.abs(gap)>30){
        await key(gap>0?'d':'a',Math.max(2,Math.min(70,Math.floor((Math.abs(gap)-32)/6))));
        await step(8);
      }
      if(n%15===0){const ss=await state();journal.push({type:'stitcho-task',part:index,stage,n,x:Math.round(ss.player.x),hp:Math.round(ss.hp),done:ss.world1?.done});}
      if(journal.length>260)journal.splice(0,journal.length-260);
    }
    assert.ok(completed,'the Stitcho part '+index+' was not delivered physically: '+JSON.stringify(journal.slice(-16)));
    const ss=await state();
    assert.ok(ss.world1?.done>=index+1);
    journal.push({type:'stitcho-delivered',part:index,deaths:moreDeaths});
  }
  await film();
  let completedDock=await state();
  assert.equal(completedDock.world1?.done,3,'all three workshop repairs must be real');
  assert.equal(completedDock.world1?.sealed,true,'third repair must earn Stitcho seal');
  assert.deepEqual(completedDock.world1Seals,['kilo','stitcho']);
  await fs.mkdir('test-results/v479',{recursive:true});
  await page.screenshot({path:'test-results/v479/stitcho-earned-complete-seal.png'});
  let nextDoor=false;
  for(let n=0;n<260;n++){
    await film();
    completedDock=await state();
    if(completedDock.roomId==='w1-chispin'){nextDoor=true;break;}
    assert.equal(completedDock.roomId,'w1-stitcho');
    if(completedDock.hp<=0){
      const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.deepEqual(retry.world1Seals,['kilo','stitcho']);
      continue;
    }
    const remaining=completedDock.worldW-(completedDock.player.x+18);
    await key('d',remaining>125?Math.max(8,Math.min(95,Math.floor(remaining/6))):65);
  }
  assert.ok(nextDoor,'earned Stitcho seal must unlock the next physical gate');
  assert.deepEqual(completedDock.world1Seals,['kilo','stitcho']);
  assert.equal(completedDock.world1?.done,0,'Chispín starts at first rod');
  await page.screenshot({path:'test-results/v479/chispin-natural-entry.png'});
  // Chispín uses an ordered lightning chain. Each completed rod extends its
  // 420-tick clock; a late arrival resets ALL unfinished chain progress.
  // Kilo's ordinary 3.6px/tick walk is too slow over 1,600px, so this real
  // keyboard pilot double-taps direction to use the existing 1.4x sprint.
  // Shift is the game's own dash and does not modify position or HP.
  await film();
  const rods=WORLD1_ROOMS['w1-chispin'].seal.stations;
  assert.equal(rods.length,4);
  let chainDeaths=0,chainResets=0,lastDone=0,chainComplete=false;
  for(let n=0;n<750;n++){
    await film();
    let ss=await state();
    assert.equal(ss.roomId,'w1-chispin');
    if(ss.world1?.done===4){chainComplete=true;break;}
    if(ss.hp<=0){
      assert.ok(++chainDeaths<=26,'Chispín exceeded 26 legitimate retries: '+JSON.stringify(journal.slice(-12)));
      const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(retry.roomId,'w1-chispin');
      assert.deepEqual(retry.world1Seals,['kilo','stitcho']);
      journal.push({type:'chispin-death',n,at:Math.round(ss.player.x),death:chainDeaths});
      lastDone=0;
      continue;
    }
    if(ss.world1.done<lastDone)chainResets++;
    lastDone=ss.world1.done;
    const target=rods[ss.world1.done];
    assert.ok(target,'next rod exists');
    let gap=target.x-(ss.player.x+18);
    if(Math.abs(gap)<40){
      ss=await step(12);
      if(ss.world1?.done===4){chainComplete=true;break;}
      if(ss.hp<=0)continue;
      gap=target.x-(ss.player.x+18);
    }
    const nearby=(await cast()).filter(e=>e.x>ss.player.x-30&&e.x<ss.player.x+280)
      .sort((a,b)=>a.x-b.x)[0];
    if(gap>0&&nearby&&nearby.x-ss.player.x<215&&Math.abs(gap)>175){
      if(ss.player.grounded)await key('w',3);
      await key('h',2);
      ss=await state();gap=target.x-(ss.player.x+18);
    }
    if(Math.abs(gap)>=30){
      const dir=gap>0?'d':'a';
      // Real short double-tap starts the sprint mechanic already in the game.
      await page.keyboard.down(dir);await step(1);await page.keyboard.up(dir);
      await step(1);
      await page.keyboard.down(dir);await step(1);
      if(Math.abs(gap)>450&&n%3!==1)await key('Shift',1);
      await step(Math.max(2,Math.min(65,Math.floor((Math.abs(gap)-36)/5))));
      await page.keyboard.up(dir);await step(2);
    }
    if(n%12===0){
      const view=await state();
      journal.push({type:'rod',n,x:Math.round(view.player.x),hp:Math.round(view.hp),
        done:view.world1?.done,resets:chainResets});
    }
    if(journal.length>320)journal.splice(0,journal.length-320);
  }
  assert.ok(chainComplete,'physical Chispín lightning chain did not complete: '+JSON.stringify(journal.slice(-20)));
  await film();
  let thunder=await state();
  assert.equal(thunder.world1?.done,4);
  assert.equal(thunder.world1?.sealed,true);
  assert.deepEqual(thunder.world1Seals,['kilo','stitcho','chispin']);
  await fs.mkdir('test-results/v480',{recursive:true});
  await page.screenshot({path:'test-results/v480/chispin-earned-chain-seal.png'});
  // Gate to Michi is also physical: it cannot be opened from the test API.
  let lunar=false;
  for(let n=0;n<300;n++){
    await film();
    thunder=await state();
    if(thunder.roomId==='w1-cat'){lunar=true;break;}
    assert.equal(thunder.roomId,'w1-chispin');
    if(thunder.hp<=0){
      const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin']);
      continue;
    }
    const remaining=thunder.worldW-(thunder.player.x+18);
    await key('d',remaining>125?Math.max(8,Math.min(95,Math.floor(remaining/5))):65);
  }
  assert.ok(lunar,'physical thunder seal must unlock the Moon Garden');
  assert.deepEqual(thunder.world1Seals,['kilo','stitcho','chispin']);
  assert.equal(thunder.world1?.done,0);
  await page.screenshot({path:'test-results/v480/michi-natural-entry.png'});
  await fs.writeFile('test-results/v480/three-sealed-rooms.json',JSON.stringify({
    difficulty:'easy',earnedSeals:['kilo','stitcho','chispin'],
    roomsCompleted:3,naturallyEntered:'w1-cat',
    authenticKiloFlowers:4,authenticStitchoRepairs:3,authenticChispinRods:4,
    chainDeaths,chainResets,invulnerabilityInjected:false,teleports:false,
    enemiesDeleted:false,sealsGranted:false,fullCampaignComplete:false,
    quimeraDefeated:false,journal
  },null,2));
  console.log('PASS V480: 3 complete natural World 1 seals (Kilo, Stitcho, Chispín), physical lightning chain + entry to Michi.');
  await fs.writeFile('test-results/v479/two-sealed-rooms.json',JSON.stringify({
    difficulty:'easy',physicalSeals:['kilo','stitcho'],naturallyEntered:'w1-chispin',
    kiloDeathRetries:deaths,stitchoFirstRepairDeaths:repairDeaths,otherStitchoDeaths:moreDeaths,
    completedKiloFlowers:4,physicalStitchoRepairs:[0,1,2],
    teleport:false,invulnerabilityInjected:false,enemyRemoval:false,sealGrants:false,
    fullCampaignCompleted:false,quimeraDefeated:false,journal
  },null,2));
  console.log('PASS V479: two full physical seals (Kilo, Stitcho) + natural Chispín door; four flowers and three delivered parts; no synthetic progress.');
  await fs.writeFile('test-results/v478/natural-two-room-route.json',JSON.stringify({
    difficulty:'easy',room:'w1-stitcho',kiloFlowers:4,
    authenticStitchoDeliveries:1,firstDeliveredId:0,
    earnedSeals:deliveredState.world1Seals,kiloDeaths:deaths,stitchoDeaths:repairDeaths,
    teleport:false,invulnerabilityInjected:false,enemiesDeleted:false,sealsInjected:false,
    fullCampaignPassed:false,bossDefeated:false,journal
  },null,2));
  console.log('PASS V478: naturally earned Kilo door plus physical Stitcho part ID zero delivered, normal death retries='+repairDeaths+'; full campaign not claimed.');
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
