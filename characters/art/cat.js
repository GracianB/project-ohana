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
 function eye(x,y,rx,ry,col='#8e729f',side=1){
  const closed=dead||hurt||r.mood==='closed'||r.mood==='happy'||!!r.motion?.blink;
  if(closed){line(ink,1.5,()=>{ctx.moveTo(x-rx,y);ctx.quadraticCurveTo(x,y+(hurt?2.7:-2.5),x+rx,y-.25);});return;}
  const gaze=Math.max(-1,Math.min(1,finite(pose.look?.x)*.5+finite(r.motion?.lookX)*.3));
  const lid=()=>{ctx.moveTo(x-rx,y+.25);ctx.bezierCurveTo(x-rx*.65,y-ry,x+rx*.65,y-ry,x+rx,y-.4);ctx.bezierCurveTo(x+rx*.68,y+ry*.8,x-rx*.73,y+ry*.82,x-rx,y+.25);};
  ctx.save();ctx.beginPath();lid();ctx.closePath();ctx.clip();ctx.fillStyle='#f4e7ef';ctx.fillRect(x-rx-1,y-ry-1,rx*2+2,ry*2+2);
  oval(x+gaze,y,rx*1.02,ry*1.1,col);oval(x+gaze,y-.2,rx*.56,ry*.78,'#47374e');
  // A quiet reflected sky edge is underneath the pupil, never a white target ring.
  line('#dcb8d7',.8,()=>{ctx.moveTo(x-rx*.65,y+ry*.42);ctx.quadraticCurveTo(x,y+ry*.8,x+rx*.62,y+ry*.36);});
  oval(x+gaze-rx*.24,y-ry*.35,Math.max(.7,rx*.16),Math.max(.9,ry*.2),'#fff5e3');ctx.restore();
  line(ink,1.55,()=>{ctx.moveTo(x-rx,y+.25);ctx.bezierCurveTo(x-rx*.65,y-ry,x+rx*.65,y-ry,x+rx,y-.4);});
  line('#ae91b2',.75,()=>{ctx.moveTo(x-rx*.94,y+.7);ctx.quadraticCurveTo(x,y+ry*.95,x+rx*.95,y+.2);});
  // Soft brow grows from the skull and follows expression rather than masking it.
  if(atkK>.3)line(shade,.9,()=>{ctx.moveTo(x-rx*.8,y-ry-1+side);ctx.quadraticCurveTo(x,y-ry-2,x+rx*.7,y-ry-1-side);});
 }
 function catHead({x=0,y=0,size=1,coat=fur,shadow=shade,muzzle=white,iris='#97759d',earLength=35,crown=false}={}){
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
  eye(-12,-1.5,6.1,6.4,iris,-1);eye(12,-1.5,6.1,6.4,iris,1);
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
 if(f===1){ // HADA FELINA · petal moth wings, soft dancer's limbs, alert moon-cat face.
  const flutter=still?0:Math.sin(t*(air?.42:run?.34:.16)+g.pulsePhase*6),hover=still?8:8+wave(0,.055)*2;
  ctx.save();ctx.scale(.72,.72);ctx.translate(0,-hover+(hurt?3:0));
  const fold=hurt?.42:state==='glide'?.98:Math.min(1,.83+castK*.14),wingSize=56+(air?6:0)+(victory?3:0);
  for(const side of[-1,1]){
   drawFairyWing(ctx,{x:side*6,y:-44,side,size:wingSize*.82,open:fold,flap:flutter*.7,lower:true,fill:pal.glow2,rim:'#d9b9dc',vein:pal.ink,alpha:.68,accent:pal.rim,outline:ink});
   drawFairyWing(ctx,{x:side*7,y:-56,side,size:wingSize,open:fold,flap:flutter,fill:pal.glow,rim:'#ebd8ec',vein:pal.ink,spot:pal.gonad,alpha:.78,accent:pal.glow2,outline:ink});
  }
  // One rooted plume follows its hips; the gold tip is a marking, not an orbiting toy.
  const tailO={x:-9,y:-31,len:47,t,still,swish:1+atkK+(run?.5:0),curl:1.0,dir:-2.6,phase:g.phases[0],root:5.5,tip:2.5,fur,dark:shade,ink,fluff:true,tipColor:'#f4ddb0'};
  drawCatTail(ctx,tailO);
  for(const side of[-1,1]){
   const kick=still?0:wave(side*1.4,air?.24:.08)*(air?6:2.3);
   limb({hip:[side*7,-31],paw:[side*9+kick*.5-(air?3:0),-7-Math.abs(kick)*.5-(state==='jump'?7:0)],width:4,far:side<0,bend:side,pads:air});
  }
  shape(fur,()=>{ctx.moveTo(-11,-62);ctx.bezierCurveTo(-20,-55,-14,-36,-10,-29);ctx.quadraticCurveTo(0,-23,11,-30);ctx.bezierCurveTo(17,-39,19,-53,11,-63);ctx.quadraticCurveTo(0,-68,-11,-62);},1.45);
  shape(white,()=>{ctx.moveTo(-7,-57);ctx.quadraticCurveTo(0,-61,8,-56);ctx.quadraticCurveTo(11,-40,4,-33);ctx.quadraticCurveTo(-6,-33,-7,-57);},0);
  // The collar is six attached curled petals, with space around the face.
  for(const side of[-1,1])for(let k=0;k<3;k++)shape(k===1?'#ebc4d9':'#d3c6ed',()=>{ctx.moveTo(side*(3+k*3),-61);ctx.quadraticCurveTo(side*(13+k*3),-59+k*2,side*(10+k*2),-54+k*2);ctx.quadraticCurveTo(side*(5+k*2),-53+k*2,side*(3+k*3),-61);},.65);
  for(const side of[-1,1]){
   let paw=[side*10,-43+wave(side,.07)];
   if(air)paw=[side*15,-47];if(state==='wall')paw=[side>0?29:-10,side>0?-69:-43];
   if(castK){if(power===1)paw=[side*(8+castK*3),-40];else if(power===3)paw=[side*14+castK*13,-46-castK*12];else if(power===4)paw=[side*21,-70-castK*9];else if(power===5)paw=[side*(15+castK*8),-59-wave(side,.2)*3];else if(side>0)paw=[20+castK*6,-67-castK*(power===2?15:4)];}
   if(atkK&&side>0)paw=[21+atkK*18,-54+atkK*3];if(victory)paw=[side*23,-76+wave(side,.1)*2];if(hurt)paw=[side*12,-56];
   limb({hip:[side*10,-58],paw,width:3.7,far:side<0,bend:side,pads:air||castK>.2});
   if(side>0)spellAccents(paw[0],paw[1]);
  }
  catHead({y:-83,size:.91,iris:'#94789f',earLength:32});
  // A small botanical wreath stays attached to the brow, above the eyes.
  for(const [x,y,col]of[[-11,-105,'#e8c6df'],[12,-105,'#d6cce9']]){for(let k=0;k<5;k++){const a=k*TAU/5;shape(col,()=>{ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a-.5)*5,y+Math.sin(a-.5)*5,x+Math.cos(a)*5,y+Math.sin(a)*5);ctx.quadraticCurveTo(x+Math.cos(a+.5)*5,y+Math.sin(a+.5)*5,x,y);},.45);}oval(x,y,1.5,1.5,'#f2daac');}
  // One pair of quiet stamens grows from behind the ears; no lens rings on the eyes.
  for(const side of[-1,1]){const bend=wave(side,.08)*2;line('#b193b5',.85,()=>{ctx.moveTo(side*9,-109);ctx.bezierCurveTo(side*10,-120,side*18,-119+bend,side*18,-124+bend);});oval(side*18,-124+bend,1.6,2,'#f4e3b9');}
  if(!still){for(let k=0;k<3;k++){const s=g.moteSeeds[k],u=(t*.005+s)%1;ctx.save();ctx.globalAlpha=(1-u)*.5;sparkle((s-.5)*65,-61+u*47,1.2,pal.bead);ctx.restore();}}
  ctx.restore();return;
 }
 if(f===2){ // MEDUSA ONÍRICA · Aurelia bell, seven real tentacles and two oral frills.
  let contraction=jellyPulse(t,g,still).c;if(state==='jump')contraction=Math.max(contraction,.85);else if(state==='fall'||state==='glide')contraction*=.2;else if(hurt)contraction=.55;
  const float=air?1:0,trail=run?-11:state==='glide'?-6:0,Lcast=state==='cast'&&power===2;
  ctx.save();ctx.scale(.72,.72);ctx.translate(0,-5-contraction*5+wave(0,.06));
  const rimY=-57,bellH=57,bellW=40;
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
  eye(-13,-83,5.3,5.9,pal.ink==='#33335e'?'#8c8eaf':'#ac83ab',-1);eye(13,-83,5.3,5.9,pal.ink==='#33335e'?'#8c8eaf':'#ac83ab',1);
  shape('#db9ab4',()=>{ctx.moveTo(-2,-73);ctx.quadraticCurveTo(0,-75,3,-73);ctx.lineTo(0,-70);},.6,pal.ink);
  line(pal.ink,1.1,()=>{ctx.moveTo(0,-70);ctx.quadraticCurveTo(-3,-66,-6,-69);ctx.moveTo(0,-70);ctx.quadraticCurveTo(3,-66,6,-69);});
  for(const side of[-1,1]){oval(side*22,-73,3.6,1.4,pal.gonad);for(let k=0;k<2;k++)line('#a08eb1',.7,()=>{ctx.moveTo(side*24,-73+k*4);ctx.quadraticCurveTo(side*34,-73+k*4,side*42,-77+k*6+wave(side,.08));});}
  if(castK>0)spellAccents(31,-74);
  ctx.restore();return;
 }
 if(f===4){ // ECLIPSE · feathered white moon guardian, nine rooted luminous plumes.
  const bodyY=run?-Math.abs(step)*2.5:0,wingBeat=still?0:Math.sin(t*(air?.3:.09))*.26;
  ctx.save();ctx.scale(.96,.96);ctx.translate(atkK*2,hurt?3:bodyY);
  // Nine full moon-plumes grow from the pelvis. Their pale nerve stripe inherits
  // the Medusa's bioluminescence, while the outer coat is deep soft guardian fur.
  // The fan is below the wings and outside the face, each taper has its own lag.
  const Lcast=state==='cast'&&power===2;
  const plumeEnds=[[-82,-45],[-86,-22],[-76,-1],[-55,11],[-43,-79],[55,11],[76,-1],[86,-22],[82,-45]];
  for(let i=0;i<9;i++){
   const [endX,endY]=plumeEnds[i],side=endX<0?-1:1,kick=Lcast&&!still?michiLaunchKick(i,9,pose.cast):0;
   const lag=wave(g.phases[i],.047)*(run?5:2.8),root=[side*11,-24],end=[endX+kick*15,endY+lag-(air?4:0)];
   const ctrl1=[side*(24+(i%3)*3),-36+lag],ctrl2=[endX*.82,endY+(i<4?18:-18)+lag];
   const points=[],edges=[[],[]];
   for(let k=0;k<=14;k++){
    const u=k/14,v=1-u,x=v*v*v*root[0]+3*v*v*u*ctrl1[0]+3*v*u*u*ctrl2[0]+u*u*u*end[0],y=v*v*v*root[1]+3*v*v*u*ctrl1[1]+3*v*u*u*ctrl2[1]+u*u*u*end[1];
    const dx=3*v*v*(ctrl1[0]-root[0])+6*v*u*(ctrl2[0]-ctrl1[0])+3*u*u*(end[0]-ctrl2[0]),dy=3*v*v*(ctrl1[1]-root[1])+6*v*u*(ctrl2[1]-ctrl1[1])+3*u*u*(end[1]-ctrl2[1]),d=Math.hypot(dx,dy)||1;
    const w=(5.5+Math.sin(u*Math.PI)*3.5)*(1-u*u*.97);points.push([x,y]);
    edges[0].push([x-dy/d*w,y+dx/d*w]);edges[1].push([x+dy/d*w,y-dx/d*w]);
   }
   const followEdge=(pts,first=false)=>{if(first)ctx.moveTo(...pts[0]);for(let k=1;k<pts.length-1;k++)ctx.quadraticCurveTo(...pts[k],(pts[k][0]+pts[k+1][0])/2,(pts[k][1]+pts[k+1][1])/2);ctx.lineTo(...pts.at(-1));};
   shape(i%3===0?'#e2cce5':i%3===1?'#f7e7d2':'#e9dff2',()=>{followEdge(edges[0],true);followEdge([...edges[1]].reverse());},1.05);
   line('#fff8e7',2.1,()=>{followEdge(points,true);});
   // Fine guard-hairs stay in the coat, rather than another free particle halo.
   const tip=points[11],near=points[9];line(i%2?'#bba2c7':'#d4b3c3',.65,()=>{ctx.moveTo(near[0],near[1]+2);ctx.quadraticCurveTo(tip[0],tip[1]+3,end[0]-side*3,end[1]+1);});
   if(!still&&castK>.2)sparkle(end[0],end[1],1.8,'#f8e2af');
  }
  // The wings have individual long primaries, not another jelly umbrella on its back.
  for(const side of[-1,1]){
   ctx.save();ctx.translate(side*13,-54);ctx.scale(side,1);ctx.rotate((air?-.13:.18)+wingBeat);
   shape('#e6d7ec',()=>{ctx.moveTo(0,2);ctx.bezierCurveTo(8,-15,35,-45,57,-43);ctx.bezierCurveTo(63,-39,45,-12,25,0);ctx.quadraticCurveTo(10,9,0,2);},1.25);
   for(let k=5;k>=0;k--){const x=12+k*7,y=-7-k*5;shape(k%2?'#fff4dc':'#fffaf1',()=>{ctx.moveTo(x-8,y+6);ctx.quadraticCurveTo(x+3,y-15,x+14,y-24-k*.5);ctx.bezierCurveTo(x+18,y-22,x+8,y+1,x+1,y+9);ctx.quadraticCurveTo(x-4,y+12,x-8,y+6);},.7);line('#d9bdd7',.65,()=>{ctx.moveTo(x-3,y+6);ctx.quadraticCurveTo(x+4,y-5,x+11,y-18);});}
   shape('#fff4e1',()=>{ctx.moveTo(-2,1);ctx.bezierCurveTo(4,-18,18,-23,27,-24);ctx.quadraticCurveTo(16,-4,3,7);ctx.closePath();},.8);
   ctx.restore();
  }
  // A long feline back and asymmetric hock establish three-quarter body depth.
  // The near shoulder, ankle and paw form one changing contour, never a pair of rods.
  const feet=(near,front)=>{
   const shift=run?step*(front?13:-12)*(near?1:-1):air?(front?9:-8):0;
   const lift=run?-Math.max(0,Math.cos(phase+(near?0:Math.PI)+(front?0:Math.PI)))*10:state==='jump'?-13:state==='glide'?-17:state==='fall'?-4:0;
   return [(front?(near?22:8):(near?-16:-27))+shift,lift+(near?0:-2)];
  };
  limb({hip:[-25,-25],paw:feet(false,false),width:6,coat:'#ded0d9',shadow:'#c3afc5',far:true,bend:-1});
  limb({hip:[9,-40],paw:feet(false,true),width:4.9,coat:'#f1e2da',shadow:'#d2bbc9',far:true,bend:-1});
  shape('#fff0dd',()=>{ctx.moveTo(-31,-27);ctx.bezierCurveTo(-37,-49,-13,-54,7,-48);ctx.bezierCurveTo(22,-56,31,-39,23,-24);ctx.quadraticCurveTo(19,-12,4,-12);ctx.bezierCurveTo(-11,-7,-29,-11,-31,-27);},1.55);
  shape('#d8c4d4',()=>{ctx.moveTo(-32,-24);ctx.quadraticCurveTo(-15,-8,10,-15);ctx.quadraticCurveTo(19,-18,23,-28);ctx.quadraticCurveTo(24,-15,10,-10);ctx.quadraticCurveTo(-25,1,-32,-24);},0);
  shape('#fff9ef',()=>{ctx.moveTo(-28,-36);ctx.bezierCurveTo(-21,-48,-5,-49,8,-43);ctx.quadraticCurveTo(-10,-45,-25,-31);},0);
  // Near thigh is carved into the flank; its curved fold is not a circular joint.
  shape('#f8e7d8',()=>{ctx.moveTo(-28,-32);ctx.bezierCurveTo(-37,-22,-27,-7,-13,-11);ctx.quadraticCurveTo(-4,-18,-12,-29);ctx.quadraticCurveTo(-18,-37,-28,-32);},1.05);
  line('#fffaf1',1.5,()=>{ctx.moveTo(-26,-29);ctx.quadraticCurveTo(-17,-34,-12,-24);});
  limb({hip:[-19,-16],paw:feet(true,false),width:6.5,coat:'#f7e5d6',shadow:'#d8bdcc',bend:-1,pads:air});
  // Fine chest fur follows the throat down over the shoulders, leaving leg space.
  shape('#fff9ed',()=>{ctx.moveTo(-5,-63);ctx.bezierCurveTo(9,-67,27,-59,27,-45);ctx.quadraticCurveTo(26,-34,20,-27);ctx.lineTo(18,-32);ctx.quadraticCurveTo(13,-27,9,-25);ctx.lineTo(8,-31);ctx.lineTo(2,-28);ctx.lineTo(3,-35);ctx.quadraticCurveTo(-6,-31,-5,-41);ctx.quadraticCurveTo(-11,-39,-9,-47);ctx.quadraticCurveTo(-13,-52,-5,-63);},1.1);
  line('#dcc7da',.85,()=>{ctx.moveTo(-1,-54);ctx.quadraticCurveTo(-3,-42,5,-36);ctx.moveTo(18,-54);ctx.quadraticCurveTo(22,-44,16,-37);});
  let leadPaw=feet(true,true);
  if(atkK>0)leadPaw=[30+atkK*23,-31-atkK*7];
  if(castK>0){if(power===1)leadPaw=[22,-24];else if(power===3)leadPaw=[31+castK*10,-23-castK*8];else if(power===4)leadPaw=[34,-60-castK*8];else if(power===5)leadPaw=[31,-48];else leadPaw=[30,-38-castK*(power===2?19:6)];}
  if(hurt)leadPaw=[21,-32];if(state==='wall')leadPaw=[39,-68];if(victory)leadPaw=[28,-27];
  // Foreleg's broad shoulder narrows toward a forward-facing rounded toe.
  const elbow=[19+atkK*12,-22+(leadPaw[1]+1)*.24];
  shape('#fff4e2',()=>{ctx.moveTo(15,-44);ctx.bezierCurveTo(7,-37,elbow[0]-7,elbow[1],leadPaw[0]-4,leadPaw[1]-5);ctx.bezierCurveTo(leadPaw[0]-10,leadPaw[1]-4,leadPaw[0]-8,leadPaw[1]+2,leadPaw[0]-1,leadPaw[1]+2);ctx.quadraticCurveTo(leadPaw[0]+13,leadPaw[1]+3,leadPaw[0]+12,leadPaw[1]-2);ctx.quadraticCurveTo(leadPaw[0]+11,leadPaw[1]-7,leadPaw[0]+5,leadPaw[1]-6);ctx.quadraticCurveTo(elbow[0]+5,elbow[1],24,-42);ctx.quadraticCurveTo(20,-48,15,-44);},1.35);
  shape('#dcc4d5',()=>{ctx.moveTo(15,-39);ctx.quadraticCurveTo(elbow[0]-5,elbow[1],leadPaw[0]-3,leadPaw[1]-4);ctx.quadraticCurveTo(leadPaw[0]+1,leadPaw[1]-1,leadPaw[0]+8,leadPaw[1]);ctx.lineTo(leadPaw[0]-1,leadPaw[1]+1);ctx.quadraticCurveTo(elbow[0]-7,elbow[1],15,-39);},0);
  line('#fffaf1',1.3,()=>{ctx.moveTo(21,-36);ctx.quadraticCurveTo(elbow[0]+3,elbow[1],leadPaw[0]+4,leadPaw[1]-7);});
  for(const dx of[4,8])line('#ae90aa',.7,()=>{ctx.moveTo(leadPaw[0]+dx,leadPaw[1]-2);ctx.lineTo(leadPaw[0]+dx,leadPaw[1]+1);});
  catHead({x:8,y:-77,size:1.01,coat:'#fff4df',shadow:'#dcc8d3',muzzle:'#fffaf2',iris:'#a47c93',earLength:35,crown:true});
  spellAccents(leadPaw[0],leadPaw[1]);
  ctx.restore();return;
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
