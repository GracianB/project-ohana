import {KEEPSAKE_ORDER,KEEPSAKES} from './keepsakes.js';
import {FINAL_PORTALS} from './final-portal-mirrors.js';
import {WORLD1_FLOOR} from './world1-rooms.js';

export const FINAL_RESONANCE_KEY='ohana-final-resonances-v1';
const PREFIX='w1-final-ritual-v630-';
export const FINAL_QUIMERA_PORTAL=Object.freeze({x:6900,y:934,rx:108,ry:132,hero:'quimera'});
export const FINAL_RITUAL_PORTALS=Object.freeze([...FINAL_PORTALS,FINAL_QUIMERA_PORTAL]);
const validHero=hero=>KEEPSAKE_ORDER.includes(hero);
const permitted=g=>g?.roomId==='w1-final'&&g.finalRitualEnabled&&!g.onlineAdventure&&g.player&&!g.player.dead&&g.player.health>0&&KEEPSAKE_ORDER.every(h=>g.world1Seals?.includes(h));
const storage=g=>g.finalResonanceStorage||g.keepsakeStorage||globalThis.localStorage;
export function ritualPortal(hero){return hero==='quimera'?FINAL_QUIMERA_PORTAL:FINAL_PORTALS.find(p=>p.hero===hero);}
export function ritualTokenPositions(hero){const portal=ritualPortal(hero);return validHero(hero)&&portal?[-78,0,78].map((offset,index)=>({hero,index,id:PREFIX+hero+'-'+index,x:portal.x+offset,y:WORLD1_FLOOR-14})):[];}
export function readFinalResonances(g){
 let stored={};try{stored=JSON.parse(storage(g)?.getItem(FINAL_RESONANCE_KEY)||'{}');}catch{}
 const secrets=new Set(g?.secrets?.['w1-final']||[]),out={};
 for(const hero of KEEPSAKE_ORDER)out[hero]=[0,1,2].filter(index=>Array.isArray(stored?.[hero])&&stored[hero].includes(index)||secrets.has(PREFIX+hero+'-'+index));
 return out;
}
function remember(g,v,token){
 const list=v.resonances[token.hero];if(list.includes(token.index))return false;
 list.push(token.index);list.sort();v.lastPickup={hero:token.hero,index:token.index,at:v.tick};g.secrets||={};g.secrets['w1-final']||=[];
 if(!g.secrets['w1-final'].includes(token.id))g.secrets['w1-final'].push(token.id);
 try{storage(g)?.setItem(FINAL_RESONANCE_KEY,JSON.stringify(v.resonances));}catch{}
 g.fx?.emit?.(token.x,token.y-24,{color:KEEPSAKES[token.hero].color,count:g.reduceMotion?4:15,size:3,life:34,up:2});
 g.onGauntletBeat?.('resonance',token.hero);g.save?.();return true;
}
function promptChoice(g,v){
 if(!permitted(g)||g.world1Cine||g._pendingWorld1Cine||v.phase!=='gathering')return false;
 const quimera=v.hero==='quimera';if(!quimera&&(v.resonances[v.hero]?.length||0)!==3)return false;
 v.phase='choosing';
 g.requestFinalHero?.({target:v.hero,selected:g.player.id,quimera,
  choose:hero=>chooseFinalFighter(g,hero),
  cancel:()=>{if(g.finalGauntlet===v&&v.phase==='choosing'){v.phase='gathering';v.choicePrompted=true;}}
 });
 return true;
}
export function chooseFinalFighter(g,hero){
 const v=g?.finalGauntlet;
 if(!permitted(g)||!v||v.phase!=='choosing'||!validHero(hero)||g.world1Cine||g._pendingWorld1Cine||g.boss)return false;
 if(v.hero!=='quimera'&&(v.resonances?.[v.hero]?.length||0)!==3)return false;
 v.fighter=hero;v.phase='summoning';v.summonTicks=0;g.finalFighter=hero;
 g.onGauntletBeat?.('summon',v.hero);
 return true;
}
export function interactFinalRitual(g){
 const v=g?.finalGauntlet;if(!permitted(g)||v?.phase!=='gathering')return false;
 const portal=ritualPortal(v.hero),p=g.player;
 return !!portal&&Math.abs(p.x+p.w/2-portal.x)<190&&promptChoice(g,v);
}

// The encounter owner still starts, ends and saves every actual duel. This
// gate adds earned floor pickups and a choice; it never awards a keepsake.
export function updateSoloFinalRitual(g,v){
 if(!permitted(g)||g.world1Cine||g._pendingWorld1Cine)return 'waiting';
 v.resonances||=readFinalResonances(g);
 if(v.phase==='complete')return 'complete';
 if(v.phase==='dormant'){
  v.hero=KEEPSAKE_ORDER.find(hero=>!v.found.includes(hero))||'quimera';
  v.guardian=null;v.object=null;v.phase='gathering';v.choicePrompted=false;v.fighter=null;
  if(v.found.length||v.hero==='quimera')g.onFinalRitualReturn?.(ritualPortal(v.hero));
 }
 if(v.phase==='gathering'){
  for(const token of ritualTokenPositions(v.hero)){
   const p=g.player;if(Math.abs(p.x+p.w/2-token.x)<29&&Math.abs(p.y+p.h-token.y)<90)remember(g,v,token);
  }
  const ready=v.hero==='quimera'||v.resonances[v.hero].length===3;
  if(ready&&!v.choicePrompted){v.choicePrompted=true;promptChoice(g,v);}
 }
 if(v.phase==='summoning'){
  v.summonTicks++;
  if(v.summonTicks>=48){
   if(v.hero==='quimera'){
    if(g.onGauntletHero?.(v.fighter)===false){v.phase='gathering';v.choicePrompted=false;return 'waiting';}
    v.phase='complete';return 'complete';
   }
   return 'duel';
  }
 }
 return 'waiting';
}

export function finalRitualObjective(g){
 const v=g?.finalGauntlet;if(!g?.finalRitualEnabled||!v||!['gathering','choosing','summoning'].includes(v.phase))return null;
 const portal=ritualPortal(v.hero);if(!portal)return null;
 const tokens=ritualTokenPositions(v.hero),remaining=tokens.find(token=>!v.resonances?.[v.hero]?.includes(token.index));
 const count=v.hero==='quimera'?3:(v.resonances?.[v.hero]?.length||0);
 return {x:remaining?.x||portal.x,y:WORLD1_FLOOR,label:v.hero==='quimera'?'El núcleo de Quimera':'Núcleo de '+KEEPSAKES[v.hero].guardian,
  action:v.phase==='summoning'?'La energía está invocando al guardián':count<3?`Recoge sus objetos del suelo · ${count}/3 resonancias`:v.phase==='choosing'?'Elige el héroe con el que quieres combatir':'E · elige tu héroe e invoca al guardián'};
}
