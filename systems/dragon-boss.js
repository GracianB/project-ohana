import {chapterBossStart,chapterBossFinish} from './chapters-lunar-prism-embers.js';
// CORDILLERA DE LAS BRASAS — Guardián del Núcleo Ígneo (Dragon's personal mini boss).
// 100% vector Canvas drawing: colossal igneous dragon guardian with molten magma scales.
// Three phases: magma charge, volcanic eruption barrage, and full solar flare overload.
// V612: boss colosal con 7 espinas, colas ondulantes, grietas de magma, lluvia de meteoros.
export const DRAGON_BOSS_ID='hub-dragon-boss-v1';
export const DRAGON_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=['charge','lava_barrage','magma_slam','solar_eruption','meteor_rain'];
const TAU=Math.PI*2;

function _rr(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}

export function createDragonBoss(makeFoe,rng=()=>.5,options={}){
 const arena=Object.freeze({...DRAGON_BOSS,...options.arena}),roomId=options.roomId||'hub',x=options.x??3420;
 const e=makeFoe(x,arena.floor-100,'cangrejo',roomId,996,{rng});
 e._chapterArena=arena;e._growthChapter=options.chapter||null;
 e.x=x;e.y=arena.floor-100;e.w=124;e.h=100;
 e.hp=e.max=arena.hp;if(e._growthChapter){e.damageTakenScale=0;e.damageWindowRemaining=0;}
 e.miniBoss=true;e._dragonBoss=true;
 e._campaignOriginal=true;e.spawnIndex=996;
 e._encounterSaveId=options.encounterId||DRAGON_BOSS_ID;
 e.roomId=roomId;e.color='#ff6a2a';e.contactDmg=0;
 e._igneousDragon={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,columns:[],rearUp:0};
 return e;
}

export function updateDragonBoss(e,g,hurt){
 if(!e?._dragonBoss)return false;
 const b=e._igneousDragon,p=g.player,arena=e._chapterArena||DRAGON_BOSS,previous=b.phase;
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
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'GUARDIÁN DEL NÚCLEO ÍGNEO · DESPIERTO','#ff8a50',true);
   if(b.clock<=0){b.phase=e._growthChapter?'warn':'rest';b.clock=50;b.aim=Math.sign(dx)||1;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if((--b.clock<=0||e._growthChapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<900){
   b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;
   if(b.attack===3){
    b.columns=[-120,0,120].map(off=>Math.max(arena.left+40,Math.min(arena.right-40,p.x+p.w/2+off)));
   }
  }
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24&&!e._growthChapter){
   b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡GUARDIÁN ATURDIDO!','#ffe89c',true);
  }else if(--b.clock<=0){
   b.phase='attack';b.clock=b.attack===0?30:22;b.burst=0;b.rearUp=0;
  }
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const magmaWave=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:24,h:18,vx:direction*speed,vy:0,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#ff5420'});
   }
  };
  if(!b.burst){
   if(b.attack===0){
    g.fx?.emit?.(e.x+e.w/2,e.y+e.h-20,{color:'#ff6d00',count:14,size:3.5,life:25});
   }
   if(b.attack===2){
    magmaWave(b.aim,6.5);
    if(b.tier>1)magmaWave(-b.aim,4.5);
    g.fx?.emit?.(e.x+e.w/2,arena.floor-10,{color:'#ff3d00',count:18,size:4,life:30});
   }
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:22,h:22,vx:side*5,vy:-3,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ff9030'});
     }
    }
    if(b.tier===3&&g.projectiles.length<130){
     g.projectiles.push({x:e.x+e.w/2,y:e.y+15,w:26,h:26,vx:b.aim*7,vy:-4,life:120,dmg:16,owner:'enemy',shape:'orb',color:'#ffd54f'});
    }
   }
   if(b.attack===3&&b.tier>=2){
    const count=b.tier===3?5:3;
    for(let k=-Math.floor(count/2);k<=Math.floor(count/2);k++){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+30,w:18,h:18,vx:k*3.2,vy:-4.5,life:130,dmg:15,owner:'enemy',shape:'orb',color:'#ffe668'});
     }
    }
   }
   // Patrón 4: lluvia de meteoros (solo tier 3)
   if(b.attack===4&&b.tier===3){
    b.rearUp=40;// telegrafía: jefe se incorpora
    // Fase de telegrafía: 40 ticks luego dispara
    for(let k=-3;k<=3;k++){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({
       x:e.x+e.w/2,y:e.y+20,w:20,h:20,
       vx:k*4,vy:-8,life:160,
       dmg:18,owner:'enemy',shape:'orb',color:'#ff4400',
       _meteor:true,_gravDelay:80
      });
     }
    }
    g.fx?.emit?.(e.x+e.w/2,e.y-20,{color:'#ff4400',count:22,size:5,life:40});
   }
   b.burst=1;
  }
  // Actualizar gravedad de meteoros en vuelo
  if(g.projectiles){
   for(const proj of g.projectiles){
    if(proj._meteor&&proj._gravDelay!==undefined){
     if(proj._gravDelay>0){proj._gravDelay--;}
     else if(proj.vy<8){proj.vy+=0.3;}
    }
   }
  }
  if(b.attack===0){
   e.x+=b.aim*9.5;e.facing=b.aim;
   if(g.fx&&b.clock%3===0){
    g.fx.emit(e.x+e.w/2,e.y+e.h-15,{color:'#ff9100',count:3,size:2.5,life:18});
   }
  }
  if(b.rearUp>0)b.rearUp--;
  if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<e.w*0.52&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*0.58){
   hurt?.(b.tier===3?20:14,'dragon-boss');
  }
  if(--b.clock<=0){
   b.phase='rest';b.clock=b.tier===3?35:55;
   // Patrón 5 solo en tier 3; si no es tier 3 el ataque 4 se salta
   const nextAttack=(b.attack+1)%PATTERNS.length;
   b.attack=(nextAttack===4&&b.tier<3)?0:nextAttack;
   b.burst=0;b.rearUp=0;
  }
 }
 chapterBossFinish(e,g,b,previous);
 return true;
}

