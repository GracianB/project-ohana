// Previously earned chapter seals restore the final tools. Earlier final
// rescues are removed only in this isolated fixture to inspect the first
// ritual again; this is not a new campaign completion or collection claim.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
const dir='test-results/v630',server=await startServer(0),base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir(dir,{recursive:true});
 const saved=JSON.parse(await fs.readFile('test-results/v600/earned-campaign-storage.json','utf8'));
 for(const origin of saved.origins){origin.origin=base;origin.localStorage=origin.localStorage.filter(item=>!['ohana-keepsakes-v1','ohana-final-resonances-v1','ohana-resume'].includes(item.name));for(const item of origin.localStorage)if(['ohana','ohana.tmp'].includes(item.name)){const value=JSON.parse(item.value);value.keepsakes=[];value.world1Won=false;if(value.secrets)delete value.secrets['w1-final'];item.value=JSON.stringify(value);}}
 const report=[],errors=[];
 for(const [width,height]of[[1280,900],[390,844],[320,568]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500,storageState:saved});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  const activate=async locator=>width<500?locator.tap():locator.click();
  await page.clock.install({time:new Date('2026-10-29T13:00:00Z')});await page.clock.pauseAt(new Date('2026-10-29T13:00:01Z'));
  await page.goto(base+'/?e2e=1');await page.keyboard.press('Escape');
  await page.evaluate(()=>{localStorage.removeItem('ohana-resume');const e=window.__OHANA_E2E;e.startWorld1('cat');e.loadRoom('w1-final');});
  const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
  const tick=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
  async function films(){
   for(let shot=0;shot<40;shot++){
    const scene=await state();if(!scene.world1Cine&&!scene.pendingWorld1Cine)break;
    assert.equal(await page.locator('#final-hero-choice').count(),0,'a world cinema cannot share the fighter dialog');
    if(scene.world1Cine)await page.keyboard.press('Enter');
    await tick(100);
   }
  }
  await films();await page.locator('#game').focus();let current=await tick(80);
  assert.equal(current.hero,'cat');assert.equal(current.gauntlet.phase,'gathering');assert.equal(current.gauntlet.hero,'kilo');assert.equal(current.gauntlet.guardian,null);assert.deepEqual(current.gauntlet.found,[]);
  const before={xp:current.xp,seals:current.world1Seals,health:current.hp,max:current.maxHealth};
  // Walk across the three real floor pickups. The pilot uses only ordinary
  // movement and authored terrain jumps; no actor/goal position setters.
  let floorCaptured=false;
  for(let step=0;step<180&&current.gauntlet.phase!=='choosing';step++){
   const collected=current.gauntlet.resonances?.kilo||[],target=[822,900,978].find((_,index)=>!collected.includes(index));
   const dx=target-current.player.x-current.player.w/2;
   if(Math.abs(dx)>8)await page.keyboard.down(dx>0?'d':'a');
   current=await tick(Math.abs(dx)>80?10:2);await page.keyboard.up('d');await page.keyboard.up('a');
   if(!floorCaptured&&current.gauntlet.resonances.kilo.length===1){floorCaptured=true;await page.screenshot({path:`${dir}/floor-objects-${width}.png`});}
   assert.equal(current.runtimeFaults,0);
  }
  assert.equal(current.gauntlet.phase,'choosing');assert.deepEqual(current.gauntlet.resonances.kilo,[0,1,2]);assert.equal(current.gauntlet.guardian,null);
  assert.equal(current.xp,before.xp);assert.deepEqual(current.world1Seals,before.seals);assert.deepEqual(current.gauntlet.found,[]);
  await page.locator('#final-hero-choice').waitFor({state:'visible'});
  await page.keyboard.press('m');await page.keyboard.press('?');
  assert.equal(await page.locator('#map-overlay.open,#help.open').count(),0,'map and help shortcuts cannot open another overlay beneath the fighter dialog');
  assert.equal(await page.locator('.fr-hero').count(),10);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`${dir}/hero-choice-${width}.png`});
  await activate(page.locator('.fr-choice-back'));assert.equal((await state()).gauntlet.phase,'gathering');assert.equal(await page.locator('#final-hero-choice').count(),0);
  await page.locator('#game').focus();if(width<500)await page.locator('.touch-btn.interact').tap();else await page.keyboard.press('e');
  try{await page.locator('#final-hero-choice').waitFor({state:'visible'});}catch(error){
   console.log('RITUAL_REOPEN_FAILURE',JSON.stringify({width,state:await state(),overlays:await page.evaluate(()=>({classes:document.body.className,open:[...document.querySelectorAll('#map-overlay.open,#help.open,#pause-overlay.open,#evo-stage.show')].map(e=>e.id),focus:document.activeElement?.id}))}));
   await page.screenshot({path:`${dir}/reopen-failure-${width}.png`});throw error;
  }
  if(width<500){await activate(page.locator('.fr-hero[data-hero="dino"]'));await activate(page.locator('.fr-choice-confirm'));}
  else{await page.locator('.fr-hero[data-hero="dino"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('.fr-hero[data-hero="dino"]').getAttribute('aria-pressed'),'true');await page.locator('.fr-choice-confirm').focus();await page.keyboard.press('Enter');}
  assert.equal((await state()).gauntlet.phase,'summoning');assert.equal(await page.locator('#final-hero-choice').count(),0);
  current=await tick(55);assert.ok(Math.abs(current.hp/current.maxHealth-before.health/before.max)<.001,'changing fighter cannot heal its health fraction');await films();current=await tick(2);
  assert.equal(current.hero,'dino');assert.equal(current.gauntlet.hero,'kilo');assert.equal(current.gauntlet.guardian.pattern,'tide');assert.equal(current.gauntlet.phase,'fight');
  assert.equal(current.xp,before.xp);assert.deepEqual(current.world1Seals,before.seals);assert.deepEqual(current.gauntlet.found,[]);
  await page.keyboard.press('e');await tick(1);assert.equal(await page.locator('#final-hero-choice').count(),0,'a duel cannot reopen the fighter picker');
  await page.screenshot({path:`${dir}/chosen-dino-vs-kilo-guardian-${width}.png`});
  report.push({width,height,earnedSealBackup:true,priorRescuesRemovedForFixture:true,physicalFloorPickups:[0,1,2],movement:'ordinary keyboard controls',choiceInput:width<500?'native touch taps and E button':'native keyboard Space/Enter and E',noNewXpOrSeals:true,healthFractionPreserved:true,cancelReopensWithE:true,noOpeningGestureConfirmation:true,mapAndHelpBlockedDuringChoice:true,fighter:'dino',guardian:'kilo',noMidFightSwap:true,cinemasSeparate:true});

  if(width===1280){
   const gallery=await page.evaluate(async()=>{
    const {EXPEDITION_ART,drawExpeditionArtifact}=await import('/systems/expedition-art-v630.js');
    const {drawPortalMirrors,FINAL_PORTALS}=await import('/systems/final-portal-mirrors.js');
    const sheet=document.createElement('canvas');sheet.width=1500;sheet.height=1000;const c=sheet.getContext('2d'),rows=[];
    for(const [index,hero]of Object.keys(EXPEDITION_ART).entries()){
     const x=index%5*300,y=Math.floor(index/5)*500;c.fillStyle=index%2?'#203d50':'#193144';c.fillRect(x,y,300,500);
     drawExpeditionArtifact(c,hero,x+150,y+170,136,{active:true,t:73});
     const portals=[{...FINAL_PORTALS[index],x:x+150,y:y+330,rx:76,ry:94}];
     const runtime={finalRitualEnabled:true,finalGauntlet:{hero:'none',resonances:{[hero]:[0]},found:[],phase:'gathering',tick:20}};
     // This is a contact sheet, so place the ritual floor relative to the
     // original world geometry in a separate clipped tile for the core only.
     c.save();c.beginPath();c.rect(x,y+210,300,250);c.clip();drawPortalMirrors(c,portals,{x:0,y:0},73,null,false,runtime);c.restore();
     c.fillStyle='#fff1cf';c.font='700 15px sans-serif';c.textAlign='center';c.fillText(EXPEDITION_ART[hero].name,x+150,y+478);
     const sample=document.createElement('canvas');sample.width=sample.height=280;const sc=sample.getContext('2d');drawExpeditionArtifact(sc,hero,140,175,100,{active:true,t:73});
     const data=sc.getImageData(0,0,280,280).data;let count=0;for(let i=3;i<data.length;i+=4)if(data[i]>20)count++;
     rows.push({hero,opaquePixels:count,png:sample.toDataURL()});
    }
    return {rows,png:sheet.toDataURL().split(',')[1]};
   });
   assert.equal(new Set(gallery.rows.map(row=>row.png)).size,10);assert.ok(gallery.rows.every(row=>row.opaquePixels>700));
   await fs.writeFile(`${dir}/ten-relics-and-cores.png`,Buffer.from(gallery.png,'base64'));
   await fs.writeFile(`${dir}/relic-gallery.json`,JSON.stringify(gallery.rows.map(({png,...row})=>row),null,2));
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/ritual-relics.json`,JSON.stringify({report,errors,scope:'First final ritual replay from earned seals with earlier final rescues removed in an isolated fixture; actual floor pickup movement and native fighter choice. Artwork contact sheet is a rendering fixture.'},null,2));
 console.log('PASS V630: physical three-object ritual, real hero choice/cancel, Dino vs Kilo guardian, ten distinct Canvas relics, desktop/mobile');
}finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
