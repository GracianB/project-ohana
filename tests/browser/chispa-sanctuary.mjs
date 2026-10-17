import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base+'/?e2e=1',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{await (await import('/characters/art/chispa-sprite.js')).preloadChispaAtlas();window.__OHANA_WELCOME_SET_FRAME(1.72);});
 await page.waitForTimeout(100);assert.equal(await page.locator('#ohana-intro').getAttribute('data-chispin-welcome-phase'),'charge');
 await fs.mkdir('test-results/chispa-sanctuary',{recursive:true});
 await page.screenshot({path:'test-results/chispa-sanctuary/welcome.png'});
 await page.locator('.oi-enter').click();
 const audit=await page.evaluate(async()=>{
  const {drawCharacter}=await import('/characters/draw.js'),{ROSTER}=await import('/characters/roster.js');
  const {drawFamilyDuet}=await import('/systems/family-duets.js');
  const {drawStitchoDuet}=await import('/systems/stitcho-duet.js');
  const {drawChispaAssist,drawChispaCeremony}=await import('/systems/chispa-stagecraft.js');
  const {drawChispaStorm,drawChispaChain,drawChispaTrail}=await import('/systems/chispa-effects.js');
  const board=document.createElement('canvas');board.id='thunder-board';board.width=1280;board.height=760;board.style.cssText='position:fixed;inset:0;z-index:99999;background:#102f3c;width:100%;height:auto';document.body.append(board);
  const ctx=board.getContext('2d');ctx.fillStyle='#102f3c';ctx.fillRect(0,0,1280,760);
  ctx.fillStyle='#fff5d5';ctx.font='600 26px Fredoka';ctx.fillText('CHISPA · EL SILENCIO ANTES DEL TRUENO',30,42);
  const def=ROSTER.find(r=>r.id==='chispin');
  for(let evo=0;evo<5;evo++){
   const f=def.forms[evo],x=128+evo*256,p={...f,id:'chispin',evo,x:x-f.w/2,y:230-f.h,grounded:true,vx:0,vy:0,facing:1,invuln:0,_poseOverride:'cast',_cast:{slot:2,t:50}};
   drawChispaCeremony(ctx,x,230,105,1,false,'ending');drawCharacter(ctx,p,{x:0,y:0},63);
   ctx.textAlign='center';ctx.fillStyle='#fff5d5';ctx.font='600 17px Fredoka';ctx.fillText(f.name,x,270);
   ctx.font='500 12px Outfit';ctx.fillStyle='#b7dfdd';ctx.fillText(`${f.hp} vida · ${f.speed} velocidad`,x,294);
  }
  ctx.textAlign='left';ctx.fillStyle='#fff5d5';ctx.font='600 19px Fredoka';ctx.fillText('U · ENTRADA, RITUAL Y JUICIO',28,350);
  for(let i=0;i<3;i++){
   ctx.save();ctx.translate(i*420,0);
   const s={hero:'dino',ally:'chispin',x:165,y:690,originX:165,originY:690,age:[26,42,90][i],evo:4,facing:1,surprise:true};
   drawFamilyDuet(ctx,s,{x:0,y:0},s.age*2,drawCharacter,ROSTER,false);ctx.restore();
  }
  const probe=document.createElement('canvas');probe.width=1000;probe.height=700;const pc=probe.getContext('2d');let scenes=0;
  for(const hero of ROSTER.filter(r=>r.id!=='chispin'))for(let evo=0;evo<5;evo++)for(const age of [5,26,42,66,90,160,320]){
   pc.clearRect(0,0,1000,700);const s={hero:hero.id,ally:'chispin',x:400,y:500,originX:400,originY:500,age,evo,facing:1,surprise:true};
   const before=JSON.stringify(s);drawFamilyDuet(pc,s,{x:0,y:0},age,drawCharacter,ROSTER,false);
   if(JSON.stringify(s)!==before)throw Error('visual mutated U state');scenes++;
  }
  for(let evo=0;evo<5;evo++)for(const age of [26,42,66,90,160,320]){
   const s={x:400,y:500,originX:400,originY:500,age,evo,facing:1,surprise:true,bolts:age===66?[{x:510,y:460,life:10}]:[],impacts:[]};
   drawStitchoDuet(pc,s,{x:0,y:0},age,drawCharacter,ROSTER,true);scenes++;
  }
  const s={x:200,y:400,age:66,evo:4,facing:1};const before=JSON.stringify(s);drawChispaAssist(pc,s,{x:0,y:0},60,true);if(JSON.stringify(s)!==before)throw Error('stage mutation');
  drawChispaStorm(pc,{x:300,y:160,life:220,maxLife:260,next:3,forecast:{x:340,y1:180,y2:500},bolts:[{x:340,y1:180,y2:500,life:8}]},{x:0,y:0},60,true);
  drawChispaChain(pc,{life:20,pts:[{x:100,y:200},{x:300,y:400}]},{x:0,y:0},60,true);
  drawChispaTrail(pc,{life:30,x1:100,y1:400,x2:350,y2:400},{x:0,y:0},60,true);
  return scenes;
 });assert.equal(audit,345);
 await page.locator('#thunder-board').screenshot({path:'test-results/chispa-sanctuary/kit-and-companion.png'});
 await page.evaluate(()=>document.querySelector('#thunder-board').remove());
 await page.evaluate(async()=>{const {playIntro}=await import('/systems/intro.js');playIntro('start','Chispa',()=>{},'chispin');});
 await page.waitForTimeout(650);await page.screenshot({path:'test-results/chispa-sanctuary/personal-intro.png'});await page.waitForTimeout(1500);
 await page.evaluate(async()=>{const {showEnding}=await import('/systems/ending.js');showEnding({id:'chispin',evo:4,uPartner:'cuerno',hero:'Chispa',form:'Chispa Raijin'});});
 await page.waitForTimeout(900);await page.screenshot({path:'test-results/chispa-sanctuary/final-duo.png'});
 await page.locator('.win-skip').click();await page.waitForTimeout(120);
 assert.equal(await page.locator('#win-cinema').getAttribute('data-ending-hero'),'chispin');
 await page.screenshot({path:'test-results/chispa-sanctuary/finale.png'});
 await page.locator('#win-continue').click();await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{const a=window.__OHANA_E2E;a.start('stitcho');a.setEvo(4);a.setUSurprise(false);a.cast(3);a.step(66);});
 await page.screenshot({path:'test-results/chispa-sanctuary/mobile-U.png'});
 assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().runtimeFaults),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS Chispa sanctuary: 345 assist scenes, intro/welcome/finale, real canonical U, mobile and immutable visual stages');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
