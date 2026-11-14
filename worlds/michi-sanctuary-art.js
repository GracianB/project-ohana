import {SANCTUARY_PALETTE as P,nearestSanctuaryPassage,passageReady,sanctuaryZone,sanctuaryGuardianDefeated} from '../systems/michi-sanctuary.js';
const TAU=Math.PI*2;
const oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const stroke=(c,col,w,fn)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();};
export function drawSanctuaryLantern(c,x,y,lit=false,t=0,small=false){
 const k=small?.6:1;c.save();c.translate(x,y);c.scale(k,k);stroke(c,P.stone,4,()=>{c.moveTo(0,-42);c.lineTo(0,-28);});c.fillStyle=lit?P.ivory:'#2b434b';c.strokeStyle=P.stone;c.lineWidth=3;c.beginPath();c.moveTo(-19,-27);c.quadraticCurveTo(0,-36,19,-27);c.lineTo(16,15);c.quadraticCurveTo(0,24,-16,15);c.closePath();c.fill();c.stroke();stroke(c,lit?P.coral:'#688c90',2,()=>{c.moveTo(-12,-25);c.lineTo(-10,13);c.moveTo(12,-25);c.lineTo(10,13);});oval(c,0,-4,lit?5:3,lit?9:5,lit?P.teal:'#46646c');if(lit){c.globalAlpha=.15;oval(c,0,-4,35,42,P.ivory);}c.restore();
}
export function drawMichiSanctuaryBackdrop(c,g,cam,t,W,H){
 const r=g.roomDef?.michiSanctuary;if(!r)return false;const z=sanctuaryZone(g),crypt=z?.id==='crypt',cleared=!!g.world1?.sealed;
 c.save();c.fillStyle=crypt?P.deep:cleared?'#284c4c':P.sky;c.fillRect(0,0,W,H);
 // One story moon, never repeated eclipses. The shadow recedes after the seal.
 if(!crypt){const x=W*.76-cam.x*.018,y=H*.2-cam.y*.025;oval(c,x,y,58,58,P.ivory);if(!cleared)oval(c,x+25,y-9,55,55,P.sky);}
 for(let i=0;i<34;i++){const x=((i*193-cam.x*.075)% (W+100)+W+100)%(W+100)-50,y=35+(i*71)%(Math.max(100,H*.65));c.globalAlpha=.12+(i%3)*.07;c.fillStyle=i%4?P.teal:P.ivory;c.fillRect(x,y,i%4?1.5:2.5,i%4?1.5:2.5);}c.globalAlpha=1;
 for(let layer=0;layer<3;layer++){const par=.08+layer*.09,spacing=220-layer*35;for(let i=Math.floor(cam.x*par/spacing)-1;i<Math.ceil((cam.x*par+W)/spacing)+1;i++){const x=i*spacing-cam.x*par,y=H*.88-cam.y*par;c.fillStyle=['#173d47','#20434a','#28505a'][layer];c.beginPath();c.moveTo(x-55,y+H);c.quadraticCurveTo(x-18,y-150,x-34,y-420);c.quadraticCurveTo(x-10,y-520,x+19,y-410);c.quadraticCurveTo(x+16,y-140,x+60,y+H);c.fill();stroke(c,layer===2?'#527578':'#2b5057',layer===2?3:2,()=>{c.moveTo(x,y-250);c.quadraticCurveTo(x-100,y-390,x-130,y-350);c.moveTo(x+2,y-200);c.quadraticCurveTo(x+80,y-380,x+140,y-310);});}}
 // Broken greenhouse arches frame the playable terraces; foliage is irregular
 // and anchored in depth rather than another wall of identical vertical bars.
 for(let i=-1;i<5;i++){const x=i*420-((cam.x*.22)%420),base=H+90-cam.y*.08,top=base-470-(i%2)*80;
  c.fillStyle='#18353d';c.beginPath();c.moveTo(x-28,base);c.bezierCurveTo(x+20,base-160,x-90,top+80,x-46,top-90);c.lineTo(x-18,top-75);c.bezierCurveTo(x-45,top+60,x+60,base-170,x+38,base);c.fill();
  for(let j=0;j<6;j++){const side=j%2?1:-1,yy=top+j*57;stroke(c,'#3c6263',2,()=>{c.moveTo(x-12,yy+65);c.quadraticCurveTo(x+side*80,yy-5,x+side*125,yy+9);});for(let k=0;k<3;k++)oval(c,x+side*(65+k*24),yy+k*7,20-k*3,7,P.stone);}
 }
 if(!crypt){const bx=W*.6-((cam.x*.12)%700),by=H*.8-cam.y*.06;c.strokeStyle='#42636a';c.lineWidth=16;c.beginPath();c.moveTo(bx-130,by);c.lineTo(bx-130,by-190);c.bezierCurveTo(bx-130,by-365,bx+130,by-365,bx+130,by-190);c.lineTo(bx+130,by-80);c.stroke();stroke(c,'#678780',2,()=>{c.moveTo(bx,by-315);c.lineTo(bx,by-180);c.moveTo(bx-80,by-230);c.lineTo(bx+80,by-230);});}
 if(crypt){c.fillStyle='#0d2530';c.beginPath();c.moveTo(0,0);for(let i=0;i<=12;i++)c.lineTo(i*W/12,55+(i%3)*27);c.lineTo(W,0);c.fill();}
 c.restore();return true;
}
export function drawMichiSanctuary(c,g,cam,t=0){
 if(!g.roomDef?.michiSanctuary)return;const W=g.viewW||1280,H=g.viewH||720,r=g.roomDef.michiSanctuary,near=nearestSanctuaryPassage(g);c.save();c.lineCap='round';
 // Masonry grows from actual colliders, including ceilings and underground floors.
 for(const p of g.platforms||[]){if(p.x+p.w<cam.x-80||p.x>cam.x+W+80||p.y>cam.y+H+120||p.y+p.h<cam.y-120)continue;const x=p.x-cam.x,y=p.y-cam.y;
  c.fillStyle=p.h>40?'#24434b':'#395b60';c.fillRect(x,y,p.w,p.h);c.fillStyle='#73978b';c.fillRect(x,y, p.w,4);c.fillStyle='#a2c5aa';for(let i=12;i<p.w;i+=44)c.fillRect(x+i,y-3,14,3);
  if(p.h>40){c.strokeStyle='#45636a';c.lineWidth=1;for(let i=0;i<Math.min(24,p.w/65);i++){const bx=x+i*65;stroke(c,'#34525c',1,()=>{c.moveTo(bx,y+20);c.lineTo(bx+30,y+20);c.lineTo(bx+36,y+44);});}}
 }
 for(const a of r.passages){const x=a.x-cam.x,y=a.floor-cam.y;if(x<-100||x>W+100||y<-80||y>H+150)continue;const ready=passageReady(g,a);c.fillStyle=P.stone;c.beginPath();c.moveTo(x-43,y);c.lineTo(x-43,y-59);c.bezierCurveTo(x-43,y-118,x+43,y-118,x+43,y-59);c.lineTo(x+43,y);c.fill();c.fillStyle=P.deep;c.beginPath();c.moveTo(x-28,y);c.lineTo(x-28,y-60);c.bezierCurveTo(x-28,y-98,x+28,y-98,x+28,y-60);c.lineTo(x+28,y);c.fill();
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
