import {SANCTUARY_PALETTE as P,nearestSanctuaryPassage,passageReady,sanctuaryZone,sanctuaryGuardianDefeated} from '../systems/michi-sanctuary.js';
const TAU=Math.PI*2;
const oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const stroke=(c,col,w,fn)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();};
export function drawSanctuaryLantern(c,x,y,lit=false,t=0,small=false){
 const k=small?.6:1;c.save();c.translate(x,y);c.scale(k,k);stroke(c,P.stone,4,()=>{c.moveTo(0,-42);c.lineTo(0,-28);});const glass=c.createLinearGradient(-19,-27,19,15);glass.addColorStop(0,'#2c4855');glass.addColorStop(.18,lit?'#d4b77d':'#7a8e8e');glass.addColorStop(.52,lit?'#fff1bc':'#294a5a');glass.addColorStop(.82,lit?'#cfa775':'#697b78');glass.addColorStop(1,'#213e4e');c.fillStyle=glass;c.strokeStyle='#8d907c';c.lineWidth=3;c.beginPath();c.moveTo(-19,-27);c.quadraticCurveTo(0,-36,19,-27);c.lineTo(16,15);c.quadraticCurveTo(0,24,-16,15);c.closePath();c.fill();c.stroke();stroke(c,lit?P.coral:'#688c90',2,()=>{c.moveTo(-12,-25);c.lineTo(-10,13);c.moveTo(12,-25);c.lineTo(10,13);});oval(c,0,-4,lit?5:3,lit?9:5,lit?P.teal:'#46646c');if(lit){c.globalAlpha=.15;oval(c,0,-4,35,42,P.ivory);}c.restore();
}
// Painted scenery is cached independently from the simulation. Four bounded
// canvases retain the active room and its cinematic/mobile variants.
const muralImages=new Map(),muralPromises=new Map();
const muralKey=id=>id==='crypt'?'crypt':['gallery','arena'].includes(id)?'glass':'night';
const muralFor=id=>muralImages.get(muralKey(id));
export function preloadMichiScenery(zone='court'){
 const key=muralKey(zone);if(muralPromises.has(key))return muralPromises.get(key);
 if(typeof Image==='undefined')return Promise.resolve(false);
 const image=new Image();image.decoding='async';muralImages.set(key,image);
 const pending=new Promise(resolve=>{image.onload=()=>resolve(true);image.onerror=()=>resolve(false);});muralPromises.set(key,pending);
 image.src=new URL('../assets/michi/sanctuary-'+key+'.webp',import.meta.url).href;return pending;
}
const sceneryCache=new Map();
export const MICHI_SCENERY_VERSION=650;
export const MICHI_SCENERY_CACHE_LIMIT=4;
const THEMES={
 court:{top:'#102b46',bottom:'#548b89',ink:'#183c50',stone:'#5e7e80',leaf:'#78b5a7',light:'#f3dca8'},
 crypt:{top:'#080f25',bottom:'#263b55',ink:'#101c35',stone:'#39465e',leaf:'#58aeb0',light:'#abcce3'},
 gallery:{top:'#241f43',bottom:'#786684',ink:'#302c4d',stone:'#756982',leaf:'#a5bdbe',light:'#f3d0a4'},
 maze:{top:'#172c44',bottom:'#527675',ink:'#213c49',stone:'#627c76',leaf:'#96bda1',light:'#efcf91'},
 canopy:{top:'#172d50',bottom:'#669fa6',ink:'#254d62',stone:'#6f9b9a',leaf:'#a4d3af',light:'#f7dcb3'},
 arena:{top:'#191b36',bottom:'#565b78',ink:'#2b304d',stone:'#6a7488',leaf:'#a2b9b2',light:'#f2c9a0'},
 return:{top:'#344e6b',bottom:'#c0a59c',ink:'#3d5867',stone:'#879b9d',leaf:'#bacdb2',light:'#ffe0ab'}
};
const noise=i=>{const v=Math.sin(i*127.13+17.7)*43758.5453;return v-Math.floor(v);};
function leaf(c,x,y,s,col,a=0){c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(-s,0);c.quadraticCurveTo(-s*.2,-s*.7,s,0);c.quadraticCurveTo(s*.2,s*.6,-s,0);c.fill();stroke(c,'#e4eed02b',Math.max(.6,s*.045),()=>{c.moveTo(-s*.72,0);c.quadraticCurveTo(0,-s*.07,s*.75,0);});c.restore();}
function arch(c,x,y,w,h,col,weight=8){stroke(c,col,weight,()=>{c.moveTo(x-w/2,y);c.lineTo(x-w/2,y-h*.58);c.bezierCurveTo(x-w/2,y-h*1.13,x+w/2,y-h*1.13,x+w/2,y-h*.58);c.lineTo(x+w/2,y);});}
function branchTree(c,x,y,s,col,foliage,seed=0){
 c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;c.beginPath();c.moveTo(-32,40);c.bezierCurveTo(8,-70,-37,-140,-9,-270);c.lineTo(5,-271);c.bezierCurveTo(-9,-165,33,-79,38,40);c.fill();
 for(let j=0;j<5;j++){const side=j%2?1:-1,yy=-92-j*38,reach=75+noise(seed+j)*65;stroke(c,col,Math.max(2,9-j),()=>{c.moveTo(0,yy+35);c.bezierCurveTo(side*36,yy+20,side*(reach-30),yy-50,side*reach,yy-39);});for(let k=0;k<4;k++)leaf(c,side*(reach-48+k*19),yy-36+k%2*10,17+noise(j+k+seed)*10,foliage,side*-.4);}
 stroke(c,foliage,1,()=>{c.moveTo(4,-218);c.bezierCurveTo(-14,-135,15,-50,6,10);});c.restore();
}
function pavilion(c,x,y,s,q){
 c.save();c.translate(x,y);c.scale(s,s);
 // A little abandoned conservatory, with copper roof, glass and hanging vines.
 c.fillStyle=q.ink;c.fillRect(-86,-167,172,167);for(const side of[-1,1]){c.fillStyle=q.stone;c.fillRect(side*76-7,-177,14,177);c.fillRect(side*76-13,-12,26,12);}
 for(let i=0;i<3;i++){const xx=(i-1)*46;arch(c,xx,-18,37,123,q.stone,3);c.fillStyle='#9bc6be33';c.fillRect(xx-15,-106,30,84);stroke(c,q.light,1,()=>{c.moveTo(xx,-132);c.lineTo(xx,-20);c.moveTo(xx-14,-75);c.lineTo(xx+14,-75);});}
 c.fillStyle='#3d666f';c.beginPath();c.moveTo(-121,-164);c.quadraticCurveTo(-37,-187,0,-232);c.quadraticCurveTo(38,-187,121,-164);c.quadraticCurveTo(38,-147,0,-160);c.quadraticCurveTo(-40,-148,-121,-164);c.fill();stroke(c,'#c1b594',3,()=>{c.moveTo(-118,-163);c.quadraticCurveTo(0,-145,118,-163);c.moveTo(0,-229);c.lineTo(0,-161);});
 for(const side of[-1,1]){stroke(c,'#789c8d',2,()=>{c.moveTo(side*80,-160);c.bezierCurveTo(side*118,-108,side*50,-88,side*84,-37);});for(let j=0;j<6;j++)leaf(c,side*(77+(j%2)*12),-148+j*18,12,q.leaf,side*.6);}
 c.fillStyle='#75928b';c.fillRect(-105,0,210,10);c.fillStyle=q.ink;c.beginPath();c.moveTo(-100,10);c.lineTo(-60,43);c.lineTo(48,34);c.lineTo(100,10);c.fill();c.restore();
}
function blossom(c,x,y,r,col){for(let i=0;i<5;i++){const a=i*TAU/5;oval(c,x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5,r*.45,r*.33,col);}oval(c,x,y,r*.2,r*.2,'#f8ddb0');}
function gardenDetail(c,W,H,id,q){
 const y=H*.64;
 if(id==='court'||id==='maze'){
  pavilion(c,W*.78,y,Math.min(1.2,H/760),q);
  // A stepped fountain and stream, safely in the distant garden plane.
  const x=W*.39;for(let k=0;k<3;k++){oval(c,x,y-12-k*29,70-k*18,9,q.stone);stroke(c,'#99cfcd',2,()=>{c.moveTo(x-51+k*15,y-9-k*29);c.quadraticCurveTo(x-55+k*18,y+5-k*29,x-35+k*12,y+16-k*29);c.moveTo(x+51-k*15,y-9-k*29);c.quadraticCurveTo(x+55-k*18,y+5-k*29,x+35-k*12,y+16-k*29);});}stroke(c,'#b7deda',2,()=>{c.moveTo(x,y-65);c.quadraticCurveTo(x-24,y-137,x-42,y-73);c.moveTo(x,y-65);c.quadraticCurveTo(x+24,y-137,x+42,y-73);});
 }
 if(id==='crypt'){
  for(let i=0;i<4;i++){const x=W*(.13+i*.25);c.fillStyle='#0b172b';c.beginPath();c.ellipse(x,y-73,84,122,0,Math.PI,0);c.lineTo(x+84,y+20);c.lineTo(x-84,y+20);c.fill();arch(c,x,y+20,175,217,'#3b5667',12);for(let j=0;j<7;j++){const xx=x-60+j*20,yy=y+noise(j+i)*20;stroke(c,'#589495',2,()=>{c.moveTo(xx,yy);c.lineTo(xx+4,yy-23-j%3*11);});oval(c,xx+4,yy-25-j%3*11,13+j%2*5,5,j%3?'#62a6ae':'#b4d8b5');}for(let j=0;j<3;j++)stroke(c,'#486b6e',3-j*.6,()=>{c.moveTo(x-80+j*8,y-206);c.bezierCurveTo(x+95,y-160,x-100,y-100,x+65,y-30);});}
 }else{
  // Flowering boughs introduce copper/pink highlights and avoid monochrome walls.
  for(let side of[-1,1]){const x=side<0?W*.08:W*.94;stroke(c,q.ink,12,()=>{c.moveTo(x,y+30);c.bezierCurveTo(x-side*55,y-100,x+side*70,y-210,x-side*55,y-310);});for(let j=0;j<17;j++){const xx=x+(noise(j+side+20)-.5)*190,yy=y-220+(noise(j+90)-.5)*175;leaf(c,xx,yy,18+noise(j)*12,q.leaf,j);if(j%2===0)blossom(c,xx+8,yy-6,6,j%3?'#d5aaa5':'#c6cfb2');}}
  for(let i=0;i<16;i++){const x=noise(i+142)*W,yy=y+35+noise(i+7)*H*.14;leaf(c,x,yy,9+noise(i)*8,'#527d7b',-.1);if(i%4===0)blossom(c,x,yy-3,4,'#e1b7ad');}
 }
 if(id==='gallery'){for(let i=0;i<6;i++){const x=W*(i+.5)/6;c.fillStyle=q.stone;c.fillRect(x-18,y+5,36,10);c.fillStyle=q.ink;c.fillRect(x-11,y-45,22,50);c.beginPath();c.moveTo(x-20,y-43);c.lineTo(x-24,y-76);c.lineTo(x-11,y-65);c.lineTo(x+12,y-67);c.lineTo(x+23,y-78);c.lineTo(x+20,y-43);c.fill();oval(c,x-8,y-56,2,3,'#a6c5b4');oval(c,x+8,y-56,2,3,'#a6c5b4');}}
 if(id==='canopy'){for(let i=0;i<6;i++){const x=W*(i+.2)/6,top=80+noise(i)*100;stroke(c,'#608f8b',2,()=>{c.moveTo(x,0);c.bezierCurveTo(x-40,top*.5,x+50,top,x,top+100);});for(let j=0;j<9;j++){const xx=x+Math.sin(j*.8)*15,yy=top+j*11;blossom(c,xx,yy,4.5,j%2?'#ccb4c4':'#a9cabb');}}}
 if(id==='arena'){const x=W*.58,yy=y-140;c.save();c.globalAlpha=.25;for(const side of[-1,1]){leaf(c,x+side*55,yy,105,'#b1b8b5',side*.65);leaf(c,x+side*52,yy+60,74,'#889aa5',-side*.55);}oval(c,x,yy+20,20,74,q.light);oval(c,x,yy-55,31,26,q.light);for(const side of[-1,1])oval(c,x+side*11,yy-58,5,10,q.ink);c.restore();}
}

