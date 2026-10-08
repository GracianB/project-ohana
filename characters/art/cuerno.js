// Cuerno V59 · born as a sentient unicorn horn; a unicorn body emerges later.
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
const HORN_TIPS=[[0,-65],[7,-88],[24,-100],[25,-120],[33,-139]];
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

function drawCuernoOverlays(ctx,pose,R,form,t,lift,tilt){
ctx.save();ctx.translate(0,lift);ctx.rotate(tilt);
drawCuernoSoul(ctx,pose,R,form,t);
drawCuernoMagic(ctx,pose,R,form,t);
ctx.restore();
}

function horn(ctx, len, color, wobble) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 1; i <= 8; i++) {
    const k = i / 8;
    const side = i % 2 ? 1 : -1;
    ctx.lineTo(side * (2.4 + k * 3.2) + wobble, -k * len);
  }
  ctx.strokeStyle = "#fff6ea";
  ctx.lineWidth = 5.2;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(wobble * 0.3, -len, 3.2 + len * 0.03, 0, Math.PI * 2);
  ctx.fill();
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
  // Embryonic pearl below the horn is a collar, not a quadruped.
  R.ellipse(ctx,0,-17,11,7.2,"#f6bedf");
  R.celShade(ctx,0,-17,11,7.2,"#f6bedf",.12);
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

