// Isolated Canvas presentation fixtures, not campaign/progression evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';
const server=await startServer(0);let browser;
try{
 browser=await chromium.launch(process.env.CHROMIUM_BIN?{executablePath:process.env.CHROMIUM_BIN}:{});
 const page=await browser.newPage({viewport:{width:1500,height:1560}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__kilo-flight-art',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/fonts.css"><canvas width="1500" height="1560"></canvas><style>body{margin:0}canvas{display:block}</style>'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/__kilo-flight-art`);
 const result=await page.evaluate(async()=>{
  const {drawCharacter}=await import('/characters/draw.js'),{ROSTER}=await import('/characters/roster.js');
  const {useAbility,updateAbilityFx,drawAbilityFx,clearAbilityFx}=await import('/systems/abilities.js');
  await document.fonts.ready;
  const c=document.querySelector('canvas').getContext('2d'),bad=[];let depth=0,fixtures=0;
  for(const key of ['moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','arc','translate','rotate','scale','roundRect']){
   const fn=c[key].bind(c);c[key]=(...args)=>{if(args.some(v=>typeof v==='number'&&!Number.isFinite(v)))bad.push(key);return fn(...args);};
  }
  const save=c.save.bind(c),restore=c.restore.bind(c);c.save=()=>{depth++;save();};c.restore=()=>{depth--;restore();};
  const hero=ROSTER.find(h=>h.id==='kilo'),states=['idle','jump','field','flight','duet','aloha'];
  function paint(form,state,reduced,x,y){
   clearAbilityFx();const f=hero.forms[form],p={...f,id:'kilo',evo:form,x:x-f.w/2,y:y-f.h,w:f.w,h:f.h,facing:1,vx:0,vy:0,grounded:true,health:f.hp||150,maxHealth:f.hp||150,abilities:hero.abilities,cds:{},cdDur:{},_introForceCanvas:true};
   const g={player:p,t:60,roomId:'w1-kilo',cam:{x:0,y:0},enemies:[],projectiles:[],ghosts:[],platforms:[],nums:{add(){}},fx:{emit(){}},worldW:14400,worldH:1260,reduceMotion:reduced};
   if(state==='jump'){p.grounded=false;p.vy=-5;}
   if((state==='field'||state==='flight')&&form>0){g.t=0;useAbility(g,1);for(let i=0;i<(state==='flight'?400:40);i++){g.t++;updateAbilityFx(g);}if(state==='flight'&&form<4){p._kiloFlightT=60;p._kiloFlightMode='hover';}p._poseOverride='glide';}
   if(state==='duet'){p._kiloDuetT=90;p._kiloDuetAge=72;p._kiloDuet=true;}
   if(state==='aloha'&&form>=2){g.t=0;useAbility(g,2);for(let i=0;i<40;i++){g.t++;updateAbilityFx(g);}}
   drawAbilityFx(c,g,g.t);drawCharacter(c,p,g.cam,g.t,{reduceMotion:reduced});fixtures++;
   if(depth!==0)throw Error('Canvas stack leak '+form+'/'+state+'/'+reduced+': '+depth);
  }
  // First verify both motion modes, including all five anatomical renderers.
  for(const reduced of [false,true])for(let row=0;row<states.length;row++)for(let form=0;form<5;form++){
   c.clearRect(0,0,1500,1560);paint(form,states[row],reduced,150,210);
  }
  c.fillStyle='#eff3e4';c.fillRect(0,0,1500,1560);c.font='600 25px sans-serif';c.fillStyle='#294c44';c.fillText('KILO · vuelo, alcance y profundidad',32,40);
  for(let row=0;row<states.length;row++)for(let form=0;form<5;form++){
   const x=15+form*300,y=68+row*247;c.fillStyle='#dde7d2';c.beginPath();c.roundRect(x,y,280,229,14);c.fill();
   c.fillStyle='#34584d';c.font='600 13px sans-serif';c.fillText('FORMA '+(form+1)+' · '+states[row].toUpperCase(),x+12,y+22);
   if(form===0&&['field','flight','aloha'].includes(states[row])){c.font='11px sans-serif';c.fillText('Poder aún bloqueado',x+12,y+41);}
   paint(form,states[row],false,x+140,y+194);
  }
  clearAbilityFx();return {fixtures,nonfinite:bad,canvasDepth:depth};
 });
 assert.deepEqual(result.nonfinite,[]);assert.equal(result.canvasDepth,0);assert.deepEqual(errors,[]);
 await fs.mkdir('test-results/v606',{recursive:true});await page.screenshot({path:'test-results/v606/kilo-flight-five-forms.png'});
 await fs.writeFile('test-results/v606/kilo-flight-art.json',JSON.stringify({...result,errors,scope:'isolated Canvas presentation; no gameplay acceptance claimed'},null,2));
 console.log('PASS Kilo flight Canvas: '+result.fixtures+' fixtures, five forms, both motion modes; finite geometry and balanced state');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
