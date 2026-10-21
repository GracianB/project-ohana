const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
// Articulation in character space. No particles, physics or collision changes.
export function michiMotion(pose={},form=0){
 const state=pose.state||'idle',phase=Number(pose.phase)||0,t=Number(pose.t)||0;
 const reduced=!!pose.reduceMotion,run=state==='run',air=['jump','fall','glide'].includes(state);
 const step=reduced?0:Math.sin(phase),stride=run?clamp(pose.speed,.2,1):0;
 const land=air?0:clamp(pose.land,0,1),cast=clamp(pose.cast,0,1),atk=clamp(pose.atk,0,1);
 const slot=Number.isInteger(pose.michiPowerIndex)?pose.michiPowerIndex:state==='cast'?Number(pose.castSlot):-1;
 const swipe=state==='attack'?Math.sin(atk*Math.PI):slot===0?Math.sin(cast*Math.PI):0;
 const breath=reduced?0:Math.sin(t*.065)*.6;
 const tuck=slot===4?1:state==='jump'?1:state==='fall'?.35:0;
 const reach=slot===2?Math.sin(cast*Math.PI):slot===4?.9:0;
 return {
  state,slot,
  lean:reduced?0:run?.14*stride:state==='jump'?.12:state==='fall'?-.08:swipe*-.18,
  lift:reduced?0:run?-Math.abs(step)*4.5*stride:breath,
  sx:1+(reduced?0:land*.16)-(state==='jump'&&!reduced?.06:0),
  sy:1-(reduced?0:land*.14)+(state==='jump'&&!reduced?.07:0),
  head:reduced?0:run?-step*.055:swipe*.17+Math.sin(t*.045)*.025,
  tail:reduced?0:run?-step*.42:air?-.35:Math.sin(t*.052)*.15,
  ear:reduced?0:run?-.12-Math.abs(step)*.12:state==='fall'?.22:swipe*-.2,
  backX:run?-step*10*stride:-tuck*6,
  frontX:run?step*10*stride:tuck*8,
  backY:run?-Math.max(0,-Math.cos(phase))*8*stride:-tuck*7,
  frontY:run?-Math.max(0,Math.cos(phase))*8*stride:-tuck*11,
  rearPaw:slot===1?.3+(reduced?0:Math.sin(t*.2)*.25):run?-step*.65:-tuck*.6,
  frontPaw:(slot===1?.3-(reduced?0:Math.sin(t*.2)*.25):0)+swipe*1.9+reach*1.4+(run?step*.75:-tuck*.8),
  crouch:land*5+(slot===1?3:0),
  mood:slot===1?'happy':swipe>.2||slot===2?'angry':state==='hurt'?'sad':null,
  cloud:form===2,wing:form===4&&!reduced?(air?Math.sin(t*.24)*.35:Math.sin(t*.08)*.06):0,
 };
}
