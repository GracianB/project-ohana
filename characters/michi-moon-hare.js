import {drawMichiEye} from './michi-eyes.js';
// Conejornio Lunar · F4 (zero-based form 3). Self-contained vector anatomy.
// The rig owns its ears, hocks, paws and expression; no feline pose overlays.
// Positions, hitboxes, resources and combat timers belong to the simulation.
const TAU=Math.PI*2;
const finite=(v,fallback=0)=>Number.isFinite(v)?v:fallback;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,finite(v)));
const P=Object.freeze({ink:'#493451',ivory:'#fff6e9',light:'#fffdf6',shadow:'#d6c3e3',deep:'#a78abf',
 lavender:'#bba1df',rose:'#efbad3',ear:'#cb83b0',blue:'#5784b4',gold:'#e6b96b',goldLight:'#fff0b6'});
const STATES=new Set(['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead']);

export function moonHarePose(p={}){
 const state=STATES.has(p.state)?p.state:'idle',reduced=!!p.reduceMotion,t=reduced||state==='dead'?0:finite(p.t);
 const phase=reduced?0:Math.abs(finite(p.phase))>.0001?p.phase:t*.24;
 const moving=state==='run',air=['jump','fall','glide'].includes(state),cast=state==='cast';
 const attack=state==='attack'?Math.sin(Math.PI*(reduced?.5:clamp(finite(p.atk,.5)))):0;
 const charge=cast?Math.sin(Math.PI*(reduced?.5:clamp(finite(p.cast,.5)))):0;
 const power=Number.isInteger(p.michiPowerIndex)?p.michiPowerIndex:Math.trunc(finite(p.castSlot,-1));
 const land=reduced?0:clamp(p.land),breath=reduced?0:Math.sin(t*.055);
 const stride=moving?Math.sin(phase):0,follow=moving?Math.sin(phase-.75):0;
 const speed=clamp(finite(p.speed,1),.25,1.25),sit=state==='victory';
 const welcome=p.michiWelcome||{},inspect=reduced?0:clamp(welcome.inspect),groom=reduced?0:clamp(welcome.groom);
 const hurt=state==='hurt',jump=state==='jump',fall=state==='fall',glide=state==='glide',wall=state==='wall',dead=state==='dead';
 const ears=(dead?-1.0:moving?-.28-Math.max(0,stride)*.22:jump?-.48:glide?-.92:fall?.24:hurt?-.82:0);
 const rig={
  state,t,reduced,power,attack,charge,air,sit,dead,
  bodyX:attack*3.5-hurt*2,bodyY:moving?-Math.max(0,stride)*5.5*speed:land*3.5+breath*.6,
  lean:dead?.6:hurt?-.10:jump?-.055:glide?.055:attack*-.05,
  chest:sit?-8:jump?-1:land*3,headX:attack*6-hurt*3+inspect*2,
  headY:sit?-11:jump?-3:land*2,headTilt:hurt?-.18:wall?-.12:sit?-.09+breath*.035:-follow*.035,
  earNear:ears+(reduced?0:Math.sin(t*.063)*.045)+inspect*.25-groom*.13,
  earFar:ears*.7+(reduced?0:Math.sin(t*.051-.8)*.065)-inspect*.12,
  tail:moving?-follow*.2:reduced?0:Math.sin(t*.049)*.10,
  backX:moving?-13+stride*17:jump?-24:glide?-36:fall?-18:-10,
  backY:moving?-3-Math.max(0,Math.cos(phase))*11:jump?-20:glide?-13:fall?-4:-3,
  frontX:moving?29-Math.sin(phase+.65)*15:attack?31+attack*24:jump?18:glide?48:wall?37:sit?13:28,
  frontY:moving?-3-Math.max(0,Math.cos(phase+.65))*8:jump?-26:glide?-29:wall?-49:sit?-30:fall?2:hurt?-24:-3,
  farOffset:moving?Math.sin(phase+.25)*3:0,
  pawLift:cast?(power===1?10:power===5?22:18)*charge:groom*9,
  blink:dead||hurt?1:reduced?0:((t+31)%193)<6?1:0,
  look:clamp(finite(p.look?.x,1),-1,1)*.9+inspect*.5,
  smile:sit||power===5&&cast||clamp(welcome.purr)>.3,breath,
  mantle:glide?1:cast&&power===2?.65:0,
  nose:reduced?0:Math.sin(t*.31)*.18
 };
 if(cast){
  if(power===0){rig.frontX=29+charge*12;rig.frontY=-9;rig.headTilt-=charge*.045;}
  else if(power===1){rig.frontX=9;rig.frontY=-17;rig.bodyY+=charge*3;rig.earNear-=charge*.65;rig.earFar-=charge*.5;rig.headY+=charge*3;}
  else if(power===2){rig.frontX=43;rig.frontY=-25;rig.headY-=charge*6;rig.earNear+=charge*.25;rig.earFar-=charge*.22;}
  else if(power===3){rig.frontX=34;rig.frontY=-3;rig.pawLift=0;rig.backX=-22;rig.bodyX+=charge*5;rig.headTilt-=charge*.16;rig.earNear-=charge*.6;rig.earFar-=charge*.45;}
  else if(power===4){rig.frontX=44;rig.frontY=-28;rig.earNear+=charge*.44;rig.earFar-=charge*.58;rig.bodyY-=charge*3;rig.mantle=charge*.8;}
  else if(power===5){rig.frontX=32;rig.frontY=-24+(reduced?0:Math.sin(t*.25)*4);rig.headTilt=-.08;rig.earFar-=charge*.5;rig.look=-.4;}
 }
 return rig;
}

