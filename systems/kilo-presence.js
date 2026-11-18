// Attention belongs to the visual rig. Never turns, moves, collects or attacks.
const n=x=>Number.isFinite(x)?x:0;
export function updateKiloPresence(g){
 const p=g?.player;if(p?.id!=='kilo')return false;
 const px=p.x+p.w/2,py=p.y+p.h/2;let target=null,best=Infinity;
 const see=(e,kind,radius,bias=0)=>{if(!e||!Number.isFinite(e.x)||!Number.isFinite(e.y))return;const dx=e.x+(e.w||0)/2-px,dy=e.y+(e.h||0)/2-py,d=Math.hypot(dx,dy);if(d<radius&&d+bias<best){best=d+bias;target={kind,x:Math.max(-1,Math.min(1,dx*(p.facing||1)/100)),y:Math.max(-1,Math.min(1,dy/100))};}};
 if(!p.dead){for(const e of g.enemies||[])if(e.hp>0&&!e.hidden&&!e.dead)see(e,'focus',240,-35);for(const s of g.world1?.stations||[])if(!s.done)see(s,'listen',150,15);const friend=g._evolutionAttacks?.guest;if(friend?.life>0)see(friend,'friend',210,-10);}
 const old=p._kiloPresence||{},weight=target?1:0;
 p._kiloPresence={kind:target?.kind||'idle',lookX:n(old.lookX)+(n(target?.x)-n(old.lookX))*.14,lookY:n(old.lookY)+(n(target?.y)-n(old.lookY))*.14,attention:n(old.attention)+(weight-n(old.attention))*.10};return true;
}