function paintSanctuary(c,W,H,id,cleared){
 const q=THEMES[id]||THEMES.court,sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,cleared&&id!=='crypt'?'#3c5265':q.top);sky.addColorStop(1,q.bottom);c.fillStyle=sky;c.fillRect(0,0,W,H);
 const ground=H*.64;
 const sanctuaryMural=muralFor(id);
 const muralReady=sanctuaryMural?.complete&&sanctuaryMural.naturalWidth>0;
 if(muralReady){
  const zoom=id==='canopy'?1.19:1,scale=Math.max(W/sanctuaryMural.naturalWidth,H/sanctuaryMural.naturalHeight)*zoom,dw=sanctuaryMural.naturalWidth*scale,dh=sanctuaryMural.naturalHeight*scale;
  const dx=Math.max(W-dw,Math.min(0,(W-dw)*.5+(id==='maze'?W*.13:0))),dy=(H-dh)*(id==='canopy'?.12:.5);
  c.drawImage(sanctuaryMural,dx,dy,dw,dh);
  c.save();c.globalAlpha=id==='maze'?.3:id==='return'?.2:.09;c.fillStyle=id==='return'?'#e4b788':q.ink;c.fillRect(0,0,W,H);c.restore();
  if(cleared){const dawn=c.createLinearGradient(0,H*.2,W,H);dawn.addColorStop(0,'#f0d3a322');dawn.addColorStop(1,'#99cab011');c.fillStyle=dawn;c.fillRect(0,0,W,H);}
  if(id==='canopy'){c.save();c.globalAlpha=.7;for(let i=0;i<3;i++){const x=W*(i+.4)/3,yy=H*.28+i%2*80;stroke(c,'#78998c',2,()=>{c.moveTo(x-25,0);c.lineTo(x-16,yy);c.moveTo(x+25,0);c.lineTo(x+16,yy);});oval(c,x,yy,31,10,'#496d6b');for(let j=0;j<5;j++)leaf(c,x+(j-2)*11,yy-8,18,'#a0c7a8',j);for(let j=0;j<6;j++)blossom(c,x+Math.sin(j)*13,yy+13+j*10,4,'#d0b0cb');}c.restore();}
  if(id==='return'){c.save();c.globalAlpha=.6;c.fillStyle='#304d60';c.beginPath();c.moveTo(W*.63,H*.7);c.quadraticCurveTo(W*.74,H*.8,W*.85,H*.7);c.fill();stroke(c,'#e5d4ad',2,()=>{c.moveTo(W*.73,H*.71);c.lineTo(W*.73,H*.49);});c.fillStyle='#d8d0b4';c.beginPath();c.moveTo(W*.735,H*.5);c.lineTo(W*.82,H*.68);c.lineTo(W*.735,H*.69);c.fill();c.restore();}
  return;
 }

 if(id!=='crypt'){const mx=W*.73,my=H*.19,r=Math.min(55,H*.075);const halo=c.createRadialGradient(mx,my,r*.6,mx,my,r*2.5);halo.addColorStop(0,'#f6dbaa25');halo.addColorStop(1,'#f6dbaa00');c.fillStyle=halo;c.fillRect(mx-r*2.5,my-r*2.5,r*5,r*5);oval(c,mx,my,r,r,q.light);if(!cleared){c.save();c.globalCompositeOperation='destination-out';oval(c,mx+r*.47,my-r*.12,r*.94,r*.94,'#000');c.restore();c.fillStyle=sky;c.globalCompositeOperation='destination-over';c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';}}
 for(let i=0;i<35;i++){c.globalAlpha=.2+noise(i)*.35;oval(c,noise(i+9)*W,noise(i+71)*H*.57,i%7? .8:1.5,i%7?.8:1.5,q.light);}c.globalAlpha=1;
 // Broad mist and moonlight are painted once with the scenery, not rebuilt
 // as full-screen particles. The foreground remains high-contrast.
 if(id!=='crypt'){const beam=c.createLinearGradient(0,H*.1,0,H*.83);beam.addColorStop(0,'#e9dfbc00');beam.addColorStop(.65,'#c6ddd21c');beam.addColorStop(1,'#d8e8da00');c.fillStyle=beam;for(let i=0;i<3;i++){const xx=W*(.28+i*.25);c.beginPath();c.moveTo(xx-16,H*.06);c.lineTo(xx+140,H*.85);c.lineTo(xx-160,H*.85);c.lineTo(xx-54,H*.06);c.fill();}}
 // Distant islands and their mirrored foundations provide depth without
 // drawing bright false platforms into the playable foreground.
 for(let layer=0;layer<3;layer++){c.fillStyle=[q.ink,q.stone,q.ink][layer];c.globalAlpha=.18+layer*.09;c.beginPath();c.moveTo(0,H);for(let i=0;i<=14;i++){const x=i*W/14,y=ground-40-layer*45-Math.sin(i*.75+layer)*42-noise(i+layer*7)*80;i?c.lineTo(x,y):c.lineTo(x,y);}c.lineTo(W,H);c.fill();}c.globalAlpha=1;
 if(id==='crypt'){
  // Roots form a vaulted underground room; blue mushrooms light its recesses.
  for(let i=0;i<7;i++){const x=i*W/6;c.fillStyle=q.ink;c.beginPath();c.moveTo(x-70,-20);c.bezierCurveTo(x-10,H*.2,x-90,H*.35,x-58,H*.64);c.lineTo(x-30,H*.72);c.bezierCurveTo(x-72,H*.35,x+50,H*.18,x+50,-20);c.fill();stroke(c,q.stone,3,()=>{c.moveTo(x,0);c.bezierCurveTo(x+35,H*.24,x-65,H*.34,x-27,H*.61);});}
  for(let i=0;i<12;i++){const x=35+noise(i+18)*(W-70),y=ground+noise(i)*H*.12;c.globalAlpha=.65;stroke(c,q.stone,3,()=>{c.moveTo(x,y);c.lineTo(x+3,y-26);});oval(c,x+2,y-28,17,7,i%3?'#4e8b9c':'#8bbfc0');oval(c,x+2,y-29,9,2,'#c4e4ce');}c.globalAlpha=1;
 }else if(id==='gallery'||id==='arena'){
  // Stained glass has leaded petals, rather than the former repeated eclipses.
  const count=id==='arena'?3:5;for(let i=0;i<count;i++){const x=W*(i+.5)/count,y=ground-25,w=Math.min(130,W/count*.66),h=H*(id==='arena'?.55:.46);arch(c,x,y,w,h,q.ink,18);arch(c,x,y,w-13,h-6,q.stone,3);c.save();c.beginPath();c.rect(x-w*.4,y-h*.72,w*.8,h*.68);c.clip();
   for(let row=0;row<5;row++)for(let col=0;col<3;col++){const xx=x-w*.4+col*w*.27,yy=y-h*.72+row*h*.135;c.fillStyle=['#749c9e66','#c6a19966','#b9b68c66'][(row+col+i)%3];c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+w*.26,yy+7);c.lineTo(xx+w*.26,yy+h*.13);c.lineTo(xx,yy+h*.13-7);c.closePath();c.fill();c.strokeStyle='#273e514d';c.lineWidth=1.2;c.stroke();}
   for(let j=0;j<7;j++)leaf(c,x,y-h*.38,Math.min(w*.45,37),['#c9aaa8','#96b2b1','#c4c5a3'][j%3],j*Math.PI/3.5);c.restore();stroke(c,q.light,1,()=>{c.moveTo(x,y-10);c.lineTo(x,y-h*.88);c.moveTo(x-w*.4,y-h*.46);c.lineTo(x+w*.4,y-h*.46);});}
  c.fillStyle=q.ink;c.fillRect(0,ground-13,W,16);for(let i=0;i<11;i++){const x=i*W/10;c.fillRect(x-6,ground-40,12,50);oval(c,x,ground-42,9,4,q.stone);}
 }else if(id==='canopy'){
  for(let i=0;i<5;i++){const x=W*(i+.35)/5,y=ground-60-noise(i+50)*H*.3;stroke(c,q.ink,2,()=>{c.moveTo(x-55,0);c.lineTo(x-35,y);c.moveTo(x+55,0);c.lineTo(x+35,y);});c.fillStyle=q.stone;c.beginPath();c.moveTo(x-70,y);c.quadraticCurveTo(x,y+100,x+70,y);c.fill();for(let j=0;j<8;j++)leaf(c,x+(j-3.5)*14,y-7-Math.sin(j)*16,23,j%2?q.leaf:'#629d98',j*.7);stroke(c,q.leaf,2,()=>{c.moveTo(x+40,y);c.bezierCurveTo(x+75,y+42,x+8,y+70,x+38,y+112);});}
  // A distant hanging bridge stays desaturated and behind the garden.
  stroke(c,'#4c7684',3,()=>{c.moveTo(0,H*.43);c.quadraticCurveTo(W*.5,H*.67,W,H*.36);});
 }else if(id==='return'){
  for(let i=0;i<4;i++){const x=W*(.15+i*.25),y=ground; c.fillStyle=q.ink;c.fillRect(x-5,y-135,10,150);stroke(c,q.stone,3,()=>{c.moveTo(x,y-125);c.lineTo(x+65,y-118);});drawSanctuaryLantern(c,x+65,y-100,true,0,true);}
  c.fillStyle='#385c6c';c.beginPath();c.moveTo(W*.45,ground+12);c.quadraticCurveTo(W*.58,ground+90,W*.72,ground+12);c.fill();stroke(c,q.light,2,()=>{c.moveTo(W*.58,ground);c.lineTo(W*.58,ground-170);});c.fillStyle='#d0c9ac';c.beginPath();c.moveTo(W*.58+5,ground-163);c.lineTo(W*.58+80,ground-20);c.lineTo(W*.58+5,ground-12);c.fill();
 }else{
  const x=id==='maze'?W*.56:W*.46,y=ground-25;arch(c,x,y,Math.min(340,W*.45),H*.52,q.ink,25);arch(c,x,y,Math.min(310,W*.41),H*.49,q.stone,3);
  for(let side of[-1,1]){const xx=x+side*Math.min(185,W*.25);c.fillStyle=q.ink;c.fillRect(xx-16,y-160,32,170);c.fillStyle=q.stone;c.fillRect(xx-24,y-167,48,12);for(let j=0;j<4;j++)leaf(c,xx+side*j*12,y-160-j*12,24,q.leaf,j*.6);}
 }
 if(id!=='crypt'){
  // Still water reflects the architecture. It is backdrop, below the real floor.
  const water=c.createLinearGradient(0,ground,0,H);water.addColorStop(0,'#8bb0ad30');water.addColorStop(1,'#0e304b90');c.fillStyle=water;c.fillRect(0,ground,W,H-ground);
  for(let i=0;i<28;i++){const x=noise(i+12)*W,y=ground+noise(i+43)*(H-ground);stroke(c,i%3?q.stone:q.light,1,()=>{c.moveTo(x,y);c.lineTo(x+15+noise(i)*75,y);});}
 }
 gardenDetail(c,W,H,id,q);
 // Two framing trees leave the middle clear for movement and boss tells.
 branchTree(c,20,ground+80,H/540,q.ink,q.stone,2);branchTree(c,W-25,ground+65,H/610,q.ink,q.leaf,15);
}
function sceneryLayer(W,H,id,cleared){
 if(W*H>3000000)return null;
 const image=muralFor(id),key=[Math.ceil(W),Math.ceil(H),id,cleared,!!(image?.complete&&image.naturalWidth)].join(':');if(sceneryCache.has(key))return sceneryCache.get(key);
 let canvas;try{canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(Math.ceil(W)+384,Math.ceil(H)):globalThis.document?.createElement('canvas');if(!canvas)return null;canvas.width=Math.ceil(W)+384;canvas.height=Math.ceil(H);const c=canvas.getContext('2d');if(!c)return null;paintSanctuary(c,canvas.width,canvas.height,id,cleared);}catch{return null;}
 if(sceneryCache.size>=MICHI_SCENERY_CACHE_LIMIT)sceneryCache.delete(sceneryCache.keys().next().value);sceneryCache.set(key,canvas);return canvas;
}
export function drawMichiSanctuaryBackdrop(c,g,cam,t,W,H){
 if(!g.roomDef?.michiSanctuary)return false;const id=sanctuaryZone(g)?.id||'court';void preloadMichiScenery(id);const cleared=!!g.world1?.sealed,layer=sceneryLayer(W,H,id,cleared),time=g.reduceMotion?0:t;
 c.save();if(layer)c.drawImage(layer,-Math.max(0,Math.min(256,cam.x*.017)),0);else paintSanctuary(c,W,H,id,cleared);
 if(id!=='crypt'){c.strokeStyle='#c2ded2';c.lineWidth=1;for(let i=0;i<10;i++){const x=W*.12+i*W*.086+Math.sin(time*.017+i)*7,y=H*(.67+i%4*.032);c.globalAlpha=.12+Math.sin(time*.012+i)*.04;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+12,y-2,x+26+i%3*7,y);c.stroke();}}
 // Wind, pollen and reflected light use a bounded set of low-contrast accents.
 const q=THEMES[id]||THEMES.court;for(let i=0;i<12;i++){const x=((i*157-cam.x*.12+Math.sin(time*.009+i)*12)%(W+80)+W+80)%(W+80)-40,y=H*(.31+noise(i+40)*.49)+Math.sin(time*.013+i)*5;c.globalAlpha=.22+noise(i)*.3;oval(c,x,y,i%4?1.2:2,i%4?1.2:2,q.light);}c.restore();return true;
}

