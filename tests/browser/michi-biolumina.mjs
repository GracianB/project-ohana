// Michi Biolumina: local UI/Canvas smoke, deliberately independent from earned campaign gates.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
const output='test-results/michi-biolumina';
try{
 await fs.mkdir(output,{recursive:true});
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 const url='http://127.0.0.1:'+server.address().port+'/?e2e=1';
 await page.addInitScript(()=>localStorage.setItem('ohana-atlas-earned-v1',JSON.stringify({cat:4})));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('.oi-enter').click();
 await page.locator('.char-card[data-id="cat"]').click();
 const names=await page.evaluate(async()=>(await import('/characters/michi-lumina.js')).MICHI_BIOLUM_FORMS.map(f=>f.name));
 await page.locator('[data-atlas-step="2"]').click();
 const selections=[];
 for(const [width,height]of[[1280,900],[390,844]]){
  await page.setViewportSize({width,height});
  for(let form=0;form<5;form++){
   await page.locator('[data-atlas-form="'+form+'"]').click();
   const actual=(await page.locator('#atlas-form-name').textContent()).trim();
   assert.equal(actual,names[form]);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow at '+width);
   if(width===390)await page.locator('#atlas-stage').screenshot({path:output+'/selector-'+form+'.png'});
   selections.push({width,form,name:actual});
  }
 }
 await page.setViewportSize({width:1280,height:900});
 const art=await page.evaluate(async()=>{
  const cat=(await import('/characters/art/cat.js')).default;
  const cases=[];
  for(let form=0;form<5;form++){
   const draw=(time,reduced=false)=>{
    const canvas=document.createElement('canvas');canvas.width=240;canvas.height=230;
    const c=canvas.getContext('2d');c.translate(120,183);c.scale(1.12,1.12);
    cat.draw(c,{form,state:'idle',t:time,phase:time*.17,castSlot:1,look:{x:.2,y:0},reduceMotion:reduced},{});
    const pixels=c.getImageData(0,0,240,230).data;
    let visible=0,edgePixels=0;
    for(let y=0;y<230;y++)for(let x=0;x<240;x++){
      const alpha=pixels[(y*240+x)*4+3];
      if(alpha>25)visible++;
      if(alpha>25&&(x<=2||x>=237))edgePixels++;
    }
    return {png:canvas.toDataURL().split(',')[1],visible,edgePixels};
   };
   const a=draw(75),b=draw(145),ra=draw(75,true),rb=draw(145,true);
   cases.push({form,visible:a.visible,edgePixels:a.edgePixels,moving:a.png!==b.png,reducedStable:ra.png===rb.png,png:a.png});
  }
  return cases;
 });
 for(const row of art){
  assert.ok(row.visible>170,'non-empty visible artwork F'+row.form);
  assert.ok(row.moving,'living animation F'+row.form);
  assert.equal(row.edgePixels,0,'local glow / anatomy must not be clipped horizontally in portrait F'+row.form);
  assert.ok(row.reducedStable,'frozen accessible pose F'+row.form);
  await fs.writeFile(output+'/form-'+row.form+'.png',Buffer.from(row.png,'base64'));
 }
 await page.evaluate(()=>window.__OHANA_E2E.startWorld1('cat'));
 await page.evaluate(()=>window.__OHANA_E2E.loadRoom('w1-cat'));
 await page.evaluate(()=>window.__OHANA_E2E.step(12));
 const first=await page.evaluate(()=>window.__OHANA_E2E.state());
 assert.equal(first.roomId,'w1-cat');assert.equal(first.hero,'cat');assert.equal(first.runtimeFaults,0);
 const planets=await page.evaluate(async()=>{
  const {planMichiLights,isMichiWorld}=await import('/worlds/michi-reactive-night.js');
  const s=window.__OHANA_E2E.state();
  // This isolated light fixture has its own 390px camera, independent of the game's viewport/spawn.
  const mock={roomDef:{hero:'cat',world1:true},player:{...s.player,evo:0},worldH:s.worldH,cam:{x:s.player.x-195,y:s.player.y-422},enemies:[{x:s.player.x+110,y:s.player.y,w:24,h:28,hp:20,kind:'medusa'}]};
  const p0=planMichiLights(mock,{width:390,height:844});
  const p4=planMichiLights({...mock,player:{...mock.player,evo:4}},{width:390,height:844});
  return {allowed:isMichiWorld(mock),radius:p0.hero.radius,finalRadius:p4.hero.radius,enemy:p0.enemies.length};
 });
 assert.ok(planets.allowed&&planets.finalRadius>planets.radius&&planets.enemy===1,'living-light planner follows player and foes');
 // Presentation fixture: selecting the evolution directly checks art, never claims earned progress.
 for(let form=0;form<5;form++){
  await page.evaluate(form=>window.__OHANA_E2E.setEvo(form),form);
  await page.evaluate(()=>window.__OHANA_E2E.step(2));
  await page.screenshot({path:output+'/world-form-'+form+'.png'});
 }
 const help=page.locator('#help');
 await page.locator('#play-options summary').click();await page.locator('[data-play-action="btn-help"]').click();
 await help.waitFor({state:'visible'});
 assert.equal(await page.locator('#help-title').innerText(),'Un mundo por descubrir');
 assert.ok(await page.locator('#field-guide').isVisible());
 for(const [width,height]of[[1280,900],[390,844]]){
  await page.setViewportSize({width,height});
  const geom=await page.locator('#help .panel').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,viewport:innerWidth};});
  assert.ok(geom.left>=0&&geom.right<=width+1&&geom.top>=0,'help accessible within viewport '+width+': '+JSON.stringify(geom));
  await help.screenshot({path:output+'/help-'+width+'.png'});
 }
 // Inspect five production drawings inside the interactive field manual.
 await page.locator('#field-guide [data-guide="cat"]').click();
 const atlas=page.locator('#michi-field-manual');
 await atlas.waitFor({state:'visible'});
 assert.equal(await atlas.locator('[data-michi-form]').count(),5);
 for(let form=0;form<5;form++){
  await atlas.locator('[data-michi-form="'+form+'"]').click();
  assert.equal(await atlas.locator('.mfm-copy h6').innerText(),names[form]);
  assert.equal(await atlas.locator('[data-michi-form="'+form+'"]').getAttribute('aria-pressed'),'true');
  assert.ok(await atlas.locator('canvas').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v>0)));
 }
 await atlas.locator('[data-michi-form="4"]').focus();
 await page.keyboard.press('ArrowRight');
 assert.equal(await atlas.locator('[data-michi-form="0"]').getAttribute('aria-pressed'),'true','focus should wrap');
 await page.keyboard.press('ArrowLeft');
 assert.equal(await atlas.locator('[data-michi-form="4"]').getAttribute('aria-pressed'),'true','reverse wrap');
 await page.setViewportSize({width:390,height:844});
 const bound=await atlas.boundingBox();
 assert.ok(bound.x>=0&&bound.x+bound.width<=391,'manual fits mobile viewport');
 await atlas.screenshot({path:output+'/manual-390.png'});
 await page.locator('#btn-close-help').click();
 assert.deepEqual(errors,[],'zero uncaught browser errors');
 await fs.writeFile(output+'/report.json',JSON.stringify({selection:selections,forms:art.map(({png,...rest})=>rest),world:first.roomId,lighting:planets,errors},null,2));
 console.log('PASS MICHI BIOLUMINA: 5 real animations, reduced motion, mobile selector, living chapter light and help panel');
}finally{await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
