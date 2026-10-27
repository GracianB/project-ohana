// Default: two clean profiles, authenticated local server and production input.
// Earned runs use real camp roles and no objective/health/XP/position grants.
// FINAL_PROBE is explicitly prepared; RESUME_FILE restores earned room state.
import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';
import{playGauntlet}from'./gauntlet-controls.mjs';
import{startMultiplayerServer}from'../../tools/local-multiplayer-server.mjs';import{WORLD1_ORDER}from'../../systems/world1-rooms.js';import{playChapter}from'./chapter-controls.mjs';
const resumed=process.env.OHANA_COOP_RESUME_FILE?JSON.parse(await fs.readFile(process.env.OHANA_COOP_RESUME_FILE,'utf8')):null;
let now=resumed?.now??Date.UTC(2026,9,26,12),browser;const server=await startMultiplayerServer({now:()=>now}),journal=resumed?.journal||[],errors=[];let pages=[],heartbeat;
try{
 let h,g;
 if(resumed){assert.equal(resumed.source,'earned cooperative campaign; no gameplay grants');h=resumed.host;g=resumed.guest;assert.equal(resumed.room.code,h.roomId);assert.deepEqual(journal.map(c=>c.hero),WORLD1_ORDER.slice(0,journal.length));assert.deepEqual(resumed.room.adventureProgress.seals,WORLD1_ORDER.slice(0,journal.length));await server.store.setJSON('room:'+h.roomId,resumed.room,{onlyIfNew:true});console.log('RESUME_EARNED_CHECKPOINT',JSON.stringify({chapters:journal.length,room:resumed.room.players[0].worldRoomId}));}
 else{h=await server.service.create('adventure');g=await server.service.join(h.roomId);await server.service.choose(h.roomId,h.identity,'kilo');await server.service.choose(h.roomId,g.identity,'dino');await server.service.ready(h.roomId,h.identity);await server.service.ready(h.roomId,g.identity);}

 if(process.env.OHANA_COOP_FINAL_PROBE==='1'){
  // Isolated combat probe: prepared chapter seals and fresh final heroes.
  // Does not count as a continuous earned campaign.
  const entry=await server.store.getWithMetadata('room:'+h.roomId),room=entry.data;
  const {ROSTER}=await import('../../characters/roster.js');room.adventureProgress={stations:{},secrets:{},encounters:{},seals:[...WORLD1_ORDER]};
  for(const p of room.players){const f=ROSTER.find(r=>r.id===p.characterId).forms[4];Object.assign(p,{worldRoomId:'w1-final',x:420+p.slot*130,y:1134-f.h,evolution:4,experience:480,health:f.hp,maxHealth:f.hp});}
  await server.store.setJSON('room:'+h.roomId,room,{onlyIfMatch:entry.etag});
 }
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||chromium.executablePath(),args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 for(const [i,identity]of [h.identity,g.identity].entries()){
  const context=await browser.newContext({viewport:{width:1280,height:800}});await context.addInitScript(session=>{if(!sessionStorage.getItem('ohana-coop-session'))sessionStorage.setItem('ohana-coop-session',JSON.stringify(session));localStorage.setItem('ohana-difficulty','normal');},{roomId:h.roomId,identity,characterId:resumed?.room.players[i].characterId||(i?'dino':'kilo'),originalEngine:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date(now)});await page.clock.pauseAt(new Date(now+1000));await page.goto(server.url+'/index.html?online=1&e2e=1');await page.evaluate(async()=>{window.coop=(await import('/systems/online-coop.js')).onlineCoop;window.finalWinEvents=[];addEventListener('ohana-win',e=>finalWinEvents.push(e.detail));window.__OHANA_E2E.manualClock(true);});pages.push(page);
 }
 now+=1000;
 const[host,guest]=pages;await fs.mkdir('test-results/v604/cooperative-campaign',{recursive:true});await fs.rm('test-results/v604/cooperative-campaign/failure.json',{force:true});
 const state=p=>p.evaluate(()=>window.__OHANA_E2E.state());
 if(process.env.OHANA_COOP_FINAL_PROBE==='1')heartbeat=setInterval(async()=>{try{const s=await state(host);console.log('FINAL_PROBE_STATE',JSON.stringify({room:s.roomId,x:s.player?.x,hp:s.hp,cine:s.world1Cine,gauntlet:s.gauntlet?.phase,hero:s.gauntlet?.hero,found:s.gauntlet?.found.length}));}catch{}},20000);

 async function flush(){for(let n=0;n<30;n++){await Promise.all(pages.map(p=>p.evaluate(async()=>{const g=coop._combatGame;if(!g)return;await coop.sendPosition(g);await coop.drainMutations(g);await coop.poll(g,true);})));const busy=await Promise.all(pages.map(p=>p.evaluate(()=>coop.mutationBusy||coop.polling||coop.reconnecting)));if(!busy.some(Boolean))return;await host.waitForTimeout(10);}throw Error('network did not settle');}
 async function terrainJump(page,frames){const {s,route}=await page.evaluate(()=>({s:__OHANA_E2E.state(),route:__OHANA_E2E.roomTraversal()})),p=s.player,axis=s.input.axisX;return p?.grounded&&!s.input.jump&&Math.abs(axis)>.2&&(route.terraces||[]).some(t=>{const edge=axis>0?p.x+p.w:p.x,dist=axis>0?t.x-edge:edge-t.x-t.w;return t.y<p.y+p.h-15&&dist>-4&&dist<Math.min(125,Math.max(75,frames*7+15));});}
 let tick=0;
 async function buddy(){
  const a=await state(host),b=await state(guest);if(!a.player||!b.player||a.roomId!==b.roomId||b.hp<=0||b.world1Cine)return;
  const p=b.player,foes=await guest.evaluate(()=>__OHANA_E2E.roomCast()),enemy=foes.filter(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<430).sort((x,y)=>Math.abs(x.x-p.x)-Math.abs(y.x-p.x))[0],mind=enemy&&(enemy.chapterBoss||enemy.guardian||enemy.stitchoBoss||enemy.chispinBoss);
  let target=a.player.x+a.player.w/2-(a.player.vx<0?-100:100);if(enemy&&Math.abs(a.player.x-p.x)<600&&(!mind||mind.phase==='rest'))target=enemy.x-100;
  const dx=target-p.x-p.w/2;await guest.keyboard.up('a');await guest.keyboard.up('d');await guest.keyboard.up('w');await guest.keyboard.up('s');if(Math.abs(dx)>45)await guest.keyboard.down(dx>0?'d':'a');
  if(b.hero==='kilo'&&a.kiloFlight?.mode==='solar'){if(b.kiloFlight?.mode!=='solar')await guest.keyboard.press('k');const dy=a.player.y-p.y;if(Math.abs(dy)>25)await guest.keyboard.down(dy>0?'s':'w');}
  else if(p.grounded&&mind?.phase==='warn')await guest.keyboard.down('w');
  if(b.hero==='chispin'&&b.evo>=1&&[2860,4460,6260].some(x=>x>p.x&&x-p.x<150))await guest.keyboard.press('k');
  if(b.hero==='stitcho'&&b.evo>=1&&p.grounded&&p.x>2880&&p.x<3010)await guest.keyboard.press('k');
  if(enemy){await guest.keyboard.press('j');if(!mind||mind.phase==='rest'){await guest.keyboard.press('h');if(tick%20===0)await guest.keyboard.press('u');if(b.evo>=2&&tick%17===0)await guest.keyboard.press('l');}}
 }
 async function step(frames=1,{follow=true}={}){
  if(follow)await buddy();const added=[];for(const p of pages)if(await terrainJump(p,frames)){await p.keyboard.down('w');added.push(p);}
  const elapsed=Math.ceil(frames*1000/60);now+=elapsed;await Promise.all(pages.map(p=>p.evaluate(n=>__OHANA_E2E.step(n),frames)));await Promise.all(pages.map(p=>p.clock.runFor(elapsed)));for(const p of added)await p.keyboard.up('w');for(const key of ['a','d','w','s'])await guest.keyboard.up(key);await flush();tick++;return state(host);
 }
 async function films(){for(let i=0;i<40;i++){let active=false;for(const p of pages){if(await p.locator('#supreme-cinema[aria-hidden="false"]').count()){active=true;}if(await p.locator('#evo-stage.show .evo-skip').count()){await p.locator('#evo-stage .evo-skip').click({force:true});active=true;}if((await state(p)).world1Cine){await p.keyboard.press('Enter');active=true;}}if(!active)break;await step(100,{follow:false});}for(const p of pages)await p.locator('#game').focus();}
 async function retry(){await host.keyboard.press('r');for(let i=0;i<150;i++){await step(30,{follow:false});const both=await Promise.all(pages.map(state));if(both.every(s=>s.hp>0)&&await host.evaluate(()=>!coop._combatGame.coopRetryWaiting))return;}throw Error('party retry did not complete');}
 for(let i=0;i<10;i++)await step(2,{follow:false});await films();
 const count=Number(process.env.OHANA_COOP_CHAPTERS)||10;
 for(const [chapter,hero]of [...WORLD1_ORDER.entries()].filter(([chapter])=>process.env.OHANA_COOP_FINAL_PROBE!=='1'&&chapter>=journal.length&&chapter<count)){
  await films();for(const p of pages){const current=await state(p);assert.equal(current.roomId,'w1-'+hero);if(current.hero!==hero){const button=p.locator('#ohana-coop-role button').filter({hasText:new RegExp((await p.evaluate(async hero=>(await import('/characters/roster.js')).ROSTER.find(r=>r.id===hero).name,hero))+'$')});for(let n=0;n<80;n++){await step(5,{follow:false});if(await button.count()&&await button.isEnabled())break;}await button.click({force:true});for(let n=0;n<80&&(await state(p)).hero!==hero;n++)await step(2,{follow:false});await flush();assert.equal((await state(p)).hero,hero,'camp role change is confirmed before playing');}}
  const first=await state(host);assert.equal(first.hero,hero);assert.equal(first.evo,0,'first use of chapter hero starts baby');
  const played=await playChapter(host,{hero,state:()=>state(host),step,films,onDeath:retry,onBeat:async(s,data)=>{await fs.writeFile('test-results/v604/cooperative-campaign/current.json',JSON.stringify({host:s,guest:await state(guest),data},null,2));await host.screenshot({path:'test-results/v604/cooperative-campaign/current.png'});}});
  assert.equal(played.state.world1.sealed,true);assert.deepEqual(played.state.world1Seals,WORLD1_ORDER.slice(0,chapter+1));for(let n=0;n<40&&!(await state(guest)).world1.sealed;n++)await step(5);const peer=await state(guest);assert.equal(peer.world1.sealed,true,'guest receives the same earned seal');assert.ok(peer.player.x>7400,'guest physically traverses the chapter');assert.equal(peer.world1.expedition.done,3);
  journal.push({...played.journal,guest:{hero:peer.hero,x:peer.player.x,hp:peer.hp,report:peer.combatReport}});console.log('COOP_CHAPTER_PASS',JSON.stringify(journal.at(-1)));await films();
  let crossed=false;for(let i=0;i<240;i++){await host.keyboard.down('d');await step(20);const travel=await guest.evaluate(()=>coop.snapshot?.travel);if(travel){await guest.locator('#ohana-coop-travel-v604 .travel-yes').click({force:true});await flush();}const s=await state(host);if(s.roomId!=='w1-'+hero){crossed=true;break;}}await host.keyboard.up('d');assert.ok(crossed,'earned door and guest consent advance both');assert.equal((await state(guest)).roomId,(await state(host)).roomId);await fs.writeFile('test-results/v604/cooperative-campaign/progress.json',JSON.stringify({journal,next:(await state(host)).roomId,errors},null,2));if(process.env.OHANA_COOP_CHECKPOINT_FILE)await fs.writeFile(process.env.OHANA_COOP_CHECKPOINT_FILE,JSON.stringify({source:'earned cooperative campaign; no gameplay grants',now,journal,roomId:h.roomId,host:h,guest:g,room:server.store.entries.get('room:'+h.roomId).data}),{mode:0o600});
 }
 let finale=null;
 if(process.env.OHANA_COOP_FINALE==='1'&&count===10){
  assert.equal((await state(host)).roomId,'w1-final');await films();
  for(const p of pages){const home=await p.evaluate(()=>coop.currentPlayer(coop.snapshot).homeCharacterId);if((await state(p)).hero!==home){const button=p.locator('#ohana-coop-role button').filter({hasText:/Volver a /});for(let n=0;n<80;n++){await step(5,{follow:false});if(await button.count()&&await button.isEnabled())break;}await button.click({force:true});for(let n=0;n<80&&(await state(p)).hero!==home;n++)await step(2,{follow:false});assert.equal((await state(p)).hero,home);}}

  const gauntlet=await playGauntlet(host,{state:()=>state(host),step,films,onDeath:retry,onBeat:async s=>{await fs.writeFile('test-results/v604/cooperative-campaign/finale-current.json',JSON.stringify({host:s,guest:await state(guest)},null,2));await host.screenshot({path:'test-results/v604/cooperative-campaign/finale-current.png'});}});
  await films();let s=await state(host),deaths=0;const phases=new Set(),seen=new Set();
  for(let i=0;i<14000&&!s.world1Won;i++){
   for(const p of pages){const v=await state(p);if(v.world1Cine)seen.add(v.world1Cine);}await films();s=await state(host);
   if(s.hp<=0){assert.ok(++deaths<=35,'Quimera retry limit');await retry();await films();s=await state(host);}
   if(!s.boss){await host.keyboard.down('d');s=await step(24);await host.keyboard.up('d');continue;}
   phases.add(s.boss.phase);const p=s.player,gap=s.boss.x-p.x-p.w/2,dist=Math.abs(gap);
   if(s.boss.hp<=0){s=await step(30);continue;}
   if(dist<540)await host.keyboard.press('j');if(dist<400&&i%20===0)await host.keyboard.press('u');if(dist<480&&i%12===0)await host.keyboard.press('l');
   const target=s.boss.vulnerable?65:250;if(dist>target+25)await host.keyboard.down(gap>0?'d':'a');else if(dist<target-30)await host.keyboard.down(gap>0?'a':'d');
   if(s.boss.vulnerable){await host.keyboard.press('h');if(s.hero!=='kilo'||s.kiloCombo?.ready)await host.keyboard.press('i');if(s.finisherCharge>=100)await host.keyboard.press('p');}
   if(p.grounded&&!s.boss.vulnerable&&i%3===0)await host.keyboard.down('w');s=await step(12);for(const k of ['d','a','w'])await host.keyboard.up(k);
   assert.equal(s.runtimeFaults,0);if(i%150===0){console.log('COOP_QUIMERA',JSON.stringify({i,hp:s.hp,peer:(await state(guest)).hp,boss:s.boss?.hp,phase:s.boss?.phase,deaths}));await fs.writeFile('test-results/v604/cooperative-campaign/finale-current.json',JSON.stringify({host:s,guest:await state(guest)},null,2));}
  }
  assert.equal(s.world1Won,true,'production combat defeats Quimera');assert.deepEqual([...phases].sort(),[1,2,3,4]);
  for(let i=0;i<120;i++){for(const p of pages){const v=await state(p);if(v.world1Cine)seen.add(v.world1Cine);}await films();if((await Promise.all(pages.map(p=>p.evaluate(()=>finalWinEvents.length)))).every(n=>n===1))break;await step(60,{follow:false});}
  for(const p of pages){assert.equal(await p.evaluate(()=>finalWinEvents.length),1);assert.equal(await p.evaluate(()=>finalWinEvents[0].keepsakes.length),10);assert.equal((await state(p)).world1Cine,null);}
  finale={gauntlet,deaths,phases:[...phases],films:[...seen],results:await Promise.all(pages.map(p=>p.evaluate(()=>({hero:coop._combatGame.player.id,keepsakes:finalWinEvents[0].keepsakes,wins:finalWinEvents.length}))))};
  await fs.writeFile('test-results/v604/cooperative-campaign/complete.json',JSON.stringify({fixture:process.env.OHANA_COOP_FINAL_PROBE==='1'?'prepared chapter seals and fresh final heroes':resumed?'earned checkpoint restored after runtime fix; no gameplay grants':'none; continuous earned campaign',journal,finale,errors},null,2));console.log(process.env.OHANA_COOP_FINAL_PROBE==='1'?'PASS isolated final combat probe: prepared chapter seals; ten real guardians and Quimera':'PASS full cooperative campaign: ten earned chapters, ten guardians, four Quimera phases and shared ending');
 }
 assert.deepEqual(errors,[]);if(!finale)console.log(count===10?'PASS ten physically earned cooperative chapters; final duels remain separate':'PASS cooperative chapter probe '+count);
}catch(error){await fs.mkdir('test-results/v604/cooperative-campaign',{recursive:true});await fs.writeFile('test-results/v604/cooperative-campaign/failure.json',JSON.stringify({error:error.stack,journal,errors,players:await Promise.all(pages.map(p=>p.evaluate(()=>({state:__OHANA_E2E.state(),retry:coop.snapshot?.adventureRetry,queue:coop.pendingMutations.map(m=>({action:m.action,room:m.worldRoomId,kind:m.signalKind})),network:coop.error})).catch(()=>null)))},null,2));throw error;}finally{clearInterval(heartbeat);await browser?.close();await server.close();}