export function drawDragonBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._dragonBoss)return;
 const b=e._igneousDragon,x=e.x-cam.x,y=e.y-cam.y,cx=x+e.w/2;
 const panW=260,panH=72,px=cx-panW/2,py=Math.max(12,y-106);

 ctx.save();

 // Borde volcánico decorativo
 ctx.strokeStyle='rgba(255,80,0,0.45)';ctx.lineWidth=1;
 for(let vb=0;vb<6;vb++){
  const vbx=px+vb*(panW/5);
  ctx.beginPath();ctx.moveTo(vbx,py-4);ctx.lineTo(vbx+5,py);ctx.lineTo(vbx,py+4);ctx.stroke();
 }

 // Panel holográfico de magma
 ctx.fillStyle='rgba(30,12,10,0.90)';
 ctx.strokeStyle='rgba(255,109,0,0.70)';ctx.lineWidth=1.8;
 _rr(ctx,px,py,panW,panH,5);ctx.fill();ctx.stroke();

 // Indicador FASE X
 const faseLabel=`FASE ${b.tier}`;
 ctx.fillStyle=b.tier===3?'#ff1744':b.tier===2?'#ff9100':'#ffab00';
 ctx.font='bold 10px monospace';ctx.textAlign='left';
 ctx.fillText(faseLabel,px+panW-52,py+12);

 // Pips de tier de fuego
 const TIER_COL=['#ff6d00','#ff9100','#ff1744'];
 for(let i=0;i<3;i++){
  ctx.fillStyle=i<b.tier?TIER_COL[i]:'#26120e';
  ctx.beginPath();ctx.arc(px+14+i*14,py+13,5,0,TAU);ctx.fill();
  if(i<b.tier){
   ctx.strokeStyle='rgba(255,230,120,0.8)';ctx.lineWidth=1.2;
   ctx.beginPath();ctx.arc(px+14+i*14,py+13,5,0,TAU);ctx.stroke();
  }
 }

 // Nombre del boss
 ctx.fillStyle='#ffe0b2';ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText('GUARDIÁN ÍGNEO',cx,py+16);

 // Barra de vida segmentada
 const barX=px+10,barY=py+28,barW=panW-20,barH=9;
 const hpRatio=Math.max(0,e.hp/e.max);
 ctx.fillStyle='rgba(16,8,6,0.9)';_rr(ctx,barX,barY,barW,barH,3);ctx.fill();

 const gBar=ctx.createLinearGradient(barX,barY,barX+barW*hpRatio,barY);
 gBar.addColorStop(0,b.tier===3?'#d50000':b.tier===2?'#ff6d00':'#ffab00');
 gBar.addColorStop(1,b.tier===3?'#ff5252':'#ffe082');
 ctx.fillStyle=gBar;_rr(ctx,barX,barY,barW*hpRatio,barH,3);ctx.fill();

 ctx.strokeStyle='rgba(255,204,128,0.7)';ctx.lineWidth=1;_rr(ctx,barX,barY,barW,barH,3);ctx.stroke();

 // Nombre de ataque entrante
 const ATTACK_NAMES=['¡EMBESTIDA ÍGNEA! SALTA','VOLEA DE ROCAS DE LAVA','GOLPE DE MAGMA · ONDA SÍSMICA','ERUPCIÓN SOLAR · CAMBIA DE ALTURA','☄ LLUVIA DE METEOROS · MOVERSE'];
 const PHASE_INFO={
  intro:{icon:'◎',col:'#ffb74d',txt:'DESPERTANDO GUARDIÁN ÍGNEO'},
  rest:{icon:'◉',col:'#80cbc4',txt:'¡VULNERABLE! ATACA EN SU RECUPERACIÓN'},
  warn:{icon:'▲',col:'#ff6d00',txt:ATTACK_NAMES[b.attack]||ATTACK_NAMES[0]},
  attack:{icon:'✦',col:'#ff1744',txt:ATTACK_NAMES[b.attack]||'DESCARGA DE FUEGO'}
 };
 const pi=PHASE_INFO[b.phase]||PHASE_INFO.intro;
 ctx.fillStyle=pi.col;ctx.font='bold 12px monospace';ctx.textAlign='left';
 ctx.fillText(pi.icon,px+10,py+56);
 ctx.fillStyle='rgba(255,243,224,0.95)';ctx.font='10px monospace';
 ctx.fillText(pi.txt,px+26,py+56);

 // Telegraph direccional en el suelo
 if(b.phase==='warn'){
  const floor=e._chapterArena?.floor?e._chapterArena.floor-cam.y:1134-cam.y;
  ctx.strokeStyle='rgba(255,109,0,0.75)';ctx.lineWidth=2.5;ctx.setLineDash([8,6]);
  const dir=b.aim||1;
  const tipX=cx+dir*(b.attack===0?320:250);
  ctx.beginPath();ctx.moveTo(cx,floor-8);ctx.lineTo(tipX,floor-8);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,109,0,0.85)';
  ctx.beginPath();ctx.moveTo(tipX,floor-8);ctx.lineTo(tipX-dir*14,floor-14);ctx.lineTo(tipX-dir*14,floor-2);ctx.closePath();ctx.fill();
 }

 // Anillo telegraph en el cuerpo
 if(e.telegraph||b.exposed){
  const tr=reduced?0:Math.sin(t*0.2)*5;
  ctx.strokeStyle=b.exposed?'rgba(128,203,196,0.75)':'rgba(255,87,34,0.75)';
  ctx.lineWidth=2.8;
  ctx.beginPath();ctx.arc(cx,y+e.h/2,64+tr,0,TAU);ctx.stroke();
 }

 ctx.restore();
}

