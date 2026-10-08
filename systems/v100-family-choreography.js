// OHANA V100 · Ten distinct heroes, ten victory personalities.
// Decorative pose choreography ONLY; no hitbox, damage, or simulation mutations.
export const FAMILY_ROSTER_V100=Object.freeze({
 kilo:Object.freeze({pose:"victory",offset:.1,tempo:1.75,amp:2}),
 stitcho:Object.freeze({pose:"attack",offset:.7,tempo:2.35,amp:3}),
 chispin:Object.freeze({pose:"jump",offset:1.3,tempo:2.85,amp:7}),
 cat:Object.freeze({pose:"run",offset:2.2,tempo:2.1,amp:2}),
 dragon:Object.freeze({pose:"victory",offset:2.9,tempo:1.7,amp:4}),
 dino:Object.freeze({pose:"attack",offset:3.5,tempo:1.55,amp:5}),
 frita:Object.freeze({pose:"jump",offset:4.1,tempo:3.1,amp:6}),
 pizza:Object.freeze({pose:"run",offset:4.8,tempo:2.5,amp:3}),
 yomi:Object.freeze({pose:"victory",offset:5.4,tempo:1.15,amp:1}),
 cuerno:Object.freeze({pose:"victory",offset:6.1,tempo:2.2,amp:3}),
});
const REST=Object.freeze({pose:"idle",lift:0,grounded:true,melee:0,vx:0});
const CHOSEN=Object.freeze({pose:"victory",lift:0,grounded:true,melee:0,vx:0});
export function familyFinaleBeat(id,time,{reduced=false,chosen=false}={}){
 if(reduced)return chosen?CHOSEN:REST;
 if(chosen)return CHOSEN;
 const beat=FAMILY_ROSTER_V100[id];if(!beat)return REST;
 const t=Math.max(0,Math.min(360,Number.isFinite(time)?time:0));
 const wave=Math.sin(t*beat.tempo+beat.offset);
 const active=wave>.38;
 const jump=beat.pose==="jump";
 const attack=beat.pose==="attack";
 const running=beat.pose==="run";
 return {
  pose:active?beat.pose:"idle",
  lift:jump&&active?-Math.max(0,wave)*beat.amp:Math.sin(t*beat.tempo*.6+beat.offset)*beat.amp*.27,
  grounded:!(jump&&active),
  melee:attack&&active?9:0,
  vx:running&&active?1.8:0,
 };
}
