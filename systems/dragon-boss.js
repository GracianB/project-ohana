import {chapterBossStart,chapterBossFinish} from './chapters-lunar-prism-embers.js';
// CORDILLERA DE LAS BRASAS — Guardián del Núcleo Ígneo (Dragón's personal mini boss).
// 100% vector Canvas drawing: colossal igneous dragon guardian with molten magma scales.
// Three phases: magma charge, volcanic eruption barrage, and full solar flare overload.
export const DRAGON_BOSS_ID='hub-dragon-boss-v1';
export const DRAGON_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','lava_barrage','magma_slam','solar_eruption']);
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
 e._igneousDragon={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,columns:[]};
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
   b.phase='attack';b.clock=b.attack===0?30:22;b.burst=0;
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
   b.burst=1;
  }
  if(b.attack===0){
   e.x+=b.aim*9.5;e.facing=b.aim;
   if(g.fx&&b.clock%3===0){
    g.fx.emit(e.x+e.w/2,e.y+e.h-15,{color:'#ff9100',count:3,size:2.5,life:18});
   }
  }
  if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<e.w*0.52&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*0.58){
   hurt?.(b.tier===3?20:14,'dragon-boss');
  }
  if(--b.clock<=0){
   b.phase='rest';b.clock=b.tier===3?35:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;
  }
 }
 chapterBossFinish(e,g,b,previous);
 return true;
}

