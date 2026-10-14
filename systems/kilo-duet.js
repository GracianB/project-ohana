import {guestPerformance,readGuestOrigin,surpriseGuestDrawer} from './u-duet-direction-v315.js';
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
 }else{dx=face*(36+(age-90)/30*220);beat='petal';}
 return {x:(state.originX??state.x)+dx,y:(state.originY??state.y)+dy,beat,radius,
  ring:age<30?0:Math.min(radius,(age-30)/24*radius),
  finale:age>=90?Math.min(1,(age-90)/12):0};
}
export function startKiloDuet(game,power=1){
 const p=game.player;if(!p||p.dead||p.id!=='kilo')return false;
 game._kiloDuet={...(p.uSurprise?{surprise:true}:{}),x:p.x+p.w/2,y:p.y+p.h,originX:p.x+p.w/2,originY:p.y+p.h,facing:p.facing===-1?-1:1,
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
  const options={color:'#ffd36a',stun:18,kx:(Math.sign(e.x+e.w/2-s.x)||s.facing)*6,ky:-5,hitstop:1,shake:1};
  if(s.age>=30&&s.age<90&&!s.wave.has(e)&&nearSegment(e,center,center,pose.ring)){
   if(hit(game,e,damage*.35,options))s.wave.add(e);
  }
  if(s.age>=30&&s.age<90&&!s.roll.has(e)&&nearSegment(e,s.previous||ally,ally,24)){
   if(hit(game,e,damage*.45,{...options,color:'#8f7bff'}))s.roll.add(e);
  }
  if(s.age>=90&&s.age<102&&!s.final.has(e)&&nearSegment(e,center,center,pose.radius*pose.finale)){
   const dir=Math.sign(e.x+e.w/2-s.x)||s.facing;
   if(hit(game,e,damage*.2,{...options,crit:true,hitstop:3,shake:3+s.evo,stun:30+s.evo*6,kx:dir*(7+s.evo*2),ky:-7-s.evo}))s.final.add(e);
  }
 }
 if(game._assist?.heroId==="stitcho")game._assist.t=120-s.age;
 s.previous=ally;p._kiloDuetAge=s.age;p._kiloDuetT=120-s.age;s.age++;
}
export function readKiloDuet(value){
 if(!value||readGuestOrigin(value)===null||![value.x,value.y,value.age,value.evo,value.facing].every(Number.isFinite)||
  Math.abs(value.x)>20000||Math.abs(value.y)>20000||!Number.isInteger(value.age)||value.age<0||value.age>=120||
  !Number.isInteger(value.evo)||value.evo<0||value.evo>4||![-1,1].includes(value.facing))return null;
 return {...(value.surprise===true?{surprise:true}:{}),...readGuestOrigin(value),x:value.x,y:value.y,age:value.age,evo:value.evo,facing:value.facing};
}
// V370: readable three-act U. 0-30 charge (Kilo strums, notes converge),
// 30-90 hula ring + Stitcho chaos, 90-120 big bloom burst. Flat fills only.
const KILO_U_COL=['#ffd36a','#ff6b9a','#7fe0c8','#fff2ba','#ff9a3c'];
function kiloFlower(ctx,x,y,r,petals,c1,c2,rot){
 ctx.fillStyle=c1;
 for(let i=0;i<petals;i++){const a=rot+i*Math.PI*2/petals;ctx.beginPath();
  ctx.ellipse(x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,r*.48,r*.22,a,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle=c2;ctx.beginPath();ctx.arc(x,y,r*.36,0,Math.PI*2);ctx.fill();
}
function kiloNote(ctx,x,y,sz,col){
 ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=Math.max(2,sz*.22);
 ctx.beginPath();ctx.ellipse(x,y,sz*.55,sz*.4,-.4,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.moveTo(x+sz*.48,y-sz*.1);ctx.lineTo(x+sz*.48,y-sz*1.5);ctx.lineTo(x+sz*1.05,y-sz*1.1);ctx.stroke();
}
export function drawKiloDuet(ctx,state,cam,t,drawActor,roster,reduce=false){
 const s=readKiloDuet(state);if(!s)return;drawActor=surpriseGuestDrawer(drawActor,s,cam,reduce);
 const pose=kiloDuetPose(s),x=s.x-cam.x,y=s.y-26-cam.y,age=s.age,evo=s.evo;
 const spin=reduce?0:t*.006,solar=evo===4;
 ctx.save();
 ctx.globalAlpha*=age>112?(120-age)/8:1;
 // ACT 1 · carga: notas y pétalos convergen, aro de anticipación que se cierra.
 if(age<30){
  const k=age/30,cr=(1-k)*(90+evo*18)+24;
  ctx.globalAlpha*=.35+k*.65;
  ctx.strokeStyle='#fff2ba';ctx.lineWidth=2+k*4;ctx.setLineDash([10,8]);
  ctx.beginPath();ctx.arc(x,y,cr,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  const n=5+evo;
  for(let i=0;i<n;i++){const a=i*Math.PI*2/n+spin*2;
   kiloNote(ctx,x+Math.cos(a)*cr,y+Math.sin(a)*cr*.8,7+evo,KILO_U_COL[i%5]);}
  ctx.fillStyle='#fff6d0';ctx.globalAlpha=.25+.5*k;ctx.beginPath();ctx.arc(x,y,8+k*(14+evo*3),0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
 }
 // ACT 2 · anillo hula: banda gruesa + flores grandes + notas orbitando.
 if(pose.ring>0&&age<96){
  const band=6+evo*2,R=pose.ring;
  ctx.globalAlpha=.22;ctx.fillStyle='#ffd36a';ctx.beginPath();ctx.arc(x,y,R,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle='#ffd36a';ctx.lineWidth=band;ctx.beginPath();ctx.arc(x,y,R,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#fff2ba';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,R-band,0,Math.PI*2);ctx.stroke();
  const fl=6+evo*2;
  for(let i=0;i<fl;i++){const a=i*Math.PI*2/fl+spin;
   if(solar)kiloFlower(ctx,x+Math.cos(a)*R,y+Math.sin(a)*R,12,8,'#ffc21a','#7a4a1c',a);
   else kiloFlower(ctx,x+Math.cos(a)*R,y+Math.sin(a)*R,8+evo*1.5,5,i%2?'#ff6b9a':'#fff2ba','#ffd36a',a);}
  const notes=3+evo;
  for(let i=0;i<notes;i++){const a=-i*Math.PI*2/notes-spin*1.6;
   kiloNote(ctx,x+Math.cos(a)*R*.62,y+Math.sin(a)*R*.62,8+evo,KILO_U_COL[(i+1)%5]);}
 }
 // ACT 3 · floración final (90-120): onda doble + flor/girasol gigante.
 if(age>=90){
  const k=Math.min(1,(age-90)/14),fade=age<104?1:Math.max(0,1-(age-104)/16),R=pose.radius*k;
  ctx.globalAlpha=.3*fade;ctx.fillStyle=solar?'#ffc21a':'#ff9ab0';ctx.beginPath();ctx.arc(x,y,R,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=fade;ctx.strokeStyle='#fff2ba';ctx.lineWidth=6+evo*2;ctx.beginPath();ctx.arc(x,y,R,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle=solar?'#ff9a3c':'#ff6b9a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,R*.7,0,Math.PI*2);ctx.stroke();
  const big=(26+evo*10)*Math.min(1,k*1.5);
  if(solar)kiloFlower(ctx,x,y-10,big,14,'#ffc21a','#7a4a1c',spin);
  else kiloFlower(ctx,x,y-10,big,5+Math.min(evo,3),'#ff6b9a','#fff2ba',spin);
  const sp=6+evo*2;
  for(let i=0;i<sp;i++){const a=i*Math.PI*2/sp;
   kiloNote(ctx,x+Math.cos(a)*R*.9,y+Math.sin(a)*R*.9-k*10,9+evo,KILO_U_COL[i%5]);}
  ctx.globalAlpha=1;
 }
 if(pose.beat==='chaos'){
  ctx.strokeStyle='#8f7bff';ctx.lineWidth=4;ctx.beginPath();
  ctx.arc(pose.x-cam.x,pose.y-24-cam.y,28,0,Math.PI*2);ctx.stroke();
 }
 const def=roster.find(r=>r.id==='stitcho'),form=def?.forms?.[evo];
 if(def&&form){
  const actor={...def,...form,id:'stitcho',evo,x:pose.x-form.w/2,y:pose.y-form.h,
   facing:pose.beat==='arrival'?-s.facing:s.facing,vx:pose.beat==='chaos'?s.facing*6:0,vy:0,
   grounded:pose.beat!=='chaos',melee:pose.beat==='correction'?8:0,visualScale:.85,_duetActor:true};
  drawActor(ctx,actor,cam,t);
 }
 if(age<30||(age>=90&&age<116)){
  ctx.font='800 '+(15+evo*2)+'px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff2ba';
  ctx.strokeStyle='#2b2233';ctx.lineWidth=4;
  const label=age>=90?(solar?'¡FLOR SOLAR!':'¡ALOHA!'):age<18?(evo===0?'¿Era esta nota?':'¡A compás!'):'¡Al otro lado!';
  const ly=y-(age>=90?pose.radius*.55+20:80+evo*6);
  ctx.strokeText(label,x,ly);ctx.fillText(label,x,ly);
 }
 ctx.restore();
}
