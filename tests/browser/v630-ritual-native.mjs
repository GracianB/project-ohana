// Native menu, movement and touch/keyboard controls, with no test hooks.
// Earned seals are restored from the real campaign backup. Previous final
// rescues are removed in this isolated replay fixture; no progress is granted.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const external=process.env.OHANA_TEST_BASE_URL,server=external?null:await startServer(0),base=external?new URL(external.endsWith('/')?external:external+'/').href:`http://127.0.0.1:${server.address().port}/`;
const dir='test-results/v630',prefix=external?'public-':'';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir(dir,{recursive:true});const rows=[];
 const saved=JSON.parse(await fs.readFile('test-results/v600/earned-campaign-storage.json','utf8'));
 for(const origin of saved.origins){origin.origin=new URL(base).origin;origin.localStorage=origin.localStorage.filter(item=>!['ohana-keepsakes-v1','ohana-final-resonances-v1','ohana-resume'].includes(item.name));for(const item of origin.localStorage)if(['ohana','ohana.tmp'].includes(item.name)){const profile=JSON.parse(item.value);profile.keepsakes=[];profile.world1Won=false;if(profile.secrets)delete profile.secrets['w1-final'];item.value=JSON.stringify(profile);}}
 for(const [width,height]of[[1280,900],[390,844]]){
  const touch=width<500,context=await browser.newContext({viewport:{width,height},storageState:saved,hasTouch:touch,isMobile:touch,...(external?{ignoreHTTPSErrors:true}:{})});
  const page=await context.newPage(),errors=[],backend=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/netlify\.app/.test(request.url()))backend.push(request.url());});
  const activate=async locator=>touch?locator.tap():locator.click();
  await page.goto(base+'?verifyRitual630='+Date.now(),{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready',undefined,{timeout:120000});
  assert.equal(await page.evaluate(()=>!!window.__OHANA_E2E),false);
  await activate(page.locator('#ohana-intro.ready .oi-enter'));
  await activate(page.locator('.char-card[data-id="yomi"]'));await page.locator('#camp-canvas').focus();await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('#family-camp').dataset.final==='true'&&document.querySelector('#camp-canvas').dataset.paintedHero==='final');
  await activate(page.locator('#camp-guide'));await page.locator('#help.open').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('#guide-page h4')?.textContent==='Tus objetos despiertan al guardián');
  assert.equal(await page.locator('[data-guide="heart"]').getAttribute('aria-pressed'),'true');await activate(page.locator('#btn-close-help'));
  await page.waitForFunction(()=>document.querySelector('#family-camp').dataset.final==='true'&&document.querySelector('#camp-canvas').dataset.paintedHero==='final'&&document.activeElement?.id==='camp-guide');
  await activate(page.locator('#camp-start'));
  await page.waitForFunction(()=>document.body.classList.contains('playing'),undefined,{timeout:30000});
  if(await page.locator('#start-intro.show').count())await page.keyboard.press('Enter');
  await page.waitForFunction(()=>!document.querySelector('#start-intro.show'),undefined,{timeout:30000});
  for(let shot=0;shot<35;shot++){
   if(!await page.locator('#world1-cine-controls').isVisible()){await page.waitForTimeout(400);if(!await page.locator('#world1-cine-controls').isVisible())break;}
   await activate(page.locator('#world1-cine-next'));await page.waitForTimeout(150);
  }
  await page.waitForFunction(()=>!document.body.classList.contains('world1-story'));
  assert.equal(await page.locator('#hud').getAttribute('data-hero'),'yomi','the final room cannot silently replace the selected hero');
  await page.locator('#game').focus();await page.keyboard.down('d');
  try{await page.locator('#final-hero-choice').waitFor({state:'visible',timeout:15000});}catch(error){
   console.log('NATIVE_RITUAL_FAILURE',JSON.stringify(await page.evaluate(()=>({classes:document.body.className,profile:JSON.parse(localStorage.getItem('ohana')||'null'),resonances:localStorage.getItem('ohana-final-resonances-v1'),objective:document.querySelector('#notification-container')?.textContent,open:[...document.querySelectorAll('#help.open,#map-overlay.open,#pause-overlay.open,#start-intro.show')].map(e=>e.id)}))));
   await page.screenshot({path:`${dir}/${prefix}native-ritual-failure-${width}.png`});throw error;
  }finally{await page.keyboard.up('d');}
  assert.equal(await page.locator('.fr-hero').count(),10);
  const resonances=await page.evaluate(()=>JSON.parse(localStorage.getItem('ohana-final-resonances-v1')||'{}').kilo);
  assert.deepEqual(resonances,[0,1,2]);
  await activate(page.locator('.fr-choice-back'));
  if(touch)await page.locator('.touch-btn.interact').tap();else{await page.locator('#game').focus();await page.keyboard.press('e');}
  await page.locator('#final-hero-choice').waitFor({state:'visible'});
  await page.waitForTimeout(180);assert.equal(await page.locator('#final-hero-choice').count(),1,'the opening gesture cannot accept a fighter');
  await activate(page.locator('.fr-hero[data-hero="dino"]'));await page.screenshot({path:`${dir}/${prefix}native-choice-${width}.png`});
  await activate(page.locator('.fr-choice-confirm'));
  await page.waitForFunction(()=>document.querySelector('#hud')?.dataset.hero==='dino',undefined,{timeout:10000});
  await page.locator('#world1-cine-controls').waitFor({state:'visible',timeout:15000});
  await page.waitForTimeout(450);await page.screenshot({path:`${dir}/${prefix}native-invocation-${width}.png`});
  for(let shot=0;shot<30;shot++){
   if(!await page.locator('#world1-cine-controls').isVisible()){await page.waitForTimeout(400);if(!await page.locator('#world1-cine-controls').isVisible())break;}
   await activate(page.locator('#world1-cine-next'));await page.waitForTimeout(180);
  }
  await page.waitForFunction(()=>!document.body.classList.contains('world1-story'));
  await page.waitForFunction(()=>document.querySelector('#world1-guardian-a11y')?.textContent.includes('Tambor de la marea'));
  assert.equal(await page.locator('#hud').getAttribute('data-hero'),'dino');assert.equal(await page.evaluate(()=>!!window.__OHANA_E2E),false);
  assert.equal(await page.locator('#final-hero-choice').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`${dir}/${prefix}native-duel-${width}.png`});assert.deepEqual(errors,[]);assert.deepEqual(backend,[]);
  rows.push({width,height,noTestHooks:true,nativeMenuAndHeartBook:true,heroOnEntry:'yomi',physicalKeyboardMovement:true,earnedFloorResonances:resonances,deliberateChoice:touch?'native touch':'native pointer',fighter:'dino',guardian:'Tambor de la marea',noOpeningGestureConfirmation:true,noCinematicOverlap:true,errors,backend});
  console.log('PASS native ritual',width,touch?'touch choice':'pointer choice');await context.close();
 }
 await fs.writeFile(`${dir}/${prefix}ritual-native.json`,JSON.stringify({environment:external?'public deployment':'local build',rows,scope:'Native first final ritual replay from earned chapter seals with prior final rescues removed. Ordinary keyboard movement and native menu/picker/touch E controls; no hooks, position, health, XP or victory grants.'},null,2)+'\n');
}finally{await browser.close();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}}
