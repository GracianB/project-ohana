// PROJECT OHANA V39 · HERO MASTERY
// Character-specific traversal and world interaction.
// This module never mutates enemy HP/damage/hitboxes. It may alter player
// movement and expose player-only traversal surfaces to the collision layer.

const TAU = Math.PI * 2;
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
const cx = (o={}) => (Number(o.x)||0) + (Number(o.w)||0)/2;
const cy = (o={}) => (Number(o.y)||0) + (Number(o.h)||0)/2;
const evoOf = (p={}) => Math.max(0, Math.min(4, Number(p.evo)||0));
const heroId = (p={}) => p.id === "michi" ? "cat" : p.id;

export const HERO_MASTERY = Object.freeze({
  kilo: Object.freeze({
    id:"bloomdraft", name:"Corriente de Polen",
    desc:"Las flores de Hoku recargan su vuelo y crean corrientes ascendentes.",
  }),
  stitcho: Object.freeze({
    id:"wallvault", name:"Wall Vault",
    desc:"Trepa, se aferra y gana impulso vertical en paredes y cornisas.",
  }),
  chispin: Object.freeze({
    id:"cloudstep", name:"Cloudstep",
    desc:"Las nubes eléctricas se vuelven plataformas exclusivas y recargan su salto.",
  }),
  cat: Object.freeze({
    id:"moonpounce", name:"Moon Pounce",
    desc:"Cuando ya no quedan saltos, un impulso felino cruza el aire una vez por vuelo.",
  }),
  dragon: Object.freeze({
    id:"wingbeat", name:"Batida de Alas",
    desc:"Después de sus saltos normales puede encadenar batidas extra y seguir planeando.",
  }),
  dino: Object.freeze({
    id:"seismicbreak", name:"Ruptura Sísmica",
    desc:"El pisotón rompe grietas de Hoku y convierte el impacto en un rebote colosal.",
  }),
  frita: Object.freeze({
    id:"greaserail", name:"Carril Crujiente",
    desc:"Sus deslizamientos se enganchan a carriles de impulso y conservan velocidad.",
  }),
  pizza: Object.freeze({
    id:"ovenbounce", name:"Rebote de Horno",
    desc:"Los respiraderos de horno funcionan como trampolines exclusivos.",
  }),
  yomi: Object.freeze({
    id:"hollowphase", name:"Fase Hueca",
    desc:"Durante el Paso Hueco atraviesa el peligro sin recibir daño de contacto.",
  }),
  cuerno: Object.freeze({
    id:"aurorabridge", name:"Puente Aurora",
    desc:"Un aterrizaje fuerte proyecta un puente de luz temporal hacia delante.",
  }),
});

export function masteryOf(id="") {
  const key = id === "michi" ? "cat" : String(id||"");
  return HERO_MASTERY[key] || Object.freeze({id:"wanderer",name:"Instinto Ohana",desc:"Movimiento propio."});
}

// Coordinates use the canonical 2240×1260 room space. These are optional
// shortcuts and expression surfaces: no room requires a specific hero.
const CLOUDS = Object.freeze({
  hub:      [[690,720,150],[1160,560,150],[1600,390,150]],
  beach:    [[930,900,180],[1120,720,150]],
  jungle:   [[690,760,150],[1180,650,160]],
  cave:     [[760,680,150],[1450,650,160]],
  lab:      [[730,700,150],[1380,520,160]],
  ridge:    [[930,780,190],[1260,650,150]],
  space:    [[900,770,180],[1320,580,160]],
  reef:     [[760,710,160],[1420,690,150]],
  volcano:  [[1040,780,180],[1360,640,150]],
  boss:     [[720,760,150],[1370,760,150]],
});

const PIZZA_PADS = Object.freeze({
  hub:     [[520,1088,92]],
  beach:   [[820,1088,96],[1430,1088,96]],
  jungle:  [[730,1088,92]],
  cave:    [[1080,1088,92]],
  lab:     [[1110,1088,92]],
  ridge:   [[820,1088,92]],
  space:   [[1160,1088,92]],
  reef:    [[970,1088,92]],
  volcano: [[1260,1088,96]],
  boss:    [[1030,1088,96]],
});

const RAILS = Object.freeze({
  hub:     [[430,1116,330]],
  beach:   [[110,1116,430],[1430,1116,500]],
  jungle:  [[80,1116,520],[1480,1116,520]],
  cave:    [[360,1116,420],[1320,1116,450]],
  lab:     [[260,1116,460],[1460,1116,440]],
  ridge:   [[120,1116,500],[1450,1116,520]],
  space:   [[80,1116,500],[1460,1116,520]],
  reef:    [[300,1116,520],[1180,1116,520]],
  volcano: [[260,1116,560],[1280,1116,560]],
  boss:    [[500,1116,440],[1260,1116,440]],
});

