// V78 IRIS MOTION · shared gait, reactive manes, reduced movement; five-form canon preserved.
// Character height is an optical reading aid, never a physics/hitbox change.
export const CUERNO_VISUAL_H=Object.freeze([118,92,91,86,82]);
// V66: Cuerno's personality is stage-specific and deterministic, never random FX.
const SOUL_BEATS=["curious","shy","prance","stargaze","sneeze","bow"];
export function cuernoSoulBeat(pose,form){
const state=pose?.state||"idle";
if(state==="hurt"||state==="dead")return "";
const forced=pose?.cuernoBeat;
if(typeof forced==="string"&&SOUL_BEATS.includes(forced))return forced;
if(state==="victory")return form>=4?"bow":form>=2?"prance":"curious";
if(state==="cast"&&form>=3&&pose?.castSlot===3)return "stargaze";
if(state!=="idle"||!(Number(pose?.flourish)>.06&&Number(pose?.flourish)<.94))return "";
return form===4?(Number(pose.flourishN)%2?"bow":"sneeze"):SOUL_BEATS[form];
}
// Small pantomimes belong to the character, not world particles or physics.
function drawCuernoSoul(ctx,pose,R,form,t){
const beat=cuernoSoulBeat(pose,form);if(!beat)return;
const born=[-65,-90,-106,-124,-142][form],x=[1,12,24,25,32][form];
const forced=!!pose.cuernoBeat,state=pose?.state||"idle";
// Victory and U were unreachable: rig flourishes only in idle. Give them a real beat.
const amp=forced?.77:state==="victory"?.83:state==="cast"?.68:
Math.sin(Math.PI*Math.max(0,Math.min(1,Number(pose.flourish)||0)));
if(amp<=.08)return;
const k=Math.max(0,Math.min(1,amp)),TAU=Math.PI*2;
ctx.save();ctx.globalAlpha=.66*k;ctx.lineCap="round";
if(beat==="curious"){
ctx.strokeStyle="#eab1da";ctx.lineWidth=2;
ctx.beginPath();ctx.arc(x+14,born-2,6,Math.PI*.95,TAU*.88);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+16,born+6);ctx.lineTo(x+16,born+7);ctx.stroke();
}else if(beat==="shy"){
ctx.strokeStyle="#efb4d3";ctx.lineWidth=2;
for(const dx of [-1,1]){ctx.beginPath();ctx.arc(x+dx*12,born+15,4,0,TAU);ctx.stroke();}
ctx.beginPath();ctx.moveTo(x+5,born-5);ctx.quadraticCurveTo(x-4,born-15,x-8,born-7);
ctx.quadraticCurveTo(x-14,born+2,x-20,born-7);ctx.stroke();
}else if(beat==="prance"){
ctx.strokeStyle="#b6c7ff";ctx.lineWidth=2;
for(let i=0;i<3;i++){
const yy=-5+i*6;ctx.beginPath();ctx.moveTo(-22-i*5,yy);
ctx.quadraticCurveTo(-29-i*5,yy-3,-33-i*5,yy+3);ctx.stroke();
}
R.sparkle(ctx,-33,-14,3+2*k,"#ffe1ab");
}else if(beat==="stargaze"){
ctx.strokeStyle="#a8c9ec";ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(x-20,born-22);ctx.lineTo(x-5,born-32);
ctx.lineTo(x+17,born-22);ctx.stroke();
for(const [dx,dy] of [[-20,-22],[-5,-32],[17,-22]])
R.sparkle(ctx,x+dx,born+dy,2+2*k,"#ffe4b1");
}else if(beat==="sneeze"){
ctx.strokeStyle="#b1d9e9";ctx.lineWidth=1.8;
for(let i=0;i<3;i++){
const dx=17+i*12,dy=2-i*9;
ctx.beginPath();ctx.ellipse(x+dx,born+dy,4+i*2,3+i,0,0,TAU);ctx.stroke();
}
R.sparkle(ctx,x+49,born-20,3.2*k,"#ffd7a6");
}else if(beat==="bow"){
ctx.strokeStyle="#f5c6df";ctx.lineWidth=2;
for(let i=0;i<3;i++){
ctx.beginPath();ctx.arc(x-2,born+1,15+i*8,Math.PI*.30,Math.PI*.80);ctx.stroke();
}
R.sparkle(ctx,x-4,born-24,3.5*k,"#d1f5e6");
}
ctx.restore();
}

// V67: J/K/L/U originate at the real horn. Pure pose contract, no extra FX objects.
const IRIS_COLORS=["#ffacbe","#ffc98f","#ffe8a5","#a6e8b8","#a7e5fb","#b8c4ff","#e0b9f6"];
const HORN_TIPS=[[0,-65],[4,-91],[24,-100],[25,-120],[33,-139]];

