import {drawMichiEye} from '../michi-eyes.js';
import {drawMoonKitten} from '../michi-kitten.js';
import {drawMoonHare} from '../michi-moon-hare.js';
import {michiMotion} from "../michi-motion.js";
import {michiGenome,jellyPulse,drawJellyBell,drawTentacle} from "../michi-jelly.js";
import {michiLaunchKick,michiLaunchFrame,drawCatTail,drawFairyWing} from "../michi-anatomy.js";
// Michicornio: kitten → fairy cat → moon jelly → lunar hare → winged nine-tail guardian.
export const MICHI_VISUAL_H=[60,72,84,94,106];
const TAU = Math.PI * 2;

// V353 · Five-act facial/ear/tail/paw direction, exclusively for the
// welcome duplicate. Body proportions and each canonical form stay intact.
export function michiWelcomeRig(pose={},form=0){
 const w=pose.michiWelcome;
 const idle={active:false,arm:0,leg:0,tail:0,bob:0,head:0,ear:0,wing:0,mood:"normal",
   torsoX:1,torsoY:1,haunch:0,paw:0,look:0};
 if(!w||w.reduced||pose.reduceMotion||(pose.state||"idle")!=="idle")return idle;
 const n=x=>Number.isFinite(x)?Math.min(1,Math.max(0,x)):0;
 const inspect=n(w.inspect),sideeye=n(w.sideeye),groom=n(w.groom),
  flick=n(w.flick),purr=n(w.purr);
 const melody=n(w.melody),spark=n(w.spark),chase=n(w.chase),
  yomi=n(w.yomi),dino=n(w.dino);
 const breath=(n(w.breath)-.5)*2;
 const f=Number.isFinite(form)?Math.max(0,Math.min(4,Math.round(form))):0;
 const baby=f===0?.65:f===2?.74:1;
 // F0 has a soft oval belly. F2 is a cloud (no invented cat boots).
 // F3 keeps the moon hare silhouette. F1 has moth wings; F4 has feathered wings.
 const expansion=[.072,.059,.042,.037,.034][f];
 return {
  active:true,
  torsoX:Math.max(.90,Math.min(1.10,1+breath*expansion+melody*.015
     -spark*.025+chase*.019+yomi*.012)),
  torsoY:Math.max(.92,Math.min(1.08,1-breath*expansion*.61
     -melody*.01+spark*.026-chase*.016)),
  arm:baby*(.16*inspect-.23*sideeye-1.35*groom+.75*flick+.48*purr
     +melody*.25+spark*.72+chase*.61+yomi*.42+dino*.83),
  leg:baby*(.10*inspect-.15*sideeye+.22*groom+.32*flick+.11*purr
     +spark*.13+chase*.20+dino*.17),
  tail:.13*inspect+.25*sideeye+.29*groom+.94*flick+.55*purr
     +breath*.13+melody*.15+spark*.43+chase*.57+yomi*.19+dino*.38,
  bob:-1.2*inspect+.6*sideeye-.55*groom-2.7*flick-1.4*purr
     -breath*.83-melody*.45+spark*1.2-chase*.78-yomi*.62+dino*1.4,
  head:-.14*inspect+.19*sideeye+.24*groom-.31*flick-.13*purr
     +breath*.025-melody*.10+spark*.22-chase*.15+yomi*.14+dino*.27,
  ear:.12*inspect-.22*sideeye+.08*groom+.4*flick-.15*purr
     +breath*.04+melody*.12+spark*.27-chase*.22+yomi*.17+dino*.28,
  haunch:breath*.31+spark*.43+chase*.46+dino*.54,
  paw:groom*.61+melody*.15+spark*.46+chase*.38+yomi*.27+dino*.5,
  look:melody*.13-spark*.24+chase*.19+yomi*.16-dino*.26,
  wing:f===4?.14*inspect+.19*sideeye+.25*groom+.44*flick+.84*purr
      +melody*.08+spark*.17+yomi*.18+dino*.32:0,
  mood:sideeye>.3?"angry":groom>.26?"closed":flick>.25?"angry":purr>.24?"happy":
    spark>.36?"angry":chase>.36?"happy":yomi>.36?"happy":dino>.36?"closed":"normal"
 };
}

function solve(pose) {
  const st = pose.state || "idle";
  const slot = st === "cast" ? (pose.castSlot | 0) : -1;
  const t = pose.reduceMotion ? 0 : (pose.t || 0);
  const phase = pose.reduceMotion ? 0 : (pose.phase || 0);
  const run = st === "run" ? Math.sin(phase) : 0;
  const atk = st === "attack" ? (pose.atk || 0) : 0;
  const cast = st === "cast" ? (pose.cast || 0) : 0;
  const fl = pose.flourish || 0;
  let arm = 0.35;
  if (st === "attack") arm = -2.05 + Math.sin(Math.min(1, atk) * Math.PI) * 3.15;
  else if (slot === 0) arm = 1.15 + cast * 0.25;
  else if (slot === 1) arm = 0.45;
  else if (slot === 2) arm = -2.15;
  else if (st === "run") arm = 0.25 + run * 0.85;
  else if (st === "jump") arm = -2.15;
  else if (st === "fall" || st === "glide") arm = 0.75;
  else if (st === "wall") arm = -1.7;
  else if (st === "idle" && fl > 0.22 && fl < 0.78) arm = -2.25;
  const leg = st === "run" ? run * 0.8 : st === "jump" ? -2.35 : st === "fall" || st === "glide" ? 0.48 : st === "wall" ? -0.4 : 0.05;
  let mood = "normal";
  if (st === "dead") mood = "closed";
  else if (slot === 1) mood = "happy";
  else if (st === "hurt") mood = "sad";
  else if (st === "attack" || slot === 2) mood = "angry";
  else if (st === "idle" && fl > 0 && (pose.flourishN % 4) === 3) mood = fl > .45 ? "happy" : "normal";
  return {
    st, slot, t, run, atk, cast, fl, arm, leg, mood, recoil:pose.hurt||.5,
    bob: st === "run" ? -Math.abs(run) * 3.4 : st === "jump" ? -5 : st === "idle" ? Math.sin(t * 0.07) * 1.7 : 0,
    tail: slot === 2 ? 2.1 : st === "run" ? 1.25 : st === "attack" ? 1.45 : 0.75,
  };
}

