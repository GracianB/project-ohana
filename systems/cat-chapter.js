import {XP_NEED} from './xp.js';
import {drawCatMoonJelly,drawCatCrystalBridge,drawCatTrap,drawCatAtmosphere,drawCatStardust} from './cat-chapter-art-v609.js';
export const MICHI_CHAPTER_BOSS_ID='w1-cat-astral-v1';
export const MICHI_CHAPTER_ARENA=Object.freeze({left:8260,right:9320,floor:1134,hp:480});

export const CAT_TRAPS=Object.freeze([
 {id:0,x:2740,y:1064,w:90,h:70,name:'Telaraña del Velo I'},
 {id:1,x:5340,y:1064,w:90,h:70,name:'Telaraña del Velo II'},
 {id:2,x:7540,y:1064,w:90,h:70,name:'Telaraña del Velo III'}
]);

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

export function catTrapSilenced(g,id){
 return (g.world1?.catTrapsCleared||[]).includes(id);
}

export function updateCatChapter(g,hurt){
 if(!catChapter(g)||!g.world1||!g.player||g.player.dead)return;
 catGrowth(g);

 const p=g.player;

 // Puentes de cristal lunar que se activan al despertar cada medusa sagrada
 if(g.platforms){
  const stations=g.world1.stations||[];
  for(const s of stations){
   if(s.done&&s.kind==='jelly'&&!g.platforms.some(pl=>pl._michiBridge===s.id)){
    g.platforms.push({x:s.x-78,y:s.y+26,w:156,h:16,_michiBridge:s.id});
   }
  }
 }

 // Interacción con trampas de telaraña astral
 for(const trap of CAT_TRAPS){
  if(catTrapSilenced(g,trap.id))continue;
  const inTrap=p.x+p.w>trap.x&&p.x<trap.x+trap.w&&p.y+p.h>trap.y&&p.y<trap.y+trap.h;
  if(inTrap){
   // Si el jugador está atacando o en habilidad, corta y disipa la telaraña
   if(p.state==='attack'||p.state==='cast'||Math.abs(p.vx)>6){
    g.world1.catTrapsCleared=g.world1.catTrapsCleared||[];
    g.world1.catTrapsCleared.push(trap.id);
    g.score=(g.score||0)+75;
    g.nums?.add?.(trap.x+trap.w/2,trap.y-20,'¡TELARAÑA DISIPADA! +75','#f2b8ff',true);
    g.fx?.emit?.(trap.x+trap.w/2,trap.y+trap.h/2,{color:'#deb3ff',count:12,size:3,life:28});
   }else{
    // Ralentización suave por seda astral
    p.vx*=0.75;
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

 // 1. Atmósfera celestial: Auroras boreales y velos en el cielo
 drawCatAtmosphere(ctx,g,cam,t,reduced);

 // 2. Trampas de telaraña activas
 for(const trap of CAT_TRAPS){
  if(catTrapSilenced(g,trap.id))continue;
  const tx=trap.x-cam.x;
  if(tx<-120||tx>(g.viewW||1280)+120)continue;
  drawCatTrap(ctx,trap,cam,t,reduced);
 }

 // 3. Estaciones de medusas y puentes de cristal lunar
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

 // 4. Estela de polvo de estrellas para Michi
 if(g.player&&g.player.id==='cat'){
  drawCatStardust(ctx,g.player,cam,t,reduced);
 }
}
