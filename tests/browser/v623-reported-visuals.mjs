// Real pointer selection at three viewport sizes, then isolated render fixtures.
// Fixtures are never counted as earned progress, encounters won or play balance.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {chromium} from 'playwright';import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'});
try{
 await fs.mkdir('test-results/v623',{recursive:true});const page=await browser.newPage(),errors=[],report=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await page.keyboard.press('Escape');
 for(const [width,height]of[[1280,900],[390,844],[320,568]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(180);
  const canvas=page.locator('#camp-canvas'),box=await canvas.boundingBox();assert.ok(box);
  const rs=await page.evaluate(async()=>{const {createWorld1Select,world1SelectCardRects}=await import('/systems/world1-select.js');const c=document.querySelector('#camp-canvas');return world1SelectCardRects(createWorld1Select(),c.clientWidth,c.clientHeight);});
  const r=rs[10];assert.ok(r.y+r.h<=box.height);await canvas.scrollIntoViewIfNeeded();const visible=await canvas.boundingBox();
  await page.mouse.click(visible.x+r.x+r.w/2,visible.y+r.y+r.h/2);assert.equal(await page.locator('#family-camp').getAttribute('data-final'),'true');
  await page.waitForTimeout(180);await canvas.screenshot({path:`test-results/v623/final-selection-${width}.png`});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));report.push({width,height,finalPortalVisible:true,pointerSelectsFinal:true});
 }
 const fixtures=await page.evaluate(async()=>{
  const {drawWorld1Cine,buildWorld1Scene}=await import('/systems/world1-cine.js');
  const {drawCharacter}=await import('/characters/draw.js');const {campActor}=await import('/systems/family-camp.js');const {findRoster}=await import('/characters/roster.js');
  const {KEEPSAKES,KEEPSAKE_ORDER}=await import('/systems/keepsakes.js');const {drawLivingRealm}=await import('/worlds/living-realms.js');const {drawRealmSignatures}=await import('/systems/realm-signatures.js');
  const c=document.createElement('canvas');c.width=1000;c.height=650;const ctx=c.getContext('2d'),shots=[],alphas=[];
  for(const id of KEEPSAKE_ORDER){
   const d=KEEPSAKES[id],guardian={roomId:'w1-final',miniBoss:true,gauntletBoss:id,evolved:true,x:0,y:0,w:184,h:224,hp:100,max:100,flash:16,[d.key]:{phase:'idle',clock:40,aim:1}};
   const g={finalGauntlet:{guardian},world1Cine:{id:'keepsakeIntro',hero:id,i:0,t:80,shots:buildWorld1Scene('keepsakeIntro',id)}};
   drawWorld1Cine(ctx,g,c.width,c.height,80,{drawActor:(cx,hero,x,y,scale,acting)=>{alphas.push(cx.globalAlpha);cx.save();cx.translate(x,y);const p=campActor(findRoster(hero),acting.form,acting.pose,scale*60);p._theatreHQ=true;drawCharacter(cx,p,{x:0,y:0},80);cx.restore();}});
   shots.push({name:'guardian-'+id,data:c.toDataURL().split(',')[1]});
   ctx.clearRect(0,0,c.width,c.height);drawLivingRealm(ctx,id,{x:1200,y:300},c.width,c.height,80);drawRealmSignatures(ctx,id,{x:1200,y:300},c.width,c.height,80);shots.push({name:'realm-'+id,data:c.toDataURL().split(',')[1]});
  }return {shots,alphas};
 });
 assert.ok(fixtures.alphas.every(a=>a>.99),'stars cannot dim foreground cinematic actors');
 for(const f of fixtures.shots)await fs.writeFile(`test-results/v623/${f.name}.png`,Buffer.from(f.data,'base64'));
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/v623/reported-visuals.json',JSON.stringify({selection:report,guardianFilmsRendered:10,realmSignaturesRendered:10,foregroundOpaque:true,fixtureOnly:true,errors},null,2));console.log('PASS final portal pointer at 1280/390/320; ten opaque guardian films and ten Canvas realm signatures rendered');
}finally{await browser.close();await new Promise(r=>server.close(r));}
