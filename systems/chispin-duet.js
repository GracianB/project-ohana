import {drawThunderSeal} from './chispa-stagecraft.js';
import {guestPerformance,readGuestOrigin,surpriseGuestDrawer} from './u-duet-direction-v315.js';
// V303: a playable storm, with Michi chasing nine electrical tail wisps.
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n)),valid=n=>Number.isFinite(n)&&Math.abs(n)<=20000;
export function readChispinDuet(s){
 if(!s||readGuestOrigin(s)===null||![s.x,s.y].every(valid)||!Number.isInteger(s.age)||s.age<0||s.age>=120||!Number.isInteger(s.evo)||s.evo<0||s.evo>4||![-1,1].includes(s.facing))return null;
 const tails=s.tails||[],bolts=s.bolts||[];
 if(!Array.isArray(tails)||tails.length>9||tails.some(b=>!b||![b.x,b.y].every(valid)||!Number.isInteger(b.idx)||b.idx<0||b.idx>8||!Number.isFinite(b.life)||b.life<0||b.life>48)||!Array.isArray(bolts)||bolts.length>3||bolts.some(b=>!b||![b.x,b.y].every(valid)||!Number.isFinite(b.life)||b.life<0||b.life>22))return null;
 return {...(s.surprise===true?{surprise:true}:{}),...readGuestOrigin(s),x:s.x,y:s.y,age:s.age,evo:s.evo,facing:s.facing,tails:tails.map(b=>({x:b.x,y:b.y,idx:b.idx,life:b.life})),bolts:bolts.map(b=>({x:b.x,y:b.y,life:b.life}))};
}
export function chispinDuetPose(s,reduce=false){const guest=guestPerformance({...s,age:Math.min(119,s.age),hero:'chispin'},'cat',reduce);const jump=s.age>=18&&s.age<36?Math.sin((s.age-18)/18*Math.PI)*48:0;return {guest,cloudX:s.x,cloudY:s.y-145,catX:guest.x,catY:guest.y-jump,range:220+20*s.evo,beat:s.age<18?'arrival':s.age<36?'chase':s.age<104?'conduction':'farewell'};}
export function startChispinDuet(g,power=1){const p=g.player;if(!p||p.dead||p.id!=='chispin')return false;g._chispinDuet={...(p.uSurprise?{surprise:true}:{}),x:p.x+p.w/2,y:p.y+p.h,originX:p.x+p.w/2,originY:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),facing:p.facing===-1?-1:1,power:clamp(Number(power)||1,1,2),tails:[],bolts:[]};return true;}
export function updateChispinDuet(g,hit){
 const s=g._chispinDuet,p=g.player;if(!s){if(p)p._chispinDuetT=0;return;}
 if(!p||p.dead||p.id!=='chispin'||s.age>=120){g._chispinDuet=null;if(p)p._chispinDuetT=0;if(g._assist?.heroId==='cat')g._assist.t=0;return;}
 s.x=p.x+p.w/2;s.y=p.y+p.h;const pose=chispinDuetPose(s),damage=(70+s.evo*14)*s.power;
 const alive=e=>e&&e.hp>0&&!e.dying&&!e.fell;
 const targets=(g.enemies||[]).filter(e=>alive(e)&&Math.hypot(e.x+e.w/2-s.x,e.y+e.h/2-(s.y-25))<=pose.range).sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x));
 s.bolts=s.bolts.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);
 if(s.age>=36&&s.age<=84&&(s.age-36)%6===0){const idx=(s.age-36)/6,a=-1.2+idx*.3;s.tails.push({x:pose.catX,y:pose.catY-28,idx,life:48,vx:Math.cos(a)*s.facing*9,vy:Math.sin(a)*9,target:targets.length?targets[idx%targets.length]:null});}
 for(const b of s.tails){
  if((g.enemies||[]).includes(b.target)&&alive(b.target)&&Math.hypot(b.target.x+b.target.w/2-s.x,b.target.y+b.target.h/2-(s.y-25))<=pose.range){const dx=b.target.x+b.target.w/2-b.x,dy=b.target.y+b.target.h/2-b.y,d=Math.hypot(dx,dy);if(d<=12+Math.min(b.target.w,b.target.h)/2){hit(g,b.target,damage*.06,{color:'#ff9ce8',stun:22,kx:s.facing*2,ky:-2,hitstop:0,shake:0});b.life=0;}else{b.vx=dx/d*12;b.vy=dy/d*12;}}
  else b.target=null;
  b.x+=b.vx;b.y+=b.vy;b.life--;
 }
 s.tails=s.tails.filter(b=>b.life>0);
 if([42,66,90].includes(s.age))for(const e of targets.slice(0,3))if(hit(g,e,damage*.18,{color:'#e7d18e',stun:32,kx:s.facing*2,ky:-3,hitstop:0,shake:1}))s.bolts.push({x:e.x+e.w/2,y:e.y+e.h/2,life:22});
 p._chispinDuetAge=s.age;p._chispinDuetT=120-s.age;if(g._assist?.heroId==='cat')g._assist.t=120-s.age;s.age++;
}
export function drawChispinDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readChispinDuet(value);if(!s)return;drawActor=surpriseGuestDrawer(drawActor,s,cam,reduce);const pose=chispinDuetPose(s,reduce),x=s.x-cam.x,y=s.y-cam.y,cx=pose.cloudX-cam.x,cy=pose.cloudY-cam.y;
 ctx.save();ctx.globalAlpha*=s.age>108?(120-s.age)/12:1;
 // V370 U readability: 0.6 s visible charge, cloud grows, each thunder lingers ~0.4 s.
 const grow=Math.min(1,.55+s.age/40),flashOn=s.bolts.some(b=>b.life>16);
 if(s.age<36){const k=s.age/36,r=70-k*46;ctx.strokeStyle='#e7d18e';ctx.lineWidth=2+k*3;ctx.globalAlpha*=.5+.5*k;ctx.beginPath();ctx.arc(x,y-30,r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha/=(.5+.5*k);
  ctx.strokeStyle='#ffe14a';ctx.lineWidth=2;for(let i=0;i<3;i++){const ox=(i-1)*14;ctx.beginPath();ctx.moveTo(x+ox,y-50);for(let j=1;j<=5;j++){const yy=y-50+(cy+20-(y-50))*j/5*k;ctx.lineTo(x+ox+((j+i+(reduce?0:s.age>>2))%2?6:-6),yy);}ctx.stroke();}
  if(s.age>=12){ctx.font='900 16px sans-serif';ctx.textAlign='center';ctx.fillStyle='#e7d18e';ctx.strokeStyle='#291e46';ctx.lineWidth=4;ctx.strokeText('¡CARGANDO!',x,y-112);ctx.fillText('¡CARGANDO!',x,y-112);}}
 drawThunderSeal(ctx,cx,cy,58*grow,t,reduce,flashOn?1:.4);
 const def=roster.find(r=>r.id==='cat'),form=def?.forms?.[s.evo];
 if(def&&form)drawActor(ctx,{...def,...form,id:'cat',evo:s.evo,x:pose.catX-form.w/2,y:pose.catY-form.h,facing:pose.guest.facing,vx:pose.guest.vx,vy:pose.guest.vy,grounded:pose.guest.grounded,_poseOverride:pose.guest.pose,visualScale:.72,_duetActor:true},cam,t);
 // Nine curved conductors grow from the helper, then release homing wisps.
 if(s.age>=24&&s.age<104)for(let i=0;i<9;i++){const a=-1.25+i*.31,rx=pose.catX-cam.x,ry=pose.catY-cam.y-22,len=26+6*s.evo;ctx.strokeStyle=['#d7b0ff','#ff9ce8','#e7d18e'][i%3];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(rx,ry);ctx.quadraticCurveTo(rx-s.facing*18,ry-35,rx+Math.cos(a)*len*s.facing,ry+Math.sin(a)*len);ctx.stroke();}
 for(const b of s.tails){const bx=b.x-cam.x,by=b.y-cam.y;ctx.fillStyle=['#d7b0ff','#ff9ce8','#e7d18e'][b.idx%3];ctx.beginPath();ctx.ellipse(bx,by,7,4,reduce?0:t*.08+b.idx,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();}
 for(const b of s.bolts){const fade=Math.min(1,b.life/10),big=s.age>=86,bx=b.x-cam.x,by=b.y-cam.y,path=()=>{ctx.beginPath();ctx.moveTo(cx,cy+10);for(let i=1;i<=6;i++){const k=i/6;ctx.lineTo(cx+(bx-cx)*k+(i<6?(i%2?9:-9):0),cy+10+(by-cy-10)*k);}};
  ctx.globalAlpha*=fade;ctx.strokeStyle='#9be9ff';ctx.lineWidth=big?11:8;path();ctx.stroke();ctx.strokeStyle='#fffbe0';ctx.lineWidth=big?5:3;path();ctx.stroke();
  const ring=10+(22-b.life)*(big?3.4:2.4);ctx.strokeStyle='#e7d18e';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(bx,by+8,ring,ring*.35,0,0,Math.PI*2);ctx.stroke();
  if(b.life>8){ctx.font=`900 ${big?22:16}px sans-serif`;ctx.textAlign='center';ctx.fillStyle='#e7d18e';ctx.strokeStyle='#291e46';ctx.lineWidth=4;ctx.strokeText('¡ZAS!',bx,by-26);ctx.fillText('¡ZAS!',bx,by-26);}
  ctx.globalAlpha/=fade;}
 if(pose.beat==='chase'){ctx.fillStyle='#e7d18e';ctx.beginPath();ctx.arc(x-45*s.facing,y-88,5,0,Math.PI*2);ctx.fill();ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.fillText('¡Eso no es un ovillo!',x,y-185);}
 if(pose.beat==='farewell'){ctx.strokeStyle='#ff9ce8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pose.catX-cam.x,pose.catY-cam.y-50,12,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}

// Only visual fields cross the network; no targets, damage or hit sets.
export function readChispinEffects(list){
 if(!Array.isArray(list)||list.length>8)return null;const out=[];
 for(const f of list){if(!f||!['chain','trail','storm'].includes(f.kind)||!Number.isFinite(f.life)||f.life<=0||f.life>260)return null;
 const v={kind:f.kind,life:f.life};
 if(f.kind==='chain'){if(!Array.isArray(f.pts)||f.pts.length<2||f.pts.length>6||f.pts.some(b=>!b||![b.x,b.y].every(valid)))return null;v.pts=f.pts.map(b=>({x:b.x,y:b.y}));}
 if(f.kind==='trail'){if(![f.x1,f.y1,f.x2,f.y2].every(valid))return null;for(const k of ['x1','y1','x2','y2'])v[k]=f[k];}
 if(f.kind==='storm'){if(![f.x,f.y].every(valid)||!Array.isArray(f.bolts)||f.bolts.length>3||f.bolts.some(b=>!b||![b.x,b.y1,b.y2].every(valid)||!Number.isFinite(b.life)||b.life<=0||b.life>10))return null;v.x=f.x;v.y=f.y;v.next=clamp(Number(f.next)||0,0,20);v.bolts=f.bolts.map(b=>({x:b.x,y1:b.y1,y2:b.y2,life:b.life}));}if(f.kind==='storm'&&f.forecast!==undefined){const p=f.forecast;if(!p||![p.x,p.y1,p.y2].every(valid))return null;v.forecast={x:p.x,y1:p.y1,y2:p.y2};}out.push(v);
 }return out;
}