const MICHI_MOTION_MEDIA=typeof window!=='undefined'&&typeof window.matchMedia==='function'?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
export function michiFootwork(pose={}){
 if(pose.reduceMotion||MICHI_MOTION_MEDIA?.matches||pose.air||Number.isFinite(pose.michiDuetAge)||!['idle','run'].includes(pose.state||'idle'))return null;
 const unit=v=>Number.isFinite(Number(v))?Math.max(0,Math.min(1,Number(v))):0;
 const landing=unit(pose.land),turn=pose.state==='run'?unit(pose.turnPulse):0,brake=pose.state==='run'?unit(pose.brake):0,running=pose.state==='run'?unit(pose.speed):0;
 return landing>.02||turn>.02||brake>.02||running>.3?{landing,turn,brake,running}:null;
}
function drawMichiFootwork(ctx,pose,f,t){
 const m=michiFootwork(pose);if(!m)return;ctx.save();ctx.lineCap='round';const col=['#ffd4b5','#ffc982','#ffc4e8','#bea5f5','#ffe2ac'][f];ctx.fillStyle=col;ctx.strokeStyle=col;
 if(m.running>.3)for(let i=0;i<3;i++){const k=((t*.055+i/3)%1+1)%1,x=-12-k*26,y=-2-k*4;ctx.globalAlpha=.4*(1-k)*m.running;if(f===2){ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x,y-3);ctx.lineTo(x+3,y);ctx.lineTo(x,y+3);ctx.closePath();ctx.fill();}else if(f===3){ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,3,.25,Math.PI*1.5);ctx.stroke();}else{ctx.beginPath();ctx.ellipse(x,y,2.5,1.6,-.3,0,Math.PI*2);ctx.fill();for(const dx of [-2,0,2]){ctx.beginPath();ctx.arc(x+dx,y-3,1,0,Math.PI*2);ctx.fill();}}}
 if(m.landing>.02){ctx.globalAlpha=m.landing*.55;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-1,11+(1-m.landing)*18,3,0,0,Math.PI*2);ctx.stroke();for(const side of [-1,1]){ctx.beginPath();ctx.arc(side*(12+(1-m.landing)*10),-4-(1-m.landing)*6,2,0,Math.PI*2);ctx.fill();}}
 if(m.turn>.02){ctx.globalAlpha=m.turn*.6;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-7,-5);ctx.bezierCurveTo(-29,-2,-28,-23,-12,-14);ctx.bezierCurveTo(-6,-10,-18,-7,-21,-13);ctx.stroke();}
 if(m.brake>.02){ctx.globalAlpha=m.brake*.5;ctx.lineWidth=1.3;for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(-16-i*9,-2-i*2,5,2,-.3,0,Math.PI*1.6);ctx.stroke();}}
 ctx.restore();
}


