// PUERTO DEL HORNO — Pizza's dedicated procedural stage backdrop.
// 100% vector Canvas: zero external bitmaps.
// Identity: ITALIAN TRICOLORE harbour at dusk (tomato red, mozzarella cream,
// basil green), with a smoking volcano across the bay that foreshadows Pizza's
// VOLCANIC final form and the Chef Magmático boss. Parallax layers, far → near:
// dusk sky + moon, "HORNO ESTELAR" constellation, the volcano with lava glow and
// smoke, the bay with sailboats and shimmer, pastel harbour houses with green
// shutters and tricolore laundry, festoon lights, brick wood-fired oven arches
// with live fire, basil pots and tomato crates, floating embers and flour.
// Rules: gradients are built once per context via cachedGradient (never per
// frame), every "random" value is a deterministic hash of an index, and with
// reduced motion every moving element freezes.
import {cachedGradient} from '../systems/canvas-gradient-cache.js';
const TAU=Math.PI*2;
const wrap=(v,lim)=>((v%lim)+lim)%lim;
const hash=i=>{const s=Math.sin(i*12.9898+78.233)*43758.5453;return s-Math.floor(s);};

export const PIZZA_PORT_PALETTE=Object.freeze({
 skyTop:'#bca8c6',skyMid:'#dbb5bd',skyLow:'#f5d3aa',moon:'#fff4dc',star:'#ffe9c4',
 volcano:'#3a2234',lava:'#ff6a1a',lavaHot:'#ffd23a',smoke:'#cdb8c4',
 sea:'#749da7',seaHi:'#f3d1aa',sail:'#fff4dc',
 houses:['#e8a86a','#f2d49a','#d9785a','#f4e6c8','#c9604a'],shutter:'#3f8a3a',window:'#ffd98a',roof:'#a4462e',
 brick:'#8e3a26',brick2:'#6a2a1c',mortar:'#c98a62',mouth:'#1c0a08',fire:'#ff8a2a',fire2:'#ffd24a',
 basil:'#3f9a3a',tomato:'#e0452c',cream:'#fff4dc',wood:'#8a5a30',flour:'#fff8ec'
});
const P=PIZZA_PORT_PALETTE;

function _volcano(ctx,x,base,w,h,t,reduced){
 ctx.fillStyle=P.volcano;
 ctx.beginPath();ctx.moveTo(x-w*.6,base);ctx.quadraticCurveTo(x-w*.22,base-h*.55,x-w*.1,base-h);
 ctx.lineTo(x+w*.08,base-h);ctx.quadraticCurveTo(x+w*.24,base-h*.5,x+w*.62,base);ctx.closePath();ctx.fill();
 // lava rivulets
 ctx.strokeStyle=P.lava;ctx.lineWidth=3;ctx.lineCap='round';
 for(let k=0;k<3;k++){const sx=x-w*.06+k*w*.07;ctx.beginPath();ctx.moveTo(sx,base-h+2);
  ctx.quadraticCurveTo(sx+(k-1)*w*.12,base-h*.6,sx+(k-1)*w*.2,base-h*.35+k*6);ctx.stroke();}
 const glow=reduced?.5:.45+.2*Math.sin(t*.05);
 ctx.globalAlpha=glow;ctx.fillStyle=P.lavaHot;ctx.beginPath();ctx.ellipse(x,base-h,w*.12,8,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
 for(let i=0;i<6;i++){const life=reduced?i/6:wrap(t*.0025+i/6,1);
  ctx.globalAlpha=(1-life)*.5;ctx.fillStyle=P.smoke;
  ctx.beginPath();ctx.arc(x+life*w*.35+Math.sin(life*6+i)*10,base-h-life*h*.9,10+life*34,0,TAU);ctx.fill();}
 ctx.globalAlpha=1;
}

function _house(ctx,x,base,w,h,i,lit){
 ctx.fillStyle=P.houses[i%P.houses.length];ctx.fillRect(x,base-h,w,h);
 ctx.fillStyle=P.roof;ctx.fillRect(x-3,base-h-6,w+6,7);
 const cols=Math.max(1,Math.floor(w/22)),rows=Math.max(1,Math.floor(h/30));
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const wx=x+8+c*(w-16)/Math.max(1,cols-1||1)-(cols===1?-(w-16)/2+6:0),wy=base-h+12+r*28;
  ctx.fillStyle=hash(i*31+r*7+c)<lit?P.window:'#3a2a3a';ctx.fillRect(wx-5,wy,10,14);
  ctx.fillStyle=P.shutter;ctx.fillRect(wx-10,wy,4,14);ctx.fillRect(wx+6,wy,4,14);
 }
}

