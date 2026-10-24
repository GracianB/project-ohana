export const kiloFlightDuration=evo=>240+Math.max(0,Math.min(4,evo|0))*30;
export function stopKiloFlight(p){
 if(!p||p.id!=='kilo')return;
 p._kiloFlightT=0;p._kiloFlightMode=null;p._kiloFlightVX=0;p._kiloFlightVY=0;
 p._kiloAimX=0;p._kiloAimY=0;p._abilMove=null;p._pmove=null;p.buffer=0;p._jumpHeld=false;
}
export function startKiloFlight(p,evo){
 p._kiloFlightT=kiloFlightDuration(evo);p._kiloFlightMax=p._kiloFlightT;
 p._kiloFlightMode=evo>=4?'solar':'hover';p._kiloFlightVX=0;p._kiloFlightVY=-1.5;
 p._kiloAimX=p.facing||1;p._kiloAimY=0;p.grounded=false;p.buffer=0;
}
export function steerKiloFlight(p,input){
 if(p.id!=='kilo'||p.dead||!(p._kiloFlightT>0)){if(p.id==='kilo'&&(p.dead||p._kiloFlightMode))stopKiloFlight(p);return false;}
 if(p._kiloFlightMode==='solar'&&p.evo<4){stopKiloFlight(p);return false;}
 if(p._kiloFlightMode!=='solar')p._kiloFlightT--;
 const x=Number.isFinite(input.axisX)?input.axisX:(input.right?1:0)-(input.left?1:0),y=(input.drop?1:0)-(input.jump?1:0),norm=Math.max(1,Math.hypot(x,y)),speed=4.8+(p.evo||0)*.4;
 if(x||y){p._kiloAimX=x/norm;p._kiloAimY=y/norm;}
 p._kiloFlightVX+=(x/norm*speed-p._kiloFlightVX)*.3;p._kiloFlightVY+=(y/norm*speed-p._kiloFlightVY)*.3;
 if(!x&&Math.abs(p._kiloFlightVX)<.04)p._kiloFlightVX=0;if(!y&&Math.abs(p._kiloFlightVY)<.04)p._kiloFlightVY=0;
 if(p._dashGo>0)p._kiloFlightVX=p.vx;
 else if(Number.isFinite(input.kiloBurst))p._kiloFlightVX=input.kiloBurst;
 p.vx=p._kiloFlightVX;p.vy=p._kiloFlightVY;p.grounded=false;p.coyote=0;p.buffer=0;p.wall=0;p.jumps=0;p._pmove='float';p._abilMove='float';p._jumpHeld=false;if(x)p.facing=Math.sign(x);
 return true;
}
// Solar notes follow the last steering direction; grounded notes retain their
// original gravity, homing and three bounces. Damage and note count are shared.
export function kiloNoteTrajectory(p,index){
 const directed=p.evo>=4&&p._kiloFlightMode==='solar'&&p._kiloFlightT>0;
 if(!directed)return {vx:(6.4+index*1.4)*(p.facing||1),vy:-3.2-index*1.2,home:p.evo>=4,directed:false,life:220,maxB:3};
 const angle=Math.atan2(p._kiloAimY||0,p._kiloAimX||((p._kiloAimY||0)?0:(p.facing||1)))+(index-1)*.12,speed=8+index*.5;
 return {vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,home:false,directed:true,life:90,maxB:0};
}
