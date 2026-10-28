import {chapterBossStart,chapterBossFinish} from './chapters-lunar-prism-embers.js';
// LOS JARDINES DE LA LUNA — Oráculo Medusaluna (Michicornio's personal mini boss).
// 100% vector Canvas drawing: colossal astral celestial feline with iridescent moon jelly mantle.
// Four phases: shadow pounce, dream orb barrage, crescent ground strike, and full eclipse barrage.
export const MICHI_BOSS_ID='hub-michi-boss-v1';
export const MICHI_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['pounce','dream_barrage','crescent_strike','eclipse_overload']);
const TAU=Math.PI*2;

export function createMichiBoss(makeFoe,rng=()=>.5,options={}){
 const arena=Object.freeze({...MICHI_BOSS,...options.arena}),roomId=options.roomId||'hub',x=options.x??3420;
 const e=makeFoe(x,arena.floor-96,'cangrejo',roomId,997,{rng});
 e._chapterArena=arena;e._growthChapter=options.chapter||null;
 e.x=x;e.y=arena.floor-96;e.w=118;e.h=96;
 e.hp=e.max=arena.hp;if(e._growthChapter){e.damageTakenScale=0;e.damageWindowRemaining=0;}
 e.miniBoss=true;e._michiBoss=true;
 e._campaignOriginal=true;e.spawnIndex=999;
 e._encounterSaveId=options.encounterId||MICHI_BOSS_ID;
 e.roomId=roomId;e.color='#e5c2ff';e.contactDmg=0;
 e._astralCat={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,pattern:'pounce'};
 return e;
}

export function updateMichiBoss(e,g,hurt){
 if(!e?._michiBoss)return false;
 const b=e._astralCat,p=g.player,arena=e._chapterArena||MICHI_BOSS,previous=b.phase;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x));
 e.y=arena.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;
 if(!chapterBossStart(e,g,b))return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'ORÁCULO MEDUSALUNA · DESPIERTO','#e5c2ff',true);
   if(b.clock<=0){b.phase=e._growthChapter?'warn':'rest';b.clock=50;b.aim=Math.sign(dx)||1;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if((--b.clock<=0||e._growthChapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<900){
   b.aim=Math.sign(dx)||1;b.phase='warn';b.pattern=PATTERNS[b.attack];
   b.clock=b.tier===3?35:50;b.exposed=false;
   if(e._growthChapter&&b.attack===3){
    b.columns=[-120,0,120].map(offset=>Math.max(arena.left+25,Math.min(arena.right-25,p.x+p.w/2+offset)));
   }
  }
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24&&!e._growthChapter){
   b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡ESPÍRITU ATURDIDO!','#ffd6fa',true);
  }else if(--b.clock<=0){
   b.phase='attack';b.clock=b.attack===0?28:20;b.burst=0;
  }
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const astralWave=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:22,h:16,vx:direction*speed,vy:0,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#e5c2ff'});
   }
  };
  if(!b.burst){
   if(b.attack===2){astralWave(b.aim,6.5);if(b.tier>1)astralWave(-b.aim,4.5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5,vy:-3,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ffb6e4'});
     }
    }
   }
   if(b.attack===3){
    // Lunar eclipse starlight barrage from above
    const cols=b.columns||[-80,0,80].map(off=>p.x+off);
    for(let i=0;i<cols.length;i++){
     const sx=cols[i];
     g.fx?.emit?.(sx,p.y-120,{color:'#e5c2ff',count:8,size:3,star:true,life:30});
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:sx-9,y:e.y-180,w:18,h:32,vx:0,vy:8,life:90,dmg:b.tier===3?22:15,owner:'enemy',shape:'orb',color:'#ffcbf2'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){
   e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x+b.aim*(b.tier===3?9.5:6.2)));
   if(Math.abs(dx)<(e.w+p.w)/2&&Math.abs(p.y+p.h/2-e.y-e.h/2)<(p.h+e.h)/2){
    hurt?.(b.tier===3?22:16,'ZARPAZO ASTRAL');
   }
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?38:70;b.attack=(b.attack+1)%PATTERNS.length;b.exposed=true;}
 }
 e.stun=Math.min(e.stun||0,2);
 e._campaign={wind:e.wind,active:e.lunge,aim:b.aim};
 chapterBossFinish(e,g,b,previous);
 return true;
}