function path(c,fill,fn,width=1.45){c.beginPath();fn();c.closePath();c.fillStyle=fill;c.fill();if(width){c.strokeStyle=P.ink;c.lineWidth=width;c.stroke();}}
function oval(c,x,y,rx,ry,fill,rot=0,width=1.3){path(c,fill,()=>c.ellipse(x,y,rx,ry,rot,0,TAU),width);}
function line(c,col,width,fn){c.strokeStyle=col;c.lineWidth=width;c.beginPath();fn();c.stroke();}
function crescent(c,x,y,r,col){path(c,col,()=>{c.moveTo(x+r*.4,y-r);c.bezierCurveTo(x-r*1.35,y-r,x-r*1.35,y+r,x+r*.4,y+r);c.bezierCurveTo(x-r*.45,y+r*.48,x-r*.45,y-r*.48,x+r*.4,y-r);},.65);}

// Two-bone hock: bone lengths are stable while the paw follows its footfall.
export function hareLegJoint(hip,paw,upper,lower,bend=-1){
 const dx=paw.x-hip.x,dy=paw.y-hip.y,d=Math.hypot(dx,dy)||.001;
 const reach=Math.max(Math.abs(upper-lower)+.001,Math.min(upper+lower-.001,d));
 const along=(upper*upper-lower*lower+reach*reach)/(2*reach),side=Math.sqrt(Math.max(0,upper*upper-along*along))*bend;
 return {x:hip.x+dx/d*along-dy/d*side,y:hip.y+dy/d*along+dx/d*side};
}
function leg(c,{hip,paw,rear=false,far=false,fold=0}){
 const joint=hareLegJoint(hip,paw,rear?18:23,rear?20:26,rear?-1:1),fur=far?P.shadow:P.ivory;
 // The thigh flows into the hock. Its root is covered by the torso, not a disc.
 const w=rear?8:4.2;
 path(c,fur,()=>{
  c.moveTo(hip.x-w,hip.y-5);
  c.bezierCurveTo(hip.x-w-6,hip.y+5,joint.x-w*.8,joint.y+4,paw.x-7,paw.y-4);
  c.bezierCurveTo(paw.x-13,paw.y-4,paw.x-13,paw.y+2,paw.x-5,paw.y+2);
  c.quadraticCurveTo(paw.x+11,paw.y+3,paw.x+14,paw.y-1);
  c.quadraticCurveTo(paw.x+15,paw.y-5,paw.x+6,paw.y-6);
  c.lineTo(paw.x+2,paw.y-6);
  c.quadraticCurveTo(joint.x+w*.6,joint.y-2,hip.x+w,hip.y-4);
  c.quadraticCurveTo(hip.x,hip.y-11,hip.x-w,hip.y-5);
 },1.15);
 if(!far){
  path(c,P.light,()=>{c.moveTo(paw.x-7,paw.y-3);c.quadraticCurveTo(paw.x+4,paw.y-8,paw.x+12,paw.y-2);c.quadraticCurveTo(paw.x+5,paw.y+1,paw.x-6,paw.y);},0);
  for(const dx of[5,9])line(c,P.deep,.65,()=>{c.moveTo(paw.x+dx,paw.y-2);c.quadraticCurveTo(paw.x+dx+1,paw.y,paw.x+dx,paw.y+1);});
  if(rear)line(c,P.deep,.8,()=>{c.moveTo(hip.x-3,hip.y+1);c.bezierCurveTo(hip.x+9,hip.y+5,hip.x+9,hip.y+16,hip.x+1,hip.y+18);});
  else line(c,P.light,1.2,()=>{c.moveTo(hip.x,hip.y+2);c.quadraticCurveTo(joint.x,joint.y,paw.x-4,paw.y-7);});
 }
}
function tail(c,r){
 c.save();c.translate(-36,-27);c.rotate(r.tail);
 path(c,P.shadow,()=>{c.moveTo(0,8);c.bezierCurveTo(-15,10,-19,0,-12,-4);c.bezierCurveTo(-15,-12,-4,-17,0,-10);c.bezierCurveTo(7,-14,14,-6,10,1);c.quadraticCurveTo(12,10,0,8);});
 path(c,P.ivory,()=>{c.moveTo(-2,5);c.bezierCurveTo(-12,5,-15,-2,-8,-5);c.quadraticCurveTo(-8,-13,0,-9);c.bezierCurveTo(6,-11,10,-4,5,0);c.quadraticCurveTo(6,5,-2,5);},0);
 line(c,P.light,1.7,()=>{c.moveTo(-10,-3);c.quadraticCurveTo(-7,-8,-3,-6);});c.restore();
}
function ear(c,x,y,angle,far,r){
 c.save();c.translate(x,y);c.rotate(angle);
 // Curved taper, a fold at the root and a soft tip distinguish ears from horns.
 path(c,far?P.shadow:P.ivory,()=>{c.moveTo(-5,3);c.bezierCurveTo(-12,-14,-12,-42,-3,-49);c.bezierCurveTo(7,-54,13,-30,5,1);c.quadraticCurveTo(0,7,-5,3);});
 path(c,far?P.ear:P.rose,()=>{c.moveTo(-2,-2);c.bezierCurveTo(-7,-17,-6,-39,-2,-43);c.bezierCurveTo(3,-47,6,-24,2,-3);c.closePath();},0);
 line(c,far?P.deep:P.ear,.8,()=>{c.moveTo(-.8,-6);c.quadraticCurveTo(-1,-24,-2,-37);});
 if(!far){line(c,P.light,1.3,()=>{c.moveTo(-7,-13);c.quadraticCurveTo(-10,-38,-3,-47);});
  // One tiny natural notch reads as character, never as a second accessory.
  line(c,P.deep,.7,()=>{c.moveTo(5,-30);c.lineTo(2,-28);});}
 c.restore();
}
// A slight three-quarter face: both eyes share one curved face plane, and the
// short nose sits BETWEEN them. No profile snout with a second frontal eye.
export function moonHareFace(pose={}){
 const r=moonHarePose(pose);
 return {near:{x:10,y:-4.5,rx:6.02,ry:7.84},far:{x:-8,y:-5.5,rx:5.33,ry:6.94},nose:{x:3,y:7},closed:!!r.blink};
}
function eye(c,x,y,far,r){
 drawMichiEye(c,x,y,far?6.2:7,{closed:!!r.blink,happy:r.smile,look:{x:r.look,y:0}});
}
function head(c,r){
 const face=moonHareFace({state:r.state,t:r.t,reduceMotion:r.reduced});
 c.save();c.translate(21+r.headX,-53+r.headY);c.rotate(r.headTilt);
 ear(c,-11,-16,r.earFar-.14,true,r);
 // Heart-shaped rabbit skull, cheek tufts and rounded jaw are one silhouette.
 path(c,P.ivory,()=>{
  c.moveTo(-20,-7);c.bezierCurveTo(-21,-27,6,-31,19,-18);
  c.quadraticCurveTo(25,-12,23,-1);c.quadraticCurveTo(25,4,28,5);
  c.lineTo(24,7);c.lineTo(26,9);c.lineTo(21,10);
  c.bezierCurveTo(20,22,-4,24,-15,15);c.quadraticCurveTo(-23,12,-23,7);
  c.lineTo(-27,5);c.lineTo(-23,3);c.lineTo(-26,1);c.quadraticCurveTo(-21,-1,-20,-7);
 },1.3);
 path(c,'#eadbeb',()=>{c.moveTo(-22,5);c.quadraticCurveTo(-13,18,3,17);c.quadraticCurveTo(18,16,23,6);c.quadraticCurveTo(23,21,4,21);c.quadraticCurveTo(-13,21,-22,5);},0);
 // The light plane follows the brow/bridge rather than drawing another mask.
 path(c,P.light,()=>{c.moveTo(-16,-12);c.bezierCurveTo(-9,-25,7,-24,16,-16);c.quadraticCurveTo(6,-21,1,-13);c.quadraticCurveTo(-5,-19,-16,-12);},0);
 path(c,'#fffaf0',()=>{c.moveTo(-11,7);c.quadraticCurveTo(-5,1,3,7);c.quadraticCurveTo(12,2,17,8);c.bezierCurveTo(18,16,12,19,3,18);c.quadraticCurveTo(-9,19,-11,7);},0);
 eye(c,face.far.x,face.far.y,true,r);eye(c,face.near.x,face.near.y,false,r);
 oval(c,-15,7.5,3.5,1.5,'#e8b9cf',-.1,0);oval(c,17,8,3.9,1.6,'#edbfd1',.1,0);
 c.save();c.translate(face.nose.x-3,face.nose.y-7);
 path(c,'#ce91ac',()=>{c.moveTo(-.8,7+r.nose);c.quadraticCurveTo(3,5.2,6.8,7+r.nose);c.quadraticCurveTo(5,10,3,10.3);c.quadraticCurveTo(1,9.7,-.8,7+r.nose);},.65);
 line(c,P.ink,.85,()=>{c.moveTo(3,10.3);c.lineTo(3,12.7);c.quadraticCurveTo(-1,16,-4,12.8);c.moveTo(3,12.7);c.quadraticCurveTo(7,16,10,12.8);});
 if(r.attack>.15||r.smile){
  path(c,'#2a0f2e',()=>{c.moveTo(-1,13);c.quadraticCurveTo(3,15,8,13);c.quadraticCurveTo(8,20,3,20);c.quadraticCurveTo(-1,19,-1,13);},.6);
  oval(c,4,18,2.8,1.2,'#ff7fae',0,0);
  path(c,P.light,()=>{c.moveTo(1,13.5);c.lineTo(5.5,13.5);c.lineTo(5,16);c.lineTo(1.4,16);},.25);
 }
 c.restore();
 for(const side of[-1,1])for(let i=0;i<2;i++)line(c,'#a28ca9',.6,()=>{const x=side<0?-16:18;c.moveTo(x,10+i*3);c.quadraticCurveTo(x+side*9,9+i*4,x+side*15,7+i*6);});
 // Near ear grows behind the brow. The horn occupies the shared centreline.
 ear(c,6,-20,r.earNear+.09,false,r);
 c.save();c.translate(-1,-24);c.rotate(.08);
 path(c,P.goldLight,()=>{c.moveTo(-3.3,3);c.quadraticCurveTo(-4,-10,0,-25);c.quadraticCurveTo(5,-10,4,3);},.9);
 path(c,P.gold,()=>{c.moveTo(1,-22);c.quadraticCurveTo(5,-7,4,3);c.lineTo(.9,3);c.quadraticCurveTo(3,-11,1,-22);},0);
 for(let i=0;i<4;i++)line(c,'#b68c60',.65,()=>{const y=-1-i*4.4;c.moveTo(-2.7+i*.5,y);c.quadraticCurveTo(.2,y+1,3.5-i*.3,y-1.7);});
 line(c,P.light,.9,()=>{c.moveTo(-2,-1);c.quadraticCurveTo(-2.5,-12,0,-23);});c.restore();
 // Three locks of brow fur carry the crescent into the same facial plane.
 path(c,P.light,()=>{c.moveTo(-12,-17);c.quadraticCurveTo(-5,-24,4,-20);c.lineTo(1,-15);c.lineTo(-2,-17);c.lineTo(-5,-13);c.lineTo(-6,-17);c.quadraticCurveTo(-9,-15,-12,-17);},.5);
 crescent(c,2,-13,2.2,P.gold);c.restore();
}
function magic(c,r){
 if(r.dead||r.reduced)return;
 if(r.mantle){
  c.save();c.globalAlpha=.23*r.mantle;
  path(c,'#b8dff3',()=>{c.moveTo(-26,-37);c.bezierCurveTo(-72,-54,-64,-11,-23,-17);c.quadraticCurveTo(-45,-27,-26,-37);},0);
  c.restore();
 }
 if(r.charge>.06&&r.power!==5){
  c.save();c.globalAlpha=r.charge*.7;const x=r.power===1?2:r.power===3?43:37,y=r.power===4?-55:-31;
  crescent(c,x,y,5+r.charge*3,r.power===1?P.lavender:P.goldLight);
  for(let i=0;i<3;i++){const a=i*TAU/3-r.charge*.7;oval(c,x+Math.cos(a)*13,y+Math.sin(a)*10,1,1.5,P.light,a,0);}c.restore();
 }
 if(r.attack>.1){c.save();c.globalAlpha=r.attack*.6;line(c,P.goldLight,2,()=>{c.moveTo(42,-43);c.quadraticCurveTo(63,-35,51,-16);});c.restore();}
}

