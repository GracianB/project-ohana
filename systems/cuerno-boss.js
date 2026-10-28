import {chapterBossStart,chapterBossFinish} from './chapters-lunar-prism-embers.js';
// BOSQUE DEL PRISMA — Bestia Prisma (Cuerno's personal mini boss).
// 100% vector Canvas: a majestic crystal stag/beast — faceted crystal body,
// rainbow prism antlers that refract light, aurora tail, crystal hooves.
// Three phases: clear crystal → amber-veined → full rainbow eruption.
export const CUERNO_BOSS_ID='hub-cuerno-boss-v1';
export const CUERNO_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','prism_volley','aurora_slam','rainbow_eruption']);
const TAU=Math.PI*2;

function _rr(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}

export function createCuernoBoss(makeFoe,rng=()=>.5,options={}){
 const arena=Object.freeze({...CUERNO_BOSS,...options.arena}),roomId=options.roomId||'hub',x=options.x??3420;
 const e=makeFoe(x,arena.floor-118,'rana',roomId,991,{rng});
 e._chapterArena=arena;e._growthChapter=options.chapter||null;
 e.x=x;e.y=arena.floor-118;e.w=132;e.h=options.chapter?190:118;e.y=arena.floor-e.h;
 e.hp=e.max=arena.hp;if(e._growthChapter){e.damageTakenScale=0;e.damageWindowRemaining=0;}
 e.miniBoss=true;e._cuernoBoss=true;
 e._campaignOriginal=true;e.spawnIndex=991;
 e._encounterSaveId=options.encounterId||CUERNO_BOSS_ID;
 e.roomId=roomId;e.color='#b39ddb';e.contactDmg=0;
 e._prismBeast={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,rainbowAngle:0,columns:[]};
 return e;
}

export function updateCuernoBoss(e,g,hurt){
 if(!e?._cuernoBoss)return false;
 const b=e._prismBeast,p=g.player,arena=e._chapterArena||CUERNO_BOSS,previous=b.phase;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x));
 e.y=arena.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 b.rainbowAngle=(b.rainbowAngle||0)+0.05;
 if(!p||p.dead||e.hp<=0)return true;
 if(!chapterBossStart(e,g,b))return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<700){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-50,'BESTIA PRISMA — DESPIERTA','#e1d5ff',true);
   if(b.clock<=0){b.phase=e._growthChapter?'warn':'rest';b.clock=55;b.aim=Math.sign(dx)||1;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if((--b.clock<=0||e._growthChapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<950){
   b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?30:48;b.exposed=false;
   if(b.attack===2){
    // Columnas de choque para aurora slam
    b.columns=[-140,0,140].map(off=>Math.max(arena.left+40,Math.min(arena.right-40,p.x+p.w/2+off)));
   }
  }
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24&&!e._growthChapter){
   b.phase='rest';b.clock=88;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡BESTIA ATURDIDA!','#e1d5ff',true);
  }else if(--b.clock<=0){
   b.phase='attack';b.clock=b.attack===0?32:24;b.burst=0;
  }
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const rainbow=['#ef5350','#ff9800','#fdd835','#66bb6a','#42a5f5','#7e57c2'];
  const fireShard=(vx,vy=-3.5,col)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+40,w:18,h:18,vx,vy,life:150,dmg:b.tier===3?20:14,owner:'enemy',shape:'orb',color:col||rainbow[b.attack%6]});
   }
  };
  if(!b.burst){
   if(b.attack===0){
    // Embestida potente con destellos
    g.fx?.emit?.(e.x+e.w/2,e.y+e.h-20,{color:'#e040fb',count:12,size:3,life:25});
   }
   if(b.attack===1){
    fireShard(b.aim*7,-3.5);
    if(b.tier>1)fireShard(-b.aim*5,-2,rainbow[2]);
    if(b.tier===3){fireShard(b.aim*6,-5,rainbow[4]);fireShard(b.aim*8,-1.5,rainbow[1]);}
   }
   if(b.attack===2){
    // Aurora slam: ondas de choque a ras de suelo
    for(let k=-1;k<=1;k++){
     fireShard(b.aim*(5+k*2),-3.2-Math.abs(k),rainbow[k+1]);
    }
    g.fx?.emit?.(e.x+e.w/2,arena.floor-10,{color:'#ce93d8',count:16,size:4,life:30});
   }
   if(b.attack===3&&b.tier>=2){
    const rays=b.tier===3?6:4;
    for(let a=0;a<rays;a++){
     const ang=a*TAU/rays+b.rainbowAngle;
     fireShard(Math.cos(ang)*5.5,Math.sin(ang)*5.5-2.5,rainbow[a%6]);
    }
   }
   b.burst=1;
  }
  if(b.attack===0){
   e.x+=b.aim*11;e.facing=b.aim;
   if(g.fx&&b.clock%3===0){
    g.fx.emit(e.x+e.w/2,e.y+e.h-15,{color:'#ea80fc',count:3,size:2.5,life:18});
   }
  }
  if(Math.abs(dx)<e.w*.58&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*.65){
   hurt?.(b.tier===3?22:15,'cuerno-boss');
  }
  if(--b.clock<=0){
   b.phase='rest';b.clock=b.tier===3?32:56;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;
  }
 }
 chapterBossFinish(e,g,b,previous);
 return true;
}