const BLOOMS = Object.freeze({
  hub:     [[840,820],[1500,520]],
  beach:   [[720,760],[1260,650]],
  jungle:  [[520,650],[1050,580]],
  cave:    [[650,690],[1520,590]],
  lab:     [[640,720],[1260,520]],
  ridge:   [[720,690],[1520,620]],
  space:   [[760,700],[1450,520]],
  reef:    [[680,690],[1320,620]],
  volcano: [[830,720],[1460,610]],
  boss:    [[800,760],[1440,760]],
});

const CRACKS = Object.freeze({
  hub:     [[1040,1098]],
  beach:   [[1510,1098]],
  jungle:  [[1490,1098]],
  cave:    [[1180,1098]],
  lab:     [[1490,1098]],
  ridge:   [[1540,1098]],
  space:   [[1490,1098]],
  reef:    [[1220,1098]],
  volcano: [[1180,1098]],
  boss:    [[1160,1098]],
});

function roomRows(table, game) {
  return table[String(game?.roomId||"hub")] || [];
}

function ensureState(p) {
  if (!p._mastery || p._mastery.hero !== heroId(p)) {
    p._mastery = {
      hero:heroId(p), room:"", wingUsed:0, pounceUsed:false,
      railTicks:0, bridge:null, broken:{}, bloomT:0, cloudLand:0, padCd:0,
    };
  }
  return p._mastery;
}

export function resetHeroMastery(game) {
  const p=game?.player;
  if(!p) return;
  p._mastery=null;
  ensureState(p);
}

export function onMasteryRoom(game) {
  const p=game?.player;
  if(!p) return;
  const s=ensureState(p);
  s.room=String(game.roomId||"hub");
  s.wingUsed=0;
  s.pounceUsed=false;
  s.railTicks=0;
  s.bridge=null;
  s.bloomT=0;
  s.cloudLand=0;
  s.padCd=0;
  if(!s.broken || typeof s.broken!=="object") s.broken={};
}

function cloudPlatforms(game,p) {
  if(heroId(p)!=="chispin") return [];
  const evo=evoOf(p);
  return roomRows(CLOUDS,game).map((row,i)=>({
    x:row[0], y:row[1], w:row[2] + evo*8, h:12,
    mastery:"cloudstep", masteryIndex:i, oneWay:true,
  }));
}

function pizzaPlatforms(game,p) {
  if(heroId(p)!=="pizza") return [];
  const evo=evoOf(p);
  return roomRows(PIZZA_PADS,game).map((row,i)=>({
    x:row[0], y:row[1], w:row[2] + evo*5, h:12,
    mastery:"ovenbounce", masteryIndex:i, oneWay:true,
  }));
}

function bridgePlatforms(game,p) {
  if(heroId(p)!=="cuerno") return [];
  const s=ensureState(p);
  const b=s.bridge;
  if(!b || !(b.t>0)) return [];
  return [{x:b.x,y:b.y,w:b.w,h:10,mastery:"aurorabridge",oneWay:true}];
}

export function playerMasteryPlatforms(game) {
  const p=game?.player;
  if(!p) return [];
  return [...cloudPlatforms(game,p),...pizzaPlatforms(game,p),...bridgePlatforms(game,p)];
}

function nearestPoint(rows,p,radius=100) {
  let best=null, bestD=Infinity;
  for(let i=0;i<rows.length;i++){
    const [x,y]=rows[i];
    const d=Math.hypot(cx(p)-x,cy(p)-y);
    if(d<radius && d<bestD){ best={x,y,index:i,d}; bestD=d; }
  }
  return best;
}

function supportAt(game,p,type) {
  const feet=p.y+p.h;
  return playerMasteryPlatforms(game).find(pl=>
    pl.mastery===type &&
    p.x+p.w>pl.x+2 && p.x<pl.x+pl.w-2 &&
    Math.abs(feet-pl.y)<8
  )||null;
}

