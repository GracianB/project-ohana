import {drawMichiEye} from '../michi-eyes.js';
import {drawMoonKitten} from '../michi-kitten.js';
import {drawMoonHare} from '../michi-moon-hare.js';
import {michiMotion} from "../michi-motion.js";
import {michiGenome,jellyPulse,drawJellyBell,drawTentacle} from "../michi-jelly.js";
import {michiLaunchKick,michiLaunchFrame,drawCatTail,drawFairyWing} from "../michi-anatomy.js";
// Medusaluna: pólipo astral → sílfide de cristal → medusa onírica → hidrozoo cósmico → deidad medusaluna.
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
 if(m.running>.3)for(let i=0;i<3;i++){const k=((t*.055+i/3)%1+1)%1,x=-12-k*26,y=-2-k*4;ctx.globalAlpha=.4*(1-k)*m.running;if(f===2){ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x,y-3);ctx.lineTo(x+3,y);ctx.lineTo(x,y+3);ctx.closePath();ctx.fill();}else if(f===3){ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,3,.25,Math.PI*1.5);ctx.stroke();}else{ctx.beginPath();ctx.ellipse(x,y,3,1.8,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x,y,1.1,0,Math.PI*2);ctx.fill();}}
 if(m.landing>.02){ctx.globalAlpha=m.landing*.55;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-1,11+(1-m.landing)*18,3,0,0,Math.PI*2);ctx.stroke();for(const side of [-1,1]){ctx.beginPath();ctx.arc(side*(12+(1-m.landing)*10),-4-(1-m.landing)*6,2,0,Math.PI*2);ctx.fill();}}
 if(m.turn>.02){ctx.globalAlpha=m.turn*.6;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-7,-5);ctx.bezierCurveTo(-29,-2,-28,-23,-12,-14);ctx.bezierCurveTo(-6,-10,-18,-7,-21,-13);ctx.stroke();}
 if(m.brake>.02){ctx.globalAlpha=m.brake*.5;ctx.lineWidth=1.3;for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(-16-i*9,-2-i*2,5,2,-.3,0,Math.PI*1.6);ctx.stroke();}}
 ctx.restore();
}

