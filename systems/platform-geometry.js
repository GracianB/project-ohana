// Shared, testable geometry rules for safe platform starts and roster audits.
export function supportBelow(body,platforms,maxDrop=280){
 if(!body||![body.x,body.y,body.w,body.h].every(Number.isFinite))return null;
 const feet=body.y+body.h;
 const cx=body.x+body.w/2;
 return (platforms||[]).filter(p=>p&&[p.x,p.y,p.w,p.h].every(Number.isFinite)&&
   p.w>0&&p.h>0&&cx>p.x&&cx<p.x+p.w&&
   p.y>=feet-4&&p.y-feet<=maxDrop)
  .sort((a,b)=>a.y-b.y)[0]||null;
}
export function formPlatformAudit(roster,platforms){
 const forms=(roster||[]).flatMap(hero=>(hero.forms||[]).map((f,i)=>({
   id:hero.id,form:i,width:Number(f.w)||0,height:Number(f.h)||0,
   jump:Number(f.jump)||0,speed:Number(f.speed)||0
 })));
 const ledges=(platforms||[]).filter(p=>p&&p.h<=24&&p.h>0&&p.w>0);
 return {forms,ledgeCount:ledges.length,
  narrowLedges:ledges.filter(p=>forms.some(f=>f.width>0&&p.w<f.width+12)).length,
  tallest:Math.max(0,...forms.map(f=>f.height)),
  widest:Math.max(0,...forms.map(f=>f.width))
 };
}
