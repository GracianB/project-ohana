// Menu previews are operated through their real buttons. The chapter-access
// fixture starts Michi as a baby; only movement/jumps/attacks earn form four.
// The separate pose contact sheet is artwork QA, never campaign evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir('test-results/v624',{recursive:true});
 const page=await browser.newPage(),errors=[],selection=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.keyboard.press('Escape');
 for(const [width,height]of[[1280,900],[390,844],[320,568]]){
  await page.setViewportSize({width,height});await page.locator('.char-card[data-id="cat"]').click();await page.locator('[data-camp-form="0"]').click();await page.waitForTimeout(150);if(width===390)await page.locator('#camp-canvas').screenshot({path:'test-results/v624/baby-selection-390.png'});await page.locator('[data-camp-form="3"]').click();await page.waitForTimeout(250);
  assert.equal(await page.locator('#family-camp').getAttribute('data-hero'),'cat');assert.equal(await page.locator('#family-camp').getAttribute('data-form'),'3');
  assert.match(await page.locator('#camp-form-name').innerText(),/Conejornio Lunar/);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#camp-canvas').screenshot({path:`test-results/v624/selection-${width}.png`});selection.push({width,height,realFourthFormPreview:true,noOverflow:true});
 }
 const artwork=await page.evaluate(async()=>{
  const {drawMoonHare}=await import('/characters/michi-moon-hare.js');
  const rows=[...['idle','run','jump','fall','glide','wall','attack','hurt','victory','dead'].map(state=>({state})),...[0,1,2,3,4,5].map(michiPowerIndex=>({state:'cast',michiPowerIndex}))];
  const sheet=document.createElement('canvas');sheet.width=1280;sheet.height=1280;const s=sheet.getContext('2d'),bounds=[];
  for(const [i,p]of rows.entries()){
   const c=document.createElement('canvas');c.width=c.height=320;const g=c.getContext('2d');g.translate(150,280);g.scale(1.7,1.7);drawMoonHare(g,{...p,t:45,phase:1.5,atk:.5,cast:.5,castSlot:0,look:{x:1,y:0},speed:1});
   const d=g.getImageData(0,0,320,320).data;let minX=320,minY=320,maxX=0,maxY=0,count=0;
   for(let y=0;y<320;y++)for(let x=0;x<320;x++)if(d[(y*320+x)*4+3]>10){count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
   bounds.push({state:p.state,power:p.michiPowerIndex,minX,minY,maxX,maxY,count});const x=i%4*320,y=Math.floor(i/4)*320;s.fillStyle=i%2?'#304659':'#24394d';s.fillRect(x,y,320,320);s.drawImage(c,x,y);s.fillStyle='#fff0ce';s.font='15px sans-serif';s.fillText(p.state+(p.michiPowerIndex==null?'':' · '+['J','K','L','I','P','U'][p.michiPowerIndex]),x+14,y+24);
  }return {bounds,png:sheet.toDataURL().split(',')[1]};
 });
 for(const b of artwork.bounds){assert.ok(b.count>500,b.state);assert.ok(b.minX>3&&b.minY>3&&b.maxX<317&&b.maxY<317,'no clipped anatomy: '+JSON.stringify(b));}
 await fs.writeFile('test-results/v624/poses.png',Buffer.from(artwork.png,'base64'));
 await page.clock.install({time:new Date("2026-10-28T12:00:00Z")});await page.clock.pauseAt(new Date("2026-10-28T12:00:01Z"));
 await page.setViewportSize({width:1280,height:900});
 await page.evaluate(()=>{localStorage.clear();localStorage.setItem('ohana-difficulty','normal');window.__OHANA_E2E.setSeed(73);window.__OHANA_E2E.start('cat');window.__OHANA_E2E.loadRoom('w1-cat');});
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=async n=>{await advanceTerrainControls(page,n);await page.clock.runFor(16);return state();};
 async function films(){for(let i=0;i<24;i++){if(await page.locator('#evo-stage.show .evo-skip').count()){await page.locator('#evo-stage .evo-skip').click();await page.clock.runFor(400);continue;}if(!(await state()).world1Cine)break;await page.keyboard.press('Enter');await step(100);}await page.locator('#game').focus();}
 await films();let current=await step(5);await page.screenshot({path:'test-results/v624/baby-in-room.png'});assert.equal(current.evo,0);assert.equal(current.hero,'cat');assert.equal(current.roomId,'w1-cat');assert.equal(current.world1Seals.length,0);
 const stations=await page.evaluate(async()=>(await import('/systems/world1-rooms.js')).WORLD1_ROOMS['w1-cat'].seal.stations);
 let deaths=0,fairyFlight=null;const earned=new Set([0]);
 for(let i=0;i<900&&current.evo<3;i++){
  if(current.hp<=0){assert.ok(++deaths<=6);await page.evaluate(()=>window.__OHANA_E2E.respawn());await films();current=await step(40);}
  await films();current=await state();earned.add(current.evo);
  if(current.evo===1&&!fairyFlight){
   await page.keyboard.down('s');for(let n=0;n<40&&!current.player.grounded;n++)current=await step(8);await page.keyboard.up('s');
   assert.equal(current.player.grounded,true);const from=current.player.y;
   await page.keyboard.down('w');current=await step(60);await page.keyboard.up('w');
   assert.equal(current.michiFlight?.mode,'ascend');assert.ok(current.player.y<from-100);
   fairyFlight={from,to:current.player.y,remaining:current.michiFlight.remaining};await page.screenshot({path:'test-results/v624/fairy-flight.png'});
  }
  const p=current.player,station=stations[current.world1.done],dx=station.x-p.x-p.w/2;
  const foes=await page.evaluate(()=>window.__OHANA_E2E.roomCast());const near=foes.find(e=>e.hp>0&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<400);
  if(Math.abs(dx)>24)await page.keyboard.down(dx>0?'d':'a');
  const jump=Math.abs(dx)<300&&(p.grounded||p.vy>=0&&p.jumps<p.maxJumps&&p.y+p.h>station.y+45);
  if(jump)await page.keyboard.down('w');
  if(near){await page.keyboard.press('h');await page.keyboard.press('j');if(current.evo>=2&&i%12===0)await page.keyboard.press('l');}
  current=await step(Math.abs(dx)>24?Math.min(14,Math.max(1,Math.floor(Math.abs(dx)/7))):20);
  await page.keyboard.up('d');await page.keyboard.up('a');if(jump){await page.keyboard.up('w');current=await step(1);}
  assert.equal(current.runtimeFaults,0);if(i%100===0)console.log('HARE_GROWTH',JSON.stringify({i,x:Math.round(current.player.x),done:current.world1.done,evo:current.evo,hp:current.hp}));
 }
 await films();current=await state();earned.add(current.evo);assert.equal(current.evo,3);assert.ok(current.world1.done>=3);assert.deepEqual([...earned].sort(),[0,1,2,3]);
 await page.screenshot({path:'test-results/v624/earned-hare.png'});
 const before=current.player.x;await page.keyboard.down('d');await step(12);await page.screenshot({path:'test-results/v624/running-in-room.png'});await page.keyboard.up('d');
 await page.keyboard.down('w');await step(10);await page.keyboard.up('w');await page.screenshot({path:'test-results/v624/jumping-in-room.png'});
 await page.keyboard.press('j');await step(6);await page.screenshot({path:'test-results/v624/casting-in-room.png'});
 assert.deepEqual(errors,[]);
 const eclipseFlight=[];
 const storage=JSON.parse(await fs.readFile(process.env.OHANA_EARNED_STORAGE||'test-results/v600/earned-campaign-storage.json','utf8'));
 for(const o of storage.origins)o.origin=`http://127.0.0.1:${server.address().port}`;
 for(const mobile of[false,true]){
  const context=await browser.newContext({storageState:storage,viewport:mobile?{width:390,height:844}:{width:1280,height:900},hasTouch:mobile,isMobile:mobile}),fly=await context.newPage();
  fly.on('pageerror',e=>errors.push(e.message));await fly.clock.install({time:new Date('2026-10-28T12:00:00Z')});await fly.clock.pauseAt(new Date('2026-10-28T12:00:01Z'));
  await fly.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await fly.keyboard.press('Escape');
  await fly.evaluate(()=>{localStorage.removeItem('ohana-resume');window.__OHANA_E2E.startWorld1('cat');});
  const ft=async n=>{await fly.evaluate(n=>window.__OHANA_E2E.step(n),n);await fly.clock.runFor(16);return fly.evaluate(()=>window.__OHANA_E2E.state());};
  for(let i=0;i<20;i++){if(!(await fly.evaluate(()=>window.__OHANA_E2E.state())).world1Cine)break;await fly.keyboard.press('Enter');await ft(100);}
  await fly.locator('#game').focus();let a=await ft(12);assert.equal(a.evo,4);const from=a.player.y;
  let session;
  if(mobile){const box=await fly.locator('.touch-btn.jump').boundingBox();assert.ok(box);session=await context.newCDPSession(fly);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});}
  else await fly.keyboard.down('Space');
  a=await ft(100);assert.equal(a.michiFlight.mode,'ascend');assert.equal(a.michiFlight.unlimited,true);assert.ok(a.player.y<from-200);const ascentY=a.player.y;
  const notice=await fly.locator('#notification-container').boundingBox();const screenFoot=(a.player.y+a.player.h-a.camera.y)*1.02-(mobile?844:900)*.01;
  if(notice)assert.ok(screenFoot-145>notice.y+notice.height,'flight camera must keep the visible hero below the objective notice');
  await fly.screenshot({path:`test-results/v624/eclipse-flight-${mobile?'touch':'keyboard'}.png`});
  if(mobile)await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await fly.keyboard.up('Space');
  a=await ft(20);assert.equal(a.michiFlight.mode,'glide');assert.ok(a.player.vy>0&&a.player.vy<1.1);
  await fly.keyboard.down('s');a=await ft(15);await fly.keyboard.up('s');assert.equal(a.michiFlight.mode,'descend');assert.ok(a.player.vy>=4.5);
  eclipseFlight.push({input:mobile?'touch hold':'Space hold',from,ascentY,sustainedFrames:100,heroClearOfObjective:true,glide:true,controlledDescent:true,earnedBackup:true});await context.close();
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/v624/moon-hare.json',JSON.stringify({selection,artwork:artwork.bounds,eclipseFlight,chapter:{room:'w1-cat',formsEarned:[...earned].sort(),stations:current.world1.done,deaths,physicalControls:true,directChapterAccessFixture:true,fairyFlight},errors},null,2));
 console.log('PASS Conejornio: actual 1280/390/320 selection, sixteen unclipped action/ability poses and physically earned fourth form');
}finally{await browser.close();await new Promise(r=>server.close(r));}
