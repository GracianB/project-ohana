import {XP_NEED} from './xp.js';
import {drawDragonBrazier,drawDragonThermal,drawDragonAtmosphere} from './dragon-chapter-art-v611.js';
export const DRAGON_CHAPTER_BOSS_ID='w1-dragon-igneous-v1';
export const DRAGON_CHAPTER_ARENA=Object.freeze({left:8260,right:9320,floor:1134,hp:640});
export const DRAGON_THERMALS_V611=Object.freeze([
 {id:'thermal-0',x:2000,y:1134,w:140,h:480},
 {id:'thermal-1',x:4400,y:1134,w:140,h:480},
 {id:'thermal-2',x:6800,y:1134,w:140,h:480},
 {id:'thermal-3',x:9200,y:1134,w:140,h:480}
]);

export const dragonChapter=g=>g?.roomDef?.id==='w1-dragon'&&!!g.roomDef.growthChapter;
export const dragonBossDefeated=g=>!!g.clearedEncounters?.['w1-dragon']?.includes(DRAGON_CHAPTER_BOSS_ID);

export function dragonChapterReady(g){
 return !dragonChapter(g)||!!g.world1Seals?.includes('dragon')||(g.world1?.stations.every(s=>s.done)&&dragonBossDefeated(g));
}

export function dragonGrowth(g){
 if(!dragonChapter(g)||!g.world1||!g.player)return 0;
 const n=g.world1.stations.filter(s=>s.done).length;
 const stage=Math.min(4,n);
 const floor=XP_NEED[stage]||0;
 g.player.xp=Math.max(Number(g.player.xp)||0,floor);
 return floor;
}

export function updateDragonChapter(g,hurt){
 if(!dragonChapter(g)||!g.world1||!g.player||g.player.dead)return;
 dragonGrowth(g);

 const p=g.player,w=g.world1;
 const litCount=w.stations.filter(s=>s.done).length;

 // Inicializar y actualizar nivel de calor de la caldera
 if(w.calderaHeat===undefined)w.calderaHeat=litCount*25;
 const minHeat=litCount*20;
 if(w.calderaHeat>minHeat)w.calderaHeat=Math.max(minHeat,w.calderaHeat-0.04);
 if(w.calderaHeat>50){
  p.calderaBoost=true;
 }else{
  p.calderaBoost=false;
 }

 // Encender braseros con aliento de fuego (J / cast / attack) o contacto cercano
 for(const s of w.stations){
  if(s.kind!=='brazier'||s.done)continue;
  const dx=s.x-(p.x+p.w/2);
  const near=Math.abs(dx)<160&&Math.abs(p.y+p.h-s.y)<150;
  const fireActive=(p.state==='cast'||p.state==='attack'||s.flameUntil>w.tick);
  if(near&&(fireActive||Math.abs(p.vx)>5)){
   s.done=true;
   w.calderaHeat=Math.min(100,w.calderaHeat+25);
   g.score=(g.score||0)+150;
   dragonGrowth(g);
   g.nums?.add?.(s.x,s.y-90,'¡BRASERO ANCESTRAL ENCENDIDO!','#ff9e40',true);
   g.fx?.emit?.(s.x,s.y-70,{color:'#ff6d00',count:28,size:5,star:true,life:45});
   g.fx?.emit?.(s.x,s.y-85,{color:'#ffe082',count:16,size:3,life:35});
   g.save?.();
  }
 }

 // Ascenso en corrientes térmicas para el dragón
 if(p.id==='dragon'&&!p.grounded){
  const boostMult=p.calderaBoost?1.15:1.0;
  for(const vent of DRAGON_THERMALS_V611){
   if(Math.abs(p.x+p.w/2-vent.x)<vent.w/2&&p.y+p.h<vent.y-18&&p.y+p.h>vent.y-vent.h){
    p.vy=Math.max(-11.5*boostMult,(p.vy||0)-0.9*boostMult);
    p.coyote=0;
    w.thermalFrames=(w.thermalFrames||0)+1;
    if(w.tick%4===0){
     g.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:'#ffab40',count:3,size:2.8,life:22});
    }
   }
  }
 }
}

export function dragonObjective(g){
 if(!dragonChapter(g)||g.world1?.sealed)return null;
 const stations=g.world1?.stations||[];
 const unlit=stations.find(s=>!s.done);
 if(unlit){
  return {
   x:unlit.x,y:unlit.y,
   label:unlit.name||'Brasero apagado',
   action:'Acércate y pulsa J para encender el brasero con fuego. Usa las térmicas para elevarte'
  };
 }
 if(stations.every(s=>s.done)){
  return {
   x:8750,y:1134,
   label:'Guardián del Núcleo Ígneo',
   action:'Los cuatro braseros arden · esquiva sus erupciones de lava y ataca en su recuperación'
  };
 }
 return null;
}

export function drawDragonChapter(ctx,g,cam){
 if(!dragonChapter(g))return;
 const t=g.world1?.tick||0,reduced=!!g.reduceMotion;

 // 1. Atmósfera volcánica de la Caldera
 drawDragonAtmosphere(ctx,g,cam,t,reduced);

 // 2. Corrientes térmicas ascendentes
 for(const vent of DRAGON_THERMALS_V611){
  const vx=vent.x-cam.x;
  if(vx<-180||vx>(g.viewW||1280)+180)continue;
  drawDragonThermal(ctx,vent,cam,t,reduced);
 }

 // 3. Braseros ancestrales
 const stations=g.world1?.stations||[];
 for(const s of stations){
  if(s.kind!=='brazier')continue;
  const sx=s.x-cam.x;
  if(sx<-160||sx>(g.viewW||1280)+160)continue;
  drawDragonBrazier(ctx,s,cam,t,reduced);
 }

 // 4. Indicador HUD de Calor de la Caldera
 const heat=g.world1?.calderaHeat||0;
 if(heat>0){
  const vw=g.viewW||1280,gx=vw-220,gy=52,gw=180,gh=16;
  ctx.save();
  ctx.fillStyle='rgba(26,10,8,0.85)';
  ctx.strokeStyle='rgba(255,109,0,0.6)';
  ctx.lineWidth=1.2;
  if(ctx.roundRect)ctx.roundRect(gx-10,gy-18,gw+20,gh+26,4);
  else ctx.rect(gx-10,gy-18,gw+20,gh+26);
  ctx.fill();ctx.stroke();

  ctx.fillStyle='#ffe082';
  ctx.font='bold 10px monospace';
  ctx.textAlign='left';
  ctx.fillText('CALOR CALDERA '+(heat|0)+'%',gx,gy-5);

  ctx.fillStyle='rgba(15,5,4,0.9)';
  if(ctx.roundRect)ctx.roundRect(gx,gy,gw,gh,3);else ctx.rect(gx,gy,gw,gh);
  ctx.fill();

  const fillW=Math.max(0,Math.min(gw,gw*(heat/100)));
  const grad=ctx.createLinearGradient(gx,gy,gx+fillW,gy);
  grad.addColorStop(0,'#ff6d00');
  grad.addColorStop(0.6,'#ff9100');
  grad.addColorStop(1,'#fff176');
  ctx.fillStyle=grad;
  if(ctx.roundRect)ctx.roundRect(gx,gy,fillW,gh,3);else ctx.rect(gx,gy,fillW,gh);
  ctx.fill();

  if(!reduced){
   const sparkX=gx+fillW+Math.sin(t*0.2)*3;
   ctx.fillStyle='#ffffff';
   ctx.beginPath();ctx.arc(sparkX,gy+gh/2,2.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }
}
