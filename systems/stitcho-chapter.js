// Stitcho's campaign progression belongs to the workshop, never to the hub.
import {XP_NEED} from './xp.js';
import {drawStitchoStarCruiser,drawStitchoMaintenanceRail} from './stitcho-chapter-art-v607.js';
export const STITCHO_CHAPTER_BOSS_ID='w1-stitcho-glitch-v1';
export const STITCHO_CHAPTER_ARENA=Object.freeze({left:8260,right:9320,floor:1134});
export const STITCHO_RAIL=Object.freeze({id:'w1-stitcho-main-rail-v1',left:3000,right:3320,y:1134});
const railOf=g=>g?.roomDef?.stitchoRail||STITCHO_RAIL;
const arenaOf=g=>g?.roomDef?.stitchoArena||STITCHO_CHAPTER_ARENA;
const shipXOf=g=>g?.roomDef?.stitchoShipX??7900;
export const stitchoChapter=g=>g?.roomDef?.id==='w1-stitcho'&&!!g.roomDef.stitchoChapter;
export const stitchoRailDone=g=>!!g.secrets?.['w1-stitcho']?.includes(railOf(g).id);
export const stitchoBossDefeated=g=>!!g.clearedEncounters?.['w1-stitcho']?.includes(STITCHO_CHAPTER_BOSS_ID);
export function stitchoChapterReady(g){return !stitchoChapter(g)||!!g.world1Seals?.includes('stitcho')||(g.world1?.stations.every(s=>s.done)&&stitchoRailDone(g)&&stitchoBossDefeated(g));}
export function stitchoGrowth(g){
 if(!stitchoChapter(g)||!g.player||!g.world1)return 0;
 if(g.world1.sealed){g.player.xp=Math.max(Number(g.player.xp)||0,XP_NEED[4]);return XP_NEED[4];}
 const s=g.world1.stations;
 const stage=s[0]?.done?(s[1]?.done?(s[2]?.done?4:3):(stitchoRailDone(g)?2:1)):0;
 const floor=XP_NEED[stage]||0;g.player.xp=Math.max(Number(g.player.xp)||0,floor);return floor;
}
export function updateStitchoChapter(g){
 if(!stitchoChapter(g)||!g.world1||!g.player)return;
 const w=g.world1,p=g.player,r=railOf(g);
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
 const s=g.world1.stations,r=railOf(g),arena=arenaOf(g);
 if(s[0]?.done&&!stitchoRailDone(g))return {x:r.left-50,y:r.y,label:'Raíl de mantenimiento',action:'Desde la marca de entrada, pulsa K y rueda hacia la derecha hasta el final del raíl'};
 if(s.every(s=>s.done))return {x:Math.round((arena.left+arena.right)/2),y:arena.floor,label:'Núcleo Glitch',action:'La nave está reparada · vence al Núcleo. Esquiva el aviso y aprovecha su recuperación'};
 return null;
}
export function drawStitchoChapter(ctx,g,cam){
 if(!stitchoChapter(g))return;
 const r=railOf(g),done=stitchoRailDone(g);
 const railScreen={left:r.left-cam.x,right:r.right-cam.x,y:r.y-cam.y};
 const shipX=shipXOf(g)-cam.x,shipY=1134-cam.y;
 const parts=g.world1?.stations.filter(s=>s.done).length||0;
 const t=g.world1?.tick||0,reduced=!!g.reduceMotion;
 const rolling=!!g.world1?.railStarted;

 drawStitchoStarCruiser(ctx,shipX,shipY,parts,t,reduced);
 drawStitchoMaintenanceRail(ctx,railScreen,done,t,rolling,reduced);
}
