// Visual attention only: never collects, attacks, changes facing, or moves an actor.
const finite=(x,d=0)=>Number.isFinite(x)?x:d;
export function updateMichiPresence(g,input={}){
 const p=g?.player;if(p?.id!=='cat')return false;
 const idle=Math.abs(finite(p.vx))<.3&&!input.left&&!input.right&&!input.jump&&!input.drop&&!(p.melee>0)&&!(p._castT>0);
 p._michiIdleTicks=idle&&!p.dead?(finite(p._michiIdleTicks)+1)%3600:0;
 const px=p.x+p.w/2,py=p.y+p.h/2;let target=null,score=Infinity;
 const consider=(e,kind,radius,bias=0)=>{if(!e||!Number.isFinite(e.x)||!Number.isFinite(e.y))return;const dx=e.x+(e.w||0)/2-px,dy=e.y+(e.h||0)/2-py,d=Math.hypot(dx,dy);if(d<radius&&d+bias<score){score=d+bias;target={kind,lookX:Math.max(-1,Math.min(1,dx*(p.facing||1)/90)),lookY:Math.max(-1,Math.min(1,dy/85)),distance:d};}};
 if(!p.dead){
  for(const e of g.enemies||[])if(e.hp>0&&!e.dead&&!e.hidden)consider(e,'threat',190,-45);
  for(const e of g.orbs||[])if(!e.taken)consider(e,'curious',145,15);
  for(const e of g.world1?.stations||[])if(!e.done)consider(e,'curious',125,25);
  const guest=g._evolutionAttacks?.guest;if(guest?.life>0)consider(guest,'friend',180,0);
 }
 const previous=p._michiPresence||{},weight=target?1:0;
 p._michiPresence={kind:target?.kind||'idle',lookX:finite(previous.lookX)+(finite(target?.lookX)-finite(previous.lookX))*.16,lookY:finite(previous.lookY)+(finite(target?.lookY)-finite(previous.lookY))*.16,attention:finite(previous.attention)+(weight-finite(previous.attention))*.12,idleTicks:p._michiIdleTicks};
 return true;
}