function _ovenArch(ctx,x,base,r,t,reduced){
 ctx.fillStyle=P.brick;ctx.beginPath();ctx.arc(x,base,r,Math.PI,0);ctx.closePath();ctx.fill();
 ctx.strokeStyle=P.mortar;ctx.lineWidth=1.5;
 for(const k of [.55,.8]){ctx.beginPath();ctx.arc(x,base,r*k,Math.PI*1.05,Math.PI*1.95);ctx.stroke();}
 for(let a=0;a<9;a++){const ang=Math.PI+a*Math.PI/8;ctx.beginPath();ctx.moveTo(x+Math.cos(ang)*r*.8,base+Math.sin(ang)*r*.8);ctx.lineTo(x+Math.cos(ang)*r,base+Math.sin(ang)*r);ctx.stroke();}
 ctx.fillStyle=P.mouth;ctx.beginPath();ctx.arc(x,base,r*.42,Math.PI,0);ctx.closePath();ctx.fill();
 const f=reduced?.85:.75+.25*Math.sin(t*.3+x*.01);
 for(let k=-2;k<=2;k++){ctx.fillStyle=k%2?P.fire:P.fire2;ctx.globalAlpha=f;
  ctx.beginPath();ctx.moveTo(x+k*r*.12-r*.09,base);ctx.lineTo(x+k*r*.12,base-r*(.18+(2-Math.abs(k))*.06)*f);ctx.lineTo(x+k*r*.12+r*.09,base);ctx.fill();}
 ctx.globalAlpha=.18*f;ctx.fillStyle=P.fire2;ctx.beginPath();ctx.arc(x,base,r*.7,Math.PI,0);ctx.fill();ctx.globalAlpha=1;
}

