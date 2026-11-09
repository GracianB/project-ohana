// Room selection is the only game-state fixture. Inputs remain real keyboard/touch.
// The collision geometry is also audited in isolation: live enemies can knock
// the hero over a terrace without pressing jump, which must not be misdiagnosed
// as walking through a solid wall.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
import {advanceTerrainControls} from './authored-terrain-controls.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);const report=[];
 for(const hero of ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi']){
  const bank=await page.evaluate(hero=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1(hero);e.loadRoom('w1-'+hero);e.step(600);return e.roomTraversal().terraces[0];},hero);await page.locator('#game').focus();
  const before=await page.evaluate(()=>window.__OHANA_E2E.state());
  // Use the production resolveBody collision module against the genuine room
  // platforms, with no foe-induced knockback. This proves the hard bank face
  // blocks a ground-level horizontal crossing for every real hero hitbox.
  const solid=await page.evaluate(async({bank})=>{
   const {resolveBody}=await import('/engine/collide.js');
   const {WORLD1_ROOMS}=await import('/systems/world1-rooms.js');
   const s=window.__OHANA_E2E.state(),p=s.player;
   const platforms=WORLD1_ROOMS[s.roomId].plats.map(([x,y,w,h])=>({x,y,w,h}));
   // Visual terraces may intentionally cover a continuous physical floor.
   // Determine the collision contract from the actual authored platforms.
   const collisionBank=platforms.some(pl=>pl.h>24&&Math.abs(pl.x-bank.x)<1
     &&Math.abs(pl.y-bank.y)<1&&pl.w>=bank.w-1);
   const foot=bank.y+bank.rise;
   const probe={x:bank.x-p.w-2,y:foot-p.h,w:p.w,h:p.h,vx:4,vy:0};
   const oldX=probe.x,oldY=probe.y;
   probe.x+=4;
   const hit=resolveBody(probe,platforms,{prevX:oldX,prevY:oldY});
   return {right:probe.x+probe.w,hitX:hit.hitX,hitY:hit.hitY,collisionBank};
  },{bank});
  // A number of chapters intentionally use decorative raised banks above a
  // continuous physical lane (e.g. Stitcho rolling and Chispín's lightning).
  // Collision expectations must come from real room geometry, not hero names.
  const flatDock=!solid.collisionBank;
  if(flatDock){
   assert.equal(solid.hitX,0,hero+' visually raised lane must have no invented wall');
   assert.ok(solid.right>bank.x,hero+' decorative rise stays traversable');
  }else{
   assert.equal(solid.hitX,-1,hero+' real bank must stop horizontal crossing');
   assert.ok(solid.right<=bank.x+1,hero+' solid bank must not permit tunnelling');
  }
  await page.keyboard.down('d');
  // The authored Frita route contains real oil pits. Using a single blind
  // 360-frame straight walk kills the test pilot before it can observe bank
  // geometry. On decorative-floor chapters press real W only when the shared
  // physical terrain planner sees a ledge/pit; never teleport or grant health.
  if(flatDock)await advanceTerrainControls(page,360);
  else await page.evaluate(()=>window.__OHANA_E2E.step(360));
  const blocked=await page.evaluate(()=>window.__OHANA_E2E.state());
  const snap=p=>({x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx,vy:p.vy,grounded:p.grounded,jumps:p.jumps});
  console.log('V511 BANK OBSERVATION',JSON.stringify({hero,bank,before:{...snap(before.player),hp:before.hp},after:{...snap(blocked.player),hp:blocked.hp},solid,roomId:blocked.roomId,steps:360}));
  if(blocked.player.x+blocked.player.w>bank.x+1){
   await fs.mkdir('test-results/v511',{recursive:true});
   await page.screenshot({path:'test-results/v511/bank-diagnostic-'+hero+'.png'});
  }
  const combatVault=blocked.player.x+blocked.player.w>bank.x+1;
  if(flatDock){
   // Decorative bank height is not a collision face; other authored obstacles
   // may interrupt this 360-frame sample. Test earned physical forward progress
   // here; V600 separately proves full progression through each chapter.
   assert.ok(blocked.player.x>before.player.x+200,hero+' must make real keyboard progress');
  }else if(combatVault){
   // A contact hit launches the live actor upward. Landing *on* the bank
   // is not phasing through it. The independent geometry audit above still
   // requires the actual collision engine to reject walking through the face.
   assert.ok(blocked.hp<before.hp,hero+' crossed without jump or a real damaging hit');
   assert.ok(blocked.player.y+blocked.player.h<=bank.y+2,hero+' must land on top, not inside the bank');
  }else{
   assert.ok(blocked.player.x+blocked.player.w>bank.x-10,hero+' reaches its real face');
  }
  await page.keyboard.down('w');await page.evaluate(()=>window.__OHANA_E2E.step(16));await page.keyboard.up('w');await page.evaluate(()=>window.__OHANA_E2E.step(80));await page.keyboard.up('d');
  const after=await page.evaluate(()=>window.__OHANA_E2E.state());
  if(flatDock)assert.ok(after.player.x>before.player.x+200,hero+' preserves real forward motion through a decorative-bank chapter');
  else assert.ok(after.player.x>bank.x+bank.w,hero+' jumps across its real raised collider');
  assert.ok(after.hp>0);report.push({hero,bank,solid,flatDock,combatVault,blockedX:blocked.player.x,crossedX:after.player.x});
 }
 // One shared touch control is held with actual Chromium touch input.
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),phone=await mobile.newPage();
 await phone.clock.install({time:new Date('2026-10-25T12:00:00Z')});await phone.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));
 await phone.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);const bank=await phone.evaluate(()=>{localStorage.clear();const e=window.__OHANA_E2E;e.startWorld1('stitcho');e.loadRoom('w1-stitcho');e.step(600);return e.roomTraversal().terraces[0];});
 await phone.locator('#game').focus();await phone.keyboard.down('d');await phone.evaluate(()=>window.__OHANA_E2E.step(360));
 const button=await phone.locator('.touch-btn.jump').boundingBox(),cdp=await mobile.newCDPSession(phone);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2}]});await phone.evaluate(()=>window.__OHANA_E2E.step(16));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.evaluate(()=>window.__OHANA_E2E.step(80));await phone.keyboard.up('d');assert.ok((await phone.evaluate(()=>window.__OHANA_E2E.state())).player.x>bank.x+bank.w);
 await mobile.close();assert.deepEqual(errors,[]);await fs.mkdir('test-results/v511',{recursive:true});await fs.writeFile('test-results/v511/terrain-traversal.json',JSON.stringify({rooms:report,mobileHeldJump:true},null,2));console.log('PASS authored solid/decorative collision contracts, ten real keyboard travel probes, raised-bank jumps and touch jump');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
