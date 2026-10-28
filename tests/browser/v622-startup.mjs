// Native entry, a deliberately delayed module, a failed download and manual
// retry. No game hooks, progress grants, position or clock-step mutations.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0),base='http://127.0.0.1:'+server.address().port+'/';
const browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
const report=[];let release;
await fs.mkdir('test-results/v622',{recursive:true});
try{
  const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install();
  const gate=new Promise(r=>release=r);
  await page.route('**/game.js?*',async route=>{await gate;await route.continue();});
  await page.goto(base,{waitUntil:'commit'});
  await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='loading');
  assert.equal(await page.locator('#startup-screen').isVisible(),true);
  assert.equal(await page.locator('#char-select').getAttribute('inert'),'');
  await page.clock.fastForward(16000);
  await page.locator('#startup-screen[data-state="slow"] button').waitFor({state:'visible'});
  assert.match(await page.locator('#startup-screen [role=status]').innerText(),/Puedes esperar/);
  await page.screenshot({path:'test-results/v622/startup-slow.png'});
  release();await page.waitForLoadState('networkidle');
  await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready');
  assert.equal(await page.locator('#startup-screen').count(),0);
  assert.equal(await page.locator('#char-select').getAttribute('inert'),null);
  assert.equal(await page.locator('#chars-grid .char-card canvas').count(),10);
  await page.locator('#ohana-intro.ready .oi-enter').click();
  await page.locator('.char-card[data-id="kilo"]').click();await page.locator('#btn-play').click();
  // The start animation calls the campaign asynchronously. Wait for its
  // first actual story, rather than a transient "playing" class before it.
  await page.locator('#world1-cine-controls').waitFor({state:'visible'});
  for(let i=0;i<28;i++){
    if(!await page.locator('#world1-cine-controls').isVisible()){
      await page.waitForTimeout(500);
      if(!await page.locator('#world1-cine-controls').isVisible())break;
    }
    await page.locator('#world1-cine-next').click();await page.waitForTimeout(180);
  }
  await page.waitForFunction(()=>document.body.classList.contains('playing')&&!document.body.classList.contains('world1-story'));
  await page.locator('#game').focus();await page.keyboard.down('d');
  try{await page.waitForFunction(()=>JSON.parse(localStorage.getItem('ohana-w1-collect-v1')||'{}').rooms?.kilo?.found?.length>0,undefined,{timeout:10000});}
  catch(error){
    await page.screenshot({path:'test-results/v622/native-memory-failure.png'});
    await fs.writeFile('test-results/v622/native-memory-failure.json',JSON.stringify(await page.evaluate(()=>({body:document.body.className,focus:document.activeElement?.id,hud:document.getElementById('hud-meta')?.innerText,overlays:[...document.querySelectorAll('[data-dialog].show,[data-dialog].open,#start-intro.show,#world1-cine-controls:not([hidden])')].map(el=>({id:el.id,text:el.innerText?.slice(0,500)}))})),null,2));throw error;
  }finally{await page.keyboard.up('d');}
  await page.keyboard.press('b');
  await page.locator('#world1-album.open').waitFor({state:'visible'});
  assert.match(await page.locator('.album-purpose').innerText(),/pétalos de canción/);
  const saved=await page.evaluate(()=>Object.fromEntries(['ohana','ohana-w1-collect-v1'].map(k=>[k,localStorage.getItem(k)])));
  assert.ok(saved.ohana);assert.ok(JSON.parse(saved['ohana-w1-collect-v1']).rooms.kilo.found.length>0);
  assert.equal(await page.evaluate(()=>!!window.__OHANA_E2E),false);assert.deepEqual(errors,[]);
  await page.screenshot({path:'test-results/v622/native-earned-memory.png'});
  const storage=await context.storageState();await context.close();
  report.push({scenario:'slow module resolves after visible waiting state',nativeEntry:true,earnedMemory:true,errors});

  const phone=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,storageState:storage,serviceWorkers:'block'});
  const mobile=await phone.newPage(),mobileErrors=[];mobile.on('pageerror',e=>mobileErrors.push(e.message));let attempts=0;
  await mobile.route('**/game.js?*',async route=>{attempts++;if(attempts===1)await route.abort('failed');else await route.continue();});
  await mobile.goto(base,{waitUntil:'domcontentloaded'});
  await mobile.locator('#startup-screen[data-state="error"] button').waitFor({state:'visible'});
  assert.match(await mobile.locator('#startup-screen [role=status]').innerText(),/Tu partida sigue guardada/);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true);
  await mobile.screenshot({path:'test-results/v622/startup-error-mobile.png'});
  await mobile.locator('#startup-screen button').tap();
  await mobile.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready');
  assert.equal(attempts,2,'manual retry performs exactly one new navigation');
  const restored=await mobile.evaluate(()=>Object.fromEntries(['ohana','ohana-w1-collect-v1'].map(k=>[k,localStorage.getItem(k)])));
  assert.deepEqual(restored,saved,'retry preserves the actual earned save and album');
  await mobile.locator('#ohana-intro.ready .oi-enter').tap();
  assert.equal(await mobile.locator('.char-card[data-id="kilo"]').isVisible(),true);
  assert.equal(await mobile.evaluate(()=>!!window.__OHANA_E2E),false);assert.deepEqual(mobileErrors,[]);
  await mobile.screenshot({path:'test-results/v622/startup-recovered-mobile.png'});
  report.push({scenario:'failed game module and manual mobile retry',attempts,earnedSavePreserved:true,errors:mobileErrors});
  await phone.close();
  const quick=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'}),early=await quick.newPage();
  const time=new Date('2026-10-28T12:00:00Z');await early.clock.install({time});await early.clock.pauseAt(new Date(+time+1000));
  await early.goto(base,{waitUntil:'networkidle'});
  assert.equal(await early.evaluate(()=>document.documentElement.dataset.ohanaBoot),'ready');
  assert.equal(await early.locator('#ohana-intro.ready').count(),0,'first animation frame has not run');
  await early.keyboard.press('Enter');
  assert.equal(await early.evaluate(()=>document.body.classList.contains('intro-complete')),true,'one early Enter must reach selection');
  assert.equal(await early.evaluate(()=>document.body.classList.contains('playing')),false,'the same Enter cannot also start a game');
  assert.equal(await early.locator('#chars-grid .char-card').count(),10);
  report.push({scenario:'Enter before the first animation frame',singleInputReachesSelection:true,doesNotStartGame:true});
  await quick.close();await fs.writeFile('test-results/v622/startup.json',JSON.stringify(report,null,2));
  console.log('PASS V622 native slow/failed startup, mobile retry and earned-save preservation');
}finally{release?.();await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
