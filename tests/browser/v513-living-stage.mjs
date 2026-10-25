// Inspect and operate the real menu at desktop and phone sizes. The anatomical
// contact sheet uses render fixtures; no fixture is counted as campaign progress.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await fs.mkdir('test-results/v600',{recursive:true});
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.keyboard.press('Escape');
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  await page.setViewportSize(viewport);await page.waitForTimeout(150);
  const canvas=page.locator('#camp-canvas'),box=await canvas.boundingBox();assert.ok(box);
  const nodes=await page.evaluate(async()=>{
   const {createWorld1Select,drawWorld1Select}=await import('/systems/world1-select.js');
   const real=document.querySelector('#camp-canvas'),c=document.createElement('canvas'),sel=createWorld1Select();
   drawWorld1Select(c.getContext('2d'),real.clientWidth,real.clientHeight,0,sel);
   return sel.rects.map((r,i)=>({...r,hero:sel.cards[i].hero}));
  });
  for(const i of [1,2,3,4,5,6,7,8,9,0]){
   const r=nodes[i];assert.ok(r.x>=0&&r.x+r.w<=box.width&&r.y>=0&&r.y+r.h<=box.height);
   await canvas.click({position:{x:r.x+r.w/2,y:r.y+r.h/2}});
   assert.equal(await page.locator('#family-camp').getAttribute('data-hero'),r.hero,'pointer chooses actual actor');
  }
  await canvas.focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#family-camp').getAttribute('data-hero'),'stitcho');
  await page.locator('[data-camp-form="4"]').click();
  await page.screenshot({path:`test-results/v600/selection-${viewport.width}.png`,fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 const png=await page.evaluate(async()=>{
  const {ROSTER}=await import('/characters/roster.js'),{drawCharacter}=await import('/characters/draw.js');
  const c=document.createElement('canvas');c.width=1200;c.height=2400;const ctx=c.getContext('2d');
  const states=['run','jump','fall','hurt'];
  ROSTER.forEach((r,row)=>states.forEach((state,col)=>{
   const x=col*300,y=row*240,f=r.forms[4];ctx.fillStyle=row%2?'#283e54':'#1a2e45';ctx.fillRect(x,y,300,240);
   ctx.fillStyle='#ffe6b1';ctx.font='16px sans-serif';ctx.fillText(r.name+' · '+state,x+12,y+22);
   const p={...r,...f,id:r.id,evo:4,x:x+145-f.w/2,y:y+215-f.h,w:f.w,h:f.h,facing:1,vx:state==='run'?f.speed:0,vy:state==='jump'?-6:state==='fall'?7:0,grounded:state==='run'||state==='hurt',invuln:state==='hurt'?35:0,melee:0,_poseOverride:state,_introForceCanvas:true};
   drawCharacter(ctx,p,{x:0,y:0},40);
  }));return c.toDataURL().split(',')[1];
 });
 await fs.writeFile('test-results/v600/anatomical-states.png',Buffer.from(png,'base64'));
 assert.deepEqual(errors,[]);console.log('PASS: actual ten-actor pointer choices, keyboard navigation, form previews and no overflow on desktop/mobile; forty anatomical state renders');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
