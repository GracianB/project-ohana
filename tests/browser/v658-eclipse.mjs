// Native device interaction and real jump; arena access/placement is a fixture.
import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';import{selectFinalFighter}from'./final-ritual-controls.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'}),dir='test-results/v658',base=`http://127.0.0.1:${server.address().port}`;
try{
 await fs.mkdir(dir,{recursive:true});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/gallery.html');
 const art=await page.evaluate(async()=>{
  const{drawQuimeraSanctum}=await import('/systems/quimera-regalia.js'),{ECLIPSE_ECHOES}=await import('/systems/quimera-eclipse.js');const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=750;const c=canvas.getContext('2d'),boss={hp:2800,_fusion:{mode:'warn',attack:'rayos',clock:20,warnMax:78}},player={x:200,y:550,w:32,h:48};
  const render=(time,reduce,x)=>{c.clearRect(0,0,1000,750);drawQuimeraSanctum(c,{x:500,y:300,phase:4,time,reduce,width:1000,height:750,player:{...player,x},cam:{x:0,y:0},boss,arena:{awakened:['west']}});return canvas.toDataURL();};
  const samples=[];for(let i=0;i<16;i++){const t=performance.now();drawQuimeraSanctum(c,{x:500,y:300,phase:4,time:i*13,reduce:false,width:1000,height:750,player,cam:{x:0,y:0},boss});if(i>3)samples.push(performance.now()-t);}const medianMs=samples.sort((a,b)=>a-b)[Math.floor(samples.length/2)];
  const source=JSON.stringify({boss,player}),a=render(40,true,100),b=render(900,true,100),d=render(40,true,800),animated=render(140,false,100);return{medianMs,reduced:a===b,tracks:a!==d,animates:a!==animated,echoes:ECLIPSE_ECHOES.length,pure:source===JSON.stringify({boss,player}),image:animated.split(',')[1]};
 });
 assert.ok(art.reduced&&art.tracks&&art.animates&&art.pure);assert.ok(art.medianMs<40);assert.equal(art.echoes,50);await fs.writeFile(`${dir}/living-eclipse.png`,Buffer.from(art.image,'base64'));delete art.image;
 const native=[];
 for(const[width,height]of[[1280,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/?e2e=1');await p.locator('.oi-enter').click();
  await p.evaluate(async()=>{localStorage.clear();const{WORLD1_ORDER}=await import('/systems/world1-rooms.js');localStorage.setItem('ohana-w1-seals-v1',JSON.stringify(WORLD1_ORDER));localStorage.setItem('ohana-keepsakes-v1',JSON.stringify(WORLD1_ORDER));const e=window.__OHANA_E2E;e.startWorld1('kilo');e.manualClock(true);e.loadRoom('w1-final');e.setPlayer(7300,1000);e.step(5);});
  for(let i=0;i<25;i++){await selectFinalFighter(p,'kilo');await p.keyboard.press('Enter');const s=await p.evaluate(()=>{const e=window.__OHANA_E2E;e.setInvulnerable(600);return e.step(100);});if(s.boss&&!s.world1Cine&&!s.pendingWorld1Cine)break;}
  await p.evaluate(()=>{const e=window.__OHANA_E2E;e.setInvulnerable(600);e.step(300);const s=e.state();e.setPlayer(7650-s.player.w/2,1134-s.player.h);e.step(6);});
  assert.match(await p.locator('#prompt').textContent(),/E · activar Prisma/);
  if(width<500)await p.locator('#touch > .interact').tap();else await p.keyboard.press('e');
  const used=await p.evaluate(()=>{window.__OHANA_E2E.step(3);return window.__OHANA_E2E.quimeraArenaState();});assert.equal(used.platforms.length,3);assert.ok(used.shield>0);assert.ok(used.secrets.includes('w1-final-eclipse-west'));
  await p.evaluate(()=>window.__OHANA_E2E.step(35));await p.screenshot({path:`${dir}/prism-${width}.png`});
  const first=used.platforms.find(q=>q.quimeraStep==='west-0');await p.evaluate(first=>{const e=window.__OHANA_E2E,s=e.state();e.setPlayer(first.x+first.w/2-s.player.w/2,1134-s.player.h);e.step(4);},first);
  await p.keyboard.down('w');await p.evaluate(()=>window.__OHANA_E2E.step(1));await p.keyboard.up('w');
  const landed=await p.evaluate(()=>window.__OHANA_E2E.step(70));assert.ok(Math.abs(landed.player.y+landed.player.h-first.y)<3,'native jump lands on the unlocked physical step: '+JSON.stringify(landed.player));assert.equal(landed.runtimeFaults,0);
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('ohana')).secrets['w1-final']);assert.ok(saved.includes('w1-final-eclipse-west'));native.push({width,steps:used.platforms.length,landedY:landed.player.y+landed.player.h,shield:used.shield});await p.screenshot({path:`${dir}/step-${width}.png`});await context.close();
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/validation.json`,JSON.stringify({art,native,errors,scope:'Synthetic final access and starting position; native E/Use and physical jump, no campaign victory claim'},null,2));console.log('PASS V658: fifty living echoes, player tracking, reduced motion, immutable background, native E/touch prism, saved route and real platform landing at desktop/mobile');
}finally{await browser.close();server.closeAllConnections();server.close();}
