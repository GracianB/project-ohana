// OHANA V462 · Michicornio anatomy kit: two-bone cat legs with toe beans,
// tapered tails with follow-through, fairy wings and an expressive cat mouth.
// Pure Canvas 2D: no gradients, no RNG, deterministic from the pose clock.
import {ribbon} from './michi-jelly.js';
const TAU=Math.PI*2;

// Two-bone IK: hip → knee → paw. `bend` = +1 knee forward, -1 hock backward.
export function legJoint(hip,paw,upper,lower,bend=1){
 const dx=paw[0]-hip[0],dy=paw[1]-hip[1],d=Math.max(1e-3,Math.min(upper+lower-.01,Math.hypot(dx,dy)));
 const a=Math.atan2(dy,dx),cos=(upper*upper+d*d-lower*lower)/(2*upper*d);
 const k=a-bend*Math.acos(Math.max(-1,Math.min(1,cos)));
 return [hip[0]+Math.cos(k)*upper,hip[1]+Math.sin(k)*upper];
}
export function drawCatLeg(ctx,o){
 const {hip,paw,upper=10,lower=10,bend=1,width=8,fur,dark,ink='#25213e',pad='#f4a6c4',beans=true,lift=0,claws=false,toe='#fff7fb',pawS=1}=o;
 const knee=legJoint(hip,paw,upper,lower,bend);
 const pts=[hip,[(hip[0]+knee[0])/2,(hip[1]+knee[1])/2],knee,[(knee[0]+paw[0])/2,(knee[1]+paw[1])/2],paw];
 const ws=[width*.98,width*.88,width*.72,width*.56,width*.48];
 ribbon(ctx,pts,ws,fur,ink,1.8);
 if(dark){ctx.save();ctx.globalAlpha=.35;ribbon(ctx,pts.map(p=>[p[0]-width*.18,p[1]]),ws.map(w=>w*.4),dark,null);ctx.restore();}
 // Paw: rounded mitten; when lifted it tilts and shows the pink beans.
 ctx.save();ctx.translate(paw[0],paw[1]);ctx.rotate(-lift*.9);const footScale=Math.max(.8,Math.min(1.08,pawS));ctx.scale(footScale,footScale);
 ctx.beginPath();ctx.ellipse(1,0,width*.65,width*.43,0,0,TAU);ctx.fillStyle=toe;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=1.6;ctx.stroke();
 ctx.strokeStyle=ink;ctx.lineWidth=.9;ctx.globalAlpha=.7;
 for(const tx of [-.16,.25]){ctx.beginPath();ctx.moveTo(tx*width,-width*.24);ctx.quadraticCurveTo(tx*width+.7,-width*.14,tx*width+.5,-width*.04);ctx.stroke();}
 ctx.globalAlpha=1;
 if(beans&&lift>.25){ctx.fillStyle=pad;ctx.globalAlpha=Math.min(1,(lift-.25)*2.5);
  ctx.beginPath();ctx.ellipse(1,width*.12,width*.26,width*.18,0,0,TAU);ctx.fill();
  for(const tx of [-.35,0,.35]){ctx.beginPath();ctx.arc(1+tx*width,-width*.18,width*.1,0,TAU);ctx.fill();}}
 if(claws){ctx.globalAlpha=1;ctx.strokeStyle='#fff6e0';ctx.lineWidth=1.3;
  for(const tx of [-.35,0,.35]){ctx.beginPath();ctx.moveTo(width*.7,tx*width*.6);ctx.lineTo(width*1.05,tx*width*.6+1.2);ctx.stroke();}}
 ctx.restore();
 return knee;
}

// V462 polish · hind leg with a real haunch: a rounded thigh mass on the body side,
// a digitigrade shin (hock bends backward) and a large readable paw that plants on
// the ground line. Bone lengths adapt to the hip→paw distance so the foot never
// floats or stretches; at small sizes the paw scale keeps toes and beans legible.
export function drawCatHaunch(ctx,o){
 const {hip,paw,thigh=9,width=8,fur,dark,ink='#25213e',lift=0,toe,pad,claws=false,pawS=1.15,side=1}=o;
 const knee0=[hip[0]+side*thigh*.15,hip[1]+thigh*.45];
 const d=Math.hypot(paw[0]-knee0[0],paw[1]-knee0[1]),bone=Math.max(4,d*.56);
 ctx.save();ctx.beginPath();ctx.ellipse(hip[0],hip[1],thigh*.86,thigh,side*-.25,0,TAU);ctx.fillStyle=fur;ctx.fill();
 ctx.strokeStyle=ink;ctx.lineWidth=1.8;ctx.stroke();
 if(dark){ctx.globalAlpha=.35;ctx.beginPath();ctx.ellipse(hip[0]-side*thigh*.3,hip[1]+thigh*.25,thigh*.45,thigh*.6,0,0,TAU);ctx.fillStyle=dark;ctx.fill();}
 ctx.restore();
 return drawCatLeg(ctx,{hip:knee0,paw,upper:bone,lower:bone,bend:side>0?-1:1,width,fur,dark:null,ink,lift,toe,pad,claws,pawS});
}

