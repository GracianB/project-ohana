// CORDILLERA DE LAS BRASAS — Dragón's solo campaign chapter inside the expanded Claro.
// Own interaction gates, ancestral braziers, moving basalt rails, thermal updrafts,
// obsidian blast doors, three acts of volcanic awakening and the Fiery Core Guardian.
// All permanent rewards use Dragón's existing per-hero save.
import {movePlatform,drawPlatformRail} from './moving-platforms.js';
import {DRAGON_BOSS_ID} from './dragon-boss.js';

const SAVE_KEY='dragon-trail-v1';
const FRAGMENT_PREFIX='dragon-ember-';

export const DRAGON_BEACONS=Object.freeze([
 Object.freeze({id:'dragon-gorge',x:440,y:1074,label:'BASALTO',need:0,line:'El brasero de obsidiana enciende la primera llama ancestral.'}),
 Object.freeze({id:'dragon-geysers',x:1720,y:1090,label:'MAGMA',need:2,line:'Las corrientes térmicas despiertan con calor ascendente.'}),
 Object.freeze({id:'dragon-shrine',x:3080,y:1084,label:'CELESTIAL',need:4,line:'¡El Guardián del Núcleo Ígneo despierta en la cúspide del volcán!'})
]);

export const DRAGON_EMBERS=Object.freeze([
 Object.freeze({id:'a',x:540,y:1070}),
 Object.freeze({id:'b',x:820,y:830}),
 Object.freeze({id:'c',x:1480,y:1085}),
 Object.freeze({id:'d',x:2020,y:1080}),
 Object.freeze({id:'e',x:2520,y:1035}),
 Object.freeze({id:'f',x:2870,y:1075}),
 Object.freeze({id:'g',x:3350,y:1075}),
 Object.freeze({id:'h',x:3780,y:1075})
]);

export const DRAGON_UPDRAFTS=Object.freeze([
 Object.freeze({x:980,y:1134,force:16.8,color:'#ff8a50'}),
 Object.freeze({x:2140,y:1134,force:17.5,color:'#ffa562'}),
 Object.freeze({x:2800,y:1134,force:16.8,color:'#ff8a50'})
]);

export const DRAGON_GATES=Object.freeze([
 Object.freeze({x:1500,y:1134,w:65,height:170,offset:0}),
 Object.freeze({x:2550,y:1134,w:65,height:170,offset:68}),
 Object.freeze({x:2830,y:1134,w:65,height:170,offset:136})
]);

export const DRAGON_ACTS=Object.freeze([
 'LA GARGANTA DE OBSIDIANA','LOS RÍOS DE MAGMA','LA CAVERNA DE LAS BRASAS',
 'EL GUARDIÁN DEL NÚCLEO ÍGNEO','EL DRAGÓN CELESTIAL'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterDragonTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='dragon'||g.personalAdventureSolo===false){g.dragonTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(DRAGON_BOSS_ID);
 const index=complete?DRAGON_BEACONS.length:Math.max(0,DRAGON_BEACONS.findIndex(b=>!saved.has(b.id)));
 const lifts=[
  {axis:'x',x:1000,y:940,span:300,period:280},
  {axis:'y',x:1520,y:1080,span:300,period:320},
  {axis:'x',x:2250,y:920,span:340,period:300},
  {axis:'y',x:2800,y:1040,span:420,period:350}
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.75;
  const platform={x:motion.x,y:motion.y,w:190,h:22,_campaignLift:true};
  return {motion,platform};
 });
 for(const item of lifts)if(!g.platforms.includes(item.platform))g.platforms.push(item.platform);
 g.dragonTrail={
  saved,complete,index:index<0?DRAGON_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  gateShorts:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index)
 };
}

