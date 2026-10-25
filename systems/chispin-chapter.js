import {XP_NEED} from './xp.js';
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
 ctx.save();ctx.textAlign='center';
 for(const [i,gate] of CHISPIN_CHAPTER_GATES.entries()){
  const x=gate.x-cam.x,y=gate.y-cam.y,state=chispinGateState(g,i);
  if(x<-280||x>(g.viewW||1280)+280)continue;
  ctx.fillStyle='#23283f';ctx.strokeStyle='#ffe78a';ctx.lineWidth=2;
  for(const side of [0,gate.w]){ctx.fillRect(x+side-9,y-gate.h,18,gate.h);ctx.strokeRect(x+side-9,y-gate.h,18,gate.h);}
  ctx.fillStyle=state==='active'?'#ffd65a':state==='warn'?'#ffaf82':'#9aefd1';
  ctx.beginPath();ctx.arc(x+gate.w/2,y-gate.h-12,9,0,Math.PI*2);ctx.fill();
  if(state==='active'||state==='warn'){
   ctx.strokeStyle=state==='active'?'#fff0a0':'#f6b879';ctx.lineWidth=state==='active'?4:2;
   for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(x,y-gate.h*k/4);ctx.lineTo(x+18,y-gate.h*k/4-8);ctx.lineTo(x+38,y-gate.h*k/4+7);ctx.lineTo(x+gate.w,y-gate.h*k/4);ctx.stroke();}
  }
  ctx.fillStyle='#102a39';ctx.fillRect(x-110,y-gate.h-80,276,47);ctx.fillStyle='#fff8d8';ctx.font='bold 12px sans-serif';
  ctx.fillText(state==='active'?'ARCO ACTIVO':state==='warn'?'AVISO · VA A CERRARSE':state==='silenced'?'ARCO CORTOCIRCUITADO':'PASO ABIERTO',x+gate.w/2,y-gate.h-61);
  ctx.font='11px sans-serif';ctx.fillText('J corta · K cruza · puedes esperar',x+gate.w/2,y-gate.h-43);
 }
 ctx.restore();
}