export function updateHeroMastery(game,input={}) {
  const p=game?.player;
  if(!p || p.dead) return;
  const s=ensureState(p);
  const id=heroId(p);
  const evo=evoOf(p);

  if(p.grounded){
    s.wingUsed=0;
    s.pounceUsed=false;
  }
  if(s.padCd>0) s.padCd--;
  if(s.bridge?.t>0){ s.bridge.t--; if(s.bridge.t<=0) s.bridge=null; }
  if(s.bloomT>0) s.bloomT--;

  if(id==="kilo"){
    const bloom=nearestPoint(roomRows(BLOOMS,game),p,86+evo*14);
    if(bloom && !p.grounded && input.jump){
      p.vy=Math.min(p.vy,1.1)-0.14-evo*0.025;
      if(p._butterfly!=null) p._butterfly=Math.min(70+evo*10,(p._butterfly||0)+2+evo);
      s.bloomT=12;
      p._masteryMove="bloomdraft";
      if((Number(input.t)||0)%7===0) game.fx?.emit?.(bloom.x,bloom.y,{color:"#ff9ad8",count:2,size:2.6,up:1.4,speed:1.1,life:16,star:true});
    }
  }

  if(id==="stitcho" && p._pmove==="climb" && input.jump){
    p.vy=Math.min(p.vy,-(3.5+evo*0.48));
    p._masteryMove="wallvault";
  }

  // An unconsumed fresh jump reaches here with _jumpHeld=false.
  if(id==="cat" && !p.grounded && input.jumpPressed && !p._jumpHeld && !s.pounceUsed){
    s.pounceUsed=true;
    p._jumpHeld=true;
    p.vx=(p.facing||1)*(7.4+evo*0.55);
    p.vy=-(4.8+evo*0.45);
    p.invuln=Math.max(p.invuln||0,6+evo);
    p._masteryMove="moonpounce";
    game.fx?.emit?.(cx(p),cy(p),{color:"#ffb6e4",count:8+evo,size:2.8,up:1.1,speed:2.6,life:15,star:true});
  }

  if(id==="dragon" && !p.grounded && input.jumpPressed && !p._jumpHeld){
    const maxBeats=1+Math.floor(evo/2);
    if(s.wingUsed<maxBeats){
      s.wingUsed++;
      p._jumpHeld=true;
      p.vy=-(7.0+evo*0.55);
      p.vx+=(p.facing||1)*(0.8+evo*0.18);
      p._gliding=true;
      p._masteryMove="wingbeat";
      game.fx?.emit?.(cx(p)-(p.facing||1)*8,cy(p),{color:evo>=4?"#ffd84a":"#fff0d0",count:10+evo*2,size:3,up:0.7,speed:2.8,life:16,star:evo>=3});
    }
  }

  if(id==="frita" && p._slideT>0){
    const feet=p.y+p.h;
    const rail=roomRows(RAILS,game).find(([x,y,w])=>p.x+p.w>x&&p.x<x+w&&Math.abs(feet-y)<28);
    if(rail){
      s.railTicks=Math.min(90,s.railTicks+1);
      const dir=p._slideDir||p.facing||1;
      p.vx=dir*Math.max(Math.abs(p.vx),10.5+evo*0.85);
      p._slideT=Math.max(p._slideT,10+Math.min(10,evo*2));
      p._masteryMove="greaserail";
      if((Number(input.t)||0)%3===0) game.fx?.emit?.(cx(p)-dir*p.w*0.45,feet,{color:"#ffd36a",count:2,size:2.4,up:0.6,speed:1.6,life:12});
    }else s.railTicks=Math.max(0,s.railTicks-2);
  }

  if(id==="yomi" && p._specter>0){
    p._masteryMove="hollowphase";
    if(evo>=2) p.vx+=(p.facing||1)*0.08*evo;
  }

  if(id==="chispin"){
    const cloud=supportAt(game,p,"cloudstep");
    if(cloud){
      s.cloudLand=Math.min(30,s.cloudLand+1);
      p._masteryMove="cloudstep";
      if(input.jump && p.grounded) p.coyote=Math.max(p.coyote||0,12);
    }else s.cloudLand=Math.max(0,s.cloudLand-1);
  }
}

export function onDinoPoundImpact(game) {
  const p=game?.player;
  if(!p || heroId(p)!=="dino") return null;
  const s=ensureState(p);
  const evo=evoOf(p);
  const rows=roomRows(CRACKS,game);
  const feet=p.y+p.h;
  let hit=null;
  for(let i=0;i<rows.length;i++){
    const [x,y]=rows[i];
    const key=String(game.roomId)+":"+i;
    if(s.broken[key]) continue;
    if(Math.abs(cx(p)-x)<105+evo*18 && Math.abs(feet-y)<70){
      s.broken[key]=true;
      hit={x,y,index:i,key};
      break;
    }
  }
  if(hit){
    p.vy=-(7.2+evo*0.65);
    p.grounded=false;
    p.coyote=0;
    p.jumps=0;
    p._masteryMove="seismicbreak";
    game.shake=Math.min(24,(game.shake||0)+9+evo*2);
    game.fx?.emit?.(hit.x,hit.y,{color:"#c8f04a",count:14+evo*2,size:4,up:2.2,speed:4.2,life:20,star:true});
    game.nums?.add?.(hit.x,hit.y-18,"¡RUPTURA!","#dfff7a",true);
  }
  return hit;
}