export function updateDragonTrail(game,hurtPlayer){
 const s=game.dragonTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;

 // Updraft vents: thermal updraft columns push player smoothly upwards
 for(const vent of DRAGON_UPDRAFTS){
  const cx=vent.x,dx=Math.abs(p.x+p.w/2-cx);
  if(dx<45&&p.y<vent.y&&p.y>vent.y-280){
   p.vy=Math.max(-vent.force,p.vy-0.95);
   p.grounded=false;
   if(game.t%4===0){
    game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:vent.color,count:2,up:4.5,size:4,life:25});
   }
  }
 }

 // Obsidian gates can be superheated / unlocked by fire breath (J) or wing gust (K)
 for(let i=0;i<DRAGON_GATES.length;i++){
  const g=DRAGON_GATES[i];
  if(s.gateShorts[i]>0){s.gateShorts[i]--;continue;}
  const dist=Math.abs(p.x+p.w/2-g.x);
  if(dist<g.w/2+p.w/2&&p.y+p.h>g.y-g.height&&p.y<g.y){
   const usingFire=p._attacking||game._evolutionAttacks?.moves?.some(m=>m.id==='dragon');
   if(usingFire){
    s.gateShorts[i]=240;
    game.nums?.add?.(g.x,g.y-80,'¡IGNICIÓN!','#ff8542',true);
    game.fx?.emit?.(g.x,g.y-60,{color:'#ffd875',count:16,speed:4.5,life:35});
   }else if(hurtPlayer&&!p.invuln){
    hurtPlayer(12,'fire-gate');
    p.vx=-p.facing*5;
    p.vy=-4;
   }
  }
 }

 // Collect embers
 for(const ember of DRAGON_EMBERS){
  const k=FRAGMENT_PREFIX+ember.id;if(s.saved.has(k))continue;
  if(inRange(p,ember.x,ember.y,42)){
   s.saved.add(k);persist(game,k);
   game.score=(game.score||0)+120;
   game.nums?.add?.(ember.x,ember.y-25,'✦ BRASA','#ffd862',true);
   game.fx?.emit?.(ember.x,ember.y,{color:'#ff6a22',count:20,star:true,speed:4,life:45});
  }
 }

 // Light beacons
 for(let i=0;i<DRAGON_BEACONS.length;i++){
  const b=DRAGON_BEACONS[i];if(s.saved.has(b.id))continue;
  const count=[...s.saved].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length;
  if(count>=b.need&&inRange(p,b.x,b.y,55)){
   s.saved.add(b.id);persist(game,b.id);
   s.index=Math.max(s.index,i+1);
   s.banner=180;s.bannerText='¡'+b.label+' ENCENDIDO!';s.bannerSub=b.line;
   s.act=Math.min(3,s.index);
   game.nums?.add?.(b.x,b.y-45,'¡'+b.label+'!','#ffe68a',true);
   game.fx?.emit?.(b.x,b.y-20,{color:'#ff5028',count:45,size:5,up:5,star:true,life:60});
  }
 }

 // Altar interaction at x:3780
 if(!s.complete&&inRange(p,3780,1110,75)){
  const beaconsLit=DRAGON_BEACONS.every(b=>s.saved.has(b.id));
  const bossDead=(game.clearedEncounters?.hub||[]).includes(DRAGON_BOSS_ID);
  if(beaconsLit&&bossDead){
   s.complete=true;s.altarLit=true;persist(game,SAVE_KEY);
   s.banner=260;s.bannerText='¡EL DRAGÓN CELESTIAL DESPIERTA!';s.bannerSub='Has consagrado la Cordillera de las Brasas. La llama es eterna.';
   s.act=4;p._heroHundredBonus='DRAGÓN CELESTIAL';
   game.nums?.add?.(3780,1050,'¡DRAGÓN CELESTIAL!','#ffd862',true);
   game.fx?.emit?.(3780,1060,{color:'#ffcf3a',count:80,size:6,up:6,star:true,life:90});
  }
 }
}

