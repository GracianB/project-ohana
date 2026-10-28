// Real new-game intro and touch controls. Evolution XP uses the existing debug
// shortcut as a fixture; this does not claim the player earned four forms.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__OHANA_E2E);
 // Measure every authored story with the browser's real canvas font metrics.
 await page.evaluate(async()=>{
  const {buildWorld1Scene,world1CineTextLayout}=await import('/systems/world1-cine.js');
  const {WORLD1_ORDER}=await import('/systems/world1-rooms.js');
  const ctx=document.createElement('canvas').getContext('2d');
  const shots=['intro','bossIntro','bossDefeat','ending'].flatMap(id=>buildWorld1Scene(id));
  for(const hero of WORLD1_ORDER)shots.push(...buildWorld1Scene('roomEnter',hero),...buildWorld1Scene('awaken',hero));
  for(const [w,h] of [[320,740],[390,844],[844,390],[1440,900]])for(const shot of shots){
   const layout=world1CineTextLayout(ctx,shot,w,h);
   ctx.font='bold '+layout.titleSize+'px sans-serif';
   if(layout.titleLines.some(line=>ctx.measureText(line).width>layout.width+1)||layout.titleLines.length>2)throw Error('Title overflow: '+shot.title+' at '+w);
   if(layout.titleLines.join(' ')!==shot.title.trim())throw Error('Truncated title: '+shot.title);
   ctx.font=layout.bodySize+'px sans-serif';
   if(layout.lines.some(line=>ctx.measureText(line).width>layout.width+1))throw Error('Line overflow: '+shot.title);
   if(layout.lines.join(' ')!==shot.line.trim())throw Error('Truncated story: '+shot.title);
   if(layout.lines.length>(w<h?4:3))throw Error('Too many lines: '+shot.title);
  }
 });
 const start=await page.evaluate(()=>window.__OHANA_E2E.startWorld1('kilo'));
 assert.equal(start.roomId,'w1-kilo');assert.equal(start.world1Cine,'intro');
 const button=page.locator('#world1-cine-next');
 await button.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('#world1-cine-next')?.getAttribute('aria-disabled')==='false');
 assert.match(await page.locator('#world1-cine-controls p').innerText(),/Diez héroes/);
 const before=await page.evaluate(()=>window.__OHANA_E2E.state());
 await page.keyboard.press('j');await page.keyboard.down('d');
 await page.evaluate(()=>window.__OHANA_E2E.step(25));
 await page.keyboard.up('d');
 const frozen=await page.evaluate(()=>window.__OHANA_E2E.state());
 assert.equal(frozen.player.x,before.player.x);assert.equal(frozen.hp,before.hp);
 assert.equal(await page.locator('#hud').isVisible(),false,'story must not compete with HUD');
 await fs.mkdir('test-results/v501',{recursive:true});
 await page.screenshot({path:'test-results/v501/story-mobile.png'});
 for(let n=0;n<12&&(await page.evaluate(()=>window.__OHANA_E2E.state().world1Cine));n++){
  await page.waitForFunction(()=>document.querySelector('#world1-cine-next')?.getAttribute('aria-disabled')==='false');
  await button.tap();
 }
 await button.waitFor({state:'hidden'});
 assert.equal(await page.locator('#hud').isVisible(),true);
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'game');
 await page.keyboard.down('d');await page.evaluate(()=>window.__OHANA_E2E.step(20));await page.keyboard.up('d');
 assert.ok((await page.evaluate(()=>window.__OHANA_E2E.state().player.x))>before.player.x,'control returns after story');
 // Kilo's new lesson progression is authored: XP cheats cannot bypass instruments.
 await page.locator('#game').focus();
 await page.keyboard.press('Control+z');
 assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().evo),0,
   'Kilo must finish the authored instruments before advancing');
 // Validate generic evolution notifications on the legacy hub fixture, where
 // the instrument gate is intentionally absent. This checks real evolution,
 // not a fake class toggle or a fabricated notification.
 const hub=await page.evaluate(()=>window.__OHANA_E2E.start('stitcho'));
 assert.equal(hub.hero,'stitcho');
 assert.equal(hub.evo,0);
 // Test the authored unlock message for each form using actual evolution code.
 for(const [evo,key,index] of [[1,'K',1],[2,'L',2],[3,'I',4],[4,'P',5]]){
  await page.locator('#game').focus();await page.keyboard.press('Control+z');
  await page.locator('#evo-stage.show .evo-skip').waitFor({state:'visible'});
  await page.locator('#evo-stage .evo-skip').click();
  await page.waitForFunction(()=>!document.querySelector('#evo-stage')?.classList.contains('show'));
  assert.equal(await page.evaluate(()=>window.__OHANA_E2E.state().evo),evo);
  const name=await page.locator('.ability-slot[data-index="'+index+'"] .name').innerText();
  const notice=await page.locator('#notification-container').innerText();
  assert.ok(notice.includes(key+' · '+name),notice);
  assert.ok(!notice.includes('U, supremo'));
 }
 assert.deepEqual(errors,[]);
 console.log('PASS V501 experience: new-game touch story, frozen gameplay, restored controls, correct K/L/I/P unlock notices through real evolution (debug XP fixture).');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
