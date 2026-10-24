import {KILO_CHAPTER_BOSS_ID} from './kilo-chapter.js';
export const GROVE_GUARDIAN={hp:360,width:100,height:76,left:3050,right:3730};
export function initGroveGuardian(e){
 if(!e.roomPersona?.special||e.roomPersona.name!=='Tambor del Claro')return;
 const feet=e.y+48;e.w=100;e.h=76;e.y=feet-e.h;e.hp=e.max=360;e.miniBoss=true;e._encounterSaveId=e.roomPersona.encounterId||'hub-tambor-v1';
 e._groveArena=e.roomPersona.arena||{...GROVE_GUARDIAN,floor:1134};
 e._drummer={phase:'waiting',timer:0,pattern:0,aim:1,round:1};
 if(e._encounterSaveId===KILO_CHAPTER_BOSS_ID){e.w=150;e.h=118;e.y=feet-e.h;e.hp=e.max=540;e.damageTakenScale=0;e.damageWindowRemaining=0;}
}
export function groveAerialVolley(e,p){
 if(e._encounterSaveId!==KILO_CHAPTER_BOSS_ID||p.y+p.h/2>e.y+e.h/2-100)return null;
 const angle=Math.atan2(p.y+p.h/2-(e.y+e.h*.45),p.x+p.w/2-(e.x+e.w/2));
 return [-.18,0,.18].map(offset=>({vx:Math.cos(angle+offset)*5.2,vy:Math.sin(angle+offset)*5.2}));
}
export function updateGroveGuardian(e,g,hurt){
 if(!e.miniBoss)return false;const p=g.player,a=e._drummer,chapter=e._encounterSaveId===KILO_CHAPTER_BOSS_ID,previousPhase=a.phase;if(!p||p.dead)return true;
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
export function drawGroveGuardianSignals(ctx,e,cam){
 if(!e.miniBoss||e.hp<=0)return;const a=e._drummer,x=e.x+e.w/2-cam.x,y=e.y-cam.y;
 ctx.save();if(a.phase==='waiting'&&a.notes!=null){ctx.fillStyle='#ffe3a0';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('CUATRO NOTAS PARA DESPERTAR · '+a.notes+'/4',x,y-74);}ctx.fillStyle='#173b45';ctx.fillRect(x-100,y-51,200,31);ctx.fillStyle='#ffe3a0';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('TAMBOR DEL CLARO · '+a.round+'/2',x,y-36);
 ctx.fillStyle='#4d6670';ctx.fillRect(x-95,y-29,190,5);ctx.fillStyle='#e4b77d';ctx.fillRect(x-95,y-29,190*Math.max(0,e.hp/e.max),5);
 if(a.phase==='warn'){const floor=e.y+e.h-cam.y;ctx.strokeStyle='#ffdda0';ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.beginPath();if(a.aerialVolley){for(const ray of a.aerialVolley){ctx.moveTo(x,y+e.h*.45);ctx.lineTo(x+ray.vx/5.2*270,y+e.h*.45+ray.vy/5.2*270);}}else if(a.pattern===2){ctx.moveTo(x-240,floor-4);ctx.lineTo(x+240,floor-4);}else {ctx.moveTo(x,floor-4);ctx.lineTo(x+a.aim*260,floor-4);}ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fff1ce';ctx.fillText(a.aerialVolley?'CAMBIA DE ALTURA · ABANICO':['SALTA LA ONDA','APÁRTATE DE LA CARGA','SALTA EL DOBLE TAMBOR'][a.pattern],x,y-62);}
 if(e._encounterSaveId===KILO_CHAPTER_BOSS_ID&&e.damageTakenScale<1){ctx.fillStyle='#ffe2a0';ctx.fillText(a.phase==='intro'?'ESCUCHA EL COMPÁS':'BLINDADO · ESQUIVA EL ATAQUE',x,y-79);}
 if(a.phase==='rest'){ctx.fillStyle='#c2eed8';ctx.fillText('RECUPERANDO · ¡ATACA!',x,y-61);}
 ctx.restore();
}
