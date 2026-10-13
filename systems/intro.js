// ============================================================================
// PROJECT OHANA · Intros (systems/intro.js)
// ----------------------------------------------------------------------------
// playTitleIntro(): V45 COMIC FAMILY WELCOME — escena viva, humor y acción explícita.
// playIntro(kind, name, done, id): cinemática corta al pulsar Empezar /
//   Continuar (~1.8 s, saltable). API compatible con title.js.
// Ambas en canvas, con el mismo kit visual que la cinemática de evolución.
// ============================================================================
import {
  Particles, fullCanvas, loadFonts, reducedMotion, seg, clamp, lerp, easeOut, easeBack, easeInOut,
  drawRays, drawBackdrop, drawRing, drawTitle, rgba, tint, makeDummy, drawDummy, baseHeight,
  FONT_BODY, FONT_DISPLAY,
} from "./evo-cinema.js";
import { ROSTER } from "../characters/roster.js";
import { canonId } from "./save.js";
import { sfx } from "../engine/audio.js";
import { WELCOME_CAST_ORDER, welcomeCastSpot, welcomeActorFit } from "./intro-cast-fit.js";
import { dragonWelcomeBeat, drawDragonWelcomeFX } from "./intro-dragon-stage.js";
import { dinoWelcomeBeat, drawDinoWelcomeFX } from "./intro-dino-stage.js";
import { fritaWelcomeBeat, drawFritaWelcomeFX } from "./intro-frita-stage.js";
import { pizzaWelcomeBeat, drawPizzaWelcomeFX } from "./intro-pizza-stage.js";
import { yomiWelcomeBeat, drawYomiWelcomeFX } from "./intro-yomi-stage.js";
import { cuernoWelcomeBeat, drawCuernoWelcomeFX } from "./intro-cuerno-stage.js";
import { kiloWelcomeBeat, drawKiloWelcomeFX } from "./intro-kilo-stage.js";
import { stitchoWelcomeBeat, drawStitchoWelcomeFX } from "./intro-stitcho-stage.js";
import { chispinWelcomeBeat, drawChispinWelcomeFX } from "./intro-chispin-stage.js";
import { michiWelcomeBeat, drawMichiWelcomeFX } from "./intro-michi-stage.js";

const CYAN = "#7ee7ff", GOLD = "#ffe66a", PINK = "#ff6aa8";

