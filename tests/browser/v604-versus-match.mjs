import assert from'node:assert/strict';import fs from'node:fs/promises';import{chromium}from'playwright';import{startMultiplayerServer}from'../../tools/local-multiplayer-server.mjs';
const s=await startMultiplayerServer();let browser;
try{browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||chromium.executablePath(),args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});const contexts=[await browser.newContext({viewport:{width:1440,height:900}}),await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})],pages=await Promise.all(contexts.map(c=>c.newPage())),errors=[];for(const p of pages)p.on('pageerror',e=>{errors.push(e.message);console.error('RUNTIME',e.message);});const[h,g]=pages;
 await h.goto(s.url+'/multiplayer.html');await h.locator('#room-mode').selectOption('versus');await h.locator('#room-arena').selectOption('w1-kilo');await h.getByRole('button',{name:'Crear sala',exact:true}).click();await h.waitForFunction(()=>/^[A-HJ-NP-Z2-9]{6}$/.test(document.querySelector('#room-code').textContent.trim()));const code=(await h.locator('#room-code').innerText()).trim();await h.getByRole('button',{name:'Seleccionar a Dino',exact:true}).click();await h.locator('#confirm-character').click();await g.goto(s.url+'/multiplayer.html');await g.locator('#room-input').fill(code);await g.getByRole('button',{name:'Unirse',exact:true}).click();await g.getByRole('button',{name:'Seleccionar a Chispín',exact:true}).click();await g.locator('#confirm-character').click();
 for(const p of pages){await p.waitForURL(/versus.html/);await p.waitForFunction(()=>document.querySelectorAll('.fighter').length===2);await p.waitForFunction(()=>document.querySelector('#connection').textContent==='Conectado');}
 const session=await h.evaluate(()=>JSON.parse(sessionStorage.getItem('ohana-coop-session')));
 const read=async()=> (await s.service.poll(code,session.identity)).versus;
 async function defend(key){if(await g.locator('#results').isVisible())return;try{await g.locator('[data-key="'+key+'"]').tap({timeout:750});}catch(error){if(!await g.locator('#results').isVisible())throw error;}}
 let v=await read();assert.deepEqual(v.actors.map(a=>[a.evo,a.xp]),[[0,0],[0,0]]);
 const forms=new Set([0]),knockouts=new Set(),respawns=new Set(),kills=new Set([0]);let previous=v,axis=0;
 await h.locator('#arena').focus();
 for(let i=0;i<1000&&v.phase!=='complete';i++){
  const a=v.actors[0],rival=v.actors[1];forms.add(a.evo);kills.add(v.fighters[a.id].kills);
  if(previous.actors[1].hp>0&&rival.hp<=0)knockouts.add(v.fighters[a.id].kills);
  if(previous.actors[1].hp<=0&&rival.hp>0)respawns.add(v.fighters[a.id].kills);
  const creatures=v.foes.filter(e=>e.hp>0&&e.campaignRole!=='flyer').sort((x,y)=>Math.abs(x.x-a.x)-Math.abs(y.x-a.x));
  const target=a.xp<190||rival.hp<=0?creatures[0]:rival,dx=(target?.x??rival.x)-a.x,next=Math.abs(dx)>100?Math.sign(dx):0;
  if(next!==axis){await h.keyboard.up('a');await h.keyboard.up('d');if(next)await h.keyboard.down(next>0?'d':'a');axis=next;}
  if(a.hp>0){await h.keyboard.press('j');await h.keyboard.press('h');if(a.evo>=2&&i%3===0)await h.keyboard.press('l');if(i%30===0)await h.keyboard.press('u');}
  // The second browser defends through production touch controls.
  if(rival.hp>0&&Math.abs(rival.x-a.x)<750&&i%3===0){await defend('j');if(i%9===0)await defend('h');}
  previous=v;await h.waitForTimeout(200);v=await read();
  if(i%40===0)console.log('BROWSER_VERSUS',JSON.stringify({i,tick:v.tick,host:{hp:v.actors[0].hp,xp:v.actors[0].xp,evo:v.actors[0].evo,kills:v.fighters[a.id].kills},guest:{hp:v.actors[1].hp,kills:v.fighters[rival.id].kills}}));
 }
 await h.keyboard.up('a');await h.keyboard.up('d');if(v.actors[1].hp<=0)knockouts.add(v.fighters[v.actors[0].id].kills);
 assert.equal(v.phase,'complete','ordinary browser controls finish the match');assert.equal(v.winner,session.identity.playerId);assert.equal(v.fighters[v.winner].kills,3);assert.ok(forms.size>=3,'XP earns at least three forms');assert.ok(respawns.size>=2,'two ordinary respawns before the third elimination');
 for(const p of pages){await p.locator('#results').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>document.activeElement.id),'return-lobby','result offers an immediate keyboard exit');}assert.equal(await h.locator('#results h1').innerText(),'¡Has ganado!');assert.equal(await g.locator('#results h1').innerText(),'Fin de la partida');assert.equal(await h.locator('#results p').innerText(),await g.locator('#results p').innerText());
 const stable=await read();await h.keyboard.press('j');await h.waitForTimeout(500);const stopped=await read();assert.equal(stopped.tick,stable.tick);assert.deepEqual(stopped.fighters,stable.fighters);
 await fs.mkdir('test-results/v604',{recursive:true});await h.screenshot({path:'test-results/v604/versus-match-desktop.png'});await g.screenshot({path:'test-results/v604/versus-match-mobile.png'});assert.deepEqual(errors,[]);
 await g.keyboard.press('Enter');await g.waitForURL(/multiplayer.html/);assert.equal(await g.evaluate(()=>sessionStorage.getItem('ohana-coop-session')),null);await g.locator('#entry').waitFor({state:'visible'});assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/v604/versus-match.json',JSON.stringify({arena:v.arenaId,forms:[...forms],knockouts:[...knockouts],respawns:[...respawns],result:await h.locator('#results p').innerText(),actors:v.actors.map(a=>({hero:a.characterId,hp:a.hp,xp:a.xp,evo:a.evo,...v.fighters[a.id]})),returnsToFreshLobby:true,errors},null,2));
 console.log('PASS full two-browser Versus match: earned evolution, three eliminations, two respawns, matching stable results; mobile opponent uses real touch controls');
}finally{await browser?.close();await s.close();}
