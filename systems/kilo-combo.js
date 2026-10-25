// I is earned by three distinct, successful H/J casts, in any order. Readiness
// stays until used; a missed or blocked cast never counts, nor repeated aura ticks.
export const KILO_COMBO=Object.freeze(['H/J','H/J','H/J']);
function state(g){const p=g.player;if(!g._kiloCombo||g._kiloCombo.owner!==p||g._kiloCombo.room!==g.roomId)g._kiloCombo={owner:p,room:g.roomId,step:0,ready:false,seen:new WeakSet()};return g._kiloCombo;}
export function kiloComboStatus(g){const p=g?.player;if(!p||p.id!=='kilo'||p.dead)return {step:0,ready:false,remaining:0};const s=state(g);return {step:s.step,ready:s.ready,remaining:0};}
export function recordKiloHit(g,key,action){
 if(g?.player?.id!=='kilo'||g.player.dead||(g.player.evo||0)<3||!['H','J'].includes(key)||!action||typeof action!=='object')return false;
 const s=state(g);if(s.ready||s.seen.has(action))return false;s.seen.add(action);s.step++;
 if(s.step>=3){s.ready=true;g.nums?.add?.(g.player.x,g.player.y-45,'I LISTO · PULSA PARA REMATAR','#f1ffe5',true);return true;}
 g.nums?.add?.(g.player.x,g.player.y-45,'REMATE I · '+s.step+'/3','#d6eedb',false);return false;
}
export function consumeKiloCombo(g){if(!kiloComboStatus(g).ready)return false;const s=state(g);s.ready=false;s.step=0;s.seen=new WeakSet();return true;}
export function resetKiloCombo(g){g._kiloCombo=null;}