// ─── HUD holográfico y señales tácticas del Oráculo Medusaluna ───────────────
export function drawMichiBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._michiBoss)return;
 const b=e._astralCat,cx=e.x+e.w/2-cam.x,cy=e.y-cam.y;
 const panW=290,panH=72,px=cx-panW/2,py=cy-panH-20;
 ctx.save();

 // 1. Panel de fondo holográfico astral
 ctx.save();
 ctx.shadowColor='#e5c2ff';ctx.shadowBlur=reduced?0:12;
 ctx.strokeStyle='#b88ce8';ctx.lineWidth=2;
 _rr(ctx,px-2,py-2,panW+4,panH+4,5);ctx.stroke();

 const grad=ctx.createLinearGradient(px,py,px,py+panH);
 grad.addColorStop(0,'rgba(18,10,34,0.94)');grad.addColorStop(1,'rgba(28,16,52,0.88)');
 ctx.fillStyle=grad;_rr(ctx,px,py,panW,panH,4);ctx.fill();

 ctx.strokeStyle='rgba(229,194,255,0.55)';ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(px+8,py+18);ctx.lineTo(px+panW-8,py+18);ctx.stroke();
 ctx.restore();

 // 2. Pips de tier cósmicos
 const TIER_COL=['#593f78','#aa68d6','#ff6289'];
 for(let i=0;i<3;i++){
  ctx.fillStyle=i<b.tier?TIER_COL[i]:'#201633';
  ctx.beginPath();ctx.arc(px+12+i*14,py+9,4,0,TAU);ctx.fill();
  if(i<b.tier){
   ctx.strokeStyle='rgba(255,220,250,0.7)';ctx.lineWidth=1;
   ctx.beginPath();ctx.arc(px+12+i*14,py+9,4,0,TAU);ctx.stroke();
  }
 }

 // 3. Título
 ctx.fillStyle='#f5e4ff';ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText('ORÁCULO MEDUSALUNA',cx,py+13);

 // 4. Barra de vida segmentada
 const barX=px+10,barY=py+22,barW=panW-20,barH=10;
 const hp=Math.max(0,e.hp/e.max);
 ctx.fillStyle='rgba(14,8,26,0.8)';_rr(ctx,barX,barY,barW,barH,3);ctx.fill();

 const hpGrad=ctx.createLinearGradient(barX,barY,barX+barW*hp,barY);
 hpGrad.addColorStop(0,b.tier===3?'#ff5982':b.tier===2?'#cb75f2':'#75d8f2');
 hpGrad.addColorStop(1,b.tier===3?'#ffb3c5':'#f1cbf9');
 ctx.fillStyle=hpGrad;_rr(ctx,barX,barY,barW*hp,barH,3);ctx.fill();

 ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=1;
 for(let s=1;s<4;s++){ctx.beginPath();ctx.moveTo(barX+barW*s/4,barY);ctx.lineTo(barX+barW*s/4,barY+barH);ctx.stroke();}
 ctx.strokeStyle='rgba(195,148,240,0.7)';ctx.lineWidth=1;_rr(ctx,barX,barY,barW,barH,3);ctx.stroke();

 ctx.fillStyle='rgba(245,225,255,0.65)';ctx.font='9px monospace';ctx.textAlign='right';
 ctx.fillText(Math.ceil(hp*100)+'%',px+panW-8,py+barY-py+barH+1);

 // 5. Icono y texto contextual de fase
 const PHASE_INFO={
  intro:{icon:'◎',col:'#a8e5ff',txt:'DESPERTANDO ESPÍRITU ASTRAL'},
  rest:{icon:'◉',col:'#7af0e0',txt:'NÚCLEO ASTRAL EXPUESTO · ¡ATACA!'},
  warn:{icon:'▲',col:'#ffb86c',txt:['SALTA EL ZARPAZO ASTRAL','ORBES DE SUEÑO · ESQUIVA','MEDIA LUNA · SALTA LA ONDA','ECLIPSE TOTAL · SAL DE LAS COLUMNAS'][b.attack]},
  attack:{icon:'✦',col:'#ff5978',txt:'DESCARGA ASTRAL'}
 };
 const pi=PHASE_INFO[b.phase]||PHASE_INFO.intro;
 const iconAlpha=b.phase==='warn'&&!reduced?0.55+0.45*Math.abs(Math.sin(t*0.18)):1;
 ctx.globalAlpha=iconAlpha;
 ctx.fillStyle=pi.col;ctx.font='bold 13px monospace';ctx.textAlign='left';
 ctx.fillText(pi.icon,px+10,py+50);
 ctx.globalAlpha=1;
 ctx.fillStyle='rgba(235,225,255,0.92)';ctx.font='10px monospace';
 ctx.fillText(pi.txt,px+26,py+50);

 // Flash suave en tier 3 warn
 if(b.tier===3&&b.phase==='warn'&&!reduced){
  ctx.fillStyle=`rgba(255,80,130,${0.06*Math.abs(Math.sin(t*0.22))})`;
  _rr(ctx,px,py,panW,panH,4);ctx.fill();
 }

 // 6. Telegraph en el suelo y hacia el objetivo
 if(b.phase==='warn'){
  const floor=e._chapterArena?.floor?e._chapterArena.floor-cam.y:1134-cam.y;
  ctx.strokeStyle='rgba(230,190,255,0.65)';ctx.lineWidth=2.5;ctx.setLineDash([9,6]);

  if(b.attack===3){
   // Columnas celestiales de aviso
   for(const sx of b.columns||[]){
    const tg=ctx.createLinearGradient(sx-cam.x,floor-300,sx-cam.x,floor);
    tg.addColorStop(0,'rgba(230,170,255,0)');tg.addColorStop(0.5,'rgba(210,140,255,0.45)');tg.addColorStop(1,'rgba(255,100,160,0.85)');
    ctx.strokeStyle=tg;
    ctx.beginPath();ctx.moveTo(sx-cam.x,floor-300);ctx.lineTo(sx-cam.x,floor);ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle='rgba(255,120,180,0.9)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(sx-cam.x,floor-4,12,0,TAU);ctx.stroke();
   }
  }else{
   const dir=b.aim||1;
   const tipX=cx+dir*(b.attack===0?320:260);
   ctx.beginPath();ctx.moveTo(cx,floor-8);ctx.lineTo(tipX,floor-8);ctx.stroke();
   ctx.setLineDash([]);
   // Flecha direccional
   ctx.fillStyle='rgba(235,180,255,0.85)';
   ctx.beginPath();ctx.moveTo(tipX,floor-8);ctx.lineTo(tipX-dir*14,floor-15);ctx.lineTo(tipX-dir*14,floor-1);ctx.closePath();ctx.fill();
  }
  ctx.setLineDash([]);
 }

 // Anillo telegraph de combate en el cuerpo
 if(e.telegraph||b.exposed){
  ctx.save();
  const tr=reduced?0:Math.sin(t*0.2)*6;
  if(b.exposed){
   ctx.strokeStyle='rgba(122,240,224,0.68)';ctx.lineWidth=3;
   ctx.beginPath();ctx.ellipse(cx,cy+e.h/2,Math.max(46,e.w*.58)+tr,Math.max(46,e.h*.68)+tr*.8,0,0,TAU);ctx.stroke();
  }else{
   ctx.strokeStyle=`rgba(235,170,255,${0.6+0.35*Math.abs(Math.sin(t*0.16))})`;ctx.lineWidth=2.5;
   ctx.beginPath();ctx.arc(cx,cy+e.h/2,66+tr,0,TAU);ctx.stroke();
  }
  ctx.restore();
 }

 ctx.restore();
}

