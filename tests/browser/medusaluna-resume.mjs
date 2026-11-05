// Browser regression: selection, new-game evolution, saved chapter recovery.
// Use actual title buttons, real localStorage checkpoints and normal game boot.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
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

  // Gallery integration: the visible selector must show five genuinely different
  // rendered creatures, not the previous row of five indistinguishable numbers.
  await page.waitForFunction(()=>{
    const canvases=[...document.querySelectorAll('#family-camp [data-camp-form] canvas')];
    return canvases.length===5&&canvases.every(cv=>{
      const pixels=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
      for(let j=3;j<pixels.length;j+=4)if(pixels[j]>25)return true;
      return false;
    });
  });
  await fs.mkdir('test-results/medusaluna',{recursive:true});
  await page.locator('#family-camp .camp-dossier').screenshot({path:'test-results/medusaluna/sea-forms-desktop.png'});
  const artwork=await page.evaluate(()=>[...document.querySelectorAll('#family-camp [data-camp-form] canvas')].map(cv=>cv.toDataURL()));
  assert.equal(new Set(artwork).size,5,'each evolution needs its own real Canvas silhouette');
  for(const {width,height} of [{width:390,height:844},{width:320,height:568}]){
    await page.setViewportSize({width,height});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,
      'Medusaluna gallery must not overflow mobile viewport '+width);
    assert.equal(await page.locator('#family-camp .camp-forms [data-camp-form]').count(),5);
    await page.locator('#family-camp .camp-dossier').screenshot({path:'test-results/medusaluna/sea-forms-'+width+'.png'});
  }
  await page.setViewportSize({width:1280,height:900});

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

  // The user-facing camp Continue path (not an E2E boot shortcut) must expose
  // previously earned forms and resume at the very same real chapter/XP.
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready');
  await page.keyboard.press('Escape');
  await page.locator('.char-card[data-id="cat"]').click();
  await page.waitForFunction(()=>document.querySelector('#family-camp')?.dataset.hero==='cat');
  assert.equal(await page.locator('#camp-resume').isVisible(),true);
  assert.equal(await page.locator('[data-camp-form="2"]').getAttribute('data-resume-owned'),'true');
  assert.equal(await page.locator('[data-camp-form="3"]').getAttribute('data-resume-owned'),'false');
  await page.locator('#family-camp [data-camp-form="1"]').click();
  assert.match(await page.locator('#camp-resume').textContent(),/Caballito de Sueños/);
  await page.locator('#camp-resume').click();
  await page.waitForFunction(()=>window.__OHANA_E2E?.state().running===true);
  const equipped=await page.evaluate(()=>window.__OHANA_E2E.state());
  assert.equal(equipped.hero,'cat');assert.equal(equipped.roomId,'w1-cat');
  assert.equal(equipped.evo,1,'chosen owned form must be equipped when continuing');
  assert.equal(equipped.xp,160,'changing equipped form cannot erase earned XP');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('ohana')).maxEvo),2);
  assert.equal(await page.locator('#marine-form-toggle').isVisible(),true);
  await page.locator('#marine-form-toggle').click();
  await page.locator('#marine-form-choices [data-owned-form="2"]').click();
  const reEquipped=await page.evaluate(()=>window.__OHANA_E2E.state());
  assert.equal(reEquipped.evo,2,'in-game switch restores the already owned Medusa Onírica');
  assert.equal(reEquipped.xp,160);
  assert.equal(reEquipped.roomId,'w1-cat');
  assert.equal(await page.locator('#marine-form-choices [data-owned-form="3"]').isDisabled(),true);

  assert.deepEqual(errors,[],'no uncaught browser errors');
  console.log('PASS V637 Medusaluna: continue, owned form choice, in-game swap and XP persistence');
  await context.close();
}finally{
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
