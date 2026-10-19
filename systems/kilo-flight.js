export const kiloFlightDuration=evo=>240+Math.max(0,Math.min(4,evo|0))*30;
export function startKiloFlight(p,evo){p._kiloFlightT=kiloFlightDuration(evo);p._kiloFlightMax=p._kiloFlightT;p._kiloFlightVX=0;p._kiloFlightVY=-1.5;p.grounded=false;p.buffer=0;}
export function steerKiloFlight(p,input){
 if(p.id!=='kilo'||p.dead||!(p._kiloFlightT>0)){if(p.dead)p._kiloFlightT=0;return false;}
 p._kiloFlightT--;const x=Number.isFinite(input.axisX)?input.axisX:(input.right?1:0)-(input.left?1:0),y=(input.drop?1:0)-(input.jump?1:0),norm=Math.max(1,Math.hypot(x,y)),speed=4.8+(p.evo||0)*.4;
 p._kiloFlightVX+=(x/norm*speed-p._kiloFlightVX)*.3;p._kiloFlightVY+=(y/norm*speed-p._kiloFlightVY)*.3;
 if(!x&&Math.abs(p._kiloFlightVX)<.04)p._kiloFlightVX=0;if(!y&&Math.abs(p._kiloFlightVY)<.04)p._kiloFlightVY=0;
 if(p._dashGo>0)p._kiloFlightVX=p.vx;
 else if(Number.isFinite(input.kiloBurst))p._kiloFlightVX=input.kiloBurst;
 p.vx=p._kiloFlightVX;p.vy=p._kiloFlightVY;p.grounded=false;p.coyote=0;p.buffer=0;p.wall=0;p.jumps=0;p._pmove='float';p._abilMove='float';p._jumpHeld=false;if(x)p.facing=Math.sign(x);
 return true;
}