// Deterministic, bounded anatomy: these poses are shared by gameplay and the title portraits.
// Nothing here creates particles, timers, new sprites or changes collision/physics.
export function cuernoTailPose(pose,form,t){
 const f=Math.max(2,Math.min(4,form|0));
 const phase=Number.isFinite(Number(pose?.phase))?Number(pose.phase):0;
 const time=Number.isFinite(Number(t))?Number(t):0;
 const running=pose?.state==="run",air=!!pose?.air||pose?.state==="jump";
 if(pose?.state==="dead"||pose?.state==="hurt")return {swing:0,lift:0};
 const amplitude=f===4?6.2:f===3?5.4:4.2;
 const wave=pose?.reduceMotion?0:Math.sin(time*.075+phase*.22)*amplitude*.55+
   (running?Math.sin(phase)*amplitude*.52:0);
 const speed=Math.max(0,Math.min(1,Number(pose?.speed)||0));
 return {swing:Math.max(-amplitude,Math.min(amplitude,wave)),
   lift:air?7+f:running?1.8+speed*2.3:pose?.reduceMotion?0:Math.sin(time*.055)*1.15};
}
function drawRootedTail(ctx,pose,form,t,rootX,rootY,colors){
 const {swing,lift}=cuernoTailPose(pose,form,t);
 const length=form===4?35:form===3?27:21;
 const strands=form===4?6:form===3?5:4;
 ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
 for(let i=0;i<strands;i++){
  const endX=rootX-length-swing+(i%2?1.4:0);
  const endY=rootY+8+i*2.8-lift;
  ctx.strokeStyle=colors[i%colors.length];
  ctx.lineWidth=(form===4?4.6:form===3?4.0:3.7)-i*.24;
  ctx.globalAlpha=.91-i*.045;
  ctx.beginPath();ctx.moveTo(rootX-i*.65,rootY+i*.64);
  ctx.bezierCurveTo(rootX-11,rootY-8+i*1.4,
    rootX-17-swing*.3,rootY+17+i*2-lift*.65,endX,endY);
  ctx.stroke();
 }
 ctx.restore();
}
export function cuernoWingPose(pose,form,t){
 if(form<3)return {open:0,flap:0,hinge:0};
 const state=pose?.state||"idle",air=!!pose?.air||state==="jump";
 if(state==="dead"||state==="hurt")return {open:.12,flap:0,hinge:0};
 const cast=state==="cast"||state==="attack",victory=state==="victory";
 const slot=cuernoMagicPose(pose,form)?.slot;
 const phase=Number.isFinite(Number(pose?.phase))?Number(pose.phase):0;
 const time=Number.isFinite(Number(t))?Number(t):0;
 const open=air?1:slot===3?1:slot===2?.89:cast?.84:victory?.95:
   state==="run"?.52:cuernoSoulBeat(pose,form)==="stargaze"?.74:form===4?.29:.23;
 const flutter=pose?.reduceMotion?0:air?4.8:cast||victory?2.9:state==="run"?2.3:1.1;
 const flap=pose?.reduceMotion?0:Math.sin(time*.10+phase*.12)*flutter;
 return {open,flap,hinge:pose?.reduceMotion?0:Math.sin(time*.065+phase*.2)*(air?.055:.022)};
}
// V78 pure Canvas motion contract for three equine forms.
export function cuernoLegPose(pose,form,t,clock=0,far=false){
 const state=pose?.state||"idle",f=Math.max(2,Math.min(4,form|0));
 if(state==="hurt"||state==="dead")return {reach:0,tuck:0,kneeLift:0,hoofLift:0};
 const phase=Number.isFinite(Number(pose?.phase))?Number(pose.phase):0;
 const speed=Math.max(0,Math.min(1,Number(pose?.speed)||0));
 const run=state==="run",air=!!pose?.air||state==="jump"||state==="fall";
 const step=Math.sin(phase+clock),tempo=.75+speed*.35;
 const range=(f===2?(far?6:7.6):f===3?(far?7.8:10):far?8.7:11.5)*tempo;
 const moving=run&&!pose?.reduceMotion;
 return {reach:moving?step*range:0,tuck:air?(far?8:11)+(f-2)*1.2:0,
  kneeLift:moving?Math.max(0,-step)*(f===2?1.3:2.2):0,
  hoofLift:moving?Math.max(0,step)*((f-2)*1.25+2):0};
}
export function cuernoManePose(pose,form,t,index){
 const f=Math.max(2,Math.min(4,form|0)),i=Math.max(0,Math.min(6,index|0));
 if(pose?.reduceMotion||pose?.state==="hurt"||pose?.state==="dead")return 0;
 const time=Number.isFinite(Number(t))?Number(t):0;
 const phase=Number.isFinite(Number(pose?.phase))?Number(pose.phase):0;
 const speed=Math.max(0,Math.min(1,Number(pose?.speed)||0));
 const run=pose?.state==="run",air=!!pose?.air||pose?.state==="jump";
 const breeze=Math.sin(time*(f===2?.13:.09)+i*(f===2?.83:f===3?.74:.57))*(f===2?1.8:3);
 const wind=run?Math.sin(phase)*speed*(f===2?2.6:f===3?3.2:4):0;
 return Math.max(-9,Math.min(9,breeze+wind+(air?(f===2?1.2:2.8):0)));
}
export function cuernoMagicPose(pose,form){
if(pose?.state==="dead"||pose?.state==="hurt")return null;
const forced=Number.isInteger(pose?.cuernoMagicSlot)&&pose.cuernoMagicSlot>=0&&pose.cuernoMagicSlot<=3;
const cast=Number(pose?.cast)||0;
const slot=forced?pose.cuernoMagicSlot:pose?.state==="cast"&&cast>0?pose?.castSlot:-1;
const sleep=Number(pose?.cuernoDreamT)||0;
if(slot<0||slot>3){if(sleep<=0)return null;
return {slot:3,strength:Math.min(.22,sleep*.35),radius:0,continuous:true};}
const strength=forced?.85:Math.sin(Math.PI*Math.min(1,Math.max(0,cast)));
const stage=forced?"release":cast<.26?"charge":cast<.76?"release":"echo";
return {slot,strength:Math.max(0,strength),radius:(14+form*12)*(1+cast*.75),stage,continuous:false};
}
function drawCuernoMagic(ctx,pose,R,form,t){
const magic=cuernoMagicPose(pose,form);
if(!magic||magic.strength<.04)return;
const {slot,strength:k}=magic,tip=HORN_TIPS[form],x=tip[0],y=tip[1],TAU=Math.PI*2;
const tempo=magic.stage==="charge"?.48:magic.stage==="echo"?.7:1;
ctx.save();ctx.globalCompositeOperation="lighter";ctx.lineCap="round";
const colors=IRIS_COLORS;
if(slot===0){
// J: the astral lance grows from the horn's point, not from the belly.
ctx.strokeStyle="#fff3cb";ctx.lineWidth=2.8;ctx.globalAlpha=.78*k;
ctx.beginPath();ctx.moveTo(x-4,y+2);ctx.lineTo(x+(13+form*5)*tempo,y-5*tempo);
ctx.lineTo(x+(34+form*9)*tempo,y-11*tempo);ctx.stroke();
for(let i=0;i<3;i++){
ctx.strokeStyle=colors[i*3];ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(x+8,y+(i-1)*3);
ctx.lineTo(x+(23+form*5)*tempo,y+(i-1)*6*tempo);ctx.stroke();
}
R.sparkle(ctx,x+(27+form*8)*tempo,y-10*tempo,2.5+3*k,"#fff6cf");
}else if(slot===1){
// K: galloping hooves pull a nacre comet trail behind the flank.
const tailX=form<2?-14:-35,tailY=form<2?-20:-34;
for(let i=0;i<4;i++){
ctx.strokeStyle=colors[(i+form)%7];ctx.globalAlpha=(.32+i*.055)*k;
ctx.lineWidth=2.2+i*.3;ctx.beginPath();ctx.moveTo(tailX,tailY+i*5);
ctx.bezierCurveTo(tailX-12*tempo,tailY-12+i*6,tailX-26*tempo,tailY-2+i*9,tailX-(40+form*3)*tempo,tailY+i*9);
ctx.stroke();
}
ctx.strokeStyle="#fff8d9";ctx.lineWidth=2;ctx.globalAlpha=.7*k;
ctx.beginPath();ctx.arc(x,y,8+form*2,-1.35,1.1);ctx.stroke();
}else if(slot===2){
// L: seven blurred circular bands spread FROM the horn; the arena-wide iris is separate.
const radius=magic.radius*tempo;
for(let i=0;i<7;i++){
ctx.strokeStyle=colors[i];ctx.lineWidth=2.8+form*.45;
ctx.globalAlpha=(.16+.035*(i%3))*k;ctx.beginPath();
ctx.arc(x-5,y+14,Math.max(2,radius-i*3.2),0,TAU);ctx.stroke();
}
R.sparkle(ctx,x,y,2.5+4*k,"#fff6dd");
}else{
// U: dream canopy and sleepy starlight. Keep the animal readable beneath it.
const spread=(20+form*10)*tempo;
for(let i=0;i<7;i++){
const u=i-3;
ctx.strokeStyle=colors[i];ctx.lineWidth=2.7+form*.2;
ctx.globalAlpha=(.23+.04*(i%2))*k;
ctx.beginPath();ctx.moveTo(x,y);
ctx.quadraticCurveTo(x-5+u*8,y-22-form*4,x+u*spread*.50,y-33-form*5);
ctx.stroke();
}
ctx.globalAlpha=.5*k;ctx.strokeStyle="#eee0ff";ctx.lineWidth=1.6;
for(let i=0;i<3;i++){
const zx=-35+i*12,zy=-52-i*8+Math.sin(t*.05+i)*2;
ctx.beginPath();ctx.moveTo(zx-3,zy-4);ctx.lineTo(zx+3,zy-4);
ctx.lineTo(zx-3,zy+4);ctx.lineTo(zx+3,zy+4);ctx.stroke();
}
if(!magic.continuous)R.sparkle(ctx,x,y,4+3*k,"#fff7dd");
}
ctx.restore();
}

