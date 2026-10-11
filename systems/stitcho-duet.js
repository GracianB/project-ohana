// V302: in-world controllable chaos and Chispin storm.
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function readStitchoDuet(s){
 if(!s||![s.x,s.y,s.age,s.evo,s.facing].every(Number.isFinite)||Math.abs(s.x)>20000||Math.abs(s.y)>20000||!Number.isInteger(s.age)||s.age<0||s.age>=120||!Number.isInteger(s.evo)||s.evo<0||s.evo>4||![-1,1].includes(s.facing))return null;
 const bolts=Array.isArray(s.bolts)?s.bolts:[];
 if(bolts.length>3||bolts.some(b=>!b||![b.x,b.y,b.life].every(Number.isFinite)||Math.abs(b.x)>20000||Math.abs(b.y)>20000||b.life<0||b.life>12))return null;
 return {x:s.x,y:s.y,age:s.age,evo:s.evo,facing:s.facing,bolts:bolts.map(b=>({x:b.x,y:b.y,life:b.life}))};
}
export function stitchoDuetPose(s){return {cloudX:s.x+s.facing*60,cloudY:s.y-115,radius:66+s.evo*12,range:180+s.evo*22,beat:s.age<18?'arrival':s.age<30?'static':s.age<102?'storm':'farewell'};}
export function startStitchoDuet(g,power=1){
 const p=g.player;if(!p||p.dead||p.id!=='stitcho')return false;
 g._stitchoDuet={x:p.x+p.w/2,y:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),facing:p.facing===-1?-1:1,power:clamp(Number(power)||1,1,2),chaos:new Set(),bolts:[]};return true;
}
export function updateStitchoDuet(g,hit){
 const s=g._stitchoDuet,p=g.player;if(!s){if(p)p._stitchoDuetT=0;return;}
 if(!p||p.dead||p.id!=='stitcho'||s.age>=120){g._stitchoDuet=null;if(p)p._stitchoDuetT=0;if(g._assist?.heroId==='chispin')g._assist.t=0;return;}
 s.x=p.x+p.w/2;s.y=p.y+p.h;s.bolts=s.bolts.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);
 const pose=stitchoDuetPose(s),damage=(70+s.evo*14)*s.power;
 const targets=(g.enemies||[]).filter(e=>e&&e.hp>0&&!e.dying&&!e.fell);
 if(s.age>=30&&s.age<102){
  for(const e of targets)if(Math.hypot(e.x+e.w/2-s.x,e.y+e.h/2-(s.y-24))<=pose.radius+Math.min(e.w,e.h)/2&&!s.chaos.has(e)&&hit(g,e,damage*.55,{color:'#67ddff',stun:36,kx:s.facing*7,ky:-5,hitstop:0,shake:1}))s.chaos.add(e);
  if([42,66,90].includes(s.age)){
   const nearby=targets.filter(e=>Math.hypot(e.x+e.w/2-pose.cloudX,e.y+e.h/2-(s.y-24))<=pose.range).sort((a,b)=>Math.hypot(a.x-pose.cloudX,a.y-s.y)-Math.hypot(b.x-pose.cloudX,b.y-s.y)).slice(0,3);
   for(const e of nearby)if(hit(g,e,damage*.15,{color:'#fff29a',stun:56,kx:s.facing*3,ky:-3,hitstop:0,shake:1}))s.bolts.push({x:e.x+e.w/2,y:e.y+e.h/2,life:12});
  }
 }
 p._stitchoDuetAge=s.age;p._stitchoDuetT=120-s.age;if(g._assist?.heroId==='chispin')g._assist.t=120-s.age;s.age++;
}
export function drawStitchoDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readStitchoDuet(value);if(!s)return;const pose=stitchoDuetPose(s),x=s.x-cam.x,y=s.y-24-cam.y,cx=pose.cloudX-cam.x,cy=pose.cloudY-cam.y;
 ctx.save();ctx.globalAlpha*=s.age>108?(120-s.age)/12:1;
 if(s.age>=30&&s.age<102){
  ctx.strokeStyle='#67ddff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,pose.radius,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#8f7bff';ctx.lineWidth=2;
  for(let i=0;i<3;i++){const a=(reduce?0:t*.06)+i*Math.PI*2/3;ctx.beginPath();ctx.arc(x,y,pose.radius-6,a,a+1.2);ctx.stroke();}
 }
 ctx.fillStyle='#b8ceff';ctx.strokeStyle='#303154';ctx.lineWidth=3;
 for(const [dx,dy,r] of [[-26,2,22],[0,-9,27],[26,2,22]]){ctx.beginPath();ctx.arc(cx+dx,cy+dy,r,0,Math.PI*2);ctx.fill();ctx.stroke();}
 const def=roster.find(r=>r.id==='chispin'),form=def?.forms?.[s.evo];
 if(def&&form)drawActor(ctx,{...def,...form,id:'chispin',evo:s.evo,x:pose.cloudX-form.w/2,y:pose.cloudY-form.h-12,facing:-s.facing,vx:0,vy:0,grounded:true,visualScale:.6,_duetActor:true},cam,t);
 for(const b of s.bolts){ctx.strokeStyle='#fff29a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy+14);for(let i=1;i<=6;i++){const k=i/6;ctx.lineTo(cx+(b.x-cam.x-cx)*k+(i<6?(i%2?8:-8):0),cy+14+(b.y-cam.y-cy-14)*k);}ctx.stroke();}
 if(pose.beat==='static'){ctx.fillStyle='#fff29a';ctx.font='700 14px sans-serif';ctx.textAlign='center';ctx.strokeStyle='#202a43';ctx.lineWidth=3;ctx.strokeText('¡No me peines!',x,y-80);ctx.fillText('¡No me peines!',x,y-80);}
 if(pose.beat==='farewell'){ctx.strokeStyle='#fff29a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-8,y-62);ctx.lineTo(x+2,y-70);ctx.lineTo(x-2,y-56);ctx.lineTo(x+8,y-64);ctx.stroke();}
 ctx.restore();
}
