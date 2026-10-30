// Rendering fixtures inspect actual guardian bodies and authoritative shot
// bands. They never modify a running encounter or award progress.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_BIN||'/usr/bin/chromium'}),dir='test-results/v630';
try{
 await fs.mkdir(dir,{recursive:true});const page=await browser.newPage();
 await page.goto(`http://127.0.0.1:${server.address().port}/gallery.html`);
 const result=await page.evaluate(async()=>{
  const {drawGauntletProjectile}=await import('/systems/final-gauntlet.js');
  const {drawChapterBossV2}=await import('/systems/chapter-boss-art-v2.js');
  const {KEEPSAKES,KEEPSAKE_ORDER}=await import('/systems/keepsakes.js');
  const {buildWorld1Scene,drawWorld1Cine}=await import('/systems/world1-cine.js');
  const {drawFamilyActor}=await import('/systems/family-actor.js');
  const sheet=document.createElement('canvas');sheet.width=2200;sheet.height=1040;const c=sheet.getContext('2d');
  const bodies=[],shots=[];
  for(const [i,hero]of KEEPSAKE_ORDER.entries()){
   const d=KEEPSAKES[hero],x=i%5*440,y=Math.floor(i/5)*520;
   c.fillStyle=i%2?'#223d4e':'#193044';c.fillRect(x,y,440,520);c.save();c.translate(x+220,y+440);
   const e={gauntletBoss:hero,roomId:'w1-final',miniBoss:true,evolved:true,x:-92,y:-224,w:184,h:224,hp:800,max:940,flash:0,[d.key]:{phase:'warn',clock:30,aim:1}};
   const before=JSON.stringify(e);drawChapterBossV2(c,e,{x:0,y:0},73);if(JSON.stringify(e)!==before)throw Error('body mutated '+hero);
   c.restore();c.fillStyle='#fff0cc';c.textAlign='center';c.font='700 17px sans-serif';c.fillText(d.guardian,x+220,y+492);bodies.push({hero,guardian:d.guardian,entityUnchanged:true});
  }
  const beamSheet=document.createElement('canvas');beamSheet.width=1400;beamSheet.height=780;const s=beamSheet.getContext('2d');s.fillStyle='#182e42';s.fillRect(0,0,1400,780);
  const samples=[
   {gauntlet:'lightning',gauntletHero:'chispin',w:58,h:410},
   {gauntlet:'geysers',gauntletHero:'frita',w:96,h:290},
   {gauntlet:'prism',gauntletHero:'yomi',w:650,h:30},
   {gauntlet:'wave',gauntletHero:'kilo',w:47,h:27},
   {gauntlet:'disc',gauntletHero:'pizza',w:44,h:32},
   ...['kilo','stitcho','chispin','cat','cuerno','dragon','yomi'].map(gauntletHero=>({gauntlet:'orb',gauntletHero,w:18,h:18}))
  ];
  for(const [i,sample]of samples.entries()){
   const canvas=document.createElement('canvas');canvas.width=Math.max(200,sample.w+40);canvas.height=Math.max(180,sample.h+40);
   const ctx=canvas.getContext('2d'),pr=Object.freeze({...sample,x:20,y:20,vx:5,vy:0,color:KEEPSAKES[sample.gauntletHero].color});
   const before=JSON.stringify(pr),snapshots=[];
   for(const time of[73,203]){ctx.clearRect(0,0,canvas.width,canvas.height);drawGauntletProjectile(ctx,pr,{x:0,y:0},time,true);snapshots.push(canvas.toDataURL());}
   if(snapshots[0]!==snapshots[1])throw Error('reduced shot still animated '+sample.gauntlet);
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let opaque=0,outside=0;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>24){opaque++;if(x<18||x>22+pr.w||y<18||y>22+pr.h)outside++;}
   shots.push({kind:pr.gauntlet,hero:pr.gauntletHero,entityUnchanged:JSON.stringify(pr)===before,reducedMotionStable:true,opaquePixels:opaque,outsideDangerBandPlus2px:outside});
   if(i===0)s.drawImage(canvas,30,40);else if(i===1)s.drawImage(canvas,210,140);else if(i===2)s.drawImage(canvas,420,70);
   else{const slot=i-3,x=420+(slot%4)*235,y=260+Math.floor(slot/4)*210;s.save();s.translate(x,y);s.scale(3,3);drawGauntletProjectile(s,{...pr,x:0,y:0},{x:0,y:0},73);s.restore();s.fillStyle='#fff0cb';s.font='15px sans-serif';s.fillText(pr.gauntletHero+' · '+pr.gauntlet,x,y+120);}
  }
  const stage=document.createElement('canvas');stage.width=1100;stage.height=760;const actors=[];
  const guardian={gauntletBoss:'kilo',roomId:'w1-final',miniBoss:true,evolved:true,x:9270,y:910,w:184,h:224,hp:800,max:940,_drummer:{phase:'idle',clock:65,aim:-1}};
  const shotsForChoice=buildWorld1Scene('keepsakeIntro','kilo',{fighter:'dino'});
  drawWorld1Cine(stage.getContext('2d'),{reduceMotion:true,finalGauntlet:{guardian},world1Cine:{id:'keepsakeIntro',hero:'kilo',shots:shotsForChoice,i:0,t:80}},1100,760,73,{drawActor:(ctx,hero,x,y,scale,acting)=>{actors.push(hero);return drawFamilyActor(ctx,hero,x,y,scale,73,acting,true);}});
  return {bodies,shots,cinematicActors:actors,bodySheet:sheet.toDataURL().split(',')[1],shotSheet:beamSheet.toDataURL().split(',')[1],invocation:stage.toDataURL().split(',')[1]};
 });
 assert.equal(result.bodies.length,10);
 assert.deepEqual(result.cinematicActors,['dino'],'the opponent owns the memory; the chosen fighter owns the foreground');
 for(const row of result.shots){assert.ok(row.entityUnchanged);assert.ok(row.reducedMotionStable);assert.ok(row.opaquePixels>40);assert.equal(row.outsideDangerBandPlus2px,0,row.hero+' '+row.kind+' cannot paint a false larger danger area');}
 await fs.writeFile(`${dir}/guardian-bodies.png`,Buffer.from(result.bodySheet,'base64'));await fs.writeFile(`${dir}/guardian-attacks.png`,Buffer.from(result.shotSheet,'base64'));
 await fs.writeFile(`${dir}/chosen-dino-invocation.png`,Buffer.from(result.invocation,'base64'));
 await fs.writeFile(`${dir}/guardian-art.json`,JSON.stringify({bodies:result.bodies,shots:result.shots,cinematicActors:result.cinematicActors,scope:'Actual Canvas render fixtures, unchanged entities, reduced-motion and physical shot-band checks; no gameplay progression.'},null,2));
 console.log('PASS ten guardian bodies and twelve shot samples: no state mutation, stable reduced motion and visible danger inside the physical band');
}finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