// V73 · Each evolution has the same tender family emblem, grown with its anatomy.
export const CUERNO_FAMILY_COLORS=Object.freeze(["#f3a4d7","#ecc5fa","#bba7f5","#a6d9f4","#fff0b3"]);
export function cuernoEmotion(pose,form){
 const state=pose?.state||"idle";
 if(state==="dead"||state==="hurt")return "quiet";
 if(state==="victory")return "joy";
 if(state==="cast")return Number(pose.castSlot)===3?"dream":"focus";
 if(state==="jump"||state==="fall"||pose?.air)return "flight";
 if(state==="run")return "dash";
 return form===0?"wonder":"calm";
}
function drawCuernoFamilySeal(ctx,pose,R,form,t){
 const emotion=cuernoEmotion(pose,form),anchors=[[0,-15],[0,-38],[10,-37],[12,-40],[15,-44]];
 const [x,y]=anchors[form],col=CUERNO_FAMILY_COLORS[form],TAU=Math.PI*2;
 const living=emotion!=="quiet",sway=emotion==="dash"?Math.sin(Number(pose.phase)||0):0;
 const pulse=emotion==="joy"?.42:emotion==="dream"?.34:emotion==="flight"?.2:.1;
 ctx.save();ctx.translate(x+sway*.6,y);
 ctx.globalAlpha=living?.9:.52;ctx.fillStyle=form===4?"#fffcdf":"#fff9fb";
 ctx.strokeStyle=form===4?"#c3a6d7":"#ad93c9";ctx.lineWidth=1.3;
 ctx.beginPath();ctx.moveTo(0,-6);ctx.quadraticCurveTo(6,-1,0,7);
 ctx.quadraticCurveTo(-6,-1,0,-6);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=col;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(0,.2,1.8+form*.14,0,TAU);ctx.fill();
 if(pulse>.15){ctx.globalAlpha=.28+pulse*.3;ctx.strokeStyle=col;ctx.lineWidth=1.3;
 ctx.beginPath();ctx.arc(0,0,9+4*pulse,Math.PI*.15,Math.PI*1.85);ctx.stroke();}
 ctx.restore();
 // An original surprise on each stage, with authored geometry and bounded motion.
 if(living&&(emotion==="joy"||emotion==="dream"||emotion==="flight")){
   ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.35;ctx.globalAlpha=.36;
   if(form===0){ // Cuernín imagines its first tiny halo.
     ctx.beginPath();ctx.ellipse(0,-44,13,4,Math.sin(t*.035)*.1,0,TAU);ctx.stroke();
   }else if(form===1){ // Destello has no ears or limbs yet: musical glints around its horn.
     for(const dx of [-1,1]){ctx.beginPath();ctx.arc(4+dx*13,-69,3,-1.45,.45);ctx.stroke();}
   }else if(form===2){ // Potro Iris prances with little silver horseshoes.
     for(const dx of [-22,14]){ctx.beginPath();ctx.arc(dx,4,7,.25,2.9);ctx.stroke();}
   }else if(form===3){ // Estelar carries a tiny map of its first night.
     ctx.beginPath();ctx.moveTo(-26,-74);ctx.lineTo(-14,-82);ctx.lineTo(-3,-75);ctx.stroke();
   }else{ // Aurora's crown rises between fully opened pinions.
     ctx.beginPath();ctx.arc(-2,-101,13,Math.PI*1.12,Math.PI*1.90);ctx.stroke();
   }
   ctx.restore();
 }
 if(!living)return;
 const glint=emotion==="joy"?3:emotion==="dream"?2:emotion==="flight"?2:emotion==="focus"?1:0;
 const tip=HORN_TIPS[form];
 for(let i=0;i<glint;i++){
 const ox=(i-1)*13+Math.sin(t*.055+i)*2,oy=-13-i*11-(emotion==="flight"?4:0);
 R.sparkle(ctx,tip[0]+ox,tip[1]+oy,1.7+form*.3+(emotion==="joy"?.7:0),IRIS_COLORS[(i+form*2)%7]);
 }
}

function drawCuernoOverlays(ctx,pose,R,form,t,lift,tilt){
ctx.save();ctx.translate(0,lift);ctx.rotate(tilt);
drawCuernoFamilySeal(ctx,pose,R,form,t);
drawCuernoSoul(ctx,pose,R,form,t);
drawCuernoMagic(ctx,pose,R,form,t);
ctx.restore();
}

// V79: F2/F3 receive a tapered, anatomical spiral, not a lightning zigzag.
function horn(ctx, len, color, wobble) {
 const height=Math.max(14,Math.min(54,Number(len)||29));
 const drift=Number.isFinite(Number(wobble))?Math.max(-1.4,Math.min(1.4,Number(wobble))):0;
 ctx.save();ctx.translate(drift,0);ctx.lineCap="round";ctx.lineJoin="round";
 ctx.fillStyle="#fff8ee";ctx.strokeStyle=color;ctx.lineWidth=2.2;
 ctx.beginPath();ctx.moveTo(-5,0);
 ctx.bezierCurveTo(-6,-height*.32,-3,-height*.74,0,-height);
 ctx.bezierCurveTo(4.4,-height*.69,6.3,-height*.32,5,0);
 ctx.quadraticCurveTo(0,3,-5,0);ctx.closePath();ctx.fill();ctx.stroke();
 // The nacre bands are clipped inside the horn itself.
 ctx.save();ctx.beginPath();ctx.moveTo(-5,0);
 ctx.bezierCurveTo(-6,-height*.32,-3,-height*.74,0,-height);
 ctx.bezierCurveTo(4.4,-height*.69,6.3,-height*.32,5,0);
 ctx.closePath();ctx.clip();
 for(let i=1;i<=5;i++){
  const k=i/6,y=-height*k,width=5*(1-k*.8);
  ctx.strokeStyle=i%2?"#dca5eb":"#b6d5fb";ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(-width,y+2.8);
  ctx.quadraticCurveTo(0,y+5,width,y-1.3);ctx.stroke();
 }
 ctx.restore();
 ctx.strokeStyle="#fffcf3";ctx.lineWidth=1;ctx.globalAlpha=.82;
 ctx.beginPath();ctx.moveTo(-2,-3);
 ctx.bezierCurveTo(-3,-height*.33,-1,-height*.65,0,-height*.89);ctx.stroke();
 ctx.fillStyle="#fff4cb";ctx.beginPath();ctx.arc(0,-height,2.2,0,Math.PI*2);ctx.fill();
 ctx.restore();
}

