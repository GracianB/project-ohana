import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

const server=await startServer(0);let browser;
try{
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?e2e=1');
 await page.locator('.oi-enter').click();
 await page.locator('#family-camp').waitFor();
 const identity=await page.evaluate(async()=>{
  const {getArt}=await import('/characters/art/index.js');
  const {default:round}=await import('/characters/art/pikachu.js');
  const {default:kirin}=await import('/characters/art/chispin-boss.js');
  const {ROSTER}=await import('/characters/roster.js');
  return {
   round:getArt('chispin')===round,roundAlias:getArt('pikachu')===round,
   bossDistinct:getArt('chispin')!==kirin,
   kirinId:kirin.id,forms:ROSTER.find(x=>x.id==='chispin')?.evoNames
  };
 });
 assert.equal(identity.round,true);
 assert.equal(identity.roundAlias,true);
 assert.equal(identity.bossDistinct,true);
 assert.equal(identity.kirinId,'world-two-thunder-guardian');
 assert.equal(identity.forms[3],'Trueno Gordo');

 // World 2 is Stitcho's solo Archipelago, NOT Chispin's hero animation.
 const worldTwo=await page.evaluate(()=>{
  const api=window.__OHANA_E2E;api.start('stitcho');
  const at=(x,y)=>api.setPlayer(x-15,y-20);
  at(430,1074);api.interact();
  at(540,1070);at(830,836);at(1720,1090);api.interact();
  at(1960,1050);api.setInvulnerable(600);api.step(5);
  return {state:api.state(),enemies:api.roomCast()};
 });
 assert.equal(worldTwo.state.stitchoTrail.index,2);
 const guardian=worldTwo.enemies.find(x=>x.worldTwoGuardian);
 assert.ok(guardian,'the white-gold design should actually spawn as the World 2 secret boss');
 assert.equal(guardian.max,320);
 assert.ok(guardian.worldTwoGuardian.phase);
 await fs.mkdir('test-results/v454',{recursive:true});
 await page.screenshot({path:'test-results/v454/world2-white-gold-secret-boss.png'});
 const chispin=await page.evaluate(()=>{
  const api=window.__OHANA_E2E;api.start('chispin');
  return {room:api.state().roomName,world2:api.roomCast().some(x=>!!x.worldTwoGuardian)};
 });
 assert.equal(chispin.room,'Islas del Relámpago');
 assert.equal(chispin.world2,false,'never spawn white-gold guardian as playable Chispin');
 assert.deepEqual(errors,[]);
 console.log('PASS V454 identity: round Chispin and Trueno Gordo, white-gold Kirin exclusively an optional Stitcho World 2 boss.');
}finally{
 await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