export function drawMoonHare(c,pose={}){
 const r=moonHarePose(pose),rearHip={x:-22,y:-23},frontHip={x:17,y:-32+r.chest};
 c.save();c.lineCap='round';c.lineJoin='round';c.translate(r.bodyX,r.bodyY);c.rotate(r.lean);
 if(r.dead)c.translate(-4,-18);
 magic(c,{...r,charge:0,attack:0});tail(c,r);
 leg(c,{hip:{x:rearHip.x-5,y:rearHip.y},paw:{x:r.backX-5+r.farOffset,y:r.backY-1},rear:true,far:true,fold:r.air?-.25:0});
 leg(c,{hip:{x:frontHip.x-5,y:frontHip.y},paw:{x:r.frontX-7,y:r.frontY-r.pawLift-2},far:true});
 // Long, soft flank and upright chest; the near haunch has an open contour.
 path(c,P.ivory,()=>{
  c.moveTo(-35,-24);c.bezierCurveTo(-43,-44,-23,r.sit?-68:-56,-4,-48);
  c.quadraticCurveTo(7,-45+r.chest,13,-51+r.chest);
  c.quadraticCurveTo(24,-53,25,-39);c.bezierCurveTo(30,-27,27,-15,16,-12);
  c.bezierCurveTo(1,-6,-27,-6,-35,-24);
 },1.3);
 path(c,'#e5d4e8',()=>{c.moveTo(-35,-23);c.bezierCurveTo(-24,-13,-2,-12,17,-20);c.quadraticCurveTo(25,-25,26,-32);c.quadraticCurveTo(30,-16,14,-11);c.bezierCurveTo(-5,-5,-28,-10,-35,-23);},0);
 path(c,P.light,()=>{c.moveTo(-32,-36);c.bezierCurveTo(-28,-49,-12,-51,-3,-45);c.quadraticCurveTo(-18,-46,-28,-31,-32,-36);},0);
 // Fur markings follow the flank, with a small crescent rather than costume trim.
 crescent(c,-18,-35,4.4,'#b59bcf');
 for(const[x,y,radius]of[[-28,-32,1.2],[-8,-39,1.2],[-4,-34,.8]])oval(c,x,y,radius,radius,'#dfbe89',0,0);
 for(let i=0;i<3;i++)line(c,i%2?P.light:'#dac7e3',.85,()=>{
  const lag=r.reduced?0:Math.sin(r.t*.055-i*.6)*.8;
  c.moveTo(-29+i*5,-40-i%2);c.quadraticCurveTo(-20+i*5,-47+lag,-12+i*4,-44+lag);
 });
 leg(c,{hip:rearHip,paw:{x:r.backX,y:r.backY},rear:true,fold:r.state==='jump'?-.3:0});
 // Soft neck ruff joins skull, shoulder and sternum in the same coat.
 path(c,P.light,()=>{c.moveTo(8,-46+r.chest);c.quadraticCurveTo(19,-52,26,-40);c.quadraticCurveTo(29,-32,24,-26);c.lineTo(24,-22);c.lineTo(20,-25);c.quadraticCurveTo(18,-19,16,-20);c.lineTo(15,-24);c.lineTo(11,-22);c.quadraticCurveTo(8,-29,8,-46+r.chest);},.8);
 line(c,'#e5d3e2',.7,()=>{c.moveTo(16,-39);c.quadraticCurveTo(13,-32,16,-27);});
 leg(c,{hip:frontHip,paw:{x:r.frontX,y:r.frontY-r.pawLift},fold:r.air?-.35:0});
 head(c,r);magic(c,{...r,mantle:0});c.restore();
}