// V81 · Soft scapular fold. Wings now grow from the shoulder rather than
// ending in a geometric hinge. No extra assets, timers, or geometry outside
// the original silhouette.
function drawWingScapula(ctx,x,y,fill,shine) {
 ctx.save();ctx.fillStyle=fill;
 ctx.beginPath();ctx.moveTo(x-8,y+1);
 ctx.bezierCurveTo(x-8,y-8,x+2,y-9,x+9,y-2);
 ctx.bezierCurveTo(x+12,y+3,x+4,y+8,x-5,y+7);
 ctx.closePath();ctx.fill();
 ctx.globalAlpha=.5;ctx.strokeStyle=shine;ctx.lineWidth=1.25;
 ctx.beginPath();ctx.moveTo(x-6,y-2);
 ctx.quadraticCurveTo(x+1,y-7,x+7,y-2);ctx.stroke();
 ctx.restore();
}
// V81 · Near-side haunch and shoulder sockets overlap the top of each leg.
// Without this, round limb ends create cut seams against the equine barrel.
function blendLegRoots(ctx,hipX,shoulderX,y,coat,highlight){
 ctx.save();ctx.fillStyle=coat;
 for(const x of [hipX,shoulderX]){
  ctx.beginPath();ctx.ellipse(x,y,6.6,4.8,-.22,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=.38;ctx.strokeStyle=highlight;ctx.lineWidth=1.15;
 for(const x of [hipX,shoulderX]){
  ctx.beginPath();ctx.moveTo(x-4,y-1.7);
  ctx.quadraticCurveTo(x,y-4,x+3,y-1.5);ctx.stroke();
 }
 ctx.restore();
}
// F0 Cuernín: the HORN is alive. No horse body, legs or oversized round head.
function drawLivingHorn(ctx,pose,R,t){
  const TAU=Math.PI*2;
  const moving=pose.state==="run",air=!!pose.air;
  const k=moving?Math.sin(pose.phase||t*.15):Math.sin(t*.06);
  const tilt=(moving?-.13:0)+k*.10+(air?-.09:0)+(cuernoSoulBeat(pose,0)==="curious"?.07*Math.sin(t*.14):0);
  const bounce=(pose.bounce||0)+(moving?Math.abs(k)*-2:Math.sin(t*.07)*1.3);
  ctx.save();ctx.translate(0,bounce);ctx.rotate(tilt);
  const aura=.5+.5*Math.sin(t*.085);
  ctx.globalAlpha=.19+.09*aura;ctx.fillStyle="#ffe3f5";
  ctx.beginPath();ctx.ellipse(0,-35,17,31,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
  // One tapered pearl cone, rather than a unicorn already fully formed.
  ctx.fillStyle="#fff7e9";ctx.strokeStyle="#694c82";ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(-13,-17);ctx.bezierCurveTo(-12,-30,-6,-49,1,-65);
  ctx.bezierCurveTo(10,-49,12,-30,13,-17);
  ctx.quadraticCurveTo(0,-8,-13,-17);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.beginPath();ctx.moveTo(-12,-17);ctx.lineTo(1,-65);ctx.lineTo(13,-17);ctx.closePath();ctx.clip();
  ctx.strokeStyle="#e6a6ea";ctx.lineWidth=3;
  for(let i=0;i<5;i++){
    const y=-20-i*8,w=10-i*1.45;
    ctx.beginPath();ctx.moveTo(-w,y-2);ctx.quadraticCurveTo(0,y+3,w,y-5);ctx.stroke();
  }
  ctx.restore();
  // The F0 baby is only a sentient horn. No collar, orb, hooves or body.
  ctx.fillStyle="#fff2d5";ctx.beginPath();ctx.arc(0,-65,3.2,0,TAU);ctx.fill();
  const mood=pose.state==="hurt"||pose.state==="dead"?"closed":pose.state==="attack"?"happy":"normal";
  R.eye(ctx,-5,-24,3.5,pose,{iris:"#623d85",mood});
  R.eye(ctx,6,-24,3.5,pose,{iris:"#623d85",mood});
  R.mouth(ctx,.5,-16,3.4,pose.state==="attack"?"happy":"smile");
  // The newborn hops by magic. When it runs, its own tip pulls it forward.
  if(moving||air){
    ctx.strokeStyle="#ffe3a3";ctx.lineWidth=1.8;ctx.globalAlpha=.65;
    for(let i=0;i<3;i++){
      const y=-10+i*4;
      ctx.beginPath();ctx.moveTo(-13-i*4,y);ctx.lineTo(-21-i*5,y+1);ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  if(pose.state==="cast"||pose.state==="victory"){
    R.sparkle(ctx,0,-66,4+2*aura,"#ffdc9b");
  }
  ctx.restore();
drawCuernoOverlays(ctx,pose,R,0,t,bounce,tilt);
}

// F1 · Destello: a SINGLE spherical face grows around Cuernín's horn. Zero legs.
function drawFirstBody(ctx,pose,R,t){
const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air||pose.state==="jump";
const phase=Number(pose.phase)||0,beat=Math.sin(phase);
const lift=(Number(pose.bounce)||0)+(run?-2.3*Math.abs(beat):Math.sin(t*.07)*1.35);
const tilt=(air?-.11:0)+(run?-.085*beat:0)+(cuernoSoulBeat(pose,1)==="shy"?.06:0);
const squish=run?.035*Math.abs(beat):0,hurt=pose.state==="hurt"||pose.state==="dead";
ctx.save();ctx.translate(0,lift);ctx.rotate(tilt);
// Three tiny strands of rainbow hair, not a pony's neck or torso.
for(let i=0;i<3;i++){ctx.strokeStyle=["#f4c5e7","#f6dfa9","#bfdcfb"][i];
 ctx.lineWidth=2.5;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-12,-34+i*5);
 ctx.quadraticCurveTo(-25-i*2,-37+i*5,-27-i*3,-24+i*8);ctx.stroke();}
// The face and horn squash together around their shared tip, not as separate stickers.
ctx.save();ctx.translate(4,-91);ctx.scale(1+squish,1-squish);ctx.translate(-4,91);
ctx.save();ctx.translate(0,-31);
// One clean round head; the cuteness comes from the ball itself.
ctx.fillStyle="#ffe7f7";ctx.strokeStyle="#795c91";ctx.lineWidth=2.8;
ctx.beginPath();ctx.arc(0,0,22,0,TAU);ctx.fill();ctx.stroke();
ctx.globalAlpha=.40;ctx.fillStyle="#fff9ff";ctx.beginPath();
ctx.ellipse(-6,-9,11,5,-.35,0,TAU);ctx.fill();
ctx.restore();ctx.globalAlpha=1;
// Keep the spiral horn that was alive in F0, now fixed at the top of the orb.
ctx.fillStyle="#fff0cf";ctx.strokeStyle="#815a91";ctx.lineWidth=2.3;
ctx.beginPath();ctx.moveTo(-6,-49);ctx.bezierCurveTo(-4,-61,-1,-78,4,-91);
ctx.bezierCurveTo(10,-73,12,-59,12,-49);ctx.quadraticCurveTo(3,-44,-6,-49);
ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle="#d9a2df";ctx.lineWidth=1.7;
for(let i=0;i<4;i++){const y=-55-i*8,w=7-i;
 ctx.beginPath();ctx.moveTo(4-w,y+2);ctx.quadraticCurveTo(4,y+5,4+w,y-2);ctx.stroke();}
const mood=hurt?"closed":pose.state==="victory"?"happy":"normal";
R.eye(ctx,-8,-33,5,pose,{iris:"#84529f",mood});
R.eye(ctx,9,-33,5,pose,{iris:"#84529f",mood});
R.blush(ctx,-16,-21,3,"#ffc9df");R.blush(ctx,17,-21,3,"#ffc9df");
R.mouth(ctx,1,-19,4,pose.state==="victory"?"happy":"smile");
ctx.fillStyle="#fff5c8";ctx.beginPath();ctx.arc(4,-91,3,0,TAU);ctx.fill();
ctx.restore(); // End the anchored head; speed lines stay in the body's coordinate frame.
if(run||air){ctx.strokeStyle="#ffd8ee";ctx.globalAlpha=.52;ctx.lineWidth=1.8;
 for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-23-i*7,-14+i*7);
 ctx.lineTo(-30-i*7,-13+i*7);ctx.stroke();}}
if(pose.state==="victory")R.sparkle(ctx,4,-96,3.4,"#ffebaf");
ctx.restore();
drawCuernoOverlays(ctx,pose,R,1,t,lift,tilt);
}

// F2 · First foal body, precisely FOUR articulated legs.
function drawRainbowFoal(ctx,pose,R,t){
const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air||pose.state==="jump";
const phase=Number(pose.phase)||0,beat=Math.sin(phase);
const flourish=Math.sin(Math.PI*Math.max(0,Math.min(1,Number(pose.flourish)||0)));
const hurt=pose.state==="hurt"||pose.state==="dead";
const cast=pose.state==="cast"||pose.state==="attack";
const spring=(Number(pose.bounce)||0)+(run?-2.3*Math.abs(Math.sin(phase*2)):Math.sin(t*.082)*1.35);
const ink="#645478",coat="#f9efff",pearl="#e7d9ff";
const tilt=(air?-.10:0)+(run?-.045*beat:0)+(cast?-.055:0);
ctx.save();ctx.translate(0,spring);ctx.rotate(tilt);
const ribbons=["#faadd9","#fbd27e","#91d7ff","#d2b2ff"];
// All four strands emerge from the croup; no detached tail during the gallop.
drawRootedTail(ctx,pose,2,t,-29,-40,ribbons);
function leg(x,clock,far){
const gait=cuernoLegPose(pose,2,t,clock,far);
const {reach,kneeLift,hoofLift}=gait;
const tuck=gait.tuck+(cuernoSoulBeat(pose,2)==="prance"&&!far&&!air?4:0);
const kneeX=x+reach*.43+(far?-2:2),kneeY=-14+tuck*.48-kneeLift;
const hoofX=x+reach+(far?-2:2),hoofY=2-tuck-hoofLift;
R.limb(ctx,x,-26,kneeX,kneeY,hoofX,hoofY,far?4.4:5.1,far?"#dac6ec":"#f8e4f9",{hand:false});
ctx.fillStyle=far?"#ad95c7":"#bb9dcc";ctx.strokeStyle=ink;ctx.lineWidth=1.35;
ctx.beginPath();ctx.moveTo(hoofX-4.5,hoofY-3);
ctx.quadraticCurveTo(hoofX+1.5,hoofY-4.8,hoofX+5,hoofY-2);
ctx.lineTo(hoofX+5,hoofY+2);ctx.lineTo(hoofX-4.5,hoofY+2);
ctx.closePath();ctx.fill();ctx.stroke();
}
leg(-23,Math.PI*.55,true);leg(8,Math.PI*1.5,true);
ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=2.6;
ctx.beginPath();ctx.moveTo(-30,-40);
ctx.bezierCurveTo(-29,-49,-12,-51,-2,-46);
ctx.bezierCurveTo(13,-48,21,-39,17,-30);
ctx.bezierCurveTo(10,-22,-8,-22,-21,-26);
ctx.quadraticCurveTo(-33,-29,-30,-40);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle=pearl;ctx.globalAlpha=.63;ctx.beginPath();
ctx.ellipse(-10,-30,16,5.5,-.13,0,TAU);ctx.fill();ctx.globalAlpha=1;
for(let i=0;i<3;i++){
ctx.strokeStyle=["#f1a7d5","#f5d081","#8bceea"][i];ctx.lineWidth=2.1;
ctx.beginPath();ctx.moveTo(-24+i*4,-40+i*1.3);
ctx.quadraticCurveTo(-19+i*4,-36+i*1.2,-14+i*4,-39+i*1.2);ctx.stroke();
}
ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=2.4;
ctx.beginPath();ctx.moveTo(3,-33);
ctx.bezierCurveTo(5,-43,7,-55,12,-65);
ctx.bezierCurveTo(19,-73,25,-65,26,-57);
ctx.bezierCurveTo(24,-46,19,-37,15,-31);
ctx.quadraticCurveTo(11,-28,3,-33);ctx.closePath();ctx.fill();ctx.stroke();
for(let i=0;i<5;i++){
const flutter=cuernoManePose(pose,2,t,i);
ctx.strokeStyle=["#ffc0e0","#ffd98a","#a1e6db","#9dcbff","#d1aeff"][i];
ctx.lineWidth=3.3-i*.19;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(9+i*.7,-64+i*4);
ctx.bezierCurveTo(0-i*1.5,-68+i*4,-4+flutter-i,-59+i*5,-9+flutter-i,-64+i*5);ctx.stroke();
}
leg(-16,Math.PI*.04,false);leg(15,Math.PI*1.04,false);
blendLegRoots(ctx,-16,15,-27,coat,"#d5c0e5");
for(const side of [-1,1]){
const x=22+side*6;
ctx.fillStyle="#ffecfa";ctx.strokeStyle=ink;ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(x-3,-68);
ctx.quadraticCurveTo(x+side*3,-84,x+side*7,-70);
ctx.quadraticCurveTo(x+2,-65,x-3,-68);ctx.fill();ctx.stroke();
}
ctx.fillStyle="#fff5fb";ctx.strokeStyle=ink;ctx.lineWidth=2.5;
ctx.beginPath();ctx.ellipse(27,-62,11.6,10,-.12,0,TAU);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(31,-61);
ctx.bezierCurveTo(40,-63,43,-56,42,-52);
ctx.quadraticCurveTo(36,-47,29,-53);ctx.closePath();ctx.fill();ctx.stroke();
R.blush(ctx,34,-56,2.3,"#ffc8e6");
const mood=hurt?"closed":cast?"angry":pose.state==="victory"?"happy":"normal";
R.eye(ctx,26,-64,4.4,pose,{iris:"#8862b9",mood});
R.mouth(ctx,36,-51,3.4,pose.state==="victory"?"happy":cast?"grin":"smile");
ctx.fillStyle="#8b72a0";ctx.beginPath();ctx.arc(40,-56,1.25,0,TAU);ctx.fill();
ctx.save();ctx.translate(24,-71);ctx.rotate((cast?-.12:0)+Math.sin(t*.085)*.018);
horn(ctx,29,"#dab3ff",Math.sin(t*.11)*.29);ctx.restore();
if(cast||pose.state==="victory"||flourish>.2)
R.sparkle(ctx,25,-106,3.1+2.4*Math.max(flourish,.18),"#ffe0a5");
if(run&&Number(pose.speed)>.25){
ctx.save();ctx.globalAlpha=.65;ctx.strokeStyle="#ffdbb9";ctx.lineWidth=1.4;
for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-42-i*8,-14-i*8);ctx.lineTo(-51-i*8,-13-i*8);ctx.stroke();}
ctx.restore();
}
ctx.restore();
drawCuernoOverlays(ctx,pose,R,2,t,spring,tilt);
}

