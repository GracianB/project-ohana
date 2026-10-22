// MERCADO CENTELLA — Frita's dedicated procedural stage backdrop.
// 100% vector Canvas: zero external image assets.
// Identity: a NAVY night-time harbour diner market (navy, ketchup red, fry gold,
// electric cyan), deliberately apart from Pizza's warm tricolore dusk. Parallax
// layers, far → near: navy night sky with stars and the "BANQUETE DORADO"
// constellation, a neon skyline, a giant fry-carton billboard with a blinking
// "F", the chrome diner with a checkerboard band and lit booths, market stalls
// with ketchup-and-white awnings, boardwalk lamps, ketchup & mustard bottles,
// and electric salt sparkles crackling in the air.
// Rules: gradients are built once per context via cachedGradient (never per
// frame), every "random" value is a deterministic hash of an index, and with
// reduced motion every moving element freezes.
import {cachedGradient} from '../systems/canvas-gradient-cache.js';
const TAU=Math.PI*2;
const wrap=(v,lim)=>((v%lim)+lim)%lim;
const hash=i=>{const s=Math.sin(i*12.9898+78.233)*43758.5453;return s-Math.floor(s);};

export const FRITA_MARKET_PALETTE=Object.freeze({
 skyTop:'#070c24',skyMid:'#142a6a',skyLow:'#2f4fa8',star:'#dff4ff',
 skyline:'#0d1a44',skylineWin:'#5fd0ff',neon:'#5fd0ff',neonPink:'#ff5a7a',
 carton:'#d8231c',fry:'#ffcf3a',fry2:'#e8a51a',chrome:'#c8d6e8',diner:'#1f3a8a',diner2:'#14245a',
 booth:'#ffd98a',check1:'#f4ece0',check2:'#d8231c',awning1:'#d8231c',awning2:'#f4ece0',
 boardwalk:'#3a2a3a',lamp:'#fff2b8',mustard:'#ffcc1a',spark:'#9ff0ff'
});
const P=FRITA_MARKET_PALETTE;

function _carton(ctx,x,base,s,t,R){
 ctx.fillStyle=P.fry2;for(let k=-3;k<=3;k++)ctx.fillRect(x+k*s*.13-s*.05,base-s*1.15-Math.abs(((k*7)%3))*s*.08,s*.1,s*.6);
 ctx.fillStyle=P.fry;for(let k=-3;k<=3;k++)ctx.fillRect(x+k*s*.13-s*.035,base-s*1.13-Math.abs(((k*7)%3))*s*.08,s*.05,s*.55);
 ctx.fillStyle=P.carton;ctx.beginPath();ctx.moveTo(x-s*.5,base-s*.72);ctx.lineTo(x+s*.5,base-s*.72);ctx.lineTo(x+s*.38,base);ctx.lineTo(x-s*.38,base);ctx.closePath();ctx.fill();
 ctx.fillStyle=P.check1;for(let k=0;k<3;k++)ctx.fillRect(x-s*.3+k*s*.24,base-s*.68,s*.1,s*.64);
 const on=R||Math.sin(t*.09)>-.7;
 ctx.globalAlpha=on?1:.3;ctx.strokeStyle=P.neon;ctx.lineWidth=Math.max(2,s*.05);ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(x-s*.08,base-s*.18);ctx.lineTo(x-s*.06,base-s*.52);ctx.lineTo(x+s*.14,base-s*.52);ctx.moveTo(x-s*.07,base-s*.36);ctx.lineTo(x+s*.08,base-s*.36);ctx.stroke();
 ctx.globalAlpha=1;
}

