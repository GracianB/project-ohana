// Kilo's final kit: only real, distinct H/J hits advance this sequence.
export const KILO_COMBO=Object.freeze(['H','J','H']);
const WINDOW=240,READY=360;
function state(g){const p=g.player;if(!g._kiloCombo||g._kiloCombo.owner!==p||g._kiloCombo.room!==g.roomId)g._kiloCombo={owner:p,room:g.roomId,step:0,start:0,readyUntil:0,seen:new WeakSet()};return g._kiloCombo;}
export function kiloComboStatus(g){
 const p=g?.player;if(!p||p.id!=='kilo'||p.dead)return {step:0,ready:false,remaining:0};
 const s=state(g),now=Number(g.t)||0;if(s.step&&now-s.start>WINDOW)s.step=0;
 return {step:s.step,ready:s.readyUntil>now,remaining:Math.max(0,s.readyUntil-now)};
}
export function recordKiloHit(g,key,action){
 if(g?.player?.id!=='kilo'||g.player.dead||(g.player.evo||0)<3||!['H','J'].includes(key)||!action||typeof action!=='object')return false;
 const status=kiloComboStatus(g),s=state(g),now=Number(g.t)||0;
 if(s.seen.has(action))return false;s.seen.add(action);if(status.ready)return false;
 if(key===KILO_COMBO[s.step]){if(!s.step)s.start=now;s.step++;}else{s.step=key==='H'?1:0;s.start=now;}
 if(s.step===3){s.step=0;s.readyUntil=now+READY;g.nums?.add?.(g.player.x,g.player.y-45,'I · ¡REMATE ALOHA!','#ffe49b',true);return true;}return false;
}
export function consumeKiloCombo(g){if(!kiloComboStatus(g).ready)return false;state(g).readyUntil=0;return true;}
export function resetKiloCombo(g){g._kiloCombo=null;}