// F3 Unicornio Estelar: true adult anatomy, separate four-beat gallop and a living mane.
function drawStellarUnicorn(ctx,pose,R,t){
const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air||pose.state==="jump"||pose.state==="fall";
const phase=Number(pose.phase)||0,speed=Math.max(0,Math.min(1.4,Number(pose.speed)||0));
const gallop=run?Math.sin(phase):0,flight=air?1:0;
const bounce=(Number(pose.bounce)||0)+(run?-2.7*Math.abs(Math.sin(phase*2)):Math.sin(t*.07)*1.1);
const rear=-24,front=13,coat="#e7f4ff",ink="#475075",shade="#b6d2f3",gold="#ffe49e";
const flare=Math.max(0,Math.min(1,Number(pose.flourish)||0));
const flourish=Math.sin(Math.PI*flare);
const angry=pose.state==="attack"||pose.state==="cast";
const tilt=(air?-.075:0)+(run?-.025*gallop:0)+(cuernoSoulBeat(pose,3)==="stargaze"?-.04:0);
ctx.save();ctx.translate(0,bounce);ctx.rotate(tilt);
drawRootedTail(ctx,pose,3,t,-34,-45,["#b8ddff","#d6b4f4","#ffb9d4","#ffe6a1","#b3f0e7"]);
// Hooves and knees follow four distinct gallop timings. Rear legs paint behind the torso.
function limb(x,clock,back){
const {reach,tuck,kneeLift,hoofLift}=cuernoLegPose(pose,3,t,clock,back);
const bend=4+kneeLift*2;
const kneeX=x+reach*.42+(back?-3:4),kneeY=-18+tuck*.45-kneeLift*.3;
const hoofX=x+reach+(back?-3:3),hoofY=5-tuck-hoofLift;
R.limb(ctx,x,-32,kneeX,kneeY,hoofX,hoofY,back?5.6:6.2,back?"#b6cee9":"#d2e4fc",{hand:false});
ctx.fillStyle=back?"#8c9ac0":"#9eb1d2";ctx.strokeStyle=ink;ctx.lineWidth=1.7;
ctx.beginPath();ctx.moveTo(hoofX-5.5,hoofY-3);
ctx.quadraticCurveTo(hoofX+1,hoofY-6-bend*.05,hoofX+6,hoofY-2);
ctx.lineTo(hoofX+6,hoofY+3);ctx.lineTo(hoofX-5.5,hoofY+3);
ctx.closePath();ctx.fill();ctx.stroke();
}
limb(rear-5,Math.PI*.77,true);
limb(front-2,Math.PI*1.74,true);
ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(-37,-46);
ctx.bezierCurveTo(-29,-58,-12,-56,5,-49);
ctx.bezierCurveTo(19,-51,27,-41,22,-31);
ctx.bezierCurveTo(16,-20,5,-22,-5,-23);
ctx.bezierCurveTo(-18,-19,-35,-27,-37,-46);ctx.closePath();ctx.fill();ctx.stroke();
ctx.save();ctx.globalAlpha=.52;ctx.fillStyle=shade;ctx.beginPath();
ctx.ellipse(-12,-32,20,7,-.13,0,TAU);ctx.fill();ctx.restore();
// V74: wings are born in F3, not first in the final form.
const wingMotion=cuernoWingPose(pose,3,t),spread=wingMotion.open;
function stellarWing(far){
 const flutter=wingMotion.flap*(far?.72:1);
 ctx.save();ctx.translate(far?-17:-6,-48);
 ctx.rotate(-.13-spread*.20+wingMotion.hinge*(far?.6:1));
 // F3 plumes must be discernible from the pale foal's white coat.
 ctx.fillStyle=far?"#aebce0":"#b0d4f2";ctx.strokeStyle="#617ba9";
 ctx.globalAlpha=far?.68:.93;ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,0);
 ctx.bezierCurveTo(-19,-10,-31-spread*11,-27,-39,-29-spread*21+flutter);
 ctx.bezierCurveTo(-50,-47-spread*22,-33,-56-spread*20,-21,-46-spread*13);
 ctx.bezierCurveTo(-10,-26,5,-16,8,-3);ctx.closePath();ctx.fill();ctx.stroke();
 for(let i=0;i<4;i++){ctx.strokeStyle=["#ffd9ea","#c8d4ff","#bbece6","#ffe3b5"][i];
 ctx.lineWidth=2.5-i*.3;ctx.beginPath();ctx.moveTo(-2+i*2,-5-i*4);
 ctx.quadraticCurveTo(-23-i*3,-25-spread*10,-29-i*3,-29-spread*(25-i*5)+flutter);
 ctx.stroke();}
 ctx.restore();
}
stellarWing(true);
ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(4,-35);
ctx.bezierCurveTo(3,-52,9,-70,13,-78);
ctx.bezierCurveTo(19,-88,30,-80,32,-69);
ctx.bezierCurveTo(29,-56,26,-44,21,-35);
ctx.quadraticCurveTo(13,-28,4,-35);ctx.closePath();ctx.fill();ctx.stroke();
// A constellation on the flank: discreet embroidered stars in motion.
ctx.fillStyle="#8ba8dc";
for(const [x,y] of [[-24,-43],[-14,-39],[-5,-44]]){
ctx.beginPath();ctx.arc(x,y,1.4,0,TAU);ctx.fill();
}
ctx.strokeStyle="#a1bde5";ctx.lineWidth=1.2;ctx.beginPath();
ctx.moveTo(-24,-43);ctx.lineTo(-14,-39);ctx.lineTo(-5,-44);ctx.stroke();
stellarWing(false);
drawWingScapula(ctx,-6,-48,"#d0e7f9","#effaff");
limb(rear+5,Math.PI*.02,false);
limb(front+6,Math.PI*1.02,false);
blendLegRoots(ctx,rear+5,front+6,-33,coat,"#9cbeda");
for(let i=0;i<5;i++){
const drag=cuernoManePose(pose,3,t,i);
ctx.strokeStyle=["#b1e7ff","#e0c0fb","#ffb4d5","#ffe3a3","#c5d8ff"][i];
ctx.lineWidth=5.3-i*.24;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(9+i*.8,-78+i*4);
ctx.bezierCurveTo(1-i*2,-82+i*5,-7-i*2+drag,-68+i*6,-18-i*2+drag,-75+i*5);
ctx.stroke();
}
for(const side of [-1,1]){
const x=20+side*8;
ctx.fillStyle="#ecf4ff";ctx.strokeStyle=ink;ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(x-4,-76);ctx.quadraticCurveTo(x+side*4,-94,x+side*9,-78);
ctx.quadraticCurveTo(x+3,-73,x-4,-76);ctx.fill();ctx.stroke();
}
ctx.fillStyle="#ecf4ff";ctx.strokeStyle=ink;ctx.lineWidth=3;
ctx.beginPath();ctx.ellipse(30,-72,14,13,-.17,0,TAU);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(33,-70);ctx.bezierCurveTo(43,-73,47,-65,46,-59);
ctx.quadraticCurveTo(41,-52,31,-56);ctx.closePath();ctx.fill();ctx.stroke();
R.blush(ctx,37,-65,2.6,"#f2afcf");
const mood=pose.state==="hurt"||pose.state==="dead"?"closed":angry?"angry":pose.state==="victory"?"happy":"normal";
R.eye(ctx,29,-73,5,pose,{iris:"#5667ad",mood});
R.mouth(ctx,40,-56,4.2,pose.state==="victory"?"happy":angry?"grin":"smile");
ctx.fillStyle="#7c7ca3";ctx.beginPath();ctx.arc(43,-64,1.8,0,TAU);ctx.fill();
ctx.save();ctx.translate(25,-83);
ctx.rotate(-.06+(angry?-.12*Math.sin(Math.PI*(Number(pose.cast)||Number(pose.atk)||0)):0));
horn(ctx,37,"#9ad7ff",Math.sin(t*.12)*.48);
ctx.restore();
if(angry||pose.state==="victory"){
R.sparkle(ctx,25,-124,5+2*Math.sin(t*.07),"#ffdfa2");
}
if(run&&speed>.23){
ctx.save();ctx.strokeStyle=gold;ctx.lineWidth=1.8;ctx.globalAlpha=.35+.25*speed;
for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-47-i*9,-25-i*9);ctx.lineTo(-61-i*9,-24-i*9);ctx.stroke();}
ctx.restore();
}
if(flourish>.05){
ctx.save();ctx.globalAlpha=.38*flourish;ctx.strokeStyle="#f8d0ff";ctx.lineWidth=2;
ctx.beginPath();ctx.arc(25,-121,9+18*flourish,-.6,2.7);ctx.stroke();ctx.restore();
}
ctx.restore();
drawCuernoOverlays(ctx,pose,R,3,t,bounce,tilt);
}

