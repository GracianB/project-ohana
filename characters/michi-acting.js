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
