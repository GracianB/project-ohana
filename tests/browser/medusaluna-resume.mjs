// Browser regression: selection, new-game evolution, saved chapter recovery.
// Use actual title buttons, real localStorage checkpoints and normal game boot.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
const base='http://127.0.0.1:'+server.address().port+'/?e2e=1';
try{
  const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready');
  await page.evaluate(()=>{
    // The camp reads earned seals at mount, so seed progress before its next boot.
    localStorage.setItem('ohana-w1-seals-v1',JSON.stringify(['kilo','stitcho','chispin','cat']));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready');
  await page.keyboard.press('Escape');
  await page.locator('.char-card[data-id="cat"]').click();
  await page.waitForFunction(()=>document.querySelector('#family-camp')?.dataset.hero==='cat');
  assert.equal(await page.locator('#family-camp [data-camp-form]').count(),5);
  assert.equal(await page.locator('#camp-name').textContent(),'Medusaluna');
  const picker=page.locator('#family-camp .camp-forms');
  assert.equal(await picker.isVisible(),true);
  await page.locator('#family-camp [data-camp-form="0"]').click();
  assert.equal(await page.locator('#camp-form-name').textContent(),'Huevo de Nácar');
  assert.equal(await page.locator('#family-camp').getAttribute('data-form'),'0');
  await page.locator('#camp-start').click();
  await page.waitForFunction(()=>window.__OHANA_E2E?.state().running===true);
  const baby=await page.evaluate(()=>window.__OHANA_E2E.state());
  assert.equal(baby.hero,'cat');assert.equal(baby.evo,0,'the saved seal must not force form 5 on a new run');

  // Reuse a legitimate game-created snapshot and only change the checkpointed
  // evolution. Continue should read this save, not clobber it inside loadRoom.
  // The live game writes a fresh checkpoint during pagehide. Reload FIRST,
  // then stage the historical snapshot from the menu, while no game is running.
  // Otherwise pagehide overwrites our form-2 fixture with the active form 0.
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready');
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{
    const save=JSON.parse(localStorage.getItem('ohana'));
    if(!save)throw new Error('The game did not create its checkpoint');
    Object.assign(save,{id:'cat',roomId:'w1-cat',evo:2,xp:160});
    localStorage.setItem('ohana',JSON.stringify(save));
    localStorage.removeItem('ohana.tmp');
  });
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('ohana')).evo),2,
    'The resume fixture must exist after pagehide, not before it');
  await page.locator('#btn-continue').click();
  await page.waitForFunction(()=>window.__OHANA_E2E?.state().running===true);
  const restored=await page.evaluate(()=>window.__OHANA_E2E.state());
  assert.equal(restored.hero,'cat');
  assert.equal(restored.roomId,'w1-cat');
  assert.equal(restored.evo,2,'Continue must preserve the saved jellyfish instead of forcing form 5');
  assert.equal(restored.xp,160);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ohana')));
  assert.equal(saved.evo,2);assert.equal(saved.roomId,'w1-cat');
  assert.equal(await page.evaluate(()=>document.body.classList.contains('playing')),true);
  assert.deepEqual(errors,[],'no uncaught browser errors');
  console.log('PASS Medusaluna: fresh form zero and previously sealed, save/Continue preserves form 2');
  await context.close();
}finally{
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
