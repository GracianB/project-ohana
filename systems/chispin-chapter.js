import {XP_NEED} from './xp.js';
import {drawChispinArcGate} from './chispin-chapter-art-v608.js';
export const CHISPIN_CHAPTER_BOSS_ID='w1-chispin-titan-v1';
export const CHISPIN_CHAPTER_ARENA=Object.freeze({left:8260,right:9320,floor:1134,hp:640});
export const CHISPIN_CHAPTER_GATES=Object.freeze([2860,4460,6260].map((x,i)=>Object.freeze({x,y:1134,w:56,h:180,offset:i*65})));
export const chispinChapter=g=>g?.roomDef?.id==='w1-chispin'&&!!g.roomDef.chispinChapter;
export const chispinBossDefeated=g=>!!g.clearedEncounters?.['w1-chispin']?.includes(CHISPIN_CHAPTER_BOSS_ID);
export function chispinChapterReady(g){return !chispinChapter(g)||!!g.world1Seals?.includes('chispin')||(g.world1?.stations.every(s=>s.done)&&chispinBossDefeated(g));}
export function chispinGrowth(g){
 if(!chispinChapter(g)||!g.world1||!g.player)return 0;
 const floor=XP_NEED[Math.min(4,g.world1.stations.filter(s=>s.done).length)]||0;
 g.player.xp=Math.max(Number(g.player.xp)||0,floor);return floor;
}
export function chispinGateState(g,index){
 const gate=CHISPIN_CHAPTER_GATES[index];if(!gate)return null;
 const tick=Number(g.world1?.tick)||0,phase=(tick+gate.offset)%240;
 if(tick<(g.world1?.chispinSilenced?.[index]||0))return 'silenced';
 return phase<90?'open':phase<120?'warn':'active';
}
export function chispinChapterAbility(g,p,index){
 if(!chispinChapter(g)||p?.id!=='chispin'||index!==0||!g.world1)return;
 const i=CHISPIN_CHAPTER_GATES.findIndex(gate=>Math.hypot(p.x+p.w/2-(gate.x+gate.w/2),p.y+p.h-(gate.y-40))<250);
 if(i<0)return;
 const clocks=g.world1.chispinSilenced||=[];clocks[i]=g.world1.tick+150;
 g.nums?.add?.(CHISPIN_CHAPTER_GATES[i].x,p.y-50,'J · ARCO CORTOCIRCUITADO','#fff3a0',false);
}
export function updateChispinChapter(g,hurt){
 if(!chispinChapter(g)||!g.world1||!g.player||g.player.dead)return;
 chispinGrowth(g);
 const p=g.player;
 for(const [i,gate] of CHISPIN_CHAPTER_GATES.entries()){
  if(chispinGateState(g,i)!=='active')continue;
  if(p.x+p.w>gate.x&&p.x<gate.x+gate.w&&p.y+p.h>gate.y-gate.h&&p.y<gate.y)hurt?.(12,'DESCARGA · J corta el arco; K cruza o espera a que se abra');
 }
}
export function chispinObjective(g){
 if(!chispinChapter(g)||g.world1?.sealed||!g.world1?.stations.every(s=>s.done))return null;
 return {x:8750,y:1134,label:'Titán de Trueno',action:'Las cuatro antenas están conectadas · esquiva los avisos y ataca cuando abra el núcleo'};
}
export function drawChispinChapter(ctx,g,cam){
 if(!chispinChapter(g))return;
 const t=g.world1?.tick||0,reduced=!!g.reduceMotion;
 for(const [i,gate] of CHISPIN_CHAPTER_GATES.entries()){
  const x=gate.x-cam.x;
  if(x<-280||x>(g.viewW||1280)+280)continue;
  const state=chispinGateState(g,i);
  drawChispinArcGate(ctx,gate,state,cam,t,reduced);
 }
}