function _drawPrismBeast(ctx,e,t){
 const b=e._prismBeast,tier=b.tier;
 const crystal=tier===3?'rgba(100,60,200,0.88)':tier===2?'rgba(140,100,220,0.82)':'rgba(180,150,240,0.78)';
 const edge   =tier===3?'#ff4081':tier===2?'#e040fb':'#ce93d8';
 const glow   =tier===3?'#ea80fc':'#d1c4e9';
 const float  =Math.sin(t*.08)*4;

 ctx.save();ctx.translate(0,float);

 // ── Hind legs ──
 ctx.strokeStyle=crystal;ctx.lineWidth=12;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-24,10);ctx.lineTo(-30,48);ctx.lineTo(-22,62);ctx.stroke();
 ctx.beginPath();ctx.moveTo(24,10);ctx.lineTo(30,48);ctx.lineTo(22,62);ctx.stroke();
 // Crystal hooves
 ctx.fillStyle=edge;
 ctx.beginPath();ctx.rect(-26,60,12,10);ctx.fill();
 ctx.beginPath();ctx.rect(18,60,12,10);ctx.fill();

 // ── Body (faceted crystal prism shape) ──
 ctx.fillStyle=crystal;ctx.strokeStyle=edge;ctx.lineWidth=2.5;
 ctx.beginPath();
 ctx.moveTo(-40,-8);ctx.lineTo(-50,10);ctx.lineTo(-44,36);
 ctx.lineTo(44,36);ctx.lineTo(50,10);ctx.lineTo(40,-8);
 ctx.lineTo(20,-38);ctx.lineTo(-20,-38);
 ctx.closePath();ctx.fill();ctx.stroke();

 // Inner facet lines
 ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=1.2;
 ctx.beginPath();ctx.moveTo(-20,-38);ctx.lineTo(0,36);ctx.lineTo(20,-38);ctx.stroke();
 ctx.beginPath();ctx.moveTo(-40,-8);ctx.lineTo(0,36);ctx.lineTo(40,-8);ctx.stroke();

 // ── Neck + head ──
 ctx.fillStyle=crystal;ctx.strokeStyle=edge;ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(-18,-36);ctx.lineTo(-22,-60);ctx.lineTo(0,-72);ctx.lineTo(22,-60);ctx.lineTo(18,-36);ctx.closePath();ctx.fill();ctx.stroke();
 // Snout
 ctx.beginPath();ctx.moveTo(-14,-58);ctx.lineTo(0,-72);ctx.lineTo(30,-56);ctx.lineTo(24,-44);ctx.lineTo(-10,-48);ctx.closePath();ctx.fill();ctx.stroke();
 // Eyes
 ctx.fillStyle=tier===3?'#ff4081':'#e040fb';
 ctx.beginPath();ctx.arc(14,-58,5,0,TAU);ctx.fill();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(16,-59,2,0,TAU);ctx.fill();

 // ── Rainbow prism antlers ──
 const rainbow=['#ef5350','#ff9800','#fdd835','#66bb6a','#42a5f5','#7e57c2'];
 const antlerTines=tier===3?4:tier===2?3:2;
 // Left antler
 ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-10,-70);ctx.quadraticCurveTo(-40,-100,-50,-95+Math.sin(t*.12)*3);ctx.stroke();
 for(let i=0;i<antlerTines;i++){
  ctx.strokeStyle=rainbow[i%6];ctx.lineWidth=2.5;
  const tx=-38-(i*6),ty=-86-(i*10);
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx-12-(i*4),ty-16);ctx.stroke();
 }
 // Right antler
 ctx.strokeStyle=edge;ctx.lineWidth=4;
 ctx.beginPath();ctx.moveTo(10,-70);ctx.quadraticCurveTo(40,-100,50,-95+Math.sin(t*.12+1)*3);ctx.stroke();
 for(let i=0;i<antlerTines;i++){
  ctx.strokeStyle=rainbow[(i+2)%6];ctx.lineWidth=2.5;
  const tx=38+(i*6),ty=-86-(i*10);
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+12+(i*4),ty-16);ctx.stroke();
 }

 // ── Front legs ──
 ctx.strokeStyle=crystal;ctx.lineWidth=10;
 ctx.beginPath();ctx.moveTo(-30,-4);ctx.lineTo(-44,30);ctx.stroke();
 ctx.beginPath();ctx.moveTo(30,-4);ctx.lineTo(44,30);ctx.stroke();

 // ── Aurora tail ──
 for(let tc=0;tc<6;tc++){
  const tailOff=Math.sin(t*.14+tc*.5)*12;
  ctx.strokeStyle=`rgba(${tc===0?'255,64,129':tc===1?'255,152,0':tc===2?'253,216,53':tc===3?'76,175,80':tc===4?'33,150,243':'156,39,176'},0.65)`;
  ctx.lineWidth=5-tc*.5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-44,20+tc*3);ctx.quadraticCurveTo(-70,40+tailOff,-80+tc*5,50+tc*8+tailOff);ctx.stroke();
 }

 // Phase 3 rainbow aura
 if(tier===3){
  for(let a=0;a<6;a++){
   const ang=b.rainbowAngle+a*(Math.PI/3);
   ctx.strokeStyle=rainbow[a];ctx.globalAlpha=0.2+Math.sin(t*.1+a)*.09;ctx.lineWidth=3.2;
   ctx.beginPath();ctx.arc(0,-14,55+a*4,ang,ang+Math.PI/3);ctx.stroke();
   ctx.globalAlpha=1;
  }
 }

 ctx.restore();
}