export function drawDragonTrail(ctx,game,cam,t){
 const s=game.dragonTrail;if(!s)return;
 ctx.save();
 const ox=cam?.x||0,oy=cam?.y||0;
 for(const item of s.lifts)drawPlatformRail(ctx,item.platform,item.motion,cam);

 // Thermal updrafts
 for(const vent of DRAGON_UPDRAFTS){
  const x=vent.x-ox,y=vent.y-oy;if(x<-80||x>1700)continue;
  const pulse=Math.sin(t*0.12+vent.x)*0.25+0.75;
  ctx.fillStyle='rgba(255,110,40,0.18)';
  ctx.fillRect(x-35,y-260,70,260);
  ctx.strokeStyle=vent.color;ctx.lineWidth=2;ctx.globalAlpha=pulse*0.8;
  for(let i=0;i<4;i++){
   const waveY=y-240+((t*3+i*60)%240);
   ctx.beginPath();ctx.moveTo(x-24,waveY);ctx.quadraticCurveTo(x,waveY-18,x+24,waveY);ctx.stroke();
  }
  ctx.globalAlpha=1;
  ctx.fillStyle='#2b110e';ctx.fillRect(x-38,y,76,14);
 }

 // Obsidian gates
 for(let i=0;i<DRAGON_GATES.length;i++){
  const g=DRAGON_GATES[i],x=g.x-ox,y=g.y-oy;if(x<-80||x>1700)continue;
  const open=s.gateShorts[i]>0;
  ctx.fillStyle=open?'rgba(255,150,60,0.18)':'rgba(30,12,10,0.92)';
  ctx.strokeStyle=open?'#ffd075':'#ff5522';ctx.lineWidth=3;
  ctx.fillRect(x-g.w/2,y-g.height,g.w,g.height);
  ctx.strokeRect(x-g.w/2,y-g.height,g.w,g.height);
  ctx.fillStyle=open?'#ffe89c':'#ff4218';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
  ctx.fillText(open?'IGNICIÓN':'FUEGO (J)',x,y-g.height/2);
 }

 // Embers
 for(const ember of DRAGON_EMBERS){
  const k=FRAGMENT_PREFIX+ember.id;if(s.saved.has(k))continue;
  const x=ember.x-ox,y=ember.y-oy;if(x<-40||x>1700)continue;
  const bob=Math.sin(t*0.09+ember.x)*4;
  ctx.fillStyle='#ffd862';ctx.strokeStyle='#ff4418';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(x,y-14+bob);ctx.lineTo(x+11,y+bob);ctx.lineTo(x,y+14+bob);ctx.lineTo(x-11,y+bob);ctx.closePath();
  ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,100,20,0.3)';ctx.beginPath();ctx.arc(x,y+bob,16,0,Math.PI*2);ctx.fill();
 }

 // Beacons
 for(const b of DRAGON_BEACONS){
  const x=b.x-ox,y=b.y-oy;if(x<-60||x>1700)continue;
  const lit=s.saved.has(b.id);
  ctx.fillStyle=lit?'#2e1510':'#180806';ctx.strokeStyle=lit?'#ffb35e':'#ff4418';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(x,y-22,26,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle=lit?'#ffe285':'#6d2a1c';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  ctx.fillText(b.label,x,y-18);
  if(lit){
   const fBob=Math.sin(t*0.2+b.x)*3;
   ctx.fillStyle='#ff5020';ctx.beginPath();
   ctx.moveTo(x-10,y-48);ctx.lineTo(x,y-68+fBob);ctx.lineTo(x+10,y-48);ctx.closePath();ctx.fill();
  }
 }

 // Banner
 if(s.banner>0){
  const alpha=Math.min(1,s.banner/30);ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(25,7,5,0.88)';ctx.fillRect(380,80,640,64);
  ctx.strokeStyle='#ff8a50';ctx.lineWidth=2;ctx.strokeRect(380,80,640,64);
  ctx.fillStyle='#ffe9a3';ctx.font='bold 18px Outfit,sans-serif';ctx.textAlign='center';
  ctx.fillText(s.bannerText,700,106);
  ctx.fillStyle='#ffb594';ctx.font='13px sans-serif';ctx.fillText(s.bannerSub,700,128);
 }
 ctx.restore();
}

export function dragonTrailSnapshot(g){
 const s=g.dragonTrail;if(!s)return null;
 return {
  act:s.act,actName:DRAGON_ACTS[s.act]||'',complete:s.complete,
  bossDefeated:s.bossDefeated,beaconsLit:DRAGON_BEACONS.filter(b=>s.saved.has(b.id)).length,
  embersFound:DRAGON_EMBERS.filter(e=>s.saved.has(FRAGMENT_PREFIX+e.id)).length
 };
}

export function dragonAbility(game,player,index){
  // Dragon's hero ability is handled via the thermal updrafts in the trail update;
  // no discrete per-button action needed.
}