// Cat tail: root fixed, S-curve that lags behind the body, fluffy tip.
export function tailPoints(o){
 const {x,y,len=40,t=0,still=false,swish=1,lag=0,curl=.6,dir=-2.2,segs=12,phase=0,speed=1}=o;
 const pts=[];let a=dir,px=x,py=y;const step=len/segs;
 for(let k=0;k<=segs;k++){
  pts.push([px,py]);const s=k/segs;
  const w=still?Math.sin(phase+s*1.5)*.08:Math.sin(t*.06*speed-s*3.1+phase)*.32*swish*(.3+s);
  a+=(curl*.11+w*.35+lag*.06*s);
  px+=Math.cos(a)*step;py+=Math.sin(a)*step;
 }
 return pts;
}
export function drawCatTail(ctx,o){
 const pts=tailPoints(o),n=pts.length,{root=9,tip=4,fur,dark,ink='#25213e',tipColor,fluff=true}=o;
 const ws=pts.map((_,i)=>root+(tip-root)*(i/(n-1)));
 ribbon(ctx,pts,ws,fur,ink,2);
 if(dark){ctx.save();ctx.globalAlpha=.4;ribbon(ctx,pts.slice(Math.floor(n*.55)),ws.slice(Math.floor(n*.55)).map(w=>w*.9),dark,null);ctx.restore();}
 const e=pts[n-1],b=pts[n-3];
 if(fluff){const ang=Math.atan2(e[1]-b[1],e[0]-b[0]);ctx.save();ctx.translate(e[0],e[1]);ctx.rotate(ang);
  ctx.beginPath();ctx.moveTo(-tip*1.4,-tip*.9);ctx.quadraticCurveTo(tip*1.8,-tip*1.6,tip*2.2,0);ctx.quadraticCurveTo(tip*1.8,tip*1.6,-tip*1.4,tip*.9);ctx.closePath();
  ctx.fillStyle=tipColor||fur;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();}
 return e;
}

// Fairy wing: one translucent lobe with veins, iridescent rim and moon eye-spot.
export function drawFairyWing(ctx,o){
 const {x,y,side=1,size=30,open=1,flap=0,fill,rim,vein,spot,alpha=.62,lower=false,ink='#4a3d6e',accent,outline=null,glow=null}=o;
 ctx.save();ctx.translate(x,y);ctx.scale(side*(.3+.7*open)*(1-Math.abs(flap)*.3),1);ctx.rotate((lower?.38:-.18)+flap*(lower?.3:.5));
 const L=size*(lower?.66:1),W=size*(lower?.5:.62);
 const path=(k=1)=>{ctx.beginPath();ctx.moveTo(0,0);
  if(lower){ctx.bezierCurveTo(L*.35*k,W*.05*k,L*.78*k,W*.42*k,L*.72*k,W*1.02*k);ctx.bezierCurveTo(L*.45*k,W*.98*k,L*.14*k,W*.42*k,0,0);}
  else{ctx.bezierCurveTo(L*.12*k,-W*.9*k,L*.55*k,-W*1.5*k,L*k,-W*1.38*k);ctx.bezierCurveTo(L*.92*k,-W*.66*k,L*.62*k,-W*.02*k,0,0);}
  ctx.closePath();};
 // V462 polish: optional flat glow rim + dark silhouette outline so the wing reads at
 // portrait size (no gradients: two solid strokes under the fill).
 if(glow){path(1.06);ctx.globalAlpha=.32;ctx.strokeStyle=glow;ctx.lineWidth=7;ctx.lineJoin='round';ctx.stroke();}
 if(outline){path();ctx.globalAlpha=1;ctx.strokeStyle=outline;ctx.lineWidth=4.2;ctx.lineJoin='round';ctx.stroke();}
 path();ctx.globalAlpha=alpha;ctx.fillStyle=fill;ctx.fill();
 path(.68);ctx.globalAlpha=.32;ctx.fillStyle='#ffffff';ctx.fill();
 path();ctx.globalAlpha=.9;ctx.strokeStyle=accent||rim;ctx.lineWidth=2.6;ctx.stroke();
 ctx.globalAlpha=.95;ctx.strokeStyle=rim;ctx.lineWidth=1.1;ctx.stroke();
 ctx.globalAlpha=.45;ctx.strokeStyle=vein;ctx.lineWidth=.9;
 for(let k=0;k<4;k++){const u=(k+1)/5;ctx.beginPath();ctx.moveTo(0,0);
  if(lower)ctx.quadraticCurveTo(L*(.25+u*.3),W*u*.25,L*(.35+u*.38),W*(.25+u*.7));
  else ctx.quadraticCurveTo(L*(.3+u*.25),-W*(.95-u*.4),L*(.5+u*.48),-W*(1.32-u*.7));ctx.stroke();}
 if(!lower&&spot){ctx.globalAlpha=.9;ctx.fillStyle=spot;ctx.beginPath();ctx.arc(L*.7,-W*.98,W*.19,0,TAU);ctx.fill();
  ctx.fillStyle=fill;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(L*.75,-W*1.04,W*.15,0,TAU);ctx.fill();}
 ctx.restore();
}

