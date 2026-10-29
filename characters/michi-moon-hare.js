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
 // Tapered muscle contours replace cylindrical tubes and round hip discs.
 const width=rear?5:3;
 path(c,fur,()=>{c.moveTo(hip.x-width,hip.y-2);c.quadraticCurveTo(joint.x-width,joint.y,paw.x-6,paw.y-3);c.lineTo(paw.x+3,paw.y-3);c.quadraticCurveTo(joint.x+width,joint.y,hip.x+width,hip.y-2);},1.15);
 if(rear){
  path(c,fur,()=>{c.moveTo(hip.x-10,hip.y-7);c.bezierCurveTo(hip.x-17,hip.y+2,hip.x-12,hip.y+17,hip.x+1,hip.y+17);c.quadraticCurveTo(hip.x+17,hip.y+12,hip.x+9,hip.y-7);c.quadraticCurveTo(hip.x,hip.y-14,hip.x-10,hip.y-7);},.9);
  line(c,far?P.deep:P.light,far?.65:1.5,()=>{c.moveTo(hip.x-8,hip.y-5);c.quadraticCurveTo(hip.x+1,hip.y-11,hip.x+7,hip.y-1);});
 }
 c.save();c.translate(paw.x,paw.y);c.rotate(fold*.3);
 // Soft long rabbit toes; no flat boots or detached oval feet.
 path(c,fur,()=>{c.moveTo(-10,-4);c.bezierCurveTo(-6,-8,8,-7,14,-3);c.quadraticCurveTo(16,1,9,2);c.lineTo(-9,2);c.quadraticCurveTo(-13,0,-10,-4);},1.2);
 if(!far){for(const x of [6,10])line(c,P.deep,.65,()=>{c.moveTo(x,-3);c.quadraticCurveTo(x+1,-1,x,1);});
  line(c,P.light,1.6,()=>{c.moveTo(-6,-4);c.quadraticCurveTo(2,-6,7,-4);});}
 c.restore();
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
function eye(c,x,y,far,r){
 c.save();c.translate(x,y);c.scale(far?.58:1,1);
 if(r.blink){line(c,P.ink,1.15,()=>{c.moveTo(-5,-.5);c.quadraticCurveTo(0,r.dead?.8:2.2,5,-.5);});}
 else{
  // Animal almond: little sclera, a generous warm iris and one soft catchlight.
  // The upper lid overlaps the iris; no concentric white/black target rings.
  c.save();c.beginPath();c.moveTo(-5.8,.2);c.bezierCurveTo(-4.5,-5.7,3.5,-6.5,5.7,-.8);c.bezierCurveTo(4.4,5.4,-3.8,5.6,-5.8,.2);c.closePath();c.clip();
  c.fillStyle='#f5e9ef';c.fillRect(-7,-8,14,16);
  oval(c,r.look*.5,-.1,5.8,6.5,'#9b7eab',0,0);
  oval(c,r.look*.6,-.2,3.5,4.7,'#4a3c58',0,0);
  oval(c,r.look*.6-1.2,-2,1.05,1.35,'#fff5e6',0,0);
  c.restore();
  line(c,P.ink,1.25,()=>{c.moveTo(-5.8,.2);c.bezierCurveTo(-4.5,-5.7,3.5,-6.5,5.7,-.8);});
  line(c,'#a18aad',.75,()=>{c.moveTo(-5.5,1);c.quadraticCurveTo(0,6.2,5.4,.5);});
 }
 c.restore();
}
function head(c,r){
 c.save();c.translate(20+r.headX,-48+r.headY);c.rotate(r.headTilt);
 ear(c,-8,-12,r.earFar-.18,true,r);
 // Forehead, cheek and tapered muzzle are one continuous silhouette.
 path(c,P.ivory,()=>{c.moveTo(-18,-7);c.bezierCurveTo(-21,-23,0,-26,12,-16);c.quadraticCurveTo(17,-9,15,-3);c.bezierCurveTo(23,-3,28,3,24,10);c.bezierCurveTo(18,19,0,18,-12,10);c.quadraticCurveTo(-22,4,-18,-7);});
 path(c,P.shadow,()=>{c.moveTo(-18,2);c.quadraticCurveTo(-5,13,14,10);c.quadraticCurveTo(22,10,25,7);c.quadraticCurveTo(23,18,7,17);c.quadraticCurveTo(-13,17,-18,2);},0);
 path(c,P.light,()=>{c.moveTo(-14,-10);c.bezierCurveTo(-10,-23,3,-23,11,-13);c.quadraticCurveTo(0,-18,-6,-9);c.closePath();},0);
 eye(c,-10,-2.5,true,r);eye(c,5,-2,false,r);
 // Warm cheeks leave both eyes readable at gameplay size.
 oval(c,-13,6,3,1.7,P.rose,0,0);oval(c,11,7,3.5,1.8,P.rose,0,0);
 path(c,P.rose,()=>{c.moveTo(19,5+r.nose);c.quadraticCurveTo(24,3,23,7);c.lineTo(21,9);c.closePath();},.8);
 line(c,P.ink,1,()=>{c.moveTo(21,9);c.lineTo(20,12);c.quadraticCurveTo(15,15,12,11);});
 if(r.attack>.15||r.smile){oval(c,15,13,4.1,2.7,'#2a0f2e',0,.8);oval(c,16,14,2.7,1.1,'#ff7fae',0,0);
  path(c,P.light,()=>{c.moveTo(13,11);c.lineTo(17,11);c.lineTo(16.5,13);c.lineTo(13.5,13);},0);}
 // Whiskers follow the muzzle, rather than crossing its face.
 for(let i=0;i<2;i++)line(c,P.deep,.55,()=>{c.moveTo(17,9+i*2);c.quadraticCurveTo(27,9+i*3,32,7+i*5);});
 ear(c,-1,-16,r.earNear+.12,false,r);
 // A carved ivory spiral grows from the forehead between the ears.
 c.save();c.translate(8,-18);c.rotate(.19);
 path(c,P.goldLight,()=>{c.moveTo(-4,3);c.quadraticCurveTo(-4,-14,1,-31);c.quadraticCurveTo(6,-13,5,3);c.closePath();},1.05);
 path(c,P.gold,()=>{c.moveTo(2,-25);c.quadraticCurveTo(7,-7,5,3);c.lineTo(1,3);c.quadraticCurveTo(4,-12,2,-25);},0);
 for(let i=0;i<4;i++)line(c,'#b78c55',.8,()=>{const y=-2-i*5;c.moveTo(-3+i*.7,y);c.quadraticCurveTo(1,y+1,4-i*.15,y-2);});
 line(c,P.light,1,()=>{c.moveTo(-2,-2);c.quadraticCurveTo(-3,-12,1,-27);});c.restore();
 // Forehead marking is attached to skin: no hovering halo or orbiting baubles.
 crescent(c,0,-15,2.4,P.gold);c.restore();
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
 // Sculpted pear-shaped torso: one contour, a shaded underside and a light spine.
 path(c,P.ivory,()=>{c.moveTo(-34,-29);c.bezierCurveTo(-39,-48,-13,r.sit?-68:-55,6,-43+r.chest);c.bezierCurveTo(24,-45+r.chest,30,-29,24,-19);c.bezierCurveTo(9,-7,-29,-7,-34,-29);});
 path(c,P.shadow,()=>{c.moveTo(-32,-23);c.bezierCurveTo(-13,-10,12,-13,25,-25);c.quadraticCurveTo(27,-14,9,-12);c.bezierCurveTo(-10,-6,-29,-12,-32,-23);},0);
 path(c,P.light,()=>{c.moveTo(-30,-37);c.bezierCurveTo(-19,-49,-1,-48,9,-39+r.chest);c.quadraticCurveTo(-12,-44,-27,-32);},0);
 // Moon-dappled fur, not a costume: constellated marks follow the back.
 crescent(c,-17,-36,5,P.lavender);
 for(const [x,y,radius] of [[-27,-35,1.6],[-7,-39,1.5],[-2,-34,1]])oval(c,x,y,radius,radius,P.gold,0,0);
 // Three satin guard hairs carry a little of the former medusa's translucency.
 for(let i=0;i<3;i++){
  const lag=r.reduced?0:Math.sin(r.t*.055-i*.6)*(r.state==='run'?2:1);
  path(c,i%2?'#e9dff5':'#f7ebff',()=>{c.moveTo(5-i*4,-44-i%2);c.bezierCurveTo(-2-i*8,-53+lag,-19-i*5,-50+lag,-30-i*2,-44+lag);c.quadraticCurveTo(-12-i*4,-47,5-i*4,-44-i%2);},.45);
 }
 leg(c,{hip:rearHip,paw:{x:r.backX,y:r.backY},rear:true,fold:r.state==='jump'?-.3:0});
 // A fluffy bib joins the neck to the chest; it is fur, not a cape.
 path(c,P.light,()=>{c.moveTo(8,-44+r.chest);c.lineTo(17,-48+r.chest);c.quadraticCurveTo(26,-39,27,-29);c.lineTo(24,-29);c.lineTo(23,-22);c.lineTo(19,-26);c.lineTo(16,-20);c.lineTo(14,-25);c.lineTo(10,-23);c.quadraticCurveTo(7,-34,8,-44+r.chest);},1.1);
 crescent(c,20,-35+r.chest,3.5,P.goldLight);
 leg(c,{hip:frontHip,paw:{x:r.frontX,y:r.frontY-r.pawLift},fold:r.air?-.35:0});
 head(c,r);magic(c,{...r,mantle:0});c.restore();
}
