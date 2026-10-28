// Isolated real Canvas fixtures: rendering evidence, never earned gameplay.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1800,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__stitcho-art',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/fonts.css"><canvas width="1800" height="1000"></canvas><style>body{margin:0}canvas{display:block}</style>'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/__stitcho-art`);
 await fs.mkdir('test-results/v607',{recursive:true});
 const setup=await page.evaluate(async()=>{
  const art=await import('/systems/stitcho-chapter-art-v607.js');
  const {drawCampaignCreature}=await import('/systems/campaign-creature-art.js');
  const {drawChapterBossV2}=await import('/systems/chapter-boss-art-v2.js');
  await document.fonts.ready;
  const c=document.querySelector('canvas').getContext('2d'),bad=[];let depth=0,fixtures=0;
  for(const key of ['moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','arc','translate','rotate','scale','roundRect']){
   const fn=c[key].bind(c);c[key]=(...args)=>{if(args.some(v=>typeof v==='number'&&!Number.isFinite(v)))bad.push(key);return fn(...args);};
  }
  const save=c.save.bind(c),restore=c.restore.bind(c);c.save=()=>{depth++;save();};c.restore=()=>{depth--;restore();};
  function paint(fn){const before=depth;fn();fixtures++;if(depth!==before)throw Error('Canvas stack leak at fixture '+fixtures+': '+depth);}
  const kinds=['ufo','phosquito','cucaracho','arana','murcielago'];
  function foe(kind,state,x,y,reduced){
   const flyer=['ufo','phosquito','murcielago'].includes(kind),role=flyer?'flyer':kind==='arana'?'jumper':'shield';
   const e={roomId:'w1-stitcho',roomPersona:{stitchoEncounter:true},kind,campaignRole:role,x:x-32,y:y-74,w:64,h:74,vx:state==='active'?3:1,max:100,hp:state==='hurt'?62:100,flash:state==='hurt'?8:0,_campaign:{wind:state==='warn'?22:0,active:state==='active'?16:0,aim:1}};
   paint(()=>{if(!drawCampaignCreature(c,e,{x:0,y:0},83,reduced))throw Error('Fauna dispatch failed '+kind);});
  }
  function guardian(phase,attack,tier,x,y,reduced){
   const e={roomId:'w1-stitcho',miniBoss:true,_stitchoBoss:true,_stitchoGuardianV607:true,x:x-92,y:y-188,w:184,h:188,hp:400,max:780,_glitch:{phase,attack,tier,clock:18,warnMax:60,aim:1}};
   paint(()=>{if(!drawChapterBossV2(c,e,{x:0,y:0},83,reduced))throw Error('Guardian dispatch failed');});
  }
  // Both accessibility modes, actual combat states and all three phases.
  for(const reduced of [false,true]){
   for(const kind of kinds)for(const state of ['idle','warn','active','hurt'])foe(kind,state,200,230,reduced);
   for(const tier of [1,2,3])for(const phase of ['waiting','intro','step','warn','attack','rest'])for(const attack of [0,1,2])guardian(phase,attack,tier,500,300,reduced);
   for(let id=0;id<3;id++)for(const state of ['locked','released','carried','done']){
    const s={id,kind:'part',x:300,y:290,target:{x:530,y:290},released:state!=='locked',done:state==='done'};
    paint(()=>art.drawStitchoWorkshop(c,s,{x:0,y:0},83,{reduced,active:true,carried:state==='carried',label:['Celda de fusión','Giroscopio de navegación','Turbina del hogar'][id],caption:'J · REPARA EL ASTILLERO'}));
    paint(()=>art.drawStitchoCarriedPart(c,id,200,190,83,reduced));
   }
   for(let count=0;count<4;count++)paint(()=>art.drawStitchoShip(c,{roomId:'w1-stitcho',roomDef:{stitchoEncounterVersion:607},world1:{stations:[0,1,2].map(i=>({done:i<count}))}},{x:11620,y:760},83,reduced));
  }
  const elsewhere={roomId:'w1-kilo',roomPersona:{stitchoEncounter:true},campaignRole:'flyer',kind:'ufo'};
  if(art.drawStitchoCreature(c,elsewhere,{x:0,y:0},0)!==false)throw Error('Fauna escaped its room');
  if(art.drawStitchoGuardian(c,{roomId:'w1-stitcho',gauntletBoss:'stitcho',_stitchoGuardianV607:true},{x:0,y:0},0)!==false)throw Error('Guardian replaced gauntlet');
  function canvas(title){c.clearRect(0,0,1800,1000);c.fillStyle='#122d43';c.fillRect(0,0,1800,1000);c.font='600 28px Outfit,sans-serif';c.fillStyle='#d7efde';c.fillText(title,30,40);}
  function panel(x,y,w,h,title){c.fillStyle='#1e4258';c.beginPath();c.roundRect(x,y,w,h,13);c.fill();c.fillStyle='#d5e6d7';c.font='600 14px Outfit,sans-serif';c.fillText(title,x+14,y+24);}
  window.__stitchoArt={fauna(){canvas('ASTILLERO · cinco anatomías, señales y movimiento');
   const labels=['PLATILLO VIGÍA','MOSQUITO BATERÍA','ESCARABAJO BLINDADO','ARAÑA DE MANTENIMIENTO','MURCIÉLAGO ROBÓTICO'];
   for(let col=0;col<5;col++)for(let row=0;row<4;row++){
    const x=15+col*360,y=65+row*230,state=['idle','warn','active','hurt'][row];panel(x,y,340,212,labels[col]+' · '+state.toUpperCase());
    c.save();c.translate(x+170,y+170);c.scale(1.7,1.7);foe(kinds[col],state,0,0,false);c.restore();
   }
  },guardian(){canvas('NÚCLEO GLITCH · compuertas, herramientas y tres fases');
   const cases=[['waiting',0,1],['warn',0,1],['warn',1,2],['warn',2,2],['attack',2,3],['rest',0,3]];
   for(let i=0;i<cases.length;i++){
    const x=15+(i%3)*600,y=65+Math.floor(i/3)*450,[phase,attack,tier]=cases[i];panel(x,y,580,432,phase.toUpperCase()+' · TÉCNICA '+(attack+1)+' · FASE '+tier);
    c.save();c.translate(x+290,y+355);c.scale(1.4,1.4);guardian(phase,attack,tier,0,0,false);c.restore();
   }
  },workshops(){canvas('LA NAVE DEL HOGAR · piezas físicas y destinos reconocibles');
   for(let id=0;id<3;id++){
    const x=15+id*600;panel(x,65,580,420,['CELDA DE FUSIÓN','GIROSCOPIO DE NAVEGACIÓN','TURBINA DEL HOGAR'][id]);
    paint(()=>art.drawStitchoWorkshop(c,{id,kind:'part',x:x+145,y:350,target:{x:x+435,y:350},released:true},{x:0,y:0},83,{active:true,label:['Celda de fusión','Giroscopio de navegación','Turbina del hogar'][id],caption:'LLEVA EL MÓDULO HASTA SU PUERTO'}));
    paint(()=>art.drawStitchoCarriedPart(c,id,x+290,420,83,false));
   }
   for(let count=0;count<4;count++){
    const x=15+count*450;panel(x,510,430,450,'NAVE · '+count+'/3 SISTEMAS');
    c.save();c.translate(x+215,860);c.scale(1.3,1.3);paint(()=>art.drawStitchoShip(c,{roomId:'w1-stitcho',roomDef:{stitchoEncounterVersion:607},world1:{stations:[0,1,2].map(i=>({done:i<count}))}},{x:12020,y:1134},83,false));c.restore();
   }
  },result(){return {fixtures,nonfinite:bad,canvasDepth:depth};}};
  return {fixtures,nonfinite:bad,canvasDepth:depth};
 });
 assert.deepEqual(setup.nonfinite,[]);assert.equal(setup.canvasDepth,0);
 for(const scene of ['fauna','guardian','workshops']){
  await page.evaluate(scene=>window.__stitchoArt[scene](),scene);
  await page.screenshot({path:`test-results/v607/stitcho-v607-${scene}.png`});
 }
 const result=await page.evaluate(()=>window.__stitchoArt.result());
 assert.deepEqual(result.nonfinite,[]);assert.equal(result.canvasDepth,0);assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/v607/stitcho-art.json',JSON.stringify({...result,errors,scope:'isolated Canvas fixtures; not physical campaign acceptance'},null,2));
 console.log('PASS Stitcho V607 Canvas: '+result.fixtures+' fixtures, five body plans, guardian phases, modules, carried parts and four ship repairs; finite geometry and balanced state');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
