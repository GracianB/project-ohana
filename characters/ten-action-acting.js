// V459 · Ten complete, deterministic action channels for all ten OHANA heroes.
// Visual performance only: never touches physics, hitboxes, progression or timers.
// Channel choreography has individual weight/tempo/elasticity, not just recoloured FX.
export const ACTION_CHANNELS=Object.freeze(['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory']);
export const ACTION_PROFILES=Object.freeze({
 kilo:{tempo:.82,weight:.72,elastic:1.20,tilt:.78,accent:'#ffe0a6'},
 stitcho:{tempo:1.34,weight:.74,elastic:1.24,tilt:1.35,accent:'#88e9ff'},
 chispin:{tempo:1.55,weight:.62,elastic:1.31,tilt:1.28,accent:'#fff6a5'},
 cat:{tempo:1.12,weight:.62,elastic:1.20,tilt:1.08,accent:'#d6c0ff'},
 dragon:{tempo:.81,weight:1.19,elastic:.82,tilt:.73,accent:'#f6a678'},
 dino:{tempo:.7,weight:1.45,elastic:.75,tilt:.68,accent:'#c4e899'},
 frita:{tempo:1.31,weight:.64,elastic:1.35,tilt:1.2,accent:'#ffe7aa'},
 pizza:{tempo:1.08,weight:.84,elastic:1.5,tilt:.98,accent:'#f8d099'},
 yomi:{tempo:.98,weight:.67,elastic:1.08,tilt:.95,accent:'#f4c4e3'},
 cuerno:{tempo:1,weight:1.05,elastic:.91,tilt:.91,accent:'#dfd3fc'}
});
const clamp=(x,min,max)=>Math.max(min,Math.min(max,Number(x)||0));
const ease=(u)=>Math.sin(Math.PI*clamp(u,0,1));
const CALM=Object.freeze({dx:0,dy:0,rotation:0,sx:1,sy:1,ear:0,tail:0,paw:0,wing:0,glow:0});
export function tenActionPose(pose={},id='cat',form=0){
 const state=pose.state||'idle',profile=ACTION_PROFILES[id]||ACTION_PROFILES.cat;
 if(!ACTION_CHANNELS.includes(state)||pose.reduceMotion)return {...CALM,state,form};
 const t=(Number(pose.t)||0)*profile.tempo;
 const phase=(Number(pose.phase)||0)*profile.tempo;
 const s=Math.sin(t*.085),b=Math.sin(t*.105+.8),step=Math.sin(phase);
 const speed=clamp(pose.speed||.7,0,1.5),k=profile.elastic,w=profile.weight,turn=profile.tilt;
 const attack=ease(pose.atk ?? .5),cast=ease(pose.cast ?? .5);
 const mod=1+Math.max(0,Math.min(4,Number(form)||0))*.035;
 const q={...CALM,state,form};
 switch(state){
  case 'idle': // Inhale, ear-scanning, soft tail rhythm.
   q.dy=-s*.55*k;q.sx=1+b*.004*k;q.sy=1-s*.007*k;
   q.ear=s*.1;q.tail=b*.24;q.paw=Math.sin(t*.035)*.08;break;
  case 'run': // Individual gait and weight-transfer counter-rotation.
   q.dy=-Math.abs(step)*2.3*k;q.dx=step*.65;
   q.rotation=-step*.026*turn;q.sx=1+Math.abs(step)*.024*k;
   q.sy=1-Math.abs(step)*.034*w;q.ear=-Math.abs(step)*.18;
   q.paw=step*.85;q.tail=-step*.57;break;
  case 'jump': // Anticipation/tuck with rising ears and unfurling tail.
   q.dy=-3.2*k+s*.8;q.rotation=-.045*turn+s*.012;
   q.sx=.957;q.sy=1.072;q.ear=-.28;q.tail=.48+s*.1;q.paw=-.95+s*.15;break;
  case 'fall': // Flared silhouette and leg-search, visibly different from jump.
   q.dy=s*.52;q.rotation=.04*turn+Math.sin(t*.06)*.012;
   q.sx=1.055;q.sy=.935;q.ear=.23;q.tail=-.53+b*.16;q.paw=.65;break;
  case 'glide': // Lift-generating lateral float.
   q.dy=s*1.15;q.rotation=s*.034*turn;
   q.sx=1.048;q.sy=.961;q.wing=.85+b*.18;q.ear=-.19;
   q.tail=s*.4;q.paw=.42;break;
  case 'wall': // Braced asymmetric pose.
   q.dx=-1.6+s*.38;q.rotation=-.095*turn+s*.009;
   q.sx=.94;q.sy=1.052;q.paw=-.8;q.tail=.45+s*.13;q.ear=-.15;break;
  case 'attack': // Wind-up, weight transfer, impact recovery.
   q.dx=attack*2.4*turn;q.dy=-attack*1.5;
   q.rotation=-attack*.105*turn;q.sx=1+attack*.075*k;
   q.sy=1-attack*.045*w;q.paw=1.9*attack;q.tail=-attack*.75;
   q.glow=attack;break;
  case 'cast': // Three-step charge: head/arms gather, body then releases.
   q.dy=-cast*(2.2+s*.35);q.rotation=s*.02*turn;
   q.sx=1+cast*.045;q.sy=1-cast*.026;
   q.paw=cast*1.2;q.tail=cast*.58;q.wing=cast*.7;
   q.glow=cast;break;
  case 'hurt': // Physical recoil, not merely a red flash.
   q.dx=-2.7+(s*.3);q.rotation=-.13*turn+s*.01;
   q.sx=.94;q.sy=.96;q.ear=-.3;q.tail=-.55;q.paw=-.48;break;
  case 'victory': // Strong anticipation and peak release with hero-specific spring.
   q.dy=-3.6*k-Math.abs(s)*2.3*q.sy;
   q.rotation=s*.055*turn;q.sx=1+.035*k*q.glow;q.sy=1.048;
   q.ear=-.22;q.tail=.35+s*.43;q.paw=1.24;q.wing=.8;
   q.glow=.7+.2*b;break;
 }
 q.dy*=mod;q.dx*=mod;
 return q;
}
// One local stage transform shared by vector and optional painted visuals.
// Pose channels are applied once in the renderer. They never double-scale
// evolution size or mutate actor inputs.
export function applyTenActionPose(ctx,pose={},id='cat',form=0){
 const v=tenActionPose(pose,id,form);
 ctx.translate(v.dx,v.dy);ctx.rotate(v.rotation);ctx.scale(v.sx,v.sy);
 return v;
}