function _stall(ctx,x,base,w,i){
 ctx.fillStyle=P.diner2;ctx.fillRect(x-w/2,base-46,w,46);
 ctx.fillStyle=P.booth;ctx.fillRect(x-w/2+8,base-38,w-16,14);
 for(let k=0;k<7;k++){ctx.fillStyle=k%2?P.awning2:P.awning1;const sx=x-w/2-6+k*(w+12)/7,sw=(w+12)/7;
  ctx.beginPath();ctx.moveTo(sx,base-66);ctx.lineTo(sx+sw,base-66);ctx.lineTo(sx+sw,base-52);ctx.quadraticCurveTo(sx+sw/2,base-46,sx,base-52);ctx.closePath();ctx.fill();}
 ctx.strokeStyle=P.chrome;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-w/2,base-52);ctx.lineTo(x-w/2,base);ctx.moveTo(x+w/2,base-52);ctx.lineTo(x+w/2,base);ctx.stroke();
 // bottles on the counter
 ctx.fillStyle=i%2?P.mustard:P.carton;ctx.fillRect(x-w*.2,base-58+30,8,14);ctx.fillRect(x-w*.2+2,base-62+30,4,5);
 ctx.fillStyle=i%2?P.carton:P.mustard;ctx.fillRect(x+w*.15,base-58+30,8,14);ctx.fillRect(x+w*.15+2,base-62+30,4,5);
}

