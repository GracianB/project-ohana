import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

const server=await startServer(0);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium'});
const out='test-results/v804';

try{
 await fs.mkdir(out,{recursive:true});
 const mobile=process.env.OHANA_OCEAN_TOUCH==='1';
 const viewport=mobile
  ? {width:Number(process.env.OHANA_VIEW_WIDTH)||390,height:Number(process.env.OHANA_VIEW_HEIGHT)||844}
  : {width:1280,height:860};
 const captureSuffix=mobile?'-'+viewport.width+'x'+viewport.height:'';
 const ctx=await browser.newContext({viewport,hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'});
 const page=await ctx.newPage();
 const cdp=mobile?await ctx.newCDPSession(page):null;
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);
 await page.waitForFunction(()=>window.__OHANA_E2E);
 await page.evaluate(()=>{
  const game=window.__OHANA_E2E;
  game.manualClock();
  game.startWorld1('nacar');
  for(let i=0;i<10&&game.state().world1Cine;i++)game.step(600);
 });
 await page.locator('#game').focus();
 const state=()=>page.evaluate(()=>window.__OHANA_E2E.state());
 const step=n=>page.evaluate(n=>window.__OHANA_E2E.step(n),n);
 const touch={};
 if(mobile)for(const k of ['a','d','s',' ']){
  const box=await page.locator('#touch [data-k='+JSON.stringify(k)+']').boundingBox();
  assert.ok(box,'visible swim control '+k);
  touch[k]={x:box.x+box.width/2,y:box.y+box.height/2};
 }
 const keys=async(names,ticks)=>{
  if(mobile){
   if(names[0]==='e'){
    await page.locator('#touch>.interact').tap();
    return await step(ticks);
   }
   if(!names.length)return await step(ticks);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:names.map((k,i)=>({...touch[k],id:i+1}))});
   try{return await step(ticks);}
   finally{await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  }
  for(const k of names)await page.keyboard.down(k);
  try{return await step(ticks);}
  finally{for(const k of names)await page.keyboard.up(k);}
 };
 const receipts=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ohana')||'{}').secrets?.['w1-nacar']||[]);
 const place=async(x,y)=>page.evaluate(({x,y})=>{
  const e=window.__OHANA_E2E,p=e.state().player;
  e.setPlayer(x-p.w/2,y-p.h/2);
 },{x,y});
 async function swim(x,y,{tolerance=20,limit=160}={}){
  for(let i=0;i<limit;i++){
   const {player:p,hp}=await state();
   assert.ok(hp>0,'Nácar died on the course');
   const dx=x-p.x-p.w/2,dy=y-p.y-p.h/2;
   if(Math.hypot(dx,dy)<tolerance)return;
   const held=[];
   if(Math.abs(dx)>12)held.push(dx>0?'d':'a');
   if(Math.abs(dy)>12)held.push(dy>0?'s':' ');
   await keys(held,Math.hypot(dx,dy)<48?2:7);
  }
  throw Error('Could not swim to '+JSON.stringify([x,y,(await state()).player]));
 }
 const routes=await page.evaluate(async()=>(await import('/systems/nacar-room.js')).buildNacarRoom().swimRoutes);
 async function runRoute(route,fixture){
  if(fixture)await place(route.x,route.y);
  else await swim(route.x,route.y);
  await keys(['e'],1);
  for(const [index,[x,y]] of route.rings.entries()){
   await swim(x,y,{tolerance:24});
   console.log(route.id,index+1);
   if(index===1)await page.screenshot({path:out+'/'+route.id+'-swim'+captureSuffix+'.png'});
  }
  assert.ok((await receipts()).includes('w1-nacar-discovery-course-'+route.id));
 }
 await runRoute(routes[0],false);
 // Isolate the deep course from the main campaign journey: set the earned second evolution and arrange the real valve.
 await page.evaluate(()=>window.__OHANA_E2E.setEvo(2));
 await place(6200,1180);await keys(['e'],1);
 await runRoute(routes[1],true);
 await swim(7780,515);await keys(['e'],1);
 assert.ok((await receipts()).includes('w1-nacar-discovery-route-tide'));
 await swim(8120,460);await keys(['e'],1);
 assert.ok((await state()).player.x>9300);
 await swim(9720,420);await keys(['e'],1);
 await swim(10030,585);await keys(['e'],1);
 assert.ok((await receipts()).includes('w1-nacar-discovery-vault-light'));
 assert.equal((await state()).world1.done,0);
 await page.screenshot({path:out+'/grotto'+captureSuffix+'.png'});
 // Go below the shelf rather than over it on the return.
 await swim(9670,600);await swim(9300,530);await keys(['e'],1);
 assert.ok((await state()).player.x<8400);
 assert.deepEqual(errors,[]);
 console.log('PASS native controls: both swim courses, chart discovery, grotto light and return');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
