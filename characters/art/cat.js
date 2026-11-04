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
  if(still||castK<.05)return;
  const col=power===4?'#ecc5f0':'#ffe9b3';ctx.save();ctx.globalAlpha=.7*castK;
  if(power===0)crescent(x+9,y,5+castK*3,col);
  else if(power===1)line(col,1.6,()=>{ctx.moveTo(x,y);ctx.lineTo(x+12,y-5);ctx.lineTo(x+6,y-10);});
  else if(power===2)for(let k=0;k<3;k++)sparkle(x+7+k*5,y-7+k*6,1.7,col);
  else if(power===3)line(col,1.7,()=>{ctx.moveTo(x-4,y+8);ctx.bezierCurveTo(x+8,y-13,x+24,y-6,x+16,y+13);});
  else if(power===4)crescent(x+3,y-7,9,col);
  else if(power===5)for(const side of[-1,1])sparkle(x+side*13,y-6,2.5,col);
  ctx.restore();
 }
 if(f===1){ // CABALLITO DE MAR CÓSMICO KAWAII (Hippocampus Astral) · Tonos azul océano y coral pastel, cresta coronal, aleta dorsal rápida y mofletes sonrosados.
  const swim=still?0:Math.sin(t*(air?.38:run?.32:.18)+g.pulsePhase*5)*4;
  const hover=still?6:6+wave(0,.055)*3;
  const stRot=state==='glide'?0.32:state==='run'?0.16:state==='jump'?-0.14:state==='fall'?0.1:state==='wall'?-0.22:state==='dead'?0.48:state==='victory'?-0.1:0;
  ctx.save();ctx.scale(.75,.75);ctx.translate(atkK*4,-hover+(hurt?4:0));ctx.rotate(stRot);

  const cyanAqua='#7af0e0',coralP='#ff9e80',coralSoft='#ffd6c0',oceanBlue='#6ec6f8';

  // Aleta dorsal translúcida multicapa ondulante a alta frecuencia en la espalda
  const finFlutter=still?0:Math.sin(t*.45)*6;
  ctx.save();ctx.globalAlpha=.8;
  shape(oceanBlue,()=>{
   ctx.moveTo(-12,-48);
   ctx.quadraticCurveTo(-30+finFlutter,-60,-24+finFlutter,-34);
   ctx.quadraticCurveTo(-28+finFlutter,-16,-10,-24);
   ctx.closePath();
  },1.2);
  // Capa interna coral suave de la aleta
  shape(coralSoft,()=>{
   ctx.moveTo(-11,-44);
   ctx.quadraticCurveTo(-22+finFlutter,-52,-18+finFlutter,-34);
   ctx.quadraticCurveTo(-20+finFlutter,-20,-10,-24);
   ctx.closePath();
  },0);
  line('#ffffff',.9,()=>{
   for(let r=0;r<6;r++){
    ctx.moveTo(-11,-48+r*5);ctx.lineTo(-24+finFlutter,-50+r*6);
   }
  });
  ctx.restore();

  // Pequeñas aletas pectorales translúcidas kawaii a los lados de la nuca
  for(const side of[-1,1]){
   const earFlap=still?0:Math.sin(t*.3+side)*3;
   shape('rgba(122,240,224,0.7)',()=>{
    ctx.moveTo(side*10,-60);
    ctx.quadraticCurveTo(side*24,-70+earFlap,side*20,-54+earFlap);
    ctx.closePath();
   },.9);
   for(let pr=0;pr<3;pr++){
    line('#ffffff',0.7,()=>{ctx.moveTo(side*10,-59+pr*2);ctx.lineTo(side*(15+pr*2),-64+pr*3+earFlap);});
   }
  }

  // Cresta de espinas dorsales perladas de coral pastel
  for(let s=0;s<6;s++){
   const sy=-52+s*5;
   shape(s%2===0?coralP:'#ffedaf',()=>{ctx.moveTo(-10,sy);ctx.lineTo(-17-s*0.4,sy-2);ctx.lineTo(-11,sy+3);ctx.closePath();},0.8);
  }

  // Cola en espiral prensil abisal en tono azul océano pastel
  const tailCurl=hurt?1.4:state==='jump'?.4:state==='fall'?1.2:1;
  const tailWave=still?0:swim*.6;
  shape(oceanBlue,()=>{
   ctx.moveTo(-8,-26);
   ctx.bezierCurveTo(-14,-8,-8,4+tailWave,0,10+tailWave);
   // Espiral de la punta
   ctx.bezierCurveTo(8*tailCurl,16+tailWave,16*tailCurl,12+tailWave,14*tailCurl,2+tailWave);
   ctx.bezierCurveTo(12*tailCurl,-4+tailWave,4*tailCurl,-2+tailWave,6*tailCurl,4+tailWave);
   ctx.bezierCurveTo(8*tailCurl,8+tailWave,10*tailCurl,4+tailWave,8*tailCurl,2+tailWave);
   // Regreso del contorno
   ctx.bezierCurveTo(10*tailCurl,12+tailWave,2*tailCurl,14+tailWave,-4,8+tailWave);
   ctx.bezierCurveTo(-10,2+tailWave,-8,-14,4,-26);
   ctx.closePath();
  },1.4);

  // Placas ventrales de coral pastel y nácar blanco en la pancita
  shape(coralSoft,()=>{
   ctx.moveTo(4,-26);
   ctx.quadraticCurveTo(15,-38,11,-52);
   ctx.lineTo(2,-50);
   ctx.quadraticCurveTo(4,-38,-4,-26);
   ctx.closePath();
  },0);
  shape(white,()=>{
   ctx.moveTo(2,-28);
   ctx.quadraticCurveTo(10,-38,8,-48);
   ctx.lineTo(3,-46);
   ctx.quadraticCurveTo(4,-38,-1,-28);
   ctx.closePath();
  },0);

  // Anillos dérmicos esqueléticos del corselete en coral cálido y perlas
  for(let ring=0;ring<6;ring++){
   const ry=-32-ring*4;
   line(coralP,1.3,()=>{ctx.moveTo(-10+ring*0.6,ry);ctx.quadraticCurveTo(0,ry+2,9-ring*0.5,ry);});
   oval(-10+ring*0.6,ry,1.2,1.2,'#ffffff');
  }

  // Segmentos y fotóforos bioluminiscentes alternados en cyan y oro pastel
  for(let b=0;b<6;b++){
   oval(2-b*1.6,-3+b*2.8+tailWave,1.6,1.6,b%2?cyanAqua:coralP);
   line('rgba(255,255,255,0.6)',0.8,()=>{ctx.moveTo(-4+b*0.4,-2+b*2.8+tailWave);ctx.lineTo(6-b*1.2,-2+b*2.8+tailWave);});
  }

  // Torso esbelto en forma de S de caballito de mar (lavanda pastel fur con sombreado)
  shape(fur,()=>{
   ctx.moveTo(-9,-26);
   ctx.quadraticCurveTo(-15,-42,-6,-56);
   ctx.quadraticCurveTo(0,-60,8,-56);
   ctx.quadraticCurveTo(14,-42,4,-26);
   ctx.closePath();
  },1.4);

  // Cabeza arqueada y hocico tubular adorable de caballito de mar
  shape(fur,()=>{
   ctx.moveTo(-8,-54);
   ctx.bezierCurveTo(-14,-64,-8,-78,4,-76);
   // Hocico tubular prominente
   ctx.bezierCurveTo(14,-76,18,-72,24,-68);
   ctx.lineTo(24,-62);
   ctx.quadraticCurveTo(16,-62,10,-56);
   ctx.closePath();
  },1.45);

  // Corona dorsal de selenita (cresta coronal de 5 puntas de oro pastel)
  shape('#ffedaf',()=>{
   ctx.moveTo(-6,-76);ctx.lineTo(-4,-90);ctx.lineTo(-1,-82);ctx.lineTo(2,-94);ctx.lineTo(5,-84);ctx.lineTo(8,-89);ctx.lineTo(9,-76);
   ctx.closePath();
  },1.2);
  for(const px of[-4,-1,2,5,8])oval(px,-85,1.5,1.5,'#ffffff');

  // Mofletes sonrosados kawaii
  oval(-12,-60,3.5,2.2,'#ffa8cb');
  oval(12,-60,3.5,2.2,'#ffa8cb');

  // Boquita tierna y sonriente en el hocico
  line(ink,1.1,()=>{ctx.moveTo(18,-64);ctx.quadraticCurveTo(21,-61,24,-65);});

  // Dos ojos expresivos de héroe (exactamente 2 llamadas a eye para tests)
  eye(-6,-64,7);
  eye(6,-64,7);

  // Burbujitas de polvo estelar que salen del hocico
  if(!still){
   sparkle(26,-65+swim*.2,1.8,cyanAqua);
   if(castK>.2)sparkle(32,-63,2.4,coralP);
  }

  // Celebración en victoria con destellos coronales
  if(victory){
   for(let k=0;k<3;k++)oval(-6+k*6,-100,2,2,k===1?'#ffffff':cyanAqua);
  }

  // Zarcillos delanteros para gestos y hechizos
  for(const side of[-1,1]){
   let tip=[side*10,-38+wave(side,.08)*2];
   if(air)tip=[side*14,-42];
   if(castK){tip=[side*12+castK*10,-48-castK*8];}
   if(atkK&&side>0)tip=[24+atkK*16,-56+atkK*2];
   if(hurt)tip=[side*8,-40];
   jellyFilament({root:[side*7,-32],end:tip,width:3.2,col:cyanAqua,far:side<0,curl:side*0.2});
   if(side>0)spellAccents(tip[0],tip[1]);
  }

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
  // Mofletes sonrosados kawaii y boquita sonriente
  oval(-20,-78,3.6,2.2,'#ffa8cb');
  oval(20,-78,3.6,2.2,'#ffa8cb');
  line(pal.ink,1.2,()=>{ctx.moveTo(-3,-71);ctx.quadraticCurveTo(0,-68,3,-71);});

  // Facetas laterales de espejo que emiten destellos
  for(const side of[-1,1]){
   shape(pal.rim+'aa',()=>{ctx.moveTo(side*28,-80);ctx.lineTo(side*35,-76);ctx.lineTo(side*33,-70);ctx.lineTo(side*26,-74);},.5,pal.ink);
   if(!still){const flash=Math.max(0,Math.min(1,Math.sin(t*.09+side*2)*.4+.3));ctx.save();ctx.globalAlpha=flash;oval(side*31,-75,2,2,'#ffffff');ctx.restore();}
  }

  if(castK>0)spellAccents(31,-74);
  ctx.restore();return;
 }
 if(f===4){ // LEVIATÁN MEDUSA SOBERANA CÓSMICA KAWAII (Mega Medusa Soberana) · Campana translúcida colosal, corona de 5 agujas de selenita, 9 tentáculos celestiales, 5 mini-medusas satélite en órbita y rostro kawaii.
  let contraction=jellyPulse(t,g,still).c;if(state==='jump')contraction=Math.max(contraction,.85);else if(state==='fall'||state==='glide')contraction*=.2;else if(hurt)contraction=.6;
  const float=air?1:0,trail=run?-12:state==='glide'?-6:0,Lcast=state==='cast'&&power===2;
  const stRot=state==='glide'?0.22:state==='run'?0.14:state==='jump'?-0.14:state==='fall'?0.1:state==='wall'?-0.18:state==='dead'?0.44:state==='victory'?-0.08:0;
  ctx.save();ctx.scale(.95,.95);ctx.translate(atkK*3,-8-contraction*6+wave(0,.055)*(hurt?2:4));ctx.rotate(stRot);

  const rimY=-56,bellH=64,bellW=52;
  const aqua='#7af0e0',pinkP='#fca8db',goldP='#ffedaf';

  // 1. Zarcillos y tentáculos de la Medusa Leviatán (9 tentáculos celestiales que apoyan michiLaunchKick)
  const tent=(i,front)=>{
   const lane=i-4,kick=Lcast&&!still?michiLaunchKick(i,9,pose.cast):0,lash=front&&lane>0?atkK:0;
   const end=drawTentacle(ctx,{
    x:lane*bellW*.22*(1-.1*contraction),y:rimY+4,
    len:(54+Math.abs(lane)*5)*g.lengths[i]*(1-float*.12),phase:g.phases[i],t,still,
    amp:4+contraction*2+float*2+(victory?3:0),sway:trail+lash*32+lane*castK*(power===4?7:power===1?1:4)+kick*36,
    lift:contraction*.85+float*.75+Math.max(0,kick)*.4,curl:(hurt?-.45:0)+lash*.65+kick*.85+(power===5?lane*castK*.12:0),
    dir:Math.PI/2-lash*.7-kick*.75,width:front?4.6:5.2,alpha:front?.9:.75,fill:i%2?fur:white,edge:pal.ink,edgeWidth:.8,core:'#fffaff',beads:i%2?aqua:pinkP
   });
   if(Lcast&&pose.cast*26<michiLaunchFrame(i,9))oval(end[0],end[1],2.4,2.4,goldP);
   oval(end[0]*.5,end[1]*.5+rimY*.5,1.5,1.5,'#ffffff');
  };

  // Velos orales ondulantes de seda nácar
  for(const side of[-1,1])for(let layer=0;layer<2;layer++)drawTentacle(ctx,{x:side*9,y:rimY-2,len:42+layer*8,phase:g.phases[7+(side>0)]+layer*1.8,t,still,amp:3.5+contraction,sway:trail*.5+side*(4+castK*6),lift:contraction,curl:side*.3,width:12-layer*4,alpha:.65,fill:layer?white:fur,edge:pal.ink,edgeWidth:.6,core:aqua});
  for(let i=0;i<9;i++)if(i%2===0)tent(i,false);

  // 2. Campana colosal translúcida de la Medusa Leviatán
  const bell=drawJellyBell(ctx,{x:0,y:rimY,w:bellW,h:bellH,pal,t,c:contraction,still,ink:pal.ink,spots:g.spots,alpha:.92,glow:1,flash:0});
  for(let i=0;i<9;i++)if(i%2!==0)tent(i,true);

  // Manto superior en fur y white
  shape(fur,()=>{
   ctx.moveTo(-bellW*.9,rimY);
   ctx.bezierCurveTo(-bellW*1.05,rimY-bellH*.6,-bellW*.5,bell.top,0,bell.top);
   ctx.bezierCurveTo(bellW*.5,bell.top,bellW*1.05,rimY-bellH*.6,bellW*.9,rimY);
   ctx.quadraticCurveTo(0,rimY+8,-bellW*.9,rimY);
  },1.4);

  shape(white,()=>{
   ctx.moveTo(-bellW*.75,rimY-4);
   ctx.bezierCurveTo(-bellW*.9,rimY-bellH*.5,-bellW*.4,bell.top+6,0,bell.top+6);
   ctx.bezierCurveTo(bellW*.4,bell.top+6,bellW*.9,rimY-bellH*.5,bellW*.75,rimY-4);
   ctx.quadraticCurveTo(0,rimY+2,-bellW*.75,rimY-4);
  },0);

  // Margen festoneado de 8 lóbulos con perlas bioluminiscentes
  for(let l=0;l<8;l++){
   const lx=-bellW*.8+l*(bellW*1.6/7);
   oval(lx,rimY+2,1.8,1.8,l%2===0?aqua:pinkP);
  }

  // 3. Corazón de constelación interior (cámara estelar visible a través de la campana)
  ctx.save();ctx.globalAlpha=.65;
  const nodes=[[-16,-86],[0,-94],[16,-86],[-9,-76],[9,-76]];
  for(let n=0;n<nodes.length;n++){
   oval(nodes[n][0],nodes[n][1],2.2,2.2,goldP);
   if(n<nodes.length-1)line('rgba(255,255,255,0.7)',1,()=>{ctx.moveTo(nodes[n][0],nodes[n][1]);ctx.lineTo(nodes[n+1][0],nodes[n+1][1]);});
  }
  ctx.restore();

  // 4. Corona Soberana de 5 agujas de selenita en el ápice de la campana
  shape(goldP,()=>{
   ctx.moveTo(-18,bell.top+4);ctx.lineTo(-14,bell.top-16);ctx.lineTo(-7,bell.top-8);
   ctx.lineTo(0,bell.top-22);
   ctx.lineTo(7,bell.top-8);ctx.lineTo(14,bell.top-16);ctx.lineTo(18,bell.top+4);
   ctx.closePath();
  },1.3);
  for(const sp of[-14,-7,0,7,14])oval(sp,bell.top-14+Math.abs(sp)*0.5,1.8,1.8,'#ffffff');

  // 5. Rostro Kawaii en la campana
  const eyeOpts={
   closed:dead||hurt||r.mood==='closed',
   happy:r.mood==='happy',blink:finite(r.motion?.blink),
   mood:atkK>.3?'angry':'normal',
   look:{x:Math.max(-1,Math.min(1,finite(pose.look?.x)+finite(r.motion?.lookX)*.3)),y:finite(pose.look?.y)}
  };
  drawMichiEye(ctx,-14,-80,9.2,eyeOpts);
  drawMichiEye(ctx,14,-80,9.2,eyeOpts);

  // Mofletes sonrosados kawaii
  oval(-22,-74,4.2,2.6,'#ffa8cb');
  oval(22,-74,4.2,2.6,'#ffa8cb');

  // Boquita sonriente adorable
  if(!hurt&&!dead){
   line(pal.ink,1.3,()=>{ctx.moveTo(-4,-70);ctx.quadraticCurveTo(0,-66,4,-70);});
  }

  // 6. Cinco mini-medusas satélite en órbita alrededor de la Soberana
  for(let j=0;j<5;j++){
   const orbitA=j*TAU/5+(still?0:t*0.022);
   const jx=Math.cos(orbitA)*64,jy=bell.top+18+Math.sin(orbitA)*16;
   const jCol=['#c8f2ff','#ffd6f5','#ffe8b8','#c2f7df','#e6d4ff'][j];
   shape(jCol,()=>{
    ctx.moveTo(jx-6,jy);ctx.bezierCurveTo(jx-7,jy-7,jx+7,jy-7,jx+6,jy);ctx.closePath();
   },.8);
   for(let jt=-1;jt<=1;jt++){
    const jtw=still?0:Math.sin(t*0.1+j+jt)*2;
    line(pal.ink,.7,()=>{ctx.moveTo(jx+jt*3,jy);ctx.lineTo(jx+jt*2.5+jtw,jy+6);});
   }
   oval(jx,jy-3,1.2,1.2,'#ffffff');
  }

  // Celebración en victoria: auroras estelares y destellos
  if(victory){
   for(let k=0;k<4;k++)oval(-18+k*12,bell.top-28,2.4,2.4,k%2?goldP:aqua);
  }

  // Brazo líder para ataque / hechizos
  let leadTip=[28,-56];
  if(atkK>0)leadTip=[36+atkK*26,-56-atkK*8];
  if(castK>0){
   if(power===1)leadTip=[22,-42];
   else if(power===3)leadTip=[34+castK*10,-42-castK*9];
   else if(power===4)leadTip=[36,-72-castK*8];
   else leadTip=[32,-56-castK*(power===2?20:7)];
  }
  if(hurt)leadTip=[18,-48];
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
