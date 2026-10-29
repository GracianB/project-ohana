// Michi uses the same eyes as Kilo, Chispín, Dino and Cuerno.
// Keep the shared renderer intact; only placement and expression belong to Michi.
import {R} from './rig.js';

const finite=(v,fallback=0)=>Number.isFinite(v)?v:fallback;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function drawMichiEye(ctx,x,y,radius,pose={}){
 const eyePose={
  blink:pose.closed?1:clamp(finite(pose.blink),0,1),
  look:{x:clamp(finite(pose.look?.x,1),-1,1),y:clamp(finite(pose.look?.y),-1,1)}
 };
 const mood=pose.closed?'closed':pose.happy?'happy':pose.mood||'normal';
 R.eye(ctx,finite(x),finite(y),clamp(finite(radius,7.2),.5,12),eyePose,{iris:'#623d85',mood});
}
