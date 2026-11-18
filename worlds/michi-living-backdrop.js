import {drawMichiMemoryTree} from './michi-memory-tree.js';
// Michi / Living Lantern Sanctuary. Decorative screen-space painting only.
// Art never changes collision, route geometry, enemy AI, save data or interaction IDs.
// Stable world-anchored parallax, local narrative palettes, reduced-motion support.
import {drawMichiArchitecture,drawMichiWater} from './michi-living-architecture.js';
import {sanctuaryZone} from '../systems/michi-sanctuary.js';

const TAU=Math.PI*2;
const light=(x)=>Math.max(0,Math.min(1,x));
const mod=(n,d)=>((n%d)+d)%d;
const noise=(n)=>{const s=Math.sin(n*127.1+43.7)*43758.5453;return s-Math.floor(s);};
const THEMES=Object.freeze({
 court:  {sky:['#171a34','#474361','#a18c9f'],mist:'#6ed5c0',stone:'#24444d',foliage:'#234e52',warm:'#ffe0a4'},
 crypt:  {sky:['#080e22','#242e4a','#4c576c'],mist:'#77babb',stone:'#172c37',foliage:'#163b41',warm:'#e2b6cb'},
 gallery:{sky:['#101b35','#263350','#4a4b64'],mist:'#c7afd7',stone:'#343c5c',foliage:'#454d62',warm:'#ffe7b8'},
 maze:   {sky:['#152c41','#365563','#77918a'],mist:'#90d2ce',stone:'#213d4b',foliage:'#255353',warm:'#f1d39f'},
 canopy: {sky:['#1d3155','#54798d','#a2b8ac'],mist:'#a1eeeb',stone:'#31515b',foliage:'#306661',warm:'#ffe1b3'},
 arena:  {sky:['#211a33','#57425e','#a67e90'],mist:'#edb6cb',stone:'#4b4059',foliage:'#494a5a',warm:'#ffd5a5'},
 return: {sky:['#283c58','#8e7985','#e5ae8a'],mist:'#ffe5bb',stone:'#625664',foliage:'#596c6a',warm:'#fff0c5'}
});
const ellipse=(c,x,y,rx,ry,fill)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const path=(c,fill,draw)=>{c.fillStyle=fill;c.beginPath();draw();c.closePath();c.fill();};
const line=(c,fill,width,draw)=>{c.strokeStyle=fill;c.lineWidth=width;c.beginPath();draw();c.stroke();};

function sky(c,W,H,p,lit){
 const g=c.createLinearGradient(0,0,0,H);
 g.addColorStop(0,p.sky[0]);g.addColorStop(.56,p.sky[1]);g.addColorStop(1,p.sky[2]);
 c.fillStyle=g;c.fillRect(0,0,W,H);
 // One asymmetrical luminous clearing, never a flat uniform overlay.
 const x=W*.72,y=H*.29;
 const a=c.createRadialGradient(x,y,20,x,y,Math.max(W*.58,H*.62));
 a.addColorStop(0,'rgba(153,244,222,'+(.15+lit*.075)+')');
 a.addColorStop(.45,'rgba(69,159,174,.045)');
 a.addColorStop(1,'rgba(0,0,0,0)');
 c.fillStyle=a;c.fillRect(0,0,W,H);
}

function moon(c,cam,t,W,H,theme,cleared,reduced){
 const x=W*.78-(cam.x||0)*.012,y=H*.20-(cam.y||0)*.012;
 const radius=Math.max(26,Math.min(54,W*.043,H*.079));
 const glow=c.createRadialGradient(x,y,radius*.7,x,y,radius*3.2);
 glow.addColorStop(0,'rgba(255,245,205,.26)');
 glow.addColorStop(.36,'rgba(195,233,221,.12)');
 glow.addColorStop(1,'rgba(0,0,0,0)');
 c.fillStyle=glow;c.fillRect(x-radius*3.2,y-radius*3.2,radius*6.4,radius*6.4);
 c.fillStyle='#fff1cd';c.beginPath();
 if(cleared)c.arc(x,y,radius,0,TAU);
 else{c.arc(x,y,radius,-1.1,1.1,true);c.bezierCurveTo(x-radius*.7,y+radius*.55,x-radius*.7,y-radius*.55,x+Math.cos(-1.1)*radius,y+Math.sin(-1.1)*radius);}
 c.closePath();c.fill();
 line(c,'rgba(255,238,194,.34)',1.5,()=>{
  c.arc(x,y,radius+11+(reduced?0:Math.sin(t*.015)*2),-.10,Math.PI*1.48);
 });
 // One moon, physically behind the forests, with clear air around the player.
}

