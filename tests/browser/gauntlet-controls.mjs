// Reads actual warnings and uses ordinary controls; never writes gameplay state.
import assert from 'node:assert/strict';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
export async function playGauntlet(page,{onBeat=()=>{}}={}){
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
 const down=k=>page.keyboard.down(k),up=k=>page.keyboard.up(k),press=k=>page.keyboard.press(k);
 let s=await state(),deaths=0;const rescued=new Set(),seen=new Set();
 for(let i=0;i<16000;i++){
  const supreme=page.locator('#supreme-cinema[aria-hidden="false"]');
  if(await supreme.count()){const duration=await supreme.evaluate(el=>Number(el.dataset.duration)||16000);await page.clock.runFor(duration+1000);s=await state();continue;}
  if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(500);s=await state();continue;}
  if(s.world1Cine){assert.equal(await supreme.count(),0,'one cinema owner');seen.add(s.world1Cine);await press('Enter');s=await step(100);continue;}
  if(s.hp<=0){assert.ok(++deaths<=30,'gauntlet natural retry limit');await page.evaluate(()=>window.__OHANA_E2E.respawn());s=await step(90);continue;}
  const v=s.gauntlet,p=s.player;
  if(v?.phase==='complete'){assert.equal(v.found.length,10);return{deaths,rescued:[...v.found],cinematics:[...seen]};}
  if(!v){await down('d');s=await step(24);await up('d');continue;}
  for(const h of v.found)rescued.add(h);
  const b=v.guardian;let target;
  if(v.phase==='released')target=v.object.x;
  else if(v.phase!=='fight'){s=await step(30);continue;}
  else{
   const side=p.x+p.w/2<b.x+b.w/2?-1:1;
   target=b.x+b.w/2+side*(b.phase==='rest'?95:310);
   if(b.phase==='warn'&&b.marks?.length){const x=p.x+p.w/2;const near=b.marks.find(xx=>Math.abs(xx-x)<90);if(near!=null)target=near+(x<=near?-120:120);}
   const gap=Math.abs(p.x+p.w/2-b.x-b.w/2);
   if(gap<650){await press('j');if(i%20===0)await press('u');}
   if(b.phase==='rest'&&gap<270){await press('h');if(i%9===0)await press('l');if(s.hero!=='kilo'||s.kiloCombo?.ready)await press('i');if(s.finisherCharge>=100)await press('p');}
   if(b.phase==='warn'&&b.clock<23&&p.grounded&&!['lightning','geysers'].includes(b.pattern))await down('w');
   if(b.phase==='attack'&&b.pattern==='quake'&&b.clock<28&&b.clock>17&&p.grounded)await down('w');
  }
  if(p.grounded&&p.y<1000)await down('s');
  const dx=target-p.x-p.w/2;if(Math.abs(dx)>25)await down(dx>0?'d':'a');
  s=await step(10);await up('d');await up('a');await up('w');await up('s');
  assert.equal(s.runtimeFaults,0,JSON.stringify(s));
  if(i%150===0){console.log('GAUNTLET',JSON.stringify({i,hero:v.hero,phase:v.phase,hp:s.hp,boss:b?.hp,bossPhase:b?.phase,x:Math.round(p.x),y:Math.round(p.y),found:v.found.length,deaths}));await onBeat(s);}
 }
 throw Error('Gauntlet did not complete: '+JSON.stringify(s.gauntlet));
}
