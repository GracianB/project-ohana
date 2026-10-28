import {CHISPIN_CHAPTER_BOSS_ID} from './chispin-chapter.js';
// ISLAS DEL RELÁMPAGO — Titán de Trueno (Chispín's personal mini boss).
// 100% vector Canvas drawing: colossal brass & copper dynamo automaton.
// Three phases: floor ground-arcs, floating plasma coils, and full storm overload.
export const CHISPIN_BOSS_ID='hub-chispin-titan-v1';
export const CHISPIN_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['ground_arc','charge','plasma_burst','storm_overload']);

export function createChispinBoss(makeFoe,rng=()=>.5,options={}){
 const arena=Object.freeze({...CHISPIN_BOSS,...options.arena}),roomId=options.roomId||'hub',x=options.x??3420;
 const chapter=options.encounterId===CHISPIN_CHAPTER_BOSS_ID;
 const e=makeFoe(x,arena.floor-96,'cangrejo',roomId,998,{rng});
 e._chispinArena=arena;e._chispinChapter=chapter;
 e.x=x;e.w=chapter?150:118;e.h=chapter?132:96;e.y=arena.floor-e.h;
 e.hp=e.max=arena.hp;
 if(chapter){e.damageTakenScale=0;e.damageWindowRemaining=0;}
 e.miniBoss=true;e._chispinBoss=true;
 e._campaignOriginal=true;e.spawnIndex=998;
 e._encounterSaveId=options.encounterId||CHISPIN_BOSS_ID;
 e.roomId=roomId;e.color='#ffe45a';e.contactDmg=0;
 e._titan={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
 return e;
}

export function updateChispinBoss(e,g,hurt){
 if(!e?._chispinBoss)return false;
 const b=e._titan,p=g.player,arena=e._chispinArena||CHISPIN_BOSS,chapter=e._chispinChapter,previousPhase=b.phase;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x));
 e.y=arena.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(chapter&&g.world1&&(g.world1.stations.some(s=>!s.done)||p.evo<4))return true;
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'TITÁN DE TRUENO · REACTIVADO','#ffe45a',true);
   if(b.clock<=0){b.phase=chapter?'warn':'rest';b.clock=50;b.aim=Math.sign(dx)||1;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if((--b.clock<=0||chapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;if(chapter&&b.attack===3)b.stormX=[-110,0,110].map(offset=>Math.max(arena.left+20,Math.min(arena.right-20,p.x+p.w/2+offset)));}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24&&!chapter){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡DESCARGA CORTADA!','#fff39e',true);}
  else if(--b.clock<=0){b.attacksExecuted=(b.attacksExecuted||0)+1;b.phase='attack';b.clock=b.attack===1?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const boltWave=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:22,h:16,vx:direction*speed,vy:0,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#ffe45a'});
   }
  };
  if(!b.burst){
   if(b.attack===0){boltWave(b.aim,6.5);if(b.tier>1)boltWave(-b.aim,4.5);}
   if(b.attack===2){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5,vy:-3,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ffd43f'});
     }
    }
   }
   if(b.attack===3){
    // Storm barrage from sky
    for(let i=-1;i<=1;i++){
     const sx=chapter?b.stormX[i+1]:p.x+i*80;
     g.fx?.emit?.(sx,p.y-120,{color:'#ffe45a',count:8,size:3,star:true,life:30});
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:chapter?sx-9:sx,y:e.y-180,w:18,h:32,vx:0,vy:8,life:90,dmg:b.tier===3?22:15,owner:'enemy',shape:'orb',color:'#fff187'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===1){
   e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x+b.aim*(b.tier===3?9.5:6)));
   if(Math.abs(dx)<(e.w+p.w)/2&&Math.abs(p.y+p.h/2-e.y-e.h/2)<(p.h+e.h)/2){
    hurt?.(b.tier===3?22:16,'EMBESTIDA VOLTAICA');
   }
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?38:70;b.attack=(b.attack+1)%PATTERNS.length;b.exposed=true;}
 }
 if(chapter){if(b.phase==='rest'&&previousPhase!=='rest')e.damageWindowRemaining=160;e.damageTakenScale=b.phase==='rest'&&e.damageWindowRemaining>0?1:0;}
 e.stun=Math.min(e.stun||0,2);
 e._campaign={wind:e.wind,active:e.lunge,aim:b.aim};
 return true;
}

