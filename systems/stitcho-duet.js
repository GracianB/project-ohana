import {guestPerformance,readGuestOrigin,surpriseGuestDrawer} from './u-duet-direction-v315.js';
// V302: in-world controllable chaos and Chispin storm.
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function readStitchoDuet(s){
 if(!s||readGuestOrigin(s)===null||![s.x,s.y,s.age,s.evo,s.facing].every(Number.isFinite)||Math.abs(s.x)>20000||Math.abs(s.y)>20000||!Number.isInteger(s.age)||s.age<0||s.age>=120||!Number.isInteger(s.evo)||s.evo<0||s.evo>4||![-1,1].includes(s.facing))return null;
 const bolts=Array.isArray(s.bolts)?s.bolts:[];
 if(bolts.length>3||bolts.some(b=>!b||![b.x,b.y,b.life].every(Number.isFinite)||Math.abs(b.x)>20000||Math.abs(b.y)>20000||b.life<0||b.life>12))return null;
 const imp=(Array.isArray(s.impacts)?s.impacts:[]).filter(b=>b&&[b.x,b.y,b.life].every(Number.isFinite)&&Math.abs(b.x)<=20000&&Math.abs(b.y)<=20000&&b.life>0&&b.life<=14).slice(0,6);
 return {...(s.surprise===true?{surprise:true}:{}),...readGuestOrigin(s),x:s.x,y:s.y,age:s.age,evo:s.evo,facing:s.facing,bolts:bolts.map(b=>({x:b.x,y:b.y,life:b.life})),impacts:imp.map(b=>({x:b.x,y:b.y,life:b.life}))};
}
export function stitchoDuetPose(s,reduce=false){const guest=guestPerformance({...s,age:Math.min(119,s.age),hero:"stitcho"},"chispin",reduce);return {guest,cloudX:guest.x,cloudY:guest.y,radius:66+s.evo*12,range:180+s.evo*22,beat:s.age<18?'arrival':s.age<30?'static':s.age<102?'storm':'farewell'};}
export function startStitchoDuet(g,power=1){
 const p=g.player;if(!p||p.dead||p.id!=='stitcho')return false;
 g._stitchoDuet={...(p.uSurprise?{surprise:true}:{}),x:p.x+p.w/2,y:p.y+p.h,originX:p.x+p.w/2,originY:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),facing:p.facing===-1?-1:1,power:clamp(Number(power)||1,1,2),chaos:new Set(),bolts:[],impacts:[]};return true;
}
export function updateStitchoDuet(g,hit){
 const s=g._stitchoDuet,p=g.player;if(!s){if(p)p._stitchoDuetT=0;return;}
 if(!p||p.dead||p.id!=='stitcho'||s.age>=120){g._stitchoDuet=null;if(p)p._stitchoDuetT=0;if(g._assist?.heroId==='chispin')g._assist.t=0;return;}
 s.x=p.x+p.w/2;s.y=p.y+p.h;s.bolts=s.bolts.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);s.impacts=(s.impacts||[]).map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);
 const pose=stitchoDuetPose(s),damage=(70+s.evo*14)*s.power;
 const targets=(g.enemies||[]).filter(e=>e&&e.hp>0&&!e.dying&&!e.fell);
 if(s.age>=30&&s.age<102){
  for(const e of targets)if(Math.hypot(e.x+e.w/2-s.x,e.y+e.h/2-(s.y-24))<=pose.radius+Math.min(e.w,e.h)/2&&!s.chaos.has(e)&&hit(g,e,damage*.55,{color:'#67ddff',stun:36,kx:s.facing*(9+s.evo),ky:-5-s.evo*.5,hitstop:3,shake:1})){s.chaos.add(e);if(s.impacts.length<6)s.impacts.push({x:e.x+e.w/2,y:e.y+e.h/2,life:14});}
  if([42,66,90].includes(s.age)){
   const nearby=targets.filter(e=>Math.hypot(e.x+e.w/2-pose.cloudX,e.y+e.h/2-(s.y-24))<=pose.range).sort((a,b)=>Math.hypot(a.x-pose.cloudX,a.y-s.y)-Math.hypot(b.x-pose.cloudX,b.y-s.y)).slice(0,3);
   for(const e of nearby)if(hit(g,e,damage*.15,{color:'#fff29a',stun:56,kx:s.facing*3,ky:-3,hitstop:0,shake:1}))s.bolts.push({x:e.x+e.w/2,y:e.y+e.h/2,life:12});
  }
 }
 p._stitchoDuetAge=s.age;p._stitchoDuetT=120-s.age;if(g._assist?.heroId==='chispin')g._assist.t=120-s.age;s.age++;
}
export function drawStitchoDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readStitchoDuet(value);if(!s)return;drawActor=surpriseGuestDrawer(drawActor,s,cam,reduce);const pose=stitchoDuetPose(s,reduce),x=s.x-cam.x,y=s.y-24-cam.y,cx=pose.cloudX-cam.x,cy=pose.cloudY-cam.y;
 ctx.save();ctx.globalAlpha*=s.age>108?(120-s.age)/12:1;
 // Plasma alienígena de Stitcho: carga (0-30 ticks ≈ 0,5 s), costuras de plasma y anillos de impacto. Sin gradientes; partículas acotadas.
 const k=s.evo,plasma=['#7fe9ff','#62f3ff','#3fd8ff','#4ad2ff','#c5a8ff'][k],core='#e8ffff';
 if(s.age<30){const u=s.age/30,orb=6+u*(10+k*3),n=5+k;ctx.lineCap='round';
  for(let i=0;i<n;i++){const a=i*Math.PI*2/n+(reduce?0:t*.08),d=(1-u)*(46+k*8)+orb;ctx.strokeStyle=i%2?core:plasma;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*d,y-10+Math.sin(a)*d);ctx.lineTo(x+Math.cos(a)*(d+8),y-10+Math.sin(a)*(d+8));ctx.stroke();}
  ctx.globalAlpha*=.35+u*.4;ctx.fillStyle=plasma;ctx.beginPath();ctx.arc(x,y-10,orb*1.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha/=.35+u*.4;
  ctx.fillStyle=core;ctx.strokeStyle='#1b2460';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-10,orb,0,Math.PI*2);ctx.fill();ctx.stroke();}
 if(s.age>=30&&s.age<102){const r=66+k*12,sp=reduce?0:t*.09;ctx.strokeStyle=plasma;ctx.lineWidth=2.4;
  for(let i=0;i<8+k*2;i++){const a=sp+i*Math.PI*2/(8+k*2),ix=x+Math.cos(a)*(r+4),iy=y+Math.sin(a)*(r+4);ctx.beginPath();ctx.moveTo(ix-Math.sin(a)*5,iy+Math.cos(a)*5);ctx.lineTo(ix+Math.sin(a)*5,iy-Math.cos(a)*5);ctx.stroke();}
  ctx.fillStyle=core;ctx.beginPath();ctx.arc(x,y-10,5+k,0,Math.PI*2);ctx.fill();}
 for(const b of s.impacts){const u=1-b.life/14,ix=b.x-cam.x,iy=b.y-cam.y;ctx.strokeStyle=u<.5?core:plasma;ctx.lineWidth=3-u*2;ctx.beginPath();ctx.arc(ix,iy,8+u*(22+k*4),0,Math.PI*2);ctx.stroke();
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;ctx.beginPath();ctx.moveTo(ix+Math.cos(a)*(6+u*10),iy+Math.sin(a)*(6+u*10));ctx.lineTo(ix+Math.cos(a)*(12+u*22),iy+Math.sin(a)*(12+u*22));ctx.stroke();}}
 if(s.age>=30&&s.age<102){
  ctx.strokeStyle='#67ddff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,pose.radius,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#8f7bff';ctx.lineWidth=2;
  for(let i=0;i<3;i++){const a=(reduce?0:t*.06)+i*Math.PI*2/3;ctx.beginPath();ctx.arc(x,y,pose.radius-6,a,a+1.2);ctx.stroke();}
 }
 ctx.fillStyle='#b8ceff';ctx.strokeStyle='#303154';ctx.lineWidth=3;
 for(const [dx,dy,r] of [[-26,2,22],[0,-9,27],[26,2,22]]){ctx.beginPath();ctx.arc(cx+dx,cy+dy,r,0,Math.PI*2);ctx.fill();ctx.stroke();}
 const def=roster.find(r=>r.id==='chispin'),form=def?.forms?.[s.evo];
 if(def&&form)drawActor(ctx,{...def,...form,id:'chispin',evo:s.evo,x:pose.cloudX-form.w/2,y:pose.cloudY-form.h-12,facing:pose.guest.facing,vx:pose.guest.vx,vy:pose.guest.vy,grounded:pose.guest.grounded,_poseOverride:pose.guest.pose,visualScale:.72,_duetActor:true},cam,t);
 for(const b of s.bolts){ctx.strokeStyle='#fff29a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy+14);for(let i=1;i<=6;i++){const k=i/6;ctx.lineTo(cx+(b.x-cam.x-cx)*k+(i<6?(i%2?8:-8):0),cy+14+(b.y-cam.y-cy-14)*k);}ctx.stroke();}
 if(pose.beat==='static'){ctx.fillStyle='#fff29a';ctx.font='700 14px sans-serif';ctx.textAlign='center';ctx.strokeStyle='#202a43';ctx.lineWidth=3;ctx.strokeText('¡No me peines!',x,y-80);ctx.fillText('¡No me peines!',x,y-80);}
 if(pose.beat==='farewell'){ctx.strokeStyle='#fff29a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-8,y-62);ctx.lineTo(x+2,y-70);ctx.lineTo(x-2,y-56);ctx.lineTo(x+8,y-64);ctx.stroke();}
 ctx.restore();
}
