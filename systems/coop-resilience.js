// OHANA V89: bounded, deterministic network recovery without fast retry loops.
const num=(x,f=0)=>Number.isFinite(Number(x))?Number(x):f;
export function coopRetryDelay(failures){
 const n=Math.min(5,Math.max(1,Math.floor(num(failures,1))));
 return Math.min(3600,200*2**(n-1));
}
export function remoteMotionSample(previous,x,y,now,roomChanged=false){
 const targetX=num(x,num(previous?.targetX)),targetY=num(y,num(previous?.targetY));
 const at=num(now);
 const px=num(previous?.targetX,targetX),py=num(previous?.targetY,targetY);
 const lastAt=num(previous?.sampleAt,at-180);
 const teleport=roomChanged||Math.hypot(targetX-px,targetY-py)>480;
 return Object.freeze({
  targetX,targetY,
  previousX:teleport?targetX:px,previousY:teleport?targetY:py,
  previousSampleAt:teleport?at-180:Math.min(at-16,lastAt),
  sampleAt:at,teleport
 });
}
