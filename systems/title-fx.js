// PROJECT OHANA V45 · LIVING HERO SELECT BACKDROP
// The title world reacts to the selected hero. No framework, no image dependency.
const cv=document.getElementById("title-fx");
if(cv){
  const ctx=cv.getContext("2d",{alpha:true});
  const RMQ=window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduce=RMQ.matches;try{RMQ.addEventListener("change",e=>{reduce=e.matches;});}catch(_){}

  const SCENES=Object.freeze({
    kilo:{top:"#07151d",mid:"#31584b",low:"#d6a569",accent:"#ffe66a",kind:"meadow"},
    stitcho:{top:"#090d22",mid:"#183d3d",low:"#4f6948",accent:"#8f7bff",kind:"jungle"},
    chispin:{top:"#061225",mid:"#0f3350",low:"#195365",accent:"#ffe14a",kind:"lab"},
    cat:{top:"#090815",mid:"#20152f",low:"#48305a",accent:"#ffb6e4",kind:"cave"},
    dragon:{top:"#170705",mid:"#4d160b",low:"#a73e17",accent:"#ff8a45",kind:"volcano"},
    dino:{top:"#08150b",mid:"#22472c",low:"#766a3a",accent:"#b8ef6b",kind:"earth"},
    frita:{top:"#10233a",mid:"#356979",low:"#d6a05d",accent:"#fff1b3",kind:"coast"},
    pizza:{top:"#170807",mid:"#562010",low:"#d06b24",accent:"#ffd84a",kind:"oven"},
    yomi:{top:"#030309",mid:"#130515",low:"#310a1b",accent:"#ff5b78",kind:"void"},
    cuerno:{top:"#0b0b27",mid:"#252158",low:"#5b4b88",accent:"#f2c1ff",kind:"aurora"}
  });

  let W=0,H=0,dpr=1,t=0,raf=0,stars=[];
  const pointer={x:.5,y:.34,tx:.5,ty:.34};
  let fromId="kilo",toId="kilo",mix=1;
  const lerp=(a,b,k)=>a+(b-a)*k;
  const ease=k=>1-Math.pow(1-k,3);
  function hex(c){const n=parseInt(c.slice(1),16);return[n>>16,(n>>8)&255,n&255]}
  function rgb(c,a){const v=hex(c);return "rgba("+v[0]+","+v[1]+","+v[2]+","+(a==null?1:a)+")"}
  function mixColor(a,b,k){const A=hex(a),B=hex(b);return "rgb("+A.map((v,i)=>Math.round(lerp(v,B[i],k))).join(",")+")"}
  function build(){
    stars=[];const n=Math.round(W*H/11000);
    for(let i=0;i<n;i++)stars.push({x:Math.random(),y:Math.random()*.78,r:.5+Math.random()*1.6,p:Math.random()*6.28,s:.5+Math.random()*1.5});
  }
  function resize(){
    dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth||innerWidth;H=cv.clientHeight||innerHeight;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);build();
  }
  function baseScene(a,b,k){
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,mixColor(a.top,b.top,k));sky.addColorStop(.48,mixColor(a.mid,b.mid,k));sky.addColorStop(.76,mixColor(a.low,b.low,k));sky.addColorStop(1,"#061018");
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    const accent=mixColor(a.accent,b.accent,k);
    for(const s of stars){
      const alpha=.20+.34*(reduce?.6:(.5+.5*Math.sin(t*.025*s.s+s.p)));
      ctx.globalAlpha=alpha;ctx.fillStyle=accent;ctx.beginPath();ctx.arc((s.x+(pointer.x-.5)*.012*s.s)*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    const gx=W*.5+(pointer.x-.5)*28,gy=H*.39+(pointer.y-.35)*18;
    const glow=ctx.createRadialGradient(gx,gy,0,gx,gy,Math.max(W,H)*.46);
    glow.addColorStop(0,"rgba(255,255,255,.055)");glow.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  }
  function ground(col,height){
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,H*(1-height));
    for(let x=0;x<=W;x+=W/8){const y=H*(1-height)+Math.sin(x/W*8+t*.01)*H*.012;ctx.lineTo(x,y);}
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  }
  function overlay(scene,alpha){
    if(alpha<=.002)return;
    const kind=scene.kind,accent=scene.accent;
    ctx.save();ctx.globalAlpha=alpha;
    if(kind==="meadow"){
      ground("#0a241d",.23);ctx.globalCompositeOperation="lighter";
      for(let i=0;i<26;i++){const u=(i*.127+t*.002*(i%3+1))%1;ctx.fillStyle=rgb(accent,.12+.2*Math.sin(t*.03+i));ctx.beginPath();ctx.arc(u*W,H*(.82-(i%6)*.045),1.5+(i%4),0,Math.PI*2);ctx.fill();}
    }else if(kind==="jungle"){
      ground("#071b18",.28);ctx.strokeStyle=rgb(accent,.18);ctx.lineWidth=3;
      for(let i=0;i<8;i++){const x=W*(i/7);ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+Math.sin(t*.01+i)*40,H*.22,x-50,H*.45,x+20,H*.67);ctx.stroke();}
    }else if(kind==="lab"){
      ground("#071a25",.19);ctx.strokeStyle=rgb(accent,.14);ctx.lineWidth=1;
      for(let x=0;x<W;x+=42){ctx.beginPath();ctx.moveTo(x,H*.58);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=H*.58;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      if(!reduce){const x=W*(.18+.64*((t*.006)%1));ctx.strokeStyle=rgb(accent,.45);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,H*.12);ctx.lineTo(x-18,H*.27);ctx.lineTo(x+8,H*.33);ctx.lineTo(x-10,H*.46);ctx.stroke();}
    }else if(kind==="cave"){
      ground("#090b18",.27);const mx=W*.5,my=H*.19,R=Math.min(W,H)*.075;
      ctx.fillStyle="#fff1ef";ctx.beginPath();ctx.arc(mx,my,R,0,Math.PI*2);ctx.fill();ctx.fillStyle="#151021";ctx.beginPath();ctx.arc(mx+R*.32,my-R*.1,R*.92,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=rgb(accent,.24);ctx.lineWidth=2;
      for(let i=0;i<9;i++){const x=W*(.08+i*.105),h=H*(.05+(i%4)*.025);ctx.beginPath();ctx.moveTo(x,H*.77);ctx.lineTo(x-h*.18,H*.77-h);ctx.lineTo(x+h*.18,H*.77);ctx.stroke();}
    }else if(kind==="volcano"){
      ground("#190b09",.25);ctx.fillStyle="#29100b";ctx.beginPath();ctx.moveTo(W*.18,H*.78);ctx.lineTo(W*.50,H*.40);ctx.lineTo(W*.78,H*.78);ctx.closePath();ctx.fill();
      ctx.strokeStyle=rgb(accent,.42);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(W*.50,H*.42);ctx.lineTo(W*.47,H*.57);ctx.lineTo(W*.55,H*.67);ctx.stroke();
      if(!reduce)for(let i=0;i<18;i++){const y=H*((i*.13+t*.004)%1),x=W*(.25+(i*.173)%.5);ctx.fillStyle=rgb(accent,.28);ctx.beginPath();ctx.arc(x,H-y*.48,2+i%3,0,Math.PI*2);ctx.fill();}
    }else if(kind==="earth"){
      ground("#142217",.30);ctx.strokeStyle=rgb(accent,.20);ctx.lineWidth=2;
      for(let i=0;i<7;i++){const x=W*(.14+i*.12);ctx.beginPath();ctx.moveTo(x,H*.72);ctx.lineTo(x+18,H*.82);ctx.lineTo(x-8,H*.91);ctx.stroke();}
      ctx.fillStyle="rgba(16,29,18,.85)";for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(W*(.1+i*.22),H*.65,28+i*4,Math.PI,0);ctx.fill();}
    }else if(kind==="coast"){
      const sea=ctx.createLinearGradient(0,H*.62,0,H);sea.addColorStop(0,"rgba(83,181,205,.28)");sea.addColorStop(1,"rgba(5,27,42,.94)");ctx.fillStyle=sea;ctx.fillRect(0,H*.62,W,H*.38);
      ctx.strokeStyle=rgb(accent,.22);for(let i=0;i<5;i++){const y=H*(.72+i*.045);ctx.beginPath();for(let x=0;x<=W;x+=28)ctx.lineTo(x,y+Math.sin(x*.02+t*.025+i)*3);ctx.stroke();}
    }else if(kind==="oven"){
      ground("#220b08",.23);for(let i=0;i<5;i++){ctx.strokeStyle=rgb(accent,.12+i*.035);ctx.lineWidth=2;ctx.beginPath();ctx.arc(W*.5,H*.70,80+i*44,Math.PI,Math.PI*2);ctx.stroke();}
      if(!reduce){const heat=.5+.5*Math.sin(t*.04);ctx.fillStyle=rgb(accent,.05+.05*heat);ctx.fillRect(0,H*.42,W,H*.58);}
    }else if(kind==="void"){
      ground("#030309",.12);ctx.strokeStyle=rgb(accent,.42);ctx.lineWidth=2;ctx.shadowColor=accent;ctx.shadowBlur=18;
      ctx.beginPath();ctx.moveTo(W*.5,H*.16);ctx.bezierCurveTo(W*.43,H*.34,W*.57,H*.52,W*.49,H*.72);ctx.stroke();ctx.shadowBlur=0;
      ctx.fillStyle="rgba(0,0,0,.78)";ctx.beginPath();ctx.ellipse(W*.5,H*.66,W*.18,H*.05,0,0,Math.PI*2);ctx.fill();
    }else if(kind==="aurora"){
      ground("#090c22",.20);for(let a=0;a<4;a++){const col=["#ff7aa8","#ffd36a","#7ee7ff","#b78bff"][a];ctx.strokeStyle=col;ctx.globalAlpha=alpha*.18;ctx.lineWidth=18-a*2;ctx.beginPath();for(let x=0;x<=W;x+=34){const y=H*(.18+a*.06)+Math.sin(x/180+t*.012+a)*26;ctx.lineTo(x,y);}ctx.stroke();}
    }
    ctx.restore();
  }
  function frame(){
    if(document.body.classList.contains("playing")){raf=0;return;}
    t+=reduce?0:1;pointer.x+=(pointer.tx-pointer.x)*.05;pointer.y+=(pointer.ty-pointer.y)*.05;mix=reduce?1:Math.min(1,mix+.028);
    const A=SCENES[fromId]||SCENES.kilo,B=SCENES[toId]||SCENES.kilo,k=ease(mix);
    ctx.clearRect(0,0,W,H);baseScene(A,B,k);overlay(A,1-k);overlay(B,k);
    const spot=ctx.createRadialGradient(pointer.x*W,pointer.y*H,0,pointer.x*W,pointer.y*H,Math.max(W,H)*.46);
    spot.addColorStop(0,"rgba(255,255,255,.05)");spot.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=spot;ctx.fillRect(0,0,W,H);
    raf=requestAnimationFrame(frame);
  }
  function select(id){
    if(!SCENES[id]||id===toId)return;
    fromId=toId;toId=id;mix=0;
    cv.dataset.heroScene=id;
  }
  addEventListener("ohana-title-hero",e=>select(String(e.detail?.id||"kilo")));
  addEventListener("pointermove",e=>{pointer.tx=e.clientX/innerWidth;pointer.ty=Math.min(.74,e.clientY/innerHeight)},{passive:true});
  addEventListener("resize",resize);
  new MutationObserver(()=>{if(!raf&&!document.body.classList.contains("playing"))frame();}).observe(document.body,{attributes:true,attributeFilter:["class"]});
  const initial=document.getElementById("char-select")?.dataset.hero||"kilo";
  fromId=toId=initial;cv.dataset.heroScene=initial;resize();frame();
}
