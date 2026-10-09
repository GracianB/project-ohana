// OHANA V104 · Reordering guard and jitter metrics for the original two-player engine.
// This module never dictates game physics. It only decides which net snapshot is newer.
const valid=n=>typeof n==="number"&&Number.isFinite(n);
export function shouldUseSnapshot(current,next){
 if(!next||typeof next!=="object")return false;
 if(!current)return true;
 if(current.roomId!==next.roomId)return false;
 if(valid(current.revision)&&valid(next.revision))return next.revision>=current.revision;
 // Legacy server without revisions: do not block its snapshots.
 return true;
}
export function snapshotStaleness(current,next){
 if(!valid(current?.revision)||!valid(next?.revision))return 0;
 return Math.max(0,current.revision-next.revision);
}
// Keep these values bounded, even when the tab was backgrounded for minutes.
export function peerNetworkHealth(rtt=0,age=0){
 const safe=(n)=>valid(n)?Math.max(0,n):0;
 const ms=safe(rtt),since=safe(age);
 return Object.freeze({
  rttMs:Math.round(ms),
  ageMs:Math.round(since),
  quality: since>2200?"lost":since>1000?"late":ms>700?"slow":ms>320?"fair":"good",
 });
}
