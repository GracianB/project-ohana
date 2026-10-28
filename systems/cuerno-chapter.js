import {XP_NEED} from './xp.js';
import {drawCuernoPrism,drawCuernoDawnMirror,drawCuernoAtmosphere} from './cuerno-chapter-art-v610.js';
export const CUERNO_CHAPTER_BOSS_ID='w1-cuerno-prism-v1';
export const CUERNO_CHAPTER_ARENA=Object.freeze({left:8260,right:9320,floor:1134,hp:640});
export const DAWN_MIRROR=Object.freeze({id:'w1-cuerno-dawn-mirror-v1',x:1000,y:1134});

export const cuernoChapter=g=>g?.roomDef?.id==='w1-cuerno'&&!!g.roomDef.growthChapter;
export const mirrorRestored=g=>!!g.secrets?.['w1-cuerno']?.includes(DAWN_MIRROR.id);
export const cuernoBossDefeated=g=>!!g.clearedEncounters?.['w1-cuerno']?.includes(CUERNO_CHAPTER_BOSS_ID);

export function cuernoChapterReady(g){
 return !cuernoChapter(g)||!!g.world1Seals?.includes('cuerno')||(g.world1?.stations.every(s=>s.done)&&mirrorRestored(g)&&cuernoBossDefeated(g));
}

export function cuernoGrowth(g){
 if(!cuernoChapter(g)||!g.world1||!g.player)return 0;
 const n=g.world1.stations.filter(s=>s.done).length;
 const stage=Math.min(4,n+(mirrorRestored(g)?1:0));
 const floor=XP_NEED[stage]||0;
 g.player.xp=Math.max(Number(g.player.xp)||0,floor);return floor;
}

export function updateCuernoChapter(g,hurt){
 if(!cuernoChapter(g)||!g.world1||!g.player||g.player.dead)return;
 cuernoGrowth(g);

 const p=g.player;
 // Interacción especial con el Espejo del Alba mediante la tecla J (habilidad 0) o contacto
 if(!mirrorRestored(g)&&Math.abs(p.x+p.w/2-DAWN_MIRROR.x)<210&&Math.abs(p.y+p.h-DAWN_MIRROR.y)<180){
  if(p.state==='cast'||p.state==='attack'||Math.abs(p.vx)>5){
   g.secrets||={};
   const found=g.secrets['w1-cuerno']||=[];
   found.push(DAWN_MIRROR.id);
   g.score=(g.score||0)+150;
   cuernoGrowth(g);
   g.nums?.add?.(DAWN_MIRROR.x,1030,'EL ESPEJO DEVUELVE EL ALBA · K DESPIERTA','#fff0bd',true);
   g.fx?.emit?.(DAWN_MIRROR.x,1060,{color:'#ffe082',count:16,size:3.5,star:true,life:35});
   g.save?.();
  }
 }
}

export function cuernoObjective(g){
 if(!cuernoChapter(g)||g.world1?.sealed)return null;
 if(!mirrorRestored(g)){
  return {
   x:DAWN_MIRROR.x,y:DAWN_MIRROR.y,
   label:'Espejo del alba',
   action:'Acércate y pulsa J para devolver la luz al bosque. Después sigue los prismas I → II → III'
  };
 }
 const stations=g.world1?.stations||[];
 if(stations.every(s=>s.done)){
  return {
   x:8750,y:1134,
   label:'Bestia Prisma',
   action:'Los tres prismas y el espejo están alineados · esquiva sus embestidas y ataca en recuperación'
  };
 }
 return null;
}

export function drawCuernoChapter(ctx,g,cam){
 if(!cuernoChapter(g))return;
 const t=g.world1?.tick||0,reduced=!!g.reduceMotion;

 // 1. Atmósfera del Bosque Prisma: Haces de luz solar y auroras
 drawCuernoAtmosphere(ctx,g,cam,t,reduced);

 // 2. Espejo del Alba
 const restored=mirrorRestored(g);
 const mx=DAWN_MIRROR.x-cam.x;
 if(mx>-160&&mx<(g.viewW||1280)+160){
  drawCuernoDawnMirror(ctx,DAWN_MIRROR,cam,t,reduced,restored);
 }

 // 3. Prismas I, II y III
 const stations=g.world1?.stations||[];
 for(const s of stations){
  if(s.kind!=='prism')continue;
  const sx=s.x-cam.x;
  if(sx<-160||sx>(g.viewW||1280)+160)continue;
  drawCuernoPrism(ctx,s,cam,t,reduced);
 }
}
