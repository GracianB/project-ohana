// Shared direction handling for keyboard, pointer buttons and gamepad axes.
// Jump presses remain buffered by game.js; forms own the number of air jumps.
export function updatePlayerLocomotion(p,{axisX=0,pressedLeft=false,pressedRight=false,drop=false,t=0}={}){
 const s=p._locomotion||={lastDir:0,lastTap:-1000,runDir:0,previous:0};
 const dir=Math.abs(axisX)>.2?Math.sign(axisX):0;
 const edge=dir&&((dir<0&&pressedLeft)||(dir>0&&pressedRight)||s.previous!==dir);
 if(p.dead||drop){s.lastTap=-1000;s.runDir=0;}
 else if(edge){s.runDir=s.lastDir===dir&&t-s.lastTap<=16?dir:0;s.lastDir=dir;s.lastTap=t;}
 if(!dir||dir!==s.runDir||p._kiloFlightT>0)s.runDir=0;
 s.previous=dir;p._sprinting=!!s.runDir;
 return p._sprinting?Math.min(Math.abs(p.speed)*1.4,12):Math.abs(p.speed);
}
export function resetPlayerLocomotion(p){if(p){p._locomotion=null;p._sprinting=false;}}
