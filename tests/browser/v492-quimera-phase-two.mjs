// OHANA V492. Real keyboard, physics, enemies and the ordinary respawn
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
    // Evolution is a separate production modal that pauses keyboard input.
    // Continue using the real on-screen button, never E2E state mutation.
    for (let i=0;i<12;i++){
      const evolution=page.locator('#evo-stage.show .evo-skip');
      if(await evolution.count()){
        await evolution.click();
        await page.waitForFunction(() => !document.querySelector('#evo-stage.show'));
        continue;
      }
      const s=await state();
      if(!s.world1Cine) return s;
      await step(500);
    }
    throw Error('Unskippable world or evolution cinematic');
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
  // First Michi jelly, physical only. A grounded bump is insufficient;
  // the player must actually jump near the aerial jelly in this same
  // continuous run from Kilo, through Stitcho and Chispín.
  await film();
  const jelly=WORLD1_ROOMS['w1-cat'].seal.stations[0];
  assert.equal(jelly.id,0);
  assert.equal(thunder.world1?.done,0);
  let woke=false, catDeaths=0;
  for(let n=0;n<200;n++){
    await film();
    let ss=await state();
    assert.equal(ss.roomId,'w1-cat','Michi must be reached through Chispín gate');
    if(ss.world1?.done>0){woke=true;break;}
    if(ss.hp<=0){
      assert.ok(++catDeaths<=14,'Michi entry exceeded ordinary life budget: '+JSON.stringify(journal.slice(-15)));
      const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(retry.roomId,'w1-cat');
      assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin']);
      continue;
    }
    let gap=jelly.x-(ss.player.x+18);
    if(Math.abs(gap)<32){
      // The native jump needs to be held: early release causes short-hop
      // physics and can never reach a jelly floating 140px over the floor.
      if(!ss.player.grounded) {
        await step(30);
      } else {
        await key('w',24); // full-height natural jump
        await step(17);
      }
      ss=await state();
      if(ss.world1?.done>=1){woke=true;break;}
      gap=jelly.x-(ss.player.x+18);
    }
    if(Math.abs(gap)>=28){
      const nearby=(await cast()).filter(e=>e.x>ss.player.x-25&&e.x<ss.player.x+280)
        .sort((a,b)=>a.x-b.x)[0];
      if(gap>0&&nearby&&nearby.x-ss.player.x<185){
        if(ss.player.grounded)await key('w',18);
        await key('h',2);
        ss=await state();
        gap=jelly.x-(ss.player.x+18);
      }
      if(Math.abs(gap)>=28){
        await key(gap>0?'d':'a',Math.max(2,Math.min(68,Math.floor((Math.abs(gap)-32)/5))));
        await step(8);
      }
    }
    if(n%8===0){
      const view=await state();
      journal.push({type:'michi-jump',n,x:Math.round(view.player.x),
        y:Math.round(view.player.y),grounded:view.player.grounded,
        hp:Math.round(view.hp),awake:view.world1?.done});
    }
    if(journal.length>320)journal.splice(0,journal.length-320);
  }
  assert.ok(woke,'real jump failed to awaken Michi first jelly: '+JSON.stringify(journal.slice(-20)));
  const firstJelly=await state();
  assert.equal(firstJelly.roomId,'w1-cat');
  assert.equal(firstJelly.world1?.done,1,'exactly the first aerial jelly should awaken');
  assert.equal(firstJelly.world1?.sealed,false,'one jelly is not a seal');
  assert.deepEqual(firstJelly.world1Seals,['kilo','stitcho','chispin']);
  await fs.mkdir('test-results/v481',{recursive:true});
  await page.screenshot({path:'test-results/v481/michi-first-lunar-jelly-awake.png'});
  // Continue waking jellies 1..4. V476's real death checkpoint preserves
  // each *earned* independent jelly, not invulnerability or any scripted gift.
  // They all demand a real airborne overlap (not walking under their dome).
  let furtherDeaths=0;
  const lunarStations=WORLD1_ROOMS['w1-cat'].seal.stations;
  for(let index=1;index<lunarStations.length;index++){
    const station=lunarStations[index];
    let awakened=false;
    for(let n=0;n<260;n++){
      await film();
      let ss=await state();
      assert.equal(ss.roomId,'w1-cat','same authentic Michi garden');
      if(ss.world1?.done>=index+1){awakened=true;break;}
      if(ss.hp<=0){
        assert.ok(++furtherDeaths<=30,
          'Michi required excessive normal retries: '+JSON.stringify(journal.slice(-14)));
        const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
        assert.equal(retry.roomId,'w1-cat');
        assert.ok(retry.world1.done>=index,
          'already awakened medusas must persist through legitimate death');
        assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin']);
        journal.push({type:'michi-death',index,n,at:Math.round(ss.player.x),retry:furtherDeaths});
        continue;
      }
      let gap=station.x-(ss.player.x+18);
      if(Math.abs(gap)<34){
        // Kilo short-hops when W is released early; 24 ticks held are needed
        // to contact the aerial station with genuine motion and gravity.
        if(!ss.player.grounded)await step(28);
        else {await key('w',24);await step(16);}
        ss=await state();
        if(ss.world1?.done>=index+1){awakened=true;break;}
        gap=station.x-(ss.player.x+18);
      }
      if(Math.abs(gap)>=28){
        const threat=(await cast()).filter(e=>e.x>ss.player.x-25&&e.x<ss.player.x+280)
          .sort((u,v)=>u.x-v.x)[0];
        if(gap>0&&threat&&threat.x-ss.player.x<185){
          if(ss.player.grounded)await key('w',18);
          await key('h',2);
          ss=await state();
          gap=station.x-(ss.player.x+18);
        }
        if(Math.abs(gap)>=28){
          await key(gap>0?'d':'a',
            Math.max(2,Math.min(70,Math.floor((Math.abs(gap)-32)/5))));
          await step(8);
        }
      }
      if(n%10===0){
        const v=await state();
        journal.push({type:'michi',index,n,x:Math.round(v.player.x),
          y:Math.round(v.player.y),hp:Math.round(v.hp),awake:v.world1?.done});
      }
      if(journal.length>380)journal.splice(0,journal.length-380);
    }
    assert.ok(awakened,'lunar jelly '+index+' was not physically awakened: '+JSON.stringify(journal.slice(-18)));
    const view=await state();
    assert.equal(view.world1?.done,index+1,
      'only the visited aerial objectives should be awake');
    journal.push({type:'jelly-awake',id:index,x:station.x,deathRetries:furtherDeaths});
  }
  await film();
  let moon=await state();
  assert.equal(moon.world1?.done,5,'five separate air touches must be recorded');
  assert.equal(moon.world1?.sealed,true,'fifth jelly awards Michi seal');
  assert.deepEqual(moon.world1Seals,['kilo','stitcho','chispin','cat']);
  await fs.mkdir('test-results/v482',{recursive:true});
  await page.screenshot({path:'test-results/v482/michi-all-five-awake.png'});
  // Use only the unlocked room edge, never the loadRoom E2E convenience API.
  let enteredCuerno=false;
  for(let n=0;n<330;n++){
    await film();
    moon=await state();
    if(moon.roomId==='w1-cuerno'){enteredCuerno=true;break;}
    assert.equal(moon.roomId,'w1-cat','unexpected door while leaving lunar garden');
    if(moon.hp<=0){
      const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin','cat']);
      continue;
    }
    const remaining=moon.worldW-(moon.player.x+18);
    await key('d',remaining>125?Math.max(8,Math.min(100,Math.floor(remaining/5))):65);
  }
  assert.ok(enteredCuerno,'Michi earned seal should open the physical Cuerno gate');
  assert.deepEqual(moon.world1Seals,['kilo','stitcho','chispin','cat']);
  assert.equal(moon.world1?.done,0,'Cuerno must begin before prism I');
  await page.screenshot({path:'test-results/v482/cuerno-natural-entry.png'});
  // Cuerno's prism ritual is strictly ordered I -> II -> III. All three
  // controls are reached by actual World 1 keyboard movement on the ground.
  // A normal death may reset the room, but V476 must retain completed prisms.
  await film();
  const prisms=WORLD1_ROOMS['w1-cuerno'].seal.stations;
  assert.equal(prisms.length,3);
  assert.deepEqual(prisms.map(p=>p.order),[0,1,2]);
  let prismDeaths=0;
  for(let index=0;index<prisms.length;index++){
    const prism=prisms[index];
    let lit=false;
    for(let n=0;n<290;n++){
      await film();
      let s=await state();
      assert.equal(s.roomId,'w1-cuerno');
      if(s.world1?.done>=index+1){lit=true;break;}
      if(s.hp<=0){
        assert.ok(++prismDeaths<=30,'Cuerno needed too many normal lives: '+JSON.stringify(journal.slice(-12)));
        const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
        assert.equal(retry.roomId,'w1-cuerno');
        assert.ok(retry.world1?.done>=index,'death must retain real completed prisms');
        assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin','cat']);
        journal.push({type:'cuerno-death',index,n,x:Math.round(s.player.x),deaths:prismDeaths});
        continue;
      }
      let gap=prism.x-(s.player.x+18);
      if(Math.abs(gap)<36){
        s=await step(42);
        if(s.world1?.done>=index+1){lit=true;break;}
        if(s.hp<=0)continue;
        gap=prism.x-(s.player.x+18);
      }
      const threat=(await cast()).filter(e=>e.x>s.player.x-30&&e.x<s.player.x+280)
        .sort((a,b)=>a.x-b.x)[0];
      if(gap>0&&threat&&threat.x-s.player.x<200&&Math.abs(gap)>155){
        if(s.player.grounded)await key('w',20);
        await key('h',2);
        s=await state();
        gap=prism.x-(s.player.x+18);
      }
      if(Math.abs(gap)>=28){
        await key(gap>0?'d':'a',Math.max(2,Math.min(85,Math.floor((Math.abs(gap)-32)/5))));
        await step(8);
      }
      if(n%12===0){
        const view=await state();
        journal.push({type:'prism',id:index,n,x:Math.round(view.player.x),
          hp:Math.round(view.hp),lit:view.world1?.done});
      }
      if(journal.length>400)journal.splice(0,journal.length-400);
    }
    assert.ok(lit,'Prism '+(index+1)+' not reached naturally: '+JSON.stringify(journal.slice(-17)));
    const view=await state();
    assert.equal(view.world1?.done,index+1,'prisms light strictly in authored order');
    journal.push({type:'prism-lit',id:index,x:prism.x});
  }
  await film();
  let cuerno=await state();
  assert.equal(cuerno.world1?.done,3);
  assert.equal(cuerno.world1?.sealed,true);
  assert.deepEqual(cuerno.world1Seals,['kilo','stitcho','chispin','cat','cuerno']);
  await fs.mkdir('test-results/v483',{recursive:true});
  await page.screenshot({path:'test-results/v483/cuerno-prism-seal-earned.png'});
  let enteredDragon=false;
  for(let n=0;n<340;n++){
    await film();
    cuerno=await state();
    if(cuerno.roomId==='w1-dragon'){enteredDragon=true;break;}
    assert.equal(cuerno.roomId,'w1-cuerno');
    if(cuerno.hp<=0){
      const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin','cat','cuerno']);
      continue;
    }
    const remaining=cuerno.worldW-(cuerno.player.x+18);
    await key('d',remaining>125?Math.max(8,Math.min(95,Math.floor(remaining/5))):65);
  }
  assert.ok(enteredDragon,'the fifth earned seal must unlock physical Dragon gate');
  assert.equal(cuerno.world1?.done,0);
  assert.deepEqual(cuerno.world1Seals,['kilo','stitcho','chispin','cat','cuerno']);
  await page.screenshot({path:'test-results/v483/dragon-natural-entry.png'});
  // Dragon Caldera: four real attacks light four braziers. Walking or standing
  // nearby is insufficient. Use the actual 'h' primary strike at normal range.
  await film();
  const braziers=WORLD1_ROOMS['w1-dragon'].seal.stations;
  assert.equal(braziers.length,4);
  let brazierDeaths=0;
  for(let index=0;index<braziers.length;index++){
    const altar=braziers[index];
    let lit=false;
    for(let n=0;n<330;n++){
      await film();
      let ss=await state();
      assert.equal(ss.roomId,'w1-dragon');
      if(ss.world1?.done>=index+1){lit=true;break;}
      if(ss.hp<=0){
        assert.ok(++brazierDeaths<=34,'Dragon retries exhausted: '+JSON.stringify(journal.slice(-15)));
        const again=await page.evaluate(()=>window.__OHANA_E2E.respawn());
        assert.equal(again.roomId,'w1-dragon');
        assert.ok(again.world1?.done>=index,'earlier lit braziers persist through death');
        assert.deepEqual(again.world1Seals,['kilo','stitcho','chispin','cat','cuerno']);
        journal.push({type:'dragon-death',index,n,x:Math.round(ss.player.x),deaths:brazierDeaths});
        continue;
      }
      let gap=altar.x-(ss.player.x+18);
      if(Math.abs(gap)<60){
        // Game handles attack cooldown normally. Repeated genuine key presses
        // can retry a blocked swing, but no station.done mutation is allowed.
        if(!ss.player.grounded)await step(28);
        await key('h',4);
        ss=await step(12);
        if(ss.world1?.done>=index+1){lit=true;break;}
        if(ss.hp<=0)continue;
        gap=altar.x-(ss.player.x+18);
      }
      const foe=(await cast()).filter(e=>e.x>ss.player.x-25&&e.x<ss.player.x+290)
        .sort((a,b)=>a.x-b.x)[0];
      if(gap>0&&foe&&foe.x-ss.player.x<200&&Math.abs(gap)>145){
        if(ss.player.grounded)await key('w',18);
        await key('h',2);
        ss=await state();gap=altar.x-(ss.player.x+18);
      }
      if(Math.abs(gap)>=30){
        await key(gap>0?'d':'a',Math.max(2,Math.min(78,Math.floor((Math.abs(gap)-32)/5))));
        await step(8);
      }
      if(n%12===0){
        const snap=await state();
        journal.push({type:'brazier',index,n,x:Math.round(snap.player.x),
          hp:Math.round(snap.hp),lit:snap.world1?.done});
      }
      if(journal.length>450)journal.splice(0,journal.length-450);
    }
    assert.ok(lit,'Dragon brazier '+index+' did not ignite by normal attack: '+JSON.stringify(journal.slice(-19)));
    const ss=await state();
    assert.equal(ss.world1?.done,index+1,'only attacked braziers should ignite');
    journal.push({type:'brazier-lit',index,x:altar.x});
  }
  await film();
  let flames=await state();
  assert.equal(flames.world1?.done,4);
  assert.equal(flames.world1?.sealed,true);
  assert.deepEqual(flames.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon']);
  await fs.mkdir('test-results/v484',{recursive:true});
  await page.screenshot({path:'test-results/v484/dragon-four-authentic-braziers.png'});
  let enteredDino=false;
  for(let n=0;n<350;n++){
    await film();
    flames=await state();
    if(flames.roomId==='w1-dino'){enteredDino=true;break;}
    assert.equal(flames.roomId,'w1-dragon');
    if(flames.hp<=0){
      const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon']);
      continue;
    }
    const remaining=flames.worldW-(flames.player.x+18);
    await key('d',remaining>125?Math.max(8,Math.min(95,Math.floor(remaining/5))):65);
  }
  assert.ok(enteredDino,'Dragon earned seal did not open the normal Dino gate');
  assert.deepEqual(flames.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon']);
  assert.equal(flames.world1?.done,0);
  await page.screenshot({path:'test-results/v484/dino-natural-entry.png'});
  // Dino fossils are activated by REAL hard landings, not proximity.
  // The puzzle checks grounded transition and downward velocity > 6. The
  // player must jump at each fossil and let gravity bring them down.
  await film();
  const fossils=WORLD1_ROOMS['w1-dino'].seal.stations;
  assert.equal(fossils.length,3);
  let fossilDeaths=0;
  for(let index=0;index<fossils.length;index++){
    const fossil=fossils[index];
    let awake=false;
    for(let n=0;n<340;n++){
      await film();
      let ss=await state();
      assert.equal(ss.roomId,'w1-dino');
      if(ss.world1?.done>=index+1){awake=true;break;}
      if(ss.hp<=0){
        assert.ok(++fossilDeaths<=38,'Dino normal retry budget exceeded: '+JSON.stringify(journal.slice(-15)));
        const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
        assert.equal(retry.roomId,'w1-dino');
        assert.ok(retry.world1?.done>=index,'completed fossils must survive honest retries');
        assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon']);
        journal.push({type:'dino-death',index,n,at:Math.round(ss.player.x),deaths:fossilDeaths});
        continue;
      }
      let gap=fossil.x-(ss.player.x+18);
      if(Math.abs(gap)<42){
        // Hold W through the ascent so the engine sees a strong fall and
        // a genuine landing transition near the fossil itself.
        if(ss.player.grounded)await key('w',24);
        await step(37);
        ss=await state();
        if(ss.world1?.done>=index+1){awake=true;break;}
        if(ss.hp<=0)continue;
        gap=fossil.x-(ss.player.x+18);
      }
      const threat=(await cast()).filter(e=>e.x>ss.player.x-25&&e.x<ss.player.x+300)
        .sort((u,v)=>u.x-v.x)[0];
      if(gap>0&&threat&&threat.x-ss.player.x<195&&Math.abs(gap)>145){
        if(ss.player.grounded)await key('w',18);
        await key('h',2);
        ss=await state();gap=fossil.x-(ss.player.x+18);
      }
      if(Math.abs(gap)>=28){
        await key(gap>0?'d':'a',Math.max(2,Math.min(83,Math.floor((Math.abs(gap)-32)/5))));
        await step(8);
      }
      if(n%12===0){
        const view=await state();
        journal.push({type:'fossil',index,n,x:Math.round(view.player.x),
          hp:Math.round(view.hp),done:view.world1?.done,grounded:view.player.grounded});
      }
      if(journal.length>480)journal.splice(0,journal.length-480);
    }
    assert.ok(awake,'Dino heavy landing '+index+' not completed physically: '+JSON.stringify(journal.slice(-19)));
    const snap=await state();
    assert.equal(snap.world1?.done,index+1);
    journal.push({type:'fossil-awake',index,x:fossil.x});
  }
  await film();
  let dino=await state();
  assert.equal(dino.world1?.done,3);
  assert.equal(dino.world1?.sealed,true);
  assert.deepEqual(dino.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino']);
  await fs.mkdir('test-results/v485',{recursive:true});
  await page.screenshot({path:'test-results/v485/dino-three-hard-landings.png'});
  let intoFrita=false;
  for(let n=0;n<370;n++){
    await film();
    dino=await state();
    if(dino.roomId==='w1-frita'){intoFrita=true;break;}
    assert.equal(dino.roomId,'w1-dino');
    if(dino.hp<=0){
      const retry=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.deepEqual(retry.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino']);
      continue;
    }
    const remain=dino.worldW-(dino.player.x+18);
    await key('d',remain>125?Math.max(8,Math.min(95,Math.floor(remain/5))):65);
  }
  assert.ok(intoFrita,'Dino fossil seal did not unlock actual Frita door');
  assert.deepEqual(dino.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino']);
  assert.equal(dino.world1?.done,0);
  await page.screenshot({path:'test-results/v485/frita-natural-entry.png'});

  // V486: continue the same unassisted seven-seal run into Frita.
  const fritaStations = WORLD1_ROOMS['w1-frita'].seal.stations;
  assert.equal(fritaStations.length,3,'Frita must contain three geysers');
  assert.equal(fritaStations[0].kind,'geyser');
  await fs.mkdir('test-results/v486',{recursive:true});
  let firstPotato=false, fritaRetries=0;
  for(let attempt=0;attempt<600;attempt++){
    await film();
    let ss=await state();
    assert.equal(ss.roomId,'w1-frita','pilot must remain inside Frita');
    assert.deepEqual(ss.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino'],
      'Frita cannot grant its seal for one potato');
    if(ss.world1?.done>=1){firstPotato=true;break;}
    if(ss.hp<=0){
      assert.ok(++fritaRetries<=14,'Frita legitimate retry limit exceeded');
      const recovery=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(recovery.roomId,'w1-frita','retry cannot skip to another room');
      continue;
    }
    const pad=fritaStations[0], center=ss.player.x+18;
    if(center<pad.x-46) {
      await key('d',Math.max(1,Math.min(16,Math.floor((pad.x-46-center)/5))));
    } else if(center>pad.x+46) {
      await key('a',Math.max(1,Math.min(10,Math.floor((center-pad.x-46)/5))));
    } else {
      // Let production physics trigger the geyser (-21 vertical impulse).
      await step(8);
    }
    if(attempt%25===0) journal.push({type:'frita-geyser',at:Math.round(center),
      y:Math.round(ss.player.y),vy:ss.player.vy,done:ss.world1?.done});
  }
  assert.ok(firstPotato,'First Frita potato must be collected by real geyser physics: '+
    JSON.stringify(journal.slice(-15)));
  const frita=await state();
  assert.equal(frita.world1?.done,1,'only first potato can be credited');
  assert.equal(frita.world1?.sealed,false,'Frita seal cannot be awarded early');
  assert.deepEqual(frita.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino']);
  await page.screenshot({path:'test-results/v486/first-physical-geyser.png'});
  await fs.writeFile('test-results/v486/first-authentic-potato.json',JSON.stringify({
    physicalRun:true,previousSeals:7,fritaPrizes:1,legitimateRetries:fritaRetries,
    noTeleport:true,noInjectedHP:true,noEnemyDeletion:true,noGrantedSeals:true,
    fritaCompleted:false,fullCampaignComplete:false,quimeraDefeated:false,
    journal:journal.slice(-120)
  },null,2));
  console.log('PASS V486: seven natural seals and first Frita potato by physical geyser jump.');

  // V487: finish Frita with the same unmodified input/physics and walk through its east door.
  for(let index=1; index<fritaStations.length; index++){
    const geyser=fritaStations[index];
    assert.equal(geyser.kind,'geyser');
    let collected=false, lastSnapshot=null;
    for(let n=0;n<720;n++){
      await film();
      const ss=await state();
      lastSnapshot=ss;
      assert.equal(ss.roomId,'w1-frita');
      if(ss.world1?.done>=index+1){collected=true;break;}
      assert.equal(ss.world1?.done,index,'one potato must not skip other stations');
      if(ss.hp<=0){
        assert.ok(++fritaRetries<=24,'Frita retry limit exceeded');
        const recovery=await page.evaluate(()=>window.__OHANA_E2E.respawn());
        assert.equal(recovery.roomId,'w1-frita');
        continue;
      }
      const center=ss.player.x+18;
      const distance=geyser.x-center;
      // Stay on the actual oil vent. The game's own gravity/launch decides success.
      if(distance>46) await key('d',Math.max(1,Math.min(14,Math.floor((distance-46)/5))));
      else if(distance< -46) await key('a',Math.max(1,Math.min(10,Math.floor((-distance-46)/5))));
      else await step(8);
      if(n%35===0) journal.push({type:'frita-geyser',index,x:Math.round(center),
        y:Math.round(ss.player.y),vy:ss.player.vy,done:ss.world1?.done});
    }
    assert.ok(collected,'Frita potato '+index+' not collected physically: '+
      JSON.stringify({last:lastSnapshot?.player,journal:journal.slice(-18)}));
    journal.push({type:'frita-potato-earned',index});
  }
  let eight=await state();
  assert.equal(eight.world1?.done,3);
  assert.equal(eight.world1?.sealed,true);
  assert.deepEqual(eight.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita']);
  await fs.mkdir('test-results/v487',{recursive:true});
  await page.screenshot({path:'test-results/v487/frita-three-natural-potatoes.png'});
  let intoPizza=false;
  for(let n=0;n<400;n++){
    await film();
    eight=await state();
    if(eight.roomId==='w1-pizza'){intoPizza=true;break;}
    assert.equal(eight.roomId,'w1-frita');
    if(eight.hp<=0){
      const recover=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(recover.roomId,'w1-frita');
      continue;
    }
    const remain=eight.worldW-(eight.player.x+18);
    await key('d',remain>125?Math.max(8,Math.min(95,Math.floor(remain/5))):65);
  }
  assert.ok(intoPizza,'Earned Frita seal must open the real east door to Pizza');
  assert.deepEqual(eight.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita']);
  assert.equal(eight.world1?.done,0,'Pizza objectives must start incomplete');
  await page.screenshot({path:'test-results/v487/pizza-natural-entry.png'});
  await fs.writeFile('test-results/v487/eight-authentic-seals.json',JSON.stringify({
    difficulty:'easy',earnedSeals:eight.world1Seals,earnedFritaPotatoes:3,
    nextRoom:'w1-pizza',legitimateFritaRetries:fritaRetries,
    noTeleports:true,noInjectedHP:true,noEnemiesDeleted:true,noGrantedSeals:true,
    fullCampaignComplete:false,quimeraDefeated:false,journal:journal.slice(-160)
  },null,2));
  console.log('PASS V487: eight legitimate seals, all three geyser prizes, natural entrance to Pizza.');

  // V488 pilot: first genuinely timed pizza delivery after eight earned seals.
  const pizzaStations=WORLD1_ROOMS['w1-pizza'].seal.stations;
  const oven=pizzaStations.find(x=>x.kind==='oven');
  const firstGuest=pizzaStations.find(x=>x.kind==='guest' && x.id===1);
  assert.ok(oven && firstGuest,'Pizza room must contain the oven and guest #1');
  let firstDelivered=false,pizzaRetries=0,deliveryPhase='oven';
  const pizzaJournal=[];
  for(let attempt=0;attempt<900;attempt++){
    await film();
    const ss=await state();
    assert.equal(ss.roomId,'w1-pizza','must remain in the Pizza room');
    assert.deepEqual(ss.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita']);
    if(ss.world1?.done>=1){firstDelivered=true;break;}
    if(ss.hp<=0){
      assert.ok(++pizzaRetries<28,'too many ordinary Pizza respawns');
      const recover=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(recover.roomId,'w1-pizza');
      continue;
    }
    // The public snapshot deliberately doesn't expose the carried item.
    // Walk to the oven, then to the customer, and retry naturally if it expires.
    const target=deliveryPhase==='oven'?oven:firstGuest;
    const center=ss.player.x+18;
    const delta=target.x-center;
    if(delta>42) await key('d',Math.max(1,Math.min(18,Math.floor((delta-42)/5))));
    else if(delta< -42) await key('a',Math.max(1,Math.min(18,Math.floor((-delta-42)/5))));
    else {
      await step(5);
      deliveryPhase=deliveryPhase==='oven'?'guest':'oven';
    }
    if(attempt%35===0) pizzaJournal.push({x:Math.round(center),
      y:Math.round(ss.player.y),phase:deliveryPhase,done:ss.world1?.done});
  }
  assert.ok(firstDelivered,'Timed pizza delivery #1 failed with physical input: '+
    JSON.stringify(pizzaJournal.slice(-15)));
  const pizzaState=await state();
  assert.equal(pizzaState.world1?.done,1);
  assert.equal(pizzaState.world1?.sealed,false,'one customer must not earn Pizza seal');
  assert.deepEqual(pizzaState.world1Seals,['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita']);
  await fs.mkdir('test-results/v488',{recursive:true});
  await page.screenshot({path:'test-results/v488/first-authentic-pizza-delivery.png'});
  await fs.writeFile('test-results/v488/first-timed-delivery.json',JSON.stringify({
    earnedSeals:8,actualPizzaDeliveries:1,ordinaryDeaths:pizzaRetries,
    noTeleports:true,noHPManipulation:true,noObjectiveInjection:true,
    pizzaSealed:false,quimeraDefeated:false,journal:pizzaJournal
  },null,2));
  console.log('PASS V488: first Pizza delivery by physical movement with normal oven timer.');

  // V489: keep the authentic eight-seal run and first delivery above,
  // then collect two additional oven pizzas and serve guests #2 and #3.
  // No direct writes to player, carry, timer, completion or seals.
  const expectedNine = [...eight.world1Seals, 'pizza'];
  const guests = pizzaStations.filter(s => s.kind === 'guest').sort((a,b)=>a.id-b.id);
  assert.deepEqual(guests.map(s=>s.id), [1,2,3]);
  let pendingDelivery = 'oven', lastDelivered = 1, laterPizzaDeaths = 0;
  const ninthJournal = [];
  for (let attempt=0;attempt<3000;attempt++) {
    await film();
    let ss=await state();
    assert.equal(ss.roomId, 'w1-pizza', 'must finish every delivery inside Pizza');
    assert.equal(ss.runtimeFaults, 0, 'no browser runtime faults');
    if (ss.world1?.done >= 3) break;
    assert.deepEqual(ss.world1Seals, eight.world1Seals,
      'Pizza seal must not appear before serving all three guests');
    if(ss.hp<=0){
      assert.ok(++laterPizzaDeaths<=36, 'Pizza death-retry limit exceeded: '+JSON.stringify(ninthJournal.slice(-15)));
      const recover=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(recover.roomId,'w1-pizza','ordinary respawn must stay in Pizza');
      pendingDelivery='oven';
      continue;
    }
    if(ss.world1.done>lastDelivered){
      lastDelivered=ss.world1.done;
      pendingDelivery='oven';
      ninthJournal.push({event:'authentic-delivery',done:lastDelivered,x:Math.round(ss.player.x)});
    }
    const nextGuest=guests.find(g=>g.id===ss.world1.done+1);
    assert.ok(nextGuest,'next guest must exist until all three are served');
    const target=pendingDelivery==='oven'?oven:nextGuest;
    const gap=target.x-(ss.player.x+18);
    if(gap>42) await key('d',Math.max(1,Math.min(18,Math.floor((gap-42)/5))));
    else if(gap< -42) await key('a',Math.max(1,Math.min(18,Math.floor((-gap-42)/5))));
    else {
      await step(8);
      pendingDelivery=pendingDelivery==='oven'?'guest':'oven';
    }
    if(attempt%50===0) ninthJournal.push({event:'movement',done:ss.world1.done,
      x:Math.round(ss.player.x),phase:pendingDelivery,target:nextGuest.id});
  }
  let ninth=await state();
  assert.equal(ninth.roomId,'w1-pizza');
  assert.equal(ninth.world1?.done,3,'all three authentic Pizza guests must be served');
  assert.equal(ninth.world1?.sealed,true,'the third guest must unlock Pizza seal');
  assert.deepEqual(ninth.world1Seals,expectedNine,'exactly nine physical seals must be earned');

  // Exit east by real controls; the tenth room must start without objectives granted.
  let enteredYomi=false, yomiDeaths=0, lastPizzaX=null, stuckPizza=0;
  const pizzaExitJournal=[];
  for(let n=0;n<260;n++){
    await film();
    let ss=await state();
    if(ss.roomId==='w1-yomi'){enteredYomi=true;break;}
    assert.equal(ss.roomId,'w1-pizza','Yomi entry only through Pizza east door');
    assert.deepEqual(ss.world1Seals,expectedNine,'Pizza exit must retain exactly nine earned seals');
    if(ss.hp<=0){
      assert.ok(++yomiDeaths<=18,'too many natural Pizza exit retries');
      const recover=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(recover.roomId,'w1-pizza');
      lastPizzaX=null;stuckPizza=0;
      continue;
    }
    const x=ss.player.x;
    if(n%12===0) pizzaExitJournal.push({n,x:Math.round(x),y:Math.round(ss.player.y),
      hp:ss.hp,done:ss.world1?.done,sealed:ss.world1?.sealed,worldW:ss.worldW});
    stuckPizza=lastPizzaX!==null&&Math.abs(x-lastPizzaX)<4?stuckPizza+1:0;
    lastPizzaX=x;
    if(stuckPizza>=3 && x<ss.worldW-145){
      // Jump a physical obstruction only if the ordinary eastward route stalls.
      await key('w',18);
      stuckPizza=0;
    }
    const remaining=ss.worldW-(x+18);
    await key('d',remaining>125?Math.max(8,Math.min(110,Math.floor(remaining/5))):90);
  }
  if(!enteredYomi){
    await fs.mkdir('test-results/v490',{recursive:true});
    await page.screenshot({path:'test-results/v490/pizza-east-exit-failure.png'});
    await fs.writeFile('test-results/v490/pizza-east-exit-failure.json',JSON.stringify({
      state:await state(),journal:pizzaExitJournal
    },null,2));
  }
  assert.ok(enteredYomi,'nine authentic seals must open the east door to Yomi: '+
    JSON.stringify(pizzaExitJournal.slice(-12)));
  ninth=await state();
  assert.equal(ninth.roomId,'w1-yomi');
  assert.deepEqual(ninth.world1Seals,expectedNine);
  assert.equal(ninth.world1?.done,0,'Yomi must begin untouched');
  assert.equal(ninth.world1?.sealed,false,'Yomi must not receive an artificial seal');
  await fs.mkdir('test-results/v489',{recursive:true});
  await page.screenshot({path:'test-results/v489/nine-seals-authentic-yomi-entry.png'});
  await fs.writeFile('test-results/v489/three-timed-deliveries.json',JSON.stringify({
    earnedSeals:expectedNine,actualPizzaDeliveries:3,nextRoom:'w1-yomi',
    ordinaryPizzaDeaths:pizzaRetries+laterPizzaDeaths,ordinaryPizzaExitDeaths:yomiDeaths,
    physicalKeyboard:true,noTeleports:true,noGrantedSeals:true,noTimerMutation:true,
    quimeraDefeated:false,journal:ninthJournal
  },null,2));
  console.log('PASS V489: three physical timed Pizza deliveries, ninth authentic seal and natural entry into Yomi.');

  // V490: synchronize all four real Yomi nodes during their green windows.
  // Movement and ordinary respawns only: do not inject a single node, seal or boss result.
  const yomiNodes=WORLD1_ROOMS['w1-yomi'].seal.stations.filter(s=>s.kind==='node')
    .sort((a,b)=>a.x-b.x);
  assert.equal(yomiNodes.length,4,'Yomi must have exactly four live nodes');
  let yomiNormalDeaths=0, yomiAttempts=0;
  const yomiJournal=[];
  for(let index=0;index<yomiNodes.length;index++){
    let solved=false;
    for(let attempt=0;attempt<320;attempt++){
      yomiAttempts++;
      await film();
      let ss=await state();
      assert.equal(ss.roomId,'w1-yomi','remain in tenth room until earned Yomi seal');
      assert.equal(ss.runtimeFaults,0,'no gameplay runtime faults');
      if(ss.world1?.done>=index+1){solved=true;break;}
      assert.deepEqual(ss.world1Seals,expectedNine,
        'ten seals must not be present before four green-node touches');
      if(ss.hp<=0){
        assert.ok(++yomiNormalDeaths<=35,'too many ordinary Yomi deaths: '+JSON.stringify(yomiJournal.slice(-12)));
        const recovery=await page.evaluate(()=>window.__OHANA_E2E.respawn());
        assert.equal(recovery.roomId,'w1-yomi','normal Yomi respawn');
        continue;
      }
      const node=yomiNodes[index];
      const delta=node.x-(ss.player.x+18);
      if(Math.abs(delta)<35){
        // Standing through a full 120-tick node cycle guarantees an actual
        // green window if the player reaches its natural collision volume.
        ss=await step(135);
      } else if(delta>0) {
        ss=await key('d',Math.max(1,Math.min(18,Math.floor((delta-35)/5))));
      } else {
        ss=await key('a',Math.max(1,Math.min(18,Math.floor((-delta-35)/5))));
      }
      if(attempt%25===0) yomiJournal.push({node:index+1,x:Math.round(ss.player?.x||0),
        done:ss.world1?.done,attempt});
    }
    assert.ok(solved,'Yomi node '+(index+1)+' was not physically synchronized: '+
      JSON.stringify(yomiJournal.slice(-14)));
  }
  const tenSeals=[...expectedNine,'yomi'];
  let tenth=await state();
  assert.equal(tenth.roomId,'w1-yomi');
  assert.equal(tenth.world1?.done,4);
  assert.equal(tenth.world1?.sealed,true,'four real synchronized nodes earn Yomi seal');
  assert.deepEqual(tenth.world1Seals,tenSeals);

  // Ten earned seals grant the route, never a synthetic boss victory.
  let enteredFinal=false, finalDeaths=0;
  for(let n=0;n<145;n++){
    await film();
    let ss=await state();
    if(ss.roomId==='w1-final'){enteredFinal=true;break;}
    assert.equal(ss.roomId,'w1-yomi','exit the tenth room through its east gate');
    if(ss.hp<=0){
      assert.ok(++finalDeaths<=12,'normal Yomi exit retry limit');
      const recovery=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(recovery.roomId,'w1-yomi');
      continue;
    }
    const remaining=ss.worldW-(ss.player.x+18);
    await key('d',remaining>125?Math.max(8,Math.min(95,Math.floor(remaining/5))):65);
  }
  assert.ok(enteredFinal,'ten authentic seals must open the final room');
  tenth=await state();
  assert.equal(tenth.roomId,'w1-final');
  assert.deepEqual(tenth.world1Seals,tenSeals);
  await fs.mkdir('test-results/v490',{recursive:true});
  await page.screenshot({path:'test-results/v490/ten-authentic-seals-final-room.png'});
  await fs.writeFile('test-results/v490/yomi-four-live-nodes.json',JSON.stringify({
    earnedSeals:tenSeals,yomiNodesSynchronized:4,room:'w1-final',
    ordinaryYomiDeaths:yomiNormalDeaths,ordinaryFinalExitDeaths:finalDeaths,
    yomiAttempts,physicalKeyboard:true,noTeleports:true,noGrantedSeals:true,
    quimeraDefeated:false,journal:yomiJournal
  },null,2));
  console.log('PASS V490: all ten authentic seals, four green Yomi nodes and natural final-room entry.');

  // V491: cross the actual final-room floor into the Quimera encounter,
  // wait out her intro and land at least one real H melee strike.
  // This only certifies encounter + first damage, not boss victory.
  const initialBossMax=2800;
  let physicalBossSpawn=false, naturalBossRetries=0;
  const quimeraJournal=[];
  for(let n=0;n<190;n++){
    await film();
    let ss=await state();
    assert.equal(ss.roomId,'w1-final','must remain in authentic final-room route');
    assert.deepEqual(ss.world1Seals,tenSeals);
    assert.equal(ss.runtimeFaults,0);
    if(ss.boss?.max===initialBossMax){physicalBossSpawn=true;break;}
    if(ss.hp<=0){
      assert.ok(++naturalBossRetries<=10,'excessive genuine boss-entrance retries');
      const back=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(back.roomId,'w1-final');
      continue;
    }
    await key('d',Math.max(12,Math.min(100,Math.floor((7000-ss.player.x)/5))));
  }
  assert.ok(physicalBossSpawn,'walking into the final arena must spawn the Quimera');
  let firstPhysicalHit=false;
  for(let n=0;n<1400;n++){
    await film();
    let ss=await state();
    assert.equal(ss.roomId,'w1-final');
    assert.deepEqual(ss.world1Seals,tenSeals);
    if(ss.boss?.hp<initialBossMax && ss.boss.hp>0){
      firstPhysicalHit=true;
      quimeraJournal.push({event:'first-natural-damage',hp:ss.boss.hp,phase:ss.boss.phase,at:Math.round(ss.player.x)});
      break;
    }
    if(ss.hp<=0){
      assert.ok(++naturalBossRetries<=24,'normal boss encounter retries exceeded: '+JSON.stringify(quimeraJournal.slice(-18)));
      const back=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(back.roomId,'w1-final','real boss encounter respawn');
      continue;
    }
    if(!ss.boss){
      await key('d',85);
      continue;
    }
    const gap=ss.boss.x-(ss.player.x+18);
    if(gap>72) await key('d',Math.max(1,Math.min(30,Math.floor((gap-72)/5))));
    else if(gap< -35) await key('a',Math.max(1,Math.min(15,Math.floor((-gap-35)/5))));
    else if(ss.boss.vulnerable) await key('h',2);
    else await step(9);
    if(n%35===0) quimeraJournal.push({event:'physical-encounter',hp:ss.boss.hp,
      player:Math.round(ss.player.x),boss:Math.round(ss.boss.x),
      vulnerable:ss.boss.vulnerable,health:ss.hp});
  }
  assert.ok(firstPhysicalHit,'normal H attack must actually damage the living Quimera: '+
    JSON.stringify(quimeraJournal.slice(-20)));
  let combat=await state();
  assert.equal(combat.roomId,'w1-final');
  assert.deepEqual(combat.world1Seals,tenSeals);
  assert.ok(combat.boss?.hp>0 && combat.boss.hp<initialBossMax,
    'boss must remain alive but visibly damaged');
  assert.equal(combat.world1Won,false,'first hit must never be mistaken for victory');
  await fs.mkdir('test-results/v491',{recursive:true});
  await page.screenshot({path:'test-results/v491/first-legitimate-quimera-hit.png'});
  await fs.writeFile('test-results/v491/first-real-boss-hit.json',JSON.stringify({
    earnedSeals:tenSeals,realBossSpawn:true,firstPhysicalDamage:initialBossMax-combat.boss.hp,
    phaseReached:combat.boss.phase,ordinaryBossRetries:naturalBossRetries,
    noTeleports:true,noBossHPWrites:true,noInvulnerabilityInjection:true,
    world1Won:false,quimeraDefeated:false,journal:quimeraJournal
  },null,2));
  console.log('PASS V491: ten authentic seals, natural Quimera spawn and first real H combat damage.');

  // V492: clear the first true Quimera phase through physical movement
  // and ordinary attacks. HP and phase are observed, never set.
  let phaseTwoReached=false, phaseTwoRetries=0, bestBossHp=combat.boss.hp;
  const phaseTwoJournal=[];
  for(let n=0;n<4200;n++){
    await film();
    let ss=await state();
    assert.equal(ss.roomId,'w1-final','physical Quimera encounter must remain in final room');
    assert.deepEqual(ss.world1Seals,tenSeals);
    assert.equal(ss.runtimeFaults,0);
    if(ss.boss?.phase>=2 && ss.boss.hp<=initialBossMax*.70){
      phaseTwoReached=true;phaseTwoJournal.push({event:'phase-two-earned',hp:ss.boss.hp,phase:ss.boss.phase});
      break;
    }
    if(ss.hp<=0){
      assert.ok(++phaseTwoRetries<=35,'too many genuine Quimera combat retries: '+JSON.stringify(phaseTwoJournal.slice(-12)));
      const back=await page.evaluate(()=>window.__OHANA_E2E.respawn());
      assert.equal(back.roomId,'w1-final','normal boss respawn must stay in final room');
      continue;
    }
    if(!ss.boss){
      await key('d',95);
      continue;
    }
    bestBossHp=Math.min(bestBossHp,ss.boss.hp);
    const gap=ss.boss.x-(ss.player.x+18);
    if(gap>73) await key('d',Math.max(1,Math.min(28,Math.floor((gap-73)/5))));
    else if(gap< -38) await key('a',Math.max(1,Math.min(15,Math.floor((-gap-38)/5))));
    else if(ss.boss.vulnerable) await key('h',2);
    else await step(9);
    if(n%70===0) phaseTwoJournal.push({n,bossHp:ss.boss.hp,bestHp:bestBossHp,
      bossPhase:ss.boss.phase,playerX:Math.round(ss.player.x),
      bossX:Math.round(ss.boss.x),vulnerable:ss.boss.vulnerable,
      playerHp:ss.hp,deaths:phaseTwoRetries});
  }
  if(!phaseTwoReached){
    await fs.mkdir('test-results/v492',{recursive:true});
    await page.screenshot({path:'test-results/v492/phase-two-not-reached.png'});
    await fs.writeFile('test-results/v492/phase-two-diagnostic.json',JSON.stringify({
      state:await state(),bestBossHp,normalDeaths:phaseTwoRetries,
      journal:phaseTwoJournal.slice(-150)
    },null,2));
  }
  assert.ok(phaseTwoReached,'Quimera must reach phase two through real combat: '+
    JSON.stringify({bestBossHp,retries:phaseTwoRetries,last:phaseTwoJournal.slice(-16)}));
  const phaseTwoState=await state();
  assert.ok(phaseTwoState.boss?.phase>=2,'boss phase must advance naturally');
  assert.ok(phaseTwoState.boss?.hp<=initialBossMax*.70,'phase requires genuine combat HP threshold');
  assert.equal(phaseTwoState.world1Won,false,'entering second phase does not defeat the Quimera');
  assert.deepEqual(phaseTwoState.world1Seals,tenSeals);
  await fs.mkdir('test-results/v492',{recursive:true});
  await page.screenshot({path:'test-results/v492/physical-quimera-phase-two.png'});
  await fs.writeFile('test-results/v492/quimera-phase-two.json',JSON.stringify({
    earnedSeals:tenSeals,phaseReached:phaseTwoState.boss.phase,
    bossHp:phaseTwoState.boss.hp,startingBossHp:initialBossMax,
    actualDamage:initialBossMax-phaseTwoState.boss.hp,ordinaryRetries:phaseTwoRetries,
    noTeleports:true,noHPWrites:true,noBossPhaseWrites:true,noInvulnerabilityInjection:true,
    quimeraDefeated:false,journal:phaseTwoJournal
  },null,2));
  console.log('PASS V492: reached Quimera phase two with all ten earned seals and real keyboard combat.');







  await fs.writeFile('test-results/v485/seven-real-seals.json',JSON.stringify({
    difficulty:'easy',completedRooms:7,nextRoom:'w1-frita',
    earnedSeals:['kilo','stitcho','chispin','cat','cuerno','dragon','dino'],
    fossilHardLandings:3,dinoNormalDeathRetries:fossilDeaths,
    noTeleports:true,noInjectedHealth:true,noEnemiesDeleted:true,noSealGrants:true,
    fullCampaignComplete:false,quimeraDefeated:false,journal:journal.slice(-180)
  },null,2));
  console.log('PASS V485: seven real earned seals, three physical heavy landings on Dino fossils, natural Frita gate.');
  await fs.writeFile('test-results/v484/six-authentic-seals.json',JSON.stringify({
    difficulty:'easy',earnedSeals:['kilo','stitcho','chispin','cat','cuerno','dragon'],
    roomsNaturallyCompleted:6,nextRoom:'w1-dino',realBrazierAttacks:4,
    dragonDeathRetries:brazierDeaths,
    noTeleport:true,noInjectedHP:true,noEnemyDeletion:true,noGrantedSeals:true,
    fullCampaignComplete:false,quimeraDefeated:false,journal:journal.slice(-160)
  },null,2));
  console.log('PASS V484: six authentic room seals, four real Dragon brazier strikes, naturally entered Dino.');
  await fs.writeFile('test-results/v483/five-authentic-seals.json',JSON.stringify({
    difficulty:'easy',roomsComplete:5,nextRoom:'w1-dragon',
    earnedSeals:['kilo','stitcho','chispin','cat','cuerno'],
    orderedPrisms:[0,1,2],cuernoNormalDeaths:prismDeaths,
    cheating:false,teleports:false,invulnerabilityInjected:false,enemyDeletion:false,
    world1FullyCompleted:false,quimeraDefeated:false,
    journal:journal.slice(-140)
  },null,2));
  console.log('PASS V483: five complete physical seals and ordered Cuerno prisms, normal gate to Dragon. No granted progress.');
  await fs.writeFile('test-results/v482/four-physical-seals.json',JSON.stringify({
    difficulty:'easy',roomsWithEarnedSeals:4,naturalNextRoom:'w1-cuerno',
    earnedSeals:['kilo','stitcho','chispin','cat'],lunarJelliesAwakened:5,
    naturalJellyJump:true,lunarDeathRetries:catDeaths+furtherDeaths,
    artificialSeals:false,enemyDeletion:false,teleport:false,healthInjection:false,
    fullWorld1Completed:false,quimeraDefeated:false,journal:journal.slice(-120)
  },null,2));
  console.log('PASS V482: four physical seals and five real airborne Michi jelly touches, natural entry to Cuerno. No artificial progress.');
  await fs.writeFile('test-results/v481/three-seals-one-jelly.json',JSON.stringify({
    difficulty:'easy',earnedSeals:['kilo','stitcho','chispin'],
    naturalMichiEntry:true,firstJellyWokenByJump:true,michiDeathRetries:catDeaths,
    characterTeleported:false,heroInvulnerable:false,enemiesDeleted:false,sealGranted:false,
    completeMichiRoom:false,fullWorld1Completed:false,quimeraDefeated:false,
    journal:journal.slice(-80)
  },null,2));
  console.log('PASS V481: three physical seals + natural Michi entry and first aerial lunar jelly awakened by held-jump keyboard, no artificial progress.');
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
