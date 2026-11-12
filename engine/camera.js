// Camera anticipation follows actual travel; dash direction is latched.
// Historical 18px preview is part of the original camera contract and is
// preserved for all existing consumers and regression fixtures.
export function horizontalLook(player) {
  return player._dashGo > 0
    ? (player._dashFace || player.facing || 1) * 48
    : Math.sign(player.vx || 0) * 18;
}
const valid=n=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
// V700 ONLY: a progressively larger preview at higher speed. The game scene
// opts into this explicitly, leaving horizontalLook unchanged for other clients.
export function adaptiveCameraLook(player){
 if(!player||player.dead)return 0;
 if(player._dashGo>0)return horizontalLook(player);
 const vx=valid(player.vx)?player.vx:0;
 if(Math.abs(vx)<.2)return 0;
 return Math.sign(vx)*clamp(14+Math.abs(vx)*6,0,86);
}
export function smoothCameraLook(current,target,{responsiveness=.18,maxStep=8}={}){
 const from=valid(current)?clamp(current,-86,86):0;
 const to=valid(target)?clamp(target,-86,86):0;
 const k=valid(responsiveness)?clamp(responsiveness,0,1):.18;
 const step=valid(maxStep)?clamp(maxStep,0,86):8;
 return clamp(from+clamp((to-from)*k,-step,step),-86,86);
}
// Pause/menu transitions discard queued intent, never active movement or damage.
export function clearBufferedActions(player) {
  if (!player) return;
  player.buffer = 0;
  player.dashBuf = 0;
  player.meleeBuf = 0;
}