export function drawDragonBoss(ctx,e,cam,t){
 if(!e?._dragonBoss)return false;
 const b=e._igneousDragon,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 // Dibujar visualmente más grande (w=160, h=130) pero hitbox sigue siendo w=124 h=100
 ctx.translate(x+e.w/2,y+e.h);
 const flip=b.aim||1;ctx.scale(flip,1);

 const pulse=Math.sin(t*0.14)*4;
 const tier3=b.tier===3;

 // Aura de llamas ambiental
 const glowGrad=ctx.createRadialGradient(0,-65,20,0,-65,100);
 glowGrad.addColorStop(0,tier3?'rgba(255,240,80,0.55)':'rgba(255,100,30,0.40)');
 glowGrad.addColorStop(1,'rgba(255,60,10,0)');
 ctx.fillStyle=glowGrad;ctx.fillRect(-100,-145,200,165);

 // Cola de látigo ondulante (dibujada detrás del cuerpo)
 const tailWave=Math.sin(t*0.16)*10;
 const tailWave2=Math.sin(t*0.12+1)*8;
 ctx.strokeStyle=tier3?'#ffaa00':'#cc4400';ctx.lineWidth=12;ctx.lineCap='round';
 ctx.beginPath();
 ctx.moveTo(-50,-30);
 ctx.bezierCurveTo(-70,-20+tailWave,-85,-30+tailWave2,-95,-18+tailWave);
 ctx.stroke();
 ctx.strokeStyle=tier3?'#ffd54f':'#ff6d00';ctx.lineWidth=6;
 ctx.beginPath();
 ctx.moveTo(-50,-30);
 ctx.bezierCurveTo(-70,-20+tailWave,-85,-30+tailWave2,-95,-18+tailWave);
 ctx.stroke();
 // Punta afilada de la cola
 ctx.fillStyle=tier3?'#ffdd00':'#ff8a00';
 ctx.beginPath();ctx.arc(-95,-18+tailWave,6,0,TAU);ctx.fill();

 // 4 patas musculosas y garras
 const legData=[[-44,-8,-1],[-26,0,-1],[26,0,1],[44,-8,1]];
 for(const [lx,ly,side] of legData){
  ctx.fillStyle='#1a0806';ctx.strokeStyle=tier3?'#ff9900':'#ff5220';ctx.lineWidth=3;
  // Muslo
  ctx.beginPath();ctx.ellipse(lx,ly,10,7,side*0.3,0,TAU);ctx.fill();ctx.stroke();
  // Pierna inferior
  ctx.strokeStyle='#ff4010';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(lx,ly+5);ctx.lineTo(lx+side*8,ly+18);ctx.stroke();
  // Garras
  ctx.strokeStyle='#2c1008';ctx.lineWidth=2;
  for(let ci=0;ci<3;ci++){
   const ca=-0.3+ci*0.3;
   ctx.beginPath();ctx.moveTo(lx+side*8,ly+18);
   ctx.lineTo(lx+side*8+Math.cos(ca)*10*side,ly+18+Math.sin(ca)*8);
   ctx.stroke();
  }
 }

 // Cuerpo principal masivo armado
 ctx.fillStyle=tier3?'#2e1108':'#230c08';
 ctx.strokeStyle=tier3?'#ff9900':'#ff622a';ctx.lineWidth=4;
 ctx.beginPath();
 ctx.ellipse(0,-50,68,42,0,0,TAU);
 ctx.fill();ctx.stroke();

 // Escamas/plaquetas de pecho (arcos superpuestos)
 ctx.strokeStyle=tier3?'rgba(255,180,0,0.45)':'rgba(255,120,40,0.35)';ctx.lineWidth=2;
 for(let row=0;row<3;row++){
  for(let col=-2;col<=2;col++){
   const scx=col*22,scy=-50+row*14;
   ctx.beginPath();ctx.arc(scx,scy,13,Math.PI*0.15,Math.PI*0.85);ctx.stroke();
  }
 }

 // Grietas de magma en el cuerpo (líneas naranjas brillantes)
 ctx.strokeStyle=tier3?'#ffdd00':'#ff8000';ctx.lineWidth=2.5;
 ctx.beginPath();
 ctx.moveTo(-38,-52);ctx.lineTo(-14,-62);ctx.lineTo(8,-48);ctx.lineTo(32,-58);ctx.lineTo(48,-44);
 ctx.stroke();
 ctx.strokeStyle=tier3?'rgba(255,220,0,0.6)':'rgba(255,140,0,0.5)';ctx.lineWidth=1.5;
 ctx.beginPath();
 ctx.moveTo(-22,-40);ctx.lineTo(-6,-50);ctx.lineTo(16,-38);
 ctx.stroke();

 // Cresta dorsal de 7 espinas alternando altas/cortas
 const spineHeights=[28,20,34,20,34,20,28];
 for(let i=0;i<7;i++){
  const sx=(i-3)*20;
  const sh=spineHeights[i];
  const sy=-92-sh+pulse*0.4;
  ctx.fillStyle=tier3?'#ff8800':'#ff5020';
  ctx.strokeStyle=tier3?'#ffdd44':'#ffd870';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(sx-8,-58);ctx.lineTo(sx,sy);ctx.lineTo(sx+8,-58);ctx.closePath();
  ctx.fill();ctx.stroke();
  // Punta incandescente
  ctx.fillStyle=tier3?'#ffffff':'#ffe082';
  ctx.beginPath();ctx.arc(sx,sy,3,0,TAU);ctx.fill();
 }

 // Cabeza dragónica masiva
 ctx.fillStyle=tier3?'#3a1208':'#2a0f0a';
 ctx.strokeStyle=tier3?'#ff9940':'#ff743a';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(36,-68);ctx.lineTo(82,-78);ctx.lineTo(92,-52);ctx.lineTo(50,-40);
 ctx.closePath();ctx.fill();ctx.stroke();

 // 2 cuernos masivos curvos con llamas en las puntas
 ctx.fillStyle=tier3?'#ff8800':'#ff4015';
 ctx.strokeStyle=tier3?'#ffdd44':'#ffe885';ctx.lineWidth=2;
 // Cuerno 1
 ctx.beginPath();ctx.moveTo(50,-78);ctx.quadraticCurveTo(66,-114+pulse,82,-120+pulse);ctx.lineTo(64,-78);ctx.fill();ctx.stroke();
 // Cuerno 2
 ctx.beginPath();ctx.moveTo(42,-74);ctx.quadraticCurveTo(56,-106+pulse,70,-112+pulse);ctx.lineTo(54,-72);ctx.fill();ctx.stroke();
 // Llamas en punta de cuernos
 const flameCol=tier3?'#ffee44':'#ff6600';
 ctx.fillStyle=flameCol;ctx.globalAlpha=0.8+Math.sin(t*0.25)*0.2;
 ctx.beginPath();ctx.arc(82,-120+pulse,5+pulse*0.2,0,TAU);ctx.fill();
 ctx.beginPath();ctx.arc(70,-112+pulse,4+pulse*0.15,0,TAU);ctx.fill();
 ctx.globalAlpha=1;

 // Ojo con pupila vertical que brilla rojo/dorado según tier
 const eyeColor=tier3?'#ffe862':'#ff4444';
 const pupilColor=tier3?'#aa6600':'#550000';
 ctx.fillStyle=e.telegraph?'#ffffff':eyeColor;
 ctx.beginPath();ctx.arc(66,-62,7,0,TAU);ctx.fill();
 ctx.fillStyle=pupilColor;
 ctx.beginPath();ctx.ellipse(67,-62,2.5,5,0,0,TAU);ctx.fill();

 // Efecto tier 3: brillo total del cuerpo
 if(tier3){
  ctx.strokeStyle='rgba(255,220,80,0.25)';ctx.lineWidth=8;
  ctx.beginPath();ctx.ellipse(0,-50,72,46,0,0,TAU);ctx.stroke();
 }

 ctx.restore();

 // Dibujar siempre HUD táctico
 drawDragonBossSignals(ctx,e,cam,t);
 return true;
}