// F1 Destello: the pearl horn grows a neck, ears, a muzzle and TWO tentative hooves.
// Its back half is still a ribbon of light: a newborn creature, not a tiny horse.
function drawFirstBody(ctx,pose,R,t){
  const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air;
  const beat=Math.sin(pose.phase||t*.14),lift=(pose.bounce||0)+(run?-2*Math.abs(beat):Math.sin(t*.07)*1.5);
  const hurt=pose.state==="hurt"||pose.state==="dead";
  const flourish=pose.flourish>0?Math.sin(Math.PI*pose.flourish):0;
  const shy=pose.flourishN%3===0?flourish:0;
  const proud=pose.flourishN%3===2?flourish:0;
  const sway=Math.sin(t*.08)*2+(run?beat*3:0);
  const tilt=(air?-.10:0)+(run?-.055*beat:0)-shy*.09;
  ctx.save();ctx.translate(0,lift);ctx.rotate(tilt);
  // A liquid rainbow tail flows from the unfinished hindquarters.
  ctx.fillStyle="#ce9cf1";ctx.strokeStyle="#654977";ctx.lineWidth=2.1;
  ctx.beginPath();ctx.moveTo(-13,-28);ctx.quadraticCurveTo(-34,-35,-34-sway,-19);
  ctx.quadraticCurveTo(-41-sway,-9,-31-sway,-7);ctx.quadraticCurveTo(-25,-13,-18,-14);
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle="#fbd4ea";ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(-21,-25);ctx.quadraticCurveTo(-36-sway,-22,-33-sway,-10);ctx.stroke();
  // Two sprouting hooves move independently; the body cannot gallop yet.
  for(const [x,flip] of [[-9,-1],[12,1]]){
    const step=run?beat*flip*7:air?flip*5:flourish*flip*2;
    ctx.save();ctx.translate(x,-17);ctx.rotate(step*.055);
    R.limb(ctx,0,0,step*.22,7,step*.36,14,4.6,"#f6e3f3",{hand:false});
    R.ellipse(ctx,step*.36,14,5.4,3.2,flip===1?"#d8b4e7":"#e4c2ed");
    ctx.strokeStyle="#694a80";ctx.lineWidth=1.4;ctx.beginPath();
    ctx.moveTo(step*.36-4,14);ctx.lineTo(step*.36+4,14);ctx.stroke();ctx.restore();
  }
  // A curled foal seed grows from the collar of Cuernín; distinct from F0's cone.
  ctx.fillStyle="#ffe8f5";ctx.strokeStyle="#624d80";ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(-16,-27);
  ctx.bezierCurveTo(-20,-43,-8,-50,3,-46);
  ctx.bezierCurveTo(12,-43,16,-30,15,-24);
  ctx.quadraticCurveTo(0,-14,-16,-27);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle="#dbaae5";ctx.beginPath();ctx.ellipse(-3,-29,8,6,.1,0,TAU);ctx.fill();
  // Neck is a continuous tapered shape joining the new head to the body.
  ctx.fillStyle="#fff2ed";ctx.strokeStyle="#694a80";ctx.lineWidth=2.7;
  ctx.beginPath();ctx.moveTo(1,-34);ctx.quadraticCurveTo(-9,-51,-3,-61);
  ctx.quadraticCurveTo(8,-71,18,-56);ctx.lineTo(21,-37);
  ctx.quadraticCurveTo(14,-34,1,-34);ctx.closePath();ctx.fill();ctx.stroke();
  // Soft peach ear buds and a tiny mane (not an adult unicorn crest).
  for(const [x,side] of [[-3,-1],[16,1]]){
    ctx.fillStyle="#fae1ef";ctx.beginPath();ctx.moveTo(x,-56);
    ctx.quadraticCurveTo(x+side*7,-78,x+side*11,-63);
    ctx.quadraticCurveTo(x+side*9,-56,x,-56);ctx.fill();ctx.stroke();
    ctx.fillStyle="#dfa3bf";ctx.beginPath();ctx.ellipse(x+side*6,-64,2.2,5,side*.23,0,TAU);ctx.fill();
  }
  ctx.fillStyle="#d9abeb";for(let i=0;i<3;i++){
    ctx.beginPath();ctx.ellipse(-5-i*2,-53+i*7,3.5,5.5,-.35,0,TAU);ctx.fill();
  }
  // The original horn remains its soul, now anchored to the forehead.
  ctx.save();ctx.translate(7,-62);ctx.rotate(.10+proud*.13+(run?beat*.04:0));
  horn(ctx,26+2*proud,"#f4abd8",Math.sin(t*.11)*.36);ctx.restore();
  // The muzzle finally begins to appear, with its own expression.
  R.ellipse(ctx,14,-42,9.3,6.9,"#ffe5ec");
  R.blush(ctx,18,-46,2.3,"#f8a6c5");
  const mood=hurt?"closed":pose.state==="attack"?"angry":pose.state==="victory"?"happy":"normal";
  R.eye(ctx,1,-50,4.3,pose,{iris:"#7852a2",mood});
  R.eye(ctx,12,-49,3.8,pose,{iris:"#7852a2",mood});
  R.mouth(ctx,15,-39,3.4,mood==="happy"?"happy":shy>0.25?"o":"smile");
  if(proud>.1||pose.state==="cast")R.sparkle(ctx,12,-89,2+4*Math.max(proud,.3),"#ffe8a7");
  // Jump gathers the unfinished limbs; speed produces tiny pearl beats.
  if(run||air){
    ctx.globalAlpha=.46;ctx.strokeStyle="#ffe0b0";ctx.lineWidth=1.8;
    for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-20-i*7,-7+i*5);ctx.lineTo(-31-i*8,-7+i*5);ctx.stroke();}
  }
  ctx.restore();
