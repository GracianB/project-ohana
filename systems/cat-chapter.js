import {XP_NEED} from './xp.js';
import {drawCatMoonJelly,drawCatCrystalBridge} from './cat-chapter-art-v609.js';
export const MICHI_CHAPTER_BOSS_ID='w1-cat-astral-v1';
export const MICHI_CHAPTER_ARENA=Object.freeze({left:8260,right:9320,floor:1134,hp:480});

// Las cinco medusas del jardín: sus coordenadas canónicas las fija cat-encounters-v609
export const catChapter=g=>g?.roomDef?.id==='w1-cat'&&!!g.roomDef.growthChapter;
export const catBossDefeated=g=>!!g.clearedEncounters?.['w1-cat']?.includes(MICHI_CHAPTER_BOSS_ID)||!!g.clearedEncounters?.['w1-cat']?.includes('w1-cat-oraculo-v1');
export function catChapterReady(g){
 return !catChapter(g)||!!g.world1Seals?.includes('cat')||(g.world1?.stations.every(s=>s.done)&&catBossDefeated(g));
}

export function catGrowth(g){
 if(!catChapter(g)||!g.world1||!g.player)return 0;
 const n=g.world1.stations.filter(s=>s.done).length;
 const stage=[0,1,2,3,3,4][Math.min(5,n)];
 const floor=XP_NEED[stage]||0;
 g.player.xp=Math.max(Number(g.player.xp)||0,floor);return floor;
}

export function updateCatChapter(g,hurt){
 if(!catChapter(g)||!g.world1||!g.player||g.player.dead)return;
 catGrowth(g);

 // Cada medusa sagrada despertada materializa un puente de cristal lunar sólido
 if(g.platforms){
  const stations=g.world1.stations||[];
  for(const s of stations){
   if(s.done&&s.kind==='jelly'&&!g.platforms.some(pl=>pl._michiBridge===s.id)){
    g.platforms.push({x:s.x-78,y:s.y+26,w:156,h:16,_michiBridge:s.id});
   }
  }
 }
}

export function catObjective(g){
 if(!catChapter(g)||g.world1?.sealed||!g.world1?.stations.every(s=>s.done))return null;
 return {
  x:8750,y:1134,label:'Oráculo Medusaluna',
  action:'Las cinco medusas están despiertas · esquiva sus 4 fases de aviso y ataca en recuperación cuando abra el núcleo'
 };
}

export function drawCatChapter(ctx,g,cam){
 if(!catChapter(g))return;
 const t=g.world1?.tick||0,reduced=!!g.reduceMotion;
 const stations=g.world1?.stations||[];
 for(const s of stations){
  if(s.kind!=='jelly')continue;
  const sx=s.x-cam.x;
  if(sx<-180||sx>(g.viewW||1280)+180)continue;
  if(s.done){
   drawCatCrystalBridge(ctx,s,cam,t,reduced);
  }
  drawCatMoonJelly(ctx,s,cam,t,reduced);
 }
}
