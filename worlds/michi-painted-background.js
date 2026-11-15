import {drawMichiLivingBackdrop,drawMichiLivingAtmosphere} from './michi-living-backdrop.js';
import {sanctuaryZone} from '../systems/michi-sanctuary.js';
const TAU=Math.PI*2;
const oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const stroke=(c,col,w,fn)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();};
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
export const MICHI_SCENERY_VERSION=651;
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
function blossom(c,x,y,r,col){for(let i=0;i<5;i++){const a=i*TAU/5;oval(c,x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5,r*.45,r*.33,col);}oval(c,x,y,r*.2,r*.2,'#f8ddb0');}
function paintSanctuary(c,W,H,id,cleared){
 const q=THEMES[id]||THEMES.court,sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,cleared&&id!=='crypt'?'#3c5265':q.top);sky.addColorStop(1,q.bottom);c.fillStyle=sky;c.fillRect(0,0,W,H);
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

}

function sceneryLayer(W,H,id,cleared){
 if(W*H>3000000)return null;
 const image=muralFor(id),key=[Math.ceil(W),Math.ceil(H),id,cleared,!!(image?.complete&&image.naturalWidth)].join(':');if(sceneryCache.has(key))return sceneryCache.get(key);
 let canvas;try{canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(Math.ceil(W)+384,Math.ceil(H)):globalThis.document?.createElement('canvas');if(!canvas)return null;canvas.width=Math.ceil(W)+384;canvas.height=Math.ceil(H);const c=canvas.getContext('2d');if(!c)return null;paintSanctuary(c,canvas.width,canvas.height,id,cleared);}catch{return null;}
 if(sceneryCache.size>=MICHI_SCENERY_CACHE_LIMIT)sceneryCache.delete(sceneryCache.keys().next().value);sceneryCache.set(key,canvas);return canvas;
}
export function drawMichiPaintedBackdrop(c,g,cam,t,W,H){
 if(!g.roomDef?.michiSanctuary)return false;const id=sanctuaryZone(g)?.id||'court';void preloadMichiScenery(id);const image=muralFor(id);if(!image?.complete||!image.naturalWidth)return drawMichiLivingBackdrop(c,g,cam,t,W,H);const cleared=!!g.world1?.sealed,layer=sceneryLayer(W,H,id,cleared),time=g.reduceMotion?0:t;
 c.save();if(layer)c.drawImage(layer,-Math.max(0,Math.min(256,cam.x*.017)),0);else paintSanctuary(c,W,H,id,cleared);
 if(id!=='crypt'){c.strokeStyle='#c2ded2';c.lineWidth=1;for(let i=0;i<10;i++){const x=W*.12+i*W*.086+Math.sin(time*.017+i)*7,y=H*(.67+i%4*.032);c.globalAlpha=.12+Math.sin(time*.012+i)*.04;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+12,y-2,x+26+i%3*7,y);c.stroke();}}
 // Wind, pollen and reflected light use a bounded set of low-contrast accents.
 const q=THEMES[id]||THEMES.court;for(let i=0;i<12;i++){const x=((i*157-cam.x*.12+Math.sin(time*.009+i)*12)%(W+80)+W+80)%(W+80)-40,y=H*(.31+noise(i+40)*.49)+Math.sin(time*.013+i)*5;c.globalAlpha=.22+noise(i)*.3;oval(c,x,y,i%4?1.2:2,i%4?1.2:2,q.light);}c.restore();drawMichiLivingAtmosphere(c,g,cam,t,W,H);return true;
}