// V625 · Morfologías etéreas de la estirpe Medusa: Campanas translúcidas vivas,
// velos nácar y zarcillos celestiales. Cero anatomía felina.
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
 const oval=(x,y,rx,ry,col,w=0)=>shape(col,()=>ctx.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,TAU),w);
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
  for(const side of[-1,1]){
   const flick=(still?0:wave(side,.075)*2)+finite(r.michiEar)*4+finite(r.motion?.ear)*5-(hurt?5:0);
   shape(coat,()=>{ctx.moveTo(side*12,-18);ctx.bezierCurveTo(side*18,-30,side*26,-28+flick,side*28,-36+flick);ctx.quadraticCurveTo(side*32,-20,side*22,-10);ctx.quadraticCurveTo(side*16,-12,side*12,-18);},1.25);
   line('#fff7ed',1.1,()=>{ctx.moveTo(side*14,-20);ctx.quadraticCurveTo(side*20,-28,side*26,-34+flick);});
   oval(side*28,-36+flick,2,2,pal.bead);
  }
  shape(coat,()=>{ctx.moveTo(-28,-6);ctx.bezierCurveTo(-30,-26,-12,-34,2,-32);ctx.bezierCurveTo(20,-32,31,-22,28,-4);ctx.quadraticCurveTo(29,4,31,8);ctx.lineTo(25,9);ctx.quadraticCurveTo(21,14,19,18);ctx.bezierCurveTo(10,26,-10,24,-20,17);ctx.lineTo(-24,10);ctx.quadraticCurveTo(-28,4,-28,-6);},1.45);
  shape(shadow,()=>{ctx.moveTo(-27,2);ctx.bezierCurveTo(-14,15,9,21,27,7);ctx.quadraticCurveTo(27,21,7,23);ctx.quadraticCurveTo(-15,25,-27,9);},0);
  shape('#fff8f3',()=>{ctx.moveTo(-21,-11);ctx.quadraticCurveTo(-14,-25,1,-25);ctx.quadraticCurveTo(-8,-19,-12,-10);ctx.closePath();},0);
  eye(-12,-3.5,8);eye(12,-3.5,8);
  oval(-20,10,3.5,1.45,'#efbbd4');oval(20,10,3.5,1.45,'#efbbd4');
  const open=Math.max(atkK*.65,castK*(power===5?.6:.25),victory?.55:0);
  if(open>.1){shape('#71485e',()=>{ctx.moveTo(-3,12);ctx.quadraticCurveTo(1,14,6,11);ctx.quadraticCurveTo(6,16+open*3,1,16+open*3);ctx.quadraticCurveTo(-3,15+open*2,-3,12);},.7);oval(2,16+open,2.7,1.2,'#efb4cb');}
  else{line(ink,1.0,()=>{ctx.moveTo(-2,11);ctx.quadraticCurveTo(1,13,5,11);});}
  for(const [x0,y0,x1,y1]of[[-8,-26,-5,-19],[0,-27,1,-20],[8,-26,6,-19]])line(shadow,1,()=>{ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x0,y1-2,x1,y1);});
  horn(1,-25,crown?30:24,crown?4.8:4);
  if(crown){crescent(1,-17,3.6,'#d4b481');for(const side of[-1,1])line('#d9c5a0',.95,()=>{ctx.moveTo(side*8,-22);ctx.quadraticCurveTo(side*15,-17,side*20,-20);});}
  ctx.restore();
 }
 function jellyFilament({root,end,width=4,col=pal.glow,far=false,curl=0}){
  const rx=root[0],ry=root[1],ex=end[0],ey=end[1];
  const mx=(rx+ex)*.5+curl*8,my=(ry+ey)*.5;
  shape(col,()=>{ctx.moveTo(rx-width,ry);ctx.quadraticCurveTo(mx-width*.7,my,ex-width*.3,ey);ctx.quadraticCurveTo(ex+width*.3,ey,mx+width*.7,my);ctx.quadraticCurveTo(rx+width,ry,rx-width,ry);},far?1:1.25);
  line('#fffdf5',.9,()=>{ctx.moveTo(rx,ry+2);ctx.quadraticCurveTo(mx,my,ex,ey-2);});
  oval(ex,ey,width*.55,width*.55,pal.bead);
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
 if(f===1){ // SÍLFIDE DE CRISTAL / MEDUSA ALADA · aletas ondulantes de velo nácar, campana esbelta y zarcillos flotantes.
  const flutter=still?0:Math.sin(t*(air?.42:run?.34:.16)+g.pulsePhase*6),hover=still?8:8+wave(0,.055)*2;
  ctx.save();ctx.scale(.72,.72);ctx.translate(0,-hover+(hurt?3:0));
  const fold=hurt?.42:state==='glide'?.98:Math.min(1,.83+castK*.14),wingSize=56+(air?6:0)+(victory?3:0);
  for(const side of[-1,1]){
   drawFairyWing(ctx,{x:side*6,y:-44,side,size:wingSize*.82,open:fold,flap:flutter*.7,lower:true,fill:pal.glow2,rim:'#d9b9dc',vein:pal.ink,alpha:.68,accent:pal.rim,outline:ink});
   drawFairyWing(ctx,{x:side*7,y:-56,side,size:wingSize,open:fold,flap:flutter,fill:pal.glow,rim:'#ebd8ec',vein:pal.ink,spot:pal.gonad,alpha:.78,accent:pal.glow2,outline:ink});
  }
  shape(fur,()=>{ctx.moveTo(-14,-66);ctx.bezierCurveTo(-22,-52,-18,-34,-12,-25);ctx.quadraticCurveTo(0,-18,12,-25);ctx.bezierCurveTo(18,-34,22,-52,14,-66);ctx.quadraticCurveTo(0,-72,-14,-66);},1.45);
  shape(white,()=>{ctx.moveTo(-10,-58);ctx.quadraticCurveTo(0,-63,10,-58);ctx.quadraticCurveTo(12,-38,4,-30);ctx.quadraticCurveTo(-8,-30,-10,-58);},0);
  for(const side of[-1,1])for(let k=0;k<3;k++)shape(k===1?'#ebc4d9':'#d3c6ed',()=>{ctx.moveTo(side*(3+k*3),-61);ctx.quadraticCurveTo(side*(13+k*3),-59+k*2,side*(10+k*2),-54+k*2);ctx.quadraticCurveTo(side*(5+k*2),-53+k*2,side*(3+k*3),-61);},.65);
  for(const side of[-1,1]){
   const kick=still?0:wave(side*1.4,air?.24:.08)*(air?6:2.3);
   const end=[side*9+kick*.5-(air?3:0),-7-Math.abs(kick)*.5-(state==='jump'?7:0)];
   jellyFilament({root:[side*8,-25],end,width:3.8,col:side<0?pal.deep:pal.arm,far:side<0,curl:side*0.3});
  }
  for(const side of[-1,1]){
   let tip=[side*11,-42+wave(side,.07)];
   if(air)tip=[side*16,-46];if(state==='wall')tip=[side>0?30:-10,side>0?-68:-42];
   if(castK){if(power===1)tip=[side*(8+castK*3),-38];else if(power===3)tip=[side*14+castK*13,-45-castK*12];else if(power===4)tip=[side*21,-69-castK*9];else if(power===5)tip=[side*(15+castK*8),-58-wave(side,.2)*3];else if(side>0)tip=[21+castK*6,-66-castK*(power===2?15:4)];}
   if(atkK&&side>0)tip=[22+atkK*18,-53+atkK*3];if(victory)tip=[side*24,-75+wave(side,.1)*2];if(hurt)tip=[side*12,-55];
   jellyFilament({root:[side*9,-40],end:tip,width:3.5,col:pal.glow,far:side<0,curl:side*0.25});
   if(side>0)spellAccents(tip[0],tip[1]);
  }
  catHead({y:-83,size:.91,earLength:32});
  for(const [x,y,col]of[[-11,-105,'#e8c6df'],[12,-105,'#d6cce9']]){for(let k=0;k<5;k++){const a=k*TAU/5;shape(col,()=>{ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a-.5)*5,y+Math.sin(a-.5)*5,x+Math.cos(a)*5,y+Math.sin(a)*5);ctx.quadraticCurveTo(x+Math.cos(a+.5)*5,y+Math.sin(a+.5)*5,x,y);},.45);}oval(x,y,1.5,1.5,'#f2daac');}
  for(const side of[-1,1]){const bend=wave(side,.08)*2;line('#b193b5',.85,()=>{ctx.moveTo(side*9,-109);ctx.bezierCurveTo(side*10,-120,side*18,-119+bend,side*18,-124+bend);});oval(side*18,-124+bend,1.6,2,'#f4e3b9');}
  if(!still){for(let k=0;k<3;k++){const s=g.moteSeeds[k],u=(t*.005+s)%1;ctx.save();ctx.globalAlpha=(1-u)*.5;sparkle((s-.5)*65,-61+u*47,1.2,pal.bead);ctx.restore();}}
  ctx.restore();return;
 }
 if(f===2){ // MEDUSA ESPEJO · Campana facetada de cristal líquido, 7 tentáculos prismáticos, prismas flotantes orbitales. Sin cuerno ni orejas.
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
  // Velos orales prismáticos
  for(const side of[-1,1])for(let layer=0;layer<2;layer++)drawTentacle(ctx,{x:side*7,y:rimY-3,len:39+layer*6,phase:g.phases[7+(side>0)]+layer*1.9,t,still,amp:3+contraction,sway:trail*.5+side*(3+castK*5),lift:contraction,curl:side*.25,width:10-layer*3,alpha:.64,fill:layer?pal.gonad:pal.arm,edge:pal.ink,edgeWidth:.55,core:pal.rim});
  for(let i=0;i<7;i+=2)tent(i,false);
  const bell=drawJellyBell(ctx,{x:0,y:rimY,w:bellW,h:bellH,pal,t,c:contraction,still,ink:pal.ink,spots:g.spots,alpha:.88,glow:0,flash:0});
  for(let i=1;i<7;i+=2)tent(i,true);

  // Facetas de cristal líquido superpuestas sobre la campana (hexagonales)
  ctx.save();ctx.globalAlpha=.28;
  for(let row=0;row<3;row++){
   for(let col=-1;col<=1;col++){
    const fx=col*18,fy=bell.top+8+row*14;
    ctx.beginPath();
    for(let v=0;v<6;v++){const a=v*TAU/6-Math.PI/6;ctx.lineTo(fx+Math.cos(a)*9,fy+Math.sin(a)*9);}
    ctx.closePath();ctx.fillStyle=row%2?pal.glow:pal.rim;ctx.fill();
    ctx.strokeStyle=pal.ink;ctx.lineWidth=.6;ctx.stroke();
   }
  }
  ctx.restore();

  // Reflejos iridiscentes en la campana (destellos angulares)
  for(let k=0;k<4;k++){
   const rx=-14+k*10,ry=bell.top+6+k*8;
   line('#ffffff',1.1,()=>{ctx.moveTo(rx,ry);ctx.lineTo(rx+5,ry-3);ctx.lineTo(rx+10,ry);});
  }

  // Corona de prismas flotantes orbitando sobre la campana (5 rombos de cristal)
  for(let k=0;k<5;k++){
   const orbitAngle=k*TAU/5+(still?0:t*0.025);
   const px=Math.cos(orbitAngle)*22,py=bell.top-8+Math.sin(orbitAngle)*6;
   const prismCol=['#c8f0ff','#ffd6f8','#ffe8a0','#d4f0d0','#e8d0ff'][k];
   shape(prismCol,()=>{ctx.moveTo(px,py-5);ctx.lineTo(px+3.5,py);ctx.lineTo(px,py+5);ctx.lineTo(px-3.5,py);},.7,pal.ink);
  }

  // Gónadas internas como prismas triangulares (visibles a través de la campana)
  ctx.save();ctx.globalAlpha=.5;
  for(const side of[-1,1]){
   const gx=side*14,gy=-78;
   shape(pal.gonad,()=>{ctx.moveTo(gx,gy-5);ctx.lineTo(gx+side*6,gy+3);ctx.lineTo(gx-side*2,gy+4);},.5,pal.ink);
  }
  ctx.restore();

  // Ojos directamente sobre la campana (sin cabeza de gato)
  eye(-13,-84,7.2);eye(13,-84,7.2);
  // Boca sutil
  shape(pal.gonad,()=>{ctx.moveTo(-3,-71);ctx.quadraticCurveTo(0,-74,3,-71);ctx.quadraticCurveTo(2,-68,0,-68);ctx.quadraticCurveTo(-2,-68,-3,-71);},.6,pal.ink);

  // Facetas laterales de espejo que emiten destellos
  for(const side of[-1,1]){
   shape(pal.rim+'aa',()=>{ctx.moveTo(side*28,-80);ctx.lineTo(side*35,-76);ctx.lineTo(side*33,-70);ctx.lineTo(side*26,-74);},.5,pal.ink);
   if(!still){const flash=Math.max(0,Math.min(1,Math.sin(t*.09+side*2)*.4+.3));ctx.save();ctx.globalAlpha=flash;oval(side*31,-75,2,2,'#ffffff');ctx.restore();}
  }

  if(castK>0)spellAccents(31,-74);
  ctx.restore();return;
 }
 if(f===4){ // LEVIATÁN DE LAS MAREAS · Medusa colosal con constelaciones internas, tentáculos fractales ramificados, ojo cíclope cósmico y medusitas satélite.
  const bodyY=run?-Math.abs(step)*2.5:0;
  ctx.save();ctx.scale(.96,.96);ctx.translate(atkK*2,hurt?3:bodyY);
  const Lcast=state==='cast'&&power===2;

  // 9 tentáculos fractales que se ramifican
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
   const tip=points[11],near=points[9];line(i%2?'#bba2c7':'#d4b3c3',.65,()=>{ctx.moveTo(near[0],near[1]+2);ctx.quadraticCurveTo(tip[0],tip[1]+3,end[0]-side*3,end[1]+1);});
   if(!still&&castK>.2)sparkle(end[0],end[1],1.8,'#f8e2af');

   // Ramificaciones fractales (cada tentáculo se bifurca 1-2 veces)
   const mid=points[8];
   for(let b=0;b<(i%2?1:2);b++){
    const brAngle=(b===0?-1:1)*side*.45+lag*.03;
    const brLen=14+b*5;
    const bx=mid[0]+Math.cos(brAngle+Math.PI*.5)*brLen,by=mid[1]+Math.sin(brAngle+Math.PI*.5)*brLen;
    line(i%2?'#dfd0e8':'#f0e4d6',2.2,()=>{ctx.moveTo(mid[0],mid[1]);ctx.quadraticCurveTo(mid[0]+side*3,mid[1]+brLen*.4,bx,by);});
    oval(bx,by,1.8,1.8,pal.bead);
   }
  }

  // Campana colosal multicapa (3 capas concéntricas translúcidas)
  const bellY=-38;
  // Capa exterior (más transparente)
  ctx.save();ctx.globalAlpha=.35;
  shape('#efe0f4',()=>{ctx.moveTo(-42,bellY+6);ctx.bezierCurveTo(-48,-60,-18,-72,2,-70);ctx.bezierCurveTo(24,-72,48,-56,42,bellY+6);ctx.quadraticCurveTo(0,bellY+16,-42,bellY+6);},1.2);
  ctx.restore();
  // Capa media
  ctx.save();ctx.globalAlpha=.55;
  shape('#f5eafa',()=>{ctx.moveTo(-35,bellY+2);ctx.bezierCurveTo(-40,-54,-14,-64,2,-63);ctx.bezierCurveTo(20,-64,40,-52,35,bellY+2);ctx.quadraticCurveTo(0,bellY+10,-35,bellY+2);},1.1);
  ctx.restore();
  // Capa interior (más opaca)
  shape('#fff0dd',()=>{ctx.moveTo(-28,bellY);ctx.bezierCurveTo(-34,-50,-12,-58,4,-56);ctx.bezierCurveTo(20,-58,34,-46,28,bellY);ctx.quadraticCurveTo(0,bellY+8,-28,bellY);},1.55);

  // Constelaciones vivas dentro de la campana (puntos de luz conectados)
  ctx.save();ctx.globalAlpha=.65;
  const stars=[[-14,-58],[6,-62],[18,-54],[-8,-48],[12,-46],[-18,-42],[0,-52],[22,-48],[-4,-40],[8,-55]];
  const links=[[0,1],[1,2],[0,3],[3,5],[1,4],[4,7],[6,0],[6,1],[6,4],[3,8],[8,5],[9,2],[9,6]];
  // Líneas de constelación
  ctx.strokeStyle='rgba(255,248,230,0.55)';ctx.lineWidth=.65;
  for(const [a,b] of links){
   const sa=stars[a],sb=stars[b];
   ctx.beginPath();ctx.moveTo(sa[0],sa[1]);ctx.lineTo(sb[0],sb[1]);ctx.stroke();
  }
  // Estrellas
  for(let k=0;k<stars.length;k++){
   const [sx,sy]=stars[k];
   const brightness=.6+Math.sin((still?0:t*.03)+k*1.3)*.35;
   ctx.globalAlpha=brightness;
   oval(sx,sy,1.4,1.4,k%3===0?'#ffe8a0':k%3===1?'#d8f0ff':'#ffcbe8');
  }
  ctx.restore();

  // Sombra inferior de la campana
  shape('#d8c4d4',()=>{ctx.moveTo(-28,bellY-2);ctx.quadraticCurveTo(-10,bellY+6,10,bellY);ctx.quadraticCurveTo(20,bellY-3,28,bellY-4);ctx.quadraticCurveTo(25,bellY+4,10,bellY+6);ctx.quadraticCurveTo(-18,bellY+8,-28,bellY-2);},0);

  // Reflejo especular
  shape('#fff9ef',()=>{ctx.moveTo(-22,-50);ctx.bezierCurveTo(-16,-56,-2,-58,8,-52);ctx.quadraticCurveTo(-6,-54,-18,-46);},0);

  // Ojos abisales gemelos del Leviatán (dos ojos grandes, ligeramente asimétricos)
  const eyeY=-48;
  const eyeOpts={
   closed:dead||hurt||r.mood==='closed',
   happy:r.mood==='happy',blink:finite(r.motion?.blink),
   mood:atkK>.3?'angry':'normal',
   look:{x:Math.max(-1,Math.min(1,finite(pose.look?.x)+finite(r.motion?.lookX)*.3)),y:finite(pose.look?.y)}
  };
  ctx.save();
  // Auras de ambos ojos
  ctx.globalAlpha=.2;oval(-10,eyeY,13,11,'#d8f0ff');oval(10,eyeY,13,11,'#d8f0ff');
  ctx.globalAlpha=1;
  // Ojo izquierdo (principal)
  drawMichiEye(ctx,-10,eyeY,11,eyeOpts);
  // Ojo derecho (ligeramente más pequeño — asimetría abisal)
  drawMichiEye(ctx,10,eyeY,10,eyeOpts);
  ctx.restore();

  // 4 velos orales abisales colgando de la subumbrela
  for(let v=0;v<4;v++){
   const vx=(v-1.5)*12,vy=bellY+4;
   const vWave=still?0:wave(v*1.7,.06)*4;
   line(v%2?'#e8d4ec':'#f0e2d6',2.5,()=>{ctx.moveTo(vx,vy);ctx.bezierCurveTo(vx-3,vy+12+vWave,vx+2,vy+18+vWave,vx-1,vy+24+vWave);});
  }

  // Medusitas satélite orbitando la corona (5 mini medusas)
  for(let k=0;k<5;k++){
   const orbitA=k*TAU/5+(still?0:t*.018);
   const ox=Math.cos(orbitA)*32,oy=-62+Math.sin(orbitA)*8;
   ctx.save();ctx.translate(ox,oy);ctx.scale(.3,.3);
   // Mini campana
   shape('#f5eafa',()=>{ctx.moveTo(-8,0);ctx.bezierCurveTo(-10,-8,-4,-14,0,-14);ctx.bezierCurveTo(4,-14,10,-8,8,0);ctx.quadraticCurveTo(0,3,-8,0);},1);
   // Mini tentáculos
   for(let j=-1;j<=1;j++)line('#d8c4d4',1.2,()=>{ctx.moveTo(j*4,1);ctx.lineTo(j*5,10);});
   // Mini ojo
   oval(0,-6,2.5,2.5,'#ffe8a0');oval(0,-6,1.2,1.2,'#51425f');
   ctx.restore();
  }

  // Brazo líder para ataque/cast
  let leadTip=[30,-38];
  if(atkK>0)leadTip=[30+atkK*23,-31-atkK*7];
  if(castK>0){if(power===1)leadTip=[22,-24];else if(power===3)leadTip=[31+castK*10,-23-castK*8];else if(power===4)leadTip=[34,-60-castK*8];else if(power===5)leadTip=[31,-48];else leadTip=[30,-38-castK*(power===2?19:6)];}
  if(hurt)leadTip=[21,-32];if(state==='wall')leadTip=[39,-68];if(victory)leadTip=[28,-27];
  spellAccents(leadTip[0],leadTip[1]);
  ctx.restore();return;
 }
}

// Public action vocabulary is also consumed by welcome/cinema validation.
export const MICHICORNIO_ACTIONS=Object.freeze(['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory']);

function draw(ctx, pose, R) {
  const src = pose || {},finite=(v,d=0)=>Number.isFinite(v)?v:d;
  const safe={...src,look:{x:finite(src.look?.x,1),y:finite(src.look?.y)}};
  for(const key of ['t','phase','speed','atk','cast','flourish','flourishN','hurt','bounce','land','turnPulse','brake','bodyTilt','michiSeed'])safe[key]=finite(src[key]);
  if(safe.reduceMotion){safe.t=0;safe.phase=0;safe.atk=safe.state==='attack'?.5:0;safe.cast=safe.state==='cast'?.5:0;safe.land=0;safe.bounce=0;safe.bodyTilt=0;safe.flourish=0;safe.hurt=.5;}
  const f = Math.max(0, Math.min(4, Math.round(finite(Number(safe.form)))));
  if(f===0){
    drawMoonKitten(ctx,safe);return;
  }
  if(f===3){ // MOON HARE
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
  ctx.translate(0, r.bob + (safe.bounce || 0) * 2);
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
  ctx.restore();
}

export default { id: "cat", draw };