export function drawFritaMarketBackdrop(ctx,cam,t,viewportW,viewportH,reduceMotion=false){
 const w=viewportW||1100,h=viewportH||700,cx=(cam&&cam.x)||0,R=!!reduceMotion,T=R?0:(Number.isFinite(t)?t:0);
 ctx.save();
 // 0 · navy night sky (cached)
 ctx.fillStyle=cachedGradient(ctx,`frita-market-sky:${h}`,()=>{const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,P.skyTop);g.addColorStop(.55,P.skyMid);g.addColorStop(1,P.skyLow);return g;});
 ctx.fillRect(0,0,w,h);
 // 1 · stars + BANQUETE DORADO constellation (a fry-carton shape)
 for(let i=0;i<70;i++){const x=wrap(hash(i+11)*w*1.4-cx*.01,w),y=hash(i+77)*h*.45;
  ctx.globalAlpha=.3+.6*(R?.5:.5+.5*Math.sin(T*.05+i*1.3));ctx.fillStyle=P.star;ctx.fillRect(x,y,1.5,1.5);}
 ctx.globalAlpha=1;
 const kx=wrap(w*.3-cx*.012,w*1.3),ky=h*.12,pts=[[0,0],[60,0],[50,40],[10,40]];
 ctx.strokeStyle='rgba(255,207,58,0.5)';ctx.lineWidth=1;ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(kx+a,ky+b):ctx.moveTo(kx+a,ky+b));ctx.closePath();
 for(let k=0;k<3;k++){ctx.moveTo(kx+15+k*15,ky);ctx.lineTo(kx+12+k*16,ky-20-(k%2)*8);}ctx.stroke();
 ctx.fillStyle=P.fry;for(const [a,b] of pts){ctx.beginPath();ctx.arc(kx+a,ky+b,2.4,0,TAU);ctx.fill();}
 // 2 · neon skyline
 const sb=h*.62,sspan=w+200,soff=wrap(-cx*.06,sspan);
 for(let i=0;i<14;i++){const x=wrap(i*90+soff,sspan)-100,bw=56+hash(i+5)*40,bh=70+hash(i+9)*120;
  ctx.fillStyle=P.skyline;ctx.fillRect(x,sb-bh,bw,bh);
  for(let r=0;r<Math.floor(bh/18);r++)for(let c=0;c<3;c++){if(hash(i*41+r*5+c)<.42){ctx.fillStyle=(i+r)%5?P.skylineWin:P.neonPink;ctx.globalAlpha=.55;ctx.fillRect(x+8+c*(bw-20)/2,sb-bh+8+r*18,6,8);}}
  ctx.globalAlpha=1;}
 // 3 · giant fry-carton billboard on a pole
 const bspan=w*1.6,bx=wrap(w*.72-cx*.12,bspan)-w*.2;
 ctx.fillStyle=P.chrome;ctx.fillRect(bx-4,sb-60,8,60);
 ctx.globalAlpha=.18;ctx.fillStyle=P.neon;ctx.beginPath();ctx.arc(bx,sb-130,90,0,TAU);ctx.fill();ctx.globalAlpha=1;
 _carton(ctx,bx,sb-60,120,T,R);
 // 4 · chrome diner with checkerboard band and lit booths
 const db=h*.8,dspan=w+520,doff=wrap(-cx*.22,dspan);
 for(let i=0;i<2;i++){const x=wrap(i*520+doff,dspan)-260,dw=340;
  ctx.fillStyle=P.diner;ctx.beginPath();ctx.moveTo(x,db);ctx.lineTo(x,db-96);ctx.quadraticCurveTo(x,db-120,x+24,db-120);ctx.lineTo(x+dw-24,db-120);ctx.quadraticCurveTo(x+dw,db-120,x+dw,db-96);ctx.lineTo(x+dw,db);ctx.closePath();ctx.fill();
  ctx.fillStyle=P.chrome;ctx.fillRect(x,db-94,dw,4);ctx.fillRect(x,db-30,dw,4);
  for(let k=0;k<6;k++){ctx.fillStyle=P.booth;ctx.fillRect(x+16+k*54,db-84,42,40);ctx.fillStyle=P.diner2;ctx.fillRect(x+16+k*54,db-62,42,4);}
  for(let k=0;k<dw/10;k++){ctx.fillStyle=k%2?P.check1:P.check2;ctx.fillRect(x+k*10,db-26,10,8);ctx.fillStyle=k%2?P.check2:P.check1;ctx.fillRect(x+k*10,db-18,10,8);}
  const on=R||Math.sin(T*.06+i)>-.85;ctx.globalAlpha=on?1:.35;ctx.fillStyle=P.neonPink;ctx.font='700 22px Outfit,sans-serif';ctx.textAlign='center';ctx.fillText('DINER',x+dw/2,db-128);ctx.globalAlpha=1;}
 // 5 · market stalls with ketchup awnings
 const mb=h*.92,mspan=w+300,moff=wrap(-cx*.38,mspan);
 for(let i=0;i<5;i++)_stall(ctx,wrap(i*260+moff,mspan)-150,mb,150,i);
 // 6 · boardwalk + lamps
 ctx.fillStyle=P.boardwalk;ctx.fillRect(0,mb,w,h-mb);
 ctx.fillStyle='rgba(255,242,184,0.12)';for(let k=0;k<w/40;k++)ctx.fillRect(wrap(k*40-cx*.5,w+40)-20,mb+2,2,h-mb);
 const lspan=w+240,loff=wrap(-cx*.5,lspan);
 for(let i=0;i<5;i++){const x=wrap(i*240+loff,lspan)-120;ctx.fillStyle=P.chrome;ctx.fillRect(x-2,mb-110,4,110);
  ctx.globalAlpha=.22;ctx.fillStyle=P.lamp;ctx.beginPath();ctx.arc(x,mb-112,26,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=P.lamp;ctx.beginPath();ctx.arc(x,mb-112,7,0,TAU);ctx.fill();}
 // 7 · electric salt sparkles
 if(!R){ctx.strokeStyle=P.spark;ctx.lineWidth=1.4;
  for(let i=0;i<26;i++){const life=wrap(T*.006+hash(i+900),1),x=wrap(hash(i+600)*w-cx*.6+Math.sin(life*7+i)*16,w),y=h*.95-life*h*.6;
   ctx.globalAlpha=(1-life)*.85;if(i%3===0){ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x,y-3);ctx.lineTo(x-1,y+2);ctx.lineTo(x+4,y-1);ctx.stroke();}else{ctx.fillStyle=P.check1;ctx.fillRect(x,y,2,2);}}
  ctx.globalAlpha=1;}
 ctx.restore();
}