// ─── Cuerpo del Oráculo Medusaluna ───────────────────────────────────────────
export function drawMichiBossBody(ctx,e,cam,t=0,reduced=false){
 if(!e?._michiBoss)return;
 const b=e._astralCat,w=e.w,h=e.h;
 const beat=reduced?0:Math.sin(t*.066),swim=reduced?0:Math.sin(t*.095);
 const x=e.x+w/2-cam.x,y=e.y+h-cam.y;
 const disk=(x,y,rx,ry,color)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=color;ctx.fill();};
 const stroke=(color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
 const jewel=(x,y,r,color)=>{
  ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.7,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.7,y);ctx.closePath();
  ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#27253f';ctx.lineWidth=1;ctx.stroke();
 };

 ctx.save();ctx.translate(x,y);

 // Silueta de aura envolvente
 ctx.globalAlpha=.15;disk(0,-h*.48,w*.78,h*.7,'#d5b6ff');ctx.globalAlpha=1;

 // Velos de medusa flotantes (7 tentáculos con oscilaciones independientes)
 for(let i=0;i<7;i++){
  const lane=i-3,root=lane*13,tip=lane*17+swim*(i%2?9:-9);
  ctx.beginPath();ctx.moveTo(root,-h*.54);
  ctx.bezierCurveTo(root-17,-h*.27,tip+18,-h*.22,tip,-4+beat*2);
  stroke('#3f2b59',i===3?11:8);
  stroke(i%2?'#b7b4fa':'#87e5e8',i===3?7:5);
  disk(tip,-3+beat*2,4,5,i%2?'#fff7fa':'#b9ffff');
 }

 // Alas de protección laterales
 for(const side of [-1,1]){
  ctx.save();ctx.scale(side,1);
  ctx.beginPath();ctx.moveTo(16,-h*.65);
  ctx.bezierCurveTo(38,-h*1.06,72,-h*1.1,60,-h*.52);
  ctx.bezierCurveTo(43,-h*.3,27,-h*.3,16,-h*.65);
  ctx.closePath();ctx.fillStyle='#564071';ctx.fill();stroke('#c9afec',2.5);
  for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(23,-h*.6+j*7);ctx.lineTo(53,-h*.77+j*12);stroke('#e8dcff',1.3);}
  ctx.restore();
 }

 // Cúpula de cristal lunar iridiscente
 ctx.beginPath();ctx.moveTo(-w*.45,-h*.42);
 ctx.bezierCurveTo(-w*.44,-h*1.08,-w*.22,-h*1.17,0,-h*1.17);
 ctx.bezierCurveTo(w*.24,-h*1.17,w*.46,-h*.93,w*.45,-h*.42);
 ctx.quadraticCurveTo(w*.28,-h*.3,w*.14,-h*.42);
 ctx.quadraticCurveTo(0,-h*.32,-w*.15,-h*.42);
 ctx.quadraticCurveTo(-w*.32,-h*.3,-w*.45,-h*.42);ctx.closePath();

 const g=ctx.createLinearGradient(0,-h*1.12,0,-h*.35);
 g.addColorStop(0,b.tier===3?'#ffd4ac':'#fff6ff');
 g.addColorStop(.28,b.tier===3?'#f5a8cb':'#d2eefe');
 g.addColorStop(.68,b.tier===3?'#b864d4':'#b6a8ee');
 g.addColorStop(1,'#6a467d');
 ctx.fillStyle=g;ctx.fill();stroke('#27253f',3.8);

 // Estructura interna de vidrio
 ctx.globalAlpha=.35;disk(0,-h*.76,w*.28,h*.26,'#e9f9ff');ctx.globalAlpha=1;
 for(let j=-2;j<=2;j++){
  ctx.beginPath();ctx.moveTo(j*8,-h*1.04);
  ctx.quadraticCurveTo(j*20,-h*.78,j*22,-h*.53);stroke('rgba(255,255,255,.75)',1.9);
 }

 // Aletas de corona y cuerno central de eclipse
 for(const side of [-1,1]){
  ctx.beginPath();ctx.moveTo(side*18,-h*1.03);
  ctx.lineTo(side*37,-h*1.31);ctx.lineTo(side*35,-h*.89);
  ctx.closePath();ctx.fillStyle='#f9d6e8';ctx.fill();stroke('#47406b',2);
 }
 ctx.beginPath();ctx.moveTo(-9,-h*1.11);ctx.lineTo(0,-h*1.47);
 ctx.lineTo(9,-h*1.11);ctx.closePath();ctx.fillStyle='#ffedaf';ctx.fill();stroke('#46365f',2.4);

 // Ojos y expresión según fase / tier
 for(const side of [-1,1]){
  disk(side*21,-h*.76,12,15,'#fdfaff');
  disk(side*21+(b.aim||1)*2,-h*.76,7,10,b.tier===3?'#e39c59':'#8054a7');
  disk(side*22+(b.aim||1)*2,-h*.76,3,8,'#32234c');
  disk(side*19,-h*.80,2,3,'#fff');
  disk(side*39,-h*.61,6,3,'#eaa6d9');
 }
 ctx.beginPath();ctx.moveTo(-9,-h*.58);ctx.quadraticCurveTo(0,-h*.51+(reduced?0:beat),9,-h*.58);stroke('#4c3e6e',2);

 // Joya y núcleo astral: cuando exposed emite 8 haces radiales de luz
 const coreR=b.exposed?14:11;
 if(b.exposed&&!reduced){
  for(let ray=0;ray<8;ray++){
   const ang=ray*Math.PI/4+t*0.04;
   const blen=26+Math.abs(beat)*5;
   ctx.strokeStyle='rgba(122,240,224,0.7)';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(0,-h*.98);ctx.lineTo(Math.cos(ang)*blen,-h*.98+Math.sin(ang)*blen);ctx.stroke();
  }
 }
 jewel(0,-h*.98,coreR,b.exposed?'#b6fff1':'#fce1ab');

 // Reliquias estelares orbitando según tier
 for(let j=0;j<b.tier;j++){
  const angle=j*TAU/b.tier+(reduced?0:t*.021),r=w*.55;
  jewel(Math.cos(angle)*r,-h*.77+Math.sin(angle)*16,5,j%2?'#ffdcac':'#dffaff');
 }

 if(e.invuln>0){ctx.globalAlpha=.16;disk(0,-h*.7,w*.54,h*.57,'#fff');}
 ctx.restore();
}

function _rr(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
