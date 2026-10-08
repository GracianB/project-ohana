// PROJECT OHANA V44 · TRUE ENDING
import {
  fullCanvas, reducedMotion, clamp, seg, easeOut, easeInOut, lerp,
  rgba, makeDummy, drawDummy, baseHeight, drawTitle, FONT_BODY, FONT_DISPLAY
} from "./evo-cinema.js";
import { ROSTER } from "../characters/roster.js";
import { duckMusic } from "../engine/music.js";
import { sfx } from "../engine/audio.js";

let running=null;
const CAST=["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];

function heroBy(detail){
  const id=String(detail.id||"").toLowerCase();
  return ROSTER.find(r=>r.id===id)||ROSTER.find(r=>String(r.name).toLowerCase()===String(detail.hero||"").toLowerCase())||ROSTER[0];
}
function buildLayer(){
  let layer=document.getElementById("win-cinema");
  if(!layer){layer=document.createElement("div");layer.id="win-cinema";document.body.appendChild(layer);}
  layer.setAttribute("role","dialog");
  layer.setAttribute("aria-modal","true");
  layer.setAttribute("aria-labelledby","win-title");
  layer.innerHTML=
    '<canvas class="win-canvas" aria-hidden="true"></canvas>'+
    '<button type="button" class="win-skip">SALTAR A RESULTADOS ↗</button>'+
    '<div class="win-card">'+
      '<p class="win-kicker">Mundo 1 completado · Isla Hoku</p>'+
      '<p class="win-act">LA FAMILIA VUELVE A CASA</p>'+
      '<h2 id="win-title">NADIE SE QUEDA ATRÁS</h2>'+
      '<p class="win-hero"></p><p class="win-score"></p>'+
      '<p class="win-jun">HOKU VUELVE A RESPIRAR</p>'+
      '<p class="win-sub">La Reina cae. El Nido se abre. La familia regresa junta al Claro.</p>'+
      '<div class="win-actions">'+
        '<button type="button" id="win-continue">Continuar en este mundo</button>'+
        '<button type="button" id="win-repeat" class="ghost">Repetir el nido</button>'+
        '<button type="button" id="win-roster" class="ghost">Elegir personaje</button>'+
      '</div>'+
    '</div>';
  return layer;
}
function bindActions(layer){
  const close=(action)=>{
    if(running)running.stop(true);
    layer.className="";
    layer.setAttribute("aria-hidden","true");
    dispatchEvent(new CustomEvent("ohana-after",{detail:{action}}));
  };
  layer.querySelector("#win-continue").onclick=()=>close("continue");
  layer.querySelector("#win-repeat").onclick=()=>close("repeat");
  layer.querySelector("#win-roster").onclick=()=>close("roster");
}
function drawRift(ctx,cx,cy,R,k){
  ctx.save();ctx.globalCompositeOperation="lighter";ctx.globalAlpha=.82*k;
  for(let i=0;i<5;i++){
    ctx.strokeStyle=i%2?"#ff607b":"#fff0b5";ctx.lineWidth=2+i*.5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=16;
    ctx.beginPath();ctx.moveTo(cx-R*.06*i,cy-R*.62);
    ctx.bezierCurveTo(cx-R*.25,cy-R*.25,cx+R*.26,cy+R*.10,cx+R*.03*i,cy+R*.58);ctx.stroke();
  }ctx.restore();
}
function showEnding(detail={}){
  if(running)running.stop(true);
  const layer=buildLayer();bindActions(layer);
  // Keep all ten illustrated actors crisp without a high-DPR full-screen GPU tax.
  const canvas=layer.querySelector(".win-canvas"),reduce=reducedMotion();
  const fc=fullCanvas(canvas,reduce?1:1.2),ctx=fc.ctx;
  const hero=heroBy(detail),evo=clamp(Number(detail.evo)||4,0,4);
  const heroActor=makeDummy(hero.id,evo,hero.color);
  const actors=Object.fromEntries(CAST.map(id=>{
    const d=ROSTER.find(r=>r.id===id)||ROSTER[0];
    return [id,makeDummy(id,id===hero.id?evo:1,d.color)];
  }));
  // The whole family reunites before the results card is allowed to appear.
  const duration=reduce?1.6:14.5; // V99: family portrait earns the full reveal before results
  const family=CAST.filter(id=>id!==hero.id);
  let t0=0,raf=0,done=false,complete=false,lastPaint=0;
  // Keep the family framed on orientation / window changes, without raising DPR.
  const onResize=()=>{if(!done&&!complete){fc.resize();lastPaint=0;}};
  addEventListener("resize",onResize,{passive:true});

  layer.className="show cinema-running ending-phase-1";
  // The results card is outside the narrative until ACT IV, including for
  // assistive technology. Skip remains an accessible sibling button.
  const card=layer.querySelector(".win-card");
  card.inert=true;
  card.setAttribute("aria-hidden","true");
  layer.removeAttribute("aria-labelledby");
  layer.setAttribute("aria-label","Cinemática final de OHANA");
  layer.dataset.ending="v44-true-ending";
  layer.dataset.pacing="v80-delayed-finale";
  layer.dataset.duration=String(Math.round(duration*1000));
  layer.dataset.resultsAt=String(Math.round(duration*1000));
  layer.setAttribute("aria-hidden","false");
  const score=layer.querySelector(".win-score");
  layer.querySelector(".win-hero").textContent=(detail.hero||hero.name)+" · "+(detail.form||"forma final");
  score.textContent=(detail.rank?"Claro "+detail.rank+" · ":"")+(detail.time?detail.time+" · ":"")+(Number(detail.kills)||0)+" bajas"+(detail.best&&detail.best!==detail.time?" · mejor "+detail.best:"");
  duckMusic(true);try{sfx("victory");}catch(_){}

  function actor(p,x,footY,h,tf,opts={}){
    p.facing=opts.facing||1;p.grounded=opts.grounded!==false;p.vx=opts.vx||0;p.vy=opts.vy||0;p.melee=opts.melee||0;p._poseOverride=opts.pose||"idle";
    ctx.save();if(opts.alpha!==undefined)ctx.globalAlpha*=opts.alpha;
    drawDummy(ctx,p,x,footY,h/baseHeight(p.id,p.evo||0),tf);ctx.restore();
  }
  function revealResults(){
    if(complete)return;complete=true;
    removeEventListener("resize",onResize);
    layer.classList.remove("cinema-running","ending-phase-1","ending-phase-2","ending-phase-3");
    layer.classList.add("cinema-complete","ending-phase-4");
    card.inert=false;
    card.setAttribute("aria-hidden","false");
    layer.removeAttribute("aria-label");
    layer.setAttribute("aria-labelledby","win-title");
    layer.querySelector(".win-skip").hidden=true;
    layer.querySelector("#win-continue")?.focus({preventScroll:true});
    duckMusic(false);
  }
  function stop(silent=false){
    if(done)return;done=true;cancelAnimationFrame(raf);
    removeEventListener("resize",onResize);duckMusic(false);running=null;
    if(!silent)revealResults();
  }
  function frame(now){
    if(done||complete)return;if(!t0)t0=now;
    // Ten Canvas actors are expensive. Elapsed time, not frame count, drives the story.
    if(!reduce && lastPaint && now-lastPaint<41){raf=requestAnimationFrame(frame);return;}
    lastPaint=now;
    const t=(now-t0)/1000,k=clamp(t/duration,0,1),W=fc.W,H=fc.H,cx=W/2,ground=H*.78,tf=t*60;
    ctx.clearRect(0,0,W,H);
    const dawn=seg(k,.48,.92);
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,dawn>.1?"#264b63":"#050915");bg.addColorStop(.56,dawn>.1?"#bf8f69":"#180817");bg.addColorStop(1,"#061016");
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    const glow=ctx.createRadialGradient(cx,H*.32,0,cx,H*.32,Math.min(W,H)*.52);
    glow.addColorStop(0,rgba(dawn>.1?"#ffe6a3":"#ff486a",.22+.22*dawn));glow.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);

    // ACT I · Queen fall / rift collapses around selected hero.
    if(k<.30){
      const q=seg(k,0,.30),rift=1-seg(k,.19,.30);
      drawRift(ctx,cx,H*.38,Math.min(W,H)*.38,rift);
      const h=Math.min(H*.44,W*.28);
      heroActor._poseOverride=q<.45?"attack":"victory";heroActor.melee=q<.45?10:0;
      actor(heroActor,cx,ground,h,tf,{pose:heroActor._poseOverride});
      ctx.save();ctx.globalAlpha=1-seg(q,.62,1);
      drawTitle(ctx,"LA REINA CAE",cx,H*.15,Math.max(28,Math.min(62,W*.05)),["#fff4c6","#ff6b82"],{font:FONT_DISPLAY,weight:700,stroke:false,glow:"#ff5a72"});
      ctx.restore();
      layer.classList.add("ending-phase-1");
    }

    // ACT II · family arrives, one by one, around the protagonist.
    if(k>=.27&&k<.80){
      layer.classList.remove("ending-phase-1");layer.classList.add("ending-phase-2");
      const group=seg(k,.27,.72),heroH=Math.min(H*.31,W*.17);
      actor(heroActor,cx,ground,heroH*1.08,tf,{pose:"victory"});
      family.forEach((id,i)=>{
        const p=actors[id],side=i%2?-1:1,row=Math.floor(i/2),x=cx+side*(heroH*.78+row*heroH*.42);
        const enter=easeOut(seg(group,i*.055,.30+i*.055));
        const y=ground+18*(1-enter);
        actor(p,x,y,heroH*(.68+(i%3)*.05),tf,{facing:x<cx?1:-1,pose:i===2&&enter>.7?"run":"idle",alpha:enter});
      });
      const copy=seg(k,.59,.72)*(1-seg(k,.77,.81));
      if(copy>0){ctx.save();ctx.globalAlpha=copy;drawTitle(ctx,"TODOS LLEGAN.",cx,H*.14,Math.max(24,Math.min(50,W*.038)),"#fff0b5",{font:FONT_DISPLAY,weight:700,stroke:false});ctx.restore();}
    }

    // ACT III · sunrise family portrait.
    if(k>=.77){
      layer.classList.remove("ending-phase-2");layer.classList.add("ending-phase-3");
      const heroH=Math.min(H*.28,W*.15),spread=Math.min(W*.72,heroH*7.8);
      CAST.forEach((id,i)=>{
        const p=actors[id],x=cx-spread/2+spread*(i/(CAST.length-1)),chosen=id===hero.id;
        actor(p,x,ground,heroH*(chosen?1.05:.72),tf,{facing:x<cx?1:-1,pose:chosen?"victory":"idle"});
      });
      // Text appears after the full family portrait, not during the arrival.
      const titleK=seg(k,.89,.97);
      if(titleK>0){
        ctx.save();ctx.globalAlpha=titleK;
        drawTitle(ctx,"NADIE SE QUEDA ATRÁS",cx,H*.16,Math.max(30,Math.min(68,W*.052)),["#fff8d8","#ffe08c"],{font:FONT_DISPLAY,weight:700,stroke:false,glow:"#ffe39a",maxWidth:W*.9});
        drawTitle(ctx,"MUNDO 1 COMPLETADO · ISLA HOKU",cx,H*.23,Math.max(10,Math.min(15,W*.011)),"#bdefff",{font:FONT_BODY,weight:800,spacing:".22em",stroke:false});
        ctx.restore();
      }
    }
    if(k>=1){revealResults();return;}
    raf=requestAnimationFrame(frame);
  }
  layer.querySelector(".win-skip").onclick=()=>revealResults();
  // The same dialog node is reused on every victory: replace the handler
  // rather than leaking one-shot listeners if the scene ended by mouse click.
  layer.onkeydown=(e)=>{
    if(!complete && (e.key==="Escape"||e.key==="Enter"||e.key===" ")){
      e.preventDefault();revealResults();
    }
  };
  running={stop};raf=requestAnimationFrame(frame);
}

if(!window.__ohanaWinBound){
  window.__ohanaWinBound=true;
  addEventListener("ohana-win",(e)=>showEnding(e.detail||{}));
}
export { showEnding };