export function afterMoveHeroMastery(game,input={}) {
  const p=game?.player;
  if(!p || p.dead) return;
  const s=ensureState(p);
  const id=heroId(p);
  const evo=evoOf(p);

  if(id==="chispin"){
    const cloud=supportAt(game,p,"cloudstep");
    if(cloud && p.grounded){
      p._masteryMove="cloudstep";
      if((Number(input.t)||0)%8===0) game.fx?.emit?.(cx(p),cloud.y,{color:"#ffe14a",count:2,size:2.2,up:0.6,speed:1.0,life:12});
    }
  }

  if(id==="pizza" && s.padCd<=0 && p.grounded && (p._preVy||0)>1.5){
    const pad=supportAt(game,p,"ovenbounce");
    if(pad){
      s.padCd=14;
      p.grounded=false;
      p.coyote=0;
      p.jumps=Math.max(0,(p.jumps||0)-1);
      p.vy=-(p.jumpPower*(1.12+evo*0.045));
      p._masteryMove="ovenbounce";
      game.fx?.emit?.(cx(p),pad.y,{color:"#ffb43a",count:10+evo*2,size:3,up:1.4,speed:3.0,life:16,star:true});
      game.nums?.add?.(cx(p),pad.y-14,"¡HORNO!","#ffe27a");
    }
  }

  if(id==="cuerno" && p.grounded && (p._preVy||0)>6.2){
    const dir=p.facing||1;
    const width=100+evo*24;
    const x=dir>0 ? p.x+p.w+10 : p.x-width-10;
    s.bridge={
      x:clamp(x,24,Math.max(24,(game.worldW||2240)-width-24)),
      y:p.y+p.h-6,
      w:width,
      t:80+evo*18,
      dir,
    };
    p._masteryMove="aurorabridge";
    game.fx?.emit?.(cx(p),p.y+p.h,{color:"#fff6c4",count:10+evo*2,size:3,up:1.2,speed:2.6,life:16,star:true});
  }
}

export function masteryHurt(game,amount) {
  const p=game?.player;
  if(!p) return amount;
  if(heroId(p)==="yomi" && (p._specter||0)>0){
    p._masteryMove="hollowphase";
    return 0;
  }
  return amount;
}

export function masterySnapshot(game) {
  const p=game?.player;
  if(!p) return null;
  const s=ensureState(p);
  const m=masteryOf(p.id);
  return Object.freeze({
    hero:heroId(p), id:m.id, name:m.name, move:p._masteryMove || ((p._masteryLastMove && (Number(game.t)||0) - Number(p._masteryLastMove.t||0) <= 18) ? p._masteryLastMove.id : "") || "",
    wingUsed:s.wingUsed, pounceUsed:!!s.pounceUsed,
    railTicks:s.railTicks, bridge:!!(s.bridge&&s.bridge.t>0),
    cloud:!!supportAt(game,p,"cloudstep"),
  });
}

function drawCloud(ctx,x,y,w,t,evo) {
  const bob=Math.sin(t*0.06+x*0.01)*3;
  ctx.save();
  ctx.translate(x,y+bob);
  const glow=ctx.createLinearGradient(0,-20,0,14);
  glow.addColorStop(0,"rgba(255,255,255,.92)");
  glow.addColorStop(1,"rgba(95,216,255,.48)");
  ctx.fillStyle=glow;
  ctx.shadowColor="#5fd8ff";
  ctx.shadowBlur=10+evo*2;
  const lumps=Math.max(3,Math.round(w/42));
  for(let i=0;i<lumps;i++){
    const px=(i/(lumps-1)-0.5)*w*0.74;
    const r=20+(i%2)*6+evo;
    ctx.beginPath();ctx.arc(px,-3-Math.abs(i-(lumps-1)/2)*2,r,0,TAU);ctx.fill();
  }
  ctx.fillRect(-w/2,0,w,10);
  ctx.shadowBlur=0;
  ctx.strokeStyle="rgba(255,225,70,.8)";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(-8,10);ctx.lineTo(0,20);ctx.lineTo(-3,29);ctx.lineTo(10,17);
  ctx.stroke();
  ctx.restore();
}