// ─── HUD holográfico del Titán de Trueno ───────────────────────────────────
export function drawChispinBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._chispinBoss)return;
 const cx=e.x+e.w/2-cam.x,cy=e.y-cam.y,b=e._titan;
 const panW=290,panH=72,px=cx-panW/2,py=cy-panH-18;
 ctx.save();

 // Panel de fondo holográfico
 ctx.save();
 ctx.shadowColor='#ffe45a';ctx.shadowBlur=reduced?0:12;
 // borde exterior dorado
 ctx.strokeStyle='#c8902a';ctx.lineWidth=2;
 _rr(ctx,px-2,py-2,panW+4,panH+4,5);ctx.stroke();
 // fondo interior oscuro semitransparente
 const grad=ctx.createLinearGradient(px,py,px,py+panH);
 grad.addColorStop(0,'rgba(8,6,28,0.93)');grad.addColorStop(1,'rgba(12,18,40,0.88)');
 ctx.fillStyle=grad;_rr(ctx,px,py,panW,panH,4);ctx.fill();
 // línea separadora superior dorada
 ctx.strokeStyle='rgba(255,228,90,0.55)';ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(px+8,py+18);ctx.lineTo(px+panW-8,py+18);ctx.stroke();
 ctx.restore();

 // Tier pips (esquina superior izquierda)
 const TIER_COL=['#4a4230','#d4820a','#ff3c0e'];
 for(let i=0;i<3;i++){
  ctx.fillStyle=i<b.tier?TIER_COL[i]:'#1d1c2a';
  ctx.beginPath();
  ctx.arc(px+12+i*14,py+9,4,0,Math.PI*2);
  ctx.fill();
  if(i<b.tier){
   ctx.strokeStyle='rgba(255,220,100,0.6)';ctx.lineWidth=1;
   ctx.beginPath();ctx.arc(px+12+i*14,py+9,4,0,Math.PI*2);ctx.stroke();
  }
 }

 // Título
 ctx.fillStyle='#ffe090';ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText('TITÁN DE TRUENO',cx,py+13);

 // Barra de vida segmentada
 const barX=px+10,barY=py+22,barW=panW-20,barH=10;
 const hp=Math.max(0,e.hp/e.max);
 // fondo
 ctx.fillStyle='rgba(14,10,30,0.8)';_rr(ctx,barX,barY,barW,barH,3);ctx.fill();
 // relleno
 const hpGrad=ctx.createLinearGradient(barX,barY,barX+barW*hp,barY);
 hpGrad.addColorStop(0,b.tier===3?'#ff6b1a':b.tier===2?'#ffe45a':'#6adfff');
 hpGrad.addColorStop(1,b.tier===3?'#ffb034':'#fff7a0');
 ctx.fillStyle=hpGrad;_rr(ctx,barX,barY,barW*hp,barH,3);ctx.fill();
 // segmentos de vida (cada 25%)
 ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=1;
 for(let s=1;s<4;s++){ctx.beginPath();ctx.moveTo(barX+barW*s/4,barY);ctx.lineTo(barX+barW*s/4,barY+barH);ctx.stroke();}
 // borde barra
 ctx.strokeStyle='rgba(180,140,50,0.7)';ctx.lineWidth=1;_rr(ctx,barX,barY,barW,barH,3);ctx.stroke();

 // Porcentaje de vida
 ctx.fillStyle='rgba(255,240,180,0.6)';ctx.font='9px monospace';ctx.textAlign='right';
 ctx.fillText(Math.ceil(hp*100)+'%',px+panW-8,py+barY-py+barH+1);

 // Estado de fase — icono + texto
 const PHASE_INFO={
  intro:{icon:'◎',col:'#7ae0ff',txt:'INACTIVO'},
  rest:{icon:'◉',col:'#00ffb8',txt:'NÚCLEO ABIERTO · ATACA'},
  warn:{icon:'▲',col:'#ffb84d',txt:['SALTA EL ARCO','CRUZA O ESQUIVA','ALÉJATE BOBINAS','SAL DE LAS COLUMNAS'][b.attack]},
  attack:{icon:'✦',col:'#ff4e3a',txt:'DESCARGANDO'},
 };
 const pi=PHASE_INFO[b.phase]||PHASE_INFO.intro;
 // pulso del icono en advertencia
 const iconAlpha=b.phase==='warn'&&!reduced?0.55+0.45*Math.abs(Math.sin(t*0.18)):1;
 ctx.globalAlpha=iconAlpha;
 ctx.fillStyle=pi.col;ctx.font='bold 13px monospace';ctx.textAlign='left';
 ctx.fillText(pi.icon,px+10,py+50);
 ctx.globalAlpha=1;
 ctx.fillStyle='rgba(220,215,255,0.9)';ctx.font='10px monospace';
 ctx.fillText(pi.txt,px+26,py+50);

 // Flash rojo si tier 3 y advertencia
 if(b.tier===3&&b.phase==='warn'&&!reduced){
  ctx.fillStyle=`rgba(255,50,10,${0.06*Math.abs(Math.sin(t*0.22))})`;
  _rr(ctx,px,py,panW,panH,4);ctx.fill();
 }

 // Líneas de telegraph mejoradas (solo en chapter)
 if(e._chispinChapter&&b.phase==='warn'){
  const floor=e._chispinArena.floor-cam.y;
  ctx.strokeStyle='rgba(255,220,90,0.55)';ctx.lineWidth=2;
  ctx.setLineDash([9,6]);
  if(b.attack===3){
   for(const sx of b.stormX||[]){
    // columna de aviso con gradiente
    const tg=ctx.createLinearGradient(sx-cam.x,floor-280,sx-cam.x,floor);
    tg.addColorStop(0,'rgba(255,235,80,0)');tg.addColorStop(0.5,'rgba(255,200,50,0.5)');tg.addColorStop(1,'rgba(255,160,20,0.9)');
    ctx.strokeStyle=tg;
    ctx.beginPath();ctx.moveTo(sx-cam.x,floor-280);ctx.lineTo(sx-cam.x,floor);ctx.stroke();
    // icono de destino en el suelo
    ctx.setLineDash([]);
    ctx.strokeStyle='rgba(255,180,30,0.9)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(sx-cam.x,floor-4,10,0,Math.PI*2);ctx.stroke();
   }
  }else{
   const dir=b.aim;
   const tipX=cx+dir*(b.attack===1?360:280);
   ctx.strokeStyle='rgba(255,230,80,0.65)';ctx.lineWidth=2.5;
   ctx.beginPath();ctx.moveTo(cx,floor-8);ctx.lineTo(tipX,floor-8);ctx.stroke();
   ctx.setLineDash([]);
   // flecha de dirección
   ctx.fillStyle='rgba(255,210,60,0.85)';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(tipX,floor-8);ctx.lineTo(tipX-dir*14,floor-15);ctx.lineTo(tipX-dir*14,floor-1);ctx.closePath();ctx.fill();
  }
  ctx.setLineDash([]);
 }

 // Pulso de telegraph en el cuerpo del boss
 if(e.telegraph){
  ctx.save();
  const tr=reduced?0:Math.sin(t*0.2)*8;
  ctx.strokeStyle=`rgba(255,228,90,${0.55+0.35*Math.abs(Math.sin(t*0.15))})`;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(cx,cy+e.h/2,68+tr,0,Math.PI*2);ctx.stroke();
  // segundo anillo más tenue
  ctx.strokeStyle=`rgba(255,180,40,${0.2+0.15*Math.abs(Math.sin(t*0.12))})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(cx,cy+e.h/2,82+tr*0.7,0,Math.PI*2);ctx.stroke();
  ctx.restore();
 }
 ctx.restore();
}

// ─── Cuerpo del Titán de Trueno — automaton colosal de cobre/latón ─────────
export function drawChispinBossBody(ctx,e,cam,t=0,reduced=false){
 if(!e?._chispinBoss)return;
 const wx=e.x-cam.x,wy=e.y-cam.y,b=e._titan;
 const H=e.h,W=e.w;
 const sc=e._chispinChapter?W/90:1;
 ctx.save();
 ctx.translate(wx+W/2,wy+H);
 if(e._chispinChapter)ctx.scale(sc,1);

 const ph=b.phase,tier=b.tier;
 const isWarn=ph==='warn',isAtk=ph==='attack',isRest=ph==='rest';
 const osc=reduced?0:Math.sin(t*0.09);   // oscilación lenta general
 const fast=reduced?0:Math.sin(t*0.22);  // oscilación rápida (arcos)

 // ── helpers de color por tier ──────────────────────────────────────────
 const copperBody  = tier===3?'#6b2200':tier===2?'#7a3a10':'#8c4a1e';
 const copperLight = tier===3?'#b04010':tier===2?'#c07020':'#c48a3e';
 const brassRim    = tier===3?'#c06010':tier===2?'#cc9018':'#d4a830';
 const arcColor    = tier===3?'#ff8040':'#ffe45a';
 const coreFill    = isRest?'#ffe860':'#5a3000';
 const eyeColor    = tier===3?'#ff2020':tier===2?'#ffb020':'#80f4ff';

 // ── PISTONS hidráulicos (detrás del torso) ─────────────────────────────
 for(const side of [-1,1]){
  const pistonX=side*42,pistonTop=-H*0.72;
  const ext=isWarn?-8:isAtk?6:osc*3;
  // cilindro exterior (latón oscuro)
  ctx.fillStyle='#5a4010';
  ctx.fillRect(pistonX-5,pistonTop,10,28);
  ctx.strokeStyle='#b08020';ctx.lineWidth=1;ctx.strokeRect(pistonX-5,pistonTop,10,28);
  // vástago (cobre pulido)
  ctx.fillStyle=copperLight;
  ctx.fillRect(pistonX-3,pistonTop+14+ext,6,20);
  // bola de pivote superior
  ctx.fillStyle=brassRim;
  ctx.beginPath();ctx.arc(pistonX,pistonTop-2,5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ffffff44';ctx.lineWidth=0.5;ctx.stroke();
 }

 // ── BASE / PELVIS ──────────────────────────────────────────────────────
 ctx.fillStyle=copperBody;
 ctx.beginPath();
 ctx.moveTo(-34,0);ctx.lineTo(-38,-18);ctx.lineTo(38,-18);ctx.lineTo(34,0);
 ctx.closePath();ctx.fill();
 // placa de vientre (latón)
 ctx.fillStyle=brassRim;
 ctx.beginPath();
 ctx.moveTo(-28,-4);ctx.lineTo(-30,-16);ctx.lineTo(30,-16);ctx.lineTo(28,-4);
 ctx.closePath();ctx.fill();
 // remaches de la pelvis
 _rivets(ctx,[-20,-12,-4,4,12,20],-10,2,brassRim,'#3a2800');

 // ── TORSO PRINCIPAL ───────────────────────────────────────────────────
 ctx.fillStyle=copperBody;
 ctx.beginPath();
 ctx.moveTo(-40,-18);ctx.lineTo(-44,-H*0.72);ctx.lineTo(44,-H*0.72);ctx.lineTo(40,-18);
 ctx.closePath();ctx.fill();
 ctx.strokeStyle=brassRim;ctx.lineWidth=1.8;
 ctx.beginPath();
 ctx.moveTo(-40,-18);ctx.lineTo(-44,-H*0.72);ctx.lineTo(44,-H*0.72);ctx.lineTo(40,-18);
 ctx.closePath();ctx.stroke();

 // placas segmentadas del torso
 for(let row=0;row<3;row++){
  const rowY=-22-row*14;
  ctx.fillStyle=row%2===0?copperLight:copperBody;
  ctx.fillRect(-36,rowY-10,72,10);
  ctx.strokeStyle=brassRim+'88';ctx.lineWidth=0.8;ctx.strokeRect(-36,rowY-10,72,10);
  // remaches laterales
  _rivets(ctx,[-32,32],rowY-5,1.5,brassRim,'#2a1a00');
 }

 // venas de conducción doradas (líneas verticales en el torso)
 ctx.strokeStyle='#c8901888';ctx.lineWidth=1.5;
 for(const lx of [-22,-7,7,22]){
  ctx.beginPath();ctx.moveTo(lx,-20);ctx.lineTo(lx,-H*0.7);ctx.stroke();
 }

 // ── ESCUDO PECTORAL (centro del torso) ────────────────────────────────
 const shieldAlpha=isRest?0:1;
 if(shieldAlpha>0){
  ctx.save();ctx.globalAlpha=shieldAlpha;
  ctx.fillStyle='#3d2a00';
  _rr(ctx,-20,-H*0.62,40,30,6);ctx.fill();
  ctx.strokeStyle=brassRim;ctx.lineWidth=2;
  _rr(ctx,-20,-H*0.62,40,30,6);ctx.stroke();
  // glifo de relámpago en el escudo
  ctx.strokeStyle='#ffe45a';ctx.lineWidth=1.8;
  ctx.beginPath();
  ctx.moveTo(3,-H*0.62+5);ctx.lineTo(-5,-H*0.62+14);ctx.lineTo(1,-H*0.62+14);ctx.lineTo(-3,-H*0.62+25);ctx.lineTo(7,-H*0.62+12);ctx.lineTo(1,-H*0.62+12);ctx.lineTo(5,-H*0.62+5);
  ctx.closePath();ctx.fill();
  ctx.restore();
 }

 // ── NÚCLEO DINAMO CENTRAL ─────────────────────────────────────────────
 const coreY=-H*0.47,coreR=isRest?18:14;
 const corePulse=reduced?0:Math.sin(t*0.18)*3;
 // anillo exterior
 ctx.fillStyle=isRest?'#3a2000':'#1a1008';
 ctx.beginPath();ctx.arc(0,coreY,coreR+5+corePulse,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=brassRim;ctx.lineWidth=isRest?2:1;ctx.stroke();
 // haces radiales cuando está abierto
 if(isRest&&!reduced){
  for(let ray=0;ray<8;ray++){
   const ang=ray*Math.PI/4+(t*0.04);
   const beamLen=28+Math.abs(osc)*5;
   const grad=ctx.createLinearGradient(0,coreY,Math.cos(ang)*beamLen,coreY+Math.sin(ang)*beamLen);
   grad.addColorStop(0,'rgba(255,240,80,0.85)');grad.addColorStop(1,'rgba(255,200,40,0)');
   ctx.strokeStyle=grad;ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(0,coreY);ctx.lineTo(Math.cos(ang)*beamLen,coreY+Math.sin(ang)*beamLen);ctx.stroke();
  }
 }
 // núcleo interior
 const innerGrad=ctx.createRadialGradient(0,coreY,0,0,coreY,coreR+corePulse);
 if(isRest){
  innerGrad.addColorStop(0,'#fffde0');innerGrad.addColorStop(0.4,'#ffe860');innerGrad.addColorStop(1,'#ff9010');
 }else{
  innerGrad.addColorStop(0,'#3a2800');innerGrad.addColorStop(1,'#1a1200');
 }
 ctx.fillStyle=innerGrad;
 ctx.beginPath();ctx.arc(0,coreY,coreR+corePulse,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=isRest?'#fff7c0':'#5a4010';ctx.lineWidth=1.2;ctx.stroke();

 // ── HOMBROS / PAULDRONS ───────────────────────────────────────────────
 for(const side of [-1,1]){
  const sx=side*39,sy=-H*0.70;
  // placa de hombro
  ctx.fillStyle=copperBody;
  ctx.beginPath();
  ctx.moveTo(sx,sy-12);ctx.lineTo(sx+side*18,sy-4);ctx.lineTo(sx+side*20,sy+18);ctx.lineTo(sx,sy+22);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle=brassRim;ctx.lineWidth=1.5;ctx.stroke();
  // líneas de refuerzo del pauldron
  ctx.strokeStyle=copperLight+'88';ctx.lineWidth=1;
  for(let pl=0;pl<3;pl++){
   ctx.beginPath();ctx.moveTo(sx,sy+pl*7-2);ctx.lineTo(sx+side*18,sy+pl*7-6);ctx.stroke();
  }
  // remaches del pauldron
  _rivets(ctx,[side*41,side*52],sy+8,1.5,brassRim,'#2a1a00');
 }

 // ── BOBINAS TESLA (sobre los hombros) ─────────────────────────────────
 for(const side of [-1,1]){
  const cx=side*45,cy=-H*0.92;
  const coilH=28,coilW=10;
  // base de porcelana (aislador)
  ctx.fillStyle='#dde8f0';
  ctx.beginPath();ctx.arc(cx,cy+coilH+4,7,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#8898a8';ctx.lineWidth=1;ctx.stroke();
  // cuerpo de la bobina (cobre oscuro)
  ctx.fillStyle='#5a3010';
  ctx.fillRect(cx-coilW/2,cy,coilW,coilH);
  ctx.strokeStyle=brassRim;ctx.lineWidth=1;ctx.strokeRect(cx-coilW/2,cy,coilW,coilH);
  // espirales devanadas (6 vueltas)
  ctx.strokeStyle=copperLight;ctx.lineWidth=1.5;
  for(let w=0;w<6;w++){
   ctx.beginPath();
   ctx.moveTo(cx-coilW/2,cy+3+w*4);ctx.lineTo(cx+coilW/2,cy+3+w*4);
   ctx.stroke();
  }
  // cúpula / bola de plasma
  const plasmaR=7+(reduced?0:fast*1.5);
  const plasmaGrad=ctx.createRadialGradient(cx,cy-2,0,cx,cy-2,plasmaR+3);
  if(tier>=2){
   plasmaGrad.addColorStop(0,'#ffffff');plasmaGrad.addColorStop(0.4,'#ffe45a');plasmaGrad.addColorStop(1,'rgba(255,200,40,0)');
  }else{
   plasmaGrad.addColorStop(0,'#c8e8ff');plasmaGrad.addColorStop(0.5,'#90c8ff');plasmaGrad.addColorStop(1,'rgba(100,160,255,0)');
  }
  ctx.fillStyle=plasmaGrad;
  ctx.beginPath();ctx.arc(cx,cy-2,plasmaR+3,0,Math.PI*2);ctx.fill();
  // arco Tesla entre bobinas (tier≥2 o en advertencia)
  if(!reduced&&(tier>=2||isWarn)&&side===1){
   _drawArc(ctx,-45,cy,-3,0,arcColor,fast,t,tier);
  }
 }

 // ── CABEZA ────────────────────────────────────────────────────────────
 const headY=-H*0.9,headW=38,headH=26;
 // cuello
 ctx.fillStyle='#3a2800';ctx.fillRect(-8,-H*0.72,16,H*0.72-H*0.9+4);
 ctx.strokeStyle='#7a5820';ctx.lineWidth=1;ctx.strokeRect(-8,-H*0.72,16,H*0.72-H*0.9+4);
 // casco (cabeza)
 ctx.fillStyle=copperBody;
 _rr(ctx,-headW/2,headY,headW,headH,5);ctx.fill();
 ctx.strokeStyle=brassRim;ctx.lineWidth=2;_rr(ctx,-headW/2,headY,headW,headH,5);ctx.stroke();
 // placa frontal oscura
 ctx.fillStyle='#1a1230';
 _rr(ctx,-headW/2+4,headY+3,headW-8,headH-6,4);ctx.fill();
 // OJOS (lentes)
 for(const side of [-1,1]){
  const ex=side*10,ey=headY+headH/2;
  // halo exterior
  ctx.fillStyle=eyeColor+'44';
  ctx.beginPath();ctx.arc(ex,ey,8,0,Math.PI*2);ctx.fill();
  // iris
  const eyeGrad=ctx.createRadialGradient(ex,ey,0,ex,ey,6);
  eyeGrad.addColorStop(0,'#ffffff');
  eyeGrad.addColorStop(0.5,eyeColor);
  eyeGrad.addColorStop(1,eyeColor+'88');
  ctx.fillStyle=eyeGrad;
  ctx.beginPath();ctx.arc(ex,ey,6,0,Math.PI*2);ctx.fill();
  // pupila
  ctx.fillStyle='#000000bb';
  ctx.beginPath();ctx.arc(ex,ey,2.5,0,Math.PI*2);ctx.fill();
  // brillo
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.beginPath();ctx.arc(ex-2,ey-2,1.5,0,Math.PI*2);ctx.fill();
 }
 // rejilla bocal (ventilación inferior de la cabeza)
 ctx.fillStyle='#0a0818';ctx.fillRect(-12,headY+headH-7,24,5);
 ctx.strokeStyle='#5a4820';ctx.lineWidth=0.8;
 for(let gx=-10;gx<=10;gx+=4){ctx.beginPath();ctx.moveTo(gx,headY+headH-7);ctx.lineTo(gx,headY+headH-2);ctx.stroke();}

 // ── CORONA DE TORMENTA ────────────────────────────────────────────────
 // tres pararrayos ramificados
 const crownY=headY-4;
 const hornDefs=[[0,-34,0],[side=>side*18,-22,1],[-26,-16,2]].map((_,i)=>i);
 const hornData=[[0,-34],[-24,-20],[24,-20]];
 for(const [hx,hy] of hornData){
  ctx.strokeStyle=brassRim;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(hx,crownY);ctx.lineTo(hx,crownY+hy);ctx.stroke();
  // bifurcación
  ctx.strokeStyle=copperLight;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(hx,crownY+hy+8);ctx.lineTo(hx-6,crownY+hy-4);ctx.stroke();
  ctx.beginPath();ctx.moveTo(hx,crownY+hy+8);ctx.lineTo(hx+6,crownY+hy-4);ctx.stroke();
  // punta dorada
  ctx.fillStyle='#fff9a0';
  ctx.beginPath();ctx.arc(hx,crownY+hy,3.5,0,Math.PI*2);ctx.fill();
 }
 // filamentos de rayo activos (tier≥2)
 if(!reduced&&tier>=2){
  for(const [hx,hy] of hornData){
   _drawLightning(ctx,hx,crownY+hy,hx+(Math.random()>.5?1:-1)*12,crownY+hy-16,arcColor,0.7);
  }
 }

 // ── DESCARGA CONTINUA TIER 3 ──────────────────────────────────────────
 if(!reduced&&tier===3){
  // arcos que salen del torso
  ctx.strokeStyle='rgba(255,130,30,0.85)';ctx.lineWidth=1.2;
  const t3count=5;
  for(let a=0;a<t3count;a++){
   const ang=(a/t3count)*Math.PI*2+t*0.14;
   const r=40,tx=Math.cos(ang)*r,ty=-H*0.47+Math.sin(ang)*r*0.7;
   _drawLightning(ctx,0,-H*0.47,tx,ty,'#ff8030',0.6);
  }
  // vapor/humo de pistones
  if(!reduced){
   ctx.fillStyle='rgba(180,180,200,0.18)';
   for(const side of[-1,1]){
    const px=side*40+(reduced?0:osc*2);
    ctx.beginPath();ctx.arc(px,-H*0.55,10+Math.abs(fast)*4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(px+side*6,-H*0.65,7,0,Math.PI*2);ctx.fill();
   }
  }
 }

 ctx.restore();
}

// ── utilidades internas ─────────────────────────────────────────────────────
function _rr(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}

function _rivets(ctx,xs,y,r,fill,stroke){
 for(const x of xs){
  ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=stroke;ctx.lineWidth=0.6;ctx.stroke();
 }
}

function _drawArc(ctx,x1,y1,x2,y2,color,wave,t,tier){
 ctx.save();ctx.strokeStyle=color;ctx.lineWidth=tier>=3?2:1.4;
 ctx.shadowColor=color;ctx.shadowBlur=8;
 ctx.beginPath();
 const mx=(x1+x2)/2,my=(y1+y2)/2-20+wave*10;
 ctx.moveTo(x1,y1);ctx.quadraticCurveTo(mx,my,x2,y2);ctx.stroke();
 ctx.restore();
}

function _drawLightning(ctx,x1,y1,x2,y2,color,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=1;
 const segs=4;
 let px=x1,py=y1;
 ctx.beginPath();ctx.moveTo(px,py);
 for(let s=1;s<=segs;s++){
  const frac=s/segs;
  const nx=x1+(x2-x1)*frac+(Math.random()-.5)*12;
  const ny=y1+(y2-y1)*frac+(Math.random()-.5)*8;
  ctx.lineTo(nx,ny);
  px=nx;py=ny;
 }
 ctx.lineTo(x2,y2);ctx.stroke();
 ctx.restore();
}
