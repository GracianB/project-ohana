// OHANA V94 · Spatial neighborhood for crowded, deterministic encounters.
// Built once per director tick; exact Euclidean tests preserve attack AI semantics.
const centerX=e=>(Number(e?.x)||0)+(Number(e?.w)||0)*.5;
const centerY=e=>(Number(e?.y)||0)+(Number(e?.h)||0)*.5;
const key=(x,y)=>x+","+y;
export function buildEncounterSpatialIndex(enemies=[],cellSize=360){
 const size=Math.max(360,Math.min(720,Number(cellSize)||360));
 const cells=new Map();
 for(const e of enemies){
  if(!e)continue;
  const k=key(Math.floor(centerX(e)/size),Math.floor(centerY(e)/size));
  let bucket=cells.get(k);
  if(!bucket){bucket=[];cells.set(k,bucket);}
  bucket.push(e);
 }
 function visit(e,radius,fn){
  const x=centerX(e),y=centerY(e),cx=Math.floor(x/size),cy=Math.floor(y/size);
  const sq=radius*radius;
  for(let yy=cy-1;yy<=cy+1;yy++)for(let xx=cx-1;xx<=cx+1;xx++){
   const bucket=cells.get(key(xx,yy));if(!bucket)continue;
   for(const other of bucket){
    if(other===e)continue;
    const dx=centerX(other)-x,dy=centerY(other)-y;
    if(dx*dx+dy*dy<sq&&fn(other))return true;
   }
  }
  return false;
 }
 return Object.freeze({
  countNear(e,radius=300){let count=0;visit(e,Math.max(0,Math.min(size,radius)),()=>{count++;return false;});return count;},
  someNear(e,radius=360,predicate=()=>true){return visit(e,Math.max(0,Math.min(size,radius)),predicate);},
  cellCount:cells.size,
 });
}