// V74 F4: elegant OBSIDIAN BLACK unicorn, not a scaled-up white foal.
function drawAuroraUnicorn(ctx,pose,R,t){
const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air||pose.state==="jump";
const cast=pose.state==="cast"||pose.state==="attack",triumph=pose.state==="victory";
const hurt=pose.state==="hurt"||pose.state==="dead";
const phase=Number(pose.phase)||0,beat=Math.sin(phase),speed=Math.max(0,Number(pose.speed)||0);
const flourish=Math.sin(Math.PI*Math.max(0,Math.min(1,Number(pose.flourish)||0)));
const soul=cuernoSoulBeat(pose,4);
const magic=cuernoMagicPose(pose,4);
const wingMotion=cuernoWingPose(pose,4,t),unfold=wingMotion.open;
const ink="#a69ab6",coat="#1b1a28",shadow="#39364e",gold="#f8d994";
const colors=["#ffe1be","#f7bddf","#bed8ff","#a5ece4","#d9c9ff","#fff2bd"];
const bounce=(Number(pose.bounce)||0)+(run?-2.4*Math.abs(Math.sin(phase*2)):Math.sin(t*.055)*.8);
const tilt=(air?-.065:0)+(run?-.026*beat:0)+(cast?-.04:0)+(soul==="bow"?.08*Math.sin(Math.PI*(Number(pose.flourish)||.6)):soul==="sneeze"?-.06:0);
ctx.save();ctx.translate(0,bounce);ctx.rotate(tilt);
// V75: root the rainbow tail beneath the obsidian croup. Its arc stays inside
// a small envelope during runs, jumps and cinematic poses, never flying away.
drawRootedTail(ctx,pose,4,t,-40,-44,colors);
// Translucent aurora pinions: folded while resting, unfolding for jumps and casting.
function wing(far){
const flap=wingMotion.flap*(far?.72:1)+(cast?-1.2:0);
ctx.save();ctx.translate(far?-12:0,-52);
ctx.rotate((far?-.24:.05)-unfold*.24+wingMotion.hinge*(far?.7:1));
ctx.globalAlpha=far?.45:.68;
ctx.fillStyle=far?"#373653":"#343650";
ctx.strokeStyle=far?"#8f82ba":"#b5a6cb";ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(0,0);
ctx.bezierCurveTo(-9,-14,-27,-25-unfold*12,-34,-34-unfold*36+flap);
ctx.bezierCurveTo(-48,-60-unfold*32,-34,-80-unfold*20,-20,-62-unfold*28);
ctx.bezierCurveTo(-13,-37,9,-20,8,-5);ctx.closePath();ctx.fill();ctx.stroke();
for(let i=0;i<5;i++){
const spread=i*5,tipY=-37-unfold*(45-i*5)+flap;
ctx.strokeStyle=colors[(i+2)%colors.length];ctx.lineWidth=2.6-i*.26;
ctx.beginPath();ctx.moveTo(-2+i*2,-9-i*4);
ctx.quadraticCurveTo(-24-spread,-30-unfold*13,-23-spread,tipY);ctx.stroke();
}
ctx.restore();
}
wing(true);
// Four physically independent legs, different from the young foal and stellar gallop.
function leg(x,clock,far){
const {reach,tuck,kneeLift,hoofLift}=cuernoLegPose(pose,4,t,clock,far);
const kneeX=x+reach*.48+(far?-4:4),kneeY=-17+tuck*.5-kneeLift*.3;
const hoofX=x+reach+(far?-5:4),hoofY=6-tuck-hoofLift;
R.limb(ctx,x,-33,kneeX,kneeY,hoofX,hoofY,far?5.8:6.5,far?"#363247":"#272431",{hand:false});
ctx.fillStyle=far?"#57516b":"#66576d";ctx.strokeStyle=ink;ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(hoofX-5.8,hoofY-3);
ctx.quadraticCurveTo(hoofX+.5,hoofY-6,hoofX+6,hoofY-2);
ctx.lineTo(hoofX+6,hoofY+3);ctx.lineTo(hoofX-5.8,hoofY+3);
ctx.closePath();ctx.fill();ctx.stroke();
ctx.strokeStyle=gold;ctx.lineWidth=1.1;ctx.beginPath();
ctx.moveTo(hoofX-4,hoofY+1);ctx.lineTo(hoofX+4,hoofY+1);ctx.stroke();
}
leg(-30,Math.PI*.67,true);leg(12,Math.PI*1.72,true);
// Sleek long barrel with a defined croup and shoulder, no spherical body.
ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=2.9;
ctx.beginPath();ctx.moveTo(-43,-45);
ctx.bezierCurveTo(-37,-62,-18,-61,-3,-53);
ctx.bezierCurveTo(17,-57,30,-45,23,-30);
ctx.bezierCurveTo(10,-22,-8,-23,-26,-26);
ctx.bezierCurveTo(-39,-27,-46,-37,-43,-45);ctx.closePath();ctx.fill();ctx.stroke();
// An indigo rim reads as BLACK fur even when the sky and UI are dark.
ctx.save();ctx.globalAlpha=.7;ctx.lineWidth=1.7;ctx.strokeStyle="#a7a1d8";
ctx.beginPath();ctx.moveTo(-39,-46);
ctx.bezierCurveTo(-30,-58,-16,-59,-4,-52);
ctx.quadraticCurveTo(9,-55,19,-47);ctx.stroke();
ctx.restore();
ctx.fillStyle=shadow;ctx.globalAlpha=.46;ctx.beginPath();
ctx.ellipse(-11,-31,27,6,-.06,0,TAU);ctx.fill();ctx.globalAlpha=1;
// An opalescent embroidery on Aurora's flank, never a second drawn character.
ctx.save();ctx.strokeStyle="#a998cb";ctx.lineWidth=1.3;ctx.globalAlpha=.66;
for(let i=0;i<3;i++){
 ctx.beginPath();ctx.moveTo(-27+i*9,-48+i*.7);
 ctx.quadraticCurveTo(-24+i*9,-44+i*.5,-20+i*9,-47+i*.5);ctx.stroke();
}
ctx.restore();
// The flanks carry their own narrow starmap, not a ring of visual clutter.
ctx.strokeStyle="#c2a2d9";ctx.lineWidth=1.5;ctx.beginPath();
ctx.moveTo(-28,-45);ctx.lineTo(-18,-40);ctx.lineTo(-9,-46);ctx.lineTo(0,-40);ctx.stroke();
for(const [x,y] of [[-28,-45],[-18,-40],[-9,-46],[0,-40]]){
ctx.fillStyle=gold;ctx.beginPath();ctx.arc(x,y,1.7,0,TAU);ctx.fill();
}
// Proud swan-neck and true chest, joining the mature equine body organically.
// The swan-neck tapers from chest to poll: two unequal S-curves, no rectangle.
ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=2.8;
ctx.beginPath();ctx.moveTo(3,-34);
ctx.bezierCurveTo(5,-49,6,-71,22,-85);
ctx.bezierCurveTo(27,-91,35,-88,35,-79);
ctx.bezierCurveTo(37,-70,29,-65,26,-56);
ctx.bezierCurveTo(22,-45,29,-38,26,-31);
ctx.quadraticCurveTo(13,-25,3,-34);ctx.closePath();ctx.fill();ctx.stroke();
ctx.save();ctx.strokeStyle="#b1a5d0";ctx.lineWidth=1.7;ctx.globalAlpha=.8;
ctx.beginPath();ctx.moveTo(9,-42);ctx.bezierCurveTo(14,-51,15,-67,22,-76);ctx.stroke();
// The reflected moon separates the throat and curved chest, no rectangular slab.
ctx.strokeStyle="#6d668c";ctx.lineWidth=1.1;ctx.globalAlpha=.56;
ctx.beginPath();ctx.moveTo(24,-57);ctx.bezierCurveTo(19,-47,26,-38,20,-32);ctx.stroke();
ctx.restore();
wing(false);
drawWingScapula(ctx,0,-52,"#343347","#c6b7dc");
leg(-20,Math.PI*.03,false);leg(20,Math.PI*1.04,false);
blendLegRoots(ctx,-20,20,-34,coat,"#8f7ea5");
// Seven locks of iridescent mane: reactive but bounded.
for(let i=0;i<7;i++){
const drag=cuernoManePose(pose,4,t,i);
ctx.strokeStyle=colors[(i+1)%colors.length];ctx.lineWidth=5.8-i*.40;
ctx.lineCap="round";ctx.beginPath();ctx.moveTo(17+i*.75,-83+i*3.9);
ctx.bezierCurveTo(7-i*1.6,-94+i*5,-8-i*2+drag,-70+i*5,-23-i*2+drag,-83+i*5);
ctx.stroke();
}
// Expressive adult head: ear silhouette, broad forehead, proper equine muzzle.
for(const side of [-1,1]){
const x=28+side*8;ctx.fillStyle="#292634";ctx.strokeStyle=ink;ctx.lineWidth=1.9;
ctx.beginPath();ctx.moveTo(x-4,-81);ctx.quadraticCurveTo(x+side*5,-101,x+side*9,-84);
ctx.quadraticCurveTo(x+2,-77,x-4,-81);ctx.fill();ctx.stroke();
}
ctx.fillStyle="#292735";ctx.strokeStyle="#c1b3d7";ctx.lineWidth=2.5;
ctx.beginPath();ctx.ellipse(37,-77,14.5,13,-.12,0,TAU);ctx.fill();ctx.stroke();
ctx.fillStyle="#3e3648";ctx.beginPath();ctx.moveTo(39,-75);
ctx.bezierCurveTo(53,-78,56,-68,53,-62);
ctx.quadraticCurveTo(48,-57,38,-61);ctx.closePath();ctx.fill();ctx.stroke();
// A cheekbone and soft muzzle bridge give the black profile an actual face.
ctx.save();ctx.strokeStyle="#aa8fae";ctx.globalAlpha=.42;ctx.lineWidth=1.3;
ctx.beginPath();ctx.moveTo(41,-71);ctx.quadraticCurveTo(48,-72,51,-67);ctx.stroke();
ctx.beginPath();ctx.moveTo(13,-40);ctx.quadraticCurveTo(20,-38,22,-33);ctx.stroke();
ctx.restore();
R.blush(ctx,45,-68,2.0,"#bb7d99");
R.eye(ctx,35,-79,5,pose,{iris:"#dcc3ff",mood:hurt||soul==="sneeze"||soul==="bow"||magic?.slot===3?"closed":triumph?"happy":cast?"angry":"normal"});
R.mouth(ctx,48,-61,4.1,soul==="sneeze"?"o":magic?.slot===3?"smile":triumph?"happy":cast?"grin":"smile");
ctx.fillStyle="#e7c9e2";ctx.beginPath();ctx.arc(51,-69,1.8,0,TAU);ctx.fill();
// A crown-horn rises naturally from the brow with visible spiral relief.
ctx.save();ctx.translate(33,-90);ctx.rotate(-.085+(cast?-.08:0));
ctx.fillStyle="#fff5ce";ctx.strokeStyle="#9e9bc1";ctx.lineWidth=1.7;
ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(-3,-18,-1,-49);
ctx.quadraticCurveTo(6,-25,6,0);ctx.closePath();ctx.fill();ctx.stroke();
ctx.strokeStyle="#d3a4e3";ctx.lineWidth=1.8;
for(let i=1;i<=5;i++){
const y=-i*8,w=4.7-i*.55;ctx.beginPath();ctx.moveTo(-w,y+2);
ctx.quadraticCurveTo(0,y+5,w,y-2);ctx.stroke();
}
ctx.strokeStyle="#fffbea";ctx.lineWidth=.9;ctx.globalAlpha=.78;
ctx.beginPath();ctx.moveTo(-1,-9);ctx.quadraticCurveTo(-1,-23,-1,-42);ctx.stroke();
ctx.restore();
// F4 U is carried by the anatomy: the living horn crowns the quiet dream.
if(magic?.slot===3){
ctx.save();ctx.lineCap="round";
const bloom=Math.max(.15,Math.min(1,magic.strength||.35));
for(let i=0;i<7;i++){
const angle=(i/7)*Math.PI*1.4-.25;
ctx.strokeStyle=colors[i%colors.length];ctx.lineWidth=1.4;
ctx.globalAlpha=(.22+i*.025)*bloom;
ctx.beginPath();ctx.arc(33,-139,11+i*2,angle,angle+.62);ctx.stroke();
}
ctx.restore();
}
// Rare magical accents appear with actions, not perpetual particles.
if(cast||triumph||flourish>.12){
ctx.save();ctx.globalAlpha=.35+.3*Math.max(flourish,.1);
ctx.strokeStyle="#c4ffe9";ctx.lineWidth=2;ctx.beginPath();
ctx.arc(33,-139,8+17*flourish,-.8,2.5);ctx.stroke();ctx.restore();
R.sparkle(ctx,32,-144,4+flourish*4,gold);
}
if(run&&speed>.25){
ctx.save();ctx.globalAlpha=.40;ctx.strokeStyle=gold;ctx.lineWidth=1.5;
for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-51-i*8,-20-i*9);ctx.lineTo(-68-i*8,-19-i*9);ctx.stroke();}
ctx.restore();
}
ctx.restore();
drawCuernoOverlays(ctx,pose,R,4,t,bounce,tilt);
}

// One media query object, with live .matches; no per-frame matchMedia calls.
const CUERNO_MOTION_MEDIA=typeof window!=="undefined"&&typeof window.matchMedia==="function"
  ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
function draw(ctx, pose, R) {
  // When U protects the character, rig invulnerability can shadow "cast"
  // with "hurt". Keep the unicorn's dream visible, never mask real damage.
  if(pose.state==="hurt"&&pose.castSlot===3&&Number(pose.cast)>0)
    pose={...pose,state:"cast"};
  if(CUERNO_MOTION_MEDIA?.matches&&!pose?.reduceMotion)pose={...pose,reduceMotion:true};
  const f = Math.max(0, Math.min(4, pose.form | 0));
  if (f === 0) { drawLivingHorn(ctx,pose,R,pose.t||0); return; }
  if (f === 1) { drawFirstBody(ctx,pose,R,pose.t||0); return; }
  if (f === 2) { drawRainbowFoal(ctx,pose,R,pose.t||0); return; }
  if (f === 3) { drawStellarUnicorn(ctx,pose,R,pose.t||0); return; }
  drawAuroraUnicorn(ctx,pose,R,pose.t||0);
}

export default { id: "cuerno", draw };
