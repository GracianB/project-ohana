// PROJECT OHANA V48 · SUPREME CINEMA REBORN
import {
fullCanvas, reducedMotion, clamp, seg, easeOut, easeInOut, easeBack, lerp,
rgba, tint, makeDummy, drawDummy, baseHeight, drawTitle, drawRing, drawRays,
drawSpark, drawStar, FONT_BODY, FONT_DISPLAY
} from "./evo-cinema.js";
import { ROSTER } from "../characters/roster.js";
import { SUPREME_STORYBOARDS } from "./supreme-storyboards.js";
import { cuernoGrandStage } from "./supreme-storyboards.js";
import { duckMusic } from "../engine/music.js";
import { sfx } from "../engine/audio.js";

const TAU = Math.PI * 2;
let active = null;
let generation = 0;

function mount(){
let el=document.getElementById("supreme-cinema");
if(el) return el;
el=document.createElement("section");
el.id="supreme-cinema";
el.setAttribute("aria-live","polite");
el.setAttribute("aria-hidden","true");
el.innerHTML='<canvas aria-hidden="true"></canvas><p class="sc-sr"></p>';
document.body.appendChild(el);
return el;
}

function heroDef(id){return ROSTER.find(r=>r.id===id)||ROSTER[0];}
function actor(def,evo,color){
const p=makeDummy(def.id,clamp(Number(evo)||0,0,4),color||def.color);
p._poseOverride="idle";
p.vx=0;p.vy=0;p.grounded=true;p.facing=1;
return p;
}

