// V280: deterministic geometry audit usable by release tests and level tooling.
// Keep this report pure; never mutate authored maps at runtime.
export function auditPlatforms(platforms,worldWidth=Infinity,worldHeight=Infinity){
 const issues=[];
 if(!Array.isArray(platforms))return [{code:"NOT_ARRAY",index:-1}];
 for(let i=0;i<platforms.length;i++){
  const p=platforms[i];
  if(!p||!["x","y","w","h"].every(k=>typeof p[k]==="number"&&Number.isFinite(p[k]))){
   issues.push({code:"INVALID_COORDINATE",index:i});continue;
  }
  if(p.w<=0||p.h<=0)issues.push({code:"NON_POSITIVE_SIZE",index:i});
  if(p.w>0&&p.w<12)issues.push({code:"NARROW_PLATFORM",index:i});
  if(p.x+p.w<0||p.x>worldWidth||p.y+p.h<0||p.y>worldHeight)
   issues.push({code:"OUTSIDE_WORLD",index:i});
 }
 return issues;
}
