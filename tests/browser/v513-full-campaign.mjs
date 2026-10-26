// One clean save, one page, physical controls from Kilo to the ending.
// No loadRoom, setPlayer, setEvo, setInvulnerable or seal/XP/win mutation.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],journal=[];
 page.on('pageerror',e=>errors.push(e.message));await fs.mkdir('test-results/v600',{recursive:true});
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.evaluate(()=>{localStorage.clear();localStorage.setItem('ohana-difficulty','normal');const e=window.__OHANA_E2E;e.setSeed(73);e.startWorld1('kilo');});
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
 const press=k=>page.keyboard.press(k),hold=k=>page.keyboard.down(k),release=k=>page.keyboard.up(k);
 async function films(){
  for(let i=0;i<24;i++){
   if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);continue;}
   const s=await state();if(!s.world1Cine)break;if(['bossDefeat','ending'].includes(s.world1Cine)){assert.notEqual(await page.locator('#win-cinema').getAttribute('aria-hidden'),'false','reunion cannot overlap world1 film');assert.equal(await page.locator('#evo-stage.show').count(),0);}await press('Enter');await step(100);
  }await page.locator('#game').focus();
 }
 let s=await step(600);await films();s=await state();
 const order=await page.evaluate(async()=>(await import('/systems/world1-rooms.js')).WORLD1_ORDER);
 for(const [chapter,hero] of order.entries()){
  assert.equal(s.roomId,'w1-'+hero);assert.equal(s.hero,hero);assert.equal(s.evo,0,'each new chapter starts baby');
  const expeditionNodes=await page.evaluate(async hero=>(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-'+hero].expedition?.nodes||[],hero);
  const allStations=await page.evaluate(async hero=>(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-'+hero].seal.stations,hero);
  const stations=hero==='pizza'?allStations.filter(q=>q.kind==='guest'):allStations;
  const forms=new Set([0]);let deaths=0,iterations=0,minHp=s.hp,railRun=false;
  for(let i=0;i<7000&&!s.world1.sealed;i++){
   iterations=i;
   if(s.hp<=0){assert.ok(++deaths<=12,'natural retries exhausted '+hero);await page.evaluate(()=>window.__OHANA_E2E.respawn());await films();s=await step(90);}
   await films();s=await state();forms.add(s.evo);minHp=Math.min(minHp,s.hp);
   const data=await page.evaluate(()=>({next:window.__OHANA_E2E.nextChapterState(),workshop:window.__OHANA_E2E.stitchoChapterState(),fryer:window.__OHANA_E2E.fryerAstralState(),pizza:window.__OHANA_E2E.pizzaChapterState()}));
   const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast()),boss=foes.find(e=>e.chapterBoss||e.guardian||e.stitchoBoss||e.chispinBoss),b=boss&&(boss.chapterBoss||boss.guardian||boss.stitchoBoss||boss.chispinBoss);
   const p=s.player,station=stations[s.world1.done],near=foes.filter(e=>e.hp>0&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<430).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
   let target=station?station.x:(boss?.x||8750)-210,jump=false;
   if(hero==='stitcho'){
    if(s.world1.done===1&&!data.workshop.railDone){
     if(p.x+p.w/2>3340)railRun=false;
     if(!railRun&&Math.abs(p.x+p.w/2-2940)<30&&p.grounded)railRun=true;
     target=railRun?3380:2940;
    }
    else if(station)target=data.workshop.carry!=null?station.target.x:station.x;
   }
   if(hero==='cuerno'&&!data.next.mirror)target=1000;
   if(hero==='pizza'&&station)target=data.pizza.carry==='pizza'?station.x:data.pizza.ovens.at(-1);
   if(hero==='frita'&&station&&data.fryer.launched===station.id&&!p.grounded)target=station.prize.x;
   if(hero==='yomi'&&station&&data.fryer.stations.find(q=>q.id===station.id)?.state!=='live')target=station.x-145;
   if(!station&&b?.phase==='warn'&&(b.attack===0||b.attack===3))target=p.x<boss.x?Math.max(8290,boss.x-380):Math.min(9240,boss.x+380);
   const expedition=await page.evaluate(()=>window.__OHANA_E2E.expeditionState?.());
   const inAct2=!station&&(!boss||boss.hp<=0)&&expeditionNodes.length>0;
   const node=inAct2?expeditionNodes.find(n=>!expedition?.done.includes(n.id)):null;
   if(node){
    target=node.kind==='supper'&&expedition?.carry!==node.id?node.x-700:node.x;
    if(node.kind==='nest'&&p.y+p.h/2>node.y+90)target=node.x-190;
    if(node.kind==='spice'&&p.grounded&&p.x+p.w/2<node.x-150)target=node.x-230;
    const dy=node.y-(p.y+p.h/2),ndx=node.x-p.x-p.w/2;
    if(hero==='kilo'){
     if(s.kiloFlight?.mode!=='solar')await press('k');
     if(Math.abs(dy)>20)await hold(dy>0?'s':'w');
     if(Math.abs(ndx)<150&&Math.abs(dy)<130)await press('j');
    }else{
     if(['moon','spice'].includes(node.kind)&&p.grounded&&Math.abs(ndx)<100)jump=true;
     if(dy< -35&&Math.abs(ndx)<350&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps))jump=true;
     if(['cell','conductor','nest','archive'].includes(node.kind)&&Math.abs(ndx)<150&&Math.abs(dy)<130)await press('j');
     if(node.kind==='plate'&&Math.abs(ndx)<140){if(p.grounded)jump=true;else if(p.vy>0)await press('k');}
    }
   }
   const dx=target-p.x-p.w/2;
   if(Math.abs(dx)>24)await hold(dx>0?'d':'a');
   if(hero==='stitcho'&&s.world1.done===1&&!data.workshop.railDone&&railRun&&p.grounded&&p.x+p.w/2>=2910&&p.x+p.w/2<3000)await press('k');
   if(hero==='cuerno'&&!data.next.mirror&&Math.abs(dx)<200)await press('j');
   if(hero==='dragon'&&station&&Math.abs(dx)<240)await press('j');
   if(hero==='cat'&&station&&Math.abs(dx)<300&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps&&p.y+p.h>station.y+45))jump=true;
   if(hero==='dino'&&station){
    if(Math.abs(dx)<180&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps&&station.y-(data.next.dinoPeak??station.y)<station.dropHeight+20))jump=true;
    if(s.evo>=1&&Math.abs(dx)<55&&!p.grounded&&p.vy>0&&station.y-(data.next.dinoPeak??station.y)>=station.dropHeight+10)await press('k');
   }
   if(hero==='frita'&&station&&data.fryer.launched===station.id&&!p.grounded)await press('j');
   if(hero==='yomi'&&station&&Math.abs(p.x+p.w/2-station.x)<220&&data.fryer.stations.find(q=>q.id===station.id)?.state==='live')await press('j');
   if(hero==='chispin'){
    const gate=[2860,4460,6260].find(x=>Math.abs(p.x+p.w/2-x)<230);
    if(gate!=null){await press('j');if(s.evo>=1&&p.x+p.w/2<gate&&Math.abs(p.x+p.w/2-gate)<125)await press('k');}
   }
   const nearBoss=near&&(near.chapterBoss||near.guardian||near.stitchoBoss||near.chispinBoss);
   if(near&&(!nearBoss||b?.phase==='rest')){
    await press('h');await press('j');
    if(!node&&s.evo>=1&&i%18===0&&!['dragon','kilo','stitcho'].includes(hero)&&(hero!=='dino'&&hero!=='frita'||!station))await press('k');
    if(!node&&s.evo>=2&&i%12===0)await press('l');if(!node&&i%10===0)await press('u');
    if(!node&&s.evo>=3&&i%15===0)await press('i');if(!node&&s.evo===4&&s.finisherCharge>=100)await press('p');
   }
   if(!station&&b?.phase==='warn'&&i%3===0)jump=true;
   if(jump)await hold('w');
   if(!node&&p.grounded&&p.y<1000&&hero!=='cat')await hold('s');else await release('s');
   s=await step(node&&jump?16:Math.abs(dx)>24?Math.min(14,Math.max(1,Math.floor(Math.abs(dx)/7))):20);
   await release('d');await release('a');if(node&&hero==='kilo'){await release('w');await release('s');}if(jump){await release('w');s=await step(1);}
   assert.equal(s.runtimeFaults,0);
   if(i%150===0){await fs.writeFile('test-results/v600/campaign-debug.json',JSON.stringify({s,expedition,node}));await page.screenshot({path:'test-results/v600/campaign-current.png'});}
   if(i%150===0)console.log('CAMPAIGN',JSON.stringify({hero,i,x:Math.round(s.player.x),hp:s.hp,done:s.world1.done,evo:s.evo,boss:boss?.hp,expedition:expedition?.done.length,target:node?.id,y:Math.round(s.player.y)}));
  }
  assert.equal(s.world1.sealed,true,hero+' earned seal');assert.equal(s.world1.expedition.done,3,'all three real Act II discoveries');assert.deepEqual([...forms].sort(),[0,1,2,3,4]);
  assert.deepEqual(s.world1Seals,order.slice(0,chapter+1),'one continuous earned seal inventory');
  journal.push({hero,deaths,forms:[...forms],minHp,iterations,sealCount:s.world1Seals.length,discoveries:s.world1.expedition.done});
  await page.screenshot({path:`test-results/v600/campaign-${hero}-sealed.png`});await films();
  for(let n=0;n<160&&s.roomId==='w1-'+hero;n++){await hold('d');s=await step(20);}await release('d');
  assert.notEqual(s.roomId,'w1-'+hero,'earned east exit crosses physically');await films();s=await state();
  await fs.writeFile('test-results/v600/campaign-progress.json',JSON.stringify({journal,current:s.roomId},null,2));
 }
 assert.equal(s.roomId,'w1-final');assert.equal(s.hero,'kilo');assert.equal(s.evo,4);
 let deaths=0;const phases=new Set(),filmsSeen=new Set(),hudPhases=new Set();
 await fs.mkdir('test-results/v494',{recursive:true});
 for(let i=0;i<11000&&!s.world1Won;i++){
  if(s.world1Cine){filmsSeen.add(s.world1Cine);await films();s=await state();}
  if(s.hp<=0){assert.ok(++deaths<=35,'final boss retry limit');await page.evaluate(()=>window.__OHANA_E2E.respawn());await films();s=await state();}
  if(!s.boss){await hold('d');s=await step(24);await release('d');continue;}
  phases.add(s.boss.phase);
  if(!hudPhases.has(s.boss.phase)&&s.boss.hp>0){
   // The Quimera draws its own Canvas arena HUD. The old Nest Queen
   // boss-wrap must be hidden. Verify real screen-reader phase text too.
   const oldRibbonHidden=await page.locator('#boss-wrap').evaluate(el=>el.classList.contains('hidden'));
   assert.equal(oldRibbonHidden,true,'legacy Nest Queen HUD must not overlap Quimera');
   const accessible=await page.locator('#world1-quimera-a11y').textContent();
   assert.match(accessible,new RegExp('Fase '+s.boss.phase+' de 4'),'accessible Quimera phase');
   await page.screenshot({path:'test-results/v494/quimera-hud-phase-'+s.boss.phase+'.png'});
   hudPhases.add(s.boss.phase);
  }
  const p=s.player,gap=s.boss.x-p.x-p.w/2,dist=Math.abs(gap);
  if(s.boss.hp<=0){s=await step(30);continue;}
  if(dist<540)await press('j');if(dist<400&&i%20===0)await press('u');
  if(s.hp<s.maxHealth*.92&&dist<480)await press('l');
  if(s.kiloFlight?.mode)await press('k');
  const target=s.boss.vulnerable?65:250;
  if(dist>target+25)await hold(gap>0?'d':'a');else if(dist<target-30)await hold(gap>0?'a':'d');
  if(s.boss.vulnerable){await press('h');if(s.kiloCombo?.ready)await press('i');if(s.finisherCharge>=100)await press('p');}
  if(p.grounded&&!s.boss.vulnerable&&i%3===0)await hold('w');
  s=await step(12);await release('d');await release('a');await release('w');
  if(i%200===0)console.log('QUIMERA',JSON.stringify({i,hp:s.hp,boss:s.boss?.hp,phase:s.boss?.phase,deaths}));
 }
 assert.equal(s.world1Won,true,'ordinary combat wins the full campaign');
 assert.deepEqual([...phases].sort(),[1,2,3,4]);
 assert.deepEqual([...hudPhases].sort(),[1,2,3,4],'four actual HUD screenshots from all phases');
 for(let i=0;i<120;i++){s=await state();if(s.world1Cine)filmsSeen.add(s.world1Cine);if(filmsSeen.has('ending')&&!s.world1Cine)break;await step(60);}
 assert.ok(filmsSeen.has('bossDefeat'));assert.ok(filmsSeen.has('ending'));
 assert.deepEqual(errors,[]);
 // Let the final reunion actually paint and finish; a won flag alone does not
 // prove that the results or the return to selection can be used.
 await page.clock.runFor(16000);
 assert.equal(await page.locator('#win-cinema').getAttribute('aria-hidden'),'false');
 assert.equal((await state()).world1Cine,null,'world story relinquishes the screen before reunion');
 assert.equal(await page.locator('#world1-cine-controls').isVisible(),false,'no old story controls over reunion');
 assert.equal(await page.locator('#win-cinema').evaluate(el=>el.classList.contains('cinema-complete')),true);
 assert.equal(await page.locator('#win-continue').isVisible(),true);
 await page.screenshot({path:'test-results/v600/campaign-ending.png'});
 await page.locator('#win-roster').click();await page.clock.runFor(100);
 assert.equal(await page.locator('#char-select').isVisible(),true);
 assert.equal((await state()).world1Seals.length,10);
 await page.screenshot({path:'test-results/v600/campaign-return-selection.png'});
 // Starting a different hero must retain discoveries independently of the
 // last active-hero save, not merely within this one continuous page.
 for(const hero of order){
  await page.evaluate(hero=>{localStorage.removeItem('ohana-resume');window.__OHANA_E2E.startWorld1(hero);},hero);
  assert.equal((await page.evaluate(()=>window.__OHANA_E2E.expeditionState())).done.length,3,hero+' discoveries survive chapter selection');
 }
 await page.context().storageState({path:'test-results/v600/earned-campaign-storage.json'});
 await fs.writeFile('test-results/v600/full-campaign.json',JSON.stringify({difficulty:'normal',journal,finalDeaths:deaths,phases:[...phases],films:[...filmsSeen],won:true,combatReport:s.combatReport,errors},null,2));
 console.log('PASS continuous Normal campaign: ten earned chapters, four Quimera phases and ending');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