export function drawHeroMastery(ctx,game,t=0) {
  const p=game?.player;
  if(!p) return;
  const id=heroId(p);
  const evo=evoOf(p);
  const cam=game.cam||{x:0,y:0};
  const s=ensureState(p);
  ctx.save();

  if(id==="chispin"){
    for(const pl of cloudPlatforms(game,p)) drawCloud(ctx,pl.x+pl.w/2-cam.x,pl.y-cam.y,pl.w,t,evo);
  }

  if(id==="pizza"){
    for(const pl of pizzaPlatforms(game,p)){
      const x=pl.x-cam.x,y=pl.y-cam.y;
      ctx.globalAlpha=.85;
      ctx.fillStyle="#ff8a2a";ctx.fillRect(x,y,pl.w,7);
      ctx.fillStyle="#ffe27a";
      for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(x+12+i*(pl.w-24)/3,y-3-Math.sin(t*.14+i)*3,4,0,TAU);ctx.fill();}
    }
  }

  if(id==="frita"){
    for(const [x,y,w] of roomRows(RAILS,game)){
      ctx.globalAlpha=.42;
      ctx.strokeStyle="#ffd36a";ctx.lineWidth=5;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(x-cam.x,y-cam.y);ctx.lineTo(x+w-cam.x,y-cam.y);ctx.stroke();
      ctx.globalAlpha=.72;ctx.lineWidth=1.5;ctx.strokeStyle="#fff0b0";
      ctx.setLineDash([12,10]);ctx.beginPath();ctx.moveTo(x-cam.x,y-cam.y);ctx.lineTo(x+w-cam.x,y-cam.y);ctx.stroke();ctx.setLineDash([]);
    }
  }

  if(id==="kilo"){
    for(const [x,y] of roomRows(BLOOMS,game)){
      const pulse=.55+Math.sin(t*.08+x*.01)*.2;
      ctx.globalAlpha=pulse;
      ctx.fillStyle="#ff9ad8";
      for(let i=0;i<5;i++){const a=i*TAU/5+t*.01;ctx.beginPath();ctx.ellipse(x-cam.x+Math.cos(a)*9,y-cam.y+Math.sin(a)*5,5,2.5,a,0,TAU);ctx.fill();}
      ctx.fillStyle="#ffe66a";ctx.beginPath();ctx.arc(x-cam.x,y-cam.y,3.5,0,TAU);ctx.fill();
    }
  }

  if(id==="dino"){
    for(let i=0;i<roomRows(CRACKS,game).length;i++){
      const [x,y]=roomRows(CRACKS,game)[i];
      const key=String(game.roomId)+":"+i;
      if(s.broken[key]) continue;
      ctx.globalAlpha=.68;
      ctx.strokeStyle="#d8c58a";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(x-32-cam.x,y-cam.y);ctx.lineTo(x-8-cam.x,y-9-cam.y);ctx.lineTo(x+2-cam.x,y+2-cam.y);ctx.lineTo(x+18-cam.x,y-7-cam.y);ctx.lineTo(x+34-cam.x,y-cam.y);ctx.stroke();
    }
  }

  if(id==="cuerno" && s.bridge?.t>0){
    const b=s.bridge;
    const k=clamp(b.t/(80+evo*18),0,1);
    ctx.globalAlpha=.35+.45*k;
    const g=ctx.createLinearGradient(b.x-cam.x,b.y-cam.y,b.x+b.w-cam.x,b.y-cam.y);
    g.addColorStop(0,"rgba(255,220,244,.2)");
    g.addColorStop(.5,"rgba(180,235,255,.95)");
    g.addColorStop(1,"rgba(255,246,196,.2)");
    ctx.fillStyle=g;ctx.shadowColor="#c9e8ff";ctx.shadowBlur=14;
    ctx.fillRect(b.x-cam.x,b.y-cam.y,b.w,8);
    ctx.shadowBlur=0;
  }

  // Compact aura when a mastery move is actively expressing the hero.
  if(p._masteryMove){
    const alpha=.18+Math.sin(t*.18)*.06;
    ctx.globalAlpha=alpha;
    ctx.strokeStyle=p.color||"#fff";
    ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx(p)-cam.x,cy(p)-cam.y,Math.max(p.w,p.h)*.72+4,0,TAU);ctx.stroke();
  }

  ctx.restore();
}
