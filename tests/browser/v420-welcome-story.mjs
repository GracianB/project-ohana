import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';import {startServer} from './server.mjs';import {WELCOME_STORIES,dialogueSeconds,WELCOME_STORY_DURATION} from '../../systems/welcome-story.js';
const s=await startServer(0);let b;
try{b=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||undefined});const p=await b.newPage({viewport:{width:1360,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${s.address().port}/?e2e=1`,{waitUntil:'domcontentloaded'});await p.locator('.oi-story-line').waitFor();
const first=await p.locator('.oi-story-line').textContent();await p.waitForTimeout(2900);assert.equal(await p.locator('.oi-story-line').textContent(),first);
await p.locator('.oi-pause').click();await p.waitForTimeout(100);const time=await p.locator('#ohana-intro').getAttribute('data-story-time');await p.waitForTimeout(350);assert.equal(await p.locator('#ohana-intro').getAttribute('data-story-time'),time);
assert.equal(await p.locator('.oi-previous,.oi-next').count(),0,'the family interacts without a sentence picker');
await fs.mkdir('test-results/visual',{recursive:true});
for(const scene of WELCOME_STORIES){let at=scene.start;
 for(const line of scene.lines){await p.evaluate(t=>window.__OHANA_WELCOME_SET_STORY_TIME(t),at+.05);await p.waitForTimeout(90);assert.equal(await p.locator('.oi-story-line').textContent(),line.text);at+=dialogueSeconds(line.text);}
}
await p.evaluate(t=>window.__OHANA_WELCOME_SET_STORY_TIME(t),WELCOME_STORY_DURATION+.1);await p.waitForTimeout(100);assert.equal(await p.locator('.oi-story-line').textContent(),WELCOME_STORIES[0].lines[0].text,'automatic encore');
await p.screenshot({path:'test-results/visual/v420-intro-desktop.png',timeout:20000});await p.setViewportSize({width:390,height:844});await p.screenshot({path:'test-results/visual/v420-intro-mobile.png',timeout:20000});
const controls=await p.locator('.oi-story-controls').boundingBox(),entry=await p.locator('.oi-enter').boundingBox();assert.ok(controls.y+controls.height<=entry.y,'mobile controls overlap entry');
await p.locator('.oi-enter').click();await p.locator('#family-camp').waitFor();assert.equal(await p.locator('#ohana-intro').count(),0);assert.equal(await p.evaluate(()=>typeof window.__OHANA_WELCOME_SET_STORY_TIME),'undefined');await p.locator('#btn-replay-welcome').click();await p.locator('.oi-pause').waitFor();assert.equal(await p.locator('#ohana-intro').count(),1);await p.locator('.oi-pause').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.oi-pause').getAttribute('aria-pressed'),'true');
await p.keyboard.press('Escape');assert.equal(await p.locator('#ohana-intro').count(),0);assert.deepEqual(errors,[]);console.log('PASS welcome: readable duration, real pause, 33 lines, 10 protagonists, enemy coda, automatic encore, mobile controls, replay, keyboard and cleanup');
}finally{await b?.close();s.closeAllConnections();await new Promise(r=>s.close(r));}
