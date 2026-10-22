// OHANA V463 · Metamorfosis propias en partida para Kilo, Stitcho, Chispín y Cuerno.
// Igual que Dino/Dragón y Pizza/Frita: cuatro actos (~4,5 s) con su propio mundo,
// el personaje REAL (drawCharacter, el mismo renderer de la partida) y un final
// quieto para movimiento reducido. Todo determinista (hash fijo, sin azar) y sin
// gradientes por frame: el arte se aplana con flatCtx y la escena usa capas alfa.
// t en segundos; formas en base 1 (fromForm 1..4 → toForm 2..5).
import {drawCharacter} from '../../characters/draw.js';
import {ROSTER} from '../../characters/roster.js';
import {CALIBRATED_HEIGHT} from '../../characters/visual-size.js';
import {flatCtx} from './stitcho.js';

export const FAMILY_CINE_DURATION=4.5;
export const FAMILY_CINE_PHASES=Object.freeze({llamada:[0,1.1],carga:[1.1,2.2],capullo:[2.2,3.1],revelacion:[3.1,4.5]});
export function familyCinePhase(t){
 t=Number(t)||0;
 for(const [name,[a,b]] of Object.entries(FAMILY_CINE_PHASES))if(t>=a&&t<b)return name;
 return 'revelacion';
}
const TAU=Math.PI*2;
const clamp01=k=>Math.max(0,Math.min(1,k));
const seg=(t,a,b)=>clamp01((t-a)/(b-a));
const ease=k=>{k=clamp01(k);return k*k*(3-2*k);};
const out=k=>1-(1-clamp01(k))**3;
const hash=n=>{const s=Math.sin(n*12.9898+78.233)*43758.5453;return s-Math.floor(s);};
const clampForm=f=>Math.max(1,Math.min(5,Math.round(Number(f))||1));

// ── shared drawing helpers ────────────────────────────────────────────────
function bands(ctx,w,h,cols){const n=cols.length;for(let i=0;i<n;i++){ctx.fillStyle=cols[i];ctx.fillRect(0,Math.floor(h*i/n),w,Math.ceil(h/n)+1);}}
function zig(ctx,x1,y1,x2,y2,seed,col,lw,jag=.18){
 const n=6,dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy)||1,px=-dy/d,py=dx/d;
 ctx.beginPath();ctx.moveTo(x1,y1);
 for(let i=1;i<n;i++){const k=i/n,o=(hash(seed*7.1+i)-.5)*2*d*jag;ctx.lineTo(x1+dx*k+px*o,y1+dy*k+py*o);}
 ctx.lineTo(x2,y2);ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.stroke();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=lw*.38;ctx.stroke();
}
function star(ctx,x,y,r,col,rot=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=col;ctx.beginPath();
 for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.38:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}
 ctx.closePath();ctx.fill();ctx.restore();
}
function flower(ctx,x,y,r,petal,center,rot=0,n=5){
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=petal;
 for(let i=0;i<n;i++){const a=i*TAU/n;ctx.beginPath();ctx.ellipse(Math.cos(a)*r*.55,Math.sin(a)*r*.55,r*.55,r*.32,a,0,TAU);ctx.fill();}
 ctx.fillStyle=center;ctx.beginPath();ctx.arc(0,0,r*.28,0,TAU);ctx.fill();ctx.restore();
}
function halo(ctx,x,y,r,col,a){for(let i=0;i<4;i++){ctx.globalAlpha=a*(.1+i*.07);ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r*(1-i*.2),0,TAU);ctx.fill();}ctx.globalAlpha=1;}

/** The real in-game character, flattened (no gradients), feet at (x,foot). */
function actor(ctx,id,form0,x,foot,height,t,pose,alpha,reduced,sx=1,sy=1){
 if(alpha<=0.01)return;
 const def=ROSTER.find(r=>r.id===id)||ROSTER[0],f=def.forms[form0]||def.forms[0];
 const p={...f,id:def.id,evo:form0,w:f.w,h:f.h,x:-f.w/2,y:-f.h,color:f.color,
  grounded:pose!=='jump',facing:1,vx:0,vy:pose==='jump'?-3:0,melee:pose==='attack'?6:0,invuln:0,
  visualScale:height/CALIBRATED_HEIGHT[form0],_poseOverride:pose,_introForceCanvas:true,reduceMotion:reduced,
  _powerPerformance:pose==='victory'?{index:form0===4?5:4,start:132}:null};
 ctx.save();ctx.translate(x,foot);ctx.scale(sx,sy);ctx.globalAlpha*=alpha;
 try{drawCharacter(flatCtx(ctx),p,{x:0,y:0},reduced?40:t*60,{reduceMotion:reduced});}
 catch{ctx.fillStyle=f.color||'#ffd36a';ctx.beginPath();ctx.ellipse(0,-height*.45,height*.3,height*.45,0,0,TAU);ctx.fill();}
 ctx.restore();
}

