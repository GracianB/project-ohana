// Protocol/scene integration fixture: nine rescues already earned. Boss health
// fixtures isolate the transition, not combat difficulty or a full campaign.
import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';
import{startMultiplayerServer}from'../../tools/local-multiplayer-server.mjs';import{KEEPSAKE_ORDER}from'../../systems/keepsakes.js';import{ROSTER}from'../../characters/roster.js';
const s=await startMultiplayerServer();let browser;
try{
 const h=await s.service.create('adventure'),g=await s.service.join(h.roomId);await s.service.choose(h.roomId,h.identity,'dino');await s.service.choose(h.roomId,g.identity,'stitcho');await s.service.ready(h.roomId,h.identity);await s.service.ready(h.roomId,g.identity);
 const key='room:'+h.roomId,entry=await s.store.getWithMetadata(key),room=entry.data;
 room.engineMode=true;room.adventureProgress={stations:{},secrets:{},encounters:{},seals:KEEPSAKE_ORDER};room.adventureFinale={found:KEEPSAKE_ORDER.slice(0,9),phase:'dormant',hero:null,guardian:null,boss:null,cue:null,seen:[],won:false,revision:1};
 for(const p of room.players){const f=ROSTER.find(r=>r.id===p.characterId).forms[4];Object.assign(p,{worldRoomId:'w1-final',x:p.slot?8650:8600,y:1134-f.h,evolution:4,experience:480,health:f.hp,maxHealth:f.hp});}
 await s.store.setJSON(key,room,{onlyIfMatch:entry.etag});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||chromium.executablePath(),args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});const contexts=[await browser.newContext(),await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})],pages=[],errors=[];
 for(const [i,c]of contexts.entries()){const who=i?g:h;await c.addInitScript(session=>{if(location.pathname.endsWith('/multiplayer.html'))return;if(!sessionStorage.getItem('ohana-coop-session'))sessionStorage.setItem('ohana-coop-session',JSON.stringify(session));localStorage.setItem('ohana-keepsakes-v1','["kilo"]');window.finalWinEvents=[];addEventListener('ohana-win',e=>window.finalWinEvents.push(e.detail));}, {roomId:h.roomId,identity:who.identity,characterId:i?'stitcho':'dino',originalEngine:true});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(s.url+'/index.html?online=1');await p.waitForFunction(()=>document.body.dataset.onlineState==='connected');await p.evaluate(async()=>{window.coop=(await import('/systems/online-coop.js')).onlineCoop;});pages.push(p);}
 const[host,guest]=pages;
 async function finish(p,id){for(let i=0;i<80;i++){const view=await p.evaluate(()=>({id:coop._combatGame.world1Cine?.id,waiting:coop._combatGame._coopFinalWaiting}));if(view.id!==id)return;await p.keyboard.press('Enter');await p.waitForTimeout(110);}throw Error('scene did not finish: '+id);}
 // Clear only the entry presentation, then verify that one reader cannot
 // independently release the actual last guardian intro.
 for(const p of pages){for(let i=0;i<40;i++){const id=await p.evaluate(()=>coop._combatGame.world1Cine?.id);if(!id||id==='keepsakeIntro')break;await p.keyboard.press('Enter');await p.waitForTimeout(100);}}
 for(const p of pages)await p.waitForFunction(()=>coop._combatGame.world1Cine?.id==='keepsakeIntro');
 for(let i=0;i<30;i++){await host.keyboard.press('Enter');await host.waitForTimeout(100);if(await host.evaluate(()=>coop._combatGame._coopFinalWaiting))break;}
 assert.equal(await host.evaluate(()=>coop._combatGame.world1Cine?.id),'keepsakeIntro');assert.equal(await host.evaluate(()=>coop._combatGame.finalGauntlet.phase),'intro');
 await Promise.all(pages.map(p=>finish(p,'keepsakeIntro')));for(const p of pages)await p.waitForFunction(()=>coop._combatGame.finalGauntlet?.phase==='fight');
 assert.deepEqual(await Promise.all(pages.map(p=>p.evaluate(()=>coop._combatGame.player.id))),['dino','stitcho']);
 await host.reload();await host.waitForFunction(()=>document.body.dataset.onlineState==='connected');await host.evaluate(async()=>{window.coop=(await import('/systems/online-coop.js')).onlineCoop;});await host.waitForFunction(()=>coop._combatGame.world1Cine?.id==='keepsakeIntro');await finish(host,'keepsakeIntro');assert.equal(await host.evaluate(()=>coop._combatGame.finalGauntlet.found.length),9);console.log('PASS host reload resumes the active guardian and nine shared receipts');
 const beforeReconnect=await guest.evaluate(()=>JSON.parse(sessionStorage.getItem('ohana-coop-session')).identity);await guest.context().setOffline(true);await s.service.disconnect(h.roomId,beforeReconnect);await host.waitForFunction(()=>coop._combatGame.coopPeerWaiting);
 const frozen=await host.evaluate(()=>({t:coop._combatGame.t,hp:coop._combatGame.player.health,boss:coop._combatGame.finalGauntlet.guardian.hp}));await host.waitForTimeout(900);assert.deepEqual(await host.evaluate(()=>({t:coop._combatGame.t,hp:coop._combatGame.player.health,boss:coop._combatGame.finalGauntlet.guardian.hp})),frozen);
 await guest.context().setOffline(false);await guest.waitForFunction(epoch=>JSON.parse(sessionStorage.getItem('ohana-coop-session')).identity.connectionEpoch>epoch,beforeReconnect.connectionEpoch);await host.waitForFunction(()=>!coop._combatGame.coopPeerWaiting);console.log('PASS disconnected peer freezes the active fight and authenticated reconnection resumes it');

 await guest.evaluate(()=>{const game=coop._combatGame;game.player.health=0;game.player.dead=true;dispatchEvent(new CustomEvent('ohana-death',{detail:{reason:'test-lethal-fixture',id:game.player.id}}));});
 for(const p of pages)await p.waitForFunction(()=>coop.snapshot?.adventureRetry?.status==='down');
 for(const p of pages)await p.waitForFunction(()=>coop.snapshot?.adventureRetry?.status==='active'&&!coop._combatGame.player.dead);
 for(const p of pages)await p.waitForFunction(()=>coop._combatGame.world1Cine?.id==='keepsakeIntro');await Promise.all(pages.map(p=>finish(p,'keepsakeIntro')));
 for(const p of pages){assert.equal(await p.evaluate(()=>coop._combatGame.keepsakes.length),9);assert.equal(await p.evaluate(()=>coop._combatGame.finalGauntlet.hero),'yomi');}
 console.log('PASS shared defeat retries the unrescued guardian without erasing nine physical memories');


 // Fixture defeats only the last guardian. The guest must physically touch
 // the released object; the host remains away from it.
 await host.evaluate(()=>{const game=coop._combatGame;game.finalGauntlet.guardian.hp=0;game.player.x=8600;});for(const p of pages)await p.waitForFunction(()=>coop._combatGame.finalGauntlet?.phase==='released');
 await guest.evaluate(()=>{const game=coop._combatGame;game.player.x=9360-game.player.w/2;game.player.y=1134-game.player.h;});
 for(const p of pages)await p.waitForFunction(()=>coop._combatGame.world1Cine?.id==='keepsakeRescue');await guest.reload();await guest.waitForFunction(()=>document.body.dataset.onlineState==='connected');await guest.evaluate(async()=>{window.coop=(await import('/systems/online-coop.js')).onlineCoop;});await guest.waitForFunction(()=>coop._combatGame.world1Cine?.id==='keepsakeRescue');assert.equal(await guest.evaluate(()=>coop._combatGame.keepsakes.length),10);console.log('PASS guest reload retains the tenth rescue and rejoins the same cinematic barrier');await Promise.all(pages.map(p=>finish(p,'keepsakeRescue')));
 for(const p of pages)await p.waitForFunction(()=>coop._combatGame.world1Cine?.id==='bossIntro');assert.equal(await guest.evaluate(()=>coop._combatGame.keepsakes.length),10);await Promise.all(pages.map(p=>finish(p,'bossIntro')));
 // The actual director processes a final-boss death. No win flag, scene or
 // network receipt is injected by the test.
 await host.evaluate(()=>{coop._combatGame.boss.hp=0;});
 for(const p of pages)await p.waitForFunction(()=>coop._combatGame.world1Cine?.id==='bossDefeat',{},{timeout:30000});assert.deepEqual(await Promise.all(pages.map(p=>p.evaluate(()=>finalWinEvents.length))),[0,0]);await Promise.all(pages.map(p=>finish(p,'bossDefeat')));
 for(const p of pages)await p.waitForFunction(()=>coop._combatGame.world1Cine?.id==='ending');await Promise.all(pages.map(p=>finish(p,'ending')));
 for(const p of pages)await p.waitForFunction(()=>finalWinEvents.length===1);for(const p of pages){assert.equal(await p.evaluate(()=>coop._combatGame.world1Cine),null);assert.equal(await p.evaluate(()=>finalWinEvents[0].keepsakes.length),10);assert.equal(await p.evaluate(()=>localStorage.getItem('ohana-keepsakes-v1')),'["kilo"]');}
 for(const p of pages){await p.getByRole('button',{name:/Ver el reencuentro/i}).click();await p.waitForFunction(()=>document.querySelector('#win-cinema')?.classList.contains('cinema-complete'));assert.equal(await p.locator('#win-repeat').isVisible(),false);assert.equal(await p.locator('#win-continue').innerText(),'Volver al vestíbulo');}
 await fs.mkdir('test-results/v604',{recursive:true});await guest.screenshot({path:'test-results/v604/coop-finale-mobile.png'});await fs.writeFile('test-results/v604/coop-finale.json',JSON.stringify({fixture:'nine previous rescues and two defeated boss health fixtures; no full traversal claim',errors,results:await Promise.all(pages.map(p=>p.evaluate(()=>({hero:coop._combatGame.player.id,wins:finalWinEvents.length,keepsakes:finalWinEvents[0].keepsakes}))))},null,2));await guest.getByRole('button',{name:'Volver al vestíbulo',exact:true}).click();await guest.waitForURL(/multiplayer.html/);assert.equal(await guest.evaluate(()=>sessionStorage.getItem('ohana-coop-session')),null);assert.deepEqual(errors,[]);console.log('PASS two-browser final-act fixture: barrier, guest pickup, Quimera death, sequential films and one result each');
}catch(error){console.error('FINAL_DIAGNOSTIC',await Promise.all((browser?.contexts()||[]).flatMap(c=>c.pages()).map(p=>p.evaluate(()=>{const g=window.coop?._combatGame;return{hero:g?.player.id,room:g?.roomId,seals:g?.world1Seals,found:g?.finalGauntlet?.found,phase:g?.finalGauntlet?.phase,cine:g?.world1Cine?.id,pending:g?._pendingWorld1Cine,localCue:g?._coopFinalCue,ready:g?._coopFinalReady,canonical:g?.coopFinaleState,errors:g?.lastRuntimeFault};}).catch(()=>null))));throw error;}finally{await browser?.close();await s.close();}
