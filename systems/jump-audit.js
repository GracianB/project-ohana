// Fixed 60Hz, the same gravity, acceleration and terminal speed as game.js.
export function simulateJump(form,{rise=0,gap=0,landing=200,release=Infinity}={}){
 let x=0,y=0,vx=0,vy=-form.jump,jumps=1,apex=0;
 const target=-rise,trace=[];
 for(let t=0;t<300;t++){
  const aim=gap+Math.min(80,landing/2),direction=x+vx*Math.abs(vx)/(.72)<aim?1:-1;
  vx+=(direction*form.speed-vx)*(direction*vx<0?.36:.26);x+=vx;
  if(t===release&&vy<-4)vy*=.55;
  // Extra jumps are conservative: use them after the first apex.
  if(vy>=0&&jumps<(form.jumps||1)&&y>target-12){vy=-form.jump;jumps++;}
  const old=y;vy=Math.min(14,vy+.5);y+=vy;apex=Math.min(apex,y);
  trace.push({x,y});
  if(vy>=0&&old<=target&&y>=target){
   const margin=Math.min(18,landing*.2),landed=x>=gap+margin&&x<=gap+landing-margin;
   return {landed,x,ticks:t+1,apex,trace};
  }
  if(y>300)return {landed:false,x,ticks:t+1,apex,trace};
 }
 return {landed:false,x,ticks:300,apex,trace};
}
export function auditRoomTraversal(room,roster){
 const results=[];
 for(const hero of roster)for(let evo=room.needEvo||0;evo<5;evo++){
  const f=hero.forms[evo];
  for(const h of room.hazards||[]){
   const stones=room.plats.filter(p=>p[3]<40&&p[0]>=h.x&&p[0]<h.x+h.w&&Math.abs(p[1]-(h.y-25))<2).sort((a,b)=>a[0]-b[0]);
   let edge=h.x;for(const stone of stones){const gap=Math.max(0,stone[0]-edge),r=simulateJump(f,{rise:61,gap,landing:stone[2]+f.w});results.push({hero:hero.id,evo,kind:'crossing',from:edge,to:stone[0],ok:r.landed});edge=stone[0]+stone[2];}
   const gap=Math.max(0,h.x+h.w-edge),r=simulateJump(f,{gap,landing:1000});results.push({hero:hero.id,evo,kind:'landing',ok:r.landed});
  }
  for(const sector of room.sectors){const r=simulateJump(f,{rise:80,landing:250+f.w});results.push({hero:hero.id,evo,kind:"sector-ascent",sector:sector.id,ok:r.landed&&-r.apex>=80*1.2});}
  if(room.upExit){const r=simulateJump(f,{rise:80,landing:1000});results.push({hero:hero.id,evo,kind:'ascent',ok:-r.apex>=80*1.2});}
 }
 return {room:room.id,checks:results.length,failures:results.filter(r=>!r.ok)};
}