export function drawDragonBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._dragonBoss)return;
 const b=e._igneousDragon,x=e.x-cam.x,y=e.y-cam.y,cx=x+e.w/2;
 const panW=230,panH=62,px=cx-panW/2,py=Math.max(12,y-96);

 ctx.save();
 // Panel holográfico de magma
 ctx.fillStyle='rgba(30,12,10,0.88)';
 ctx.strokeStyle='rgba(255,109,0,0.65)';ctx.lineWidth=1.5;
 _rr(ctx,px,py,panW,panH,5);ctx.fill();ctx.stroke();

 // Pips de tier de fuego
 const TIER_COL=['#ff6d00','#ff9100','#ff1744'];
 for(let i=0;i<3;i++){
  ctx.fillStyle=i<b.tier?TIER_COL[i]:'#26120e';
  ctx.beginPath();ctx.arc(px+14+i*14,py+11,4.5,0,TAU);ctx.fill();
  if(i<b.tier){
   ctx.strokeStyle='rgba(255,230,120,0.8)';ctx.lineWidth=1.2;
   ctx.beginPath();ctx.arc(px+14+i*14,py+11,4.5,0,TAU);ctx.stroke();
  }
 }

 // Nombre
 ctx.fillStyle='#ffe0b2';ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText('GUARDIÁN ÍGNEO',cx,py+14);

 // Barra de vida segmentada
 const barX=px+10,barY=py+24,barW=panW-20,barH=9;
 const hpRatio=Math.max(0,e.hp/e.max);
 ctx.fillStyle='rgba(16,8,6,0.9)';_rr(ctx,barX,barY,barW,barH,3);ctx.fill();

 const gBar=ctx.createLinearGradient(barX,barY,barX+barW*hpRatio,barY);
 gBar.addColorStop(0,b.tier===3?'#d50000':b.tier===2?'#ff6d00':'#ffab00');
 gBar.addColorStop(1,b.tier===3?'#ff5252':'#ffe082');
 ctx.fillStyle=gBar;_rr(ctx,barX,barY,barW*hpRatio,barH,3);ctx.fill();

 ctx.strokeStyle='rgba(255,204,128,0.7)';ctx.lineWidth=1;_rr(ctx,barX,barY,barW,barH,3);ctx.stroke();

 // Icono y aviso táctico
 const PHASE_INFO={
  intro:{icon:'◎',col:'#ffb74d',txt:'DESPERTANDO GUARDIÁN ÍGNEO'},
  rest:{icon:'◉',col:'#80cbc4',txt:'¡VULNERABLE! ATACA EN SU RECUPERACIÓN'},
  warn:{icon:'▲',col:'#ff6d00',txt:['¡EMBESTIDA ÍGNEA! SALTA','VOLEA DE ROCAS DE LAVA','GOLPE DE MAGMA · ONDA SÍSMICA','ERUPCIÓN SOLAR · CAMBIA DE ALTURA'][b.attack]},
  attack:{icon:'✦',col:'#ff1744',txt:'DESCARGA DE FUEGO'}
 };
 const pi=PHASE_INFO[b.phase]||PHASE_INFO.intro;
 ctx.fillStyle=pi.col;ctx.font='bold 12px monospace';ctx.textAlign='left';
 ctx.fillText(pi.icon,px+10,py+49);
 ctx.fillStyle='rgba(255,243,224,0.95)';ctx.font='10px monospace';
 ctx.fillText(pi.txt,px+26,py+49);

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
 ctx.translate(x+e.w/2,y+e.h);
 const flip=b.aim||1;ctx.scale(flip,1);

 // Ambient flame aura
 const pulse=Math.sin(t*0.14)*4;
 const glowGrad=ctx.createRadialGradient(0,-50,15,0,-50,75);
 glowGrad.addColorStop(0,b.tier===3?'rgba(255,230,120,0.45)':'rgba(255,100,30,0.35)');
 glowGrad.addColorStop(1,'rgba(255,60,10,0)');
 ctx.fillStyle=glowGrad;ctx.fillRect(-85,-125,170,140);

 // Magma lizard quadruped body
 ctx.fillStyle='#230c08';ctx.strokeStyle='#ff622a';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.ellipse(0,-42,54,34,0,0,TAU);
 ctx.fill();ctx.stroke();

 // Glowing volcanic fissures on body
 ctx.strokeStyle='#ffd255';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(-28,-42);ctx.lineTo(-8,-52);ctx.lineTo(12,-38);ctx.lineTo(34,-44);
 ctx.stroke();

 // Strong front and back claws
 ctx.fillStyle='#180604';ctx.strokeStyle='#ff5220';ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(-34,-8,14,0,TAU);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.arc(34,-8,14,0,TAU);ctx.fill();ctx.stroke();

 // Heavy horned dragon head
 ctx.fillStyle='#2a0f0a';ctx.strokeStyle='#ff743a';ctx.lineWidth=2.5;
 ctx.beginPath();
 ctx.moveTo(32,-56);ctx.lineTo(68,-64);ctx.lineTo(76,-42);ctx.lineTo(44,-34);
 ctx.closePath();ctx.fill();ctx.stroke();

 // Twin flaming horns
 ctx.fillStyle='#ff4015';ctx.strokeStyle='#ffe885';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.moveTo(42,-64);ctx.quadraticCurveTo(55,-92+pulse,68,-96+pulse);ctx.lineTo(52,-64);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(34,-62);ctx.quadraticCurveTo(45,-84+pulse,56,-88+pulse);ctx.lineTo(42,-60);ctx.fill();ctx.stroke();

 // Blazing golden eye
 ctx.fillStyle=e.telegraph?'#ffffff':'#ffe862';
 ctx.beginPath();ctx.arc(55,-52,5,0,TAU);ctx.fill();

 // Spiked dorsal plates (dientes de magma)
 for(let i=-2;i<=2;i++){
  const sx=i*18,sy=-74-Math.cos(i*0.6)*6+pulse*0.3;
  ctx.fillStyle='#ff5020';ctx.strokeStyle='#ffd870';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(sx-7,-48);ctx.lineTo(sx,sy);ctx.lineTo(sx+7,-48);ctx.closePath();
  ctx.fill();ctx.stroke();
 }

 ctx.restore();

 // Dibujar siempre HUD táctico
 drawDragonBossSignals(ctx,e,cam,t);
 return true;
}
