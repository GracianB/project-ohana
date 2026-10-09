// PROJECT OHANA V47A · HOKU HERO GATE
// One coherent place, ten hero affinities. The selector stays in Hoku while
// the chosen hero opens a living procedural window to their world.
// Avoid running under the cinematic opening or when the game is already active.
import { menuPaintAllowedInDocument } from "./menu-visibility.js";
const cv = document.getElementById("title-fx");
// Static family-grid backdrop replaces continuous full-screen Canvas rendering.
if (cv && document.getElementById("char-select")?.dataset.selectorMode !== "family-grid") {
  const ctx = cv.getContext("2d", { alpha:true });
  const RMQ = matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = RMQ.matches;
  try { RMQ.addEventListener("change", (e) => { reduce = e.matches; }); } catch (_) {}

  const SCENES = Object.freeze({
    kilo:    { accent:"#ffe66a", sky:"#7bb7a1", kind:"meadow" },
    stitcho: { accent:"#8f7bff", sky:"#2e6258", kind:"jungle" },
    chispin: { accent:"#ffe14a", sky:"#266d8d", kind:"lab" },
    cat:     { accent:"#ffb6e4", sky:"#54406d", kind:"moon" },
    dragon:  { accent:"#ff8a45", sky:"#9b3d1f", kind:"volcano" },
    dino:    { accent:"#b8ef6b", sky:"#60744b", kind:"earth" },
    frita:   { accent:"#fff1b3", sky:"#5ea5b8", kind:"coast" },
    pizza:   { accent:"#ffd84a", sky:"#a95e26", kind:"oven" },
    yomi:    { accent:"#ff5b78", sky:"#35152d", kind:"void" },
    cuerno:  { accent:"#f2c1ff", sky:"#544e98", kind:"aurora" },
  });

  let W=0,H=0,dpr=1,t=0,raf=0,lastFrame=0;
  let fromId="kilo",toId="kilo",mix=1;
  const pointer={x:.5,y:.38,tx:.5,ty:.38};
  const seeds=Array.from({length:28},(_,i)=>({
    x:((i*73)%997)/997,
    y:((i*191+37)%991)/991,
    s:.55+((i*29)%100)/100,
    p:((i*53)%628)/100
  }));

  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const lerp=(a,b,k)=>a+(b-a)*k;
  const ease=(k)=>1-Math.pow(1-clamp(k,0,1),3);
  const hex=(c)=>{const n=parseInt(c.slice(1),16);return[n>>16,(n>>8)&255,n&255];};
  const rgba=(c,a)=>{const v=hex(c);return "rgba("+v[0]+","+v[1]+","+v[2]+","+a+")";};
  const mixColor=(a,b,k)=>{
    const A=hex(a),B=hex(b);
    return "rgb("+A.map((v,i)=>Math.round(lerp(v,B[i],k))).join(",")+")";
  };

  function resize(){
    const pixels=(cv.clientWidth||innerWidth)*(cv.clientHeight||innerHeight);
    // The atmospheric backdrop does not need full hero-portrait resolution.
    const maxDpr=pixels>1400000?1.12:1.25;
    dpr=Math.min(maxDpr,devicePixelRatio||1);
    W=cv.clientWidth||innerWidth;H=cv.clientHeight||innerHeight;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function hokuBase(accent){
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,"#07131e");
    sky.addColorStop(.43,"#163447");
    sky.addColorStop(.70,"#a46d57");
    sky.addColorStop(1,"#06131b");
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

    const sunX=W*.74+(pointer.x-.5)*18,sunY=H*.20;
    const sun=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,Math.min(W,H)*.20);
    sun.addColorStop(0,"rgba(255,239,188,.35)");
    sun.addColorStop(.28,"rgba(255,190,120,.13)");
    sun.addColorStop(1,"rgba(255,180,100,0)");
    ctx.fillStyle=sun;ctx.fillRect(0,0,W,H);

    // Far islands, always Hoku. This anchors every hero to the same world.
    ctx.fillStyle="#0b2027";
    ctx.beginPath();
    ctx.moveTo(0,H*.70);
    ctx.quadraticCurveTo(W*.10,H*.62,W*.21,H*.69);
    ctx.quadraticCurveTo(W*.31,H*.75,W*.41,H*.66);
    ctx.quadraticCurveTo(W*.51,H*.58,W*.63,H*.68);
    ctx.quadraticCurveTo(W*.76,H*.76,W*.86,H*.66);
    ctx.quadraticCurveTo(W*.93,H*.61,W,H*.67);
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();

    const water=ctx.createLinearGradient(0,H*.64,0,H);
    water.addColorStop(0,"rgba(48,117,135,.28)");
    water.addColorStop(1,"rgba(3,19,29,.94)");
    ctx.fillStyle=water;ctx.fillRect(0,H*.64,W,H*.36);

    ctx.save();
    ctx.globalAlpha=.16;
    ctx.strokeStyle=rgba(accent,.52);ctx.lineWidth=1.4;
    for(let i=0;i<7;i++){
      const y=H*(.70+i*.038);
      const off=((t*(6+i))%(W+180))-90;
      ctx.beginPath();
      for(let x=-80;x<W+100;x+=34) ctx.lineTo(x+off,y+Math.sin((x+i*71)*.018+t*.018)*2.2);
      ctx.stroke();
    }
    ctx.restore();

    // Foreground foliage makes this a place, not a wallpaper.
    ctx.fillStyle="rgba(4,17,17,.92)";
    ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,H*.86);
    for(let i=0;i<8;i++){
      const x=W*(i/7),y=H*(.82+.035*Math.sin(i*2.1));
      ctx.lineTo(x,y);
    }
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();

    // Stable fireflies, deterministic for screenshots.
    ctx.save();ctx.globalCompositeOperation="lighter";
    for(let i=0;i<seeds.length;i++){
      const p=seeds[i];
      const x=(p.x+.012*Math.sin(t*.006+p.p))%1*W;
      const y=H*(.18+p.y*.66);
      const a=.06+.12*(.5+.5*Math.sin(t*.025*p.s+p.p));
      ctx.fillStyle=rgba(i%3?accent:"#fff1b0",a);
      ctx.beginPath();ctx.arc(x,y,1+(i%4)*.45,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function gateFrame(accent,k){
    const cx=W*.5+(pointer.x-.5)*16,cy=H*.46+(pointer.y-.4)*9;
    const R=Math.min(W*.155,H*.225);
    ctx.save();
    const halo=ctx.createRadialGradient(cx,cy,R*.15,cx,cy,R*1.35);
    halo.addColorStop(0,rgba(accent,.08+.08*k));
    halo.addColorStop(.62,rgba(accent,.04+.08*k));
    halo.addColorStop(1,rgba(accent,0));
    ctx.fillStyle=halo;ctx.fillRect(cx-R*1.5,cy-R*1.5,R*3,R*3);

    ctx.globalCompositeOperation="lighter";
    for(let i=0;i<3;i++){
      ctx.globalAlpha=.18+.12*i;
      ctx.strokeStyle=i===2?"rgba(255,255,255,.52)":rgba(accent,.58);
      ctx.lineWidth=i===2?1.1:2.1;
      ctx.setLineDash(i===1?[10,16]:[]);
      ctx.lineDashOffset=-t*(.10+i*.04);
      ctx.beginPath();ctx.ellipse(cx,cy,R*(.88+i*.09),R*(.96+i*.07),0,0,Math.PI*2);ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
    return {cx,cy,R};
  }

  function clipGate(g,fn,alpha){
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.beginPath();ctx.ellipse(g.cx,g.cy,g.R*.84,g.R*.92,0,0,Math.PI*2);ctx.clip();
    fn();
    ctx.restore();
  }

  function biome(scene,g,alpha){
    if(alpha<=.002)return;
    const a=scene.accent,cx=g.cx,cy=g.cy,R=g.R;
    clipGate(g,()=>{
      const bg=ctx.createLinearGradient(0,cy-R,0,cy+R);
      bg.addColorStop(0,scene.sky);
      bg.addColorStop(1,"#071219");
      ctx.fillStyle=bg;ctx.fillRect(cx-R,cy-R,R*2,R*2);

      if(scene.kind==="meadow"){
        ctx.fillStyle="#173c2e";ctx.fillRect(cx-R,cy+R*.34,R*2,R);
        ctx.globalCompositeOperation="lighter";
        for(let i=0;i<18;i++){const ang=i*1.91+t*.006,rr=R*(.18+(i%5)*.12);ctx.fillStyle=rgba(a,.16);ctx.beginPath();ctx.arc(cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr*.56,2+i%3,0,Math.PI*2);ctx.fill();}
      }else if(scene.kind==="jungle"){
        ctx.fillStyle="#0b2a23";ctx.fillRect(cx-R,cy+R*.22,R*2,R);
        ctx.strokeStyle=rgba(a,.24);ctx.lineWidth=4;
        for(let i=0;i<7;i++){const x=cx-R+i*(R*2/6);ctx.beginPath();ctx.moveTo(x,cy-R);ctx.bezierCurveTo(x+35*Math.sin(t*.012+i),cy-R*.15,x-30,cy+R*.25,x+12,cy+R*.85);ctx.stroke();}
      }else if(scene.kind==="lab"){
        ctx.fillStyle="#082536";ctx.fillRect(cx-R,cy+R*.18,R*2,R);
        ctx.strokeStyle=rgba(a,.24);ctx.lineWidth=1;
        for(let i=-5;i<=5;i++){ctx.beginPath();ctx.moveTo(cx+i*R*.18,cy-R);ctx.lineTo(cx+i*R*.18,cy+R);ctx.stroke();}
        for(let i=-4;i<=5;i++){ctx.beginPath();ctx.moveTo(cx-R,cy+i*R*.18);ctx.lineTo(cx+R,cy+i*R*.18);ctx.stroke();}
        if(!reduce){ctx.strokeStyle=rgba(a,.72);ctx.lineWidth=2.5;const x=cx+Math.sin(t*.04)*R*.32;ctx.beginPath();ctx.moveTo(x,cy-R*.65);ctx.lineTo(x-R*.10,cy-R*.22);ctx.lineTo(x+R*.07,cy);ctx.lineTo(x-R*.04,cy+R*.43);ctx.stroke();}
      }else if(scene.kind==="moon"){
        ctx.fillStyle="#11101c";ctx.fillRect(cx-R,cy+R*.35,R*2,R);
        ctx.fillStyle="#fff0ec";ctx.beginPath();ctx.arc(cx+R*.25,cy-R*.28,R*.22,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#2a1e3b";ctx.beginPath();ctx.arc(cx+R*.32,cy-R*.33,R*.20,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=rgba(a,.28);
        for(let i=0;i<7;i++){const x=cx-R*.78+i*R*.25;ctx.beginPath();ctx.moveTo(x,cy+R*.72);ctx.lineTo(x-R*.04,cy+R*.32);ctx.lineTo(x+R*.05,cy+R*.72);ctx.stroke();}
      }else if(scene.kind==="volcano"){
        ctx.fillStyle="#25100b";ctx.fillRect(cx-R,cy+R*.2,R*2,R);
        ctx.fillStyle="#36140d";ctx.beginPath();ctx.moveTo(cx-R*.76,cy+R*.72);ctx.lineTo(cx,cy-R*.36);ctx.lineTo(cx+R*.78,cy+R*.72);ctx.closePath();ctx.fill();
        ctx.strokeStyle=rgba(a,.72);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx,cy-R*.31);ctx.lineTo(cx-R*.06,cy+R*.08);ctx.lineTo(cx+R*.10,cy+R*.42);ctx.stroke();
      }else if(scene.kind==="earth"){
        ctx.fillStyle="#26351f";ctx.fillRect(cx-R,cy+R*.18,R*2,R);
        ctx.strokeStyle=rgba(a,.32);ctx.lineWidth=2;
        for(let i=-4;i<=4;i++){const x=cx+i*R*.18;ctx.beginPath();ctx.moveTo(x,cy+R*.20);ctx.lineTo(x+R*.10,cy+R*.50);ctx.lineTo(x-R*.04,cy+R*.80);ctx.stroke();}
      }else if(scene.kind==="coast"){
        const sea=ctx.createLinearGradient(0,cy,0,cy+R);sea.addColorStop(0,"rgba(100,207,223,.42)");sea.addColorStop(1,"rgba(7,41,59,.92)");ctx.fillStyle=sea;ctx.fillRect(cx-R,cy,R*2,R);
        ctx.strokeStyle=rgba(a,.42);
        for(let i=0;i<5;i++){const y=cy+R*(.15+i*.14);ctx.beginPath();for(let x=cx-R;x<cx+R;x+=18)ctx.lineTo(x,y+Math.sin(x*.025+t*.025+i)*3);ctx.stroke();}
      }else if(scene.kind==="oven"){
        ctx.fillStyle="#2d120b";ctx.fillRect(cx-R,cy-R,R*2,R*2);
        for(let i=0;i<5;i++){ctx.strokeStyle=rgba(a,.16+i*.07);ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy+R*.54,R*(.28+i*.14),Math.PI,Math.PI*2);ctx.stroke();}
        if(!reduce){ctx.fillStyle=rgba(a,.07+.04*Math.sin(t*.04));ctx.fillRect(cx-R,cy-R,R*2,R*2);}
      }else if(scene.kind==="void"){
        ctx.fillStyle="#030309";ctx.fillRect(cx-R,cy-R,R*2,R*2);
        ctx.strokeStyle=rgba(a,.72);ctx.lineWidth=2.5;ctx.shadowColor=a;ctx.shadowBlur=18;
        ctx.beginPath();ctx.moveTo(cx,cy-R*.72);ctx.bezierCurveTo(cx-R*.24,cy-R*.18,cx+R*.25,cy+R*.18,cx-R*.02,cy+R*.70);ctx.stroke();ctx.shadowBlur=0;
        ctx.fillStyle="rgba(0,0,0,.92)";ctx.beginPath();ctx.ellipse(cx,cy+R*.44,R*.42,R*.12,0,0,Math.PI*2);ctx.fill();
      }else if(scene.kind==="aurora"){
        ctx.fillStyle="#10122d";ctx.fillRect(cx-R,cy-R,R*2,R*2);
        const cols=["#ff7aa8","#ffd36a","#7ee7ff","#b78bff"];
        for(let i=0;i<4;i++){ctx.strokeStyle=cols[i];ctx.globalAlpha=.30;ctx.lineWidth=12-i*2;ctx.beginPath();for(let x=cx-R;x<=cx+R;x+=16){ctx.lineTo(x,cy-R*.48+i*R*.16+Math.sin(x/80+t*.014+i)*R*.10);}ctx.stroke();}
      }
    },alpha);
  }

  function frame(now=performance.now()){
    if(!menuPaintAllowedInDocument(document)){raf=0;lastFrame=0;return;}
    // ~13fps for scenery vs 24fps for the central playable hero.
    if(!reduce && lastFrame && now-lastFrame<110){
      raf=requestAnimationFrame(frame);
      return;
    }
    lastFrame=now;
    t+=reduce?0:1;
    pointer.x+=(pointer.tx-pointer.x)*.11;
    pointer.y+=(pointer.ty-pointer.y)*.11;
    mix=reduce?1:Math.min(1,mix+.07);

    const A=SCENES[fromId]||SCENES.kilo;
    const B=SCENES[toId]||SCENES.kilo;
    const k=ease(mix);
    const accent=mixColor(A.accent,B.accent,k);

    ctx.clearRect(0,0,W,H);
    hokuBase(accent);
    const g=gateFrame(accent,k);
    biome(A,g,1-k);
    biome(B,g,k);

    // Ground spotlight connects the gate to the selected hero.
    const spot=ctx.createRadialGradient(g.cx,H*.72,0,g.cx,H*.72,Math.min(W,H)*.21);
    spot.addColorStop(0,rgba(B.accent,.13));
    spot.addColorStop(.48,rgba(B.accent,.045));
    spot.addColorStop(1,rgba(B.accent,0));
    ctx.fillStyle=spot;ctx.fillRect(0,H*.46,W,H*.54);

    // Readability vignette.
    const vign=ctx.createRadialGradient(W*.5,H*.46,Math.min(W,H)*.16,W*.5,H*.46,Math.hypot(W,H)*.62);
    vign.addColorStop(0,"rgba(0,0,0,0)");
    vign.addColorStop(1,"rgba(0,0,0,.50)");
    ctx.fillStyle=vign;ctx.fillRect(0,0,W,H);

    if(reduce){raf=0;return;}
    raf=requestAnimationFrame(frame);
  }

  function select(id){
    if(!SCENES[id]||id===toId)return;
    fromId=toId;toId=id;mix=0;cv.dataset.heroScene=id;
    if(!raf) raf=requestAnimationFrame(frame);
  }

  addEventListener("ohana-title-hero",(e)=>select(String(e.detail?.id||"kilo")));
  addEventListener("pointermove",(e)=>{
    pointer.tx=e.clientX/innerWidth;
    pointer.ty=Math.min(.72,e.clientY/innerHeight);
  },{passive:true});
  addEventListener("resize",()=>{resize();lastFrame=0;if(!raf)raf=requestAnimationFrame(frame);});
  document.addEventListener("visibilitychange",()=>{
    if(menuPaintAllowedInDocument(document)&&!raf){
      lastFrame=0;raf=requestAnimationFrame(frame);
    }
  });
  new MutationObserver(()=>{
    if(!raf&&menuPaintAllowedInDocument(document)) frame();
  }).observe(document.body,{attributes:true,attributeFilter:["class"]});

  const initial=document.getElementById("char-select")?.dataset.hero||"kilo";
  fromId=toId=initial;
  cv.dataset.heroScene=initial;
  cv.dataset.backdrop="hoku-gate";
  resize();frame();
}