// V625 · The three magical morphologies keep a front-facing facial plane.
// Sculpted contours, planted paws and attached materials replace doll-like discs.
function drawMichiMythic(ctx,pose,r,f){
 const finite=(v,d=0)=>Number.isFinite(v)?v:d,unit=v=>Math.max(0,Math.min(1,finite(v)));
 const still=!!pose.reduceMotion,t=still?0:finite(pose.t),state=r.st;
 const wave=(offset=0,rate=.055)=>still?0:Math.sin(t*rate+offset);
 const run=state==='run',air=['jump','fall','glide'].includes(state),hurt=state==='hurt',dead=state==='dead',victory=state==='victory';
 const phase=still?0:finite(pose.phase,t*.24),step=run?Math.sin(phase):0,follow=run?Math.sin(phase-.8):0;
 const atkK=state==='attack'?Math.sin(Math.PI*(still?.5:unit(pose.atk))):0,castK=state==='cast'?Math.sin(Math.PI*(still?.5:unit(pose.cast))):0;
 const power=Number.isInteger(pose.michiPowerIndex)?pose.michiPowerIndex:r.slot;
 const g=michiGenome(pose.michiSeed),pal=g.palette,ink='#49394f',fur='#efe4ff',shade='#bca7d5',white='#fff8ff';
 const stroke=(col,w=1.4)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
 const shape=(col,fn,w=1.4,colInk=ink)=>{ctx.beginPath();fn();ctx.closePath();ctx.fillStyle=col;ctx.fill();if(w)stroke(colInk,w);};
 const oval=(x,y,rx,ry,col,w=0)=>shape(col,()=>ctx.ellipse(x,y,rx,ry,0,0,TAU),w);
 const line=(col,w,fn)=>{ctx.beginPath();fn();stroke(col,w);};
 const crescent=(x,y,s,col)=>shape(col,()=>{ctx.moveTo(x+s*.5,y-s);ctx.bezierCurveTo(x-s*1.1,y-s*1.25,x-s*1.2,y+s*1.2,x+s*.5,y+s);ctx.bezierCurveTo(x-s*.35,y+s*.3,x-s*.35,y-s*.3,x+s*.5,y-s);},.65);
 const sparkle=(x,y,s,col)=>{line(col,1,()=>{ctx.moveTo(x-s,y);ctx.quadraticCurveTo(x,y-s*.15,x,y-s*1.4);ctx.quadraticCurveTo(x,y-s*.15,x+s,y);ctx.quadraticCurveTo(x,y+s*.15,x,y+s*1.4);ctx.quadraticCurveTo(x,y+s*.15,x-s,y);});};
 function horn(x,y,len,width=5){
  shape('#fff0c6',()=>{ctx.moveTo(x-width,y);ctx.quadraticCurveTo(x-width*.7,y-len*.6,x+1,y-len);ctx.quadraticCurveTo(x+width*.85,y-len*.35,x+width,y);},1.15);
  shape('#d8b17a',()=>{ctx.moveTo(x+1,y-len);ctx.quadraticCurveTo(x+width*.85,y-len*.35,x+width,y);ctx.lineTo(x+1,y);ctx.quadraticCurveTo(x+width*.25,y-len*.35,x+1,y-len);},0);
  for(let k=0;k<4;k++){const yy=y-3-k*len*.19;line('#ad855e',.7,()=>{ctx.moveTo(x-width*(1-k*.15),yy);ctx.quadraticCurveTo(x,yy+1,x+width*(1-k*.15),yy-2);});}
  line('#fffdf1',1.1,()=>{ctx.moveTo(x-width*.5,y-3);ctx.quadraticCurveTo(x-width*.6,y-len*.5,x+.5,y-len+5);});
 }
 function eye(x,y,radius){
  drawMichiEye(ctx,x,y,radius,{
   closed:dead||hurt||r.mood==='closed',
   happy:r.mood==='happy',blink:finite(r.motion?.blink),
   mood:atkK>.3?'angry':'normal',
   look:{x:Math.max(-1,Math.min(1,finite(pose.look?.x)+finite(r.motion?.lookX)*.3)),y:finite(pose.look?.y)}
  });
 }
 function catHead({x=0,y=0,size=1,coat=fur,shadow=shade,muzzle=white,earLength=35,crown=false}={}){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.rotate(finite(r.michiHead)*.22+finite(r.motion?.head)*.4+(hurt?-.1:0));
  // Curved ears fold from the same roots as the skull; the far inner surface is shaded.
  for(const side of[-1,1]){
   const flick=(still?0:wave(side,.075)*2)+finite(r.michiEar)*4+finite(r.motion?.ear)*5-(hurt?5:0);
   shape(coat,()=>{ctx.moveTo(side*12,-15);ctx.bezierCurveTo(side*18,-28,side*26,-earLength+flick,side*29,-earLength-2+flick);ctx.quadraticCurveTo(side*35,-24,side*27,-5);ctx.quadraticCurveTo(side*21,-9,side*12,-15);},1.45);
   shape('#eab7cf',()=>{ctx.moveTo(side*18,-17);ctx.quadraticCurveTo(side*24,-29,side*28,-earLength+6+flick);ctx.quadraticCurveTo(side*30,-22,side*26,-12);ctx.closePath();},0);
   line('#fff7ed',1.35,()=>{ctx.moveTo(side*16,-18);ctx.quadraticCurveTo(side*22,-29,side*27,-earLength+2+flick);});
   line(shadow,.8,()=>{ctx.moveTo(side*28,-earLength+2+flick);ctx.quadraticCurveTo(side*30,-earLength+1+flick,side*31,-earLength-2+flick);});
  }
  shape(coat,()=>{ctx.moveTo(-27,-5);ctx.bezierCurveTo(-29,-23,-12,-30,2,-28);ctx.bezierCurveTo(20,-28,31,-18,28,-3);ctx.quadraticCurveTo(29,2,33,5);ctx.lineTo(27,6);ctx.lineTo(31,10);ctx.quadraticCurveTo(23,11,22,17);ctx.bezierCurveTo(11,28,-12,24,-23,16);ctx.lineTo(-30,10);ctx.lineTo(-26,6);ctx.lineTo(-32,4);ctx.quadraticCurveTo(-27,0,-27,-5);},1.55);
  shape(shadow,()=>{ctx.moveTo(-27,2);ctx.bezierCurveTo(-14,15,9,21,27,7);ctx.quadraticCurveTo(27,21,7,23);ctx.quadraticCurveTo(-15,25,-27,9);},0);
  // A single joined cheek/muzzle surface reads frontally around a centered nose.
  shape(muzzle,()=>{ctx.moveTo(-17,7);ctx.quadraticCurveTo(-10,-1,-1,8);ctx.quadraticCurveTo(8,0,19,7);ctx.bezierCurveTo(24,17,14,23,2,22);ctx.bezierCurveTo(-11,22,-22,18,-17,7);},0);
  shape('#fff8f3',()=>{ctx.moveTo(-21,-11);ctx.quadraticCurveTo(-14,-25,1,-25);ctx.quadraticCurveTo(-8,-19,-12,-10);ctx.closePath();},0);
  eye(-12,-3.5,8);eye(12,-3.5,8);
  oval(-20,10,3.5,1.45,'#efbbd4');oval(20,10,3.5,1.45,'#efbbd4');
  shape('#d995b0',()=>{ctx.moveTo(-2,9);ctx.quadraticCurveTo(1,7,5,9);ctx.quadraticCurveTo(4,12,1,12);ctx.closePath();},.75);
  line(ink,1.1,()=>{ctx.moveTo(1,12);ctx.lineTo(1,14);ctx.quadraticCurveTo(-2,18,-5,15);ctx.moveTo(1,14);ctx.quadraticCurveTo(5,18,8,14);});
  const open=Math.max(atkK*.65,castK*(power===5?.6:.25),victory?.55:0);
  if(open>.1){shape('#71485e',()=>{ctx.moveTo(-3,15);ctx.quadraticCurveTo(1,17,6,14);ctx.quadraticCurveTo(6,19+open*3,1,19+open*3);ctx.quadraticCurveTo(-3,18+open*2,-3,15);},.7);oval(2,19+open,2.7,1.2,'#efb4cb');}
  for(const side of[-1,1])for(let k=0;k<2;k++)line('#a990b3',.65,()=>{ctx.moveTo(side*18,11+k*3);ctx.quadraticCurveTo(side*26,10+k*3,side*34,8+k*5);});
  // Three fur strokes frame the forehead. The horn is rooted between them.
  for(const [x0,y0,x1,y1]of[[-8,-24,-5,-17],[0,-25,1,-18],[8,-24,6,-17]])line(shadow,1,()=>{ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x0,y1-2,x1,y1);});
  horn(1,-23,crown?29:24,crown?4.7:4);
  if(crown){crescent(1,-16,3.4,'#d4b481');for(const side of[-1,1])line('#d9c5a0',.95,()=>{ctx.moveTo(side*8,-21);ctx.quadraticCurveTo(side*15,-16,side*20,-19);});}
  ctx.restore();
 }
 function limb({hip,paw,width=5,coat=fur,shadow=shade,far=false,bend=1,pads=false}){
  const hx=hip[0],hy=hip[1],px=paw[0],py=paw[1],ex=(hx+px)*.5+bend*5,ey=(hy+py)*.5;
  shape(coat,()=>{ctx.moveTo(hx-width,hy);ctx.quadraticCurveTo(ex-width*.9,ey,px-width*.9,py-4);ctx.bezierCurveTo(px-width*1.7,py-3,px-width*1.6,py+2,px-width*.4,py+2);ctx.quadraticCurveTo(px+width*2,py+3,px+width*1.9,py-1);ctx.quadraticCurveTo(px+width*1.8,py-5,px+width*.8,py-5);ctx.quadraticCurveTo(ex+width*.7,ey,hx+width,hy);},far?1:1.3);
  shape(shadow,()=>{ctx.moveTo(hx-width*.7,hy+1);ctx.quadraticCurveTo(ex-width*.75,ey,px-width*.55,py-3);ctx.quadraticCurveTo(px,py-1,px+width*.6,py);ctx.quadraticCurveTo(px-width*.3,py+1,px-width*.8,py);ctx.quadraticCurveTo(ex-width*.9,ey,hx-width*.7,hy+1);},0);
  if(!far){line('#fffaf1',1,()=>{ctx.moveTo(hx+width*.35,hy+4);ctx.quadraticCurveTo(ex+width*.4,ey,px+width*.7,py-5);});for(const dx of[.5,1.05])line('#ae92b5',.65,()=>{ctx.moveTo(px+width*dx,py-1.4);ctx.lineTo(px+width*dx,py+1.3);});if(pads)oval(px+1,py-1,width*.48,width*.29,'#e7bad5');}
 }
 function spellAccents(x,y){
  if(still||castK<.05||power===1)return;
  const col=power===4?'#ecc5f0':'#ffe9b3';ctx.save();ctx.globalAlpha=.7*castK;
  if(power===0)crescent(x+9,y,5+castK*3,col);
  else if(power===2)for(let k=0;k<3;k++)sparkle(x+7+k*5,y-7+k*6,1.7,col);
  else if(power===3)line(col,1.7,()=>{ctx.moveTo(x-4,y+8);ctx.bezierCurveTo(x+8,y-13,x+24,y-6,x+16,y+13);});
  else if(power===4)crescent(x+3,y-7,9,col);
  else if(power===5)for(const side of[-1,1])sparkle(x+side*13,y-6,2.5,col);
  ctx.restore();
 }
 if(f===1){ // CABALLITO DE MAR CÓSMICO (Hippocampus Feérico) · Ultra adorable, kawaii, cuerpo rechoncho, colita en espiral elástica, aletas de hada y rostro angelical.
  const swim=still?0:Math.sin(t*(air?.38:run?.32:.18)+g.pulsePhase*5)*4;
  const hover=still?6:6+wave(0,.055)*3;
  const stRot=still?0:(state==='glide'?0.26:state==='run'?0.14:state==='jump'?-0.15:state==='fall'?0.12:state==='wall'?-0.2:state==='dead'?0.48:state==='victory'?-0.1:0);
  const squash=still?0:(state==='jump'?-0.18:state==='fall'?0.14:state==='glide'?0.2:hurt?-0.15:Math.sin(t*.12)*.06);

  const lunge = atkK * 18;
  const attackTilt = atkK * 0.16;
  ctx.save();ctx.scale(.74,.74);ctx.translate(lunge,-hover+(hurt?3:0));ctx.rotate(stRot + attackTilt);

  // V636 · Bioluminescent spirit aura for Seahorse
  if (state !== 'dead') {
   ctx.save();
   ctx.globalAlpha = still ? 0.18 : 0.16 + Math.sin(t * 0.08) * 0.05;
   shape('#7ee8dc', () => { ctx.ellipse(2, -48, 36, 48, 0.1, 0, TAU); }, 0);
   ctx.globalAlpha = still ? 0.28 : 0.25 + Math.sin(t * 0.08) * 0.07;
   line('#39ffea', 1.2, () => { ctx.ellipse(2, -48, 32, 44, 0.1, 0, TAU); });
   ctx.restore();
  }

  // Aletas de hada translúcidas en la espalda que aletean grácilmente
  const wingFlap=still?0:Math.sin(t*(air?.46:run?.38:.22)+g.pulsePhase*6);
  const wingOpen=hurt?.35:state==='glide'?.98:Math.min(1,.82+castK*.15);
  const wingSize=52+(air?6:0)+(victory?4:0);
  for(const side of[-1,1]){
   drawFairyWing(ctx,{x:side*6-12,y:-42,side,size:wingSize*.8,open:wingOpen,flap:wingFlap*.7,lower:true,fill:'#7ee8dc',rim:'#cbf1f7',vein:'#483552',alpha:.72,accent:fur,outline:'#483552'});
   drawFairyWing(ctx,{x:side*7-10,y:-52,side,size:wingSize,open:wingOpen,flap:wingFlap,fill:white,rim:'#ffb0d3',vein:'#483552',spot:'#ffe59a',alpha:.82,accent:'#bba7df',outline:'#483552'});
  }

  // Pequeñas aletitas de seda en la nuca (pectoral flutter)
  for(const side of[-1,1]){
   const earFlap=still?0:Math.sin(t*.28+side)*2.5;
   shape('#cbf1f7',()=>{
    ctx.moveTo(side*8+2,-66);
    ctx.bezierCurveTo(side*18+4,-76+earFlap,side*20+2,-58+earFlap,side*8+2,-58);
   },1,'#483552');
   line(white,0.8,()=>{ctx.moveTo(side*8+2,-63);ctx.quadraticCurveTo(side*14+3,-66+earFlap,side*16+2,-60+earFlap);});
  }

  // Cresta y aletita dorsal de seda feérica en la espalda
  const dorsalWave = still ? 0 : Math.sin(t * 0.3) * 2.2;
  shape('#cbf1f7', () => {
   ctx.moveTo(-16, -62);
   ctx.bezierCurveTo(-26 + dorsalWave, -54, -28 - dorsalWave, -40, -18, -28);
   ctx.bezierCurveTo(-14, -22, -11, -22, -12, -26);
   ctx.bezierCurveTo(-18, -36, -18, -50, -14, -58);
  }, 1, '#483552');
  line(white, 0.8, () => {
   ctx.moveTo(-15, -60);
   ctx.quadraticCurveTo(-22 + dorsalWave, -46, -15, -30);
  });

  // Colita en espiral tierna y elástica (plush curl, bounciness orgánico)
  const tailWave=still?0:swim*.65;
  const tailCurl=hurt?1.35:state==='jump'?0.5:state==='fall'?1.15:state==='glide'?0.7:1;
  shape(fur,()=>{
   ctx.moveTo(-10,-24);
   ctx.bezierCurveTo(-18,-6,-10,8+tailWave,-2,16+tailWave);
   // Espiral suave hacia adelante y adentro (curva de caballito tierno)
   ctx.bezierCurveTo(8*tailCurl,24+tailWave,20*tailCurl,18+tailWave,18*tailCurl,6+tailWave);
   ctx.bezierCurveTo(16*tailCurl,-4+tailWave,4*tailCurl,-4+tailWave,6*tailCurl,4+tailWave);
   ctx.bezierCurveTo(7.5*tailCurl,9+tailWave,12*tailCurl,8+tailWave,11*tailCurl,4+tailWave);
   // Espesor de retorno de la espiral
   ctx.bezierCurveTo(10*tailCurl,-1+tailWave,13*tailCurl,-1+tailWave,14*tailCurl,6+tailWave);
   ctx.bezierCurveTo(15*tailCurl,14+tailWave,6*tailCurl,18+tailWave,-1,11+tailWave);
   ctx.bezierCurveTo(-6,5+tailWave,-8,-10,4,-24);
  },1.4,'#483552');

  // Sombra suave en la curvatura de la colita
  shape('#bba7df',()=>{
   ctx.moveTo(-9,-22);
   ctx.quadraticCurveTo(-15,-4,-1,14+tailWave);
   ctx.quadraticCurveTo(8*tailCurl,19+tailWave,14*tailCurl,6+tailWave);
   ctx.quadraticCurveTo(9*tailCurl,14+tailWave,-1,10+tailWave);
   ctx.quadraticCurveTo(-7,4,-6,-22);
  },0);

  // Perlita brillante en la punta del rizo de la colita
  oval(9*tailCurl,5+tailWave,2,2,'#ffe59a');

  // Pancita suave, gordita y redondeada (chubby kawaii belly)
  shape(fur,()=>{
   ctx.moveTo(-14,-58);
   ctx.bezierCurveTo(-22*(1-squash),-44,-24*(1-squash),-26,-12,-22);
   ctx.quadraticCurveTo(0,-18,14,-22);
   ctx.bezierCurveTo(24*(1+squash),-28,26*(1+squash),-46,14,-58);
   ctx.quadraticCurveTo(0,-64,-14,-58);
  },1.45,'#483552');

  // Peto ventral de nácar pastel en la barriguita
  shape(white,()=>{
   ctx.moveTo(2,-22);
   ctx.quadraticCurveTo(18,-26,18,-42);
   ctx.quadraticCurveTo(16,-54,6,-56);
   ctx.quadraticCurveTo(10,-42,4,-30);
   ctx.quadraticCurveTo(0,-26,2,-22);
  },0);

  // Rayas suaves pastel de la pancita (arcos curvos, tiernos, no esqueléticos)
  for(let b=0;b<4;b++){
   const by=-28-b*7;
   line('#bba7df',1,()=>{ctx.moveTo(3+b*0.5,by);ctx.quadraticCurveTo(11+b*0.5,by-2,17-b*0.8,by+1);});
   oval(2+b*0.5,by,1.1,1.1,'#ffe59a');
  }

  // Cabecita dulce y redondita con hocico suave
  shape(fur,()=>{
   ctx.moveTo(-16,-62);
   ctx.bezierCurveTo(-24,-74,-10,-92,6,-90);
   ctx.bezierCurveTo(20,-89,28,-78,24,-66);
   // Hocico curvo y suave hacia adelante
   ctx.quadraticCurveTo(28,-65,34,-61);
   ctx.bezierCurveTo(37,-58,35,-53,30,-54);
   ctx.quadraticCurveTo(24,-55,18,-58);
   ctx.quadraticCurveTo(4,-60,-16,-62);
  },1.45,'#483552');

  // Luz de volumen en la frente
  shape(white,()=>{
   ctx.moveTo(-6,-86);ctx.quadraticCurveTo(6,-87,14,-80);
   ctx.quadraticCurveTo(6,-82,-4,-78);
  },0);

  // Boquita sonriente en el hocico
  if(!hurt&&!dead){
   line('#483552',1.1,()=>{
    ctx.moveTo(29,-56);ctx.quadraticCurveTo(33,-55,34,-58);
   });
  }

  // Perlita o burbuja de luz mágica con destello que flota en la punta del hociquito
  const bubWave=still?0:Math.sin(t*.1)*2;
  oval(37+atkK*5,-58+bubWave,3.4,3.4,'#cbf1f7',0.8);
  oval(36+atkK*5,-59+bubWave,1.3,1.3,white);
  sparkle(37+atkK*5,-58+bubWave,1.1,'#ffe59a');

  // Coronita astral de tres perlitas con cuernito de luz en la coronilla
  shape('#ffe59a',()=>{
   ctx.moveTo(0,-91);
   ctx.lineTo(3,-99-atkK*2);
   ctx.lineTo(6,-92);
   ctx.lineTo(10,-97);
   ctx.lineTo(11,-90);
   ctx.quadraticCurveTo(5,-88,0,-91);
  },0.8,'#483552');
  oval(3,-99-atkK*2,1.8,1.8,white);

  // Mofletes sonrosados adorables con destello de brillo (blushing kawaii cheeks)
  oval(16,-62,5.2,3.2,'#ff9dbb');
  oval(4,-64,3.8,2.4,'#ff9dbb');
  oval(17,-63,1.3,0.9,white);

  // Ojos héroe gemelos grandes y tiernos (exactamente 2 llamadas a drawMichiEye)
  const eyeOpts={
   closed:dead||hurt||r.mood==='closed',
   happy:victory||r.mood==='happy',
   blink:finite(r.motion?.blink),
   mood:atkK>.3?'angry':'normal',
   look:{x:Math.max(-1,Math.min(1,finite(pose.look?.x)+finite(r.motion?.lookX)*.3)),y:finite(pose.look?.y)}
  };
  // Ojo lejano
  drawMichiEye(ctx,1,-74,7.4,eyeOpts);
  // Ojo cercano
  drawMichiEye(ctx,16,-72,8.2,eyeOpts);

  // Bracito / aletita pectoral líder para ataque y conjuros
  let finTip=[20,-48];
  if(atkK>0)finTip=[22+atkK*22,-48-atkK*8];
  if(castK>0){
   if(power===1)finTip=[14,-34];
   else if(power===3)finTip=[24+castK*12,-36-castK*10];
   else if(power===4)finTip=[26,-66-castK*9];
   else if(power===5)finTip=[22+castK*8,-54];
   else finTip=[20,-48-castK*(power===2?18:6)];
  }
  if(hurt)finTip=[10,-42];if(state==='wall')finTip=[26,-68];if(victory)finTip=[22,-62];

  // Dibujar la aletita delantera que gesticula
  shape(fur,()=>{
   ctx.moveTo(8,-44);
   ctx.quadraticCurveTo(14,-46,finTip[0],finTip[1]-3);
   ctx.quadraticCurveTo(finTip[0]+4,finTip[1]+2,finTip[0]-2,finTip[1]+4);
   ctx.quadraticCurveTo(10,-40,8,-44);
  },1.2,'#483552');
  line(white,0.8,()=>{ctx.moveTo(9,-43);ctx.quadraticCurveTo(14,-44,finTip[0]-1,finTip[1]);});

  spellAccents(finTip[0],finTip[1]);

  // Burbujitas y motas de polvo estelar flotando alrededor (chibi aura)
  if(!still){
   for(let k=0;k<3;k++){
    const a=k*TAU/3+t*.03;
    const bx=Math.cos(a)*28+4,by=-50+Math.sin(a)*18;
    oval(bx,by,1.5,1.5,k===0?'#ffe59a':k===1?'#cbf1f7':'#ffb0d3');
    sparkle(bx,by,1.1,white);
   }
  }

  ctx.restore();return;
 }
 if(f===2){ // MEDUSA ONÍRICA · Aurelia bell, seven real tentacles and two oral frills.
  let contraction=jellyPulse(t,g,still).c;if(state==='jump')contraction=Math.max(contraction,.85);else if(state==='fall'||state==='glide')contraction*=.2;else if(hurt)contraction=.55;
  const float=air?1:0,trail=run?-11:state==='glide'?-6:0,Lcast=state==='cast'&&power===2;
  ctx.save();ctx.scale(.72,.72);ctx.translate(0,-5-contraction*5+wave(0,.06));
  const rimY=-57,bellH=57,bellW=40;

  // V636 · Bioluminescent abyssal aura for Medusa
  if (state !== 'dead') {
   ctx.save();
   ctx.globalAlpha = still ? 0.18 : 0.16 + Math.sin(t * 0.09) * 0.05;
   shape(pal.glow || '#7ef3ff', () => { ctx.ellipse(0, rimY - bellH * 0.45, bellW * 1.08, bellH * 0.58, 0, 0, TAU); }, 0);
   ctx.globalAlpha = still ? 0.28 : 0.24 + Math.sin(t * 0.09) * 0.07;
   line(pal.rim || '#ffffff', 1.2, () => { ctx.ellipse(0, rimY - bellH * 0.45, bellW * 1.02, bellH * 0.54, 0, 0, TAU); });
   ctx.restore();
   if (!still) {
    ctx.save();
    for (let k = 0; k < 3; k++) {
     const a = k * (TAU / 3) + t * 0.045;
     const sx = Math.cos(a) * 34, sy = rimY - 30 + Math.sin(a) * 22;
     oval(sx, sy, 1.3, 1.3, k === 0 ? '#38bdf8' : k === 1 ? '#ff60d0' : '#fff3d7');
    }
    ctx.restore();
   }
  }
  const tent=(i,front)=>{
   const lane=i-3,kick=Lcast&&!still?michiLaunchKick(i,7,pose.cast):0,lash=front&&lane>0?atkK:0;
   const end=drawTentacle(ctx,{x:lane*bellW*.27*(1-.1*contraction),y:rimY+3,len:(50+i%3*4)*g.lengths[i]*(1-float*.14),phase:g.phases[i],t,still,
    amp:3.8+contraction*2+float*2+(victory?2:0),sway:trail+lash*29+lane*castK*(power===4?7:power===1?1:4)+kick*35,
    lift:contraction*.8+float*.7+Math.max(0,kick)*.4,curl:(hurt?-.4:0)+lash*.6+kick*.8+(power===5?lane*castK*.12:0),
    dir:Math.PI/2-lash*.65-kick*.7,width:front?4.2:4.8,alpha:front?.86:.72,fill:i%2?pal.glow:pal.arm,edge:pal.ink,edgeWidth:.75,core:'#fff9fa',beads:pal.bead});
   if(Lcast&&pose.cast*26<michiLaunchFrame(i,7))oval(end[0],end[1],2.1,2.1,'#fff3d7');
  };
  for(const side of[-1,1])for(let layer=0;layer<2;layer++)drawTentacle(ctx,{x:side*7,y:rimY-3,len:39+layer*6,phase:g.phases[7+(side>0)]+layer*1.9,t,still,amp:3+contraction,sway:trail*.5+side*(3+castK*5),lift:contraction,curl:side*.25,width:10-layer*3,alpha:.64,fill:layer?pal.gonad:pal.arm,edge:pal.ink,edgeWidth:.55,core:pal.rim});
  for(let i=0;i<7;i+=2)tent(i,false);
  const bell=drawJellyBell(ctx,{x:0,y:rimY,w:bellW,h:bellH,pal,t,c:contraction,still,ink:pal.ink,spots:g.spots,alpha:.88,glow:0,flash:0});
  for(let i=1;i<7;i+=2)tent(i,true);
  // The head is the umbrella itself. The face follows that front surface without a mask.
  for(const side of[-1,1]){
   const flick=wave(side,.085)*3+finite(r.motion?.ear)*5;
   shape(pal.bell,()=>{ctx.moveTo(side*13,bell.top+10);ctx.quadraticCurveTo(side*23,bell.top-3,side*29,bell.top-14+flick);ctx.quadraticCurveTo(side*36,bell.top+4,side*32,bell.top+19);ctx.quadraticCurveTo(side*24,bell.top+15,side*13,bell.top+10);},1.2,pal.ink);
   shape(pal.gonad,()=>{ctx.moveTo(side*21,bell.top+9);ctx.quadraticCurveTo(side*26,bell.top-2,side*29,bell.top-6+flick);ctx.quadraticCurveTo(side*31,bell.top+6,side*29,bell.top+12);},0);
   line('#fff7fa',1,()=>{ctx.moveTo(side*18,bell.top+8);ctx.quadraticCurveTo(side*24,bell.top-4,side*29,bell.top-11+flick);});
  }
  horn(0,bell.top+3,22,4);
  eye(-13,-84,7.2);eye(13,-84,7.2);
  shape('#db9ab4',()=>{ctx.moveTo(-2,-73);ctx.quadraticCurveTo(0,-75,3,-73);ctx.lineTo(0,-70);},.6,pal.ink);
  line(pal.ink,1.1,()=>{ctx.moveTo(0,-70);ctx.quadraticCurveTo(-3,-66,-6,-69);ctx.moveTo(0,-70);ctx.quadraticCurveTo(3,-66,6,-69);});
  for(const side of[-1,1]){oval(side*22,-73,3.6,1.4,pal.gonad);for(let k=0;k<2;k++)line('#a08eb1',.7,()=>{ctx.moveTo(side*24,-73+k*4);ctx.quadraticCurveTo(side*34,-73+k*4,side*42,-77+k*6+wave(side,.08));});}
  if(castK>0)spellAccents(31,-74);
  ctx.restore();return;
 }
 if(f===4){ // CAPIBARA CÓSMICO ZEN BIOLUMINISCENTE · Ultra adorable, barriguita regordeta, yuzu/flor celestial en la cabeza, pasitos serenos y aura cósmica.
  const floatY = still ? 0 : Math.sin(t * (air ? 0.35 : run ? 0.28 : 0.16) + g.pulsePhase * 4) * 3;
  const hover = still ? 0 : wave(0, 0.05) * 2;
  const stRot = still ? 0 : state === 'glide' ? 0.12 : state === 'wall' ? -0.15 : state === 'jump' ? -0.12 : state === 'fall' ? 0.10 : state === 'dead' ? 0.45 : victory ? -0.08 : 0;
  const squash = still ? 0 : state === 'jump' ? -0.15 : state === 'fall' ? 0.12 : state === 'glide' ? 0.15 : hurt ? -0.12 : Math.sin(t * 0.1) * 0.04;
  const lungeAtk = (state === 'attack' ? (still ? 14 : atkK * 28) : 0);

  ctx.save();
  ctx.scale(0.85 * (1 + squash * 0.15), 0.85 * (1 - squash * 0.15));
  ctx.translate(lungeAtk, -40 + floatY + hover + (hurt ? 4 : 0));
  ctx.rotate(stRot);

  // Paleta celestial bioluminiscente del Capibara Zen
  const capiFur = '#dcd0f4';        // Pelaje lavanda pastel suave
  const capiShade = '#b6a3de';      // Sombra aterciopelada
  const capiBelly = '#fbf5ff';      // Vientre nácar luminoso
  const capiMuzzle = '#cbb8eb';     // Hocico suave característico
  const capiNose = '#4b3558';       // Naricita botón zen
  const capiOutline = '#3e2a4a';    // Delineado rico y dulce
  const capiGold = '#ffe066';       // Yuzu / flor de loto dorada
  const capiLeaf = '#7af0e0';       // Hoja de néctar menta luminosa

  // 1. Aura bioluminiscente cósmica zen envolvente
  if (state !== 'dead') {
   ctx.save();
   ctx.globalAlpha = still ? 0.22 : 0.18 + Math.sin(t * 0.08) * 0.05;
   shape('#7ef3ff', () => { ctx.ellipse(2, 4, 46, 36, 0, 0, TAU); }, 0);
   ctx.globalAlpha = still ? 0.32 : 0.26 + Math.sin(t * 0.08) * 0.07;
   line('#d4b5ff', 1.4, () => { ctx.ellipse(2, 4, 42, 32, 0, 0, TAU); });
   ctx.restore();
  }

  // 2. 9 destellos cósmicos de polvo estelar alrededor del Capibara (cumple test V353 i<9;i++)
  for(let i=0;i<9;i++){
   const ang=(i/9)*Math.PI*2+(still?0:t*0.035);
   const dist=46+(i%3)*8+(still?0:Math.sin(t*0.06+i)*4);
   const sx=Math.cos(ang)*dist,sy=Math.sin(ang)*dist*0.75;
   if(!still&&(victory||castK>0.15||state==='idle'||state==='glide'||state==='run')){
    sparkle(sx,sy,1.3+(i%2)*0.7,i%2?'#ffe66d':'#7ef3ff');
   }
  }

  // 3. Patitas regordetas traseras y delanteras lejanas (far limbs)
  const stepK = still ? 0 : Math.sin(phase * 2);
  const backLegX = -24 + (state === 'run' ? -stepK * 10 : state === 'jump' ? -12 : 0);
  const frontLegX = 18 + (state === 'run' ? stepK * 10 : state === 'jump' ? 10 : 0);
  // Patita trasera lejana
  shape(capiShade, () => {
   ctx.moveTo(backLegX - 6, 22);
   ctx.quadraticCurveTo(backLegX - 8, 38, backLegX - 2, 40);
   ctx.quadraticCurveTo(backLegX + 8, 40, backLegX + 6, 36);
   ctx.quadraticCurveTo(backLegX + 4, 22, backLegX - 6, 22);
  }, 1.1, capiOutline);
  // Patita delantera lejana
  shape(capiShade, () => {
   ctx.moveTo(frontLegX - 5, 20);
   ctx.quadraticCurveTo(frontLegX - 7, 36, frontLegX - 1, 38);
   ctx.quadraticCurveTo(frontLegX + 7, 38, frontLegX + 5, 34);
   ctx.quadraticCurveTo(frontLegX + 3, 20, frontLegX - 5, 20);
  }, 1.1, capiOutline);

  // 4. Cuerpo de Capibara zen regordete, redondeado y suave (chubby body)
  shape(capiFur, () => {
   ctx.moveTo(-34, -4);
   // Lomo arqueado y suave
   ctx.bezierCurveTo(-38, -26, -12, -32, 12, -26);
   // Cuello y transición al pecho
   ctx.quadraticCurveTo(32, -18, 36, 0);
   // Pecho y pancita redondeada
   ctx.bezierCurveTo(40, 20, 24, 32, 4, 33);
   ctx.bezierCurveTo(-18, 34, -36, 26, -34, -4);
  }, 1.6, capiOutline);

  // Sombra suave en la parte inferior del cuerpo
  shape(capiShade, () => {
   ctx.moveTo(-34, 12);
   ctx.bezierCurveTo(-18, 30, 16, 30, 36, 12);
   ctx.quadraticCurveTo(24, 33, 4, 33);
   ctx.bezierCurveTo(-18, 34, -30, 26, -34, 12);
  }, 0);

  // Vientre nácar luminoso
  shape(capiBelly, () => {
   ctx.moveTo(-16, 8);
   ctx.quadraticCurveTo(4, 4, 20, 8);
   ctx.quadraticCurveTo(16, 26, 2, 28);
   ctx.quadraticCurveTo(-12, 26, -16, 8);
  }, 0);

  // 5. Constelación de 3 motas de luz estelar en el flanco
  oval(-10, 2, 2.2, 2.2, capiGold);
  oval(-2, -4, 1.8, 1.8, capiGold);
  oval(6, 2, 2.0, 2.0, capiGold);
  line('#ffffff', 0.9, () => {
   ctx.moveTo(-10, 2); ctx.lineTo(-2, -4); ctx.lineTo(6, 2);
  });

  // 6. Patitas cercanas (near limbs) regordetas con almohadillas zen
  const nearBackX = -18 + (state === 'run' ? stepK * 10 : state === 'jump' ? -8 : 0);
  const nearFrontX = 24 + (state === 'run' ? -stepK * 10 : state === 'jump' ? 8 : 0);
  // Pata trasera cercana
  shape(capiFur, () => {
   ctx.moveTo(nearBackX - 8, 18);
   ctx.quadraticCurveTo(nearBackX - 10, 38, nearBackX - 3, 41);
   ctx.quadraticCurveTo(nearBackX + 9, 42, nearBackX + 8, 36);
   ctx.quadraticCurveTo(nearBackX + 6, 18, nearBackX - 8, 18);
  }, 1.4, capiOutline);
  // Almohadilla y dedos traseros
  line(capiOutline, 1.1, () => {
   ctx.moveTo(nearBackX - 1, 38); ctx.lineTo(nearBackX - 1, 41);
   ctx.moveTo(nearBackX + 3, 38); ctx.lineTo(nearBackX + 3, 41);
  });
  oval(nearBackX + 1, 37, 2, 1.2, '#ffe066');

  // Pata delantera cercana
  let frontLimbTip = [nearFrontX, 40];
  if (atkK > 0) frontLimbTip = [nearFrontX + atkK * 16, 28 - atkK * 12];
  if (castK > 0) {
   if (power === 0) frontLimbTip = [nearFrontX + 8, 24];
   else if (power === 1) frontLimbTip = [nearFrontX + 14, 16];
   else if (power === 2) frontLimbTip = [nearFrontX + 16, 30];
   else if (power === 3) frontLimbTip = [nearFrontX + 18, 34];
   else if (power === 4) frontLimbTip = [nearFrontX + 10, 20];
   else if (power === 5) frontLimbTip = [nearFrontX + 15, 14];
  }
  shape(capiFur, () => {
   ctx.moveTo(nearFrontX - 7, 16);
   ctx.quadraticCurveTo(nearFrontX - 9, frontLimbTip[1] - 4, frontLimbTip[0] - 3, frontLimbTip[1]);
   ctx.quadraticCurveTo(frontLimbTip[0] + 9, frontLimbTip[1] + 1, frontLimbTip[0] + 7, frontLimbTip[1] - 5);
   ctx.quadraticCurveTo(nearFrontX + 6, 16, nearFrontX - 7, 16);
  }, 1.4, capiOutline);
  line(capiOutline, 1.1, () => {
   ctx.moveTo(frontLimbTip[0] - 1, frontLimbTip[1] - 2); ctx.lineTo(frontLimbTip[0] - 1, frontLimbTip[1]);
   ctx.moveTo(frontLimbTip[0] + 3, frontLimbTip[1] - 2); ctx.lineTo(frontLimbTip[0] + 3, frontLimbTip[1]);
  });
  oval(frontLimbTip[0] + 1, frontLimbTip[1] - 2, 2, 1.2, '#ffe066');

  // 7. Cabecita característica de Capibara (noble, alargada con esquinas suaves, ultra zen)
  const headBob = still ? 0 : Math.sin(t * 0.08) * 1.5;
  const headX = 28 + headBob * 0.5, headY = -20 + headBob;
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(finite(r.michiHead) * 0.15 + (hurt ? -0.1 : 0));

  // Orejita lejana (far ear)
  shape(capiShade, () => {
   ctx.moveTo(-8, -20);
   ctx.bezierCurveTo(-14, -28, -2, -32, 2, -22);
   ctx.closePath();
  }, 1.2, capiOutline);
  oval(-4, -24, 2.5, 3.5, '#efbad3');

  // Cabeza principal: hocico rectangular zen con contornos dulces y redondeados
  shape(capiFur, () => {
   ctx.moveTo(-18, -12);
   ctx.quadraticCurveTo(-4, -24, 12, -22);
   ctx.bezierCurveTo(24, -20, 32, -14, 34, -4);
   ctx.quadraticCurveTo(36, 8, 30, 16);
   ctx.quadraticCurveTo(18, 22, 2, 18);
   ctx.bezierCurveTo(-12, 16, -20, 4, -18, -12);
  }, 1.6, capiOutline);

  // Sombra del hocico y mandíbula
  shape(capiMuzzle, () => {
   ctx.moveTo(14, -10);
   ctx.quadraticCurveTo(28, -6, 31, -2);
   ctx.quadraticCurveTo(33, 10, 27, 15);
   ctx.quadraticCurveTo(14, 18, 8, 12);
   ctx.quadraticCurveTo(10, -2, 14, -10);
  }, 0);

  // Orejita cercana (near ear)
  shape(capiFur, () => {
   ctx.moveTo(-2, -18);
   ctx.bezierCurveTo(-8, -28, 4, -32, 8, -20);
   ctx.closePath();
  }, 1.4, capiOutline);
  oval(2, -23, 2.8, 3.8, '#ff9dbb');
  oval(2, -23, 1.2, 1.6, '#ffffff');

  // Naricita botón zen de capibara
  shape(capiNose, () => {
   ctx.moveTo(27, -4);
   ctx.quadraticCurveTo(32, -6, 35, -2);
   ctx.quadraticCurveTo(34, 4, 30, 4);
   ctx.quadraticCurveTo(26, 2, 27, -4);
  }, 0.8, capiOutline);
  oval(29, -1, 1, 1.5, '#1d1222');
  oval(33, 0, 1, 1.5, '#1d1222');

  // Boquita serena / sonrisa en 'ω'
  const capiMouthOpen = Math.max(atkK * 0.5, victory ? 0.45 : 0, state === 'cast' && power === 5 ? 0.5 : 0);
  if (capiMouthOpen > 0.15) {
   shape('#783850', () => {
    ctx.moveTo(25, 6);
    ctx.quadraticCurveTo(29, 6, 32, 7);
    ctx.quadraticCurveTo(28, 13 + capiMouthOpen * 3, 24, 7);
   }, 0.8, capiOutline);
   oval(28, 9, 2.2, 1.2, '#ff9dbb');
  } else {
   line(capiOutline, 1.2, () => {
    ctx.moveTo(30, 4); ctx.lineTo(29, 7);
    ctx.quadraticCurveTo(26, 10, 23, 8);
    ctx.moveTo(29, 7);
    ctx.quadraticCurveTo(32, 10, 34, 7);
   });
  }

  // Mofletes sonrosados de rubor ultra kawaii con destello blanco
  oval(12, 6, 4.5, 2.8, '#ff9dbb');
  oval(13, 5.5, 1.4, 1.0, '#ffffff');
  oval(-2, 4, 3.6, 2.2, '#ff9dbb');

  // Bigotitos zen delicados
  line('#a990b3', 0.65, () => {
   ctx.moveTo(24, 6); ctx.lineTo(16, 8);
   ctx.moveTo(24, 9); ctx.lineTo(17, 13);
  });

  // Ojos de héroe compartidos
  const capiEyeOpts = {
   closed: dead || hurt || r.mood === 'closed',
   happy: victory || r.mood === 'happy' || state === 'idle',
   blink: finite(r.motion?.blink),
   mood: atkK > 0.3 ? 'angry' : 'normal',
   look: { x: Math.max(-1, Math.min(1, finite(pose.look?.x) + finite(r.motion?.lookX) * 0.3)), y: finite(pose.look?.y) }
  };
  eye(-1, -6, 7.2);
  eye(15, -4, 8.0);

  // 8. El legendario YUZU / MANDARINA CELESTIAL sobre la cabecita
  const yuzuX = 6, yuzuY = -27;
  shape(capiGold, () => {
   ctx.ellipse(yuzuX, yuzuY, 6.5, 5.5, 0, 0, TAU);
  }, 1.2, capiOutline);
  oval(yuzuX - 1.5, yuzuY - 1.5, 2.2, 1.6, '#ffffff');
  shape(capiLeaf, () => {
   ctx.moveTo(yuzuX, yuzuY - 5.5);
   ctx.quadraticCurveTo(yuzuX + 4, yuzuY - 10, yuzuX + 8, yuzuY - 8);
   ctx.quadraticCurveTo(yuzuX + 5, yuzuY - 5, yuzuX, yuzuY - 5.5);
  }, 0.8, capiOutline);
  sparkle(yuzuX + 8, yuzuY - 8, 1.4, '#ffffff');

  // Efectos de ataque celestial zen bioluminiscente
  if (atkK > 0.08) {
   ctx.save();
   ctx.globalAlpha = atkK * 0.85;
   line('#7ef3ff', 3.2, () => {
    ctx.arc(38, 2, 28, -Math.PI * 0.45, Math.PI * 0.45);
   });
   line('#ffffff', 1.8, () => {
    ctx.arc(42, 2, 22, -Math.PI * 0.35, Math.PI * 0.35);
   });
   sparkle(52, -10, 2.2, '#ffe66d');
   sparkle(54, 12, 1.8, '#7ef3ff');
   ctx.restore();
  }

  // Efectos de conjuros cósmicos según power (J/K/L/I/P/U)
  spellAccents(28, 4);

  ctx.restore(); // restore head

  ctx.restore(); // restore body
  return;
 }
}

