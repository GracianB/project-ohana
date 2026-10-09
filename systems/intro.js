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
  const CAST = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  const actors = Object.fromEntries(CAST.map((id) => {
    const def = ROSTER.find((r) => r.id === id) || ROSTER[0];
    return [id, makeDummy(id, 0, def.color)];
  }));
  el.dataset.v45Cast = String(CAST.length);
  el.dataset.openingMode = "family-welcome";

  let raf = 0, t0 = 0, last = 0, lastPaint = 0, ready = false, done = false;

  function layout() {
    const W = fc.W, H = fc.H;
    return {
      W, H,
      floor: H * 0.80,
      heroH: clamp(Math.min(W * .105, H * .13), 34, 102),
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
    const scale = h / Math.max(1, baseHeight(id, 0)) * (id === "cuerno" ? .48 : 1);
    ctx.save();
    ctx.translate(x, footY);
    if (opts.alpha !== undefined) ctx.globalAlpha *= clamp(opts.alpha, 0, 1);
    if (opts.rotate) ctx.rotate(opts.rotate);
    drawDummy(ctx, p, 0, 0, scale, tf);
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
    const tf=t*60;
    const loop=t%14;
    bubbleBoxes = [];

    // Kilo: polen flotando y pequeñas celebraciones.
    const pollen=0.55+0.45*Math.sin(t*1.8);
    actor("kilo",W*.34,floor,heroH*1.02,tf,{facing:1,pose:pollen>.82?"victory":"idle"});
    const px=W*.405,py=floor-heroH*.86-Math.sin(t*2.4)*9;
    ctx.save();ctx.globalCompositeOperation="lighter";ctx.fillStyle="#ffe66a";ctx.shadowColor="#ffe66a";ctx.shadowBlur=22;
    ctx.beginPath();ctx.arc(px,py,4+pollen*3,0,Math.PI*2);ctx.fill();ctx.restore();

    // Stitcho + Chispín: primero juegan a pelearse; luego llega el accidente.
    const duel=Math.sin(clamp(seg(loop,.35,1.25),0,1)*Math.PI);
    const zap=Math.sin(clamp(seg(loop,1.72,2.28),0,1)*Math.PI);
    const sx=W*(.50-.012*duel),cxp=W*(.60+.012*duel);
    actor("stitcho",sx,floor+2,heroH,tf,{facing:1,pose:duel>.08||zap>.08?"attack":"idle",melee:duel>.08||zap>.08?10:0,rotate:-zap*.08});
    actor("chispin",cxp,floor+1,heroH*.92,tf,{facing:-1,pose:duel>.08?"attack":zap>.08?"victory":"idle",melee:duel>.08?8:0});
    if(duel>.35){
      comicBubble(loop<.82?"¡TOMA!":"¡FALLASTE!",W*.555,floor-heroH*1.02,duel,"#8f7bff",loop<.82?"left":"right");
    }
    bolt(cxp-W*.015,floor-heroH*.50,sx+W*.02,floor-heroH*.49,zap);
    if(zap>.18){
      comicBubble("¿EN SERIO?",sx,floor-heroH*.92,zap,"#ffe14a","right");
      comicBubble("UPS.",cxp,floor-heroH*.88,zap,"#7ee7ff","left");
    }

    // Michi se limita a juzgar a todos.
    const catFace=loop>3.0&&loop<4.2?-1:1;
    actor("cat",W*.70,floor+3,heroH*.80,tf,{facing:catFace,pose:"idle"});
    const catEye=Math.sin(clamp(seg(loop,3.55,4.25),0,1)*Math.PI);
    if(catEye>.05) comicBubble("YO NO FUI.",W*.70,floor-heroH*.93,catEye,"#ffb6e4","left");

    // Dragón practica. La primera llama del ciclo es ridículamente pequeña.
    const sneeze=Math.sin(clamp(seg(loop,3.05,3.68),0,1)*Math.PI);
    actor("dragon",W*.18,floor+1,heroH*.97,tf,{facing:1,pose:sneeze>.05?"attack":"idle",melee:sneeze>.05?8:0});
    if(sneeze>0){
      ctx.save();ctx.globalCompositeOperation="lighter";ctx.fillStyle="rgba(255,126,58,"+sneeze+")";ctx.shadowColor="#ff7e3a";ctx.shadowBlur=18;
      ctx.beginPath();ctx.moveTo(W*.215,floor-heroH*.47);ctx.quadraticCurveTo(W*.233,floor-heroH*.69,W*.247,floor-heroH*.48);ctx.quadraticCurveTo(W*.231,floor-heroH*.39,W*.215,floor-heroH*.47);ctx.fill();ctx.restore();
      comicBubble("ACHÍS.",W*.205,floor-heroH*.88,sneeze,"#ff8a45","left");
      comicBubble("...",W*.70,floor-heroH*.72,sneeze,"#ffb6e4","right");
    }

    // Frita y Pizza cruzan la escena persiguiendo una patata.
    const chase=seg(loop,4.25,7.15);
    if(chase>0&&chase<1){
      const x=lerp(W*.08,W*.92,easeInOut(chase));
      const y=floor-12-Math.abs(Math.sin(chase*Math.PI*6))*20;
      ctx.fillStyle="#e9bd55";ctx.strokeStyle="#704b21";ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(x,y,10,7,chase*9,0,Math.PI*2);ctx.fill();ctx.stroke();
      actor("frita",x-48,floor+3,heroH*.80,tf,{facing:1,vx:6,pose:"run"});
      actor("pizza",x-105,floor-Math.abs(Math.sin(chase*Math.PI*5))*20,heroH*.84,tf,{facing:1,grounded:false,vy:-2,pose:"jump"});
      if(chase>.12&&chase<.78){
        comicBubble("¡MÍA!",x-52,floor-heroH*.78,Math.sin(chase*Math.PI),"#fff1b3","right");
        if(chase>.34) comicBubble("¡NI HABLAR!",x-110,floor-heroH*.95,Math.sin(chase*Math.PI),"#ffd84a","left");
      }
    } else {
      actor("frita",W*.77,floor+3,heroH*.76,tf,{facing:-1,pose:"idle"});
      actor("pizza",W*.83,floor+2,heroH*.78,tf,{facing:-1,pose:"idle"});
    }

    // Yomi aparece y desaparece de una sombra imposible.
    const yomiIn=easeOut(seg(loop,7.35,8.15))*(1-seg(loop,9.05,9.55));
    if(yomiIn>0){
      ctx.save();ctx.globalAlpha=.60*yomiIn;ctx.fillStyle="#02040a";
      ctx.beginPath();ctx.ellipse(W*.90,floor+6,34*yomiIn,9,0,0,Math.PI*2);ctx.fill();ctx.restore();
      actor("yomi",W*.90,floor,heroH*.93,tf,{facing:-1,alpha:yomiIn,pose:"idle"});
      if(loop>7.95&&loop<8.85) comicBubble("BU.",W*.88,floor-heroH*.88,Math.sin(seg(loop,7.95,8.85)*Math.PI),"#ff5b78","right");
    }

    // Cuerno dibuja una aurora minúscula y satisfecha.
    const rk=Math.sin(clamp(seg(loop,9.15,10.45),0,1)*Math.PI);
    actor("cuerno",W*.92,floor+1,heroH*.76,tf,{facing:-1,pose:rk>.2?"victory":"idle"});
    rainbow(W*.905,floor-heroH*.72,22,rk);
    if(rk>.35) comicBubble("¡TACHÁN!",W*.87,floor-heroH*1.02,rk,"#efbaff","right");

    // Dino cierra el ciclo con un pisotón que hace reaccionar a todos.
    const stomp=Math.sin(clamp(seg(loop,11.05,11.95),0,1)*Math.PI);
    actor("dino",W*.075,floor+2,heroH,tf,{facing:1,pose:stomp>.18?"victory":"idle"});
    if(stomp>.05){
      ctx.save();ctx.globalAlpha=.22*stomp;ctx.strokeStyle="#b8d57b";ctx.lineWidth=2;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(W*.075,floor+4);ctx.lineTo(W*(.11+i*.018),floor+10+i*4);ctx.stroke();}
      ctx.restore();
      comicBubble("¡DINO!",W*.14,floor-heroH*.92,stomp,"#b8ef6b","right");
      comicBubble("¿QUÉ?",W*.075,floor-heroH*1.12,stomp,"#fff6c8","left");
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
    scene(reduce?0.7:t,L);
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