export function drawCuernoBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._cuernoBoss)return;
 const b=e._prismBeast,x=e.x-cam.x,y=e.y-cam.y,cx=x+e.w/2;
 const panW=230,panH=62,px=cx-panW/2,py=Math.max(12,y-96);

 ctx.save();
 // Panel holográfico de cristal
 ctx.fillStyle='rgba(16,10,32,0.85)';
 ctx.strokeStyle='rgba(206,147,216,0.6)';ctx.lineWidth=1.5;
 _rr(ctx,px,py,panW,panH,5);ctx.fill();ctx.stroke();

 // Pips de tier
 const TIER_COL=['#9575cd','#ba68c8','#ff4081'];
 for(let i=0;i<3;i++){
  ctx.fillStyle=i<b.tier?TIER_COL[i]:'#261c38';
  ctx.beginPath();ctx.arc(px+14+i*14,py+11,4.5,0,TAU);ctx.fill();
  if(i<b.tier){
   ctx.strokeStyle='rgba(255,220,255,0.8)';ctx.lineWidth=1.2;
   ctx.beginPath();ctx.arc(px+14+i*14,py+11,4.5,0,TAU);ctx.stroke();
  }
 }

 // Nombre del mini-boss
 ctx.fillStyle='#ede7f6';ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText('BESTIA PRISMA',cx,py+14);

 // Barra de vida segmentada
 const barX=px+10,barY=py+24,barW=panW-20,barH=9;
 const hpRatio=Math.max(0,e.hp/e.max);
 ctx.fillStyle='rgba(8,4,18,0.9)';_rr(ctx,barX,barY,barW,barH,3);ctx.fill();

 const gBar=ctx.createLinearGradient(barX,barY,barX+barW*hpRatio,barY);
 gBar.addColorStop(0,b.tier===3?'#ff4081':b.tier===2?'#ab47bc':'#7e57c2');
 gBar.addColorStop(1,b.tier===3?'#ff80ab':'#e1bee7');
 ctx.fillStyle=gBar;_rr(ctx,barX,barY,barW*hpRatio,barH,3);ctx.fill();

 ctx.strokeStyle='rgba(225,213,255,0.7)';ctx.lineWidth=1;_rr(ctx,barX,barY,barW,barH,3);ctx.stroke();

 // Icono y texto táctico de aviso
 const PHASE_INFO={
  intro:{icon:'◎',col:'#ce93d8',txt:'DESPERTANDO BESTIA PRISMA'},
  rest:{icon:'◉',col:'#80cbc4',txt:'¡CRISTAL EXPUESTO! ATACA EN RECUPERACIÓN'},
  warn:{icon:'▲',col:'#ffb74d',txt:['¡EMBESTIDA DE CRISTAL! SALTA','VOLEA DE PRISMAS REFRACTADOS','GOLPE DE AURORA BOREAL · ONDA','ERUPCIÓN ARCOÍRIS TOTAL'][b.attack]},
  attack:{icon:'✦',col:'#ff4081',txt:'DESCARGA PRISMÁTICA'}
 };
 const pi=PHASE_INFO[b.phase]||PHASE_INFO.intro;
 ctx.fillStyle=pi.col;ctx.font='bold 12px monospace';ctx.textAlign='left';
 ctx.fillText(pi.icon,px+10,py+49);
 ctx.fillStyle='rgba(243,229,245,0.95)';ctx.font='10px monospace';
 ctx.fillText(pi.txt,px+26,py+49);

 // Telegraph direccional en el suelo
 if(b.phase==='warn'){
  const floor=e._chapterArena?.floor?e._chapterArena.floor-cam.y:1134-cam.y;
  ctx.strokeStyle='rgba(224,64,251,0.75)';ctx.lineWidth=2.5;ctx.setLineDash([8,6]);
  const dir=b.aim||1;
  const tipX=cx+dir*(b.attack===0?320:250);
  ctx.beginPath();ctx.moveTo(cx,floor-8);ctx.lineTo(tipX,floor-8);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(224,64,251,0.85)';
  ctx.beginPath();ctx.moveTo(tipX,floor-8);ctx.lineTo(tipX-dir*14,floor-14);ctx.lineTo(tipX-dir*14,floor-2);ctx.closePath();ctx.fill();
 }

 // Anillo telegraph en el cuerpo
 if(e.telegraph||b.exposed){
  const tr=reduced?0:Math.sin(t*0.2)*5;
  ctx.strokeStyle=b.exposed?'rgba(128,203,196,0.75)':'rgba(224,64,251,0.75)';
  ctx.lineWidth=2.8;
  ctx.beginPath();ctx.arc(cx,y+e.h/2,64+tr,0,TAU);ctx.stroke();
 }

 ctx.restore();
}

export function drawCuernoBoss(ctx,e,cam,t){
 if(!e?._cuernoBoss)return false;
 const b=e._prismBeast,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h-(e._growthChapter?70:0));ctx.scale(b.aim||1,1);
 _drawPrismBeast(ctx,e,t);
 ctx.restore();

 // Dibujar siempre HUD táctico
 drawCuernoBossSignals(ctx,e,cam,t);
 return true;
}