const stoneTiles=new Map();
function stoneTile(q){
 if(stoneTiles.has(q.ink))return stoneTiles.get(q.ink);
 let tile;try{tile=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(124,76):globalThis.document?.createElement('canvas');if(!tile)return null;tile.width=124;tile.height=76;const c=tile.getContext('2d');c.fillStyle=q.ink;c.fillRect(0,0,124,76);for(let row=0;row<2;row++)for(let n=-1;n<3;n++){const x=n*62+(row?31:0),y=row*38;stroke(c,row?'#42606b':'#3e5c64',1,()=>{c.moveTo(x,y);c.lineTo(x+55,y);c.lineTo(x+61,y+31);});c.fillStyle='#4e6f7044';c.fillRect(x+9,y+5,14,2);for(let k=0;k<4;k++){c.fillStyle=k%2?'#b2bb9c10':'#091c3020';c.fillRect(x+noise(k+n+10)*48,y+4+noise(k+row+27)*25,8+noise(k+9)*17,2);}}}catch{return null;}
 stoneTiles.set(q.ink,tile);return tile;
}
function drawSanctuaryStone(c,p,cam,W,H,q,time,reduced,attentionX){
 const x=p.x-cam.x,y=p.y-cam.y;if(x+p.w<-80||x>W+80||y>H+120||y+p.h<-120)return;
 const thin=p.h<=24,left=Math.max(0,cam.x-p.x-60),right=Math.min(p.w,cam.x+W-p.x+60);
 c.fillStyle=thin?'#355b65':q.ink;c.fillRect(x,y,p.w,p.h);
 // Warm capstones are the visual contract for a real, walkable collider.
 c.fillStyle='#a2c4b1';c.fillRect(x,y,p.w,3);c.fillStyle='#607f7c';c.fillRect(x,y+3,p.w,5);c.fillStyle='#d8cba1';c.fillRect(x,y+3,p.w,1);
 c.save();c.beginPath();c.rect(x,y+8,p.w,Math.max(0,p.h-8));c.clip();
 const tile=stoneTile(q);if(tile&&typeof c.createPattern==='function'){c.save();c.translate(x,y+8);c.fillStyle=c.createPattern(tile,'repeat');c.fillRect(0,0,p.w,Math.max(0,p.h-8));c.restore();}
 else {const rows=Math.min(8,Math.ceil(Math.min(p.h,H-y+40)/38));for(let row=0;row<rows;row++){const offset=row%2?31:0;for(let n=Math.floor((left-offset)/62);n<(right-offset)/62;n++){const xx=x+n*62+offset,yy=y+10+row*38;stroke(c,row%2?'#42606b':'#3e5c64',1,()=>{c.moveTo(xx,yy);c.lineTo(xx+55,yy);c.lineTo(xx+61,yy+31);c.moveTo(xx+55,yy);c.lineTo(xx+59,yy+5);});if(noise(n+row*7)>.6){c.fillStyle='#4e6f70';c.fillRect(xx+9,yy+5,14,2);}}}}
 c.restore();
 for(let n=Math.floor(left/87);n<right/87;n++){const xx=x+n*87+17,phase=reduced?0:Math.sin(time*.025+n)*2;c.fillStyle='#5e9d83';c.beginPath();c.moveTo(xx-13,y);c.quadraticCurveTo(xx-8,y-13,xx-1+phase,y-10);c.lineTo(xx,y);c.quadraticCurveTo(xx+8,y-14,xx+13+phase,y-8);c.lineTo(xx+14,y);c.fill();if(n%3===0){stroke(c,'#83b6a0',1,()=>{c.moveTo(xx+4,y);c.lineTo(xx+7,y-12);});oval(c,xx+7,y-13,2,3,q.light);}const near=Math.max(0,1-Math.abs(p.x+n*87+17-attentionX)/125);if(near>0){c.save();c.globalAlpha=near*.35;oval(c,xx+7,y-12,3+near*5,3+near*5,q.light);c.restore();}}
 if(thin){stroke(c,'#1c3d4e',2,()=>{c.moveTo(x+5,y+p.h);c.quadraticCurveTo(x+p.w*.5,y+p.h+8,x+p.w-5,y+p.h);});}
}
function drawPassageEmblem(c,x,y,a,ready,t,reduced){
 const col=ready?'#c9e8cf':'#7f8d8c';c.save();c.translate(x,y);c.strokeStyle=col;c.lineWidth=1.5;
 if(a.label.includes('Cripta')||a.label.includes('raíces')){for(const side of[-1,1])stroke(c,col,1.5,()=>{c.moveTo(0,-10);c.quadraticCurveTo(side*3,0,side*12,8);c.moveTo(side*4,0);c.lineTo(side*13,-1);});}
 else if(a.label.includes('jardín')||a.label.includes('Jardín')){for(let i=0;i<3;i++)leaf(c,(i-1)*6,2,8,col,i*.8-1);}
 else if(a.label.includes('Galería')){arch(c,0,10,22,26,col,2);stroke(c,col,1,()=>{c.moveTo(0,-12);c.lineTo(0,8);c.moveTo(-8,-2);c.lineTo(8,-2);});}
 else if(a.label.includes('Laberinto')){stroke(c,col,2,()=>{c.moveTo(-12,9);c.lineTo(-12,-10);c.lineTo(11,-10);c.lineTo(11,10);c.lineTo(-3,10);c.lineTo(-3,-1);c.lineTo(4,-1);});}
 else if(a.label.includes('Santuario')){for(const side of[-1,1]){leaf(c,side*7,0,12,col,side*.7);}oval(c,0,0,2,8,P.ivory);}
 else{stroke(c,col,2,()=>{c.moveTo(-10,8);c.lineTo(-10,-4);c.lineTo(0,-13);c.lineTo(10,-4);c.lineTo(10,8);c.closePath();});}
 c.restore();
}

