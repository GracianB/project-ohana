// OHANA V98 · Conservative rendering visibility. Simulation remains untouched.
// Only the renderer decides whether to paint a sprite on a clipped Canvas.
const num=(v,f=0)=>typeof v==="number"&&Number.isFinite(v)?v:f;
export const OHANA_RENDER_MARGIN = 192;
export function visibleForRender(entity,cam,width,height,margin=OHANA_RENDER_MARGIN){
 if(!entity||typeof entity.x!=="number"||!Number.isFinite(entity.x)||
   typeof entity.y!=="number"||!Number.isFinite(entity.y))return false;
 // A missing size is treated as a point; include radius where available.
 const radius=Math.max(0,num(entity.r));
 const w=Math.max(0,num(entity.w,radius*2));
 const h=Math.max(0,num(entity.h,radius*2));
 const pad=Math.max(0,num(margin,OHANA_RENDER_MARGIN));
 const left=num(cam?.x),top=num(cam?.y);
 const right=left+Math.max(1,num(width,1280)),bottom=top+Math.max(1,num(height,720));
 return entity.x+w>=left-pad&&entity.x<=right+pad&&
   entity.y+h>=top-pad&&entity.y<=bottom+pad;
}
