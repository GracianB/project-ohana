// Native touch targets and multitouch; direct chapter entry is only an access fixture.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:'/usr/bin/chromium'}),reports=[];
try{
 await fs.mkdir('test-results/v655',{recursive:true});
 for(const [width,height] of [[320,568],[320,844],[390,844],[844,390]]){
  const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await p.waitForFunction(()=>window.__OHANA_E2E);await p.evaluate(()=>{const e=window.__OHANA_E2E;e.manualClock();e.startWorld1('cat');e.step(900);});
  const check=async mode=>{
   const targets=await p.evaluate(()=>[...document.querySelectorAll('#touch button')].map(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {name:b.dataset.k||b.id,x:r.x,y:r.y,w:r.width,h:r.height,visible:r.width>0&&r.height>0&&s.visibility!=='hidden'};}).filter(b=>b.visible));
   for(const a of targets){assert.ok(a.w>=44&&a.h>=44,mode+' small target '+a.name);assert.ok(a.x>=-1&&a.y>=-1&&a.x+a.w<=width+1&&a.y+a.h<=height+1,mode+' outside viewport '+JSON.stringify(a));}
   for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){
    const a=targets[i],b=targets[j],overlap=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1;assert.equal(overlap,false,mode+' overlapping '+a.name+' / '+b.name);
   }
   assert.ok(targets.some(b=>b.name==='s'),'descent remains available');return targets;
  };
  await check('closed');await p.screenshot({path:`test-results/v655/touch-${width}x${height}.png`});
  const before=await p.evaluate(()=>window.__OHANA_E2E.state()),right=await p.locator('#touch [data-k=d]').boundingBox(),jump=await p.locator('#touch .jump').boundingBox(),cdp=await ctx.newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:right.x+right.width/2,y:right.y+right.height/2},{id:2,x:jump.x+jump.width/2,y:jump.y+jump.height/2}]});
  await p.evaluate(()=>window.__OHANA_E2E.step(12));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const after=await p.evaluate(()=>window.__OHANA_E2E.state());assert.ok(after.player.x>before.player.x+10,'right thumb and jump together move');assert.ok(after.player.y<before.player.y-20,'simultaneous touch jumps');
  await p.locator('#touch-power-toggle').tap();await check('powers open');await p.locator('#touch [data-k=j]').tap();await p.evaluate(()=>window.__OHANA_E2E.step(12));assert.equal(await p.locator('#touch [data-k=j]').getAttribute('data-power-state'),'cooldown','native power button casts J');
  await p.screenshot({path:`test-results/v655/powers-${width}x${height}.png`});await p.locator('#touch-power-toggle').tap();
  for(let i=0;i<100;i++){const s=await p.evaluate(()=>window.__OHANA_E2E.state()),dx=4030-s.player.x-s.player.w/2;if(Math.abs(dx)<16)break;const key=dx>0?'d':'a';await p.keyboard.down(key);await p.evaluate(()=>window.__OHANA_E2E.step(4));await p.keyboard.up(key);}
  await p.evaluate(()=>window.__OHANA_E2E.step(35));await check('context action');assert.ok(await p.locator('#touch>.interact').isVisible());await p.locator('#touch>.interact').tap();await p.evaluate(()=>window.__OHANA_E2E.step(4));assert.ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('ohana')).secrets['w1-cat'].includes('w1-cat-garden-bench')));await p.screenshot({path:`test-results/v655/context-${width}x${height}.png`});assert.deepEqual(errors,[]);reports.push({width,height,multitouch:true,power:true,targetsClear:true});console.log('PASS separate thumb zones, descent, multitouch and J',width,height);await ctx.close();
 }
 await fs.writeFile('test-results/v655/touch-layout.json',JSON.stringify(reports,null,2));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
