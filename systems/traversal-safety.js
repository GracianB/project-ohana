// Shared safety contract for cross-room catapults and vortex arrivals.
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function boundedArrivalSpawn(point,width,height,worldW,worldH){
 const w=Number.isFinite(width)&&width>0?width:24;
 const h=Number.isFinite(height)&&height>0?height:32;
 const ww=Number.isFinite(worldW)&&worldW>w?worldW:null;
 const wh=Number.isFinite(worldH)&&worldH>h?worldH:null;
 let x=Number.isFinite(point?.x)?point.x:24;
 let y=Number.isFinite(point?.y)?point.y:24;
 if(ww!==null)x=clamp(x,Math.min(24,(ww-w)/2),Math.max(0,ww-w-24));
 if(wh!==null)y=clamp(y,16,Math.max(16,wh-h-20));
 return {x,y};
}
export function boundedTraversalKick(kick){
 if(!kick)return null;
 const vortex=kick.type==="blackhole";
 const maxX=vortex?4.5:9.5,maxY=vortex?6:12;
 const vx=clamp(Number.isFinite(kick.vx)?kick.vx:0,-maxX,maxX);
 const vy=clamp(Number.isFinite(kick.vy)?kick.vy:0,-maxY,maxY);
 return {...kick,vx,vy,facing:Math.sign(vx)||kick.facing||1};
}
