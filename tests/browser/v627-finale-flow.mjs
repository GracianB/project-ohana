// Replay the final encounter from a previously earned campaign, using normal
// movement/attacks and production retry. This is not a fresh campaign claim.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
import {selectFinalFighter} from './final-ritual-controls.mjs';
const release=process.env.OHANA_FINALE_RELEASE||'627',dir=`test-results/v${release}/finale-flow`,server=await startServer(0);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir(dir,{recursive:true});
 const earned=JSON.parse(await fs.readFile(process.env.OHANA_EARNED_STORAGE||'test-results/v600/earned-campaign-storage.json','utf8'));
 for(const origin of earned.origins)origin.origin='http://127.0.0.1:'+server.address().port;
 const reports=[];
 for(const [width,height]of[[1280,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},storageState:earned,hasTouch:width<500,isMobile:width<500}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));const date=new Date('2026-10-29T12:00:00Z');await page.clock.install({time:date});await page.clock.pauseAt(new Date(+date+1000));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');await page.keyboard.press('Escape');
  await page.evaluate(()=>{localStorage.removeItem('ohana-resume');localStorage.setItem('ohana-difficulty','normal');const e=window.__OHANA_E2E;e.startWorld1('kilo');e.loadRoom('w1-final');dispatchEvent(new CustomEvent('ohana-after',{detail:{action:'repeat'}}));});
  const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
  const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
  const filmsSeen=new Set(),phases=new Set();let deaths=0,s=await state();
  const initialSeals=[...s.world1Seals];assert.equal(initialSeals.length,10);assert.equal(s.evo,4);
  async function films(){
   for(let i=0;i<30;i++){
    if(await selectFinalFighter(page,'kilo')){await step(55);continue;}
    const s=await state();if(!s.world1Cine)break;filmsSeen.add(s.world1Cine);
    assert.notEqual(await page.locator('#win-cinema').getAttribute('aria-hidden'),'false','story and reunion cannot share the screen');
    assert.equal(await page.locator('#evo-stage.show').count(),0);
    await page.keyboard.press('Enter');await step(100);
   }
   await page.locator('#game').focus();
  }
  await films();s=await state();
  for(let i=0;i<11000&&!s.world1Won;i++){
   if(await selectFinalFighter(page,'kilo')){s=await step(55);continue;}
   if(s.world1Cine){await films();s=await state();}
   if(s.hp<=0){assert.ok(++deaths<=35,'production retry limit');await page.evaluate(()=>window.__OHANA_E2E.respawn());await films();s=await state();}
   if(!s.boss){await page.keyboard.down('d');s=await step(24);await page.keyboard.up('d');continue;}
   phases.add(s.boss.phase);
   if(s.boss.hp<=0){s=await step(30);continue;}
   const p=s.player,gap=s.boss.x-p.x-p.w/2,dist=Math.abs(gap);
   if(dist<540)await page.keyboard.press('j');if(dist<400&&i%20===0)await page.keyboard.press('u');
   if(s.hp<s.maxHealth*.92&&dist<480)await page.keyboard.press('l');
   if(s.kiloFlight?.mode)await page.keyboard.press('k');
   const target=s.boss.vulnerable?65:250;
   if(dist>target+25)await page.keyboard.down(gap>0?'d':'a');else if(dist<target-30)await page.keyboard.down(gap>0?'a':'d');
   if(s.boss.vulnerable){await page.keyboard.press('h');if(s.kiloCombo?.ready)await page.keyboard.press('i');if(s.finisherCharge>=100)await page.keyboard.press('p');}
   if(p.grounded&&!s.boss.vulnerable&&i%3===0)await page.keyboard.down('w');
   s=await step(12);await page.keyboard.up('d');await page.keyboard.up('a');await page.keyboard.up('w');
   assert.equal(s.runtimeFaults,0);assert.deepEqual(s.world1Seals,initialSeals);
   if(i%200===0){console.log('FINALE_FLOW',JSON.stringify({width,i,hp:s.hp,boss:s.boss?.hp,phase:s.boss?.phase,deaths}));await fs.writeFile(`${dir}/current-${width}.json`,JSON.stringify(s));}
  }
  assert.equal(s.world1Won,true,'ordinary controls win the replay');assert.deepEqual([...phases].sort(),[1,2,3,4]);
  for(let i=0;i<120;i++){
   s=await state();if(s.world1Cine)filmsSeen.add(s.world1Cine);
   if(filmsSeen.has('ending')&&!s.world1Cine)break;await step(60);
  }
  assert.ok(filmsSeen.has('bossDefeat'));assert.ok(filmsSeen.has('ending'));
  await page.clock.runFor(16000);
  assert.equal(await page.locator('#win-cinema').getAttribute('aria-hidden'),'false');
  assert.equal((await state()).world1Cine,null);assert.equal(await page.locator('#world1-cine-controls').isVisible(),false);
  assert.equal(await page.locator('#win-cinema').evaluate(el=>el.classList.contains('cinema-complete')),true);
  const heroCaption=await page.locator('.win-hero').innerText();
  const captionParts=heroCaption.split(' · ');if(captionParts.length===2)assert.notEqual(captionParts[0],captionParts[1],'the hero name cannot repeat the form name');
  assert.match(await page.locator('.win-score').innerText(),/Rango [A-Z]/);
  assert.doesNotMatch(await page.locator('#win-cinema [data-open-constellation]').innerText(),/V\d+/,'build numbers do not belong in the closing invitation');
  await page.screenshot({path:`${dir}/ending-${width}.png`});
  await page.locator('#win-roster').click();await page.clock.runFor(100);
  assert.equal(await page.locator('#char-select').isVisible(),true);assert.deepEqual((await state()).world1Seals,initialSeals);
  await page.screenshot({path:`${dir}/roster-${width}.png`});assert.deepEqual(errors,[]);
  reports.push({width,height,startingFromEarnedBackup:true,replayAction:true,ordinaryCombat:true,deaths,phases:[...phases].sort(),films:[...filmsSeen],won:true,noCinematicOverlap:true,returnToRoster:true,preservedSeals:true,errors});
  await context.close();
 }
 await fs.writeFile(`${dir}/report.json`,JSON.stringify(reports,null,2));
 console.log('PASS finale flow: Normal replay, all four Quimera phases, separate ending/reunion and return to selection, desktop/mobile');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
