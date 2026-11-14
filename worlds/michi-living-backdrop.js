// Michi / Living Lantern Sanctuary. Decorative screen-space painting only.
// Art never changes collision, route geometry, enemy AI, save data or interaction IDs.
// Stable world-anchored parallax, local narrative palettes, reduced-motion support.
import {sanctuaryZone} from '../systems/michi-sanctuary.js';

const TAU=Math.PI*2;
const light=(x)=>Math.max(0,Math.min(1,x));
const mod=(n,d)=>((n%d)+d)%d;
const noise=(n)=>{const s=Math.sin(n*127.1+43.7)*43758.5453;return s-Math.floor(s);};
const THEMES=Object.freeze({
 court:  {sky:['#061925','#0e3441','#28565a'],mist:'#6ed5c0',stone:'#24444d',foliage:'#234e52',warm:'#ffe0a4'},
 crypt:  {sky:['#050f1d','#0a2030','#142d39'],mist:'#77babb',stone:'#172c37',foliage:'#163b41',warm:'#e2b6cb'},
 gallery:{sky:['#101b35','#263350','#4a4b64'],mist:'#c7afd7',stone:'#343c5c',foliage:'#454d62',warm:'#ffe7b8'},
 maze:   {sky:['#091c2a','#113544','#31575c'],mist:'#90d2ce',stone:'#213d4b',foliage:'#255353',warm:'#f1d39f'},
 canopy: {sky:['#071d35','#194659','#486f70'],mist:'#a1eeeb',stone:'#31515b',foliage:'#306661',warm:'#ffe1b3'},
 arena:  {sky:['#16192c','#342b48','#665061'],mist:'#edb6cb',stone:'#4b4059',foliage:'#494a5a',warm:'#ffd5a5'},
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
 ellipse(c,x,y,radius,radius,'#fff1cd');
 if(!cleared)ellipse(c,x+radius*.40,y-radius*.17,radius*.92,radius*.92,theme.sky[0]);
 line(c,'rgba(255,238,194,.34)',1.5,()=>{
  c.arc(x,y,radius+11+(reduced?0:Math.sin(t*.015)*2),-.10,Math.PI*1.48);
 });
 // One moon, physically behind the forests, with clear air around the player.
}

function distantTrees(c,cam,t,W,H,p,reduced){
 const cx=cam.x||0,cy=cam.y||0;
 for(let layer=0;layer<3;layer++){
  const par=[.07,.15,.27][layer],step=[290,255,225][layer];
  const start=Math.floor((cx*par-180)/step),end=Math.ceil((cx*par+W+180)/step);
  const baseline=H*(.85+layer*.05)-cy*par*.32;
  for(let i=start;i<=end;i++){
   const x=i*step-cx*par+(noise(i+layer*77)-.5)*88;
   if(x < -150 || x > W+150)continue;
   const h=H*(.42+noise(i*3+layer*29)*.25),root=baseline+36;
   const trunk=[18,24,33][layer];
   line(c,[ '#153340','#183a43','#21464b'][layer],trunk,()=>{
    c.moveTo(x-11,root);
    c.bezierCurveTo(x-23,root-h*.38,x+24,root-h*.68,x,root-h);
   });
   const top=root-h;
   for(const side of[-1,1]){
    line(c,[ '#153340','#183a43','#21464b'][layer],5+layer*2,()=>{
     c.moveTo(x,root-h*.62);
     c.quadraticCurveTo(x+side*48,top+46,x+side*(72+noise(i+side*11)*42),top+18);
    });
   }
   // Broken silhouettes, never identical square vertical bars.
   for(let b=0;b<3;b++){
    const dx=(noise(i*11+b*71+layer)-.5)*128,dy=noise(i*2+b*59)*40;
    ellipse(c,x+dx,top+dy,55+noise(i+b*8)*18,16+layer*4,
      [ '#153c44','#1b4749','#27545a'][layer]);
   }
   if(layer===2&&i%3===0){
    const glowX=x+30,glowY=top+30;
    ellipse(c,glowX,glowY,5,8,reduced?'rgba(147,219,207,.45)':
      'rgba(150,247,225,'+(.35+Math.sin(t*.025+i)*.12)+')');
   }
  }
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

function gardenArchitecture(c,zone,cam,t,W,H,p,reduced){
 const xScroll=cam.x||0;
 const base=H*.83-(cam.y||0)*.04;
 if(zone==='court'||zone==='maze'){
  const step=zone==='court'?490:330,par=.34,start=Math.floor((xScroll*par-200)/step);
  for(let i=start;i<=Math.ceil((xScroll*par+W+200)/step);i++){
   const x=i*step-xScroll*par,y=base+((i%2+2)%2)*24,high=zone==='maze'?220:310;
   line(c,p.stone,zone==='maze'?14:22,()=>{
    c.moveTo(x-110,y);c.bezierCurveTo(x-100,y-high,x+102,y-high,x+106,y);
   });
   line(c,'rgba(137,207,190,.25)',2,()=>{
    c.moveTo(x-99,y-8);c.bezierCurveTo(x-87,y-high+25,x+91,y-high+25,x+97,y-8);
   });
   if(zone==='court'){
    const ly=y-high*.72;
    line(c,'#638c80',1.5,()=>{c.moveTo(x,ly-40);c.lineTo(x,ly);});
    ellipse(c,x,ly+6,12,17,p.warm);
    ellipse(c,x,ly+4,24,26,'rgba(255,219,157,.09)');
   }else for(const side of[-1,1]){
    ellipse(c,x+side*124,y-64,68,66,p.foliage);
    ellipse(c,x+side*124,y-126,44,33,p.foliage);
   }
  }
 }
 if(zone==='crypt'){
  // Ancient roots descend naturally from a broken ceiling, leaving the middle navigable.
  for(let i=0;i<7;i++){
   const x=mod(i*273-xScroll*.2,W+220)-100,drop=125+noise(i*7)*140;
   line(c,'#263f44',14,()=>{c.moveTo(x,-28);c.bezierCurveTo(x-25,drop*.25,x+45,drop*.55,x,drop);});
   line(c,'#4a7970',2,()=>{c.moveTo(x+5,0);c.quadraticCurveTo(x+22,drop*.5,x,drop-8);});
   ellipse(c,x,drop-5,5,9,'rgba(157,226,210,.44)');
  }
  const a=c.createRadialGradient(W*.52,H*.62,12,W*.52,H*.62,W*.52);
  a.addColorStop(0,'rgba(76,150,160,.15)');a.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=a;c.fillRect(0,0,W,H);
 }
 if(zone==='gallery'){
  const gap=300,par=.25;
  for(let i=Math.floor((xScroll*par-120)/gap);i<=Math.ceil((xScroll*par+W+120)/gap);i++){
   const x=i*gap-xScroll*par,y=H*.55;
   line(c,'#6f6883',15,()=>{c.moveTo(x-70,y+70);c.lineTo(x-70,y-155);c.quadraticCurveTo(x,y-270,x+70,y-155);c.lineTo(x+70,y+70);});
   for(let k=0;k<3;k++)ellipse(c,x+(k-1)*19,y-130+(k%2)*16,16,48,['#8b9abe','#bda1c4','#efbeac'][k]);
   line(c,'rgba(255,241,215,.25)',2,()=>{c.moveTo(x-66,y-23);c.lineTo(x+66,y-23);});
  }
 }
 if(zone==='canopy'){
  // Hanging sky-islands do not pretend to be solid platforms.
  for(let i=-1;i<Math.ceil(W/310)+2;i++){
   const x=i*310-mod(xScroll*.18,310)+100,y=H*(.44+(i%3)*.09);
   line(c,'rgba(123,197,181,.4)',2,()=>{c.moveTo(x,-20);c.bezierCurveTo(x+17,y*.4,x-24,y*.65,x,y-16);});
   ellipse(c,x,y,95,17,'#3a6665');ellipse(c,x,y-15,82,14,'#60928a');
   for(let k=0;k<4;k++)ellipse(c,x+(k-2)*26,y-25,6,4,'rgba(185,239,215,.57)');
  }
 }
 if(zone==='arena'){
  for(let i=0;i<5;i++){
   const x=(i+1)*W/6,top=H*.3+(i%2)*35;
   line(c,'#57475f',25,()=>{c.moveTo(x,H);c.lineTo(x,top);});
   line(c,'#a37d92',3,()=>{c.moveTo(x-11,H);c.lineTo(x-11,top+25);});
   ellipse(c,x,top,25,8,'#a78b93');
   ellipse(c,x,top-26,9,13,p.warm);
  }
 }
 if(zone==='return'){
  // The first sunrise is earned, never shown in earlier chambers.
  const horizon=c.createLinearGradient(0,H*.36,0,H);
  horizon.addColorStop(0,'rgba(252,201,166,0)');
  horizon.addColorStop(1,'rgba(255,218,168,.15)');
  c.fillStyle=horizon;c.fillRect(0,H*.36,W,H*.64);
  for(let i=-1;i<6;i++){
   const x=i*250-mod(xScroll*.2,250),y=H*.73;
   line(c,'#6a6e70',9,()=>{c.moveTo(x,y);c.lineTo(x+120,y-78);c.lineTo(x+230,y);});
  }
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
  const pulse=reduced?1:1+Math.sin(t*.027+s.id*1.9)*.055;
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
 distantTrees(c,cam,t,W,H,p,reduced);
 gardenArchitecture(c,zone,cam,t,W,H,p,reduced);
 starlight(c,cam,t,W,H,p,reduced,lit);
 lanternAfterglow(c,g,cam,t,W,H,reduced);
 foregroundMist(c,cam,t,W,H,p,reduced);
 c.restore();return true;
}
