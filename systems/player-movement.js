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

// V645: a tap up to ten frames before landing remains an actual future jump.
// Sanitizing the queue keeps corrupted/stale values from producing phantom
// jumps after an input reset; keyboard/touch/gamepad share this code path.
export function queueJumpPress(p,pressed=false,frames=10){
 if(!p)return 0;
 const ticks=Number.isFinite(frames)?Math.max(1,Math.min(20,Math.trunc(frames))):10;
 const old=Number.isFinite(p.buffer)?Math.max(0,Math.min(20,Math.trunc(p.buffer))):0;
 p.buffer=pressed?ticks:Math.max(0,old-1);
 return p.buffer;
}

// V646: walking off a ledge preserves the ground jump ONLY for the genuine
// coyote window. Without this, jumps=0 persists after coyote expires, so a
// single-jump hero can jump from thin air arbitrarily late.
export function tickWalkoffCoyote(p,wasGrounded=false){
 if(!p)return {remaining:0,consumed:false};
 if(p.grounded){p._walkoffPending=false;return {remaining:p.coyote||0,consumed:false};}
 if(wasGrounded&&p.jumps===0)p._walkoffPending=true;
 if(p.coyote>0)p.coyote--;
 if(p._walkoffPending&&p.coyote<=0){
  p.jumps=Math.max(1,Number.isFinite(p.jumps)?Math.floor(p.jumps):0);
  p._walkoffPending=false;
  return {remaining:0,consumed:true};
 }
 return {remaining:Math.max(0,p.coyote||0),consumed:false};
}