drawCuernoOverlays(ctx,pose,R,1,t,lift,tilt);
}

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
for(let i=0;i<4;i++){
const sway=Math.sin(t*.105+i*.68)*2.2+(run?beat*4:0);
ctx.strokeStyle=ribbons[i];ctx.lineWidth=4.2-i*.32;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-29,-39+i);
ctx.bezierCurveTo(-42,-45+i*2,-48-sway,-24+i*3,-51-sway,-23+i*4);ctx.stroke();
}
function leg(x,clock,far){
const stride=run?Math.sin(phase+clock):0,reach=stride*(far?6:7.6);
const tuck=air?(far?8:10):(cuernoSoulBeat(pose,2)==="prance"&&!far?4:0);
const kneeX=x+reach*.43+(far?-2:2),kneeY=-14+tuck*.48;
const hoofX=x+reach+(far?-2:2),hoofY=2-tuck;
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
const flutter=Math.sin(t*.13+i*.83)*2+(run?beat*2.8:0);
ctx.strokeStyle=["#ffc0e0","#ffd98a","#a1e6db","#9dcbff","#d1aeff"][i];
ctx.lineWidth=3.3-i*.19;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(9+i*.7,-64+i*4);
ctx.bezierCurveTo(0-i*1.5,-68+i*4,-4+flutter-i,-59+i*5,-9+flutter-i,-64+i*5);ctx.stroke();
}
leg(-16,Math.PI*.04,false);leg(15,Math.PI*1.04,false);
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
const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air;
const phase=Number(pose.phase)||0,speed=Math.max(0,Math.min(1.4,Number(pose.speed)||0));
const gallop=run?Math.sin(phase):0,flight=air?1:0;
const bounce=(Number(pose.bounce)||0)+(run?-2.7*Math.abs(Math.sin(phase*2)):Math.sin(t*.07)*1.1);
const rear=-24,front=13,coat="#e7f4ff",ink="#475075",shade="#b6d2f3",gold="#ffe49e";
const flare=Math.max(0,Math.min(1,Number(pose.flourish)||0));
const flourish=Math.sin(Math.PI*flare);
const angry=pose.state==="attack"||pose.state==="cast";
const tilt=(air?-.075:0)+(run?-.025*gallop:0)+(cuernoSoulBeat(pose,3)==="stargaze"?-.04:0);
ctx.save();ctx.translate(0,bounce);ctx.rotate(tilt);
for(let i=0;i<5;i++){
const sw=Math.sin(t*.105+i*.65)*3+(run?gallop*5:0);
ctx.save();ctx.globalAlpha=.88-i*.10;
ctx.strokeStyle=["#b8ddff","#d6b4f4","#ffb9d4","#ffe6a1","#b3f0e7"][i];
ctx.lineWidth=3.7-i*.25;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-34,-45+i*.9);
ctx.bezierCurveTo(-53-sw*.4,-43+i*3,-51-sw,-27+i*3,-61-sw,-30+i*4);
ctx.stroke();ctx.restore();
}
// Hooves and knees follow four distinct gallop timings. Rear legs paint behind the torso.
function limb(x,clock,back){
const beat=run?Math.sin(phase+clock):0,reach=run?beat*(back?7.5:10):0;
const tuck=flight*(back?8:12);
const bend=4+Math.max(0,-beat)*5;
const kneeX=x+reach*.42+(back?-3:4),kneeY=-18+tuck*.45;
const hoofX=x+reach+(back?-3:3),hoofY=5-tuck;
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
limb(rear+5,Math.PI*.02,false);
limb(front+6,Math.PI*1.02,false);
for(let i=0;i<5;i++){
const drag=Math.sin(t*.11+i*.74)*3+(run?gallop*3:0);
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

// V64 F4: original adult Unicornio Aurora. Wings are a visual signature, not flight physics.
function drawAuroraUnicorn(ctx,pose,R,t){
const TAU=Math.PI*2,run=pose.state==="run",air=!!pose.air||pose.state==="jump";
const cast=pose.state==="cast"||pose.state==="attack",triumph=pose.state==="victory";
const hurt=pose.state==="hurt"||pose.state==="dead";
const phase=Number(pose.phase)||0,beat=Math.sin(phase),speed=Math.max(0,Number(pose.speed)||0);
const flourish=Math.sin(Math.PI*Math.max(0,Math.min(1,Number(pose.flourish)||0)));
const soul=cuernoSoulBeat(pose,4);
const magic=cuernoMagicPose(pose,4);
const unfold=air?1:magic?.slot===3?1:magic?.slot===2?.86:cast?.9:triumph?1:run?.48:soul==="bow"?.19:soul==="stargaze"?.76:.32;
const ink="#4d5478",coat="#fffaf0",shadow="#d6d6f0",gold="#f7d78a";
const colors=["#f9d8b5","#f5b9e0","#b8d0ff","#a5ece4","#d9b8ff","#fff2b9"];
const bounce=(Number(pose.bounce)||0)+(run?-2.4*Math.abs(Math.sin(phase*2)):Math.sin(t*.055)*.8);
const tilt=(air?-.065:0)+(run?-.026*beat:0)+(cast?-.04:0)+(soul==="bow"?.08*Math.sin(Math.PI*(Number(pose.flourish)||.6)):soul==="sneeze"?-.06:0);
ctx.save();ctx.translate(0,bounce);ctx.rotate(tilt);
// Six trailing strands rise from the living comet tail of Unicornio Estelar.
for(let i=0;i<6;i++){
const sway=Math.sin(t*.068+i*.53)*3+(run?beat*4:0);
ctx.save();ctx.globalAlpha=.78-i*.045;ctx.strokeStyle=colors[i];
ctx.lineWidth=4.1-i*.32;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-40,-44+i*.6);
ctx.bezierCurveTo(-55,-57+i*3,-57-sway,-20+i*3,-77-sway,-31+i*3);
ctx.stroke();ctx.restore();
}
// Translucent aurora pinions: folded while resting, unfolding for jumps and casting.
function wing(far){
const flap=Math.sin(t*.10+(far?1:0))*2.1*(.25+unfold);
ctx.save();ctx.translate(far?-12:0,-52);
ctx.rotate((far?-.24:.05)-unfold*.24);
ctx.globalAlpha=far?.45:.68;
ctx.fillStyle=far?"#c0d6ff":"#d5f8f1";
ctx.strokeStyle=far?"#a6b6e9":"#91d3cd";ctx.lineWidth=1.6;
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
const step=run?Math.sin(phase+clock):0,reach=run?step*(far?9:12):0,tuck=air?(far?10:14):0;
const kneeX=x+reach*.48+(far?-4:4),kneeY=-17+tuck*.5;
const hoofX=x+reach+(far?-5:4),hoofY=6-tuck;
R.limb(ctx,x,-33,kneeX,kneeY,hoofX,hoofY,far?5.8:6.5,far?"#d6d8ef":"#fff0ea",{hand:false});
ctx.fillStyle=far?"#aab2d5":"#e5c6b8";ctx.strokeStyle=ink;ctx.lineWidth=1.6;
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
ctx.fillStyle=shadow;ctx.globalAlpha=.58;ctx.beginPath();
ctx.ellipse(-11,-31,27,6,-.06,0,TAU);ctx.fill();ctx.globalAlpha=1;
// The flanks carry their own narrow starmap, not a ring of visual clutter.
ctx.strokeStyle="#b5a2d6";ctx.lineWidth=1.5;ctx.beginPath();
ctx.moveTo(-28,-45);ctx.lineTo(-18,-40);ctx.lineTo(-9,-46);ctx.lineTo(0,-40);ctx.stroke();
for(const [x,y] of [[-28,-45],[-18,-40],[-9,-46],[0,-40]]){
ctx.fillStyle=gold;ctx.beginPath();ctx.arc(x,y,1.7,0,TAU);ctx.fill();
}
// Proud swan-neck and true chest, joining the mature equine body organically.
ctx.fillStyle=coat;ctx.strokeStyle=ink;ctx.lineWidth=2.8;
ctx.beginPath();ctx.moveTo(6,-34);
ctx.bezierCurveTo(7,-50,14,-72,18,-85);
ctx.bezierCurveTo(24,-94,35,-89,35,-76);
ctx.bezierCurveTo(32,-58,27,-41,22,-33);
ctx.quadraticCurveTo(14,-27,6,-34);ctx.closePath();ctx.fill();ctx.stroke();
wing(false);
leg(-20,Math.PI*.03,false);leg(20,Math.PI*1.04,false);
// Seven locks of iridescent mane: reactive but bounded.
for(let i=0;i<7;i++){
const drag=Math.sin(t*.09+i*.57)*3.2+(run?beat*4:0)+(air?3:0);
ctx.strokeStyle=colors[(i+1)%colors.length];ctx.lineWidth=5.8-i*.40;
ctx.lineCap="round";ctx.beginPath();ctx.moveTo(17+i*.75,-83+i*3.9);
ctx.bezierCurveTo(7-i*1.6,-94+i*5,-8-i*2+drag,-70+i*5,-23-i*2+drag,-83+i*5);
ctx.stroke();
}
// Expressive adult head: ear silhouette, broad forehead, proper equine muzzle.
for(const side of [-1,1]){
const x=28+side*8;ctx.fillStyle="#fff8ed";ctx.strokeStyle=ink;ctx.lineWidth=1.9;
ctx.beginPath();ctx.moveTo(x-4,-81);ctx.quadraticCurveTo(x+side*5,-101,x+side*9,-84);
ctx.quadraticCurveTo(x+2,-77,x-4,-81);ctx.fill();ctx.stroke();
}
ctx.fillStyle="#fffdf6";ctx.strokeStyle=ink;ctx.lineWidth=2.9;
ctx.beginPath();ctx.ellipse(37,-77,14.5,13,-.12,0,TAU);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(39,-75);
ctx.bezierCurveTo(53,-78,56,-68,53,-62);
ctx.quadraticCurveTo(48,-57,38,-61);ctx.closePath();ctx.fill();ctx.stroke();
R.blush(ctx,45,-68,2.2,"#f6d5d7");
R.eye(ctx,35,-79,5,pose,{iris:"#7e78b4",mood:hurt||soul==="sneeze"||soul==="bow"||magic?.slot===3?"closed":cast?"angry":triumph?"happy":"normal"});
R.mouth(ctx,48,-61,4.1,soul==="sneeze"?"o":magic?.slot===3?"smile":triumph?"happy":cast?"grin":"smile");
ctx.fillStyle="#a495a3";ctx.beginPath();ctx.arc(51,-69,1.8,0,TAU);ctx.fill();
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
ctx.restore();
// Rare magical accents appear with actions, not perpetual particles.
if(cast||triumph||flourish>.12){
ctx.save();ctx.globalAlpha=.35+.3*Math.max(flourish,.1);
ctx.strokeStyle="#c4ffe9";ctx.lineWidth=2;ctx.beginPath();
ctx.arc(33,-139,8+17*flourish,-.8,2.5);ctx.stroke();ctx.restore();
R.sparkle(ctx,32,-144,4+flourish*4,gold);
}
if(run&&speed>.25){
ctx.save();ctx.globalAlpha=.45;ctx.strokeStyle=gold;ctx.lineWidth=1.5;
for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-51-i*8,-20-i*9);ctx.lineTo(-68-i*8,-19-i*9);ctx.stroke();}
ctx.restore();
}
ctx.restore();
drawCuernoOverlays(ctx,pose,R,4,t,bounce,tilt);
}

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, pose.form | 0));
  if (f === 0) { drawLivingHorn(ctx,pose,R,pose.t||0); return; }
  if (f === 1) { drawFirstBody(ctx,pose,R,pose.t||0); return; }
  if (f === 2) { drawRainbowFoal(ctx,pose,R,pose.t||0); return; }
  if (f === 3) { drawStellarUnicorn(ctx,pose,R,pose.t||0); return; }
  drawAuroraUnicorn(ctx,pose,R,pose.t||0);
}

export default { id: "cuerno", draw };
