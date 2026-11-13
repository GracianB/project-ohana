// Bounded, deterministic acting shared by actual gameplay, the Atlas and films.
const value=(x,d=0)=>Number.isFinite(x)?x:d;
const bound=(x,a=0,b=1)=>Math.max(a,Math.min(b,value(x)));
export function michiActing(p={},form=0){
 const state=p.state||'idle',still=!!p.reduceMotion||state==='dead',t=still?0:value(p.t),idle=state==='idle';
 const presence=p.michiPresence||{},attention=bound(presence.attention),age=((t+form*83)%480+480)%480;
 const gesture=idle&&!still&&(presence.idleTicks==null||presence.idleTicks>90)?Math.sin(Math.PI*bound((age-200)/90)):0;
 return{t,gesture,breath:still?0:Math.sin(t*.055+form)*.7,ear:still?0:Math.sin(t*.043+form)*.06+gesture*.16,
  attention,kind:presence.kind||'idle',lookX:attention>.15?bound(presence.lookX,-1,1):bound(p.look?.x,-1,1),lookY:bound(presence.lookY,-1,1),
  threat:presence.kind==='threat'?attention:0,curious:presence.kind==='curious'?attention:0,friend:presence.kind==='friend'?attention:0,
  wing:p.michiMotion?.flight||(['jump','glide'].includes(state)?state:'ground'),fuel:bound(p.michiMotion?.fuel),
  vx:bound(p.michiMotion?.vx,-20,20),vy:bound(p.michiMotion?.vy,-16,16),power:Math.max(0,Math.min(5,Math.trunc(value(p.michiPowerIndex,value(p.castSlot)))))};
}

// Visual choreography follows the real immediate H contact and existing pose
// signals. It never delays attacks, changes cooldowns, or moves the hitbox.
export function michiChoreography(p={},form=0){
 const f=Math.max(0,Math.min(4,Math.round(value(form))));
 const still=!!p.reduceMotion||p.state==='dead',active=p.state==='attack',cast=p.state==='cast';
 const progress=still?.28:bound(Number.isFinite(p.powerProgress)?p.powerProgress:p.atk),extension=active?1-bound(progress/.55):0,follow=active?Math.sin(progress*Math.PI):0,settle=active?bound((progress-.45)/.55):0;
 const land=still?0:bound(p.land),brake=still?0:bound(p.brake),turn=still?0:bound(Math.abs(value(p.turnPulse))),brace=p.state==='idle'&&p.michiPresence?.kind==='threat'?bound(p.michiPresence.attention):0;
 const castProgress=still?.5:bound(Number.isFinite(p.powerProgress)?p.powerProgress:p.cast),charge=cast?Math.sin(castProgress*Math.PI):0;
 return{extension,follow,settle,land,brake,turn,brace,charge,
  reach:extension*[10,10,16,8,11][f]+follow*(1-settle)*2,
  lean:extension*[.05,.07,.05,-.04,.06][f]-follow*.025-brake*.045-turn*.035,
  widen:land*.035+brake*.02,compress:land*(form===4?.025:.065)+brace*.025,
  wingFlare:land*.12+brake*.18+turn*.1,tailLag:still?0:brake*5+turn*7,
  ghostFade:1-brake*.12-turn*.08,
  offhand:cast?(form===3?charge*((p.michiPowerIndex??p.castSlot)===1?10:-7):charge*3):0};
}

// The foot clears the floor only during its return swing. Ground contact has
// no vertical drift; dead, idle and reduced-motion frames stay planted.
export function michiPawCycle(p={},offset=0,stride=5,lift=4){
 if(p.still||p.reduceMotion||p.state!=='run')return{step:0,lift:0};
 const phase=value(p.phase)*.95+value(offset);
 return{step:Math.sin(phase)*Math.max(0,Math.min(12,value(stride))),lift:Math.max(0,Math.cos(phase))*Math.max(0,Math.min(9,value(lift)))};
}
