import {KILO_CHAPTER_BOSS_ID} from './kilo-chapter.js';
import {readCombatDifficulty} from './combat-difficulty.js';
export const GROVE_GUARDIAN={hp:360,width:100,height:76,left:3050,right:3730};
export function initGroveGuardian(e){
 if(!e.roomPersona?.special||e.roomPersona.name!=='Tambor del Claro')return;
 const feet=e.y+48;e.w=100;e.h=76;e.y=feet-e.h;e.hp=e.max=360;e.miniBoss=true;e._encounterSaveId=e.roomPersona.encounterId||'hub-tambor-v1';
 e._groveArena=e.roomPersona.arena||{...GROVE_GUARDIAN,floor:1134};
 e._drummer={phase:'waiting',timer:0,pattern:0,aim:1,round:1};
 if(e._encounterSaveId===KILO_CHAPTER_BOSS_ID){e.w=180;e.h=176;e.y=feet-e.h;e.hp=e.max=540;e.damageTakenScale=0;e.damageWindowRemaining=0;e._kiloGuardianV606=true;Object.assign(e._drummer,{turn:0,sleepPause:0});}
}
export function groveAerialVolley(e,p){
 if(e._encounterSaveId!==KILO_CHAPTER_BOSS_ID||p.y+p.h/2>e.y+e.h/2-100)return null;
 const angle=Math.atan2(p.y+p.h/2-(e.y+e.h*.45),p.x+p.w/2-(e.x+e.w/2));
 return [-.18,0,.18].map(offset=>({vx:Math.cos(angle+offset)*5.2,vy:Math.sin(angle+offset)*5.2}));
}
// This encounter owns its clock and damage opening. The generic V2 wrapper
// must never replenish a window after a projectile spent it on its first frame.
export const KILO_GUARDIAN_RHYTHMS=Object.freeze({
 easy:Object.freeze({warn:82,rest:110,window:190,step:1.6,wave:5.2,charge:7.2,shot:5.0}),
 normal:Object.freeze({warn:58,rest:82,window:150,step:2.5,wave:6.8,charge:9.4,shot:6.2}),
 hard:Object.freeze({warn:44,rest:66,window:140,step:3.1,wave:7.8,charge:11.2,shot:7.0})
});
const KILO_TAU=Math.PI*2;
const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
function chapterRhythm(g){const d=g.combatDifficulty||readCombatDifficulty('w1-kilo');return d.budget<=1?KILO_GUARDIAN_RHYTHMS.easy:d.budget>=4?KILO_GUARDIAN_RHYTHMS.hard:KILO_GUARDIAN_RHYTHMS.normal;}
function chapterShot(e,g,vx,vy,{wave=false}={}){
 if((g.projectiles?.length||0)>=160)return;
 (g.projectiles||=[]).push({x:e.x+e.w/2,y:wave?e._groveArena.floor-21:e.y+e.h*.35,
  w:wave?30:16,h:wave?18:16,vx,vy,life:240,dmg:wave?18:16,
  owner:'enemy',shape:'orb',color:wave?'#e8c28c':'#a3d9bd',kiloGuardian:wave?'ground':'seed'});
}
function chapterFan(e,g,shift=0){
 const a=e._drummer,r=a.rhythm,offsets=r===KILO_GUARDIAN_RHYTHMS.hard?[-.44,-.22,0,.22,.44]:[-.38,0,.38];
 // The target and fan are frozen at warning time. A moving player can take
 // one of the two generous gaps; no seed follows them after launch.
 for(const offset of offsets){const angle=a.volleyAngle+offset+shift;chapterShot(e,g,Math.cos(angle)*r.shot,Math.sin(angle)*r.shot);}
}
function chapterWarn(e,g){
 const a=e._drummer,p=g.player,arena=e._groveArena,r=a.rhythm;
 a.turn++;a.pattern=(a.turn-1)%3;
 a.airTarget=p.y+p.h<arena.floor-110;
 if(a.pattern===1&&a.airTarget)a.pattern=2;
 a.aim=Math.sign(p.x+p.w/2-(e.x+e.w/2))||a.aim||1;
 a.targetX=p.x+p.w/2+clamp((p.vx||0)*8,-65,65);a.targetY=p.y+p.h/2;
 a.chargeStartX=e.x;a.chargeEndX=clamp(a.targetX-e.w/2+a.aim*80,arena.left,arena.right-e.w);
 a.volleyAngle=Math.atan2(a.targetY-(e.y+e.h*.35),a.targetX-(e.x+e.w/2));
 a.aerialVolley=a.pattern===2||a.airTarget?[{vx:Math.cos(a.volleyAngle)*r.shot,vy:Math.sin(a.volleyAngle)*r.shot}]:null;
 a.warnMax=Math.max(34,r.warn-(a.round===2?8:0));a.phase='warn';a.timer=a.warnMax;a.sleepPause=0;
 e.damageWindowRemaining=0;e.damageTakenScale=0;
}
function chapterRest(e){
 const a=e._drummer;a.phase='rest';a.timer=a.rhythm.rest;a.sleepPause=0;
 e.vx=0;e.damageWindowRemaining=a.rhythm.window;e.damageTakenScale=1;
}
function updateChapterGuardian(e,g,hurt){
 const p=g.player,a=e._drummer,arena=e._groveArena;if(!p||p.dead)return true;
 a.rhythm=chapterRhythm(g);a.round=e.hp<=e.max*.5?2:1;
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1000)&&e.y+e.h>g.cam.y&&e.y<g.cam.y+(g.viewH||720),
  dx=p.x+p.w/2-(e.x+e.w/2);
 if(e.invuln>0)e.invuln--;
 // One short pause per phase preserves companion control without allowing
 // repeated sleep/stagger to freeze an armoured warning indefinitely.
 if(e.sleep>0&&a.sleepPause<12){e.sleep--;a.sleepPause++;e.vx=0;e.telegraph=false;return true;}
 e.sleep=0;e.stun=Math.min(e.stun||0,2);e.vx=0;e.telegraph=false;e.wind=0;e.lunge=0;
 if(a.phase==='waiting'){
  a.notes=g.world1?.stations?.filter(s=>s.done).length??4;
  if(a.notes>=4&&(p.evo??4)>=4&&visible&&Math.abs(dx)<880){a.phase='intro';a.timer=66;a.sleepPause=0;g.nums?.add?.(e.x,e.y-45,'TAMBOR DEL CLARO · ESCUCHA Y RESPONDE','#ffe6a0',true);}
 }else if(a.phase==='intro'){
  if(--a.timer<=0){a.phase='step';a.timer=90;a.sleepPause=0;}
 }else if(a.phase==='step'){
  // Close a useless long-range gap BEFORE committing the warning. The charge
  // never turns to chase a player who moved after the warning began.
  const dir=Math.sign(dx)||1;
  if(Math.abs(dx)>580)e.vx=dir*a.rhythm.step;
  if((Math.abs(dx)<=580||--a.timer<=0)&&visible&&e.aiAttackPermit!==false)chapterWarn(e,g);
 }else if(a.phase==='warn'){
  e.telegraph=true;e.wind=a.timer;
  if(--a.timer<=0){
   a.phase='strike';a.attacksExecuted=(a.attacksExecuted||0)+1;a.elapsed=0;a.sleepPause=0;e.telegraph=false;
   a.timer=a.pattern===1?Math.max(30,Math.ceil(Math.abs(a.chargeEndX-e.x)/a.rhythm.charge)+16):a.round===2?64:46;
   if(a.pattern===0){chapterShot(e,g,a.aim*a.rhythm.wave,0,{wave:true});if(a.airTarget)chapterFan(e,g);}
   if(a.pattern===2)chapterFan(e,g);
  }
 }else if(a.phase==='strike'){
  a.elapsed=(a.elapsed||0)+1;e.lunge=a.timer;
  if(a.pattern===1){
   const left=a.chargeEndX-e.x;
   if(left*a.aim>0)e.vx=a.aim*Math.min(Math.abs(left),a.rhythm.charge);
   if(a.round===2&&a.elapsed===Math.max(1,Math.ceil(Math.abs(a.chargeEndX-a.chargeStartX)/a.rhythm.charge)))chapterShot(e,g,a.aim*a.rhythm.wave,0,{wave:true});
  }
  if(a.round===2&&a.elapsed===26){if(a.pattern===0)chapterShot(e,g,a.aim*a.rhythm.wave*.87,0,{wave:true});if(a.pattern===2)chapterFan(e,g,.13*a.aim);}
  if(Math.abs(dx)<(p.w+e.w)/2&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<(p.h+e.h)/2)hurt(22,'¡SALTA EL REDOBLE!');
  if(--a.timer<=0)chapterRest(e);
 }else if(a.phase==='rest'){
  if(--a.timer<=0||e.damageWindowRemaining<=0){a.phase='step';a.timer=90;a.sleepPause=0;e.damageWindowRemaining=0;}
 }
 e.damageTakenScale=a.phase==='rest'&&e.damageWindowRemaining>0?1:0;
 if(a.phase!=='rest')e.damageWindowRemaining=0;
 e.x=clamp(e.x+e.vx,arena.left,arena.right-e.w);e.y=arena.floor-e.h;e.vy=0;e.grounded=true;
 e._campaign={wind:e.wind,active:e.lunge,aim:a.aim};return true;
}
export function updateGroveGuardian(e,g,hurt){
 if(!e.miniBoss)return false;if(e._kiloGuardianV606)return updateChapterGuardian(e,g,hurt);const p=g.player,a=e._drummer,chapter=e._encounterSaveId===KILO_CHAPTER_BOSS_ID,previousPhase=a.phase;if(!p||p.dead)return true;
 if(e.invuln>0)e.invuln--;
 if(e.sleep>0){e.sleep--;e.vx=0;e.telegraph=false;return true;}
 const dx=p.x+p.w/2-e.x-e.w/2,visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1000)&&e.y+e.h>g.cam.y&&e.y<g.cam.y+(g.viewH||720);
 a.round=e.hp<=e.max*.5?2:1;e.vx=0;e.telegraph=false;e.wind=0;e.lunge=0;
 const wave=(dir,speed=4.5)=>{if(g.projectiles.length<160)g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-18,w:24,h:16,vx:dir*speed,vy:0,life:125,dmg:chapter?20:14,owner:'enemy',shape:'orb',color:'#f3c87e'});};
 if(a.phase==='waiting'){
  if(chapter&&g.world1){a.notes=g.world1.stations.filter(s=>s.done).length;if(a.notes<4||p.evo<4){e.damageTakenScale=0;return true;}}
  if(visible&&Math.abs(dx)<520){a.phase='intro';a.timer=90;g.nums?.add?.(e.x,e.y-45,'TAMBOR DEL CLARO · GUARDIÁN DEL COMPÁS','#ffe6a0',true);}
 }else if(a.phase==='intro'){if(--a.timer<=0){const chapter=e._encounterSaveId===KILO_CHAPTER_BOSS_ID;a.phase=chapter?'warn':'rest';a.timer=chapter?60:25;if(chapter){a.aim=Math.sign(dx)||1;a.aerialVolley=groveAerialVolley(e,p);}}}
 else if(a.phase==='rest'){
  if((--a.timer<=0||chapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<900&&e.aiAttackPermit!==false){a.aim=Math.sign(dx)||1;a.phase='warn';a.timer=a.round===2?48:60;a.aerialVolley=groveAerialVolley(e,p);}
 }else if(a.phase==='warn'){
  e.telegraph=true;e.wind=a.timer;
  if(e.stun>=25&&!chapter){a.phase='rest';a.timer=65;g.nums?.add?.(e.x,e.y-35,'¡COMPÁS ROTO!','#b9efd0',true);}
  else if(--a.timer<=0){a.phase='strike';a.attacksExecuted=(a.attacksExecuted||0)+1;a.timer=a.pattern===1?28:18;
   if(a.aerialVolley){for(const ray of a.aerialVolley)if(g.projectiles.length<160)g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h*.45,w:14,h:14,...ray,life:145,dmg:chapter?20:14,owner:'enemy',shape:'orb',color:'#f3c87e'});}
   else if(a.pattern===0){wave(a.aim);if(a.round===2)wave(-a.aim,3.5);}
   if(!a.aerialVolley&&a.pattern===2){wave(-1,4);wave(1,4);if(a.round===2){wave(-1,6);wave(1,6);}}
  }
 }else if(a.phase==='strike'){
  e.lunge=a.timer;
  if(a.pattern===1){e.vx=a.aim*(a.round===2?(chapter?9:7):(chapter?7:5));if(Math.abs(dx)<(p.w+e.w)/2&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<(p.h+e.h)/2)hurt(18,'¡REDOBLE!');}
  if(--a.timer<=0){a.phase='rest';a.timer=chapter?54:75;a.pattern=(a.pattern+1)%3;}
 }
 if(chapter){
  if(a.phase==='rest'&&previousPhase!=='rest')e.damageWindowRemaining=180;
  e.damageTakenScale=a.phase==='rest'&&e.damageWindowRemaining>0?1:0;
  if(a.phase==='strike'&&Math.abs(dx)<(p.w+e.w)/2&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<(p.h+e.h)/2)hurt(22,'¡APÁRTATE DEL TAMBOR!');
 }
 e.stun=Math.min(e.stun||0,2);e.x=Math.max(e._groveArena.left,Math.min(e._groveArena.right-e.w,e.x+e.vx));
 // Anchor the fight to its safe floor; knockback cannot throw it into another sector.
 e.y=e._groveArena.floor-e.h;e.vy=0;e.grounded=true;e._campaign={wind:e.wind,active:e.lunge,aim:a.aim};return true;
}
function drawChapterGuardianSignals(c,e,cam){
 const a=e._drummer,x=e.x+e.w/2-cam.x,y=e.y-cam.y,floor=e._groveArena.floor-cam.y;
 c.save();c.textAlign='center';c.lineJoin='round';c.lineCap='round';
 c.fillStyle='#143638ec';c.strokeStyle='#d3c794';c.lineWidth=1;c.beginPath();c.roundRect(x-126,y-79,252,65,12);c.fill();c.stroke();
 c.fillStyle='#fff0c7';c.font='600 12px Outfit,sans-serif';c.fillText('TAMBOR DEL CLARO · '+a.round+'/2',x,y-61);
 const cue=a.phase==='waiting'?'LA CANCIÓN AÚN NO ESTÁ COMPLETA':a.phase==='intro'?'ESCUCHA EL COMPÁS':a.phase==='step'?'BUSCA TU POSICIÓN':a.phase==='rest'?'APERTURA · ¡RESPONDE AHORA!':a.phase==='warn'?[
  a.airTarget?'SALTA LA ONDA · CAMBIA DE ALTURA':'REDOBLE · SALTA AL LLEGAR LA ONDA',
  'CARGA · SALTA SOBRE EL CORREDOR',
  a.round===2?'DOS ABANICOS · CAMBIA TU TRAYECTORIA':'ABANICO · SAL DE LA MARCA'
 ][a.pattern]:'DEJA PASAR EL GOLPE';
 c.font='600 10px Outfit,sans-serif';c.fillStyle=a.phase==='rest'?'#bde9c5':'#e8d6ab';c.fillText(cue,x,y-43,238);
 c.fillStyle='#3d5b54';c.fillRect(x-111,y-31,222,5);c.fillStyle=a.phase==='rest'?'#a6d4ad':'#e6bd83';c.fillRect(x-111,y-31,222*Math.max(0,e.hp/e.max),5);
 if(a.phase==='warn'){
  const progress=1-a.timer/(a.warnMax||60);c.fillStyle='#e9e8c1';c.fillRect(x-111,y-20,222*clamp(progress,0,1),2);
  if(a.pattern===1){
   const from=(a.chargeStartX??e.x)+e.w/2-cam.x,to=(a.chargeEndX??e.x)+e.w/2-cam.x,left=Math.min(from,to),width=Math.abs(to-from);
   // Leaf footprints mark the committed corridor rather than a debug ray.
   c.fillStyle='#b9c98b';c.globalAlpha=.22;c.beginPath();c.roundRect(left-20,floor-8,width+40,13,6);c.fill();c.globalAlpha=.6;
   const n=Math.max(1,Math.floor(width/85));for(let i=0;i<=n;i++){const xx=from+(to-from)*i/n;c.beginPath();c.ellipse(xx,floor-2,10,3,-a.aim*.3,0,KILO_TAU);c.fill();}
   c.globalAlpha=1;
  }else if((a.pattern===2||a.airTarget)&&Number.isFinite(a.targetX)&&Number.isFinite(a.targetY)){
   const tx=a.targetX-cam.x,ty=a.targetY-cam.y;c.strokeStyle='#c9e6c6';c.lineWidth=2;c.globalAlpha=.75;
   for(let i=0;i<4;i++){const angle=i*Math.PI/2;c.beginPath();c.ellipse(tx+Math.cos(angle)*15,ty+Math.sin(angle)*15,5,9,angle,0,KILO_TAU);c.stroke();}c.globalAlpha=1;
  }
 }
 c.restore();
}
export function drawGroveGuardianSignals(ctx,e,cam){
 if(!e.miniBoss||e.hp<=0)return;if(e._kiloGuardianV606)return drawChapterGuardianSignals(ctx,e,cam);const a=e._drummer,x=e.x+e.w/2-cam.x,y=e.y-cam.y;
 ctx.save();if(a.phase==='waiting'&&a.notes!=null){ctx.fillStyle='#ffe3a0';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('CUATRO NOTAS PARA DESPERTAR · '+a.notes+'/4',x,y-74);}ctx.fillStyle='#173b45';ctx.fillRect(x-100,y-51,200,31);ctx.fillStyle='#ffe3a0';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('TAMBOR DEL CLARO · '+a.round+'/2',x,y-36);
 ctx.fillStyle='#4d6670';ctx.fillRect(x-95,y-29,190,5);ctx.fillStyle='#e4b77d';ctx.fillRect(x-95,y-29,190*Math.max(0,e.hp/e.max),5);
 if(a.phase==='warn'){
  const floor=e.y+e.h-cam.y;
  ctx.fillStyle='#f2c790';ctx.globalAlpha=.16;
  ctx.beginPath();ctx.ellipse(x+(a.aerialVolley?0:a.pattern===2?0:a.aim*105),floor-2,a.pattern===2?220:120,9,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  // The raised mallets and warm membrane carry anticipation; a short floor
  // pulse shows reach without yellow debug rays through the whole scene.
  ctx.fillStyle='#fff1ce';ctx.fillText(a.aerialVolley?'CAMBIA DE ALTURA · ABANICO':['SALTA LA ONDA','APÁRTATE DE LA CARGA','SALTA EL DOBLE TAMBOR'][a.pattern],x,y-62);
 }
 if(e._encounterSaveId===KILO_CHAPTER_BOSS_ID&&a.phase!=='waiting'&&e.damageTakenScale<1){ctx.fillStyle='#ffe2a0';ctx.fillText(a.phase==='intro'?'ESCUCHA EL COMPÁS':'BLINDADO · ESQUIVA EL ATAQUE',x,y-79);}
 if(a.phase==='rest'){ctx.fillStyle='#c2eed8';ctx.fillText('RECUPERANDO · ¡ATACA!',x,y-61);}
 ctx.restore();
}

// The guardian is a living taiko tree, with real mallet anticipation, drum
// membrane recoil and planted root legs. Its drawing never applies damage.
export function drawGroveGuardianBody(c,e,cam,t,reduced=false){
 const a=e._drummer;if(!a)return;const x=e.x+e.w/2-cam.x,y=e.y+e.h-cam.y,
  scale=e.w/150,wind=a.phase==='warn',strike=a.phase==='strike',rest=a.phase==='rest',
  pulse=reduced?0:Math.sin(t*.08),lift=wind?1-Math.min(1,a.timer/60):strike?.9:0;
 c.save();c.translate(x,y);c.scale(scale,scale);c.lineJoin='round';c.lineCap='round';
 if(!reduced)c.translate(0,strike?Math.sin(t*.7)*2:pulse*.7);
 for(let side of [-1,1])for(let k=0;k<2;k++){
  c.strokeStyle=k?'#47695a':'#36524d';c.lineWidth=k?9:12;c.beginPath();c.moveTo(side*(32+k*13),-35);c.bezierCurveTo(side*53,-23,side*(71+k*8),-15,side*(63+k*12),-1);c.stroke();
  c.strokeStyle='#a9b587';c.lineWidth=2;c.beginPath();c.moveTo(side*44,-25);c.quadraticCurveTo(side*64,-17,side*(63+k*12),-2);c.stroke();
 }
 for(let side of [-1,1]){
  const hy=wind?-63-lift*58:strike?-44:-68,handX=side*(wind?84:77);
  c.strokeStyle='#52725c';c.lineWidth=14;c.beginPath();c.moveTo(side*49,-69);c.bezierCurveTo(side*73,-83,side*91,hy+24,handX,hy);c.stroke();
  c.strokeStyle='#c7b58a';c.lineWidth=5;c.beginPath();c.moveTo(handX,hy+8);c.lineTo(handX-side*12,hy-24);c.stroke();
  c.fillStyle='#e5c48d';c.strokeStyle='#4d514a';c.lineWidth=2;c.beginPath();c.ellipse(handX-side*12,hy-24,15,10,-side*.25,0,Math.PI*2);c.fill();c.stroke();
 }
 c.fillStyle='#976752';c.strokeStyle='#3e4c49';c.lineWidth=3;c.beginPath();c.moveTo(-54,-100);c.bezierCurveTo(-66,-72,-58,-30,-46,-20);c.quadraticCurveTo(0,-5,46,-20);c.bezierCurveTo(59,-36,66,-73,54,-100);c.closePath();c.fill();c.stroke();
 for(let i=-4;i<=4;i++){c.strokeStyle=i%2?'#c39365':'#78594e';c.lineWidth=2;c.beginPath();c.moveTo(i*11,-94);c.bezierCurveTo(i*12+3,-73,i*11-4,-48,i*10,-22);c.stroke();}
 for(let yy of [-94,-27]){c.strokeStyle='#d4b27a';c.lineWidth=7;c.beginPath();c.ellipse(0,yy,55,11,0,0,Math.PI*2);c.stroke();c.strokeStyle='#46514c';c.lineWidth=1.2;c.stroke();}
 for(let i=-4;i<4;i++){c.strokeStyle='#eed7a2';c.lineWidth=1.6;c.beginPath();c.moveTo(i*12,-91);c.lineTo((i+1)*11,-30);c.lineTo((i+1)*12,-91);c.stroke();}
 c.fillStyle=strike?'#f4d595':wind?'#f0d29b':'#ded1a7';c.strokeStyle='#435349';c.lineWidth=3;c.beginPath();c.ellipse(0,-100,55,18,0,0,Math.PI*2);c.fill();c.stroke();
 c.strokeStyle='#9c805c';c.lineWidth=1.5;c.beginPath();c.ellipse(0,-100,40,12,0,0,Math.PI*2);c.stroke();
 // A carved mask reads clearly from the floor, framed by fern brows.
 c.fillStyle='#46685b';c.beginPath();c.moveTo(-31,-76);c.quadraticCurveTo(0,-91,31,-76);c.lineTo(25,-43);c.quadraticCurveTo(0,-30,-25,-43);c.closePath();c.fill();c.stroke();
 for(let side of [-1,1]){
  c.fillStyle='#fff2c8';c.beginPath();c.ellipse(side*13,-64,8,rest?6:9,side*.08,0,Math.PI*2);c.fill();
  c.fillStyle='#2a3e43';c.beginPath();c.ellipse(side*13+(a.aim||1)*2,-63,3.8,5.3,0,0,Math.PI*2);c.fill();
  c.fillStyle='#edb5a0';c.beginPath();c.ellipse(side*23,-51,6,3,side*.2,0,Math.PI*2);c.fill();
  c.strokeStyle='#a0be8e';c.lineWidth=3;c.beginPath();c.moveTo(side*7,-78);c.quadraticCurveTo(side*23,-88,side*37,-81);c.stroke();
 }
 c.strokeStyle='#e4d3a3';c.lineWidth=2;c.beginPath();c.moveTo(-9,-48);c.quadraticCurveTo(0,rest?-40:-44,9,-48);c.stroke();
 if(strike){c.globalAlpha=.5;c.strokeStyle='#ffebb6';c.lineWidth=2;for(let k=0;k<3;k++){c.beginPath();c.ellipse(0,-101,60+k*11,20+k*4,0,0,Math.PI*2);c.stroke();}}
 c.restore();
}