// Vector foliage stamps are generated locally; each tree stays an independent object.
const crownCache=new Map();
function paintCrown(c,layer,i){
 const tones=layer===0?['#253d55','#2c455a']:layer===1?['#3a5a67','#456b72']:['#497779','#608b86'];
 for(let b=0;b<4;b++){
  const side=b%2?1:-1,reach=52+noise(i*7+b)*61,yy=18+b*21;
  line(c,tones[0],3+layer,()=>{c.moveTo(0,yy+41);c.bezierCurveTo(side*27,yy+13,side*reach*.7,yy+12,side*reach,yy-17);});
  for(let k=0;k<4;k++){
   const xx=side*(22+k*reach/5),ly=yy+8-k*5;
   c.fillStyle=tones[k%2];c.beginPath();c.moveTo(xx-23,ly+4);
   c.bezierCurveTo(xx-36,ly-18,xx-8,ly-29,xx+7,ly-17);
   c.bezierCurveTo(xx+23,ly-37,xx+43,ly-13,xx+25,ly+3);
   c.quadraticCurveTo(xx,ly+16,xx-23,ly+4);c.fill();
   if(layer===2&&k%2===0){ellipse(c,xx+5,ly-7,3,3,'#c2a6b4');ellipse(c,xx+10,ly-5,2,2,'#e0bec1');}
  }
 }
}
function drawCrown(c,x,y,layer,seed){
 if(typeof OffscreenCanvas==='undefined'){c.save();c.translate(x,y);paintCrown(c,layer,seed);c.restore();return;}
 const variant=((seed%4)+4)%4,key=layer+':'+variant;
 let stamp=crownCache.get(key);
 if(!stamp){stamp=new OffscreenCanvas(340,200);const q=stamp.getContext('2d');q.translate(170,55);paintCrown(q,layer,variant);crownCache.set(key,stamp);}
 c.drawImage(stamp,x-170,y-55);
}
function distantTrees(c,cam,t,W,H,p,reduced){
 const cx=cam.x||0,cy=cam.y||0;
 for(let layer=0;layer<3;layer++){
  c.save();c.globalAlpha=[.28,.34,.43][layer];
  const par=[.07,.15,.27][layer],step=[290,255,225][layer];
  const start=Math.floor((cx*par-180)/step),end=Math.ceil((cx*par+W+180)/step);
  const baseline=H*(.85+layer*.05)-cy*par*.32;
  for(let i=start;i<=end;i++){
   const x=i*step-cx*par+(noise(i+layer*77)-.5)*88;
   if(x < -150 || x > W+150)continue;
   const h=H*(.42+noise(i*3+layer*29)*.25),root=baseline+36,top=root-h;
   line(c,['#25394d','#2e4957','#365c64'][layer],[18,24,33][layer],()=>{c.moveTo(x-11,root);c.bezierCurveTo(x-23,root-h*.38,x+24,root-h*.68,x,top);});
   for(const side of[-1,1])line(c,['#25394d','#2e4957','#365c64'][layer],5+layer*2,()=>{c.moveTo(x,root-h*.62);c.quadraticCurveTo(x+side*48,top+46,x+side*(72+noise(i+side*11)*42),top+18);});
   drawCrown(c,x,top,layer,i);
   if(layer===2&&i%3===0)ellipse(c,x+30,top+30,3,5,'rgba(225,198,177,'+(reduced?.4:.35+Math.sin(t*.025+i)*.12)+')');
  }
  c.restore();
 }
}