/** Iris: recorta un círculo creciente para descubrir lo que hay debajo. */
function iris(ctx, W, H, cx, cy, k) {
  if (k <= 0) return;
  const r = Math.hypot(W, H) * 0.62 * easeInOut(k);
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const g = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, Math.max(1, r));
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Intro de portada
// ---------------------------------------------------------------------------
export function playTitleIntro() {
  const el = document.getElementById("ohana-intro");
  const finishClasses = () => {
    document.body.classList.remove("intro-playing", "intro-pending");
    document.body.classList.add("intro-complete");
    el?.classList.remove("show");
    el?.setAttribute("aria-hidden", "true");
  };
  if (!el) {
    document.body.classList.remove("intro-pending");
    document.body.classList.add("intro-complete");
    return;
  }
  if (el._played) return;
  el._played = true;
  el.innerHTML =
    '<canvas aria-hidden="true"></canvas>' +
    '<div class="oi-welcome" aria-hidden="true"><span>PROJECT OHANA · ISLA HOKU</span><strong>OHANA</strong><small>La familia ya está aquí. Y tiene ganas de jugar.</small></div>' +
    '<button class="oi-enter" type="button">ENTRAR EN HOKU ↗</button>';
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "Escena de bienvenida de Isla Hoku");
  el.setAttribute("aria-hidden", "false");
  el.classList.add("show", "family-welcome");
  document.body.classList.add("intro-playing");

  const fc = fullCanvas(el.querySelector("canvas"));
  const ctx = fc.ctx;
  const reduce = reducedMotion();
  const isE2E = new URLSearchParams(location.search).has("e2e");
  let frozenSceneTime = null;
  if(isE2E)window.__OHANA_WELCOME_SET_FRAME = at => {
    frozenSceneTime = Number.isFinite(at) ? Math.max(0,at) : null;
  };
  const CAST = WELCOME_CAST_ORDER;
  const actors = Object.fromEntries(CAST.map((id) => {
    const def = ROSTER.find((r) => r.id === id) || ROSTER[0];
    const player = makeDummy(id, 0, def.color);
    if(id==="dragon"||id==="dino"||id==="frita"||id==="pizza"||id==="yomi"||id==="cuerno"||id==="kilo"||id==="stitcho"||id==="chispin"||id==="cat")player._introForceCanvas=true;
    return [id, player];
  }));
  el.dataset.v45Cast = String(CAST.length);
  el.dataset.openingMode = "family-welcome";
  el.dataset.openingFit = "measured-silhouettes";

  // The real active Canvas renderer supplies optical bounds once per opening.
  // New wings, horns and artwork cannot silently unbalance the ten-character cast.
  function measureCastArtwork() {
    const cv = document.createElement("canvas");
    cv.width = 320; cv.height = 320;
    const probe = cv.getContext("2d", { willReadFrequently: true });
    const result = {};
    if (!probe) return result;
    for (const id of CAST) {
      try {
        probe.setTransform(1, 0, 0, 1, 0, 0);
        probe.clearRect(0, 0, 320, 320);
        const def = ROSTER.find(r => r.id === id);
        const subject = makeDummy(id, 0, def?.forms?.[0]?.color || def?.color);
        subject._poseOverride = "idle";
        if(id==="dragon"||id==="dino"||id==="frita"||id==="pizza"||id==="yomi"||id==="cuerno"||id==="kilo"||id==="stitcho"||id==="chispin"||id==="cat")subject._introForceCanvas=true;
        subject.grounded = true;
        probe.save();
        probe.translate(160, 260);
        drawDummy(probe, subject, 0, 0, 1, 24);
        probe.restore();
        const data = probe.getImageData(0, 0, 320, 320).data;
        let x0 = 320, x1 = -1, y0 = 320, y1 = -1;
        for (let y = 0; y < 320; y++) for (let x = 0; x < 320; x++) {
          if (data[(y * 320 + x) * 4 + 3] < 110) continue;
          x0 = Math.min(x0, x); x1 = Math.max(x1, x);
          y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        }
        if (x1 >= x0 && y1 >= y0) {
          result[id] = {width:x1-x0+1,height:y1-y0+1,
            centerOffsetX:(x0+x1)/2-160};
        }
      } catch (_) {
        // When pixel readback is blocked, deterministic fallback bounds
        // still allow the welcome to render without a blank scene.
      }
    }
    return result;
  }
  const opticalBounds = measureCastArtwork();
  el.dataset.openingMeasured = String(Object.keys(opticalBounds).length);
  // Browser acceptance can audit every cast member without probing a screenshot
  // or relying on animation timing. Production never exports this debug data.
  if (isE2E) {
    const welcomeL = layout();
    window.__OHANA_WELCOME_CAST_AUDIT = CAST.map(id => {
      const slot = welcomeCastSpot(id,welcomeL.W,welcomeL.floor,welcomeL.heroH);
      const fit = welcomeActorFit(opticalBounds[id],welcomeL.heroH,slot.slotWidth);
      return {id,x:slot.x,foot:slot.foot,row:slot.row,slotWidth:slot.slotWidth,
        measured:!!opticalBounds[id],paintedHeight:fit.paintedHeight,
        paintedWidth:fit.paintedWidth,targetHeight:welcomeL.heroH};
    });
  }
  let raf = 0, t0 = 0, last = 0, lastPaint = 0, ready = false, done = false;

  function layout() {
    const W = fc.W, H = fc.H;
    return {
      W, H,
      floor: H * 0.80,
      heroH: W < 760
        ? clamp(Math.min(W * .16, H * .10), 30, 76)
        : clamp(Math.min(W * .105, H * .145), 44, 112),
    };
  }

  function actor(id, x, footY, h, tf, opts = {}) {
    const p = actors[id];
    if (!p) return;
    p.facing = opts.facing || 1;
    p.grounded = opts.grounded !== false;
    p.vx = Number(opts.vx || 0);
    p.vy = Number(opts.vy || 0);
    p.melee = Number(opts.melee || 0);
    p._poseOverride = opts.pose || "idle";
    // Stage-only gesture data. Never touches save state, combat or physics.
    p._introDragon = id === "dragon" ? (opts.dragonWelcome || null) : null;
    p._introDino = id === "dino" ? (opts.dinoWelcome || null) : null;
    p._introFrita = id === "frita" ? (opts.fritaWelcome || null) : null;
    p._introPizza = id === "pizza" ? (opts.pizzaWelcome || null) : null;
    p._introYomi = id === "yomi" ? (opts.yomiWelcome || null) : null;
    p._introCuerno = id === "cuerno" ? (opts.cuernoWelcome || null) : null;
    p._introKilo = id === "kilo" ? (opts.kiloWelcome || null) : null;
    p._introStitcho = id === "stitcho" ? (opts.stitchoWelcome || null) : null;
    p._introChispin = id === "chispin" ? (opts.chispinWelcome || null) : null;
    p._introMichi = id === "cat" ? (opts.michiWelcome || null) : null;
    const slotWidth = fc.W / (fc.W < 760 ? 5 : 10);
    const fit = welcomeActorFit(opticalBounds[id], h, slotWidth);
    ctx.save();
    ctx.translate(x - fit.centerOffsetX * fit.scale, footY);
    if (opts.alpha !== undefined) ctx.globalAlpha *= clamp(opts.alpha, 0, 1);
    if (opts.rotate) ctx.rotate(opts.rotate);
    drawDummy(ctx, p, 0, 0, fit.scale, tf);
    ctx.restore();
    // Labels travel with the character during comic beats.
    const def = ROSTER.find(r => r.id === id);
    ctx.save();
    ctx.globalAlpha = opts.alpha === undefined ? .82 : clamp(opts.alpha,0,1)*.82;
    ctx.fillStyle = "#fff2d3";
    ctx.shadowColor = "rgba(0,0,0,.72)";
    ctx.shadowBlur = 5;
    ctx.font = "700 " + (fc.W < 760 ? 9 : 11) + "px Outfit,system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(def?.name || id, x, footY + 12, slotWidth * .86);
    ctx.restore();
  }

  function bolt(x1,y1,x2,y2,k) {
    if (k <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,232,86," + (0.3 + k * 0.7) + ")";
    ctx.shadowColor = "#ffe85a";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i=0;i<=7;i++) {
      const u=i/7, x=lerp(x1,x2,u);
      const y=lerp(y1,y2,u)+(i>0&&i<7?Math.sin(i*9.7)*6*k:0);
      if (!i) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function rainbow(x,y,r,k) {
    if (k <= 0) return;
    const cols=["#ff7aa8","#ffd36a","#7ee7ff","#b78bff"];
    ctx.save();
    ctx.globalAlpha=.72*k;
    ctx.lineCap="round";
    cols.forEach((col,i)=>{
      ctx.strokeStyle=col;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(x,y,r+i*5,Math.PI*1.08,Math.PI*1.92);ctx.stroke();
    });
    ctx.restore();
  }


  let bubbleBoxes = [];
  function comicBubble(text,x,y,k=1,accent="#fff6c8",tail="left") {
    if (k <= 0.02) return;
    ctx.save();
    ctx.globalAlpha=clamp(k,0,1);
    const fs=clamp(fc.W/38,9,12);
    ctx.font="800 "+fs+"px Outfit,system-ui,sans-serif";
    const padX=11,h=clamp(fs*2.5,25,32);
    const w=Math.min(fc.W-24,Math.max(48,ctx.measureText(text).width+padX*2));
    const bx=clamp(x-w/2,12,Math.max(12,fc.W-w-12)),r=11;
    let by=clamp(y-h,12,Math.max(12,fc.H-h-18));
    // Collision avoidance applies to each comic frame, including phone widths.
    for(let attempt=0;attempt<5;attempt++){
      const overlap=bubbleBoxes.some(b=>bx < b.x+b.w+4 && bx+w+4>b.x && by < b.y+b.h+7 && by+h+7>b.y);
      if(!overlap)break;
      by=Math.max(12,by-h-12);
    }
    bubbleBoxes.push({x:bx,y:by,w,h});
    ctx.fillStyle="rgba(255,252,238,.96)";
    ctx.strokeStyle=accent;ctx.lineWidth=2.2;
    ctx.shadowColor="rgba(0,0,0,.28)";ctx.shadowBlur=12;
    ctx.beginPath();
    ctx.moveTo(bx+r,by);ctx.lineTo(bx+w-r,by);ctx.quadraticCurveTo(bx+w,by,bx+w,by+r);
    ctx.lineTo(bx+w,by+h-r);ctx.quadraticCurveTo(bx+w,by+h,bx+w-r,by+h);
    ctx.lineTo(bx+r,by+h);ctx.quadraticCurveTo(bx,by+h,bx,by+h-r);
    ctx.lineTo(bx,by+r);ctx.quadraticCurveTo(bx,by,bx+r,by);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;
    const tx=tail==="right"?bx+w*.72:bx+w*.28;
    ctx.fillStyle="rgba(255,252,238,.96)";ctx.strokeStyle=accent;
    ctx.beginPath();ctx.moveTo(tx-6,by+h-1);ctx.lineTo(tx+4,by+h-1);ctx.lineTo(tx+(tail==="right"?12:-12),by+h+11);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle="#15202a";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(text,bx+w/2,by+h/2+1,w-12);
    ctx.restore();
  }

  function island(t,L) {
    const {W,H,floor}=L;
    const horizon=H*.70;
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,"#15364a");
    sky.addColorStop(.46,"#285d6a");
    sky.addColorStop(.72,"#cf9d65");
    sky.addColorStop(1,"#07131b");
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

    const sunX=W*.76, sunY=H*.23, sr=Math.min(W,H)*.075;
    const sg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,sr*3.8);
    sg.addColorStop(0,"rgba(255,237,174,.74)");
    sg.addColorStop(.28,"rgba(255,208,126,.22)");
    sg.addColorStop(1,"rgba(255,195,110,0)");
    ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);

    ctx.fillStyle="#091e25";
    ctx.beginPath();
    ctx.moveTo(0,floor+10);ctx.lineTo(0,horizon+20);
    ctx.quadraticCurveTo(W*.12,horizon-24,W*.25,horizon+14);
    ctx.quadraticCurveTo(W*.39,horizon+38,W*.52,horizon-4);
    ctx.quadraticCurveTo(W*.67,horizon-34,W*.82,horizon+10);
    ctx.quadraticCurveTo(W*.92,horizon+26,W,horizon-2);
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();

    ctx.globalAlpha=.17;
    ctx.strokeStyle="#9be7ee";ctx.lineWidth=1.6;
    for(let i=0;i<6;i++){
      const yy=horizon+18+i*18;
      const off=((t*(12+i*2))%(W+180))-90;
      ctx.beginPath();ctx.moveTo(off,yy);ctx.lineTo(off+110,yy);ctx.stroke();
    }
    ctx.globalAlpha=1;

    const grass=ctx.createLinearGradient(0,floor-20,0,H);
    grass.addColorStop(0,"rgba(35,82,60,.82)");
    grass.addColorStop(1,"rgba(7,20,19,.98)");
    ctx.fillStyle=grass;ctx.fillRect(0,floor-8,W,H-floor+8);
  }

  function scene(t,L) {
    const {W,floor,heroH}=L;
    const spots = Object.fromEntries(CAST.map(id => [id, welcomeCastSpot(id,W,floor,heroH)]));
    const {dino,dragon,kilo,stitcho,chispin,cat,frita,pizza,yomi,cuerno}=spots;
    const tf=t*60;
    const loop=t%14;
    bubbleBoxes = [];

    // V350: Kilo plays an actual connected five-form body/ukulele rig.
    // Pollination, laughter and surprise are its own fully timed story.
    const kiloBeat=kiloWelcomeBeat(loop,reduce);
    const kiloHeight=heroH*1.08;
    drawKiloWelcomeFX(ctx,kilo.x,kilo.foot,kiloHeight,t,kiloBeat,"back");
    actor("kilo",kilo.x,kilo.foot,kiloHeight,tf,{
      facing:1,pose:"idle",kiloWelcome:kiloBeat
    });
    drawKiloWelcomeFX(ctx,kilo.x,kilo.foot,kiloHeight,t,kiloBeat,"front");
    if(isE2E){
      el.dataset.kiloWelcomePhase=kiloBeat.phase;
      el.dataset.kiloWelcomeMotion=reduce?"reduced":"full";
      el.dataset.kiloFamilyReaction=kiloBeat.dino>.2?"dino":
        kiloBeat.yomi>.2?"yomi":kiloBeat.chase>.2?"chase":
        kiloBeat.dragon>.2?"dragon":"rest";
    }
    if(kiloBeat.listen>.45){
      comicBubble("¿LO OYES?",kilo.x,kilo.foot-heroH*1.04,
        kiloBeat.listen,"#e4f6be","right");
    }else if(kiloBeat.strum>.45){
      comicBubble("¡MÚSICA!",kilo.x,kilo.foot-heroH*1.05,
        kiloBeat.strum,"#ffecaa","right");
    }else if(kiloBeat.bloom>.46){
      comicBubble("¡FLORECEMOS!",kilo.x,kilo.foot-heroH*1.08,
        kiloBeat.bloom,"#b8edc9","right");
    }else if(kiloBeat.surprise>.46){
      comicBubble("¡ACHÍS DE POLEN!",kilo.x,kilo.foot-heroH*1.07,
        kiloBeat.surprise,"#f6d0cc","right");
    }else if(kiloBeat.finale>.46){
      comicBubble("¡OTRA!",kilo.x,kilo.foot-heroH*1.06,
        kiloBeat.finale,"#ffe6ac","right");
    }

    // V351: Stitcho acts with its original living-egg-to-cosmic five-form rig.
    // Chispín remains independently animated for its own future art pass.
    const duel=Math.sin(clamp(seg(loop,.35,1.25),0,1)*Math.PI);
    const zap=Math.sin(clamp(seg(loop,1.72,2.28),0,1)*Math.PI);
    const sx=stitcho.x-W*.007*duel,cxp=chispin.x+W*.007*duel;
    const stitchoBeat=stitchoWelcomeBeat(loop,reduce);
    const stitchoHeight=heroH;
    drawStitchoWelcomeFX(ctx,sx,stitcho.foot+2,stitchoHeight,t,stitchoBeat,"back");
    actor("stitcho",sx,stitcho.foot+2,stitchoHeight,tf,{
      facing:1,pose:"idle",stitchoWelcome:stitchoBeat,rotate:-stitchoBeat.shock*.045
    });
    drawStitchoWelcomeFX(ctx,sx,stitcho.foot+2,stitchoHeight,t,stitchoBeat,"front");
    if(isE2E){
      el.dataset.stitchoWelcomePhase=stitchoBeat.phase;
      el.dataset.stitchoWelcomeMotion=reduce?"reduced":"full";
      el.dataset.stitchoFamilyReaction=stitchoBeat.dino>.2?"dino":
        stitchoBeat.yomi>.2?"yomi":stitchoBeat.chase>.2?"chase":
        stitchoBeat.dragon>.2?"dragon":"rest";
    }
    // V352 Chispin reacts THROUGH its living spring-tail and gill rig,
    // complementing Stitcho's independent comedy rather than attacking.
    const chispinBeat=chispinWelcomeBeat(loop,reduce);
    const chispinHeight=heroH*.96;
    drawChispinWelcomeFX(ctx,cxp,chispin.foot+1,chispinHeight,t,chispinBeat,"back");
    actor("chispin",cxp,chispin.foot+1,chispinHeight,tf,{
      facing:-1,pose:"idle",chispinWelcome:chispinBeat
    });
    drawChispinWelcomeFX(ctx,cxp,chispin.foot+1,chispinHeight,t,chispinBeat,"front");
    if(isE2E){
      el.dataset.chispinWelcomePhase=chispinBeat.phase;
      el.dataset.chispinWelcomeMotion=reduce?"reduced":"full";
      el.dataset.chispinFamilyReaction=chispinBeat.dino>.2?"dino":
        chispinBeat.yomi>.2?"yomi":chispinBeat.chase>.2?"chase":
        chispinBeat.dragon>.2?"dragon":"rest";
    }
    if(chispinBeat.sniff>.48){
      comicBubble("¿CHISPA?",cxp,chispin.foot-heroH*1.04,chispinBeat.sniff,"#fff2bf","left");
    }else if(chispinBeat.prank>.48){
      comicBubble("¡JA, JA!",cxp,chispin.foot-heroH*1.03,chispinBeat.prank,"#f3c0ff","left");
    }else if(chispinBeat.charge>.48){
      comicBubble("¡ESTORNUDO!",cxp,chispin.foot-heroH*1.08,chispinBeat.charge,"#ffe6b3","left");
    }else if(chispinBeat.cloud>.48){
      comicBubble("¿MI NUBE?",cxp,chispin.foot-heroH*1.06,chispinBeat.cloud,"#e8d8ff","left");
    }
    if(stitchoBeat.scout>.48){
      comicBubble("¿LISTO?",sx,stitcho.foot-heroH*1.08,stitchoBeat.scout,"#a5f2ff","right");
    }else if(stitchoBeat.taunt>.48){
      comicBubble("¡TE PILLO!",sx,stitcho.foot-heroH*1.10,stitchoBeat.taunt,"#c1a5ff","right");
    }else if(stitchoBeat.curl>.48){
      comicBubble("¡PLAN B!",sx,stitcho.foot-heroH*1.08,stitchoBeat.curl,"#bedaff","right");
    }
    bolt(cxp-W*.012,chispin.foot-heroH*.50,sx+W*.014,stitcho.foot-heroH*.49,zap);
    if(stitchoBeat.shock>.43){
      comicBubble("¿EN SERIO?",sx,stitcho.foot-heroH*1.04,stitchoBeat.shock,"#ffe5b6","right");
    }else if(stitchoBeat.swagger>.48){
      comicBubble("¡CALCULADO!",sx,stitcho.foot-heroH*1.09,stitchoBeat.swagger,"#d7bafa","right");
    }
    if(chispinBeat.hiccup>.39)
      comicBubble("UPS.",cxp,chispin.foot-heroH*.95,chispinBeat.hiccup,"#7ee7ff","left");

    // V353: Michi watches the family's mayhem and judges everyone with
    // five connected acts in her real kitten/cloud/moon/guardian anatomy.
    const catFace=loop>3.0&&loop<4.2?-1:1;
    const michiBeat=michiWelcomeBeat(loop,reduce);
    const michiHeight=heroH*.96;
    drawMichiWelcomeFX(ctx,cat.x,cat.foot+3,michiHeight,t,michiBeat,"back");
    actor("cat",cat.x,cat.foot+3,michiHeight,tf,{
      facing:catFace,pose:"idle",michiWelcome:michiBeat
    });
    drawMichiWelcomeFX(ctx,cat.x,cat.foot+3,michiHeight,t,michiBeat,"front");
    if(isE2E){
      el.dataset.michiWelcomePhase=michiBeat.phase;
      el.dataset.michiWelcomeMotion=reduce?"reduced":"full";
      el.dataset.michiFamilyReaction=michiBeat.dino>.2?"dino":
        michiBeat.yomi>.2?"yomi":michiBeat.chase>.2?"chase":
        michiBeat.spark>.2?"spark":michiBeat.melody>.2?"melody":"rest";
    }
    if(michiBeat.inspect>.48){
      comicBubble("¿QUÉ HACÉIS?",cat.x,cat.foot-heroH*1.08,michiBeat.inspect,"#ffe2ed","left");
    }else if(michiBeat.sideeye>.48){
      comicBubble("YO NO FUI.",cat.x,cat.foot-heroH*1.06,michiBeat.sideeye,"#ffb6e4","left");
    }else if(michiBeat.groom>.48){
      comicBubble("ME ACICALO.",cat.x,cat.foot-heroH*1.09,michiBeat.groom,"#ffe1f3","left");
    }else if(michiBeat.flick>.48){
      comicBubble("NI ME MIRES.",cat.x,cat.foot-heroH*1.08,michiBeat.flick,"#e6c6ff","left");
    }else if(michiBeat.purr>.48){
      comicBubble("PERO SOIS MÍOS.",cat.x,cat.foot-heroH*1.08,michiBeat.purr,"#ffe9b3","left");
    }

    // V344 · Dragón's entire 14-second story is independently directed:
    // quiet living silhouette → proud inhale → tiny sneeze → recoil → grin.
    // Never hijack global abilities, movement or the other nine actors.
    const dragonBeat=dragonWelcomeBeat(loop,reduce);
    const dragonHeight=heroH*1.10;
    drawDragonWelcomeFX(ctx,dragon.x,dragon.foot+1,dragonHeight,t,dragonBeat,"back");
    actor("dragon",dragon.x,dragon.foot+1,dragonHeight,tf,{
      facing:1,pose:"idle",dragonWelcome:dragonBeat
    });
    drawDragonWelcomeFX(ctx,dragon.x,dragon.foot+1,dragonHeight,t,dragonBeat,"front");
    if(isE2E){
      el.dataset.dragonWelcomePhase=dragonBeat.phase;
      el.dataset.dragonWelcomeMotion=reduce?"reduced":"full";
      el.dataset.dragonFamilyReaction=dragonBeat.dino>.2?"dino":
        dragonBeat.ghost>.2?"ghost":dragonBeat.chase>.2?"chase":"rest";
    }
    if(dragonBeat.sneeze>.20){
      comicBubble("¡ACHÍS!",dragon.x+heroH*.18,dragon.foot-heroH*.98,
        dragonBeat.sneeze,"#ff8a45","left");
    }else if(dragonBeat.proud>.36){
      comicBubble("¡LO TENÍA!",dragon.x,dragon.foot-heroH*1.06,
        dragonBeat.proud,"#ffc46b","left");
    }
    if(dragonBeat.recoil>.30){
      comicBubble("...",cat.x,cat.foot-heroH*.72,
        dragonBeat.recoil*.85,"#ffb6e4","right");
    }

    // V346 · Frita stars in the chase, not merely a running icon. Pizza's
    // running/jumping choreography remains intact for the next art pass.
    const chase=seg(loop,4.25,7.15);
    const fritaBeat=fritaWelcomeBeat(loop,reduce);
    const fritaHeight=heroH*1.06;
    let fritaX=frita.x,fritaY=frita.foot+3;
    let fritaPose="idle",fritaVelocity=0,fritaFacing=-1;
    const pizzaBeat=pizzaWelcomeBeat(loop,reduce);
    const pizzaHeight=heroH*1.02;
    let pizzaX=pizza.x,pizzaY=pizza.foot+2,pizzaPose="idle";
    let pizzaFacing=-1,pizzaVelocity=0,pizzaGrounded=true;
    if(chase>0&&chase<1){
      const x=lerp(W*.08,W*.92,easeInOut(chase));
      const y=floor-12-Math.abs(Math.sin(chase*Math.PI*6))*20;
      ctx.fillStyle="#e9bd55";ctx.strokeStyle="#704b21";ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(x,y,10,7,chase*9,0,Math.PI*2);ctx.fill();ctx.stroke();
      fritaX=x-48;fritaY=frita.foot+3;
      fritaPose=fritaBeat.phase==="wobble"?"idle":"run";
      fritaVelocity=6;fritaFacing=1;
      pizzaX=x-105;
      pizzaY=pizza.foot-Math.abs(Math.sin(chase*Math.PI*5))*20;
      pizzaPose="jump";pizzaFacing=1;pizzaVelocity=5;pizzaGrounded=false;
      if(chase>.12&&chase<.78){
        comicBubble("¡MÍA!",x-52,floor-heroH*.78,Math.sin(chase*Math.PI),"#fff1b3","right");
        if(chase>.34)comicBubble("¡NI HABLAR!",x-110,floor-heroH*.95,
          Math.sin(chase*Math.PI),"#ffd84a","left");
      }
    }
    // Pizza keeps the shared chase and now has a complete independent
    // elastic-performance director, using the canonical dough/crust rig.
    drawPizzaWelcomeFX(ctx,pizzaX,pizzaY,pizzaHeight,t,pizzaBeat,"back");
    actor("pizza",pizzaX,pizzaY,pizzaHeight,tf,{
      facing:pizzaFacing,vx:pizzaVelocity,grounded:pizzaGrounded,
      vy:pizzaGrounded?0:-2,pose:pizzaPose,pizzaWelcome:pizzaBeat
    });
    drawPizzaWelcomeFX(ctx,pizzaX,pizzaY,pizzaHeight,t,pizzaBeat,"front");
    if(isE2E){
      el.dataset.pizzaWelcomePhase=pizzaBeat.phase;
      el.dataset.pizzaWelcomeMotion=reduce?"reduced":"full";
      el.dataset.pizzaFamilyReaction=pizzaBeat.dino>.2?"dino":
        pizzaBeat.spark>.2?"spark":pizzaBeat.melody>.2?"melody":"rest";
    }
    if(pizzaBeat.sniff>.45){
      comicBubble("¿HUELO QUESO?",pizzaX-heroH*.09,pizzaY-heroH*.98,
        pizzaBeat.sniff,"#ffe0ab","left");
    }else if(pizzaBeat.stretch>.45){
      comicBubble("¡ES MÍO!",pizzaX-heroH*.07,pizzaY-heroH*1.0,
        pizzaBeat.stretch,"#ffe4a2","left");
    }else if(pizzaBeat.catch>.45){
      comicBubble("¡PILLADO!",pizzaX-heroH*.05,pizzaY-heroH*.98,
        pizzaBeat.catch,"#ffc48e","left");
    }else if(pizzaBeat.flourish>.45){
      comicBubble("¡SOY DELICIOSO!",pizzaX-heroH*.09,pizzaY-heroH*1.0,
        pizzaBeat.flourish,"#ffda9e","left");
    }
    drawFritaWelcomeFX(ctx,fritaX,fritaY,fritaHeight,t,fritaBeat,"back");
    actor("frita",fritaX,fritaY,fritaHeight,tf,{
      facing:fritaFacing,vx:fritaVelocity,pose:fritaPose,fritaWelcome:fritaBeat
    });
    drawFritaWelcomeFX(ctx,fritaX,fritaY,fritaHeight,t,fritaBeat,"front");
    if(isE2E){
      el.dataset.fritaWelcomePhase=fritaBeat.phase;
      el.dataset.fritaWelcomeMotion=reduce?"reduced":"full";
      el.dataset.fritaFamilyReaction=fritaBeat.spirit>.2?"spirit":
        fritaBeat.fire>.2?"fire":fritaBeat.music>.2?"music":"rest";
    }
    if(fritaBeat.ready>.45){
      comicBubble("¡A COCINAR!",fritaX+heroH*.07,fritaY-heroH*1.0,
        fritaBeat.ready,"#ffdd86","right");
    }else if(fritaBeat.reach>.47){
      comicBubble("¡CASI!",fritaX+heroH*.08,fritaY-heroH*1.0,
        fritaBeat.reach,"#ffedb1","right");
    }else if(fritaBeat.wobble>.48){
      comicBubble("¡AY, LA SAL!",fritaX+heroH*.06,fritaY-heroH*1.02,
        fritaBeat.wobble,"#fff3b5","right");
    }else if(fritaBeat.triumph>.45){
      comicBubble("¡BON APPÉTIT!",fritaX+heroH*.06,fritaY-heroH*1.0,
        fritaBeat.triumph,"#ffdc94","right");
    }

    // V348: Yomi remains fully readable THROUGH the entire 14-second loop.
    // The shadow is a local theatrical curtain, never eight seconds of absence.
    const yomiBeat=yomiWelcomeBeat(loop,reduce);
    const yomiHeight=heroH*1.03;
    drawYomiWelcomeFX(ctx,yomi.x,yomi.foot,yomiHeight,t,yomiBeat,"back");
    actor("yomi",yomi.x,yomi.foot,yomiHeight,tf,{
      facing:-1,alpha:1,pose:"idle",yomiWelcome:yomiBeat
    });
    drawYomiWelcomeFX(ctx,yomi.x,yomi.foot,yomiHeight,t,yomiBeat,"front");
    if(isE2E){
      el.dataset.yomiWelcomePhase=yomiBeat.phase;
      el.dataset.yomiWelcomeMotion=reduce?"reduced":"full";
      el.dataset.yomiWelcomeAlwaysVisible="true";
      el.dataset.yomiFamilyReaction=yomiBeat.dino>.2?"dino":
        yomiBeat.spark>.2?"spark":yomiBeat.melody>.2?"melody":"rest";
    }
    if(yomiBeat.listen>.43){
      comicBubble("¿QUIÉN ANDA AHÍ?",yomi.x-yomiHeight*.18,yomi.foot-heroH*1.05,
        yomiBeat.listen,"#ffe3b1","left");
    }else if(yomiBeat.reveal>.43){
      comicBubble("¡BU!",yomi.x-yomiHeight*.13,yomi.foot-heroH*1.03,
        yomiBeat.reveal,"#ffd2d8","left");
    }else if(yomiBeat.startle>.43){
      comicBubble("¡AY, ME ASUSTÉ!",yomi.x-yomiHeight*.13,yomi.foot-heroH*1.05,
        yomiBeat.startle,"#f5d0da","left");
    }else if(yomiBeat.bow>.43){
      comicBubble("ERA BROMA.",yomi.x-yomiHeight*.1,yomi.foot-heroH*1.05,
        yomiBeat.bow,"#ffe7b5","left");
    }

    // V349 · Cuerno is a LIVING HORN at F0, not a tiny generic unicorn.
    // Subsequent forms keep their canonical orb/foal/wings. Stage magic
    // echoes the horn without triggering the actual dream U.
    const cuernoBeat=cuernoWelcomeBeat(loop,reduce);
    const cuernoHeight=heroH*1.06;
    drawCuernoWelcomeFX(ctx,cuerno.x,cuerno.foot+1,cuernoHeight,t,cuernoBeat,"back");
    actor("cuerno",cuerno.x,cuerno.foot+1,cuernoHeight,tf,{
      facing:-1,alpha:1,pose:"idle",cuernoWelcome:cuernoBeat
    });
    drawCuernoWelcomeFX(ctx,cuerno.x,cuerno.foot+1,cuernoHeight,t,cuernoBeat,"front");
    if(isE2E){
      el.dataset.cuernoWelcomePhase=cuernoBeat.phase;
      el.dataset.cuernoWelcomeMotion=reduce?"reduced":"full";
      el.dataset.cuernoFamilyReaction=cuernoBeat.yomi>.2?"yomi":
        cuernoBeat.dragon>.2?"dragon":cuernoBeat.melody>.2?"melody":"rest";
    }
    if(cuernoBeat.wonder>.44){
      comicBubble("¿ESO BRILLA?",cuerno.x,cuerno.foot-heroH*1.03,
        cuernoBeat.wonder,"#edd8ff","right");
    }else if(cuernoBeat.aurora>.44){
      comicBubble("¡MIRA MI LUZ!",cuerno.x,cuerno.foot-heroH*1.06,
        cuernoBeat.aurora,"#e2d9ff","right");
    }else if(cuernoBeat.surprise>.44){
      comicBubble("¡UY!",cuerno.x,cuerno.foot-heroH*1.05,
        cuernoBeat.surprise,"#f5d9ff","right");
    }else if(cuernoBeat.bow>.44){
      comicBubble("PARA TI.",cuerno.x,cuerno.foot-heroH*1.04,
        cuernoBeat.bow,"#d8eeff","right");
    }

    // V345 · Dino deserves his own living scene: curiosity, grounded
    // anticipation, gentle two-foot stomp, surprise and contagious delight.
    // Only Dino receives this stage direction. Dragón V344 is unchanged.
    const dinoBeat=dinoWelcomeBeat(loop,reduce);
    const dinoHeight=heroH*1.08;
    drawDinoWelcomeFX(ctx,dino.x,dino.foot+2,dinoHeight,t,dinoBeat,"back");
    actor("dino",dino.x,dino.foot+2,dinoHeight,tf,{
      facing:1,pose:"idle",dinoWelcome:dinoBeat
    });
    drawDinoWelcomeFX(ctx,dino.x,dino.foot+2,dinoHeight,t,dinoBeat,"front");
    if(isE2E){
      el.dataset.dinoWelcomePhase=dinoBeat.phase;
      el.dataset.dinoWelcomeMotion=reduce?"reduced":"full";
      el.dataset.dinoFamilyReaction=dinoBeat.chase>.2?"chase":
        dinoBeat.dragon>.2?"dragon":dinoBeat.melody>.2?"melody":"rest";
    }
    if(dinoBeat.stomp>.26){
      comicBubble("¡PUM!",dino.x+heroH*.12,dino.foot-heroH*1.0,
        dinoBeat.stomp,"#b8ef6b","right");
    }else if(dinoBeat.startled>.32){
      comicBubble("¿HE SIDO YO?",dino.x+heroH*.12,dino.foot-heroH*1.04,
        dinoBeat.startled,"#fff6c8","right");
    }else if(dinoBeat.delighted>.32){
      comicBubble("¡SOY ENORME!",dino.x+heroH*.12,dino.foot-heroH*1.06,
        dinoBeat.delighted,"#ccf8a2","right");
    }
    // Pequeños puntos de luz para que el claro respire sin parecer una intro de logo.
    ctx.save();ctx.globalCompositeOperation="lighter";
    for(let i=0;i<22;i++){
      const u=(i*0.137+t*.018)%1;
      const x=W*((i*0.073+t*.006*(i%3+1))%1);
      const y=floor-heroH*(.25+u*1.65);
      ctx.globalAlpha=.10+.12*Math.sin(t*1.4+i);
      ctx.fillStyle=i%3?"#ffe5a1":"#9be7ee";
      ctx.beginPath();ctx.arc(x,y,1.5+(i%4)*.45,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function frame(now){
    if(done) return;
    if(!t0){t0=now;last=now;}
    last=now;
    const t=(now-t0)/1000;
    // The entry is actionable after the first meaningful frame, not a
    // mandatory one-second wait.
    if(!ready&&t>=0.16){ready=true;el.classList.add("ready");}
    if(lastPaint && now-lastPaint<33){raf=requestAnimationFrame(frame);return;}
    lastPaint=now;
    const L=layout();
    ctx.save();ctx.clearRect(0,0,L.W,L.H);
    island(t,L);
    scene(reduce?0.7:(frozenSceneTime ?? t),L);
    const vign=ctx.createRadialGradient(L.W*.5,L.H*.46,Math.min(L.W,L.H)*.12,L.W*.5,L.H*.46,Math.hypot(L.W,L.H)*.63);
    vign.addColorStop(0,"rgba(0,0,0,0)");vign.addColorStop(1,"rgba(0,0,0,.52)");
    ctx.fillStyle=vign;ctx.fillRect(0,0,L.W,L.H);
    ctx.restore();
    raf=requestAnimationFrame(frame);
  }

  function enter(e){
    if(done||!ready) return;
    if(e?.type==="keydown"&&!["Enter"," ","Escape"].includes(e.key)) return;
    if(e?.type==="keydown"){e.preventDefault();e.stopPropagation();}
    done=true;
    cancelAnimationFrame(raf);
    removeEventListener("resize",onResize);
    removeEventListener("keydown",enter,true);
    el.removeEventListener("pointerdown",enter);
    if(isE2E)delete window.__OHANA_WELCOME_SET_FRAME;
    finishClasses();
    el.remove();
  }

  function onResize(){fc.resize();}
  addEventListener("resize",onResize);
  addEventListener("keydown",enter,true);
  el.addEventListener("pointerdown",enter);
  el.querySelector(".oi-enter")?.addEventListener("click",enter);
  loadFonts();
  raf=requestAnimationFrame(frame);
}

// ---------------------------------------------------------------------------
// Cinemática corta al empezar (Empezar / Continuar)
// ---------------------------------------------------------------------------
export function playIntro(kind, name, done, id) {
  let el = document.getElementById("start-intro");
  if (!el) {
    el = document.createElement("div");
    el.id = "start-intro";
    el.innerHTML = '<canvas aria-hidden="true"></canvas><p class="intro-sr"></p>';
    document.body.appendChild(el);
  }
  const fc = el._fc || (el._fc = fullCanvas(el.querySelector("canvas")));
  fc.resize();
  const ctx = fc.ctx;
  const reduce = reducedMotion();
  const def = ROSTER.find((r) => r.id === id) || ROSTER.find((r) => r.forms && r.forms[0] && r.forms[0].name === name) || ROSTER[0];
  sfx("start");
  let evo = 0;
  if (kind === "resume") {
    try {
      const sv = JSON.parse(localStorage.getItem("ohana") || "null");
      if (sv && canonId(sv.id) === def.id) evo = clamp(Number(sv.evo) || 0, 0, 4);
    } catch (_) {}
  }
  const form = (def.forms && def.forms[evo]) || def;
  const color = form.color || def.color || CYAN;
  const light = tint(color, 0.55);
  const p = makeDummy(def.id, evo, color);
  p._poseOverride = "victory";
  const parts = new Particles();
  const title = String(form.name || name || "Ohana");
  const kicker = kind === "resume" ? "CONTINUAR" : "NUEVA PARTIDA";
  const sub = kind === "resume" ? "Se recupera tu forma y tu sala" : "Empiezas como bebé · Rumbo al Claro";
  el.querySelector(".intro-sr").textContent = kicker + ": " + title + ". " + sub;
  const T = reduce ? { in: 0.07, out: 0.14, end: 0.24 } : { in: 0.14, out: 0.31, end: 0.46 };

  let t0 = 0, last = 0, raf = 0, skip = false, finished = false, burst = false, started = false;
  function startGame() {
    if (started) return;
    started = true;
    try { if (done) done(); } catch (err) {}
  }

  function frame(now) {
    try {
    if (!t0) { t0 = now; last = now; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let t = (now - t0) / 1000;
    if (skip && t < T.out) { t0 -= (T.out - t) * 1000; t = T.out; }
    const W = fc.W, H = fc.H, cx = W / 2;
    const portrait = H > W * 1.1;
    const target = Math.min(H * (portrait ? 0.3 : 0.36), W * 0.5);
    const cy = H * 0.4;
    const footY = cy + target * 0.5;
    const outK = seg(t, T.out, T.end);
    const fade = 1 - easeInOut(outK);
    if (outK > 0) startGame();
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    const inK = easeOut(seg(t, 0, 0.3));
    drawBackdrop(ctx, W, H, cx, cy, color, inK * fade, 0.7 * inK * fade);
    // cortinillas diagonales
    if (!reduce) {
      const wk = easeInOut(seg(t, 0, 0.45));
      ctx.save();
      ctx.globalAlpha = 0.18 * (1 - seg(t, 0.4, 0.9));
      ctx.fillStyle = light;
      ctx.translate(lerp(-W, W * 1.2, wk), 0);
      ctx.transform(1, 0, -0.35, 1, 0, 0);
      ctx.fillRect(0, 0, W * 0.18, H);
      ctx.restore();
    }
    drawRays(ctx, cx, cy, Math.hypot(W, H) * 0.7, color, 0.5 * inK * fade, reduce ? 0 : t * 0.35, 14);
    // personaje: cae y aterriza con onda
    const drop = reduce ? 1 : easeBack(seg(t, 0.12, T.in));
    const land = seg(t, T.in - 0.05, T.in + 0.5);
    if (!burst && t >= T.in - 0.05) {
      burst = true;
      if (!reduce) {
        for (let i = 0; i < 36; i++) {
          const a = -Math.PI * (0.05 + Math.random() * 0.9), sp = 200 + Math.random() * 500;
          parts.add({ x: cx, y: footY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 600, drag: 0.97, max: 0.7 + Math.random() * 0.6,
            size: i % 2 ? 3 + Math.random() * 5 : 2, kind: i % 2 ? "star" : "dot", rot: Math.random() * 6, vr: 5,
            color: [color, light, "#ffffff"][i % 3] });
        }
      }
    }
    if (!reduce) drawRing(ctx, cx, footY, target * 1.3, land, light, target * 0.04, 0.22);
    const scale = target / baseHeight(def.id, evo);
    const yOff = (1 - drop) * -H * 0.5;
    const hg = ctx.createRadialGradient(cx, footY, 0, cx, footY, target * 0.6);
    hg.addColorStop(0, rgba(color, 0.45 * inK * fade)); hg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.ellipse(cx, footY, target * 0.6, target * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    p._evoT = seg(t, T.in, T.out);
    ctx.save();
    ctx.globalAlpha = seg(t, 0.1, 0.25) * fade;
    drawDummy(ctx, p, cx, footY + yOff, scale * (1 + 0.1 * outK), t * 60);
    ctx.restore();
    parts.update(dt);
    ctx.save(); ctx.globalAlpha = fade; parts.draw(ctx); ctx.restore();
    // textos
    const tk = reduce ? 1 : seg(t, T.in - 0.1, T.in + 0.3);
    if (tk > 0) {
      const size = clamp(Math.min(W * (portrait ? 0.1 : 0.065), H * 0.085), 28, 88);
      const ty = footY + target * 0.1 + size * 1.05;
      ctx.save();
      ctx.globalAlpha = clamp(tk * 1.5, 0, 1) * fade;
      drawTitle(ctx, kicker, cx, ty - size * 0.8, Math.max(12, size * 0.26), tint(color, 0.6),
        { font: FONT_BODY, weight: 800, spacing: "0.34em", stroke: false, glow: color });
      ctx.save();
      ctx.translate(cx, ty);
      const s = lerp(1.35, 1, easeBack(tk));
      ctx.scale(s, s);
      drawTitle(ctx, title, 0, 0, size, ["#ffffff", light, color], { glow: rgba(color, 0.9), maxWidth: W * 0.9 / s });
      ctx.restore();
      ctx.globalAlpha = seg(t, T.in + 0.15, T.in + 0.5) * fade + (reduce ? fade : 0);
      drawTitle(ctx, sub, cx, ty + size * 0.8, Math.max(13, size * 0.24), GOLD, { font: FONT_BODY, weight: 700, stroke: false, maxWidth: W * 0.9 });
      ctx.restore();
    }
    ctx.restore();
    if (t >= T.end) { finish(); return; }
    raf = requestAnimationFrame(frame);
    } catch (err) { startGame(); finish(); }
  }

  function onSkip(e) {
    if (e.type === "keydown") {
      if (!["Enter", " ", "Escape"].includes(e.key)) return;
      e.preventDefault();
    }
    skip = true;
  }
  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    el.removeEventListener("pointerdown", onSkip);
    removeEventListener("keydown", onSkip);
    ctx.setTransform(fc.dpr, 0, 0, fc.dpr, 0, 0);
    ctx.clearRect(0, 0, fc.W, fc.H);
    el.classList.remove("show");
    startGame();
  }

  el.classList.add("show");
  startGame();
  el.addEventListener("pointerdown", onSkip, { passive: true });
  addEventListener("keydown", onSkip);
  raf = requestAnimationFrame(frame);
}
