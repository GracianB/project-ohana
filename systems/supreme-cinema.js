// PROJECT OHANA V44 · SUPREME SHORTS
// Cada U muestra al héroe real en una mini-cinemática breve y legible.
import {
  fullCanvas, reducedMotion, clamp, seg, easeOut, easeBack, lerp,
  rgba, makeDummy, drawDummy, baseHeight, drawTitle, FONT_BODY, FONT_DISPLAY
} from "./evo-cinema.js";
import { ROSTER } from "../characters/roster.js";
import { duckMusic } from "../engine/music.js";
import { sfx } from "../engine/audio.js";

let active = null;
const PROFILES = Object.freeze({
  kilo:{mode:"bloom"}, stitcho:{mode:"rift"}, chispin:{mode:"storm"}, cat:{mode:"eclipse"},
  dragon:{mode:"nova"}, dino:{mode:"quake"}, frita:{mode:"crisp"}, pizza:{mode:"oven"},
  yomi:{mode:"maw"}, cuerno:{mode:"aurora"}
});

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
  p._poseOverride="idle";return p;
}
function motif(ctx,id,cx,cy,R,k,color,t){
  if(k<=0)return;
  ctx.save();ctx.translate(cx,cy);ctx.globalCompositeOperation="lighter";ctx.globalAlpha=.24+.56*k;
  ctx.strokeStyle=color;ctx.fillStyle=rgba(color,.15);ctx.lineWidth=Math.max(2,R*.018);
  const pulse=R*(.55+.08*Math.sin(t*9));
  if(id==="kilo"){
    for(let i=0;i<7;i++){ctx.save();ctx.rotate(i*Math.PI*2/7+t*.18);ctx.beginPath();ctx.ellipse(0,-pulse*.7,R*.12,R*.28,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  }else if(id==="stitcho"){
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(-R*.7,i*R*.18);ctx.bezierCurveTo(-R*.2,i*R*.05,R*.2,-i*R*.08,R*.7,i*R*.15);ctx.stroke();}
  }else if(id==="chispin"){
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7+t*.35;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(R*.28,0);ctx.lineTo(R*.46,-R*.08);ctx.lineTo(R*.40,R*.05);ctx.lineTo(R*.68,0);ctx.stroke();ctx.restore();}
  }else if(id==="cat"){
    ctx.beginPath();ctx.arc(0,0,R*.58,0,Math.PI*2);ctx.stroke();ctx.globalCompositeOperation="source-over";ctx.fillStyle="rgba(2,3,9,.88)";ctx.beginPath();ctx.arc(R*.15,-R*.05,R*.50,0,Math.PI*2);ctx.fill();
  }else if(id==="dragon"){
    for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3+t*.22);ctx.beginPath();ctx.moveTo(R*.18,0);ctx.quadraticCurveTo(R*.55,-R*.22,R*.72,0);ctx.quadraticCurveTo(R*.48,R*.14,R*.18,0);ctx.stroke();ctx.restore();}
  }else if(id==="dino"){
    for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.moveTo(R*.25,0);ctx.lineTo(R*.52,-R*.12);ctx.lineTo(R*.68,0);ctx.stroke();ctx.restore();}
    ctx.beginPath();ctx.ellipse(0,R*.48,R*.70,R*.16,0,0,Math.PI*2);ctx.stroke();
  }else if(id==="frita"){
    for(let i=-3;i<=3;i++){ctx.save();ctx.rotate(i*.08);ctx.fillRect(i*R*.13,-R*.64,R*.05,R*.56);ctx.restore();}
  }else if(id==="pizza"){
    ctx.beginPath();ctx.moveTo(0,-R*.66);ctx.lineTo(R*.58,R*.45);ctx.lineTo(-R*.58,R*.45);ctx.closePath();ctx.stroke();
    for(const [x,y] of [[-.18,.05],[.20,.12],[0,.30]]){ctx.beginPath();ctx.arc(x*R,y*R,R*.07,0,Math.PI*2);ctx.fill();}
  }else if(id==="yomi"){
    ctx.beginPath();ctx.ellipse(0,0,R*.72,R*.32,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,R*.12,0,Math.PI*2);ctx.fill();
  }else{
    for(let i=0;i<4;i++){ctx.strokeStyle=["#ff7aa8","#ffd36a","#7ee7ff","#b78bff"][i];ctx.beginPath();ctx.arc(0,R*.18,R*(.38+i*.08),Math.PI*1.05,Math.PI*1.95);ctx.stroke();}
  }
  ctx.restore();
}
function play(detail={}){
  if(active) active.stop();
  const el=mount(), cv=el.querySelector("canvas"), fc=fullCanvas(cv), ctx=fc.ctx;
  const def=heroDef(String(detail.id||"kilo"));
  const evo=clamp(Number(detail.evo)||4,0,4);
  const color=detail.color||def.color||"#ffe66a";
  const p=actor(def,evo,color);
  const allyDef=ROSTER.find(r=>String(r.name).toLowerCase()===String(detail.assist||"").toLowerCase()||r.id===String(detail.assist||"").toLowerCase());
  const ally=allyDef?actor(allyDef,Math.min(2,evo),allyDef.color):null;
  const reduce=reducedMotion(), duration=reduce?.72:1.38;
  let t0=0,raf=0,done=false;
  el.className="show kind-"+(PROFILES[def.id]?.mode||"bloom");
  el.dataset.activeId=def.id;el.dataset.mode="hero-short";
  el.style.setProperty("--supreme",color);
  el.setAttribute("aria-hidden","false");
  el.querySelector(".sc-sr").textContent=(detail.name||"Suprema")+" · "+(detail.line||"");
  duckMusic(true);try{sfx("supreme");}catch(_){}

  function stop(){
    if(done)return;done=true;cancelAnimationFrame(raf);el.classList.remove("show");el.setAttribute("aria-hidden","true");duckMusic(false);active=null;
  }
  function frame(now){
    if(done)return;if(!t0)t0=now;const t=(now-t0)/1000,k=clamp(t/duration,0,1);
    const W=fc.W,H=fc.H,cx=W/2,cy=H*.47,target=Math.min(H*.48,W*.34),scale=target/baseHeight(def.id,evo);
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.hypot(W,H)*.58);
    bg.addColorStop(0,rgba(color,.30));bg.addColorStop(.34,"rgba(5,10,20,.82)");bg.addColorStop(1,"rgba(1,3,8,.97)");
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    const inK=easeOut(seg(k,0,.22)),outK=1-easeOut(seg(k,.76,1)),vis=inK*outK;
    motif(ctx,def.id,cx,cy,target*.92,inK,color,t);
    p._poseOverride=k<.34?"idle":k<.72?"attack":"victory";p.melee=k>.34&&k<.72?10:0;
    ctx.save();ctx.globalAlpha=vis;const pop=lerp(.78,1,easeBack(seg(k,.08,.45)));drawDummy(ctx,p,cx,cy+target*.5,scale*pop,t*60);ctx.restore();
    if(ally&&k>.44&&k<.86){
      ally._poseOverride="attack";ally.melee=8;ctx.save();ctx.globalAlpha=vis*.78;drawDummy(ctx,ally,cx-target*.72,cy+target*.42,scale*.62,t*60);ctx.restore();
    }
    if(k>.16){
      ctx.save();ctx.globalAlpha=vis;
      drawTitle(ctx,String(detail.name||"SUPREMA").toUpperCase(),cx,H*.19,Math.max(26,Math.min(62,W*.05)),["#fff",color],{font:FONT_DISPLAY,weight:700,stroke:false,glow:color,maxWidth:W*.88});
      drawTitle(ctx,String(detail.line||""),cx,H*.82,Math.max(11,Math.min(16,W*.012)),color,{font:FONT_BODY,weight:800,spacing:".18em",stroke:false,maxWidth:W*.9});
      ctx.restore();
    }
    if(k>=1){stop();return;}raf=requestAnimationFrame(frame);
  }
  active={stop};raf=requestAnimationFrame(frame);
}
if(!window.__ohanaSupremeCinema){
  window.__ohanaSupremeCinema=true;
  addEventListener("ohana-supreme",(event)=>play(event?.detail||{}));
}
export const supremeCinema={play};
