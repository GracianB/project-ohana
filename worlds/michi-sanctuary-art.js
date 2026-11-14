import {drawMichiLivingBackdrop} from './michi-living-backdrop.js';
import {SANCTUARY_PALETTE as P,nearestSanctuaryPassage,passageReady,sanctuaryZone,sanctuaryGuardianDefeated} from '../systems/michi-sanctuary.js';
const TAU=Math.PI*2;
const oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const stroke=(c,col,w,fn)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();};
export function drawSanctuaryLantern(c,x,y,lit=false,t=0,small=false){
 const k=small?.6:1;c.save();c.translate(x,y);c.scale(k,k);
 const reduced=!!(globalThis?.OHANA_REDUCED_MOTION); // visual hint only; progression is untouched
 stroke(c,'#54777c',3,()=>{c.moveTo(0,-45);c.quadraticCurveTo(-6,-36,0,-28);});
 // Finial, copper ribs and faceted handmade glass.
 c.fillStyle='#53767a';c.beginPath();c.moveTo(-20,-27);c.lineTo(0,-39);c.lineTo(20,-27);c.closePath();c.fill();
 c.fillStyle=lit?'#ffe2ad':'#263e47';c.beginPath();c.moveTo(-19,-27);c.lineTo(19,-27);c.lineTo(15,18);c.quadraticCurveTo(0,27,-15,18);c.closePath();c.fill();
 if(lit){
  const glow=c.createRadialGradient(0,-5,3,0,-5,51);
  glow.addColorStop(0,'rgba(255,238,177,.37)');
  glow.addColorStop(.52,'rgba(255,210,148,.10)');
  glow.addColorStop(1,'rgba(255,210,148,0)');
  c.fillStyle=glow;c.beginPath();c.arc(0,-5,51,0,TAU);c.fill();
 }
 stroke(c,lit?'#d59f78':'#688c90',2.3,()=>{
  c.moveTo(-19,-27);c.lineTo(-15,18);c.quadraticCurveTo(0,26,15,18);c.lineTo(19,-27);
  c.moveTo(0,-34);c.lineTo(0,22);
 });
 oval(c,0,-4,lit?5:3,lit?10:6,lit?'#fff5cd':'#53767c');
 if(lit&&!reduced){c.globalAlpha=.6;oval(c,0,-13+Math.sin(t*.04)*2,2.5,4,'#fff9df');c.globalAlpha=1;}
 oval(c,0,23,7,3,'#8c756a');c.restore();
}
// The living scenery is independent from colliders and chapter objectives.
export function drawMichiSanctuaryBackdrop(c,g,cam,t,W,H){
 return drawMichiLivingBackdrop(c,g,cam,t,W,H);
}
export function drawMichiSanctuary(c,g,cam,t=0){
 if(!g.roomDef?.michiSanctuary)return;const W=g.viewW||1280,H=g.viewH||720,r=g.roomDef.michiSanctuary,near=nearestSanctuaryPassage(g);c.save();c.lineCap='round';
 // Masonry grows from actual colliders, including ceilings and underground floors.
 for(const p of g.platforms||[]){if(p.x+p.w<cam.x-80||p.x>cam.x+W+80||p.y>cam.y+H+120||p.y+p.h<cam.y-120)continue;const x=p.x-cam.x,y=p.y-cam.y;
  c.fillStyle=p.h>40?'#24434b':'#395b60';c.fillRect(x,y,p.w,p.h);c.fillStyle='#73978b';c.fillRect(x,y, p.w,4);c.fillStyle='#a2c5aa';for(let i=12;i<p.w;i+=44)c.fillRect(x+i,y-3,14,3);
  if(p.h>40){c.strokeStyle='#45636a';c.lineWidth=1;for(let i=0;i<Math.min(24,p.w/65);i++){const bx=x+i*65;stroke(c,'#34525c',1,()=>{c.moveTo(bx,y+20);c.lineTo(bx+30,y+20);c.lineTo(bx+36,y+44);});}}
 }
 const playerX=(g.player?.x||0)+(g.player?.w||0)*.5-cam.x;
 const playerY=(g.player?.y||0)+(g.player?.h||0)*.5-cam.y;
 for(const a of r.passages){
  const x=a.x-cam.x,y=a.floor-cam.y;
  if(x<-120||x>W+120||y<-90||y>H+170)continue;
  const ready=passageReady(g,a);
  const nearby=Math.hypot(x-playerX,(y-45)-playerY)<235;
  // The passage itself stays readable from afar; words appear only when useful.
  c.fillStyle='#203944';c.beginPath();c.moveTo(x-46,y);c.lineTo(x-46,y-60);
  c.bezierCurveTo(x-46,y-123,x+46,y-123,x+46,y-60);c.lineTo(x+46,y);c.fill();
  c.fillStyle=ready?'#142d35':'#152c38';c.beginPath();c.moveTo(x-29,y);
  c.lineTo(x-29,y-62);c.bezierCurveTo(x-29,y-98,x+29,y-98,x+29,y-62);
  c.lineTo(x+29,y);c.fill();
  stroke(c,ready?'#b3e0cc':'#657b7b',3,()=>{
   c.moveTo(x-38,y-5);c.lineTo(x-38,y-62);
   c.bezierCurveTo(x-38,y-106,x+38,y-106,x+38,y-62);c.lineTo(x+38,y-5);
  });
  // A single readable icon replaces distant repetitive signage.
  drawSanctuaryLantern(c,x,y-100,ready,t,true);
  if(nearby){
   const text=a.label,tagW=Math.min(W-24,Math.max(118,Math.min(266,text.length*7.1+24)));
   c.fillStyle='rgba(8,29,39,.91)';c.fillRect(x-tagW/2,y-166,tagW,31);
   c.fillStyle=ready?'#f9e9cc':'#c3cdc7';c.textAlign='center';
   c.font='600 12px sans-serif';c.fillText(text,x,y-145,tagW-10);
   c.font='11px sans-serif';c.fillStyle=ready?'#b6eedc':'#f4c6ae';
   c.fillText(ready?'↓ / E para entrar':a.exit?'Necesitas el sello y 3 ecos':a.need+' faroles',x,y-126);
  }
 }
 for(const s of g.world1?.stations||[]){
  if(s.x<cam.x-150||s.x>cam.x+W+150||s.y<cam.y-160||s.y>cam.y+H+120)continue;
  const x=s.x-cam.x,y=s.y-cam.y;
  stroke(c,'#688b86',3,()=>{c.moveTo(x,y-74);c.quadraticCurveTo(x-20,y-150,x+30,y-176);});
  drawSanctuaryLantern(c,x,y-14,s.done,t);
  const close=Math.hypot(x-playerX,y-30-playerY)<240;
  if(close&&!s.done){
   const tw=Math.min(235,W-24);
   c.fillStyle='rgba(8,30,39,.89)';c.fillRect(x-tw/2,y-107,tw,28);
   c.fillStyle='#fff0cf';c.font='600 12px sans-serif';c.textAlign='center';c.fillText(s.name,x,y-88,tw-16);
  }
  if(s.done){c.fillStyle='#65998b';c.fillRect(x-45,y+25,90,5);}
 }
 if(g.expedition?.done&&(g.world1?.sealed||sanctuaryGuardianDefeated(g)))for(const n of g.roomDef.expedition.nodes){if(g.expedition.done.includes(n.id))continue;const x=n.x-cam.x,y=n.y-cam.y;drawSanctuaryLantern(c,x,y,true,t);c.fillStyle=P.ivory;c.font='11px sans-serif';c.textAlign='center';c.fillText('Eco del hogar',x,y-56);}
 const zone=sanctuaryZone(g);
 if(zone&&W>800){
  // Quiet level identification, tucked below the central safe area.
  const title=zone.name,cardW=Math.min(285,title.length*7+40);
  c.fillStyle='rgba(7,29,40,.73)';c.fillRect(W/2-cardW/2,14,cardW,26);
  c.fillStyle='#d9f0e3';c.textAlign='center';c.font='600 12px sans-serif';
  c.fillText(title,W/2,32,cardW-18);
 }
 if(near){
  const w=Math.min(380,W-28),y=H-(W<720?160:101);
  c.fillStyle='rgba(6,28,37,.9)';c.fillRect((W-w)/2,y,w,40);
  c.fillStyle=passageReady(g,near)?'#dbf5df':'#f7c7ad';
  c.textAlign='center';c.font='600 13px sans-serif';
  c.fillText(passageReady(g,near)?'↓ / E  ·  '+near.label:
    near.exit?'Consigue el sello y tres ecos':'Faroles pendientes · '+near.need,W/2,y+25,w-22);
 }
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
