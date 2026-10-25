import {surpriseDuetTicks,guestPerformance,readGuestOrigin,surpriseGuestDrawer} from './u-duet-direction-v315.js';
// V304: nine orbiting tails catch three telegraphed meteors from Dragon.
import {michiYomiImpact} from './michi-yomi-play.js';
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n)),finite=n=>Number.isFinite(n)&&Math.abs(n)<=20000;
export function readMichiDuet(s){
 if(!s||readGuestOrigin(s)===null||![s.x,s.y].every(finite)||!Number.isInteger(s.age)||s.age<0||s.age>=surpriseDuetTicks(s)||!Number.isInteger(s.evo)||s.evo<0||s.evo>4||![-1,1].includes(s.facing)||!Array.isArray(s.stars)||s.stars.length>3||s.stars.some(b=>!b||![b.x,b.y].every(finite)||!Number.isInteger(b.age)||b.age<0||b.age>30))return null;
 return {...(s.surprise===true?{surprise:true}:{}),...readGuestOrigin(s),x:s.x,y:s.y,age:s.age,evo:s.evo,facing:s.facing,stars:s.stars.map(b=>({x:b.x,y:b.y,age:b.age}))};
}
export function michiDuetPose(s,reduce=false){const guest=guestPerformance({...s,age:s.age,hero:'cat'},'dragon',reduce);return {guest,radius:84+s.evo*10,meteorRadius:42+s.evo*3,dragonX:guest.x,dragonY:guest.y,beat:s.age<18?'arrival':s.age<36?'yarn':s.age<104?'catch':'farewell'};}
export function startMichiDuet(g,power=1){const p=g.player;if(!p||p.dead||p.id!=='cat')return false;g._michiDuet={...(p.uSurprise?{surprise:true}:{}),x:p.x+p.w/2,y:p.y+p.h,originX:p.x+p.w/2,originY:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),facing:p.facing===-1?-1:1,power:clamp(Number(power)||1,1,2),stars:[],tailsHit:new Set()};return true;}
export function updateMichiDuet(g,hit){
 const s=g._michiDuet,p=g.player;if(!s){if(p)p._michiDuetT=0;return;}
 if(!p||p.dead||p.id!=='cat'||s.age>=surpriseDuetTicks(s)){g._michiDuet=null;if(p)p._michiDuetT=0;if(g._assist?.heroId==='dragon')g._assist.t=0;return;}
 s.x=p.x+p.w/2;s.y=p.y+p.h;const pose=michiDuetPose(s),damage=(70+s.evo*14)*s.power;
 const targets=(g.enemies||[]).filter(e=>e&&e.hp>0&&!e.dying&&!e.fell);
 if([36,60,84].includes(s.age)){const nearby=targets.filter(e=>Math.hypot(e.x+e.w/2-s.x,e.y+e.h/2-(s.y-25))<=220+20*s.evo).sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x));const e=nearby[0];s.stars.push({x:e?e.x+e.w/2:s.x+s.facing*70,y:e?e.y+e.h/2:s.y-20,age:0});}
 for(const b of s.stars){if(b.age===18)for(const e of targets)if(Math.hypot(e.x+e.w/2-b.x,e.y+e.h/2-b.y)<=pose.meteorRadius+Math.min(e.w,e.h)/2){hit(g,e,damage*.2,{color:'#ffb379',stun:30,kx:s.facing*4,ky:-4,hitstop:4,shake:2});michiYomiImpact(e.x+e.w/2,e.y+e.h/2,'¡ATRAPADO!','#ffb379',{life:72,big:1.8});}b.age++;}s.stars=s.stars.filter(b=>b.age<=30);
 if(s.age>=48&&s.age<104)for(const e of targets)if(!s.tailsHit.has(e)&&Math.hypot(e.x+e.w/2-s.x,(e.y+e.h/2-(s.y-25))/.55)<=pose.radius+Math.min(e.w,e.h)/2&&hit(g,e,damage*.45,{color:'#d7b0ff',stun:36,kx:s.facing*5,ky:-4,hitstop:3,shake:1})){s.tailsHit.add(e);michiYomiImpact(e.x+e.w/2,e.y+e.h/2,'¡NUEVE VIDAS!','#d7b0ff',{life:72,big:1.8});}
 p._michiDuetAge=s.age;p._michiDuetT=surpriseDuetTicks(s)-s.age;if(g._assist?.heroId==='dragon')g._assist.t=surpriseDuetTicks(s)-s.age;s.age++;
}
const MICHI_U_FORM=[{name:'Michito',w:7,tip:8,glow:'#ffd6ee'},{name:'Michi',w:8,tip:9,glow:'#ffc4e6'},{name:'Nube rosa',w:9,tip:10,glow:'#ffe0f2'},{name:'Michi Luna',w:10,tip:11,glow:'#e6d6ff'},{name:'Michi Eclipse',w:12,tip:13,glow:'#7a4ae0'}];
const MICHI_U_COLORS=['#ff9cdb','#c9a2ff','#ffd36b'];
function uText(ctx,txt,x,y,size,fill,a=1){ctx.save();ctx.globalAlpha*=a;ctx.font=`900 ${size}px sans-serif`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=5;ctx.strokeStyle='#4a2f8a';ctx.strokeText(txt,x,y);ctx.fillStyle=fill;ctx.fillText(txt,x,y);ctx.restore();}
// V371 · Colas de gato realistas: 12 segmentos afilados, latigazo con desfase de fase, capas de color planas (sin gradientes ni brillo blanco).
const MICHI_TAIL_PAL=[
 {w:16,line:'#8a5a2a',fur:'#ffe3b8',top:'#fff1dc',shade:'#f0c88a',tip:'#c98f45'},
 {w:17,line:'#8f3a70',fur:'#ffc4e6',top:'#ffdff0',shade:'#eea2cf',tip:'#c0609c'},
 {w:18,line:'#9a4a82',fur:'#ffd0e8',top:'#ffe6f3',shade:'#f0a6d0',tip:'#c96aa4'},
 {w:20,line:'#3e2a7a',fur:'#c9b4ff',top:'#e0d4ff',shade:'#a690ea',tip:'#5a3fa0'},
 {w:22,line:'#2e1a5e',fur:'#ffb3dc',top:'#ffcfe8',shade:'#e488bd',tip:'#7a4ae0'},
];
function mixHex(h,k){const n=parseInt(h.slice(1),16),f=c=>Math.round(k>0?c+(255-c)*k:c*(1+k));return'#'+[n>>16,(n>>8)&255,n&255].map(c=>f(c).toString(16).padStart(2,'0')).join('');}
// Cola esponjosa: tubo de círculos solapados (punta redonda), festones de pelo y 3 capas planas.
function drawMichiTail(ctx,x,y,a,len,P,age,i,face,reduce,hairs){
 const N=22,pts=[];let px=x,py=y;
 for(let j=0;j<=N;j++){const u=j/N,w=P.w*(1-.5*u)*(u>.9?1-(u-.9)*2.2:1)*(j<2?.8+.1*j:1);
  pts.push({x:px,y:py,u,r:w/2});
  const lash=reduce?0:Math.sin(age*.09-u*2.1+i*.8)*.42*u+Math.sin(age*.05-u*1.2+i)*.12;
  const ang=a+lash-face*.35*u*u;px+=Math.cos(ang)*len/N;py+=Math.sin(ang)*len/N;}
 const fur=mixHex(P.fur,(i%3-1)*.06);
 const layer=(col,rf,off,from=0,lobes=false)=>{ctx.fillStyle=col;ctx.beginPath();
  for(let j=0;j<=N;j++){const q=pts[j];if(q.u<from)continue;const n=pts[Math.min(N,j+1)],o=pts[Math.max(0,j-1)],dx=n.x-o.x,dy=n.y-o.y,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;
   const cx=q.x+nx*q.r*off,cy=q.y+ny*q.r*off,R=Math.max(1,q.r*rf);ctx.moveTo(cx+R,cy);ctx.arc(cx,cy,R,0,Math.PI*2);
   if(lobes&&j%3===0&&j>1){const lr=q.r*.34*rf;for(const sd of [-1,1]){const lx=q.x+nx*sd*q.r*.82,ly=q.y+ny*sd*q.r*.82-(lr*.2);ctx.moveTo(lx+lr,ly);ctx.arc(lx,ly,lr,0,Math.PI*2);}}}
  ctx.fill();};
 const outline=2.4;ctx.save();
 ctx.fillStyle=P.line;ctx.beginPath();
 for(let j=0;j<=N;j++){const q=pts[j],n=pts[Math.min(N,j+1)],o=pts[Math.max(0,j-1)],dx=n.x-o.x,dy=n.y-o.y,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d,R=q.r+outline;ctx.moveTo(q.x+R,q.y);ctx.arc(q.x,q.y,R,0,Math.PI*2);
  if(j%3===0&&j>1){const lr=q.r*.34+outline;for(const sd of [-1,1]){const lx=q.x+nx*sd*q.r*.82,ly=q.y+ny*sd*q.r*.82-q.r*.08;ctx.moveTo(lx+lr,ly);ctx.arc(lx,ly,lr,0,Math.PI*2);}}}
 ctx.fill();
 layer(P.shade,1,0,0,true);
 layer(fur,.82,-.12,0,false);
 layer(P.top,.42,-.42,.08,false);
 layer(P.tip,1,0,.76,true);
 layer(mixHex(P.tip,.18),.55,-.3,.8,false);
 if(hairs&&!reduce){for(let k=0;k<2;k++){const ph=((age+i*7+k*13)%30)/30,src=pts[N-2-k*5];
  ctx.globalAlpha*=1-ph;ctx.strokeStyle=k?P.shade:fur;ctx.lineWidth=1.3;ctx.lineCap='round';const hx=src.x+Math.sin(ph*5+i)*6,hy=src.y-ph*18+ph*ph*30;
  ctx.beginPath();ctx.moveTo(hx,hy);ctx.quadraticCurveTo(hx+3,hy+2,hx+1,hy+6);ctx.stroke();ctx.globalAlpha/=Math.max(.001,1-ph);}}
 ctx.restore();
}
export function drawMichiDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readMichiDuet(value);if(!s)return;drawActor=surpriseGuestDrawer(drawActor,s,cam,reduce);const pose=michiDuetPose(s,reduce),F=MICHI_U_FORM[s.evo],x=s.x-cam.x,y=s.y-25-cam.y,age=s.age;ctx.save();ctx.globalAlpha*=age>surpriseDuetTicks(s)-12?(surpriseDuetTicks(s)-age)/12:1;ctx.lineCap='round';
 const def=roster.find(r=>r.id==='dragon'),form=def?.forms?.[s.evo];if(def&&form)drawActor(ctx,{...def,...form,id:'dragon',evo:s.evo,x:pose.dragonX-form.w/2,y:pose.dragonY-form.h,facing:pose.guest.facing,vx:pose.guest.vx,vy:pose.guest.vy,grounded:false,_poseOverride:pose.guest.pose,visualScale:.70,_duetActor:true},cam,t);
 // 1) Anticipación 0-24: aro que se cierra hacia Michi + chispas convergentes + texto.
 if(age<28){const k=Math.min(1,age/24),R=pose.radius*1.6*(1-k)+18;ctx.save();ctx.globalAlpha*=age<24?.35+.65*k:(28-age)/4;ctx.strokeStyle=MICHI_U_COLORS[0];ctx.lineWidth=4+4*k;ctx.beginPath();ctx.ellipse(x,y,R,R*.6,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=MICHI_U_COLORS[2];ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.ellipse(x,y,R+10,(R+10)*.6,reduce?0:age*.05,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9,d=R*1.05;ctx.fillStyle=MICHI_U_COLORS[i%3];ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d*.6,3+2*k,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle=F.glow;ctx.globalAlpha*=.5*k;ctx.beginPath();ctx.arc(x,y,14+10*k,0,Math.PI*2);ctx.fill();ctx.restore();
  uText(ctx,'¡NUEVE VIDAS!',x,y-pose.radius*.6-60-6*(1-k),20+s.evo*2,'#ffe6f5',Math.min(1,age/6));}
 // Disco de eclipse detrás de las colas (forma 5).
 if(s.evo===4&&age>=20&&age<108){const k=Math.min(1,(age-20)/12);ctx.save();ctx.globalAlpha*=.55*k;ctx.fillStyle='#ffb3dc';ctx.beginPath();ctx.arc(x,y,40*k+4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4a2f8a';ctx.beginPath();ctx.arc(x+5,y-3,36*k,0,Math.PI*2);ctx.fill();ctx.restore();}
 // 2) Nueve colas gruesas 24-104.
 if(age>=24&&age<104){const grow=Math.min(1,(age-24)/12),fade=age>96?(104-age)/8:1,r=pose.radius*(.25+.75*grow);ctx.save();ctx.globalAlpha*=fade;
  const TP=MICHI_TAIL_PAL[s.evo],hx=x-s.facing*(20+s.evo*7),hy=y+2,mid=-Math.PI/2-s.facing*.58;for(let i=0;i<9;i++){const spread=(i-4)/4,a=mid+spread*(.78+.1*grow)+(reduce?0:Math.sin(age*.04+i)*.05);drawMichiTail(ctx,hx,hy,a,r*.92,TP,age,(i*4)%9,s.facing,reduce,age>=36&&age<96);}
  ctx.restore();}
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
