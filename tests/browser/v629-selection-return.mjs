// Native selection inputs only: no E2E hooks, save fixtures or progress grants.
// Returning from the final portal must restore the same hero's dossier and
// stop any casting scene before it can overwrite the final portal's message.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

const publicBase=process.env.OHANA_TEST_BASE_URL;
const server=publicBase?null:await startServer(0);
const base=publicBase?new URL(publicBase.endsWith('/')?publicBase:publicBase+'/').href:`http://127.0.0.1:${server.address().port}/`;
const dir='test-results/v629',prefix=publicBase?'public-':'';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
const reports=[];
try{
 await fs.mkdir(dir,{recursive:true});
 for(const [width,height,touch]of[[1280,900,false],[390,844,true],[320,568,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,...(publicBase?{ignoreHTTPSErrors:true}:{})});
  const page=await context.newPage(),errors=[],backend=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(/netlify\.app/.test(request.url()))backend.push(request.url());});
  const url=new URL(base);url.searchParams.set('verifySelection629',String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>document.documentElement.dataset.ohanaBoot==='ready',undefined,{timeout:120000});
  assert.equal(await page.evaluate(()=>!!window.__OHANA_E2E),false,'native selection must not expose test hooks');
  await page.locator('#ohana-intro.ready .oi-enter').click();
  await page.locator('#family-camp[data-world="1"]').waitFor({state:'visible'});
  const canvas=page.locator('#camp-canvas');
  const state=()=>page.evaluate(()=>{
   const host=document.querySelector('#family-camp'),canvas=document.querySelector('#camp-canvas');
   return {final:host.dataset.final,hero:host.dataset.hero,form:host.dataset.form,
    paintedHero:canvas.dataset.paintedHero,paintedForm:canvas.dataset.paintedForm,
    title:document.querySelector('#camp-name').textContent,start:document.querySelector('#camp-start').textContent,
    line:document.querySelector('#camp-line').textContent,
    formsDisplay:getComputedStyle(document.querySelector('.camp-forms')).display,
    statsDisplay:getComputedStyle(document.querySelector('#camp-stats')).display,
    stats:[...document.querySelectorAll('#camp-stats dd')].map(node=>node.textContent),
    pressed:[...document.querySelectorAll('[data-camp-form][aria-pressed="true"]')].map(node=>node.dataset.campForm),
    filmHidden:document.querySelector('#camp-film').hidden,stopHidden:document.querySelector('#camp-film-stop').hidden,
    playing:document.body.classList.contains('playing'),overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  const progress=()=>page.evaluate(()=>{
   const keys=new Set(['ohana','ohana.tmp','ohana-resume','ohana-w1-seals-v1','ohana-w1-collect-v1','ohana-keepsakes-v1','ohana-room-albums-v1']);
   for(let index=0;index<localStorage.length;index++){
    const key=localStorage.key(index);
    if(/^ohana-(?:w1-|hero-100-v1:|checkpoint|campaign|progress)/.test(key))keys.add(key);
   }
   return Object.fromEntries([...keys].sort().map(key=>[key,localStorage.getItem(key)]));
  });
  const initialProgress=await progress(),cases=[];
  const checkProgress=async()=>assert.deepEqual(await progress(),initialProgress,'selection inputs cannot grant, clear or change campaign progress');
  const click=async locator=>touch?await locator.tap():await locator.click();
  async function heroReady(hero,form){
   await page.waitForFunction(({hero,form})=>{
    const host=document.querySelector('#family-camp'),canvas=document.querySelector('#camp-canvas');
    return host.dataset.final==='false'&&host.dataset.hero===hero&&host.dataset.form===String(form)&&canvas.dataset.paintedHero===hero&&canvas.dataset.paintedForm===String(form);
   },{hero,form});
   const current=await state();
   assert.notEqual(current.formsDisplay,'none');assert.notEqual(current.statsDisplay,'none');
   assert.equal(current.stats.length,5);assert.deepEqual(current.pressed,[String(form)]);
   assert.equal(current.start,'Entrar en su capítulo →');assert.equal(current.playing,false);assert.equal(current.overflow,false);
   return current;
  }
  async function finalReady(){
   await page.waitForFunction(()=>document.querySelector('#family-camp').dataset.final==='true'&&document.querySelector('#camp-canvas').dataset.paintedHero==='final');
   const current=await state();assert.equal(current.title,'El Corazón');assert.equal(current.start,'Entrar en el Corazón →');
   assert.equal(current.formsDisplay,'none');assert.equal(current.statsDisplay,'none');assert.equal(current.playing,false);
   return current;
  }
  async function finalPointer(){
   // Read the same exported layout geometry used by Canvas and pointer input.
   // This imports data/functions only; it never changes live selection state.
   const position=await page.evaluate(async base=>{
    const {createWorld1Select,world1SelectCardRects}=await import(new URL('systems/world1-select.js',base).href);
    const canvas=document.querySelector('#camp-canvas');
    const rect=world1SelectCardRects(createWorld1Select(),canvas.clientWidth,canvas.clientHeight).at(-1);
    return {x:rect.x+rect.w/2,y:rect.y+rect.h/2};
   },base);
   if(touch)await canvas.tap({position});else await canvas.click({position});
   return finalReady();
  }

  // Yomi is the last hero before the final portal. Returning with an arrow
  // keeps the selected ID, so the dossier must recover without resetting F5.
  await click(page.locator('.char-card[data-id="yomi"]'));
  await click(page.locator('[data-camp-form="4"]'));
  const yomiBefore=await heroReady('yomi',4);assert.equal(yomiBefore.title,'Yomi');
  await canvas.focus();await page.keyboard.press('ArrowRight');await finalReady();
  await page.keyboard.press('ArrowLeft');
  const yomiAfter=await heroReady('yomi',4);assert.equal(yomiAfter.title,yomiBefore.title);assert.deepEqual(yomiAfter.stats,yomiBefore.stats);
  cases.push({id:'yomi-keyboard-return',preservedPreview:4,before:yomiBefore,after:yomiAfter});await checkProgress();

  // The other boundary wraps Kilo left into the final portal and right back.
  await click(page.locator('.char-card[data-id="kilo"]'));
  const kiloBefore=await heroReady('kilo',0);
  await canvas.focus();await page.keyboard.press('ArrowLeft');await finalReady();
  await page.keyboard.press('ArrowRight');
  const kiloAfter=await heroReady('kilo',0);assert.equal(kiloAfter.title,kiloBefore.title);assert.deepEqual(kiloAfter.stats,kiloBefore.stats);
  cases.push({id:'kilo-keyboard-wrap',before:kiloBefore,after:kiloAfter});await checkProgress();

  // Clicking/tapping the same HTML card must leave the final preview and
  // restore its base form even when the current hero ID has not changed.
  for(const hero of['yomi','cat']){
   await click(page.locator(`.char-card[data-id="${hero}"]`));
   const baseForm=await heroReady(hero,0);
   await click(page.locator('[data-camp-form="4"]'));await heroReady(hero,4);
   const final=await finalPointer();assert.equal(final.line,'Faltan sellos por despertar.');
   await click(page.locator(`.char-card[data-id="${hero}"]`));
   const after=await heroReady(hero,0);assert.equal(after.title,baseForm.title);assert.deepEqual(after.stats,baseForm.stats);
   assert.equal(after.filmHidden,false);assert.equal(after.stopHidden,true);
   cases.push({id:hero+'-'+(touch?'touch':'pointer')+'-return',restoredPreview:0,before:baseForm,final,after});await checkProgress();
  }
  await page.locator('#family-camp').screenshot({path:`${dir}/${prefix}selection-restored-${width}.png`});

  // The casting scene is still playing when the final portal is selected.
  // Check the move tagline through many real animation frames and a phase
  // boundary, then verify the locked-entry message cannot be overwritten.
  await click(page.locator('.char-card[data-id="yomi"]'));await heroReady('yomi',0);
  await click(page.locator('#camp-film'));
  assert.equal((await state()).filmHidden,true);assert.equal((await state()).stopHidden,false);
  await canvas.focus();await page.keyboard.press('ArrowRight');
  const filmFinal=await finalReady();assert.equal(filmFinal.line,'Despierta los diez sellos para abrirlo.');
  assert.equal(filmFinal.filmHidden,false);assert.equal(filmFinal.stopHidden,true);
  for(const delay of[120,350,4200]){
   await page.waitForTimeout(delay);
   const current=await state();assert.equal(current.line,filmFinal.line);assert.equal(current.filmHidden,false);assert.equal(current.stopHidden,true);
  }
  await page.keyboard.press('Enter');const locked=await finalReady();assert.equal(locked.line,'Faltan sellos por despertar.');
  for(let frame=0;frame<5;frame++){await page.waitForTimeout(100);assert.equal((await state()).line,locked.line);}
  cases.push({id:'casting-scene-final-message',filmStopped:true,taglineStable:true,lockedMessageStable:true,final:locked});
  await page.locator('#family-camp').screenshot({path:`${dir}/${prefix}selection-final-${width}.png`});
  await page.keyboard.press('ArrowLeft');await heroReady('yomi',0);
  await checkProgress();assert.deepEqual(errors,[]);assert.deepEqual(backend,[]);
  let restoredStart=null;
  if(width!==320){
   // Only after checking immutable selection progress, use the restored CTA
   // to begin a real new chapter. Normal gameplay may now save its own state.
   await click(page.locator('.char-card[data-id="kilo"]'));await heroReady('kilo',0);
   await canvas.focus();await page.keyboard.press('ArrowLeft');await finalReady();
   await page.keyboard.press('ArrowRight');await heroReady('kilo',0);
   await click(page.locator('#camp-start'));
   await page.locator('#world1-cine-controls').waitFor({state:'visible',timeout:30000});
   for(let shot=0;shot<28;shot++){
    if(!await page.locator('#world1-cine-controls').isVisible()){
     await page.waitForTimeout(500);
     if(!await page.locator('#world1-cine-controls').isVisible())break;
    }
    await click(page.locator('#world1-cine-next'));await page.waitForTimeout(180);
   }
   await page.waitForFunction(()=>document.body.classList.contains('playing')&&!document.body.classList.contains('world1-story'));
   restoredStart=await page.evaluate(()=>({playing:document.body.classList.contains('playing'),hero:document.querySelector('#hud')?.dataset.hero,hooks:!!window.__OHANA_E2E}));
   assert.equal(restoredStart.playing,true);assert.equal(restoredStart.hero,'kilo');assert.equal(restoredStart.hooks,false);
   await page.screenshot({path:`${dir}/${prefix}selection-restored-start-${width}.png`});
  }
  assert.deepEqual(errors,[]);assert.deepEqual(backend,[]);
  reports.push({width,height,touch,cases,selectionProgressUnchanged:true,noTestHooks:true,noGameplayDuringSelection:true,restoredStart,errors,backend});
  console.log('PASS selection return',width,height,touch?'touch':'pointer');
  await context.close();
 }
 await fs.writeFile(`${dir}/${prefix}selection-return.json`,JSON.stringify({environment:publicBase?'public deployment':'local build',scope:'Native keyboard, HTML pointer/touch cards and final portal inputs; no hooks or save injection. Selection progress is checked unchanged before the separate desktop/mobile new-game CTA checks.',reports},null,2)+'\n');
 console.log('PASS native final selector: same-hero return, preserved keyboard preview, pointer/touch reset and casting scene ownership at 1280/390/320px');
}finally{
 await browser.close();
 if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
