// Kilo's campaign chapter. Earned notes set a minimum XP; they do not add XP
// repeatedly and never lower experience gained through combat/exploration.
import {XP_NEED} from './xp.js';
export const KILO_CHAPTER_BOSS_ID='w1-kilo-tambor-v1';
export const KILO_CHAPTER_ARENA=Object.freeze({left:8260,right:9320,floor:1134});
export function kiloChapter(g){return g?.roomDef?.id==='w1-kilo'&&!!g.roomDef.kiloChapter;}
export function kiloNoteGrowth(g){
 if(!kiloChapter(g)||!g.player||!g.world1)return 0;
 const n=g.world1.stations.filter(s=>s.kind==='flower'&&s.done).length;
 const floor=XP_NEED[Math.min(4,n)]||0;
 g.player.xp=Math.max(Number(g.player.xp)||0,floor);return floor;
}
export function kiloGuardianDefeated(g){
 return !!g?.clearedEncounters?.['w1-kilo']?.includes(KILO_CHAPTER_BOSS_ID);
}
export function kiloGuardianRequired(g){
 return kiloChapter(g)&&!g.world1Seals?.includes('kilo')&&!kiloGuardianDefeated(g);
}
export function kiloFlowerThreat(g,s){
 if(!kiloChapter(g))return null;
 return g.enemies?.find(e=>e.hp>0&&!e.friendly&&Math.abs(e.x+(e.w||0)/2-s.x)<270&&Math.abs(e.y+(e.h||0)/2-(s.y-40))<240)||null;
}

export const KILO_AIR_CHIMES=Object.freeze([
 Object.freeze({id:'w1-kilo-wind-chime-1',x:7580,y:620}),
 Object.freeze({id:'w1-kilo-wind-chime-2',x:7930,y:480}),
 Object.freeze({id:'w1-kilo-wind-chime-3',x:8280,y:620})
]);
export function enterKiloAirTrail(g){
 if(!kiloChapter(g)||!g.world1)return;
 const found=g.secrets?.['w1-kilo']||[];
 g.world1.airChimes=KILO_AIR_CHIMES.map(ch=>({...ch,done:found.includes(ch.id)}));
}
export function updateKiloAirTrail(g){
 const p=g.player,w=g.world1;
 if(!kiloChapter(g)||!w||!p||p.dead||p.evo<4||p._kiloFlightMode!=='solar'||!(p._kiloFlightT>0))return;
 for(const ch of w.airChimes||[]){
  if(ch.done||Math.hypot(p.x+p.w/2-ch.x,p.y+p.h/2-ch.y)>48)continue;
  ch.done=true;g.secrets||={};const found=g.secrets['w1-kilo']||=[];
  if(!found.includes(ch.id)){found.push(ch.id);g.score=(g.score||0)+150;g.onWorld1Beat?.('chime','kilo',KILO_AIR_CHIMES.findIndex(c=>c.id===ch.id)+1);g.nums?.add?.(ch.x,ch.y-25,'CARILLÓN · '+w.airChimes.filter(c=>c.done).length+'/3','#ffe4a0',false);g.fx?.emit?.(ch.x,ch.y,{color:'#ffe4a0',count:g.reduceMotion?4:12,size:3,star:true,life:25});g.save?.();}
 }
}
export function drawKiloAirTrail(ctx,g,cam,t){
 if(!kiloChapter(g))return;
 ctx.save();ctx.textAlign='center';
 for(const ch of g.world1?.airChimes||[]){
  const x=ch.x-cam.x,y=ch.y-cam.y+(g.reduceMotion?0:Math.sin(t*.03+ch.x)*4);
  if(x<-80||x>(g.viewW||1600)+80)continue;
  ctx.globalAlpha=ch.done?.35:1;ctx.strokeStyle='#c5eadc';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(x,y-7,17,Math.PI,Math.PI*2);ctx.stroke();
  ctx.fillStyle=ch.done?'#b8cdb5':'#ffe4a0';ctx.fillRect(x-16,y-7,32,18);
  ctx.beginPath();ctx.arc(x,y+13,4,0,Math.PI*2);ctx.fill();
  ctx.font='700 11px sans-serif';ctx.fillText(ch.done?'♪':'VUELO SOLAR',x,y-32);
 }
 ctx.restore();
}
