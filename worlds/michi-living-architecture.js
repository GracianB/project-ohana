// Authored Canvas elements, anchored independently in world space.
// Decorative depth never creates a collider. Earned light opens the conservatory.
const TAU=Math.PI*2;
const hash=n=>{const x=Math.sin(n*91.7+14)*43758.5;return x-Math.floor(x);};
const line=(c,color,w,fn)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();fn();c.stroke();};
const oval=(c,x,y,a,b,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,a,b,0,0,TAU);c.fill();};
function leaf(c,x,y,r,a,color){
 c.save();c.translate(x,y);c.rotate(a);c.fillStyle=color;c.beginPath();
 c.moveTo(-r,0);c.bezierCurveTo(-r*.4,-r*.68,r*.55,-r*.4,r,0);
 c.bezierCurveTo(r*.25,r*.48,-r*.55,r*.5,-r,0);c.fill();c.restore();
}
function arch(c,x,y,w,h,color,weight){
 line(c,color,weight,()=>{c.moveTo(x-w/2,y);c.lineTo(x-w/2,y-h*.6);c.bezierCurveTo(x-w/2,y-h*1.15,x+w/2,y-h*1.15,x+w/2,y-h*.6);c.lineTo(x+w/2,y);});
}
function flower(c,x,y,r,color){
 for(let k=0;k<5;k++){const a=k*TAU/5;oval(c,x+Math.cos(a)*r*.52,y+Math.sin(a)*r*.52,r*.43,r*.34,color);}
 oval(c,x,y,r*.22,r*.22,'#ffe5b0');
}
function vine(c,x,y,length,t,seed,energy){
 const sway=Math.sin(t*.017+seed)*8;
 line(c,'#4f877b',2,()=>{c.moveTo(x,y);c.bezierCurveTo(x-22+sway,y+length*.35,x+26+sway,y+length*.7,x+sway,y+length);});
 for(let j=0;j<6;j++){
  const yy=y+length*(j+.6)/6,xx=x+Math.sin(j*.9)*9+sway*(j+1)/6;
  leaf(c,xx,yy,9+j%3*2,(j%2?1:-1)*.7,j%2?'#72a891':'#528776');
  if(j%2===0)flower(c,xx+8,yy+5,3.3+energy*1.4,energy>.5?'#e8bfd7':'#9a9bbd');
 }
}
function paintWindow(c,x,y,w,h,energy,t,seed){
 const glass=c.createLinearGradient(x-w/2,y-h,x+w/2,y);
 glass.addColorStop(0,'#52779455');glass.addColorStop(.55,'#b197b04d');glass.addColorStop(1,'#93c0b626');
 c.fillStyle=glass;c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x-w/2,y-h*.6);c.bezierCurveTo(x-w/2,y-h*1.15,x+w/2,y-h*1.15,x+w/2,y-h*.6);c.lineTo(x+w/2,y);c.fill();
 arch(c,x,y,w,h,'#385b68',9);arch(c,x,y,w-10,h-4,'#a49d88',1.5);
 const bloom=y-h*.48,opening=.55+energy*.45;
 for(let k=0;k<6;k++)leaf(c,x,bloom,w*.30*opening,k*TAU/6+Math.sin(t*.005+seed)*.025,['#b29ab788','#84c3bd88','#d5bc8b77'][k%3]);
 oval(c,x,bloom,5,5,'#e6d5aa');
 line(c,'#78918a',1.2,()=>{c.moveTo(x,y-h*.89);c.lineTo(x,y);for(let j=1;j<4;j++){c.moveTo(x-w*.44,y-j*h*.18);c.lineTo(x+w*.44,y-j*h*.18);}});
}
// Each glass panel is an independent generated vector object. Earned-light state
// changes its key; at most twelve panels are retained, with no image downloads.
const glassPanels=new Map();
function window(c,x,y,w,h,energy,t,seed){
 if(typeof OffscreenCanvas==='undefined'){paintWindow(c,x,y,w,h,energy,t,seed);return;}
 const key=[w,h,Math.round(energy*5)].join(':');let panel=glassPanels.get(key);
 if(!panel){panel=new OffscreenCanvas(Math.ceil(w)+24,Math.ceil(h)+24);const q=panel.getContext('2d');q.translate(w/2+12,h+12);paintWindow(q,0,0,w,h,energy,0,0);if(glassPanels.size>=12)glassPanels.delete(glassPanels.keys().next().value);glassPanels.set(key,panel);}
 c.drawImage(panel,x-w/2-12,y-h-12);
}
function conservatory(c,x,y,s,energy,t){
 c.save();c.translate(x,y);c.scale(s,s);
 // Copper dome ribs and individually opening glass petals.
 c.fillStyle='#183c4b';c.fillRect(-198,-138,396,144);
 for(let k=-2;k<=2;k++)window(c,k*70,-6,58,133,energy,t,k);
 c.fillStyle='#3f666a';c.beginPath();c.moveTo(-226,-146);c.bezierCurveTo(-164,-151,-123,-272,0,-275);c.bezierCurveTo(119,-271,166,-152,226,-146);c.quadraticCurveTo(0,-118,-226,-146);c.fill();
 const dome=c.createLinearGradient(0,-275,0,-130);dome.addColorStop(0,'#7fb3ae44');dome.addColorStop(1,'#193f5088');c.fillStyle=dome;c.fill();
 for(let k=-2;k<=2;k++)line(c,'#b0a686',2,()=>{c.moveTo(0,-274);c.quadraticCurveTo(k*52,-230,k*90,-143);});
 line(c,'#a9a88c',2,()=>{c.moveTo(-211,-160);c.quadraticCurveTo(0,-132,211,-160);c.moveTo(-167,-205);c.quadraticCurveTo(0,-180,167,-205);c.moveTo(0,-275);c.lineTo(0,-300);});
 oval(c,0,-302,4,7,'#e1c496');
 for(const side of[-1,1]){
  c.fillStyle='#6f8b83';c.fillRect(side*201-5,-149,10,155);vine(c,side*198,-144,139,t,side*7,energy);
  for(let j=0;j<7;j++){const xx=side*(128+j*11),yy=-181+j*8;leaf(c,xx,yy,15,side*.4,'#719c8f');flower(c,xx+side*6,yy-8,5,j%2?'#b89fbd':'#ddb4be');}
 }
 line(c,'#547579',3,()=>{c.moveTo(-188,-130);c.lineTo(188,-130);c.moveTo(-188,-51);c.lineTo(188,-51);});
 for(let j=-2;j<=2;j++){c.fillStyle='#77958a';c.fillRect(j*70-4,-139,8,144);oval(c,j*70,-142,8,3,'#b8b298');}

 c.fillStyle='#607e7b';c.fillRect(-214,5,428,9);c.restore();
}
function rootVault(c,x,y,s,t,energy){
 c.save();c.translate(x,y);c.scale(s,s);
 for(const side of[-1,1]){
  line(c,'#203c49',38,()=>{c.moveTo(side*208,-590);c.bezierCurveTo(side*104,-490,side*222,-357,side*20,-253);});
  line(c,'#406567',3,()=>{c.moveTo(side*203,-570);c.bezierCurveTo(side*120,-474,side*209,-351,side*20,-253);});
  line(c,'#294a51',28,()=>{c.moveTo(side*150,50);c.bezierCurveTo(side*112,-80,side*176,-181,side*20,-253);});
  line(c,'#628276',3,()=>{c.moveTo(side*155,40);c.bezierCurveTo(side*128,-84,side*159,-173,side*22,-244);});
  for(let k=0;k<3;k++)line(c,'#31595a',4-k,()=>{c.moveTo(side*136,-70-k*38);c.quadraticCurveTo(side*74,-90-k*49,side*(40+k*17),-154-k*34);});
 }
 arch(c,0,20,190,210,'#3d6265',8);arch(c,0,20,172,200,'#7c9b87',1);
 for(let k=-2;k<=2;k++){
  const xx=k*44,yy=20+hash(k+50)*21,hh=18+hash(k)*22;
  line(c,'#80b7aa',2,()=>{c.moveTo(xx,yy);c.quadraticCurveTo(xx+7,yy-hh*.5,xx+4,yy-hh);});
  oval(c,xx+4,yy-hh,15,6,k%2?'#72c4c1':'#aaa6d0');
  line(c,'#c2edd3',1,()=>{c.moveTo(xx-8,yy-hh);c.quadraticCurveTo(xx+4,yy-hh-7,xx+15,yy-hh);});
  oval(c,xx+4,yy-hh-2,2,2,'#f4e9c6');
 }
 vine(c,42,-245,100,t,8,energy);c.restore();
}
function fountain(c,x,y,energy,t){
 for(let k=0;k<3;k++){oval(c,x,y-k*28,66-k*18,8,'#517a7c');oval(c,x,y-k*28-2,57-k*18,4,'#9ac7b5');}
 for(const side of[-1,1])line(c,'#a4dad194',1.5,()=>{c.moveTo(x,y-63);c.quadraticCurveTo(x+side*35,y-114-energy*17,x+side*44,y-37);});
 for(let i=0;i<4;i++){
  const f=((t*.012+i*.25)%1+1)%1;
  oval(c,x+(i%2?1:-1)*(18+f*24),y-71+f*33,1.3,2.4,'#c4e4d1');
 }
}
export function drawMichiArchitecture(c,zone,cam,t,W,H,p,energy=0){
 const par=zone==='crypt'?.24:.30,cx=(cam.x||0)*par,cy=(cam.y||0)*.10;
 const gap=zone==='gallery'?390:zone==='crypt'?460:zone==='court'?930:720;
 const first=Math.floor((cx-300)/gap),last=Math.ceil((cx+W+300)/gap);
 const scale=Math.min(1.08,Math.max(.65,H/900)),base=H*.72-cy;
 c.save();c.lineCap='round';
 for(let i=first;i<=last;i++){
  const x=i*gap-cx;if(x< -500||x>W+330)continue;
  if(zone==='court'){conservatory(c,x,base,scale*(.58+hash(i+31)*.10),energy,t);fountain(c,x+380,base+70,energy,t);arch(c,x+380,base+10,200,194,'#719c96',5);vine(c,x+320,base-156,136,t,i,energy);vine(c,x+439,base-156,102,t,i+3,energy);}
  else if(zone==='crypt')rootVault(c,x,base,scale,t,energy);
  else if(zone==='gallery'||zone==='arena'){
   const ww=zone==='arena'?200:143,hh=zone==='arena'?360:285;
   window(c,x,base,ww,hh,energy,t,i);
   for(const side of[-1,1]){line(c,p.stone,18,()=>{c.moveTo(x+side*(ww/2+27),base+55);c.lineTo(x+side*(ww/2+27),base-hh*.9);});vine(c,x+side*(ww/2+27),base-hh*.88,hh*.55,t,i+side,energy);}
   if(zone==='arena')for(const side of[-1,1])leaf(c,x+side*43,base-hh*.55,70,side*.6,'#c0a6b533');
  }else if(zone==='maze'){
   arch(c,x,base,260,255,'#345562',17);arch(c,x,base,241,248,'#76958d',2);
   for(const side of[-1,1])for(let k=0;k<5;k++)leaf(c,x+side*(100+k%2*21),base-25-k*38,36,side*(.25+k*.08),'#366c67');
   vine(c,x,base-240,118,t,i,energy);
  }else if(zone==='canopy'){
   const yy=H*(.36+hash(i+7)*.25)-cy;
   for(const side of[-1,1])line(c,'#648f8b',1.5,()=>{c.moveTo(x+side*64,-20);c.lineTo(x+side*45,yy);});
   c.fillStyle='#345762';c.beginPath();c.moveTo(x-85,yy);c.quadraticCurveTo(x,yy+90,x+85,yy);c.fill();
   oval(c,x,yy,85,11,'#79a99c');
   for(let k=-2;k<=2;k++){leaf(c,x+k*24,yy-13,28,k*.4,'#87bba0');vine(c,x+k*26,yy,60+hash(k+i)*80,t,i+k,energy);}
  }else if(zone==='return'){
   line(c,'#668484',5,()=>{c.moveTo(x-180,base+10);c.quadraticCurveTo(x,base+95,x+180,base+10);});
   c.fillStyle='#355563';c.beginPath();c.moveTo(x-65,base+33);c.quadraticCurveTo(x,base+90,x+68,base+31);c.fill();
   line(c,'#b5b599',3,()=>{c.moveTo(x,base+40);c.lineTo(x,base-90);});
   c.fillStyle='#c4c7b1';c.beginPath();c.moveTo(x+5,base-88);c.quadraticCurveTo(x+64+Math.sin(t*.014)*7,base-35,x+52,base+19);c.lineTo(x+5,base+22);c.fill();
  }
 }
 c.restore();
}
export function drawMichiWater(c,g,cam,t,W,H,zone,energy=0){
 const surface=H*.77-(cam.y||0)*.035;
 if(surface>H+80)return;
 c.save();
 const water=c.createLinearGradient(0,surface,0,H);water.addColorStop(0,zone==='crypt'?'#417a8533':'#8bbdbb33');water.addColorStop(1,'#071f3899');c.fillStyle=water;c.fillRect(0,surface,W,H-surface);
 const rowCount=10,spacing=110;
 for(let row=0;row<rowCount;row++){
  const yy=surface+7+row*row*2.2;
  if(yy>H)break;
  const speed=.08+row*.008,offset=(cam.x||0)*speed,first=Math.floor((offset-50)/spacing),last=Math.ceil((offset+W)/spacing);
  for(let i=first;i<=last;i++){
   const x=i*spacing-offset+Math.sin(t*.016+i+row)*7,span=17+hash(i+row*31)*49;
   line(c,i%3===0?'#ddcaa73d':'#91c7c533',1,()=>{c.moveTo(x,yy);c.quadraticCurveTo(x+span*.5,yy-2,x+span,yy);});
  }
 }
 // Ripples follow actual grounded movement; no timers, gameplay writes or image strip.
 const hero=g.player;
 if(hero&&Math.abs(hero.vx||0)>.3&&hero.grounded&&Math.abs(hero.y+hero.h-(cam.y||0)-surface)<70){
  const x=hero.x+hero.w/2-(cam.x||0),y=hero.y+hero.h-(cam.y||0)+9;
  for(let i=0;i<3;i++){const f=((t*.025+i/3)%1+1)%1;c.globalAlpha=(1-f)*.24;c.strokeStyle='#c3e2ca';c.lineWidth=1;c.beginPath();c.ellipse(x,y,9+f*36,2+f*6,0,0,TAU);c.stroke();}
 }
 c.restore();
}
export function drawMichiNearGrowth(c,g,cam,t,W,H){
 const hero=g.player||{},px=(hero.x||0)+(hero.w||0)/2,py=(hero.y||0)+(hero.h||0),time=g.reduceMotion?0:t;
 c.save();
 for(const platform of g.platforms||[]){
  if(platform.w<80||platform.y-(cam.y||0)<-30||platform.y-(cam.y||0)>H+80)continue;
  const start=Math.max(0,Math.floor(((cam.x||0)-platform.x-40)/192));
  const end=Math.min(Math.floor(platform.w/192),Math.ceil(((cam.x||0)+W-platform.x+40)/192));
  for(let i=start;i<end;i++){
   const wx=platform.x+i*192+47,x=wx-(cam.x||0),y=platform.y-(cam.y||0);
   const near=Math.max(0,1-Math.hypot(px-wx,py-platform.y)/155);
   const sway=Math.sin(time*.024+i)*3+near*Math.max(-1,Math.min(1,(hero.vx||0)/5))*7;
   line(c,'#578c81',1.5,()=>{c.moveTo(x,y);c.quadraticCurveTo(x-7+sway,y-19,x+sway,y-35-near*6);});
   leaf(c,x-5+sway*.5,y-15,10,-.45,'#7eae91');leaf(c,x+6+sway*.5,y-23,8,.6,'#9ec1a4');
   flower(c,x+sway,y-35-near*6,4.5+near*1.3,near>.1?'#f4c9dd':'#b2a3c0');
   if(near>.1)oval(c,x+sway,y-35-near*6,9,9,'rgba(255,220,179,'+(near*.13)+')');
  }
 }
 c.restore();
}
