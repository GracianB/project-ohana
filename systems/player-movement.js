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

// V647: baby Michi has finer short hops; Dino has a weighted release.
// Finalised Kilo and the other eight heroes retain their original 0.55 cut.
export function heroJumpCut(p){
 const held=Number.isFinite(p?._jumpHoldTicks)?Math.max(0,Math.min(30,p._jumpHoldTicks)):0;
 if(p?.id==='cat'&&(Number(p.evo)||0)<3)return Math.min(.55,.47+held*.005);
 if(p?.id==='dino')return Math.min(.55,.51+held*.0025);
 return .55;
}

// V648: preserve Kilo/other completed hero profiles and scripted flight,
// while giving baby Michi agile air steering and Dino believable inertia.
export function heroAirControl(p){
 if(!p||p._kiloFlightT>0||p._specialFlightT>0||p._michiWingAir)return 1;
 if(p.id==='cat'&&(Number(p.evo)||0)<3)return 1.09;
 if(p.id==='dino')return .86;
 return 1;
}

// V650: visual landing feedback follows real collision, never a fake raycast.
// Kilo and the eight other kits keep the established audio/physics behavior.
export function heroLandingImpact(p,fallSpeed,reduced=false){
 const v=Number.isFinite(fallSpeed)?fallSpeed:0;
 if(v<=7||!p||!['cat','dino'].includes(p.id))return null;
 const heavy=p.id==='dino',strength=Math.min(2,Math.max(.5,(v-7)/7));
 return {count:reduced?2:Math.min(20,Math.max(4,Math.round((heavy?10:7)*strength))),
  color:heavy?'#d6ebb4':'#93f8eb',size:heavy?3.5:2.2,life:heavy?20:16};
}
