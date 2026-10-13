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
 for(const b of s.stars){if(b.age===18)for(const e of targets)if(Math.hypot(e.x+e.w/2-b.x,e.y+e.h/2-b.y)<=pose.meteorRadius+Math.min(e.w,e.h)/2)hit(g,e,damage*.2,{color:'#ffb379',stun:30,kx:s.facing*4,ky:-4,hitstop:4,shake:2});b.age++;}s.stars=s.stars.filter(b=>b.age<=30);
 if(s.age>=48&&s.age<104)for(const e of targets)if(!s.tailsHit.has(e)&&Math.hypot(e.x+e.w/2-s.x,(e.y+e.h/2-(s.y-25))/.55)<=pose.radius+Math.min(e.w,e.h)/2&&hit(g,e,damage*.45,{color:'#d7b0ff',stun:36,kx:s.facing*5,ky:-4,hitstop:3,shake:1}))s.tailsHit.add(e);
 p._michiDuetAge=s.age;p._michiDuetT=120-s.age;if(g._assist?.heroId==='dragon')g._assist.t=120-s.age;s.age++;
}
const MICHI_U_FORM=[{name:'Michito',w:7,tip:8,glow:'#ffd6ee'},{name:'Michi',w:8,tip:9,glow:'#ffc4e6'},{name:'Nube rosa',w:9,tip:10,glow:'#ffe0f2'},{name:'Michi Luna',w:10,tip:11,glow:'#e6d6ff'},{name:'Michi Eclipse',w:12,tip:13,glow:'#7a4ae0'}];
const MICHI_U_COLORS=['#ff9cdb','#c9a2ff','#ffd36b'];
function uText(ctx,txt,x,y,size,fill,a=1){ctx.save();ctx.globalAlpha*=a;ctx.font=`900 ${size}px sans-serif`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=5;ctx.strokeStyle='#4a2f8a';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y);ctx.restore();}
export function drawMichiDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readMichiDuet(value);if(!s)return;const pose=michiDuetPose(s),F=MICHI_U_FORM[s.evo],x=s.x-cam.x,y=s.y-25-cam.y,age=s.age;ctx.save();ctx.globalAlpha*=age>108?(120-age)/12:1;ctx.lineCap='round';
 const def=roster.find(r=>r.id==='dragon'),form=def?.forms?.[s.evo];if(def&&form)drawActor(ctx,{...def,...form,id:'dragon',evo:s.evo,x:pose.dragonX-form.w/2,y:pose.dragonY-form.h,facing:s.facing,vx:0,vy:0,grounded:false,visualScale:.56,_duetActor:true},cam,t);
 // 1) Anticipación 0-24: aro que se cierra hacia Michi + chispas convergentes + texto.
 if(age<28){const k=Math.min(1,age/24),R=pose.radius*1.6*(1-k)+18;ctx.save();ctx.globalAlpha*=age<24?.35+.65*k:(28-age)/4;ctx.strokeStyle=MICHI_U_COLORS[0];ctx.lineWidth=4+4*k;ctx.beginPath();ctx.ellipse(x,y,R,R*.6,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=MICHI_U_COLORS[2];ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.ellipse(x,y,R+10,(R+10)*.6,reduce?0:age*.05,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9,d=R*1.05;ctx.fillStyle=MICHI_U_COLORS[i%3];ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d*.6,3+2*k,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle=F.glow;ctx.globalAlpha*=.5*k;ctx.beginPath();ctx.arc(x,y,14+10*k,0,Math.PI*2);ctx.fill();ctx.restore();
  uText(ctx,'¡NUEVE VIDAS!',x,y-pose.radius*.6-60-6*(1-k),20+s.evo*2,'#ffe6f5',Math.min(1,age/6));}
 // Disco de eclipse detrás de las colas (forma 5).
 if(s.evo===4&&age>=20&&age<108){const k=Math.min(1,(age-20)/12);ctx.save();ctx.globalAlpha*=.55*k;ctx.fillStyle='#ffb3dc';ctx.beginPath();ctx.arc(x,y,40*k+4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4a2f8a';ctx.beginPath();ctx.arc(x+5,y-3,36*k,0,Math.PI*2);ctx.fill();ctx.restore();}
 // 2) Nueve colas gruesas 24-104.
 if(age>=24&&age<104){const grow=Math.min(1,(age-24)/12),fade=age>96?(104-age)/8:1,r=pose.radius*(.25+.75*grow);ctx.save();ctx.globalAlpha*=fade;
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9+(reduce?0:age*.035)*s.facing,wav=reduce?0:Math.sin(age*.15+i)*.18,tx=x+Math.cos(a)*r,ty=y+Math.sin(a)*r*.55,cx=x+Math.cos(a-.55+wav)*r*.65,cy=y+Math.sin(a-.55+wav)*r*.6,col=MICHI_U_COLORS[i%3];
   ctx.strokeStyle='#4a2f8a';ctx.lineWidth=F.w+4;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();
   ctx.strokeStyle=col;ctx.lineWidth=F.w;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();
   ctx.strokeStyle='#fff6fb';ctx.lineWidth=Math.max(2,F.w*.3);ctx.beginPath();ctx.moveTo(x+(cx-x)*.3,y+(cy-y)*.3);ctx.quadraticCurveTo(cx,cy,x+(tx-x)*.85,y+(ty-y)*.85);ctx.stroke();
   ctx.fillStyle='#fff6fb';ctx.strokeStyle='#4a2f8a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(tx,ty,F.tip,F.tip*.62,a,0,Math.PI*2);ctx.fill();ctx.stroke();}
  ctx.fillStyle=F.glow;ctx.strokeStyle='#4a2f8a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,9+s.evo,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();}
 // Meteoros: marcador en el suelo 18 frames antes, caída y aro de impacto al atraparlo.
 for(const b of s.stars){const bx=b.x-cam.x,by=b.y-cam.y,mr=pose.meteorRadius;if(b.age<=18){const k=b.age/18,my=by-200*(1-k),pulse=reduce?0:Math.sin(b.age*.6)*3;
   ctx.save();ctx.strokeStyle='#ff6a4a';ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();ctx.ellipse(bx,by,mr+pulse,(mr+pulse)*.32,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx-10,by);ctx.lineTo(bx+10,by);ctx.moveTo(bx,by-6);ctx.lineTo(bx,by+6);ctx.stroke();
   uText(ctx,'!',bx,by-mr*.32-10,18,'#ffd36b',.6+.4*k);
   ctx.strokeStyle='#ffdca0';ctx.lineWidth=8;ctx.globalAlpha*=.7;ctx.beginPath();ctx.moveTo(bx-26*s.facing,my-48);ctx.lineTo(bx,my);ctx.stroke();ctx.globalAlpha/=.7;
   ctx.fillStyle='#ff7a4a';ctx.strokeStyle='#7a2a10';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,my,13+s.evo,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.arc(bx-3,my-3,6,0,Math.PI*2);ctx.fill();ctx.restore();}
  else{const k=(b.age-18)/12;ctx.save();ctx.globalAlpha*=1-k*.8;ctx.strokeStyle='#ff9cdb';ctx.lineWidth=6*(1-k)+2;ctx.beginPath();ctx.ellipse(bx,by,mr*(.6+k*.9),mr*(.6+k*.9)*.45,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ffd36b';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(bx,by,mr*(.3+k*.6),mr*(.3+k*.6)*.45,0,0,Math.PI*2);ctx.stroke();
   for(let i=0;i<6;i++){const a=i*Math.PI/3,d=12+k*mr;ctx.fillStyle=MICHI_U_COLORS[i%3];ctx.beginPath();ctx.arc(bx+Math.cos(a)*d,by+Math.sin(a)*d*.5,4*(1-k)+1,0,Math.PI*2);ctx.fill();}
   if(b.age<26)uText(ctx,'¡ATRAPADO!',bx,by-mr*.5-14-k*10,15,'#fff1c4',1-k);ctx.restore();}}
 if(pose.beat==='yarn'&&age>=28)uText(ctx,'¡Ese ovillo quema!',x,y-pose.radius*.6-60,14,'#fff0d8');
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