export function drawPizzaOvensBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w=viewportW||1100,h=viewportH||700,cx=(cam&&cam.x)||0,R=!!reduceMotion,T=R?0:(Number.isFinite(t)?t:0);
 ctx.save();
 // 0 · dusk sky (cached)
 ctx.fillStyle=cachedGradient(ctx,`pizza-port-sky:${h}`,()=>{const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,P.skyTop);g.addColorStop(.5,P.skyMid);g.addColorStop(.78,P.skyLow);g.addColorStop(1,P.skyLow);return g;});
 ctx.fillRect(0,0,w,h);
 // 1 · stars + HORNO ESTELAR constellation + moon
 for(let i=0;i<60;i++){const x=wrap(hash(i)*w*1.4-cx*.01,w),y=hash(i+90)*h*.42;
  ctx.globalAlpha=.35+.5*(R?.5:.5+.5*Math.sin(T*.04+i));ctx.fillStyle=P.star;ctx.fillRect(x,y,1.6,1.6);}
 ctx.globalAlpha=1;
 const mx=wrap(w*.18-cx*.008,w*1.2);ctx.fillStyle=P.moon;ctx.beginPath();ctx.arc(mx,h*.14,24,0,TAU);ctx.fill();
 ctx.fillStyle=P.skyTop;ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(mx+8,h*.13,6,0,TAU);ctx.arc(mx-7,h*.16,4,0,TAU);ctx.fill();ctx.globalAlpha=1;
 const cxs=wrap(w*.62-cx*.012,w*1.3),pts=[[0,0],[34,-18],[70,-6],[52,26],[14,22]];
 ctx.strokeStyle='rgba(255,233,196,0.45)';ctx.lineWidth=1;ctx.beginPath();
 pts.forEach(([a,b],i)=>i?ctx.lineTo(cxs+a,h*.12+b):ctx.moveTo(cxs+a,h*.12+b));ctx.closePath();ctx.stroke();
 ctx.fillStyle=P.star;for(const [a,b] of pts){ctx.beginPath();ctx.arc(cxs+a,h*.12+b,2.4,0,TAU);ctx.fill();}
 // 2 · volcano across the bay
 const horizon=h*.6;
 _volcano(ctx,wrap(w*.7-cx*.03,w*1.6)-w*.2,horizon,w*.44,h*.24,T,R);
 // 3 · the bay
 ctx.fillStyle=P.sea;ctx.fillRect(0,horizon,w,h-horizon);
 ctx.fillStyle=P.seaHi;for(let i=0;i<26;i++){const y=horizon+6+hash(i+300)*(h*.16),x=wrap(hash(i+200)*w-cx*.06+(R?0:Math.sin(T*.03+i)*6),w);
  ctx.globalAlpha=.25+.25*hash(i+7);ctx.fillRect(x,y,14+hash(i)*26,2);}
 ctx.globalAlpha=1;
 for(let b=0;b<3;b++){const bx=wrap(b*w*.45+w*.2-cx*.08+(R?0:T*.15*(b+1)),w*1.3)-w*.1,by=horizon+18+b*12+(R?0:Math.sin(T*.05+b)*2);
  ctx.fillStyle=P.cream;ctx.beginPath();ctx.moveTo(bx-16,by);ctx.lineTo(bx+16,by);ctx.lineTo(bx+11,by+6);ctx.lineTo(bx-11,by+6);ctx.closePath();ctx.fill();
  ctx.fillStyle=b===1?P.tomato:P.sail;ctx.beginPath();ctx.moveTo(bx,by-26);ctx.lineTo(bx+14,by-2);ctx.lineTo(bx,by-2);ctx.closePath();ctx.fill();}
 // 4 · pastel harbour houses with shutters & tricolore laundry
 const hb=h*.74,span=w+240,off=wrap(-cx*.18,span);
 // The town stands on a stone quay; water ends at its retaining wall.
 ctx.fillStyle='#5f4858';ctx.fillRect(0,hb-7,w,h-hb+7);
 ctx.fillStyle='#d8b99a';ctx.fillRect(0,hb-7,w,9);
 ctx.strokeStyle='#846779';ctx.lineWidth=2;
 for(let row=0;row<4;row++)for(let col=-1;col<w/80+1;col++){
  const bx=col*80+(row%2)*40;ctx.strokeRect(bx,hb+6+row*22,80,22);
 }
 ctx.fillStyle='#f9dbac';ctx.fillRect(0,hb-11,w,4);
 for(let i=0;i<9;i++){const x=wrap(i*130+off,span)-120,hh=90+hash(i+40)*80,ww=84+hash(i+50)*40;
  _house(ctx,x,hb,ww,hh,i,.55);
  if(i%2===0){ctx.strokeStyle='#5a4040';ctx.lineWidth=1;const ly=hb-hh*.55;ctx.beginPath();ctx.moveTo(x+ww,ly);ctx.quadraticCurveTo(x+ww+23,ly+10,x+ww+46,ly);ctx.stroke();
   ['#3f9a3a','#fff4dc','#e0452c'].forEach((col,k)=>{ctx.fillStyle=col;ctx.fillRect(x+ww+8+k*12,ly+3+(k===1?2:0)+(R?0:Math.sin(T*.08+k+i)*1.2),9,12);});}
 }
 // 5 · festoon lights
 const lspan=w+300,loff=wrap(-cx*.3,lspan);
 for(let s=0;s<4;s++){const x0=wrap(s*300+loff,lspan)-150,y0=h*.5;
  ctx.strokeStyle='rgba(40,24,24,0.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x0+150,y0+46,x0+300,y0);ctx.stroke();
  for(let k=1;k<10;k++){const q=k/10,x=x0+q*300,y=y0+2*46*q*(1-q);
   ctx.globalAlpha=R?.9:.6+.4*Math.sin(T*.07+k*1.7+s);ctx.fillStyle=[P.tomato,P.cream,P.basil][k%3];ctx.beginPath();ctx.arc(x,y+4,3.4,0,TAU);ctx.fill();}
  ctx.globalAlpha=1;}
 // 6 · brick oven arches with live fire, basil pots, tomato crates
 const ab=h*.96,aspan=w+360,aoff=wrap(-cx*.45,aspan);
 ctx.fillStyle=P.brick2;ctx.fillRect(0,ab,w,h-ab);
 for(let i=0;i<4;i++){const x=wrap(i*360+aoff,aspan)-180;
  _ovenArch(ctx,x,ab,80,T,R);
  ctx.fillStyle='#b8643a';ctx.fillRect(x+96,ab-16,18,16);
  for(let k=-1;k<=1;k++){ctx.fillStyle=P.basil;ctx.beginPath();ctx.ellipse(x+105+k*5,ab-22+(R?0:Math.sin(T*.04+k+i)*.8),4.5,7,k*.5,0,TAU);ctx.fill();}
  ctx.fillStyle=P.wood;ctx.fillRect(x-130,ab-20,40,20);
  for(let k=0;k<4;k++){ctx.fillStyle=P.tomato;ctx.beginPath();ctx.arc(x-124+k*9.5,ab-22,5,0,TAU);ctx.fill();}
 }
 // 7 · embers + flour
 if(!R){for(let i=0;i<34;i++){const life=wrap(T*.004+hash(i),1),x=wrap(hash(i+500)*w+Math.sin(life*8+i)*20-cx*.5,w),y=h-life*h*.7;
  ctx.globalAlpha=(1-life)*.8;ctx.fillStyle=i%3?P.fire2:P.flour;ctx.fillRect(x,y,i%3?2.2:3,i%3?2.2:3);}
  ctx.globalAlpha=1;}
 ctx.restore();
}
