// Avoid stacked seams when an authored path meets an unlocked return bridge.
export function tidyPlatforms(platforms){
 const fixed=[],rows=[],separated=[];
 for(const p of [...platforms].sort((a,b)=>a.y-b.y)){
  if(p.h>40||p._campaignLift){separated.push(p);continue;}
  const same=separated.find(q=>q.h<=40&&!q._campaignLift&&Math.abs(p.y-q.y)<56&&Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x)>=Math.min(p.w,q.w)*.6);
  if(same){const end=Math.max(same.x+same.w,p.x+p.w);same.x=Math.min(same.x,p.x);same.w=end-same.x;}else separated.push({...p});
 }
 for(const p of separated){
  if(p.h>40||p._campaignLift){fixed.push(p);continue;}
  const row=rows.find(r=>Math.abs(r.y-p.y)<=8&&Math.abs(r.h-p.h)<3);
  if(row){row.parts.push(p);row.y=Math.min(row.y,p.y);}else rows.push({y:p.y,h:p.h,parts:[p]});
 }
 for(const row of rows){
  const sorted=row.parts.sort((a,b)=>a.x-b.x),runs=[];
  for(const p of sorted){const last=runs.at(-1);if(last&&p.x<=last.x+last.w){last.w=Math.max(last.w,p.x+p.w-last.x);}else runs.push({...p,y:row.y});}
  for(const run of runs){
   if(run.w<=380){fixed.push(run);continue;}
   const count=Math.ceil((run.w+48)/428),width=(run.w-48*(count-1))/count;
   for(let i=0;i<count;i++)fixed.push({...run,x:run.x+i*(width+48),w:width});
  }
 }
 return fixed;
}
