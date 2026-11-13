import assert from 'node:assert/strict';import fs from 'node:fs/promises';import{chromium}from'playwright';import{startServer}from'./server.mjs';
const s=await startServer(0),b=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});try{await fs.mkdir('test-results/v639',{recursive:true});const reports=[];
for(const[width,height]of[[1280,900],[390,844],[320,700]]){
 const c=await b.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${s.address().port}/?e2e=1`);await p.locator('.oi-enter').click();
 await p.evaluate(()=>{const e=window.__OHANA_E2E;e.startWorld1('kilo');e.manualClock(true);});
 for(let i=0;i<12;i++){await p.keyboard.press('Enter');await p.evaluate(()=>window.__OHANA_E2E.step(100));const state=await p.evaluate(()=>window.__OHANA_E2E.state());if(!state.world1Cine&&!state.pendingWorld1Cine)break;}
 await p.locator('#game').focus();await p.evaluate(()=>window.__OHANA_E2E.step(15));
 assert.equal(await p.locator('#controls-hint').isVisible(),false);assert.equal(await p.locator('#play-options').isVisible(),true);
 if(width<500){await p.locator('#touch-power-toggle').click();assert.equal(await p.locator('#touch .act-row.powers').isVisible(),true);await p.locator('#touch [data-k="j"]').click();await p.locator('#touch-power-toggle').click();assert.equal(await p.locator('#touch .act-row.powers').isVisible(),false);}
 else{assert.equal(await p.locator('.ability-slot .skill-icon svg').count(),6);await p.locator('.ability-slot[data-id="ukulele"]').click();}
 await p.keyboard.down('d');await p.keyboard.down('w');await p.evaluate(()=>window.__OHANA_E2E.step(16));await p.keyboard.up('d');await p.keyboard.up('w');
 const chip=await p.locator('#combo-chip').evaluate(n=>{n.classList.add('show');n.classList.remove('hidden');const r=n.getBoundingClientRect();n.classList.remove('show');n.classList.add('hidden');return {w:r.width,h:r.height};});assert.ok(chip.h<65,'combo feedback must never stretch between inherited top and bottom anchors');
 assert.equal((await p.evaluate(()=>window.__OHANA_E2E.state())).runtimeFaults,0);await p.screenshot({path:`test-results/v639/hud-${width}.png`});
 await p.locator('#play-options summary').click();await p.locator('[data-play-action="btn-help"]').click();assert.equal(await p.locator('#help').isVisible(),true);await p.locator('#btn-close-help').click();assert.equal(await p.evaluate(()=>document.activeElement?.closest('#play-options')?.id),'play-options');await p.locator('#play-options summary').click();await p.locator('[data-play-action="btn-festival"]').click();await p.locator('#world1-album.open').waitFor({state:'visible'});await p.locator('#world1-album-close').click();
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);reports.push({width,errors});await c.close();
}await fs.writeFile('test-results/v639/hud-validation.json',JSON.stringify(reports,null,2));console.log('PASS compact HUD: icon actions, touch drawer, native movement, accessible guide and three viewports');
}finally{await b.close();s.closeAllConnections();await new Promise(r=>s.close(r));}