// ── themes ────────────────────────────────────────────────────────────────
const KILO={
 id:'kilo',accent:'#ffd36a',ink:'#3a0f2a',title:'#ffe7a0',
 backdrop(ctx,w,h,gy,u,t,s){
  bands(ctx,w,gy,s.fin?['#3a1240','#7a2d5a','#d4486a','#f78d4f','#ffc35a','#ffe29a']:['#24163f','#5a2a5e','#b0456c','#e8795f','#ffb873','#ffd99a']);
  const sx=w*.5,sy=gy-26*u,sr=(46+s.glow*10)*u;
  if(s.fin)for(let i=0;i<12;i++){const a=i*TAU/12+t*.25;ctx.globalAlpha=.5;ctx.fillStyle='#ffcf4a';ctx.beginPath();ctx.ellipse(sx+Math.cos(a)*sr*1.25,sy+Math.sin(a)*sr*1.25,sr*.42,sr*.16,a,0,TAU);ctx.fill();}
  ctx.globalAlpha=.95;ctx.fillStyle=s.fin?'#ffe27a':'#ffd77a';ctx.beginPath();ctx.arc(sx,sy,sr,0,TAU);ctx.fill();
  ctx.globalAlpha=1;ctx.fillStyle=s.fin?'#f78d4f':'#e8795f';for(let i=0;i<4;i++)ctx.fillRect(sx-sr,sy+sr*(.15+i*.2),sr*2,sr*(.04+i*.025));
  // sea with long sunset reflection
  ctx.fillStyle='#35597e';ctx.fillRect(0,gy-22*u,w,22*u);
  ctx.strokeStyle='#ffd99a';ctx.lineWidth=2*u;ctx.lineCap='round';
  for(let i=0;i<9;i++){const y=gy-20*u+i*2.3*u,half=(30-i*2.6)*u*(1+s.glow*.3),o=Math.sin(t*2+i)*6*u;ctx.globalAlpha=.55-i*.05;ctx.beginPath();ctx.moveTo(sx-half+o,y);ctx.lineTo(sx+half+o,y);ctx.stroke();}
  ctx.globalAlpha=1;ctx.fillStyle='#f3c98e';ctx.fillRect(0,gy,w,9999);
  ctx.fillStyle='#ffffff';ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(0,gy);for(let x=0;x<=w;x+=12*u)ctx.lineTo(x,gy+3*u+Math.sin(x*.03+t*2.4)*2.2*u);ctx.lineTo(w,gy);ctx.fill();ctx.globalAlpha=1;
  for(let i=0;i<26;i++){ctx.fillStyle=i%2?'#e2b070':'#fff0d2';ctx.fillRect(hash(i)*w,gy+(8+hash(i+3)*60)*u,2*u,2*u);}
  for(const side of [-1,1])this.palm(ctx,side<0?w*.08:w*.92,gy,u,t,side);
 },
 palm(ctx,x,gy,u,t,side){
  const sway=Math.sin(t*1.3+side)*4*u,tx=x-side*24*u+sway,ty=gy-150*u;
  ctx.strokeStyle='#2a1230';ctx.lineWidth=7*u;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,gy+4*u);ctx.quadraticCurveTo(x+side*6*u,gy-80*u,tx,ty);ctx.stroke();
  ctx.fillStyle='#2a1230';
  for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*.55+Math.sin(t*1.6+i)*.06,L=(58+hash(i+side*3)*16)*u;
   ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+Math.cos(a)*L*.6,ty+Math.sin(a)*L*.6-14*u,tx+Math.cos(a)*L,ty+Math.sin(a)*L+18*u);
   ctx.quadraticCurveTo(tx+Math.cos(a)*L*.5,ty+Math.sin(a)*L*.5,tx,ty);ctx.fill();}
  ctx.fillStyle='#4a2a26';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(tx+(i-1)*5*u,ty+6*u,4*u,0,TAU);ctx.fill();}
 },
 note(ctx,x,y,s,col){ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=1.6*s;ctx.beginPath();ctx.ellipse(x,y,4*s,3*s,-.4,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(x+3.6*s,y-1);ctx.lineTo(x+3.6*s,y-14*s);ctx.quadraticCurveTo(x+9*s,y-11*s,x+8*s,y-7*s);ctx.stroke();},
 gather(ctx,cx,cy,u,t,k){
  for(let i=0;i<16;i++){
   const life=(t*.55+hash(i))%1,a=hash(i+9)*TAU+t*.4,r=(220-life*180)*u;
   const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.55;ctx.globalAlpha=k*Math.sin(Math.PI*life);
   if(i%2)this.note(ctx,x,y,u*1.1,i%4===1?'#fff2c0':'#ffd36a');else flower(ctx,x,y,7*u,'#ff5a86','#ffe27a',t+i);
  }ctx.globalAlpha=1;
 },
 aura(ctx,cx,cy,r,u,t,k){
  ctx.lineWidth=2.2*u;
  for(let s=0;s<4;s++){ctx.strokeStyle=['#ffd36a','#ff8fb0','#8fe8d2','#fff2c0'][s];ctx.globalAlpha=k*.7;ctx.beginPath();
   for(let i=0;i<=48;i++){const a=i/48*TAU,rr=r*(.8+s*.12)+Math.sin(a*6+t*(5+s)+s)*4*u*k;i?ctx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.62):ctx.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.62);}ctx.stroke();}
  for(let i=0;i<6;i++){const a=t*1.6+i*TAU/6;ctx.globalAlpha=k;this.note(ctx,cx+Math.cos(a)*r*1.15,cy+Math.sin(a)*r*.7,u*1.2,i%2?'#fff2c0':'#ffd36a');}
  ctx.globalAlpha=1;
 },
 cocoon(ctx,cx,cy,r,u,t,close,pulse){
  // Hibiscus bud: five petals fold shut around Kilo, then breathe.
  ctx.save();ctx.translate(cx,cy);ctx.scale(1+pulse*.05,1-pulse*.03);
  halo(ctx,0,0,r*1.25,'#ffb0c8',.9);
  for(let i=0;i<5;i++){const a=-Math.PI/2+i*TAU/5+(1-close)*.5,open=(1-close);
   ctx.save();ctx.rotate(a);ctx.translate(0,-r*(.1+open*.55));
   ctx.fillStyle=i%2?'#ff4f7b':'#ff6b8e';ctx.beginPath();ctx.ellipse(0,0,r*.58,r*.95,0,0,TAU);ctx.fill();
   ctx.strokeStyle='#ffd1dc';ctx.lineWidth=2*u;ctx.stroke();
   ctx.strokeStyle='#c22c5c';ctx.globalAlpha=.6;ctx.lineWidth=1.4*u;for(let v=-1;v<=1;v++){ctx.beginPath();ctx.moveTo(0,r*.8);ctx.quadraticCurveTo(v*r*.2,0,v*r*.3,-r*.7);ctx.stroke();}
   ctx.globalAlpha=1;ctx.restore();}
  ctx.fillStyle='#ffe27a';for(let i=0;i<7;i++){const a=i*TAU/7+t;ctx.beginPath();ctx.arc(Math.cos(a)*r*.18,Math.sin(a)*r*.18-r*.1,2.4*u,0,TAU);ctx.fill();}
  ctx.restore();
 },
 burst(ctx,cx,cy,u,age,k,fin){
  for(let i=0;i<18;i++){const a=i*TAU/18+hash(i)*.3,d=(30+age*(260+hash(i+4)*120))*u;ctx.globalAlpha=k;
   flower(ctx,cx+Math.cos(a)*d,cy+Math.sin(a)*d*.7+age*age*60*u,(8+hash(i+2)*6)*u,i%3?'#ff5a86':fin?'#ffcf4a':'#ffffff','#ffe27a',age*6+i);}
  ctx.globalAlpha=1;
 },
 confetti(ctx,w,h,u,t,k){
  for(let i=0;i<26;i++){const x=hash(i+30)*w+Math.sin(t*1.8+i)*14*u,y=((t-3.1)*(60+hash(i+5)*70)*u+hash(i+12)*h*.5)%(h*.9);
   ctx.globalAlpha=k*.9;flower(ctx,x,y,(5+hash(i)*3)*u,i%4?'#fff6ec':'#ff8fb0','#ffd36a',t*2+i);}
  ctx.globalAlpha=1;
 },
};

