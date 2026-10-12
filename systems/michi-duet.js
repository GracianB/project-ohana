// V304: nine orbiting tails catch three telegraphed meteors from Dragon.
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n)),finite=n=>Number.isFinite(n)&&Math.abs(n)<=20000;
export function readMichiDuet(s){
 if(!s||![s.x,s.y].every(finite)||!Number.isInteger(s.age)||s.age<0||s.age>=120||!Number.isInteger(s.evo)||s.evo<0||s.evo>4||![-1,1].includes(s.facing)||!Array.isArray(s.stars)||s.stars.length>3||s.stars.some(b=>!b||![b.x,b.y].every(finite)||!Number.isInteger(b.age)||b.age<0||b.age>30))return null;
 return {x:s.x,y:s.y,age:s.age,evo:s.evo,facing:s.facing,stars:s.stars.map(b=>({x:b.x,y:b.y,age:b.age}))};
}
export function michiDuetPose(s){return {radius:84+s.evo*10,meteorRadius:42+s.evo*3,dragonX:s.x-s.facing*95,dragonY:s.y-110,beat:s.age<18?'arrival':s.age<36?'yarn':s.age<104?'catch':'farewell'};}
export function startMichiDuet(g,power=1){const p=g.player;if(!p||p.dead||p.id!=='cat')return false;g._michiDuet={x:p.x+p.w/2,y:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),facing:p.facing===-1?-1:1,power:clamp(Number(power)||1,1,2),stars:[],tailsHit:new Set()};return true;}
export function updateMichiDuet(g,hit){
 const s=g._michiDuet,p=g.player;if(!s){if(p)p._michiDuetT=0;return;}
 if(!p||p.dead||p.id!=='cat'||s.age>=120){g._michiDuet=null;if(p)p._michiDuetT=0;if(g._assist?.heroId==='dragon')g._assist.t=0;return;}
 s.x=p.x+p.w/2;s.y=p.y+p.h;const pose=michiDuetPose(s),damage=(70+s.evo*14)*s.power;
 const targets=(g.enemies||[]).filter(e=>e&&e.hp>0&&!e.dying&&!e.fell);
 if([36,60,84].includes(s.age)){const nearby=targets.filter(e=>Math.hypot(e.x+e.w/2-s.x,e.y+e.h/2-(s.y-25))<=220+20*s.evo).sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x));const e=nearby[0];s.stars.push({x:e?e.x+e.w/2:s.x+s.facing*70,y:e?e.y+e.h/2:s.y-20,age:0});}
 for(const b of s.stars){if(b.age===18)for(const e of targets)if(Math.hypot(e.x+e.w/2-b.x,e.y+e.h/2-b.y)<=pose.meteorRadius+Math.min(e.w,e.h)/2)hit(g,e,damage*.2,{color:'#ffb379',stun:30,kx:s.facing*3,ky:-3,hitstop:0,shake:1});b.age++;}s.stars=s.stars.filter(b=>b.age<=30);
 if(s.age>=48&&s.age<104)for(const e of targets)if(!s.tailsHit.has(e)&&Math.hypot(e.x+e.w/2-s.x,(e.y+e.h/2-(s.y-25))/.55)<=pose.radius+Math.min(e.w,e.h)/2&&hit(g,e,damage*.45,{color:'#d7b0ff',stun:36,kx:s.facing*4,ky:-4,hitstop:0,shake:1}))s.tailsHit.add(e);
 p._michiDuetAge=s.age;p._michiDuetT=120-s.age;if(g._assist?.heroId==='dragon')g._assist.t=120-s.age;s.age++;
}
export function drawMichiDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readMichiDuet(value);if(!s)return;const pose=michiDuetPose(s),x=s.x-cam.x,y=s.y-25-cam.y;ctx.save();ctx.globalAlpha*=s.age>108?(120-s.age)/12:1;
 const def=roster.find(r=>r.id==='dragon'),form=def?.forms?.[s.evo];if(def&&form)drawActor(ctx,{...def,...form,id:'dragon',evo:s.evo,x:pose.dragonX-form.w/2,y:pose.dragonY-form.h,facing:s.facing,vx:0,vy:0,grounded:false,visualScale:.56,_duetActor:true},cam,t);
 if(s.age>=24&&s.age<104)for(let i=0;i<9;i++){const a=i*Math.PI*2/9+(reduce?0:s.age*.035),r=pose.radius*Math.min(1,(s.age-24)/12),tx=x+Math.cos(a)*r,ty=y+Math.sin(a)*r*.55;ctx.strokeStyle=['#d7b0ff','#ff9cdb','#fff1c4'][i%3];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a-.5)*r*.7,y+Math.sin(a-.5)*r*.6,tx,ty);ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.ellipse(tx,ty,7,4,a,0,Math.PI*2);ctx.fill();}
 for(const b of s.stars){const bx=b.x-cam.x,by=b.y-cam.y;if(b.age<=18){const k=b.age/18,my=by-190*(1-k);ctx.strokeStyle='#ffbe85';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(bx,by,pose.meteorRadius,pose.meteorRadius*.3,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#ffdca0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(bx-18*s.facing,my-36);ctx.lineTo(bx,my);ctx.stroke();ctx.fillStyle='#ff986a';ctx.beginPath();ctx.arc(bx,my,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff2d2';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<3;i++){ctx.ellipse(bx,my,9-i*2,5+i,Math.PI/3*i,0,Math.PI*2);}ctx.stroke();}else{ctx.strokeStyle='#ffb6e4';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(bx,by,pose.meteorRadius+(b.age-18)*2,12+(b.age-18),0,0,Math.PI*2);ctx.stroke();}}
 if(pose.beat==='yarn'){ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff0d8';ctx.fillText('¡Ese ovillo quema!',x,y-150);}
 if(pose.beat==='farewell'){ctx.fillStyle='#ffcf93';ctx.beginPath();ctx.arc(x+s.facing*30,y-10,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff0d8';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+s.facing*30,y-10,5,2,1,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}
export function readMichiEffects(list){
 if(!Array.isArray(list)||list.length>12)return null;const out=[];
 for(const f of list){if(!f||!['yarn','purr','wisp'].includes(f.kind)||!Number.isFinite(f.life)||f.life<=0||f.life>240)return null;const v={kind:f.kind,life:f.life};
 if(f.kind==='purr'){if(!Number.isFinite(f.R)||f.R<0||f.R>650)return null;v.R=f.R;v.max=72;}
 else{if(![f.x,f.y,f.vx,f.vy].every(finite)||Math.abs(f.vx)>60||Math.abs(f.vy)>60)return null;for(const k of ['x','y','vx','vy'])v[k]=f[k];v.rot=clamp(Number(f.rot)||0,-20000,20000);v.r=clamp(Number(f.r)||10,1,24);v.idx=clamp(Math.floor(Number(f.idx)||0),0,8);v.tail=f.tail===true;v.color=/^#[0-9a-f]{6}$/i.test(f.color)?f.color:'#ffb6e4';v.trail=Array.isArray(f.trail)?f.trail.slice(-4).map(b=>({x:b.x,y:b.y})):[];if(v.trail.some(b=>![b.x,b.y].every(finite)))return null;}out.push(v);
 }return out;
}
