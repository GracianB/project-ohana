// OHANA V700 · velocity-aware, bounded, deterministic camera anticipation.
// Maintain the old 48px dash cue; ordinary movement now gains sight distance
// gradually with *real* horizontal speed, not just the facing animation.
const valid=n=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function horizontalLook(player){
 if(!player||player.dead)return 0;
 if(player._dashGo>0)return (player._dashFace||player.facing||1)>=0?48:-48;
 const speed=valid(player.vx)?player.vx:0;
 if(Math.abs(speed)<.2)return 0;
 return Math.sign(speed)*clamp(14+Math.abs(speed)*6,0,86);
}
// Limits both the smoothness and the maximum shift. A reversing player does
// not teleport the camera to the opposite side on the very next frame.
export function smoothCameraLook(current,target,{responsiveness=.18,maxStep=8}={}){
 const from=valid(current)?clamp(current,-86,86):0;
 const to=valid(target)?clamp(target,-86,86):0;
 const k=valid(responsiveness)?clamp(responsiveness,0,1):.18;
 const step=valid(maxStep)?clamp(maxStep,0,86):8;
 return clamp(from+clamp((to-from)*k,-step,step),-86,86);
}
// Pause/menu transitions discard queued intent, never active movement or damage.
export function clearBufferedActions(player){
 if(!player)return;
 player.buffer=0;player.dashBuf=0;player.meleeBuf=0;
}
