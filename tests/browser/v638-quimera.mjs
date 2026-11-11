// Deterministic artwork/collision fixtures plus direct final-arena integration.
// Synthetic saved access and HP fixtures are NOT an earned campaign victory.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
import {selectFinalFighter} from './final-ritual-controls.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'}),dir='test-results/v638';
try{
 await fs.mkdir(dir,{recursive:true});const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/gallery.html`);
 const fixtures=await page.evaluate(async()=>{
  const F=await import('/systems/fusion-boss.js'),D=await import('/systems/world1-boss.js'),{drawQuimeraCreature}=await import('/systems/quimera-art.js');
  const {WORLD1_FLOOR:floor}=await import('/systems/world1-rooms.js');
  const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const sheet=canvas(1600,1040),s=sheet.getContext('2d'),signatures=[],purity=[],motion=[],hitBands=[];
  for(let phase=1;phase<=4;phase++)for(const [j,mode]of['rest','warn','attack','charge','leap'].entries()){
   const e=F.createFusionBoss(638);e.phase=phase;e.hp=1500;e._fusion.mode=mode;e._fusion.attack='aliento';e._fusion.clock=mode==='warn'?25:40;e._fusion.warnMax=78;
   const before=JSON.stringify(e),tile=canvas(400,400),c=tile.getContext('2d');c.translate(200,363);c.scale(.9,.9);
   e.x=-e.w/2;e.y=-e.h;const localBefore=JSON.stringify(e);drawQuimeraCreature(c,e,{x:0,y:0},73,false);purity.push(localBefore===JSON.stringify(e));
   const p0=tile.toDataURL();if(j===0)signatures.push(p0);
   const snapshots=[];for(const t of[73,203]){c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,400,400);c.restore();drawQuimeraCreature(c,e,{x:0,y:0},t,true);snapshots.push(tile.toDataURL());}
   motion.push(snapshots[0]===snapshots[1]);
   if(j<2){const x=(phase-1)*400,y=j*520;s.fillStyle=phase%2?'#131e32':'#1b263a';s.fillRect(x,y,400,520);s.drawImage(tile,x,y+70);s.fillStyle='#f5d8a3';s.font='700 19px sans-serif';s.fillText(`FASE ${phase} · ${j?'ALIENTO':'NÚCLEO ABIERTO'}`,x+20,y+34);}
  }
  const attacks=canvas(1800,3000),a=attacks.getContext('2d'),report=[];
  for(const [i,id]of Object.keys(F.FUSION_ATTACKS).entries()){
   const e=F.createFusionBoss(638),b=e._fusion,p={x:e.x-430,y:floor-48,w:32,h:48,grounded:true},g={player:p,boss:e,reduceMotion:false};
   b.mode='rest';b.rest=1;b.deck=[id];b.deckPhase=1;F.updateFusionBoss(e,g);const cam={x:e.x-1050,y:floor-430};
   for(const [j,mode]of ['warn','active'].entries()){
    if(j){for(let k=0;k<110&&b.mode==='warn';k++)F.updateFusionBoss(e,g);for(let k=0;k<20;k++)F.updateFusionBoss(e,g);}
    const x=j*900,y=i*300;a.save();a.beginPath();a.rect(x,y,900,300);a.clip();a.fillStyle='#142135';a.fillRect(x,y,900,300);a.translate(x,y+20);a.scale(.58,.58);
    a.fillStyle='#586576';a.fillRect(-100,430,1800,12);
    F.drawFusionBoss(a,e,cam,73,false);D.drawWorld1BossTelegraphs(a,g,cam,73);a.restore();
    a.fillStyle='#fff0cf';a.font='700 16px sans-serif';a.fillText(F.FUSION_ATTACKS[id].name+' · '+mode,x+18,y+22);
   }
   report.push({id,projectiles:b.shots.length,mode:b.mode});
  }
  for(const shot of [{k:'bolt',x:200,r:34,life:17},{k:'geyser',x:200,r:34,life:43},{k:'beam',x:200,r:0,band:floor-130,life:40,liveFor:50}]){
   const c=canvas(500,1200),ctx=c.getContext('2d'),offset=shot.k==='beam'?7000:0;F.drawFusionProjectiles(ctx,{shots:[shot]},{x:offset,y:0},73,true);
   const box=F.fusionShotBounds(shot),pixels=ctx.getImageData(0,0,500,1200).data;let count=0,outside=0;
   for(let y=0;y<1200;y++)for(let x=0;x<500;x++)if(pixels[(y*500+x)*4+3]>24){count++;if(x<box.x-offset-1||x>box.x-offset+box.w+1||y<box.y-1||y>box.y+box.h+1)outside++;}
   hitBands.push({kind:shot.k,count,outside});
  }
  return {sheet:sheet.toDataURL().split(',')[1],attacks:attacks.toDataURL().split(',')[1],purity,motion,distinct:new Set(signatures).size,hitBands,report};
 });
 assert.ok(fixtures.purity.every(Boolean));assert.ok(fixtures.motion.every(Boolean));assert.equal(fixtures.distinct,4);
 for(const b of fixtures.hitBands){assert.ok(b.count>500);assert.equal(b.outside,0,b.kind);}
 await fs.writeFile(`${dir}/quimera-four-phases.png`,Buffer.from(fixtures.sheet,'base64'));
 await fs.writeFile(`${dir}/quimera-ten-attacks.png`,Buffer.from(fixtures.attacks,'base64'));
 const integration=[];
 for(const [width,height]of [[1280,900],[390,844],[320,700]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500});
  const game=await context.newPage();game.on('pageerror',e=>errors.push(e.message));
  await game.goto(`http://127.0.0.1:${server.address().port}/?e2e=1`);await game.locator('.oi-enter').click();
  await game.evaluate(async()=>{
   localStorage.clear();const {WORLD1_ORDER}=await import('/systems/world1-rooms.js');
   localStorage.setItem('ohana-w1-seals-v1',JSON.stringify(WORLD1_ORDER));localStorage.setItem('ohana-keepsakes-v1',JSON.stringify(WORLD1_ORDER));
   const e=window.__OHANA_E2E;e.startWorld1('kilo');e.manualClock(true);e.loadRoom('w1-final');e.setPlayer(7300,1000);e.step(5);
  });
  for(let i=0;i<25;i++){
   await selectFinalFighter(game,'kilo');await game.keyboard.press('Enter');
   await game.evaluate(()=>{const e=window.__OHANA_E2E;e.setInvulnerable(600);e.step(100);});
   const s=await game.evaluate(()=>window.__OHANA_E2E.state());if(s.boss&&!s.world1Cine&&!s.pendingWorld1Cine)break;
  }
  for(const [index,hp]of[2800,1800,1000,400].entries()){
   let state=await game.evaluate(hp=>{const e=window.__OHANA_E2E;e.setInvulnerable(600);e.setBossHp(hp);e.step(540);const s=e.state();if(s.boss)e.setPlayer(s.boss.x-300,1000);return e.step(5);},hp);
   assert.ok(state.boss,'final boss must be active in the production arena');assert.equal(state.boss.phase,index+1);assert.equal(state.runtimeFaults,0);
   await game.keyboard.down('d');await game.keyboard.down('w');await game.evaluate(()=>window.__OHANA_E2E.step(12));await game.keyboard.up('w');await game.keyboard.up('d');
   if(width<500){
    const framing=await game.evaluate(async()=>{
     const s=window.__OHANA_E2E.state(),{quimeraCameraZoom}=await import('/systems/world1-boss.js');
     const z=quimeraCameraZoom({boss:{...s.boss,w:230,_fusionBoss:true},player:s.player},innerWidth);
     return {left:(s.boss.x+115-235-s.camera.x)*z,right:(s.boss.x+115+235-s.camera.x)*z,player:(s.player.x+s.player.w/2-s.camera.x)*z};
    });
    assert.ok(framing.left>=-8&&framing.right<=width+8,'boss wing tips fit mobile: '+JSON.stringify(framing));
    assert.ok(framing.player>12&&framing.player<width-12,'player stays visible');
   }
   await game.screenshot({path:`${dir}/arena-${width}-phase-${index+1}.png`});
   assert.ok(await game.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));integration.push({width,phase:index+1,runtimeFaults:state.runtimeFaults});
  }
  assert.match(await game.locator('#world1-quimera-a11y').innerText(),/Fase 4 de 4/);await context.close();
 }
 assert.deepEqual(errors,[]);delete fixtures.sheet;delete fixtures.attacks;
 await fs.writeFile(`${dir}/quimera-validation.json`,JSON.stringify({fixtures,integration,errors,scope:'Direct art/combat fixtures with synthetic saved access and boss HP fixtures. Not an earned full-campaign victory.'},null,2));
 console.log('PASS Quimera: four anatomical phases, ten warning/attack pairs, motion/purity, exact column damage bands and desktop/mobile production arena');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
