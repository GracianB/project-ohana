import {readKeepsakes,mergeKeepsakes,drawKeepsake} from './keepsakes.js';
import {rememberFamilyVictory} from "./family-memory.js";
import {drawChispaCeremony} from './chispa-stagecraft.js';
// PROJECT OHANA V44 · TRUE ENDING
import {
  fullCanvas, reducedMotion, clamp, seg, easeOut, easeInOut, lerp,
  rgba, makeDummy, drawDummy, baseHeight, drawTitle, FONT_BODY, FONT_DISPLAY
} from "./evo-cinema.js";
import { ROSTER } from "../characters/roster.js";
import { familyFinaleBeat } from "./v100-family-choreography.js";
import { duckMusic } from "../engine/music.js";
import { sfx } from "../engine/audio.js";
import { chooseUPartner } from "./u-partners.js";
import { endingSignature, duoBeat, drawSignature } from "./ending-duo.js";
import { cachedGradient } from "./canvas-gradient-cache.js";
import { WORLD1_ENDING } from "./world1-story.js";

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
    '<button type="button" class="win-skip">VER EL REENCUENTRO ↗</button>'+
    '<div class="win-card">'+
      '<p class="win-kicker">Mundo 1 completado · Isla Hoku</p>'+
      '<p class="win-act">LA FAMILIA VUELVE A CASA</p>'+
      '<h2 id="win-title">NADIE SE QUEDA ATRÁS</h2>'+
      '<p class="win-hero"></p><p class="win-score"></p>'+
      '<p class="win-jun">HOKU VUELVE A RESPIRAR</p>'+
      '<p class="win-sub">La Reina cae. El Nido se abre. La familia regresa junta al Claro.</p>'+
      '<div class="win-actions">'+
        '<button type="button" data-open-constellation hidden>✦ Un lugar para ti · V500</button>'+
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
  layer.querySelector("#win-continue").onclick=(e)=>close(e.currentTarget?.dataset?.action||"continue");
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
  layer.querySelector(".win-skip").focus({preventScroll:true});
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
  // V372: el compañero U elegido comparte protagonismo con el héroe.
  const partnerId=chooseUPartner(hero.id,detail.uPartner)||CAST.find(id=>id!==hero.id);
  const partnerDef=ROSTER.find(r=>r.id===partnerId)||ROSTER[0];
  const partnerActor=actors[partnerId];
  const heroSig=endingSignature(hero.id),partnerSig=endingSignature(partnerId);
  const family=CAST.filter(id=>id!==hero.id&&id!==partnerId);
  // Retrato final: héroe y compañero juntos en el centro, la familia a los lados.
  const portrait=[...family.slice(0,4),hero.id,partnerId,...family.slice(4)];
  let t0=0,raf=0,done=false,complete=false,lastPaint=0;
  // Keep the family framed on orientation / window changes, without raising DPR.
  const onResize=()=>{if(!done){fc.resize();lastPaint=0;}};
  addEventListener("resize",onResize,{passive:true});

  layer.className="show cinema-running ending-phase-1";
  // The results card is outside the narrative until ACT IV, including for
  // assistive technology. Skip remains an accessible sibling button.
  const card=layer.querySelector(".win-card");
  card.inert=true;
  card.setAttribute("aria-hidden","true");
  layer.removeAttribute("aria-labelledby");
  layer.setAttribute("aria-label","Cinemática final de OHANA");
  layer.dataset.ending="v100-special-single-ending";
  layer.dataset.pacing="v80-delayed-finale";
  layer.dataset.endingHero=hero.id;
  layer.dataset.endingPartner=partnerId;
  layer.dataset.endingMotif=heroSig.motif+"+"+partnerSig.motif;
  layer.dataset.duration=String(Math.round(duration*1000));
  layer.dataset.resultsAt=String(Math.round(duration*1000));
  layer.setAttribute("aria-hidden","false");
  // The family and its rescued belongings close this campaign.
  const w1=Number(detail.world)===1,coop=detail.coop===true;
  if(w1&&!coop){const memory=rememberFamilyVictory(detail);dispatchEvent(new CustomEvent("ohana-family-memory",{detail:memory}));}
  layer.querySelector("[data-open-constellation]").hidden=!w1||coop;
  const copy=w1?WORLD1_ENDING:{kicker:"Mundo 2 completado · Isla Hoku",act:"LA FAMILIA VUELVE A CASA",title:"NADIE SE QUEDA ATRÁS",jun:"HOKU VUELVE A RESPIRAR",sub:"La Reina cae. El Nido se abre. La familia regresa junta al Claro."};
  for(const [sel,key] of [[".win-kicker","kicker"],[".win-act","act"],["#win-title","title"],[".win-jun","jun"],[".win-sub","sub"]]){const n=layer.querySelector(sel);if(n)n.textContent=copy[key];}
  // Keep the closing reward about what the player actually rescued.
  const cont=layer.querySelector("#win-continue");if(cont){cont.textContent=coop?"Volver al vestíbulo":w1?"Volver al inicio":"Continuar en este mundo";cont.dataset.action=coop?"lobby":w1?"home":"continue";}
  let soon=layer.querySelector(".win-soon");
  if(w1&&!soon){soon=document.createElement("p");soon.className="win-soon";soon.setAttribute("role","note");layer.querySelector(".win-actions")?.before(soon);}
  if(soon){soon.textContent="Diez recuerdos a salvo. Cada uno vuelve con su dueño.";soon.hidden=!w1;}
  const rep=layer.querySelector("#win-repeat");if(rep){rep.textContent=w1?"Repetir la Quimera":"Repetir el nido";rep.hidden=coop;}const roster=layer.querySelector("#win-roster");if(roster)roster.hidden=coop;
  layer.dataset.world=w1?"1":"2";
  const score=layer.querySelector(".win-score");
  layer.querySelector(".win-hero").textContent=(detail.hero||hero.name)+" · "+(detail.form||"forma final");
  score.textContent=(coop?"Cooperativo · ":detail.rank?"Claro "+detail.rank+" · ":"")+(detail.time?detail.time+" · ":"")+(Number(detail.kills)||0)+" bajas"+(detail.best&&detail.best!==detail.time?" · mejor "+detail.best:"");
  duckMusic(true);try{sfx("victory");}catch(_){}

  const earnedKeepsakes=new Set(mergeKeepsakes(readKeepsakes(),detail.keepsakes));
  function actor(p,x,footY,h,tf,opts={}){
    p.facing=opts.facing||1;p.grounded=opts.grounded!==false;p.vx=opts.vx||0;p.vy=opts.vy||0;p.melee=opts.melee||0;p._poseOverride=opts.pose||"idle";
    if(p.id==='kilo'&&!reduce)p._kiloPerformance={kind:"dance",time:tf/60};
    ctx.save();if(opts.alpha!==undefined)ctx.globalAlpha*=opts.alpha;
    if(p.id==='chispin')drawChispaCeremony(ctx,x,footY,h,tf/60,reduce,'ending');
    drawDummy(ctx,p,x,footY,h/baseHeight(p.id,p.evo||0),tf);if(earnedKeepsakes.has(p.id))drawKeepsake(ctx,p.id,x+h*.45,footY,Math.min(64,h*.45));ctx.restore();
  }
  function revealResults(){
    if(complete)return;complete=true;
    layer.classList.remove("cinema-running","ending-phase-1","ending-phase-2","ending-phase-3");
    layer.classList.add("cinema-complete","ending-phase-4");
    card.inert=false;
    card.setAttribute("aria-hidden","false");
    layer.removeAttribute("aria-label");
    layer.setAttribute("aria-label","Nadie se queda atrás. Mundo 1 completado. La familia vuelve a casa.");
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
    if(done)return;if(!t0)t0=now;
    // Ten Canvas actors are expensive. Elapsed time, not frame count, drives the story.
    if(lastPaint && now-lastPaint<(reduce?120:41)){raf=requestAnimationFrame(frame);return;}
    lastPaint=now;
    const t=(now-t0)/1000,k=complete?1:clamp(t/duration,0,1),W=fc.W,H=fc.H,cx=W/2,ground=H*(W<600?.66:.70),tf=reduce?60:t*60;
    ctx.clearRect(0,0,W,H);
    const dawn=seg(k,.48,.92);
    // V372: gradientes cacheados por tamaño (y 12 pasos de amanecer), nunca por fotograma.
    const day=dawn>.1,step=Math.round(dawn*12);
    const bg=cachedGradient(ctx,"end-bg:"+W+"x"+H+":"+day,()=>{
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,day?"#264b63":"#050915");g.addColorStop(.56,day?"#bf8f69":"#180817");g.addColorStop(1,"#061016");return g;
    });
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    const glow=cachedGradient(ctx,"end-glow:"+W+"x"+H+":"+step,()=>{
      const g=ctx.createRadialGradient(cx,H*.32,0,cx,H*.32,Math.min(W,H)*.52);
      g.addColorStop(0,rgba(step>1?"#ffe6a3":"#ff486a",.22+.22*step/12));g.addColorStop(1,"rgba(0,0,0,0)");return g;
    });
    ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);

    // ACT I · After the Queen has already exploded, the Nido finally opens.
    if(k<.30){
      const q=seg(k,0,.30),rift=1-seg(k,.19,.30);
      drawRift(ctx,cx,H*.38,Math.min(W,H)*.38,rift);
      const h=Math.min(H*.40,W*.25),d=duoBeat(t,reduce),gap=Math.min(W*.32,h*1.35);
      const hx=cx-gap*.5*d.partnerIn,px=lerp(W+h,cx+gap*.5,easeOut(d.partnerIn));
      const R=h*.62,spin=reduce?0:t*.9;
      // 1) Golpe de firma del héroe hacia la grieta. 2) Entra su compañero U.
      // 3) Remate del compañero. 4) Combo del dúo, con los dos motivos a la vez.
      drawSignature(ctx,hero.id,hx,ground-h*.55,R,d.heroMove*(1-d.combo*.4),1,spin);
      if(d.partnerIn>0)drawSignature(ctx,partnerId,px,ground-h*.5,R*.9,d.partnerMove*(1-d.combo*.4),-1,spin);
      if(d.combo>0){
        drawSignature(ctx,hero.id,cx,H*.38,Math.min(W,H)*.22,d.combo,1,spin);
        drawSignature(ctx,partnerId,cx,H*.38,Math.min(W,H)*.16,d.combo,-1,-spin);
      }
      heroActor._poseOverride=hero.id==="kilo"?"victory":d.heroMove<1&&!reduce?"attack":"victory";heroActor.melee=heroActor._poseOverride==="attack"?10:0;
      actor(heroActor,hx,ground,h,tf,{pose:heroActor._poseOverride,facing:1});
      if(d.partnerIn>0){
        const running=d.partnerIn<1;
        partnerActor.melee=!running&&d.partnerMove<1?10:0;
        actor(partnerActor,px,ground,h*.86,tf,{facing:-1,vx:running?-6:0,
          pose:running?"run":d.partnerMove<1?"attack":"victory",alpha:clamp(d.partnerIn*3,0,1)});
      }
      ctx.save();ctx.globalAlpha=1-seg(q,.84,1);
      const duoName=(hero.name||hero.id).toUpperCase()+" & "+(partnerDef.name||partnerId).toUpperCase();
      drawTitle(ctx,d.combo>.15?duoName:hero.id==="kilo"?"UN ÚLTIMO BAILE, OHANA":w1?"LOS RECUERDOS VUELVEN A CASA":"EL NIDO SE ABRE",cx,H*.15,Math.max(26,Math.min(58,W*.048)),["#fff4c6",d.combo>.15?heroSig.color:"#ff6b82"],{font:FONT_DISPLAY,weight:700,stroke:false,glow:d.combo>.15?heroSig.color:"#ff5a72",maxWidth:W*.92});
      if(d.combo>.3)drawTitle(ctx,heroSig.line,cx,H*.15+Math.max(26,Math.min(58,W*.048))*.95,Math.max(12,Math.min(20,W*.016)),heroSig.accent,{font:FONT_BODY,weight:800,stroke:false,maxWidth:W*.9});
      ctx.restore();
      layer.classList.add("ending-phase-1");
    }

    // ACT II · family arrives, one by one, around the protagonist.
    if(k>=.27&&k<.80){
      layer.classList.remove("ending-phase-1");layer.classList.add("ending-phase-2");
      const group=seg(k,.27,.72),heroH=Math.min(H*.31,W*.17);
      actor(heroActor,cx-heroH*.3,ground,heroH*1.08,tf,{pose:"victory"});
      actor(partnerActor,cx+heroH*.38,ground,heroH*.92,tf,{pose:"victory",facing:-1});
      family.forEach((id,i)=>{
        const p=actors[id],side=i%2?-1:1,row=Math.floor(i/2),x=cx+side*(heroH*1.05+row*heroH*.42);
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
      const heroX=cx-spread/2+spread*(4/(CAST.length-1)),partnerX=cx-spread/2+spread*(5/(CAST.length-1));
      // Arco de los dos motivos uniendo al dúo protagonista (8 s, en bucle suave).
      const loopK=reduce?.6:((t-duration*.77)/2.2)%1;
      drawSignature(ctx,hero.id,heroX,ground-heroH*1.25,heroH*.55,.35+loopK*.5,1,reduce?0:t*.8);
      drawSignature(ctx,partnerId,partnerX+heroH*.12,ground-heroH*1.1,heroH*.45,.35+((loopK+.5)%1)*.5,-1,reduce?0:-t*.8);
      portrait.forEach((id,i)=>{
        const p=actors[id],x=cx-spread/2+spread*(i/(CAST.length-1))+(id===partnerId?heroH*.12:0),chosen=id===hero.id||id===partnerId;
        const beat=familyFinaleBeat(id,t-duration*.77,{reduced:reduce,chosen});
        actor(p,x,ground+beat.lift,heroH*(id===hero.id?1.05:chosen?.9:.72),tf,{
          facing:x<cx?1:-1,pose:beat.pose,grounded:beat.grounded,
          melee:beat.melee,vx:beat.vx
        });
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
    if(k>=1)revealResults();
    raf=requestAnimationFrame(frame);
  }
  layer.querySelector(".win-skip").onclick=()=>{t0=performance.now()-duration*1000;revealResults();};
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

addEventListener("ohana-constellation-open",()=>{if(running)running.stop(true);});
