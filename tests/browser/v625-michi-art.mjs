// Artwork fixtures exercise all five forms without granting campaign progress.
// Menu and HUD checks use actual controls and a fresh baby in the Michi chapter.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const release=process.env.OHANA_ART_RELEASE||'625';
assert.match(release,/^\d+$/,'numeric artwork release directory');
const dir=`test-results/v${release}`,server=await startServer(0);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir(dir,{recursive:true});
 const page=await browser.newPage(),errors=[],selection=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.keyboard.press('Escape');
 for(const [width,height]of[[1280,900],[390,844],[320,568]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(180);
  await page.locator('.char-card[data-id="cat"]').click();
  for(let form=0;form<5;form++){
   const button=page.locator(`[data-camp-form="${form}"]`);await button.click();await page.waitForTimeout(90);
   assert.equal(await page.locator('#family-camp').getAttribute('data-hero'),'cat');
   assert.equal(await page.locator('#family-camp').getAttribute('data-form'),String(form));
   assert.ok((await page.locator('#camp-form-name').innerText()).trim().length>5);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'selection horizontal overflow');
   if(form===3)await page.locator('#camp-canvas').screenshot({path:`${dir}/hare-selection-${width}.png`});
  }
  await page.locator('#camp-canvas').screenshot({path:`${dir}/eclipse-selection-${width}.png`});
  selection.push({width,height,allFiveRealButtons:true,noOverflow:true});
 }
 const fixtures=await page.evaluate(async()=>{
  const cat=(await import('/characters/art/cat.js')).default,{R}=await import('/characters/rig.js');
  const {drawCharacter}=await import('/characters/draw.js'),{ROSTER}=await import('/characters/roster.js');
  const def=ROSTER.find(r=>r.id==='cat'),states=['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead'];
  const cases=[...states.map(state=>({state})),...[0,1,2,3,4,5].map(michiPowerIndex=>({state:'cast',michiPowerIndex,castSlot:michiPowerIndex<3?michiPowerIndex:0}))];
  const bounds=[],frozen=[],reduced=[],sheets=[],hitboxes=[];
  const base={t:73,phase:1.8,speed:1,atk:.5,cast:.5,castSlot:0,look:Object.freeze({x:.3,y:0}),michiSeed:42};
  // 0.7x approximates play, 1.5x the presentation cache, 3x cinematic review.
  for(const scale of[.7,1.5,3])for(let form=0;form<5;form++)for(const sample of cases){
   const c=document.createElement('canvas');c.width=Math.ceil(400*scale);c.height=Math.ceil(400*scale);
   const g=c.getContext('2d');g.translate(200*scale,280*scale);g.scale(scale,scale);
   const pose=Object.freeze({...base,...sample,form}),before=JSON.stringify(pose);cat.draw(g,pose,R);
   frozen.push(before===JSON.stringify(pose));
   const pixels=g.getImageData(0,0,c.width,c.height).data;let minX=c.width,minY=c.height,maxX=0,maxY=0,count=0;
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>24){count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
   bounds.push({scale,form,state:sample.state,power:sample.michiPowerIndex,count,
    left:minX/scale-200,top:minY/scale-280,right:maxX/scale-200,bottom:maxY/scale-280});
  }
  for(let form=0;form<5;form++){
   for(const sample of cases){
    const snapshots=[];for(const [t,phase]of[[73,1.8],[212,4.4]]){
     const c=document.createElement('canvas');c.width=c.height=400;const g=c.getContext('2d');g.translate(200,280);
     cat.draw(g,{...base,...sample,form,t,phase,reduceMotion:true},R);snapshots.push(c.toDataURL());
    }
    reduced.push({form,state:sample.state,power:sample.michiPowerIndex,stable:snapshots[0]===snapshots[1]});
   }
  }
  for(const facing of[1,-1]){
   const sheet=document.createElement('canvas');sheet.width=2640;sheet.height=2100;const s=sheet.getContext('2d');
   for(let form=0;form<5;form++)for(let i=0;i<6;i++){
    const state=['idle','run','jump','glide','cast','hurt'][i],x=i*440,y=form*420;
    s.fillStyle=(i+form)%2?'#253b4e':'#203346';s.fillRect(x,y,440,420);
    const f=def.forms[form],p={id:'cat',evo:form,x:x+220-f.w/2,y:y+360-f.h,w:f.w,h:f.h,color:f.color,speed:f.speed,
     visualScale:1.65,vx:state==='run'?6:0,vy:['jump','glide'].includes(state)?-3:0,grounded:!['jump','glide'].includes(state),
     facing,_poseOverride:state,rng:()=>.5,_cast:state==='cast'?{t:60,slot:0,id:'yarn'}:undefined,
     _hurtAt:state==='hurt'?70:undefined,_gliding:state==='glide'};
    const physical=[p.x,p.y,p.w,p.h];drawCharacter(s,p,{x:0,y:0},73);
    hitboxes.push({form,state,facing,unchanged:JSON.stringify(physical)===JSON.stringify([p.x,p.y,p.w,p.h])});
    s.fillStyle='#ffedcb';s.font='14px sans-serif';s.fillText(`${form+1} ${f.name}`,x+12,y+24);s.fillText(state,x+12,y+44);
   }
   sheets.push({name:facing>0?'right':'left',png:sheet.toDataURL().split(',')[1]});
  }
  return {bounds,frozen,reduced,hitboxes,sheets};
 });
 await fs.writeFile(`${dir}/michi-art-fixtures.json`,JSON.stringify({...fixtures,sheets:undefined},null,2));
 for(const b of fixtures.bounds){
  assert.ok(b.count>25,'empty body: '+JSON.stringify(b));
  // presentCharacter's 280-unit cached square: origin (140, 218.4).
  assert.ok(b.left>-137&&b.right<137&&b.top>-215&&b.bottom<58,
   'authored art must fit its actual presentation cache with outline margin: '+JSON.stringify(b));
 }
 assert.ok(fixtures.frozen.every(Boolean),'artwork mutated a frozen input');
 assert.ok(fixtures.reduced.every(row=>row.stable),'reduced motion changed with time: '+JSON.stringify(fixtures.reduced.filter(row=>!row.stable)));
 assert.ok(fixtures.hitboxes.every(row=>row.unchanged),'rendering changed a hitbox');
 for(const sheet of fixtures.sheets)await fs.writeFile(`${dir}/all-forms-${sheet.name}.png`,Buffer.from(sheet.png,'base64'));
 delete fixtures.sheets;
 const chapter=[];
 for(const [width,height]of[[1280,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500});
  const game=await context.newPage();game.on('pageerror',e=>errors.push(e.message));
  await game.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await game.keyboard.press('Escape');
  await game.evaluate(()=>{localStorage.clear();window.__OHANA_E2E.setSeed(73);window.__OHANA_E2E.start('cat');window.__OHANA_E2E.loadRoom('w1-cat');});
  for(let i=0;i<20;i++){
   const film=await game.evaluate(()=>window.__OHANA_E2E.state().world1Cine);if(!film)break;
   await game.keyboard.press('Enter');await game.evaluate(()=>window.__OHANA_E2E.step(100));
  }
  await game.waitForTimeout(100);
  const state=await game.evaluate(()=>window.__OHANA_E2E.state());
  assert.equal(state.hero,'cat');assert.equal(state.roomId,'w1-cat');assert.equal(state.evo,0);assert.equal(state.runtimeFaults,0);
  assert.equal(await game.locator('#hud').isVisible(),true);assert.match(await game.locator('#hud-name').innerText(),/Michi/);
  assert.ok(await game.locator('#hud-avatar canvas').count()>0,'HUD must use the living Canvas portrait');
  const hp=await game.locator('#hp-bar').evaluate(el=>el.getBoundingClientRect().width);assert.ok(hp>0);
  assert.ok(await game.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await game.screenshot({path:`${dir}/game-hud-${width}.png`});
  await game.locator('#game').focus();await game.keyboard.down('d');await game.keyboard.down('w');
  await game.evaluate(()=>window.__OHANA_E2E.step(9));await game.keyboard.up('d');await game.keyboard.up('w');
  await game.screenshot({path:`${dir}/baby-jump-${width}.png`});
  chapter.push({width,height,freshBaby:true,directChapterAccessFixture:true,hudLivingCanvas:true,healthVisible:true,noOverflow:true});await context.close();
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/michi-art.json`,JSON.stringify({selection,artwork:fixtures,chapter,errors,
  scope:'Artwork fixtures and fresh direct chapter access; no progress grants or campaign/balance claims.'},null,2));
 console.log('PASS Michi: 5 forms × 17 poses × 3 scales, both facings, reduced motion, actual 1280/390/320 menu and desktop/mobile baby HUD');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
