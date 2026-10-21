// V460 · Michicornio performance rig. Pure time/pose → local joint values.
// Time drives the gait if a preview/cinematic has no locomotion phase. Neither
// this file nor the renderer mutates position, collision or save data.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const sin=Math.sin,PI=Math.PI;
const smooth=u=>{const x=clamp(u,0,1);return x*x*(3-2*x);};
export const MICHI_KINETIC_STATES=Object.freeze([
 'idle','run','jump','fall','glide','wall','attack','cast','hurt','victory'
]);
export function michiMotion(pose={},form=0){
 const state=pose.state||'idle',reduced=!!pose.reduceMotion;
 const clock=reduced?0:(Number(pose.t)||0),phase=reduced?0:
   (Number.isFinite(pose.phase)&&Math.abs(pose.phase)>1e-4?pose.phase:clock*.24);
 const step=reduced?0:sin(phase),follow=reduced?0:sin(phase-.87);
 const stride=state==='run'?clamp(pose.speed??1,.28,1.25):0;
 const motion=MICHI_KINETIC_STATES.includes(state)?state:'idle';
 const run=motion==='run',air=['jump','fall','glide'].includes(motion);
 const land=air?0:clamp(pose.land,0,1),cast=clamp(pose.cast,0,1),atk=clamp(pose.atk,0,1);
 const slot=Number.isInteger(pose.michiPowerIndex)?pose.michiPowerIndex:
   motion==='cast'?Number(pose.castSlot):-1;
 const swipe=motion==='attack'?sin(atk*PI):slot===0?sin(cast*PI):0;
 const breath=reduced?0:sin(clock*.073);
 const blink=!reduced&&((clock+form*17)%181)<4?1:0;
 const anim=1+form*.11;
 const tuck=slot===4?1:motion==='jump'?1:motion==='fall'?.35:0;
 const reach=slot===2?sin(cast*PI):slot===4?.9:0;
 const lag=run?follow:air?sin(clock*.12):sin(clock*.061);
 const stage=pose.michiWelcome;
 const inspect=clamp(stage?.inspect,0,1),groom=clamp(stage?.groom,0,1);
 const flick=clamp(stage?.flick,0,1),purr=clamp(stage?.purr,0,1);
 const castBeat=motion==='cast'?sin(cast*PI):0;
 const formJelly=form===2||form===4;
 const legReach=run?step*anim:motion==='jump'?-1.1:motion==='fall'?.55:0;
 return {
  state:motion,slot,cycle:step,
  lean:reduced?0:run?.105*stride*step:motion==='jump'?.1:motion==='fall'?-.07:
   motion==='wall'?-.09:swipe*-.12,
  lift:reduced?0:run?-Math.abs(step)*3.8*stride:breath*.65+
   (formJelly?sin(clock*.041)*1.3:0),
  sx:1+(reduced?0:land*.12)-(motion==='jump'&&!reduced?.055:0)+(run?.013*Math.abs(step):0),
  sy:1-(reduced?0:land*.12)+(motion==='jump'&&!reduced?.055:0)-(run?.012*Math.abs(step):0),
  head:reduced?0:run?-follow*.093:swipe*.14+sin(clock*.038)*.037+
   inspect*.12-groom*.08,
  tail:reduced?0:run?-follow*.54:air?lag*.37:sin(clock*.052)*.26+
   flick*.42+purr*.16,
  ear:reduced?0:run?-.15-Math.abs(step)*.15:motion==='fall'?.24:
   swipe*-.16+sin(clock*.084)*.09+inspect*.12,
  backX:reduced?0:run?-step*12*stride:-tuck*5,
  frontX:reduced?0:run?step*12*stride:tuck*8+swipe*5,
  backY:reduced?0:run?-Math.max(0,-Math.cos(phase))*9*stride:-tuck*7,
  frontY:reduced?0:run?-Math.max(0,Math.cos(phase))*9*stride:-tuck*10,
  rearPaw:reduced?0:slot===1?.3+sin(clock*.2)*.22:
   run?-step*.72:-tuck*.55,
  frontPaw:reduced?0:(slot===1?.3-sin(clock*.2)*.22:0)+swipe*1.8+
   reach*1.4+(run?step*.86:-tuck*.65)+groom*.55,
  crouch:reduced?0:land*4+(slot===1?2:0),
  mood:slot===1?'happy':swipe>.2||slot===2?'angry':motion==='hurt'?'sad':
   purr>.3?'happy':null,
  // New local channels, all bounded so optical growth and hitboxes stay stable.
  blink,lookX:reduced?0:clamp(sin(clock*.017+form)*.65+inspect*.4,-1,1),
  jaw:reduced?0:motion==='victory'?.45+sin(clock*.16)*.18:
   castBeat*.35+sin(clock*.062)*.08,
  spine:reduced?0:run?step*.17:sin(clock*.047)*.046,
  shoulder:reduced?0:run?-step*.46:swipe*.44+castBeat*.25,
  haunch:reduced?0:run?follow*.32:land*.3,
  pawReach:reduced?0:run?legReach:swipe*1.4+castBeat*.7,
  ribbon:reduced?0:lag*(formJelly?1:.5)*anim+
   (motion==='cast'?castBeat*.5:0),
  mantle:reduced?0:formJelly?sin(clock*.063)*.055+
   (motion==='cast'?castBeat*.09:0):breath*.02,
  bounce:reduced?0:run?Math.abs(step)*3.0:motion==='victory'?Math.abs(sin(clock*.11))*2.0:0,
  gaze:reduced?0:sin(clock*.023)*.28,
  cloud:form===2,wing:form===4&&!reduced?(air?sin(clock*.2)*.3:lag*.08):0
 };
}