function line(ctx,x1,y1,x2,y2,color,width=2,alpha=1){
ctx.save();
ctx.globalAlpha=alpha;
ctx.strokeStyle=color;
ctx.lineWidth=width;
ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
ctx.restore();
}
function circle(ctx,x,y,r,color,alpha=.4,fill=false){
ctx.save();ctx.globalAlpha=alpha;
if(fill){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
else{ctx.strokeStyle=color;ctx.lineWidth=Math.max(1.5,r*.06);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();}
ctx.restore();
}
function lightning(ctx,x1,y1,x2,y2,color,seed=0,alpha=.8){
const parts=7;
ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.lineJoin="round";
ctx.beginPath();ctx.moveTo(x1,y1);
for(let i=1;i<parts;i++){
  const k=i/parts;
  const wobble=Math.sin(seed*3.1+i*2.7)*13*(1-Math.abs(.5-k));
  ctx.lineTo(lerp(x1,x2,k)+wobble,lerp(y1,y2,k));
}
ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
}
function arcRainbow(ctx,cx,cy,R,alpha=.7,wide=false){
const cols=["#ff7aa8","#ffd36a","#7ee7ff","#9bf49b","#b78bff"];
ctx.save();ctx.lineCap="round";
cols.forEach((col,i)=>{
  ctx.globalAlpha=alpha;
  ctx.strokeStyle=col;
  ctx.lineWidth=wide?8:4;
  ctx.beginPath();
  ctx.arc(cx,cy,R-i*(wide?9:6),Math.PI*1.04,Math.PI*1.96);
  ctx.stroke();
});
ctx.restore();
}

function comicBubble(ctx,text,x,y,alpha,color="#dffcff"){
if(alpha<=.02)return;
ctx.save();
ctx.globalAlpha=alpha;
ctx.font="900 13px Outfit,system-ui,sans-serif";
ctx.textAlign="center";ctx.textBaseline="middle";
const w=Math.max(48,ctx.measureText(text).width+22),h=30,r=10;
ctx.fillStyle="rgba(255,255,248,.96)";
ctx.strokeStyle=color;ctx.lineWidth=2;
ctx.beginPath();ctx.roundRect(x-w/2,y-h/2,w,h,r);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(x-7,y+h/2-1);ctx.lineTo(x+2,y+h/2-1);ctx.lineTo(x-2,y+h/2+10);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#13202a";ctx.fillText(text,x,y+1);
ctx.restore();
}

function potato(ctx,x,y,r,rot,alpha=1){
ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=alpha;
ctx.fillStyle="#d7a95e";ctx.strokeStyle="#f2d18f";ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(0,0,r*1.18,r*.82,.18,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="rgba(92,55,22,.35)";
for(const [px,py] of [[-.35,-.1],[.2,.22],[.38,-.24]]){ctx.beginPath();ctx.arc(px*r,py*r,r*.08,0,Math.PI*2);ctx.fill();}
ctx.restore();
}
function oven(ctx,cx,cy,w,h,open,alpha,color){
ctx.save();ctx.globalAlpha=alpha;
ctx.fillStyle="rgba(29,14,8,.92)";ctx.strokeStyle=color;ctx.lineWidth=3;
ctx.beginPath();ctx.roundRect(cx-w/2,cy-h/2,w,h,14);ctx.fill();ctx.stroke();
const doorY=cy+h*.16;
ctx.save();ctx.translate(cx,doorY);ctx.scale(1,open?Math.max(.10,1-open*.84):1);
ctx.fillStyle="rgba(4,5,8,.9)";ctx.strokeStyle="#ffd36a";ctx.lineWidth=2;
ctx.fillRect(-w*.38,-h*.16,w*.76,h*.30);ctx.strokeRect(-w*.38,-h*.16,w*.76,h*.30);
ctx.restore();
ctx.fillStyle="rgba(255,210,90,.8)";
ctx.fillRect(cx-w*.22,cy-h*.34,w*.44,4);
ctx.restore();
}
function zipper(ctx,cx,cy,R,k,color){
ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha=.75;
const gap=R*.26*easeOut(k);
ctx.beginPath();
ctx.moveTo(cx,cy-R*.75);
ctx.bezierCurveTo(cx-gap,cy-R*.3,cx-gap,cy+R*.25,cx,cy+R*.72);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(cx,cy-R*.75);
ctx.bezierCurveTo(cx+gap,cy-R*.3,cx+gap,cy+R*.25,cx,cy+R*.72);
ctx.stroke();
for(let i=-5;i<=5;i++){
  const yy=cy+i*R*.12;
  const widen=Math.sin((i+5)/10*Math.PI)*gap;
  line(ctx,cx-widen-8,yy,cx-widen+3,yy,color,2,.72);
  line(ctx,cx+widen-3,yy,cx+widen+8,yy,color,2,.72);
}
ctx.restore();
}
function quake(ctx,cx,cy,R,k,color,strong=false){
const spread=easeOut(k);
ctx.save();ctx.globalAlpha=.35+.45*spread;ctx.strokeStyle=color;ctx.lineWidth=strong?4:2;
for(let i=0;i<(strong?4:2);i++){
  const y=cy+i*8;
  ctx.beginPath();
  ctx.moveTo(cx-R*spread,y);
  for(let j=1;j<=8;j++){
    const x=lerp(cx-R*spread,cx+R*spread,j/8);
    const amp=(j%2?1:-1)*(strong?10:4)*(1-j/10);
    ctx.lineTo(x,y+amp);
  }
  ctx.stroke();
}
ctx.restore();
}
function voidEye(ctx,cx,cy,R,k,color){
const open=easeInOut(k);
ctx.save();ctx.globalAlpha=.82*open;
ctx.fillStyle="rgba(0,0,0,.92)";ctx.strokeStyle=color;ctx.lineWidth=3;
ctx.beginPath();ctx.ellipse(cx,cy,R*.72,R*.23*open,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(cx,cy,R*.10,R*.18*open,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(cx+R*.025,cy-R*.035,R*.022,0,Math.PI*2);ctx.fill();
ctx.restore();
}

function backdrop(ctx,W,H,cx,cy,color,story,k){
const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.hypot(W,H)*.62);
const hot=story.scene==="nova"||story.scene==="oven"||story.scene==="crisp";
bg.addColorStop(0,rgba(color,hot ? .26 : .20));
bg.addColorStop(.36,hot?"rgba(24,8,5,.90)":"rgba(5,10,20,.90)");
bg.addColorStop(1,"rgba(1,3,8,.985)");
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

ctx.save();ctx.globalAlpha=.10;ctx.strokeStyle=rgba(color,.34);ctx.lineWidth=1;
for(let y=0;y<H;y+=18){
  const off=((y*13)%31)-15;
  ctx.beginPath();ctx.moveTo(off,y);ctx.lineTo(W+off,y);ctx.stroke();
}
ctx.restore();

if(story.scene==="aurora"){
  // A moonlit seven-colour curtain behind the actor, never across the face.
  const sky=ctx.createLinearGradient(0,0,W,H);
  sky.addColorStop(0,"rgba(120,112,204,.12)");
  sky.addColorStop(.48,"rgba(149,229,220,.11)");
  sky.addColorStop(1,"rgba(240,179,224,.10)");
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
}
if(story.scene==="eclipse"||story.scene==="maw"){
  const v=ctx.createRadialGradient(cx,cy,Math.min(W,H)*.12,cx,cy,Math.min(W,H)*.62);
  v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.62)");
  ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
}

function storyMotion(id,k,target){
const e=easeInOut;
if(id==="kilo") return {x:Math.sin(k*Math.PI)*target*.018,y:-e(seg(k,.45,.76))*target*.06,scale:1+.05*e(seg(k,.52,.78)),rot:0};
if(id==="stitcho") return {x:lerp(-target*.08,target*.03,e(seg(k,.18,.66))),y:0,scale:1+.03*e(seg(k,.52,.80)),rot:-.025+e(k)*.03};
if(id==="chispin") return {x:Math.sin(k*32)*target*.012*seg(k,.10,.48),y:-Math.sin(seg(k,.24,.55)*Math.PI)*target*.105-e(seg(k,.68,.88))*target*.025,scale:1+.09*e(seg(k,.50,.78)),rot:Math.sin(k*25)*.022*(1-seg(k,.69,.90))};
if(id==="cat") return {x:k>.56?target*.06:Math.sin(k*19)*target*.008*seg(k,.14,.48),y:-Math.sin(seg(k,.36,.61)*Math.PI)*target*.07,scale:1+.055*e(seg(k,.64,.84)),rot:Math.sin(k*13)*.018*(1-seg(k,.7,.9))};
if(id==="dragon") return {x:-Math.sin(seg(k,.26,.53)*Math.PI)*target*.025,y:-Math.sin(seg(k,.32,.84)*Math.PI)*target*.13,scale:1+.065*e(seg(k,.62,.87)),rot:-.035*Math.sin(seg(k,.3,.78)*Math.PI)};
if(id==="dino") return {x:0,y:Math.sin(seg(k,.20,.34)*Math.PI)*target*.035+Math.sin(seg(k,.50,.64)*Math.PI)*target*.06,scale:1+.04*e(seg(k,.52,.76)),rot:0};
if(id==="frita") return {x:Math.sin(seg(k,.23,.58)*Math.PI)*target*.04,y:-Math.sin(seg(k,.28,.61)*Math.PI)*target*.055,scale:1+.055*e(seg(k,.63,.85)),rot:-.04*Math.sin(seg(k,.2,.55)*Math.PI)+.018*Math.sin(seg(k,.62,.86)*Math.PI)};
if(id==="pizza") return {x:-Math.sin(seg(k,.40,.64)*Math.PI)*target*.055,y:-Math.sin(seg(k,.38,.68)*Math.PI)*target*.05,scale:1+.055*e(seg(k,.64,.86)),rot:-.04*Math.sin(seg(k,.38,.62)*Math.PI)};
if(id==="yomi") return {x:0,y:e(seg(k,.48,.72))*target*.025,scale:1.08-.08*e(seg(k,.18,.70)),rot:0};
if(id==="cuerno")return {x:0,y:-Math.sin(Math.PI*seg(k,.17,.90))*target*.055,
  scale:1+.055*Math.sin(Math.PI*seg(k,.18,.90)),rot:-.018*Math.sin(Math.PI*seg(k,.18,.78))};
return {x:lerp(-target*.04,target*.035,e(seg(k,.18,.76))),y:-e(seg(k,.50,.80))*target*.045,scale:1+.05*e(seg(k,.56,.82)),rot:Math.sin(k*Math.PI)*.025};
}

function storyPose(id,k){
if(id==="cat") return k<.58?"idle":k<.78?"attack":"victory";
if(id==="dino") return (k>.18&&k<.36)||(k>.49&&k<.66)?"attack":k>.70?"victory":"idle";
if(id==="dragon") return k<.32?"idle":k<.53?"jump":k<.78?"attack":"victory";
if(id==="frita") return k<.24?"idle":k<.77?"attack":"victory";
if(id==="pizza") return k<.40?"idle":k<.73?"attack":"victory";
if(id==="yomi") return k<.54?"idle":k<.78?"attack":"victory";
if(id==="cuerno")return k<.22?"idle":k<.76?"cast":"victory";
return k<.34?"idle":k<.72?"attack":"victory";
}

function drawStory(ctx,id,k,t,cx,cy,target,color){
ctx.save();
ctx.globalCompositeOperation="lighter";

if(id==="kilo"){
  const moteK=seg(k,.05,.42);
  const mx=lerp(cx-target*.76,cx+target*.03,easeOut(moteK));
  const my=cy-target*.15-Math.sin(moteK*Math.PI*2)*target*.16;
  drawSpark(ctx,mx,my,5+4*Math.sin(moteK*Math.PI),tint(color,.35));
  if(k>.27&&k<.43){circle(ctx,cx,cy-target*.34,target*.10,"#fff",.18+seg(k,.27,.43)*.28,true);}
  const bloom=seg(k,.43,.86);
  for(let i=0;i<8;i++){ctx.save();ctx.translate(cx,cy);ctx.rotate(i*Math.PI/4+t*.12);ctx.globalAlpha=.18+.32*bloom;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-target*(.42+.18*bloom),target*.09,target*.22,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  drawRing(ctx,cx,cy,target*.92,bloom,color,3,.62);
}else if(id==="stitcho"){
  const open=seg(k,.08,.52),close=1-seg(k,.62,.90);
  const seam=Math.min(open,close);
  zipper(ctx,cx,cy,target,seam,color);
  if(k>.30&&k<.68){
    const peek=Math.sin(seg(k,.30,.68)*Math.PI);
    ctx.globalAlpha=.16+.26*peek;
    ctx.fillStyle=rgba(color,.28);ctx.fillRect(cx-target*.20,cy-target*.66,target*.40,target*1.32);
    ctx.fillStyle="rgba(3,4,14,.94)";
    ctx.beginPath();ctx.ellipse(cx+target*.07,cy-target*.10,target*.13,target*.085*peek,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff7d0";
    ctx.beginPath();ctx.ellipse(cx+target*.09,cy-target*.10,target*.026,target*.050*peek,0,0,Math.PI*2);ctx.fill();
    if(k>.39&&k<.57) comicBubble(ctx,"NO.",cx+target*.34,cy-target*.42,Math.sin(seg(k,.39,.57)*Math.PI),color);
  }
  if(k>.54&&k<.72){
    const slam=Math.sin(seg(k,.54,.72)*Math.PI);
    drawRing(ctx,cx,cy,target*(.34+.18*slam),slam,"#fff7d0",2.4,.30);
  }
  if(k>.72) drawRing(ctx,cx,cy,target*.74,seg(k,.72,.96),color,2,.35);
}else if(id==="chispin"){
  const charge=seg(k,.08,.55);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3+t*3;
    const r=target*(.30+.20*charge);
    lightning(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.55,cx+Math.cos(a+.6)*r*.55,cy+Math.sin(a+.6)*r*.30,color,i+t,.32+.28*charge);
  }
  if(k>.34&&k<.49){
    lightning(ctx,cx-target*.12,cy-target*.42,cx+target*.10,cy-target*.15,"#fff",7,.86);
  }
  const crown=seg(k,.19,.56);for(let i=0;i<5;i++){const a=-Math.PI*.88+i*Math.PI*.19;const nx=cx+Math.cos(a)*target*(.24+.15*crown),ny=cy-target*.23+Math.sin(a)*target*(.18+.12*crown);lightning(ctx,nx,ny,nx+Math.cos(a)*target*.09,ny-target*.07,i%2?"#ba75ff":"#fff5ab",i+t,.12+.23*crown);}if(k>.55&&k<.82){const beat=Math.sin(seg(k,.55,.82)*Math.PI);drawRing(ctx,cx,cy,target*.56,beat,"#d59bff",2.1,.34);}
  const blast=seg(k,.52,.88);
  if(blast>0){
    drawRays(ctx,cx,cy,target*1.25,color,.16+.32*blast,t*1.8,16);
    drawRing(ctx,cx,cy,target,blast,color,4,.58);
  }
}else if(id==="cat"){
  const dark=seg(k,.12,.58);
  circle(ctx,cx,cy-target*.08,target*(.18+.34*dark),color,.22+.28*dark,false);
  circle(ctx,cx+target*.12,cy-target*.12,target*(.16+.30*dark),"#020309",.95,true);
  if(k>.48&&k<.70){
    drawSpark(ctx,cx-target*.06,cy-target*.23,4,"#fff");
    drawSpark(ctx,cx+target*.06,cy-target*.23,4,"#fff");
  }
  // Nine lives appear one by one before the lunar vanish.
  const lives=seg(k,.24,.69);
  for(let i=0;i<9;i++){const a=-Math.PI*.86+i*TAU/9;const px=cx+Math.cos(a)*target*.59,py=cy+Math.sin(a)*target*.43;const onset=seg(lives,i/11,(i+2)/11);if(onset>0){circle(ctx,px,py,target*.013+onset*target*.008,i%3===0?"#ffe7ae":"#f8c0ff",.12+.5*onset,false);}}
  // V51: three claw crescents frame the nine lives, then close into eclipse.
  const claws=seg(k,.34,.65);
  if(claws>0){
    for(let i=0;i<3;i++){
      const spread=(i-1)*target*.18;
      const rr=target*(.28+i*.07);
      drawRing(ctx,cx+spread,cy+target*.1,rr,claws,i===1?"#ffe6b0":"#f1bcff",1.4,.16);
    }
  }
  const vanish=Math.sin(seg(k,.52,.75)*Math.PI);
  if(vanish>0) drawRing(ctx,cx,cy,target*.62,vanish,color,2,.40);
}else if(id==="dragon"){
  const sneeze=seg(k,.12,.34);
  if(sneeze>0&&sneeze<1){
    const fx=cx+target*.16,fy=cy-target*.18;
    drawSpark(ctx,fx,fy,4+8*sneeze,"#ffd36a");
    for(let i=0;i<3;i++) circle(ctx,fx+i*8,fy-i*3,5+i*3,"#ff7b35",.22+.16*sneeze,true);
  }
  const ascent=seg(k,.33,.62);
  if(ascent>0){
    for(let i=0;i<3;i++){
      const a=-Math.PI*.72+i*.56;
      const px=cx+Math.cos(a)*target*(.32+i*.10),py=cy+Math.sin(a)*target*(.35+i*.07);
      drawSpark(ctx,px,py,(3+i*2)*ascent,i===1?"#fff5bb":"#ffaf63");
    }
    drawRing(ctx,cx,cy+target*.12,target*(.22+.44*ascent),ascent,"#ffd690",2,.27);
  }
  const chase=seg(k,.28,.57);
  if(chase>0&&chase<1){
    const x=cx+target*(.22+.23*chase),y=cy-target*(.29+.21*Math.sin(Math.PI*chase));
    drawSpark(ctx,x,y,3+4*Math.sin(chase*Math.PI),"#fff1b2");
    drawRing(ctx,x,y,target*.08,Math.sin(chase*Math.PI),"#ffaf62",1.1,.2);
  }
  const crown=seg(k,.59,.79);
  if(crown>0){
    for(let i=0;i<5;i++){
      const a=-Math.PI*.83+i*Math.PI*.165;
      const x=cx+Math.cos(a)*target*.5,y=cy-target*.23+Math.sin(a)*target*.36;
      drawSpark(ctx,x,y,(2.5+(i%2))*crown,i===2?"#fffbe0":"#ffcf7c");
    }
  }
  const nova=seg(k,.63,.92);
  if(nova>0){
    drawRays(ctx,cx,cy,target*1.38,"#ff7b35",.18+.34*nova,-t*.25,12);
    drawRing(ctx,cx,cy,target*1.05,nova,"#ffd36a",5,.72);
    circle(ctx,cx,cy,target*.16*(.5+nova),"#fff",.18+.22*nova,true);
  }
}else if(id==="dino"){
  const first=seg(k,.18,.36),second=seg(k,.50,.70);
  if(first>0) quake(ctx,cx,cy+target*.48,target*.46,first,color,false);
  if(second>0){
    quake(ctx,cx,cy+target*.48,target*1.08,second,color,true);
    drawRing(ctx,cx,cy+target*.42,target*.96,second,color,5,.26);
  }
  if(k>.37&&k<.49){
    ctx.globalAlpha=.55;ctx.fillStyle="#fff";
    ctx.beginPath();ctx.arc(cx+target*.18,cy-target*.28,3,0,Math.PI*2);ctx.fill();
  }
}else if(id==="frita"){
  const chase=seg(k,.06,.49);
  const px=lerp(cx-target*.82,cx+target*.19,easeInOut(chase));
  const py=cy-target*.34-Math.sin(chase*Math.PI)*target*.43;
  const catchK=seg(k,.42,.63);
  const caught=catchK>0;
  const potatoX=caught?lerp(px,cx+target*.22,catchK):px;
  const potatoY=caught?lerp(py,cy-target*.31,catchK):py;
  potato(ctx,potatoX,potatoY,target*.055,t*4,1-seg(k,.66,.76));
  if(caught&&catchK<1) {
    drawSpark(ctx,cx+target*.2,cy-target*.3,target*(.015+.02*catchK),"#fff6cc");
    drawRing(ctx,cx+target*.2,cy-target*.3,target*.15,catchK,"#ff5141",2,.28);
  }
  const swirl=seg(k,.49,.77);
  if(swirl>0){
    for(let i=0;i<5;i++){
      const a=i*TAU/5+t*.2;
      const rx=target*(.24+.32*swirl),ry=target*(.12+.24*swirl);
      const x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry;
      drawSpark(ctx,x,y,(2+i%2)*swirl,i%2?"#fff0a0":"#f75536");
    }
    drawRing(ctx,cx,cy,target*(.22+.4*swirl),swirl,"#ff4e35",2,.2);
  }
  const fry=seg(k,.70,.95);
  if(fry>0){
    for(let i=0;i<7;i++){
      const x=cx+(i-3)*target*.13;
      line(ctx,x,cy-target*.54,x+Math.sin(i)*target*.04,cy+target*.38,i%3===0?"#fff3b2":"#ffd36a",2.2,.13+.24*fry);
    }
    drawRing(ctx,cx,cy,target*.88,fry,color,3,.46);
  }
}else if(id==="pizza"){
  const yawning=seg(k,.08,.34);
  if(yawning>0&&yawning<1){
    for(let i=0;i<2;i++){
      const px=cx+(i?1:-1)*target*.19,py=cy-target*(.18+.10*yawning);
      drawSpark(ctx,px,py,(2.5+i)*Math.sin(yawning*Math.PI),"#fff0b0");
    }
  }
  const ok=seg(k,.19,.65);
  oven(ctx,cx,cy-target*.02,target*.92,target*.72,ok,.56,color);
  const hot=seg(k,.40,.70);
  if(hot>0){
    for(let i=0;i<3;i++){
      const x=cx+(i-1)*target*.23;
      line(ctx,x,cy+target*.10,x+Math.sin(t*3+i)*target*.06,cy-target*(.32+.12*hot),"#ffbd66",1.5,.10+.22*hot);
    }
  }
  if(hot>0){
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,target*.72);
    glow.addColorStop(0,rgba("#ff9b3d",.44*hot));glow.addColorStop(1,rgba("#ff5a22",0));
    ctx.fillStyle=glow;ctx.fillRect(cx-target,cy-target,target*2,target*2);
  }
  const eruption=seg(k,.65,.94);
  if(eruption>0){
    for(let i=0;i<6;i++){
      const a=-Math.PI*.85+i*Math.PI*.14;
      const rr=target*(.30+.68*eruption);
      drawStar(ctx,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.82,target*.035,t+i,color);
    }
    drawRing(ctx,cx,cy,target*.94,eruption,color,4,.56);
  }
}else if(id==="yomi"){
  const lamp=seg(k,.06,.30),welcome=seg(k,.22,.52),seal=seg(k,.49,.79),rescue=seg(k,.76,.96);
  if(lamp>0){
    const a=Math.sin(Math.PI*Math.min(1,lamp));
    drawRing(ctx,cx,cy-target*.14,target*(.13+.17*lamp),lamp,"#ffe3ac",2,.36);
    drawSpark(ctx,cx,cy-target*.21,target*.025*a,"#fff6cb");
  }
  if(welcome>0){
    const r=target*(.20+.35*welcome);
    ctx.save();ctx.strokeStyle="#ffd9ab";ctx.lineWidth=3;
    ctx.globalAlpha=.32+.34*(1-Math.abs(welcome-.6));
    ctx.beginPath();ctx.arc(cx,cy+target*.16,r,Math.PI*1.10,Math.PI*1.90);ctx.stroke();ctx.restore();
    arcRainbow(ctx,cx+target*.40,cy-target*.04,target*.25,.30+.45*welcome,false);
  }
  if(seal>0){
    const a=Math.sin(Math.PI*Math.min(1,seal));
    const R=target*(.32+.35*seal);
    drawRing(ctx,cx,cy+target*.16,R,seal,"#ffd7a4",2,.42);
    for(let i=0;i<6;i++){
      const angle=i*TAU/6+t*.32;
      drawSpark(ctx,cx+Math.cos(angle)*R*.7,cy+target*.16+Math.sin(angle)*R*.45,
        (2+i%3)*a,i%2?"#ffb0a0":"#fff1c0");
    }
  }
  // Cuerno's Aurora Stampede visibly crosses the seal before Yomi closes it.
  const charge=seg(k,.68,.86);
  if(charge>0&&charge<1){
    const startX=cx+target*.85, impactX=cx-target*.65;
    const front=lerp(startX,impactX,easeOut(charge));
    const arcY=cy+target*(.21-.11*Math.sin(charge*Math.PI));
    ctx.save();ctx.globalAlpha=.35+.5*Math.sin(charge*Math.PI);
    const cols=["#ffe5a4","#ff8eae","#c69cff","#a2f0ff"];
    for(let i=0;i<4;i++){
      ctx.strokeStyle=cols[i];ctx.lineWidth=2.2+i*.5;
      ctx.beginPath();ctx.moveTo(front+target*.09,arcY+(i-1.5)*9);
      ctx.quadraticCurveTo(front+target*.48,arcY-15+i*5,front+target*.73,arcY+(i-1.5)*13);
      ctx.stroke();
    }
    ctx.restore();
    drawSpark(ctx,front,arcY,target*.07*Math.sin(charge*Math.PI),"#fff7d4");
  }
  const impact=seg(k,.79,.94);
  if(impact>0){
    drawRing(ctx,cx,cy+target*.12,target*(.38+.76*impact),impact,"#ffe3b0",4,.61);
    drawRays(ctx,cx,cy+target*.12,target*1.15,"#ffbea1",.14+.30*Math.sin(impact*Math.PI),t*.04,12);
  }
  if(rescue>0){
    const a=Math.sin(Math.PI*.5*rescue);
    arcRainbow(ctx,cx,cy+target*.31,target*(.30+.50*rescue),.15+.36*a,true);
    drawRays(ctx,cx,cy-target*.07,target*.92,"#ffe3ac",.10+.14*a,t*.07,8);
  }
}else if(id==="cuerno"){
  // V68 four-beat grand spectacle: whisper, iris, sleeping stars, soft dawn.
  const beat=cuernoGrandStage(k),q=easeInOut(beat.value);
  const rainbow=["#ff9fb5","#ffc89b","#ffe9b5","#b3ebc7","#9ee5ee","#b9c6ff","#e6c6f4"];
  const hornY=cy-target*.45;
  if(beat.name==="breath"){
    const breath=.4+.6*q;
    drawSpark(ctx,cx,hornY,target*(.012+.028*breath),"#fff6da");
    for(let i=0;i<7;i++){
      const a=i*TAU/7-t*.08,r=target*(.07+.14*breath);
      drawSpark(ctx,cx+Math.cos(a)*r,hornY+Math.sin(a)*r*.72,
        target*.012*breath,rainbow[i]);
    }
    drawRing(ctx,cx,hornY,target*.23,q,"#f5d5ef",1.5,.18);
  }else if(beat.name==="iris"){
    const radius=target*(.20+.66*q),alpha=.28+.18*Math.sin(q*Math.PI);
    ctx.save();ctx.lineCap="round";
    for(let i=0;i<7;i++){
      ctx.strokeStyle=rainbow[i];ctx.globalAlpha=alpha;
      ctx.lineWidth=Math.max(2,target*.018);
      ctx.beginPath();ctx.arc(cx,hornY,Math.max(4,radius-i*target*.035),0,TAU);ctx.stroke();
    }
    ctx.restore();
    drawRing(ctx,cx,hornY,target*(.36+.54*q),q,"#fff8e4",2,.21);
  }else if(beat.name==="dream"){
    const drift=target*(.20+.33*q);
    const veil=ctx.createRadialGradient(cx,hornY,8,cx,hornY,target*.68);
    veil.addColorStop(0,"rgba(216,207,255,.16)");
    veil.addColorStop(1,"rgba(216,207,255,0)");
    ctx.fillStyle=veil;ctx.fillRect(cx-target*.8,hornY-target*.8,target*1.6,target*1.6);
    ctx.save();ctx.lineWidth=Math.max(1.4,target*.007);ctx.lineCap="round";
    for(let i=0;i<5;i++){
      const x=cx+(i-2)*target*.23,y=cy-target*.17-drift*(.38+(i%2)*.27);
      ctx.globalAlpha=.32+.36*Math.sin(Math.PI*q);ctx.strokeStyle=rainbow[i+1];
      ctx.beginPath();ctx.moveTo(x-5,y-6);ctx.lineTo(x+5,y-6);
      ctx.lineTo(x-5,y+6);ctx.lineTo(x+5,y+6);ctx.stroke();
      drawSpark(ctx,x+9,y-12,target*.012*(1+q),rainbow[(i+4)%7]);
    }
    ctx.restore();
    drawRing(ctx,cx,cy+target*.08,target*(.45+.45*q),q,"#e9dbff",2,.18);
  }else{
    const fade=1-q;
    ctx.save();ctx.lineCap="round";
    for(let i=0;i<7;i++){
      ctx.strokeStyle=rainbow[i];ctx.globalAlpha=.21*fade;
      ctx.lineWidth=Math.max(2,target*.019);
      ctx.beginPath();
      ctx.arc(cx,cy+target*.12,target*(.72+.40*q)-i*target*.029,
        Math.PI*.04,Math.PI*1.96);ctx.stroke();
    }
    ctx.restore();
    drawRing(ctx,cx,cy+target*.08,target*(.78+.45*q),q,"#fff6d5",2,.21*fade);
    for(let i=0;i<5;i++){
      const a=i*TAU/5+t*.10;
      drawSpark(ctx,cx+Math.cos(a)*target*.51,cy+Math.sin(a)*target*.31,
        target*.012*fade,rainbow[(i+2)%7]);
    }
  }
}
ctx.restore();
}

function drawAssist(ctx,ally,k,t,cx,cy,target,scale,color){
if(!ally) return;
const inK=easeOut(seg(k,.27,.41));
const outK=1-easeOut(seg(k,.91,1));
const alpha=inK*outK;
if(alpha<=.01)return;
const x=lerp(cx+target*1.15,cx+target*.64,inK) - (ally.id==="cuerno" ? target*.46*easeOut(seg(k,.69,.84)) : 0);
const y=cy+target*.36-Math.sin(inK*Math.PI)*target*.05;
ally.vx=0;ally.vy=0;ally.grounded=true;ally.facing=-1;
ally._poseOverride=k<.47?"run":k<.77?"attack":"victory";
ally.melee=k>.47&&k<.82?8:0;
ctx.save();ctx.globalAlpha=alpha*.95;
drawDummy(ctx,ally,x,y,scale*.81,t*60+19);
ctx.restore();
if(k>.37&&k<.94){
  drawTitle(ctx,ally.id==="cuerno"?"CUERNO · COMPAÑERO":"OHANA ASSIST",x,cy-target*.67,Math.max(12,target*.056),tint(color,.45),{
    font:FONT_BODY,weight:900,spacing:".22em",stroke:false,maxWidth:target*.9
  });
}
}

function play(detail={}){
if(active) active.stop();
const el=mount(),cv=el.querySelector("canvas"),fc=fullCanvas(cv),ctx=fc.ctx;
const def=heroDef(String(detail.id||"kilo"));
const story=SUPREME_STORYBOARDS[def.id]||SUPREME_STORYBOARDS.kilo;
const evo=clamp(Number(detail.evo)||4,0,4);
const color=detail.color||def.color||"#ffe66a";
const p=actor(def,evo,color);
const allyDef=ROSTER.find(r=>String(r.name).toLowerCase()===String(detail.assist||"").toLowerCase()||r.id===String(detail.assist||"").toLowerCase());
const ally=allyDef?actor(allyDef,Math.min(4,Math.max(2,evo)),allyDef.color):null;
const reduce=reducedMotion();
const duration=reduce ? .78 : Math.max(2.65,story.duration);
let t0=0,raf=0,done=false;
const token=++generation;

el.className="show story-"+story.scene;
el.dataset.activeId=def.id;
el.dataset.mode="storyboard";
el.dataset.story=story.gag;
el.dataset.camera=story.camera;
el.dataset.beat=story.beat;
el.dataset.assist=allyDef?.id||"";
el.dataset.generation=String(token);
el.dataset.state="active";
el.dataset.duration=String(Math.round(duration*1000));
el.style.setProperty("--supreme",color);
el.setAttribute("aria-hidden","false");
el.querySelector(".sc-sr").textContent=(detail.name||"Suprema")+" · "+story.beat+" · "+(detail.line||"");
duckMusic(true);try{sfx("supreme");}catch(_){}

function stop(){
  if(done)return;
  done=true;
  cancelAnimationFrame(raf);
  el.classList.remove("show");
  el.setAttribute("aria-hidden","true");
  el.dataset.state="idle";
  duckMusic(false);
  active=null;
}

function frame(now){
  if(done)return;
  if(!t0)t0=now;
  const t=(now-t0)/1000;
  const k=clamp(t/duration,0,1);
  const W=fc.W,H=fc.H,cx=W/2,cy=H*.49;
  const target=Math.min(H*.48,W*.33);
  const baseScale=target/baseHeight(def.id,evo);
  const inK=easeOut(seg(k,0,.10));
  const outK=1-easeOut(seg(k,.90,1));
  const vis=inK*outK;

  ctx.clearRect(0,0,W,H);
  backdrop(ctx,W,H,cx,cy,color,story,k);
  drawStory(ctx,def.id,k,t,cx,cy,target,color);

  const motion=storyMotion(def.id,k,target);
  p.vx=0;p.vy=0;p.grounded=true;
  p._poseOverride=storyPose(def.id,k);
  p.melee=p._poseOverride==="attack"?Math.max(2,10-Math.floor(k*8)):0;
  // Only the cinematic dummy receives these visual cues.
  if(def.id==="cuerno"){
    const stage=cuernoGrandStage(k);
    el.dataset.cuernoPhase=stage.name;
    p._cuernoMagicSlot=k>=.22&&k<.76?3:-1;
    p._specialAuroraT=k>=.76?Math.round((1-k)*180):0;
  }else delete el.dataset.cuernoPhase;

  let heroAlpha=vis;
  if(def.id==="cat"){
    const vanish=Math.sin(seg(k,.52,.72)*Math.PI);
    heroAlpha*=1-vanish*.90;
  }
  const pop=lerp(.88,1,easeBack(seg(k,.06,.34)));
  ctx.save();
  ctx.globalAlpha=heroAlpha;
  ctx.translate(cx+motion.x,cy+target*.50+motion.y);
  ctx.rotate(motion.rot);
  ctx.scale(motion.scale,motion.scale);
  drawDummy(ctx,p,0,0,baseScale*pop,t*60);
  ctx.restore();

  drawAssist(ctx,ally,k,t,cx,cy,target,baseScale,color);

  const copyK=easeOut(seg(k,.70,.84))*outK;
  if(copyK>.01){
    ctx.save();ctx.globalAlpha=copyK;
    drawTitle(ctx,String(detail.name||"SUPREMA").toUpperCase(),cx,H*.16,Math.max(22,Math.min(48,W*.036)),["#fff",color],{
      font:FONT_DISPLAY,weight:700,stroke:false,glow:color,maxWidth:W*.82
    });
    drawTitle(ctx,String(detail.line||""),cx,H*.86,Math.max(10,Math.min(14,W*.0105)),color,{
      font:FONT_BODY,weight:900,spacing:".20em",stroke:false,maxWidth:W*.88
    });
    ctx.restore();
  }

  if(k>=1){stop();return;}
  raf=requestAnimationFrame(frame);
}

active={stop};
raf=requestAnimationFrame(frame);
}

if(!window.__ohanaSupremeCinema){
window.__ohanaSupremeCinema=true;
addEventListener("ohana-supreme",(event)=>play(event?.detail||{}));
}
export { SUPREME_STORYBOARDS };
export const supremeCinema={play,storyboards:SUPREME_STORYBOARDS};