// Expressive cat mouth: "ω" at rest, open with tongue and fangs when the jaw opens.
export function drawCatMouth(ctx,o){
 const {x=0,y=0,s=1,open=0,ink='#25213e',nose='#f29ab8',inside='#5a1f3a',tongue='#ff8fb3',fangs=true,smile=0}=o;
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';ctx.lineJoin='round';
 // Nose: soft rounded triangle with a highlight.
 ctx.beginPath();ctx.moveTo(-3.6,-3);ctx.quadraticCurveTo(0,-4.8,3.6,-3);ctx.quadraticCurveTo(1.2,.6,0,.9);ctx.quadraticCurveTo(-1.2,.6,-3.6,-3);ctx.closePath();
 ctx.fillStyle=nose;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=1.2;ctx.stroke();
 ctx.fillStyle='#fff';ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(-1,-2.8,1.1,.6,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
 const o2=Math.max(0,Math.min(1,open));
 if(o2>.08){
  const h=2+o2*7;
  ctx.beginPath();ctx.moveTo(-6,2.2);ctx.quadraticCurveTo(0,1.2,6,2.2);ctx.quadraticCurveTo(4,2.2+h,0,2.6+h);ctx.quadraticCurveTo(-4,2.2+h,-6,2.2);ctx.closePath();
  ctx.fillStyle=inside;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=1.4;ctx.stroke();
  ctx.save();ctx.clip();ctx.fillStyle=tongue;ctx.beginPath();ctx.ellipse(0,2.6+h,4.2,h*.55,0,0,TAU);ctx.fill();
  ctx.strokeStyle='#d9628a';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,2.6+h*.55);ctx.lineTo(0,2.6+h);ctx.stroke();ctx.restore();
  if(fangs){ctx.fillStyle='#fffaf0';ctx.strokeStyle=ink;ctx.lineWidth=.8;
   for(const sx of [-1,1]){ctx.beginPath();ctx.moveTo(sx*4.6,2.1);ctx.lineTo(sx*3.4,2.1);ctx.lineTo(sx*4,4.6+o2);ctx.closePath();ctx.fill();ctx.stroke();}}
 }
 // Philtrum + "ω" lips (always drawn so the face reads as feline).
 ctx.beginPath();ctx.moveTo(0,.9);ctx.lineTo(0,2.4);
 ctx.moveTo(0,2.4);ctx.quadraticCurveTo(-2.6,5.2-smile*1.5,-5.8,2.6-smile*1.6);
 ctx.moveTo(0,2.4);ctx.quadraticCurveTo(2.6,5.2-smile*1.5,5.8,2.6-smile*1.6);
 ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.stroke();
 ctx.restore();
}

// V462 · Michicornio L ("Nueve colas") choreography shared by the ability and the art:
// one projectile per real tentacle/appendage of the form, each launched by its own
// tentacle in a left→right ripple. Frames are counted from the cast start (26f pose).
export const MICHI_L_SHOTS=Object.freeze([3,4,7,5,9]);
export function michiLaunchFrame(i,n){return 3+Math.round(i*18/Math.max(1,n-1));}
// 0..1 lash of tentacle i at cast progress u (0..1 over 26 frames): a short coil back
// (negative) then a whip forward peaking as its projectile leaves.
export function michiLaunchKick(i,n,u){
 const d=(Math.max(0,Math.min(1,Number(u)||0))*26)-michiLaunchFrame(i,n);
 if(d<-5||d>9)return 0;
 return d<0?-(d+5)/5*.35:Math.sin(Math.PI*d/9);
}
