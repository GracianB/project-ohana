import {readCombatDifficulty,scaleCombatHealth} from './combat-difficulty.js';
const states=['_drummer','_glitch','_titan','_astralCat','_prismBeast','_igneousDragon','_stoneColossus','_crispyKing','_magmaChef','_spiritGuide'];
export function chapterBossMind(e){return states.map(k=>e?.[k]).find(Boolean);}
export function prepareChapterBossV2(e,g){
 if(e?.gauntletBoss||!e?.miniBoss||!e.roomId?.startsWith('w1-')||e.hp<=0)return;
 const b=chapterBossMind(e),p=g.player;if(!b||!p)return;
 const d=readCombatDifficulty();
 if(!e._v2Boss){
  if(!e._combatHealthScaled)scaleCombatHealth(e,d);
  e.max=Math.round(e.max*1.2);e.hp=e.max;
  const foot=e.y+e.h;e.w=Math.max(156,e.w);e.h=Math.max(176,e.h);e.y=foot-e.h;
  e._v2Boss={phase:null,turn:0};
 }
 const v=e._v2Boss,clockKey='timer' in b?'timer':'clock';e.stun=Math.min(e.stun||0,8);
 if(v.phase!==b.phase){
  if(b.phase==='warn'){
   v.turn++;const air=p.y+p.h<e.y+e.h-95,far=Math.abs(p.x-e.x)>310;
   // Read at commitment only: after the warning begins no aim or pattern moves.
   // Every third turn keeps the native cycle so baiting never freezes the boss.
   if(!e._drummer)b.attack=v.turn%3===0?(Math.floor(v.turn/3)-1)%4:air?3:far?1:2;
   b.aim=Math.sign(p.x+p.w/2-e.x-e.w/2)||1;
   v.target={x:p.x+p.w/2+Math.max(-55,Math.min(55,(p.vx||0)*9)),y:p.y+p.h/2};
   b[clockKey]=Math.max(28,Math.round((b[clockKey]||50)*d.windup));
  }
  if(b.phase==='rest'){
   e.damageWindowRemaining=Math.round(125*(d.budget===1?1.35:1));
   b[clockKey]=Math.max(30,Math.round((b[clockKey]||60)*d.cooldown));
  }
  if((b.phase==='attack'||b.phase==='strike')&&v.target&&v.turn>1){
   const x=e.x+e.w/2,y=e.y+e.h*.4,angle=Math.atan2(v.target.y-y,v.target.x-x);
   if(Math.abs(v.target.x-x)>250||v.target.y<e.y){
    for(const spread of (d.budget>=4?[-.14,0,.14]:[0]))if((g.projectiles?.length||0)<130)g.projectiles.push({x,y,w:16,h:16,vx:Math.cos(angle+spread)*6.2,vy:Math.sin(angle+spread)*6.2,owner:'enemy',dmg:17,life:145,color:'#f8be9a'});
   }
  }
  v.phase=b.phase;
 }
 e.damageTakenScale=b.phase==='rest'&&e.damageWindowRemaining>0?1:0;
}
