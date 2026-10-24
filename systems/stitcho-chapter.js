// Stitcho's campaign progression belongs to the workshop, never to the hub.
import {XP_NEED} from './xp.js';
export const STITCHO_CHAPTER_BOSS_ID='w1-stitcho-glitch-v1';
export const STITCHO_CHAPTER_ARENA=Object.freeze({left:8260,right:9320,floor:1134});
export const STITCHO_RAIL=Object.freeze({id:'w1-stitcho-main-rail-v1',left:3000,right:3320,y:1134});
export const stitchoChapter=g=>g?.roomDef?.id==='w1-stitcho'&&!!g.roomDef.stitchoChapter;
export const stitchoRailDone=g=>!!g.secrets?.['w1-stitcho']?.includes(STITCHO_RAIL.id);
export const stitchoBossDefeated=g=>!!g.clearedEncounters?.['w1-stitcho']?.includes(STITCHO_CHAPTER_BOSS_ID);
export function stitchoChapterReady(g){return !stitchoChapter(g)||!!g.world1Seals?.includes('stitcho')||(g.world1?.stations.every(s=>s.done)&&stitchoRailDone(g)&&stitchoBossDefeated(g));}
export function stitchoGrowth(g){
 if(!stitchoChapter(g)||!g.player||!g.world1||g.world1.sealed)return 0;
 const s=g.world1.stations;
 const stage=s[0]?.done?(s[1]?.done?(s[2]?.done?4:3):(stitchoRailDone(g)?2:1)):0;
 const floor=XP_NEED[stage]||0;g.player.xp=Math.max(Number(g.player.xp)||0,floor);return floor;
}
export function updateStitchoChapter(g){
 if(!stitchoChapter(g)||!g.world1||!g.player)return;
 const w=g.world1,p=g.player,r=STITCHO_RAIL;
 if(!w.sealed&&w.stations[0]?.done&&!stitchoRailDone(g)){
  const x=p.x+p.w/2;
  const rolling=p.id==='stitcho'&&p._abilMove==='roll'&&p.grounded&&Math.abs(p.y+p.h-r.y)<24;
  // An attempt must enter from the west and remain a continuous real roll.
  // Reject a discontinuous jump across the sensor even if a stale roll flag exists.
  if(!rolling||w.railLastX!=null&&(x<w.railLastX-2||x-w.railLastX>40))w.railStarted=false;
  if(rolling&&x>=r.left-70&&x<=r.left)w.railStarted=true;
  if(rolling&&w.railStarted&&x>=r.right){
   g.secrets||={};const found=g.secrets['w1-stitcho']||=[];found.push(r.id);
   w.railStarted=false;g.score=(g.score||0)+150;stitchoGrowth(g);
   g.nums?.add?.(x,p.y-40,'RAÍL RESTAURADO · L DESBLOQUEADA','#8cecff',true);
   g.onWorld1Beat?.('station','stitcho');g.save?.();
  }
  w.railLastX=x;
 }
 stitchoGrowth(g);
}
export function stitchoObjective(g){
 if(!stitchoChapter(g)||g.world1?.sealed)return null;
 const s=g.world1.stations;
 if(s[0]?.done&&!stitchoRailDone(g))return {x:STITCHO_RAIL.left-50,y:STITCHO_RAIL.y,label:'Raíl de mantenimiento',action:'Desde la marca de entrada, pulsa K y rueda hacia la derecha hasta el final del raíl'};
 if(s.every(s=>s.done))return {x:8750,y:1134,label:'Núcleo Glitch',action:'La nave está reparada · vence al Núcleo. Esquiva el aviso y aprovecha su recuperación'};
 return null;
}
export function drawStitchoChapter(ctx,g,cam){
 if(!stitchoChapter(g))return;
 const r=STITCHO_RAIL,done=stitchoRailDone(g),x=r.left-cam.x,y=r.y-cam.y;
 ctx.save();ctx.strokeStyle=done?'#9cffcc':'#8cecff';ctx.lineWidth=5;
 ctx.beginPath();ctx.moveTo(x-60,y-4);ctx.lineTo(x+320,y-4);ctx.stroke();
 ctx.lineWidth=2;for(let i=0;i<=320;i+=32){ctx.beginPath();ctx.moveTo(x+i,y-12);ctx.lineTo(x+i+12,y-4);ctx.stroke();}
 ctx.fillStyle='#082d40';ctx.fillRect(x-115,y-95,270,49);ctx.fillStyle=done?'#9cffcc':'#e6faff';
 ctx.textAlign='center';ctx.font='bold 13px sans-serif';ctx.fillText(done?'RAÍL RESTAURADO':'ENTRADA → K · BOLA',x+20,y-74);
 ctx.font='12px sans-serif';ctx.fillText(done?'Circuito de mantenimiento listo':'Rueda sin parar hasta la luz final',x+20,y-56);
 ctx.fillStyle=done?'#9cffcc':'#ffe9a0';ctx.fillRect(x+318,y-58,5,58);ctx.restore();
}
