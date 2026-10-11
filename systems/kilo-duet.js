// V301: an in-world Ohana ring + Stitcho chaos attack. Rendering never damages.
export const KILO_DUET_TICKS=120;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function kiloDuetPose(state){
 const age=clamp(state.age,0,120),face=state.facing;
 const radius=160+state.evo*20;
 let dx,dy=0,beat;
 if(age<18){dx=-face*(140-140*age/18);beat='arrival';}
 else if(age<30){dx=face*Math.sin((age-18)/12*Math.PI)*22;beat='correction';}
 else if(age<90){
  const k=(age-30)/60;dx=face*Math.sin(k*Math.PI*6)*radius;
  dy=-Math.abs(Math.sin(k*Math.PI*3))*64;beat='chaos';
 }else{dx=face*36;beat='petal';}
 return {x:state.x+dx,y:state.y+dy,beat,radius,
  ring:age<30?0:Math.min(radius,(age-30)/24*radius),
  finale:age>=90?Math.min(1,(age-90)/12):0};
}
export function startKiloDuet(game,power=1){
 const p=game.player;if(!p||p.dead||p.id!=='kilo')return false;
 game._kiloDuet={x:p.x+p.w/2,y:p.y+p.h,facing:p.facing===-1?-1:1,
  evo:clamp(Math.floor(Number(p.evo)||0),0,4),age:0,power:clamp(Number(power)||1,1,2),
  wave:new Set(),roll:new Set(),final:new Set(),previous:null};
 return true;
}
function nearSegment(e,a,b,r){
 const x=e.x+e.w/2,y=e.y+e.h/2,dx=b.x-a.x,dy=b.y-a.y;
 const k=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
 return Math.hypot(x-a.x-dx*k,y-a.y-dy*k)<=r+Math.min(e.w,e.h)/2;
}
export function updateKiloDuet(game,hit){
 const s=game._kiloDuet,p=game.player;
 if(!s){if(p)p._kiloDuetT=0;return;}
 if(!p||p.dead||p.id!=='kilo'||s.age>=120){game._kiloDuet=null;if(p)p._kiloDuetT=0;if(game._assist?.heroId==="stitcho")game._assist.t=0;return;}
 s.x=p.x+p.w/2;s.y=p.y+p.h;
 const pose=kiloDuetPose(s),center={x:s.x,y:s.y-26},ally={x:pose.x,y:pose.y-24};
 const damage=(70+s.evo*14)*s.power;
 for(const e of game.enemies||[]){
  if(!e||e.hp<=0||e.dying||e.fell)continue;
  const options={color:'#ffd36a',stun:18,kx:s.facing*5,ky:-4,hitstop:0,shake:1};
  if(s.age>=30&&s.age<90&&!s.wave.has(e)&&nearSegment(e,center,center,pose.ring)){
   if(hit(game,e,damage*.35,options))s.wave.add(e);
  }
  if(s.age>=30&&s.age<90&&!s.roll.has(e)&&nearSegment(e,s.previous||ally,ally,24)){
   if(hit(game,e,damage*.45,{...options,color:'#8f7bff'}))s.roll.add(e);
  }
  if(s.age>=90&&s.age<102&&!s.final.has(e)&&nearSegment(e,center,center,pose.radius*pose.finale)){
   if(hit(game,e,damage*.2,{...options,crit:true,hitstop:1}))s.final.add(e);
  }
 }
 if(game._assist?.heroId==="stitcho")game._assist.t=120-s.age;
 s.previous=ally;p._kiloDuetAge=s.age;p._kiloDuetT=120-s.age;s.age++;
}
export function readKiloDuet(value){
 if(!value||![value.x,value.y,value.age,value.evo,value.facing].every(Number.isFinite)||
  Math.abs(value.x)>20000||Math.abs(value.y)>20000||!Number.isInteger(value.age)||value.age<0||value.age>=120||
  !Number.isInteger(value.evo)||value.evo<0||value.evo>4||![-1,1].includes(value.facing))return null;
 return {x:value.x,y:value.y,age:value.age,evo:value.evo,facing:value.facing};
}
export function drawKiloDuet(ctx,state,cam,t,drawActor,roster,reduce=false){
 const s=readKiloDuet(state);if(!s)return;
 const pose=kiloDuetPose(s),x=s.x-cam.x,y=s.y-26-cam.y;
 ctx.save();
 ctx.globalAlpha*=s.age>108?(120-s.age)/12:1;
 ctx.strokeStyle='#ffd36a';ctx.lineWidth=3;
 if(pose.ring>0){
  ctx.beginPath();ctx.arc(x,y,pose.ring,0,Math.PI*2);ctx.stroke();
  const petals=8+s.evo*2;
  for(let i=0;i<petals;i++){
   const a=i*Math.PI*2/petals+(reduce?0:t*.006);
   ctx.fillStyle=i%2?'#ff6b9a':'#fff2ba';ctx.beginPath();
   ctx.ellipse(x+Math.cos(a)*pose.ring,y+Math.sin(a)*pose.ring,6,3,a,0,Math.PI*2);ctx.fill();
  }
 }
 if(pose.finale>0&&s.age<108){
  ctx.strokeStyle='#fff2ba';ctx.lineWidth=4;ctx.beginPath();
  ctx.arc(x,y,pose.radius*pose.finale,0,Math.PI*2);ctx.stroke();
 }
 if(pose.beat==='chaos'){
  ctx.strokeStyle='#8f7bff';ctx.lineWidth=3;ctx.beginPath();
  ctx.arc(pose.x-cam.x,pose.y-24-cam.y,26,0,Math.PI*2);ctx.stroke();
 }
 const def=roster.find(r=>r.id==='stitcho'),form=def?.forms?.[s.evo];
 if(def&&form){
  const actor={...def,...form,id:'stitcho',evo:s.evo,x:pose.x-form.w/2,y:pose.y-form.h,
   facing:pose.beat==='arrival'?-s.facing:s.facing,vx:pose.beat==='chaos'?s.facing*6:0,vy:0,
   grounded:pose.beat!=='chaos',melee:pose.beat==='correction'?8:0,visualScale:.85,_duetActor:true};
  drawActor(ctx,actor,cam,t);
 }
 if(pose.beat==='petal'){
  ctx.fillStyle='#ff9ab0';ctx.beginPath();ctx.ellipse(pose.x+s.facing*10-cam.x,pose.y-[24,40,60,76,98][s.evo]-cam.y,5,3,-.4,0,Math.PI*2);ctx.fill();
 }
 if(s.age<30){
  ctx.font='700 14px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff2ba';
  ctx.strokeStyle='#2b2233';ctx.lineWidth=3;
  const label=s.age<18?(s.evo===0?'¿Era esta nota?':'¡A compás!'):'¡Al otro lado!';
  ctx.strokeText(label,x,y-70);ctx.fillText(label,x,y-70);
 }
 ctx.restore();
}