function foregroundMist(c,cam,t,W,H,p,reduced){
 const y=H*.73-(cam.y||0)*.025;
 const g=c.createLinearGradient(0,y-90,0,H);
 g.addColorStop(0,'rgba(18,56,66,0)');
 g.addColorStop(.48,'rgba(31,80,86,.065)');
 g.addColorStop(1,'rgba(8,24,34,.33)');
 c.fillStyle=g;c.fillRect(0,y-90,W,H-y+90);
 // Low-opacity ribbons remain beneath gameplay silhouettes and HUD.
 for(let i=0;i<4;i++){
  const x=mod(i*389-(cam.x||0)*.08+(reduced?0:t*.035),W+340)-170;
  ellipse(c,x,H*(.75+i*.048),160,21,'rgba(151,225,208,.038)');
 }
}

// Each *earned* lantern lights the world at its actual authored coordinates.
// Small, culled light pools keep the collision silhouettes and player readable.
// No particles, state writes or unsaved timers: reduced motion is a still image.
function lanternAfterglow(c,g,cam,t,W,H,reduced){
 const cx=cam.x||0,cy=cam.y||0;
 for(const s of g.world1?.stations||[]){
  if(!s.done||!Number.isFinite(s.x)||!Number.isFinite(s.y))continue;
  const x=s.x-cx,y=s.y-cy-12,r=146;
  if(x<-r||x>W+r||y<-r||y>H+r)continue;
  const pulse=reduced?1:1+Math.sin(t*.027+(Number.isFinite(s.id)?s.id:0)*1.9)*.055;
  const halo=c.createRadialGradient(x,y,7,x,y,r*pulse);
  halo.addColorStop(0,'rgba(255,236,182,.20)');
  halo.addColorStop(.36,'rgba(232,193,151,.115)');
  halo.addColorStop(.72,'rgba(135,225,208,.036)');
  halo.addColorStop(1,'rgba(135,225,208,0)');
  c.fillStyle=halo;c.fillRect(x-r*1.08,y-r*1.08,r*2.16,r*2.16);
  // A faint steady reflection ties the light to the actual lantern position.
  ellipse(c,x,y,3.2,6.2,'rgba(255,242,209,.32)');
 }
}

function starlight(c,cam,t,W,H,p,reduced,lit){
 const drift=reduced?0:t*.027;
 const count=Math.min(35,Math.max(16,Math.round(W/38)));
 for(let i=0;i<count;i++){
  const x=mod(noise(i*31+11)*(W+160)-(cam.x||0)*.08+drift*(i%3+1),W+160)-80;
  const y=H*(.08+noise(i*23+8)*.67),f=reduced?1:.78+.22*Math.sin(t*.025+i*1.7);
  const r=i%7===0?2.4:1.15;
  ellipse(c,x,y,r,r, i%5===0?'rgba(255,223,178,'+(.45*f)+')':
    'rgba(165,240,226,'+((.28+lit*.24)*f)+')');
  if(i%9===0){
   line(c,'rgba(201,243,226,.14)',1,()=>{c.moveTo(x-6,y);c.lineTo(x+6,y);c.moveTo(x,y-6);c.lineTo(x,y+6);});
  }
 }
}

export function drawMichiLivingBackdrop(c,g,cam={},t=0,W=1280,H=720){
 if(!g?.roomDef?.michiSanctuary)return false;
 const zone=sanctuaryZone(g)?.id||'court',p=THEMES[zone]||THEMES.court;
 const reduced=!!g.reduceMotion,cleared=!!g.world1?.sealed;
 const lit=(g.world1?.stations||[]).filter(s=>s.done).length/5;
 c.save();
 sky(c,W,H,p,lit);
 if(zone!=='crypt')moon(c,cam,t,W,H,p,cleared,reduced);
 if(zone!=='crypt')distantTrees(c,cam,t,W,H,p,reduced);
 drawMichiMemoryTree(c,g,cam,t,W,H,zone);
 drawMichiArchitecture(c,zone,cam,reduced?0:t,W,H,p,lit);
 drawMichiWater(c,g,cam,reduced?0:t,W,H,zone,lit);
 starlight(c,cam,t,W,H,p,reduced,lit);
 lanternAfterglow(c,g,cam,t,W,H,reduced);
 foregroundMist(c,cam,t,W,H,p,reduced);
 c.restore();return true;
}