// Public action vocabulary is also consumed by welcome/cinema validation.
export const MICHICORNIO_ACTIONS=Object.freeze(['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory']);

function draw(ctx, pose, R) {
  const src = pose || {},finite=(v,d=0)=>Number.isFinite(v)?v:d;
  // Rendering never repairs the live actor. Malformed replay clocks are bounded
  // in this local pose; reduced motion freezes the complete performance, not
  // only the sine waves (including tentacle launch progress and landing squash).
  const safe={...src,look:{x:finite(src.look?.x,1),y:finite(src.look?.y)}};
  for(const key of ['t','phase','speed','atk','cast','flourish','flourishN','hurt','bounce','land','turnPulse','brake','bodyTilt','michiSeed'])safe[key]=finite(src[key]);
  if(safe.reduceMotion){safe.t=0;safe.phase=0;safe.atk=safe.state==='attack'?.5:0;safe.cast=safe.state==='cast'?.5:0;safe.land=0;safe.bounce=0;safe.bodyTilt=0;safe.flourish=0;safe.hurt=.5;}
  const f = Math.max(0, Math.min(4, Math.round(finite(Number(safe.form)))));
  if(f===0){ // MOON KITTEN: its own connected, soft kitten anatomy.
    drawMoonKitten(ctx,safe);return;
  }
  if(f===3){ // MOON HARE: its own rabbit rig replaces feline overlays.
    drawMoonHare(ctx,safe);return;
  }
  const r = solve(safe);
  if(!Number.isFinite(safe.michiDuetAge)){
    r.motion=michiMotion(safe,f);
    if(r.motion.mood)r.mood=r.motion.mood;
  }
  if(Number.isFinite(safe.michiDuetAge)){r.mood=safe.michiDuetAge<36?'happy':'angry';r.tail=2.1;r.arm=safe.michiDuetAge<36?-1.7:.4;}
  const welcome=michiWelcomeRig(safe,f);
  if(welcome.active){
    r.arm+=welcome.arm;r.leg+=welcome.leg;
    r.tail+=welcome.tail;r.bob+=welcome.bob;
    r.michiHead=welcome.head+welcome.look;r.michiEar=welcome.ear;
    r.michiWing=welcome.wing;r.mood=welcome.mood;
    r.michiHaunch=welcome.haunch;r.michiPaw=welcome.paw;r.michiLook=welcome.look;
  }
  ctx.save();
  drawMichiFootwork(ctx,safe,f,safe.t||0);
  // Each form owns its accents; no shared halo obscures the face.
  ctx.translate(0, r.bob + (safe.bounce || 0) * 2);
  // One connected original cat silhouette per form: tail, feet, shoulder
  // roots, ears and (F4 only) feathered wings expand together from the paws.
  if(welcome.active)ctx.scale(welcome.torsoX,welcome.torsoY);
  if(r.motion){ctx.translate(0,r.motion.lift+r.motion.crouch);ctx.rotate(r.motion.lean);ctx.scale(r.motion.sx,r.motion.sy);}
  if (r.st === "dead") {
    ctx.rotate(.60);
    ctx.translate(8, -10);
  } else if (r.st === "hurt") ctx.rotate(-0.18);
  else if (r.st === "jump") ctx.scale(0.94, 1.08);
  else if (r.st === "fall") ctx.scale(1.05, 0.92);
  else if (r.slot === 1) ctx.scale(1.08, 0.9);
  else if (safe.bodyTilt) ctx.rotate(safe.bodyTilt * 0.8);
  drawMichiMythic(ctx,safe,r,f);
  // The articulated body already performs the action; avoid doubled gesture FX.
  ctx.restore();
}

export default { id: "cat", draw };
