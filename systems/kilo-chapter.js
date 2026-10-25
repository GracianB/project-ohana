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
 // The note is interrupted by enemies actually defending the flower, not
 // by a harmless patrol almost one screen away. Nearby creatures still block
 // the ritual until defeated or lured outside its immediate playing area.
 return g.enemies?.find(e=>e.hp>0&&!e.friendly&&!e.dying&&!e.fell&&
   Math.abs(e.x+(e.w||0)/2-s.x)<Math.max(112,(Number(e.w)||0)/2+82)&&
   Math.abs(e.y+(e.h||0)/2-(s.y-40))<140)||null;
}

export const KILO_AIR_CHIMES=Object.freeze([
 Object.freeze({id:'w1-kilo-wind-chime-1',x:7580,y:620}),
 Object.freeze({id:'w1-kilo-wind-chime-2',x:7930,y:480}),
 Object.freeze({id:'w1-kilo-wind-chime-3',x:8280,y:620})
]);
export const KILO_SKY_RINGS=Object.freeze([
 {id:'w1-kilo-sky-ring-1',x:4900,y:760},
 {id:'w1-kilo-sky-ring-2',x:5500,y:600},
 {id:'w1-kilo-sky-ring-3',x:6150,y:400},
 {id:'w1-kilo-sky-ring-4',x:7720,y:500},
 {id:'w1-kilo-sky-ring-5',x:8340,y:350}
].map(Object.freeze));
export function updateKiloSkyRoute(g){
 const p=g.player,w=g.world1;if(!kiloChapter(g)||!p||p.dead||!w||!(p._kiloFlightT>0))return;
 const ring=w.skyRings?.find(r=>!r.done);if(!ring||Math.hypot(p.x+p.w/2-ring.x,p.y+p.h/2-ring.y)>46)return;
 g.secrets||={};const found=g.secrets['w1-kilo']||=[];ring.done=true;
 if(found.includes(ring.id))return;found.push(ring.id);
 const complete=w.skyRings.every(r=>r.done);p.xp=(p.xp||0)+8;g.score=(g.score||0)+(complete?500:100);
 g.nums?.add?.(ring.x,ring.y-40,complete?'RUTA DEL CIELO · +8 XP · +500':'ARO '+(w.skyRings.filter(r=>r.done).length)+'/5 · +8 XP','#a9f2ff',true);
 g.onWorld1Beat?.('chime','kilo',2);g.save?.();
}
export function enterKiloAirTrail(g){
 if(!kiloChapter(g)||!g.world1)return;
 const found=g.secrets?.['w1-kilo']||[];
 g.world1.airChimes=KILO_AIR_CHIMES.map(ch=>({...ch,done:found.includes(ch.id)}));
 g.world1.skyRings=KILO_SKY_RINGS.map(r=>({...r,done:found.includes(r.id)}));
}
export function updateKiloAirTrail(g){
 updateKiloSkyRoute(g);
 const p=g.player,w=g.world1;
 if(!kiloChapter(g)||!w||!p||p.dead||p.evo<4||p._kiloFlightMode!=='solar'||!(p._kiloFlightT>0))return;
 for(const ch of w.airChimes||[]){
  if(ch.done||Math.hypot(p.x+p.w/2-ch.x,p.y+p.h/2-ch.y)>48)continue;
  ch.done=true;g.secrets||={};const found=g.secrets['w1-kilo']||=[];
  if(!found.includes(ch.id)){found.push(ch.id);g.score=(g.score||0)+150;g.onWorld1Beat?.('chime','kilo',KILO_AIR_CHIMES.findIndex(c=>c.id===ch.id)+1);g.nums?.add?.(ch.x,ch.y-25,'CARILLÓN · '+w.airChimes.filter(c=>c.done).length+'/3','#ffe4a0',false);g.fx?.emit?.(ch.x,ch.y,{color:'#ffe4a0',count:g.reduceMotion?4:12,size:3,star:true,life:25});g.save?.();}
 }
}
export function kiloSkyGuidance(g){
 if(!kiloChapter(g)||!(g.player?._kiloFlightT>0))return null;
 const rings=g.world1?.skyRings||[],index=rings.findIndex(r=>!r.done);
 if(index<0)return {complete:true,total:rings.length};
 const ring=rings[index],dx=ring.x-(g.player.x+g.player.w/2),dy=ring.y-(g.player.y+g.player.h/2);
 return {complete:false,index:index+1,total:rings.length,id:ring.id,x:ring.x,y:ring.y,direction:(Math.abs(dx)>60?(dx>0?'→':'←'):'')+(Math.abs(dy)>60?(dy>0?' ↓':' ↑'):'')||'AQUÍ'};
}
export function drawKiloAirTrail(ctx,g,cam,t){
 if(!kiloChapter(g))return;
 ctx.save();ctx.textAlign='center';
 const next=g.world1?.skyRings?.find(r=>!r.done),guide=kiloSkyGuidance(g);
 if(guide){
  const width=g.viewW||1280,bw=Math.min(320,width-24),x=(width-bw)/2,y=width<600?300:88;
  ctx.fillStyle='#12323ee8';ctx.fillRect(x,y,bw,51);ctx.strokeStyle='#8bdfeb';ctx.lineWidth=1;ctx.strokeRect(x,y,bw,51);
  ctx.fillStyle='#dbfaff';ctx.font='bold 13px sans-serif';ctx.fillText(guide.complete?'RUTA DEL CIELO COMPLETA':'CIELO · ARO '+guide.index+'/'+guide.total+' '+guide.direction,width/2,y+20);
  ctx.font='11px sans-serif';ctx.fillText(guide.complete?'Premios guardados · continúa la aventura':'Ruta opcional · cruza los aros azules volando',width/2,y+39);
 }

 for(const [index,r] of (g.world1?.skyRings||[]).entries()){
  const x=r.x-cam.x,y=r.y-cam.y;if(x<-70||x>(g.viewW||1600)+70)continue;
  ctx.globalAlpha=r.done?.4:r===next?1:.55;ctx.lineWidth=r===next?5:3;ctx.strokeStyle=r.done?'#a6e2b2':'#83e9ff';
  ctx.beginPath();ctx.ellipse(x,y,30,44,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#243c46';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,35,49,0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#efffff';ctx.font='bold 12px sans-serif';ctx.fillText(r.done?'✓':'ARO '+(index+1)+'/5',x,y-58);
  if(r===next){ctx.font='11px sans-serif';ctx.fillText('CRUZA VOLANDO · +8 XP',x,y+65);}
 }
 ctx.globalAlpha=1;
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