const STITCHO={
 id:'stitcho',accent:'#62f3ff',ink:'#071428',title:'#bff8ff',
 backdrop(ctx,w,h,gy,u,t,s){
  bands(ctx,w,gy,['#04060f','#070c1f','#0b1430','#101d44','#16285a']);
  if(s.fin)for(let i=0;i<5;i++){ctx.globalAlpha=.12;ctx.fillStyle=i%2?'#f08cff':'#7a5cff';ctx.beginPath();ctx.ellipse(w*(.15+i*.18),gy*(.25+hash(i)*.3),(90+hash(i+1)*60)*u,(40+hash(i+2)*30)*u,hash(i+3)*3,0,TAU);ctx.fill();}
  ctx.globalAlpha=1;
  for(let i=0;i<60;i++){const tw=.4+.6*Math.abs(Math.sin(t*2+i*1.7));ctx.globalAlpha=tw*.8;ctx.fillStyle=i%5?'#ffffff':'#62f3ff';ctx.fillRect(hash(i)*w,hash(i+70)*gy*.9,(1+(i%3))*u*.7,(1+(i%3))*u*.7);}
  // ringed planet
  const px=w*.8,py=gy*.28,pr=34*u;ctx.globalAlpha=1;ctx.fillStyle='#2b3f8a';ctx.beginPath();ctx.arc(px,py,pr,0,TAU);ctx.fill();
  ctx.fillStyle='#3d58b0';ctx.beginPath();ctx.arc(px-pr*.25,py-pr*.2,pr*.7,0,TAU);ctx.fill();
  ctx.strokeStyle='#8fe0ff';ctx.lineWidth=3*u;ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(px,py,pr*1.7,pr*.45,-.3,0,TAU);ctx.stroke();ctx.globalAlpha=1;
  // alien jungle silhouettes
  ctx.fillStyle='#0a1a2a';for(let i=0;i<12;i++){const x=i*w/11,hh=(40+hash(i+20)*70)*u,sw=Math.sin(t+i)*3*u;ctx.beginPath();ctx.moveTo(x-18*u,gy);ctx.quadraticCurveTo(x+sw,gy-hh*1.1,x+18*u,gy);ctx.fill();
   ctx.globalAlpha=.8;ctx.fillStyle='#62f3ff';ctx.beginPath();ctx.arc(x+sw*.6,gy-hh*.9,2*u,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#0a1a2a';}
  // lab floor grid
  ctx.fillStyle='#08121f';ctx.fillRect(0,gy,w,9999);ctx.strokeStyle='#62f3ff';ctx.lineWidth=1*u;
  for(let i=0;i<7;i++){ctx.globalAlpha=.25-i*.03;const y=gy+i*i*3*u+2*u;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(let i=-8;i<=8;i++){ctx.globalAlpha=.16;ctx.beginPath();ctx.moveTo(w/2+i*30*u,gy);ctx.lineTo(w/2+i*120*u,gy+160*u);ctx.stroke();}
  ctx.globalAlpha=.05+s.glow*.05;ctx.fillStyle='#62f3ff';for(let y=0;y<gy;y+=4*u)ctx.fillRect(0,y,w,1);
  // V465: lab rig — glowing launch pad, hazard chevrons and two blinking beacons
  const cx=w/2;ctx.globalAlpha=.55;ctx.fillStyle='#16324a';ctx.beginPath();ctx.ellipse(cx,gy+6*u,110*u,16*u,0,0,TAU);ctx.fill();
  ctx.globalAlpha=.35+s.glow*.4;ctx.strokeStyle='#62f3ff';ctx.lineWidth=2*u;ctx.beginPath();ctx.ellipse(cx,gy+6*u,92*u,12*u,0,0,TAU);ctx.stroke();
  ctx.globalAlpha=.8;ctx.fillStyle='#ffcf3a';
  for(let i=-6;i<=6;i++){const x=cx+i*16*u;ctx.beginPath();ctx.moveTo(x-5*u,gy+26*u);ctx.lineTo(x,gy+20*u);ctx.lineTo(x+5*u,gy+26*u);ctx.lineTo(x,gy+23*u);ctx.closePath();ctx.fill();}
  for(const side of [-1,1]){const on=Math.floor(t*3+(side>0?1:0))%2;ctx.globalAlpha=1;ctx.fillStyle='#3a4660';ctx.fillRect(cx+side*150*u-4*u,gy-40*u,8*u,40*u);
   ctx.fillStyle=on?'#ff4a6a':'#5a1a2a';ctx.beginPath();ctx.arc(cx+side*150*u,gy-44*u,6*u,0,TAU);ctx.fill();
   if(on){ctx.globalAlpha=.22;ctx.beginPath();ctx.arc(cx+side*150*u,gy-44*u,16*u,0,TAU);ctx.fill();}}
  ctx.globalAlpha=1;
 },
 gather(ctx,cx,cy,u,t,k){
  ctx.lineWidth=2*u;
  for(let i=0;i<3;i++){const life=(t*.8+i/3)%1;ctx.globalAlpha=k*(1-life)*.6;ctx.strokeStyle='#62f3ff';ctx.beginPath();ctx.ellipse(cx,cy+40*u,life*200*u,life*60*u,0,0,TAU);ctx.stroke();}
  for(let i=0;i<10;i++){const life=(t*.7+hash(i))%1,a=hash(i+3)*TAU,r=(210-life*170)*u,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.6;
   ctx.globalAlpha=k*Math.sin(Math.PI*life);zig(ctx,x,y,x+Math.cos(a+Math.PI)*16*u,y+Math.sin(a+Math.PI)*10*u,i+Math.floor(t*8),'#62f3ff',2*u,.3);}
  ctx.globalAlpha=1;
 },
 aura(ctx,cx,cy,r,u,t,k){
  ctx.globalAlpha=.16*k;ctx.fillStyle='#62f3ff';ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r*1.4,t*3,t*3+.7);ctx.closePath();ctx.fill();
  // V465: a scanner beam sweeps Stitcho head-to-toe, with a readout grid
  const sweep=cy-r*1.1+((t*1.6)%1)*r*2.2;ctx.globalAlpha=.5*k;ctx.fillStyle='#62f3ff';ctx.fillRect(cx-r*.95,sweep-1.5*u,r*1.9,3*u);
  ctx.globalAlpha=.14*k;ctx.fillRect(cx-r*.95,sweep-10*u,r*1.9,20*u);
  ctx.globalAlpha=.35*k;ctx.strokeStyle='#62f3ff';ctx.lineWidth=1.4*u;
  for(const sx of [-1,1])for(const sy of [-1,1]){ctx.beginPath();ctx.moveTo(cx+sx*r,cy+sy*r*1.15-sy*12*u);ctx.lineTo(cx+sx*r,cy+sy*r*1.15);ctx.lineTo(cx+sx*r-sx*12*u,cy+sy*r*1.15);ctx.stroke();}
  ctx.lineWidth=1.6*u;
  for(let o=0;o<3;o++){ctx.globalAlpha=.55*k;ctx.strokeStyle=o===1?'#f08cff':'#62f3ff';ctx.beginPath();ctx.ellipse(cx,cy,r*1.15,r*.32,o*1.05+t*.3,0,TAU);ctx.stroke();
   const a=t*(2.4+o*.6)+o*2,ex=Math.cos(a)*r*1.15,ey=Math.sin(a)*r*.32,c=Math.cos(o*1.05+t*.3),s=Math.sin(o*1.05+t*.3);
   ctx.globalAlpha=k;ctx.fillStyle='#e8ffff';ctx.beginPath();ctx.arc(cx+ex*c-ey*s,cy+ex*s+ey*c,3.2*u,0,TAU);ctx.fill();}
  ctx.globalAlpha=1;
 },
 cocoon(ctx,cx,cy,r,u,t,close,pulse,popped=0){
  // Stitched experiment pod: two hull halves slide shut, pink stitches seal it.
  ctx.save();ctx.translate(cx,cy);ctx.scale(1+pulse*.04,1+pulse*.04);
  halo(ctx,0,0,r*1.2,'#62f3ff',.8);
  for(const side of [-1,1]){const off=side*(1-close)*r*1.1;ctx.save();ctx.translate(off,0);
   ctx.beginPath();ctx.ellipse(0,0,r*.72,r*1.05,0,side<0?Math.PI/2:-Math.PI/2,side<0?Math.PI*1.5:Math.PI/2);ctx.closePath();
   ctx.fillStyle=side<0?'#2a3a66':'#33467a';ctx.fill();ctx.strokeStyle='#8fa3bd';ctx.lineWidth=2.6*u;ctx.stroke();
   ctx.fillStyle='#62f3ff';ctx.globalAlpha=.55+.35*Math.sin(t*6);ctx.beginPath();ctx.ellipse(side*r*.34,-r*.2,r*.16,r*.3,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
   for(let i=0;i<3;i++){ctx.fillStyle='#c9d6e8';ctx.beginPath();ctx.arc(side*r*.5,-r*.6+i*r*.6,2*u,0,TAU);ctx.fill();}
   ctx.restore();}
  // V465: countdown on the pod, 3·2·1, then the stitches pop one by one
  if(close>.6){const n=3-Math.min(2,Math.floor(clamp01((t-2.45)/.65)*3));ctx.globalAlpha=1;ctx.fillStyle='#071428';ctx.fillRect(-11*u,r*.55,22*u,16*u);
   ctx.fillStyle=n===1?'#ff6f95':'#7dffb0';ctx.font=`bold ${Math.round(13*u)}px Outfit, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(n),0,r*.55+8.5*u);}
  if(close>.9)for(let i=0;i<6;i++){if(i<popped)continue;const y=-r*.8+i*r*.32;ctx.strokeStyle='#ff6f95';ctx.lineWidth=2.4*u;ctx.beginPath();ctx.moveTo(-6*u,y-4*u);ctx.lineTo(6*u,y+4*u);ctx.moveTo(6*u,y-4*u);ctx.lineTo(-6*u,y+4*u);ctx.stroke();}
  ctx.restore();
 },
 burst(ctx,cx,cy,u,age,k,fin){
  for(const side of [-1,1]){ctx.save();ctx.translate(cx+side*age*320*u,cy-age*120*u+age*age*260*u);ctx.rotate(side*age*5);ctx.globalAlpha=k;
   ctx.fillStyle='#2a3a66';ctx.beginPath();ctx.ellipse(0,0,26*u,40*u,0,side<0?Math.PI/2:-Math.PI/2,side<0?Math.PI*1.5:Math.PI/2);ctx.fill();ctx.strokeStyle='#8fa3bd';ctx.lineWidth=2*u;ctx.stroke();ctx.restore();}
  ctx.lineWidth=2*u;ctx.lineCap='round';
  for(let i=0;i<10;i++){const a=i*TAU/10+.2,d=(20+age*220)*u;ctx.globalAlpha=k*.9;ctx.strokeStyle='#ff6f95';ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*d*.5,cy+Math.sin(a)*d*.5);ctx.quadraticCurveTo(cx+Math.cos(a+.3)*d*.8,cy+Math.sin(a+.3)*d*.8,cx+Math.cos(a)*d,cy+Math.sin(a)*d);ctx.stroke();
   star(ctx,cx+Math.cos(a+.15)*d*1.1,cy+Math.sin(a+.15)*d*1.1,5*u,fin?'#f08cff':'#62f3ff',age*4);}
  ctx.globalAlpha=1;
 },
 confetti(ctx,w,h,u,t,k){
  for(let i=0;i<28;i++){const x=hash(i+40)*w,y=((t-3.1)*(50+hash(i+5)*80)*u+hash(i+11)*h*.4)%(h*.9);ctx.globalAlpha=k*(.5+.5*Math.sin(t*5+i));
   star(ctx,x,y,(3+hash(i)*3)*u,i%3?'#62f3ff':'#ff6f95',t*2+i);}
  ctx.globalAlpha=1;
 },
};

const CHISPIN={
 id:'chispin',accent:'#ffe45a',ink:'#121a2e',title:'#fff6a0',
 cloudBlob(ctx,x,y,s,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x-s*.8,y+s*.15,s*.6,0,TAU);ctx.arc(x+s*.85,y+s*.1,s*.65,0,TAU);ctx.arc(x,y-s*.2,s*.95,0,TAU);ctx.fill();},
 backdrop(ctx,w,h,gy,u,t,s){
  const flash=hash(Math.floor(t*5)+3)>.86?.35:0;
  bands(ctx,w,gy,s.fin?['#0c0f22','#171c3c','#232a56','#2f3870','#3b4888']:['#10182c','#18233c','#22304e','#2c3e60','#384c72']);
  if(flash){ctx.globalAlpha=flash*.5;ctx.fillStyle='#cfe0ff';ctx.fillRect(0,0,w,gy);ctx.globalAlpha=1;}
  for(let l=0;l<3;l++)for(let i=0;i<7;i++){const x=((i/6)*w*1.3+t*(8+l*6)*u)%(w*1.3)-w*.15,y=(30+l*34+hash(i+l*9)*20)*u;
   ctx.globalAlpha=.75;this.cloudBlob(ctx,x,y,(34+l*6+hash(i)*14)*u,['#2a3452','#323e60','#3c4a70'][l]);}
  ctx.globalAlpha=1;
  ctx.strokeStyle='#9fb4e0';ctx.lineWidth=1*u;
  for(let i=0;i<50;i++){const x=(hash(i)*w+t*90*u)%w,y=(hash(i+50)*gy+t*420*u)%gy;ctx.globalAlpha=.25;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4*u,y+12*u);ctx.stroke();}
  // island hill + puddles
  ctx.globalAlpha=1;ctx.fillStyle='#17302a';ctx.beginPath();ctx.moveTo(0,gy+10*u);ctx.quadraticCurveTo(w*.5,gy-30*u,w,gy+10*u);ctx.lineTo(w,9999);ctx.lineTo(0,9999);ctx.fill();
  ctx.fillStyle='#1f3d33';ctx.fillRect(0,gy+12*u,w,9999);
  for(let i=0;i<4;i++){ctx.globalAlpha=.35+flash;ctx.fillStyle='#6b84b8';ctx.beginPath();ctx.ellipse(w*(.15+i*.24),gy+(26+hash(i)*20)*u,(26+hash(i+1)*20)*u,5*u,0,0,TAU);ctx.fill();}
  ctx.globalAlpha=1;
 },
 gather(ctx,cx,cy,u,t,k){
  for(let i=0;i<9;i++){const life=(t*1.1+hash(i))%1,a=hash(i+5)*TAU,r0=(230-life*190)*u;
   const x=cx+Math.cos(a)*r0,y=cy+Math.sin(a)*r0*.6;ctx.globalAlpha=k*Math.sin(Math.PI*life);
   zig(ctx,x,y,x-Math.cos(a)*28*u,y-Math.sin(a)*18*u,i+Math.floor(t*10),'#ffe45a',2.6*u,.25);}
  ctx.globalAlpha=1;
 },
 aura(ctx,cx,cy,r,u,t,k){
  halo(ctx,cx,cy,r*1.2,'#ffe45a',k*.7);
  for(let i=0;i<8;i++){const a=i*TAU/8+t*.8,b=a+.55;ctx.globalAlpha=k;zig(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,cx+Math.cos(b)*r,cy+Math.sin(b)*r*.7,i+Math.floor(t*12),'#fff6a0',2.2*u,.35);}
  ctx.globalAlpha=1;
 },
 cocoon(ctx,cx,cy,r,u,t,close,pulse){
  // Thunder-cloud ball: puffs roll in and lightning flickers inside.
  ctx.save();ctx.translate(cx,cy);ctx.scale(1+pulse*.07,1+pulse*.05);
  halo(ctx,0,0,r*1.3,'#ffe45a',.7);
  for(let i=0;i<9;i++){const a=i*TAU/9+t*.6,d=r*(.55+(1-close)*.9);ctx.fillStyle=i%2?'#5a6694':'#6c78a8';ctx.beginPath();ctx.arc(Math.cos(a)*d*.8,Math.sin(a)*d*.7,r*.5,0,TAU);ctx.fill();}
  ctx.fillStyle='#7d89b8';ctx.beginPath();ctx.arc(0,0,r*.72*close,0,TAU);ctx.fill();
  if(close>.5)for(let i=0;i<3;i++){const a=hash(i+Math.floor(t*14))*TAU;ctx.globalAlpha=.9;zig(ctx,Math.cos(a)*r*.15,Math.sin(a)*r*.15,Math.cos(a)*r*.75,Math.sin(a)*r*.6,i+Math.floor(t*14),'#ffe45a',2.4*u,.3);}
  ctx.globalAlpha=1;ctx.restore();
 },
 burst(ctx,cx,cy,u,age,k,fin,gy){
  if(age<.3){ctx.globalAlpha=1-age/.3;zig(ctx,cx+20*u,-10,cx,cy,7,'#fff6a0',12*u*(1-age/.3)+3*u,.08);zig(ctx,cx-30*u,-10,cx-6*u,cy,11,'#ffe45a',5*u,.12);}
  // rainbow after the storm
  ctx.lineWidth=6*u;const rb=['#ff5a5a','#ffa24a','#ffe45a','#6be07a','#5ab8ff','#7a6bff','#c07bff'];
  for(let i=0;i<7;i++){ctx.globalAlpha=k*.42*clamp01(age*2);ctx.strokeStyle=rb[i];ctx.beginPath();ctx.arc(cx,gy+30*u,(190-i*7)*u*(.6+.4*out(age)),Math.PI*1.05,Math.PI*1.95);ctx.stroke();}
  for(let i=0;i<10;i++){const a=i*TAU/10,d=(30+age*240)*u;ctx.globalAlpha=k*(1-clamp01(age/1.2));this.cloudBlob(ctx,cx+Math.cos(a)*d,cy+Math.sin(a)*d*.6,(16-age*6)*u,'#6c78a8');}
  for(let i=0;i<14;i++){const a=i*TAU/14+.2,d=(20+age*300)*u;ctx.globalAlpha=k;star(ctx,cx+Math.cos(a)*d,cy+Math.sin(a)*d*.7,5*u,fin?'#ff9ce7':'#ffe45a',age*5+i);}
  ctx.globalAlpha=1;
 },
 confetti(ctx,w,h,u,t,k){
  for(let i=0;i<24;i++){const x=hash(i+60)*w+Math.sin(t*2+i)*10*u,y=((t-3.1)*(70+hash(i+5)*60)*u+hash(i+13)*h*.4)%(h*.9);ctx.globalAlpha=k;
   if(i%3)star(ctx,x,y,(4+hash(i)*2)*u,'#ffe45a',t*3+i);else zig(ctx,x,y,x+6*u,y+12*u,i,'#fff6a0',1.6*u,.4);}
  ctx.globalAlpha=1;
 },
};

const RAINBOW=['#ff6b8a','#ffa65a','#ffe36a','#7ee08a','#6ad0ff','#8a8cff','#d48cff'];
const CUERNO={
 id:'cuerno',accent:'#ffd8ff',ink:'#160a2e',title:'#fff0ff',
 backdrop(ctx,w,h,gy,u,t,s){
  bands(ctx,w,gy,['#0c0820','#150c32','#1e1244','#281a56','#332468']);
  for(let i=0;i<55;i++){ctx.globalAlpha=.4+.5*Math.abs(Math.sin(t*1.5+i));ctx.fillStyle='#ffffff';ctx.fillRect(hash(i+5)*w,hash(i+90)*gy*.85,1.4*u,1.4*u);}
  // aurora ribbons
  ctx.lineCap='round';
  for(let r=0;r<3;r++){ctx.strokeStyle=['#7ef0c0','#7ad0ff','#ff9ce7'][r];
   for(let l=0;l<3;l++){ctx.globalAlpha=(.07+s.glow*.05)*(3-l);ctx.lineWidth=(30-l*9)*u;ctx.beginPath();
    for(let i=0;i<=24;i++){const x=i/24*w,y=gy*(.22+r*.12)+Math.sin(i*.5+t*(.6+r*.2)+r*2)*22*u;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}}
  // moon → eclipse in the final form
  const mx=w*.18,my=gy*.25,mr=24*u;ctx.globalAlpha=1;
  if(s.fin){ctx.fillStyle='#ffd8ff';ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(mx,my,mr*1.35,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#0c0820';ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.fill();ctx.strokeStyle='#fff0ff';ctx.lineWidth=2.5*u;ctx.stroke();}
  else{ctx.fillStyle='#fff4d8';ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.fill();ctx.fillStyle='#1e1244';ctx.beginPath();ctx.arc(mx+mr*.45,my-mr*.2,mr*.9,0,TAU);ctx.fill();}
  // dream meadow
  ctx.fillStyle='#1c2a4a';ctx.beginPath();ctx.moveTo(0,gy+6*u);for(let i=0;i<=8;i++)ctx.lineTo(i*w/8,gy-Math.sin(i*1.4)*12*u);ctx.lineTo(w,9999);ctx.lineTo(0,9999);ctx.fill();
  ctx.fillStyle='#22345a';ctx.fillRect(0,gy+8*u,w,9999);
  for(let i=0;i<30;i++){ctx.globalAlpha=.8;flower(ctx,hash(i+3)*w,gy+(6+hash(i+7)*50)*u,2.6*u,RAINBOW[i%7],'#ffffff',i);}
  ctx.globalAlpha=1;
 },
 gather(ctx,cx,cy,u,t,k,w){
  // a stampede of rainbow stardust gallops in from both sides
  ctx.lineCap='round';
  for(let i=0;i<7;i++){const side=i%2?1:-1,life=(t*.9+i/7)%1,x=cx+side*(1-life)*(w*.6),y=cy+(i-3)*9*u+Math.abs(Math.sin(life*TAU*3))*-8*u;
   ctx.globalAlpha=k*Math.sin(Math.PI*life);ctx.strokeStyle=RAINBOW[i];ctx.lineWidth=4*u;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+side*60*u,y+4*u);ctx.stroke();
   star(ctx,x,y,6*u,'#ffffff',t*4+i);}
  ctx.globalAlpha=1;
 },
 aura(ctx,cx,cy,r,u,t,k){
  for(let i=0;i<7;i++){const a=i*TAU/7+t*.5;ctx.globalAlpha=k*.16;ctx.fillStyle=RAINBOW[i];ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r*1.7,a,a+.22);ctx.closePath();ctx.fill();}
  for(let i=0;i<12;i++){const a=t*1.2+i*TAU/12;ctx.globalAlpha=k;star(ctx,cx+Math.cos(a)*r*1.1,cy+Math.sin(a)*r*.65,3.2*u,RAINBOW[i%7],a);}
  ctx.globalAlpha=1;
 },
 cocoon(ctx,cx,cy,r,u,t,close,pulse){
  // Prism crystal grows around Cuerno and splits the light into a rainbow.
  ctx.save();ctx.translate(cx,cy);ctx.scale(1+pulse*.04,1+pulse*.04);
  ctx.lineWidth=5*u;for(let i=0;i<7;i++){ctx.globalAlpha=.35*close;ctx.strokeStyle=RAINBOW[i];ctx.beginPath();ctx.moveTo(r*.4,-r*.1);ctx.lineTo(r*3.2,-r*.6+i*r*.2);ctx.stroke();}
  const hgt=r*1.15*close+r*.2,wid=r*.75;
  const pts=[[0,-hgt],[wid,-hgt*.45],[wid,hgt*.45],[0,hgt],[-wid,hgt*.45],[-wid,-hgt*.45]];
  ctx.globalAlpha=.72;ctx.fillStyle='#d8c8ff';ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.2*u;ctx.stroke();
  ctx.globalAlpha=.5;ctx.lineWidth=1.2*u;ctx.beginPath();ctx.moveTo(0,-hgt);ctx.lineTo(0,hgt);ctx.moveTo(-wid,-hgt*.45);ctx.lineTo(wid*.3,0);ctx.lineTo(-wid,hgt*.45);ctx.stroke();
  ctx.globalAlpha=.6;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(-wid*.7,-hgt*.4);ctx.lineTo(-wid*.2,-hgt*.8);ctx.lineTo(-wid*.1,-hgt*.3);ctx.fill();
  ctx.globalAlpha=1;ctx.restore();
 },
 burst(ctx,cx,cy,u,age,k,fin){
  for(let i=0;i<16;i++){const a=i*TAU/16+hash(i)*.3,d=(20+age*(250+hash(i+1)*100))*u;ctx.save();ctx.translate(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.7+age*age*80*u);ctx.rotate(age*6+i);
   ctx.globalAlpha=k*(1-clamp01(age/1.3))*.9;ctx.fillStyle=i%2?'#d8c8ff':RAINBOW[i%7];ctx.beginPath();ctx.moveTo(0,-9*u);ctx.lineTo(5*u,6*u);ctx.lineTo(-5*u,6*u);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.lineWidth=5*u;for(let i=0;i<7;i++){ctx.globalAlpha=k*.38*clamp01(age*2);ctx.strokeStyle=RAINBOW[i];ctx.beginPath();ctx.arc(cx,cy+60*u,(170-i*6)*u*(.5+.5*out(age)),Math.PI*1.08,Math.PI*1.92);ctx.stroke();}
  if(fin){ctx.globalAlpha=k*.6;ctx.strokeStyle='#fff0ff';ctx.lineWidth=3*u;ctx.beginPath();ctx.arc(cx,cy-30*u,(60+age*40)*u,0,TAU);ctx.stroke();}
  ctx.globalAlpha=1;
 },
 confetti(ctx,w,h,u,t,k){
  for(let i=0;i<30;i++){const x=hash(i+80)*w+Math.sin(t*1.4+i)*12*u,y=((t-3.1)*(40+hash(i+5)*60)*u+hash(i+17)*h*.45)%(h*.9);ctx.globalAlpha=k*(.6+.4*Math.sin(t*4+i));star(ctx,x,y,(3+hash(i)*3)*u,RAINBOW[i%7],t+i);}
  ctx.globalAlpha=1;
 },
};

function title(ctx,w,h,u,theme,name,to,k){
 if(k<=0)return;
 ctx.save();ctx.globalAlpha=k;ctx.textAlign='center';ctx.textBaseline='alphabetic';
 const y=h*.13+(1-k)*-12*u,big=Math.round(Math.min(34*u,w*.07));
 ctx.font=`bold ${big}px Fredoka, sans-serif`;
 ctx.lineWidth=6*u;ctx.strokeStyle=theme.ink;ctx.lineJoin='round';ctx.strokeText('¡'+name+'!',w/2,y);
 ctx.fillStyle=theme.title;ctx.fillText('¡'+name+'!',w/2,y);
 ctx.font=`600 ${Math.round(14*u)}px Outfit, sans-serif`;ctx.lineWidth=3*u;
 ctx.strokeText('Forma '+to+' de 5',w/2,y+22*u);ctx.fillStyle=theme.accent;ctx.fillText('Forma '+to+' de 5',w/2,y+22*u);
 ctx.restore();
}

function makeCine(theme){
 const def=ROSTER.find(r=>r.id===theme.id);
 const names=Object.freeze(def?def.evoNames||def.forms.map(f=>f.name):[]);
 function drawEvoCine(ctx,w,h,time,fromForm=1,toForm,opts={}){
  if(!(w>0&&h>0))return 'none';
  const reduced=!!opts.reducedMotion;
  const from=clampForm(fromForm),to=clampForm(toForm??from+1),fin=to===5;
  const t=reduced?4.3:Math.max(0,Math.min(FAMILY_CINE_DURATION,Number(time)||0));
  const u=Math.min(h/300,w/480),cx=w/2,gy=h*.74,size=Math.min(h*.34,w*.4);
  const k1=seg(t,0,1.1),k2=seg(t,1.1,2.2),k3=seg(t,2.2,3.1),k4=seg(t,3.1,4.5);
  const glow=t<1.1?k1*.3:t<2.2?.3+k2*.5:t<3.1?.8+k3*.2:1-k4*.4;
  const cy=gy-size*.5;
  // Trueno Gordo lands with a heavier thud than anybody.
  const heavy=theme.id==='chispin'&&to===4?1.8:1;
  const shake=reduced?0:(t>2.2&&t<3.1?Math.sin(t*61)*2.2*u*k3:t>3.1&&t<3.4?Math.sin(t*90)*5*u*heavy*(1-seg(t,3.1,3.4)):0);
  ctx.save();
  try{
   theme.backdrop(ctx,w,h,gy,u,t,{fin,glow,to});
   ctx.translate(shake,0);
   ctx.globalAlpha=.32;ctx.fillStyle='#000000';ctx.beginPath();ctx.ellipse(cx,gy+4*u,size*.42*(1+glow*.15),size*.06,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
   if(t<1.1){                                    // 1 · llamada: el mundo responde
    theme.gather(ctx,cx,cy,u,t,ease(k1*1.6),w);
    actor(ctx,theme.id,from-1,cx,gy,size*.86,t,k1<.55?'idle':'victory',1,reduced);
   }else if(t<2.2){                              // 2 · carga: se eleva rodeado de energía
    const lift=ease(k2)*size*.2;
    theme.gather(ctx,cx,cy-lift,u,t,1-k2,w);
    halo(ctx,cx,cy-lift,size*.55*(.6+k2*.6),theme.accent,.6*k2);
    theme.aura(ctx,cx,cy-lift,size*.62,u,t,ease(k2*1.4));
    actor(ctx,theme.id,from-1,cx,gy-lift,size*.86,t,'jump',1,reduced,1-k2*.06,1+k2*.08);
    ctx.globalAlpha=.25*k2*(.6+.4*Math.sin(t*22));ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(cx,cy-lift,size*.3,size*.48,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
   }else if(t<3.1){                              // 3 · capullo: su envoltura temática se cierra y late
    const lift=size*.2,close=out(seg(t,2.2,2.6)),beat=reduced?0:Math.max(0,Math.sin(k3*Math.PI*4))**3;
    actor(ctx,theme.id,from-1,cx,gy-lift,size*.86,t,'jump',1-close,reduced);
    theme.aura(ctx,cx,cy-lift,size*.62,u,t,1-close*.5);
    theme.cocoon(ctx,cx,cy-lift,size*.42,u,t,close,beat,Math.floor(seg(t,2.7,3.1)*6));
   }else{                                         // 4 · revelación: estalla y llega la nueva forma
    const age=t-3.1,pop=reduced?1:out(seg(t,3.1,3.55)),jump=reduced?0:Math.sin(seg(t,3.1,3.75)*Math.PI)*size*.24;
    if(!reduced&&age<.22){ctx.globalAlpha=.75*(1-age/.22);ctx.fillStyle='#ffffff';ctx.fillRect(-20,0,w+40,h);ctx.globalAlpha=1;}
    halo(ctx,cx,cy-jump,size*(.55+pop*.25),theme.accent,.55*(1-k4*.5));
    theme.burst(ctx,cx,cy-jump,u,reduced?.9:age,1,fin,gy);
    const land=reduced?0:Math.max(0,Math.sin(seg(t,3.75,4.0)*Math.PI))*.12*heavy;
    actor(ctx,theme.id,to-1,cx,gy-jump,size*(.75+.25*pop),t,reduced?'idle':t<3.75?'jump':'victory',1,reduced,1+land,1-land);
    theme.confetti(ctx,w,h,u,reduced?3.9:t,reduced?1:ease(seg(t,3.2,3.6)));
   }
  }finally{ctx.restore();}
  title(ctx,w,h,u,theme,names[to-1]||'',to,reduced?1:ease(seg(t,3.3,3.75)));
  return familyCinePhase(t);
 }
 return Object.freeze({id:theme.id,EVO_CINE_DURATION:FAMILY_CINE_DURATION,EVO_CINE_PHASES:FAMILY_CINE_PHASES,
  FORM_NAMES:names,evoCinePhase:familyCinePhase,drawEvoCine,accent:theme.accent});
}

export const kiloCine=makeCine(KILO);
export const stitchoCine=makeCine(STITCHO);
export const chispinCine=makeCine(CHISPIN);
export const cuernoCine=makeCine(CUERNO);
export const FAMILY_OWN_CINE=Object.freeze({kilo:kiloCine,stitcho:stitchoCine,chispin:chispinCine,cuerno:cuernoCine});
