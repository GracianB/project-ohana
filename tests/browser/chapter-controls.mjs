// Production-control chapter pilot. Reads authored targets, uses ordinary keys.
// No teleports, health/XP grants, station flags or boss-health writes.
import assert from 'node:assert/strict';
import {advanceKiloEncounterControls} from './kilo-encounter-controls-v606.mjs';
import {advanceStitchoEncounterControls} from './stitcho-encounter-controls-v607.mjs';
export async function playChapter(page,{hero,state,step,films,onDeath=()=>page.evaluate(()=>window.__OHANA_E2E.respawn()),onBeat=()=>{}}){
 let s=await state();const press=k=>page.keyboard.press(k),hold=k=>page.keyboard.down(k),release=k=>page.keyboard.up(k);
  const expeditionNodes=await page.evaluate(async hero=>(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-'+hero].expedition?.nodes||[],hero);
  const allStations=await page.evaluate(async hero=>(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-'+hero].seal.stations,hero);
  const stations=hero==='pizza'?allStations.filter(q=>q.kind==='guest'):allStations;
  const forms=new Set([0]);let deaths=0,iterations=0,minHp=s.hp,railRun=false;
  for(let i=0;i<7000&&!s.world1.sealed;i++){
   iterations=i;
   if(s.hp<=0){assert.ok(++deaths<=12,'natural retries exhausted '+hero);await onDeath();await films();s=await step(90);}
   await films();s=await state();forms.add(s.evo);minHp=Math.min(minHp,s.hp);
   if(hero==='kilo'||hero==='stitcho'){
    s=await (hero==='kilo'?advanceKiloEncounterControls:advanceStitchoEncounterControls)(page,s,step,i);
    forms.add(s.evo);minHp=Math.min(minHp,s.hp);
    assert.equal(s.runtimeFaults,0);assert.ok(s.evo<=s.world1.done+(hero==='stitcho'&&(await page.evaluate(()=>window.__OHANA_E2E.stitchoChapterState())).railDone?1:0),'growth follows earned lessons');
    if(i%150===0){await onBeat(s,{hero,i,expedition:null,node:null});console.log('CAMPAIGN',JSON.stringify({hero,i,x:Math.round(s.player.x),hp:s.hp,done:s.world1.done,evo:s.evo,expedition:0,y:Math.round(s.player.y)}));}
    continue;
   }
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
   if(i%150===0)await onBeat(s,{hero,i,expedition,node});
   if(i%150===0)console.log('CAMPAIGN',JSON.stringify({hero,i,x:Math.round(s.player.x),hp:s.hp,done:s.world1.done,evo:s.evo,boss:boss?.hp,expedition:expedition?.done.length,target:node?.id,y:Math.round(s.player.y)}));
  }

 return {state:s,journal:{hero,deaths,forms:[...forms],minHp,iterations,discoveries:s.world1.expedition?.done??0}};
}