export function drawMichiSanctuary(c,g,cam,t=0){
 if(!g.roomDef?.michiSanctuary)return;const W=g.viewW||1280,H=g.viewH||720,r=g.roomDef.michiSanctuary,near=nearestSanctuaryPassage(g);c.save();c.lineCap='round';
 const zoneStyle=THEMES[sanctuaryZone(g)?.id]||THEMES.court;
 for(const p of g.platforms||[])drawSanctuaryStone(c,p,cam,W,H,zoneStyle,t,!!g.reduceMotion,g.player?g.player.x+g.player.w/2:Infinity);
 for(const a of r.passages){const x=a.x-cam.x,y=a.floor-cam.y;if(x<-100||x>W+100||y<-80||y>H+150)continue;const ready=passageReady(g,a);c.fillStyle=P.stone;c.beginPath();c.moveTo(x-43,y);c.lineTo(x-43,y-59);c.bezierCurveTo(x-43,y-118,x+43,y-118,x+43,y-59);c.lineTo(x+43,y);c.fill();c.fillStyle=P.deep;c.beginPath();c.moveTo(x-28,y);c.lineTo(x-28,y-60);c.bezierCurveTo(x-28,y-98,x+28,y-98,x+28,y-60);c.lineTo(x+28,y);c.fill();
  drawPassageEmblem(c,x,y-65,a,ready,t,!!g.reduceMotion);
  for(const side of[-1,1]){stroke(c,'#6a9588',2,()=>{c.moveTo(x+side*43,y);c.quadraticCurveTo(x+side*58,y-59,x+side*31,y-88);});for(let j=0;j<4;j++)leaf(c,x+side*(43+j%2*6),y-18-j*15,7,'#79aa91',side*.8);}
  stroke(c,ready?P.teal:'#657773',3,()=>{c.moveTo(x-36,y-7);c.lineTo(x-36,y-60);c.bezierCurveTo(x-36,y-106,x+36,y-106,x+36,y-60);c.lineTo(x+36,y-7);});
  c.fillStyle=ready?P.ivory:'#8f9c92';c.font='600 12px sans-serif';c.textAlign='center';c.fillText(a.label,x,y-123);c.font='11px sans-serif';c.fillText(ready?'↓ / E':a.exit?'Sello + 3 ecos':a.need+' faroles',x,y-106);drawSanctuaryLantern(c,x+55,y-58,ready,t,true);
 }
 for(const s of g.world1?.stations||[]){if(s.x<cam.x-150||s.x>cam.x+W+150||s.y<cam.y-160||s.y>cam.y+H+120)continue;const x=s.x-cam.x,y=s.y-cam.y;stroke(c,P.stone,3,()=>{c.moveTo(x,y-70);c.quadraticCurveTo(x-20,y-150,x+30,y-180);});drawSanctuaryLantern(c,x,y-14,s.done,t);c.fillStyle=s.done?P.teal:P.ivory;c.font='600 12px sans-serif';c.textAlign='center';c.fillText(s.name,x,y-80);if(s.done){c.fillStyle='#789e92';c.fillRect(x-74,y+26,148,10);}}
 if(g.expedition?.done&&(g.world1?.sealed||sanctuaryGuardianDefeated(g)))for(const n of g.roomDef.expedition.nodes){if(g.expedition.done.includes(n.id))continue;const x=n.x-cam.x,y=n.y-cam.y;drawSanctuaryLantern(c,x,y,true,t);c.fillStyle=P.ivory;c.font='11px sans-serif';c.textAlign='center';c.fillText('Eco del hogar',x,y-56);}
 const zone=sanctuaryZone(g);if(zone&&W>700){c.fillStyle=P.ivory;c.textAlign='center';c.font='600 12px sans-serif';c.fillText(zone.name,W/2,26);}
 if(near){c.fillStyle='#102a36ee';const w=Math.min(420,W-32);c.fillRect((W-w)/2,H-102,w,36);c.fillStyle=P.ivory;c.textAlign='center';c.font='13px sans-serif';c.fillText(passageReady(g,near)?'↓ / E · '+near.label:'Faltan faroles o ecos del hogar',W/2,H-79);}
 c.restore();
}
// Five visual families read actual AI windup/active/recovery, not a random clock.
export function drawSanctuaryFoe(c,e,cam,t,reduced){
 if(!e.roomPersona?.michiSanctuary)return false;const a=e._campaign||{},wind=a.wind>0,active=a.active>0,rest=a.recover>0,x=e.x+e.w/2-cam.x,y=e.y+e.h-cam.y,k=Math.max(.6,e.h/60),time=reduced?0:t;
 c.save();c.translate(x,y);c.scale(k*(a.aim||1),k);c.lineWidth=2;c.strokeStyle='#132d37';const body=wind?P.coral:rest?'#708d81':'#497980';
 const limb=(x1,y1,x2,y2)=>stroke(c,P.ivory,1.3,()=>{c.moveTo(x1,y1);c.quadraticCurveTo(x2*.5,y1-7,x2,y2);});
 if(e.kind==='arana'){for(const side of[-1,1])for(let i=0;i<3;i++)limb(side*(7+i*3),-20,side*(25+i*4),-3+(reduced?0:Math.sin(time*.18+i)*2));oval(c,-9,-23,19,15,body);oval(c,12,-23,11,10,P.stone);stroke(c,P.teal,1,()=>{c.moveTo(-20,-24);c.lineTo(-5,-17);c.lineTo(-5,-30);});}
 else if(e.kind==='ufo'){oval(c,0,-7,28,7,'#749086');oval(c,-2,-26,25,25,body);for(let i=0;i<3;i++)stroke(c,P.ivory,1.2,()=>{c.arc(-2,-26,5+i*5,-2,2.5);});oval(c,23,-13,9,6,P.teal);limb(24,-16,25,-28);}
 else if(e.kind==='murcielago'){const flap=reduced?0:Math.sin(time*.16)*7;for(const side of[-1,1]){c.fillStyle=body;c.beginPath();c.moveTo(side*4,-33);c.bezierCurveTo(side*39,-64+flap,side*49,-14+flap,side*8,-16);c.fill();stroke(c,P.ivory,1,()=>{c.moveTo(side*7,-30);c.lineTo(side*30,-38+flap);});}oval(c,0,-25,8,20,'#bcac88');}
 else if(e.kind==='phosquito'){for(const side of[-1,1])oval(c,side*14,-34,15,6,'#86a9a6');oval(c,0,-20,12,23,body);oval(c,0,-5,8,10,wind?P.coral:P.ivory);limb(-4,-38,-10,-48);limb(4,-38,10,-48);}
 else{for(let i=0;i<5;i++)stroke(c,i%2?P.teal:P.ivory,1.5,()=>{const xx=(i-2)*7;c.moveTo(xx,-22);c.quadraticCurveTo(xx+(reduced?0:Math.sin(time*.08+i)*6),-8,xx,-1);});c.fillStyle=body;c.beginPath();c.moveTo(-29,-23);c.bezierCurveTo(-28,-64,28,-64,29,-23);c.quadraticCurveTo(0,-14,-29,-23);c.fill();oval(c,0,-32,11,11,P.ivory);}
 for(const side of[-1,1]){oval(c,side*4,-29,2,3,P.ivory);oval(c,side*4+1,-29,1,2,P.deep);}
 if(wind){stroke(c,P.coral,2,()=>{c.moveTo(19,-47);c.lineTo(19,-37);});oval(c,19,-33,1.4,1.4,P.coral);}if(active){stroke(c,P.coral,1.3,()=>{c.moveTo(-35,-17);c.lineTo(-25,-17);c.moveTo(-38,-23);c.lineTo(-28,-23);});}
 c.restore();return true;
}
