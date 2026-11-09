// Stitcho's own three-phase encounter. Uses the same enemy hit pipeline as
// ordinary campaign foes, so H/J/K/L, team echoes and XP remain authoritative.
export const STITCHO_BOSS_ID='hub-stitcho-glitch-v1';
export const STITCHO_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['sweep','charge','cross','meteor']);
export function createStitchoBoss(makeFoe,rng=()=>.5,options={}){
  const arena=Object.freeze({...STITCHO_BOSS,...options.arena});
  const roomId=options.roomId||'hub';
  const x=options.x??3400;
  const e=makeFoe(x,arena.floor-92,'cangrejo',roomId,997,{rng});
  e._stitchoArena=arena;
  e.x=x;e.y=arena.floor-92;e.w=112;e.h=92;
  e.hp=e.max=arena.hp;
  e.miniBoss=true;e._stitchoBoss=true;
  e._campaignOriginal=true;e.spawnIndex=997;
  e._encounterSaveId=options.encounterId||STITCHO_BOSS_ID;
  e.roomId=roomId;e.color='#80ddf8';e.contactDmg=0;
  e._glitch={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
  return e;
}
export function updateStitchoBoss(e,g,hurt){
 if(!e?._stitchoBoss)return false;
 const b=e._glitch,p=g.player,arena=e._stitchoArena||STITCHO_BOSS;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x));
 e.y=arena.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;
 const oldTier=b.tier||1;
 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 if(b.tier>oldTier){
  g.nums?.add?.(e.x+e.w/2,e.y-45,b.tier===2?'¡FASE 2 · SOBRECARGA DE PLASMA!':'¡FASE 3 · CORRUPCIÓN CRÍTICA!',b.tier===2?'#b388ff':'#ff5252',true);
  g.fx?.emit?.(e.x+e.w/2,e.y+e.h*.5,{color:b.tier===2?'#b388ff':'#ff1744',count:18,size:3.5,life:28});
 }
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}
 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'ERROR 626 · EL NÚCLEO DESPIERTA','#bbebff',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?36:55;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=95;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡CIRCUITO INTERRUMPIDO!','#a4ffe0',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===1?28:18;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const wave=(direction,speed=5,vy=0)=>{if((g.projectiles?.length||0)<130)g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-34,w:19,h:19,vx:direction*speed,vy,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#7de6fd'});};
  if(!b.burst){
   if(b.attack===0){wave(b.aim,6);if(b.tier>1)wave(-b.aim,4);}
   if(b.attack===2){wave(-1,4.2,-1);wave(1,4.2,-1);if(b.tier===3){wave(-1,6);wave(1,6);}}
   if(b.attack===3){wave(-1,3,-7);wave(1,3,-7);wave(b.aim,5,-5);}
   b.burst=1;
  }
  if(b.attack===1){
   e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x+b.aim*(b.tier===3?10:6)));
   if(b.clock%5===0)g.fx?.emit?.(e.x+e.w/2,e.y+e.h-6,{color:'#67ddff',count:2,size:2,life:8});
   if(Math.abs(dx)<(e.w+p.w)/2&&Math.abs(p.y+p.h/2-e.y-e.h/2)<(p.h+e.h)/2)
     hurt?.(b.tier===3?22:16,'EMBESTIDA GLITCH');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?37:72;b.attack=(b.attack+1)%PATTERNS.length;b.exposed=true;}
 }
 if(!b.exposed&&(e.flash||0)>0)g.fx?.emit?.(e.x+e.w/2,e.y+e.h*.45,{color:'#67ddff',count:3,size:2,life:10});
 e.stun=Math.min(e.stun||0,2);
 e._campaign={wind:e.wind,active:e.lunge,aim:b.aim};
 return true;
}
export function drawStitchoBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._stitchoBoss||e.hp<=0)return;
 const b=e._glitch,x=e.x+e.w/2-cam.x,y=e.y-cam.y;
 ctx.save();ctx.textAlign='center';ctx.lineJoin='round';ctx.lineCap='round';
 // Cybernetic Holographic HUD Placard
 ctx.fillStyle='#092338f2';ctx.strokeStyle=b.tier===3?'#ff5252':b.tier===2?'#b388ff':'#67ddff';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.roundRect(x-130,y-84,260,72,12);ctx.fill();ctx.stroke();
 // Digital corner circuit nodes
 ctx.fillStyle=ctx.strokeStyle;
 for(const sx of [-124,124])for(const sy of [-78,-18]){
  ctx.fillRect(x+sx-2,y+sy-2,4,4);
 }
 const tierLabel=b.tier===3?'FASE 3: CORRUPCIÓN CRÍTICA 💥':b.tier===2?'FASE 2: SOBRECARGA DE PLASMA ⚡':'FASE 1: PROTOCOLO NORMAL';
 ctx.fillStyle=b.tier===3?'#ff80ab':b.tier===2?'#e1bee7':'#e3faff';
 ctx.font='bold 12px Outfit,sans-serif';ctx.fillText('NÚCLEO GLITCH · '+tierLabel,x,y-65);
 const cue=b.phase==='intro'?'INICIALIZANDO SUBSISTEMAS...':b.phase==='rest'?'¡APERTURA VULNERABLE! · ¡DESCARGA TU COMBO!':b.phase==='warn'?[
  '⚡ BARRIDO DE PLASMA · ¡SALTA LA ONDA!',
  '⏩ EMBESTIDA HIPERSÓNICA · ¡SALTA POR ENCIMA!',
  '✦ ONDAS CRUZADAS · ¡BUSCA EL CENTRO!',
  '☄️ LLUVIA DE CIRCUITOS · ¡SAL DEL IMPACTO!'
 ][b.attack]:'EVITA EL CONTACTO DIRECTO';
 ctx.font='600 10.5px Outfit,sans-serif';
 ctx.fillStyle=b.phase==='rest'?'#69f0ae':b.tier===3?'#ff80ab':'#b9efff';
 ctx.fillText(cue,x,y-47,244);
 // Energy Meter with Notched Phase Thresholds (60% and 26%)
 ctx.fillStyle='#132d42';ctx.fillRect(x-110,y-34,220,6);
 ctx.fillStyle=b.phase==='rest'?'#69f0ae':b.tier===3?'#ff1744':b.tier===2?'#d500f9':'#00e5ff';
 ctx.fillRect(x-110,y-34,220*Math.max(0,e.hp/e.max),6);
 // Phase 2 & 3 threshold ticks
 ctx.fillStyle='#ffffff';
 ctx.fillRect(x-110+220*0.60,y-35,2,8);
 ctx.fillRect(x-110+220*0.26,y-35,2,8);

 if(b.phase==='warn'){
  const floor=(e._stitchoArena||STITCHO_BOSS).floor-cam.y;
  ctx.strokeStyle=b.tier===3?'#ff5252':b.tier===2?'#ea80fc':'#ffe6a3';ctx.lineWidth=3;
  ctx.setLineDash([8,6]);ctx.beginPath();
  if(b.attack===0||b.attack===2){
   ctx.moveTo(x-280,floor-13);ctx.lineTo(x+280,floor-13);
  }else if(b.attack===1){
   ctx.moveTo(x,floor-8);ctx.lineTo(x+b.aim*320,floor-8);
   for(let i=1;i<=4;i++){
    const cx2=x+b.aim*i*65;
    ctx.moveTo(cx2-b.aim*8,floor-13);ctx.lineTo(cx2,floor-8);ctx.lineTo(cx2-b.aim*8,floor-3);
   }
  }else{
   for(let i=-1;i<=1;i++){
    const xx=x+i*135;ctx.moveTo(xx,floor-280);ctx.lineTo(xx,floor);
    ctx.arc(xx,floor-8,12,0,Math.PI*2);
   }
  }
  ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#fff5c5';ctx.font='bold 13px sans-serif';
  ctx.fillText(['SALTA EL PULSO','ESQUIVA LA CARGA','DOBLE ONDA','LLUVIA DE CIRCUITOS'][b.attack],x,y-84);
 }
 if(b.phase==='rest'){
  ctx.fillStyle='#c5ffdf';ctx.font='bold 12px sans-serif';ctx.fillText('VENTANA DE ATAQUE',x,y-83);
 }
 if(!reduced){ctx.globalAlpha=.4+.3*Math.sin(t*.13);ctx.strokeStyle='#b9efff';ctx.strokeRect(x-66,y-15,132,12);}
 ctx.restore();
}
export function drawStitchoBossBody(ctx,e,cam,t=0,reduced=false){
 if(!e?._stitchoBoss||e.hp<=0)return false;
 const b=e._glitch,phase=b.tier||1,active=b.phase==='attack',warning=b.phase==='warn',rest=b.phase==='rest';
 const cx=e.x+e.w/2-cam.x,cy=e.y+e.h/2-cam.y;
 const time=reduced?0:t,sw=Math.sin(time*.09);
 ctx.save();ctx.translate(cx,cy);
 ctx.lineJoin='round';ctx.lineCap='round';

 // Cybernetic ground shadow with digital grid rings
 ctx.fillStyle='rgba(10,25,46,.55)';ctx.beginPath();ctx.ellipse(0,e.h/2-3,72,11,0,0,Math.PI*2);ctx.fill();
 if(!reduced){
  ctx.strokeStyle=phase===3?'rgba(255,82,82,0.3)':phase===2?'rgba(179,136,255,0.3)':'rgba(103,221,255,0.25)';
  ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,e.h/2-3,80,12,0,0,Math.PI*2);ctx.stroke();
 }

 // Hydraulic support legs with shock dampers and floor magnetic clamps
 for(const side of [-1,1]){
  const stride=active&&b.attack===1?(reduced?5:sw*10):reduced?0:Math.sin(time*.07+side)*3;
  ctx.strokeStyle='#10253b';ctx.lineWidth=16;ctx.beginPath();
  ctx.moveTo(side*30,17);ctx.lineTo(side*(35+stride*.25),e.h/2-9);ctx.lineTo(side*(54+stride),e.h/2-5);ctx.stroke();
  ctx.strokeStyle=phase===3?'#ff80ab':phase===2?'#d500f9':'#66cce4';ctx.lineWidth=5;ctx.stroke();
  ctx.fillStyle='#e0f7fa';ctx.beginPath();ctx.arc(side*(35+stride*.25),e.h/2-9,3.5,0,Math.PI*2);ctx.fill();
  // Magnetic floor claw
  ctx.strokeStyle='#091a29';ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(side*(50+stride),e.h/2-5);ctx.lineTo(side*(58+stride),e.h/2-2);ctx.stroke();
 }

 // Six articulated robotic arms with plasma cutter blades
 for(let arm=0;arm<6;arm++){
  const side=arm%2?1:-1,k=Math.floor(arm/2)-1;
  const ax=side*42,ay=k*22,reach=phase===3?56:phase===2?46:36;
  const swing=reduced?0:Math.sin(time*.11+arm*1.8)*9+(warning?6:0);
  const elbowX=side*(63+reach*.32),elbowY=ay-11+swing;
  const tipX=side*(65+reach),tipY=ay-20-swing*.6;
  // Heavy arm bone
  ctx.strokeStyle='#0b1d33';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(elbowX,elbowY);ctx.lineTo(tipX,tipY);ctx.stroke();
  ctx.strokeStyle=arm%3===0?'#dca7ff':'#70dffc';ctx.lineWidth=8;ctx.stroke();
  // Servo diode
  ctx.fillStyle='#d5faff';ctx.beginPath();ctx.arc(elbowX,elbowY,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=phase===3?'#ff1744':phase===2?'#ea80fc':'#00e5ff';ctx.beginPath();ctx.arc(elbowX,elbowY,2.5,0,Math.PI*2);ctx.fill();
  // Plasma cutting claws
  ctx.strokeStyle=phase===3?'#ffd0e1':'#a3dfff';ctx.lineWidth=3.2;
  ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.lineTo(tipX+side*15,tipY-10);ctx.moveTo(tipX,tipY);ctx.lineTo(tipX+side*17,tipY+8);ctx.stroke();
  if(!reduced&&(active||warning)){
   // Energy arc between claw tips
   ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;ctx.beginPath();
   ctx.moveTo(tipX+side*15,tipY-10);ctx.quadraticCurveTo(tipX+side*10,tipY,tipX+side*17,tipY+8);ctx.stroke();
  }
 }

 // Heavy Titanium Chassis Carapace
 ctx.fillStyle='#112842';ctx.strokeStyle=phase===3?'#ff5252':phase===2?'#b388ff':'#89e6ff';ctx.lineWidth=5;ctx.beginPath();
 ctx.moveTo(-48,-30);ctx.lineTo(-25,-48);ctx.lineTo(28,-48);ctx.lineTo(51,-23);
 ctx.lineTo(45,29);ctx.lineTo(14,45);ctx.lineTo(-35,33);ctx.closePath();ctx.fill();ctx.stroke();

 // Interior Quantum Plasma Core Cavity
 ctx.fillStyle=phase===3?'#ff8ccc':phase===2?'#c8a6ff':'#82edff';
 ctx.beginPath();ctx.moveTo(-20,-24);ctx.lineTo(23,-28);ctx.lineTo(28,19);ctx.lineTo(-18,21);ctx.closePath();ctx.fill();
 ctx.fillStyle='#061527';ctx.beginPath();ctx.ellipse(0,-5,17,21,0,0,Math.PI*2);ctx.fill();

 // Core Plasma Iris
 const irisColor=rest?'#69f0ae':phase===3?'#ff1744':phase===2?'#d500f9':'#e9ffff';
 ctx.fillStyle=irisColor;ctx.beginPath();ctx.ellipse(0,-5,8,10,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(0,-5,3.5,4.5,0,0,Math.PI*2);ctx.fill();

 // Vulnerability Opening Aura in Rest Window
 if(rest){
  ctx.save();
  const auraPulse=reduced?1:1+Math.sin(time*.15)*.12;
  ctx.strokeStyle='#69f0ae';ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(0,-5,28*auraPulse,32*auraPulse,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#b9f6ca';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(0,-5,36*auraPulse,40*auraPulse,0,0,Math.PI*2);ctx.stroke();
  // Heat exhaust cooling steam puffs
  if(!reduced){
   const steamY=-35-Math.sin(time*.2)*6;
   ctx.fillStyle='rgba(255,255,255,0.4)';
   ctx.beginPath();ctx.arc(-22,steamY,5,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.arc(22,steamY,5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }

 // Radar Scanner Horns & Antennae
 ctx.strokeStyle='#b8f8ff';ctx.lineWidth=4;ctx.beginPath();
 ctx.moveTo(-21,-44);ctx.lineTo(-29,-64-(warning?7:0));
 ctx.moveTo(21,-44);ctx.lineTo(29,-64-(warning?7:0));ctx.stroke();
 ctx.fillStyle=warning?(phase===3?'#ff1744':'#ffdf82'):(phase===3?'#ff80ab':'#a6eaff');
 for(const x of [-29,29]){
  ctx.beginPath();ctx.arc(x,-64-(warning?7:0),8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x,-64-(warning?7:0),3,0,Math.PI*2);ctx.fill();
 }

 // Phase 2 & 3: Fractured Armor Plasma Cracks
 if(phase>=2){
  ctx.strokeStyle='#ffddf3';ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(-25,-35);ctx.lineTo(-9,-19);ctx.lineTo(-19,0);ctx.moveTo(29,20);ctx.lineTo(10,10);ctx.lineTo(18,-6);ctx.stroke();
  ctx.strokeStyle='#ea80fc';ctx.lineWidth=1.5;ctx.stroke();
 }

 // Phase 3: Erratic Orbital Holographic Glitch Rings
 if(phase===3&&!reduced){
  ctx.strokeStyle='#fbc2ee';ctx.globalAlpha=.6+.4*Math.sin(time*.2);
  for(let i=0;i<4;i++){
   const angle=time*.08+i*Math.PI/2;ctx.beginPath();ctx.arc(0,-4,60+i*8,angle,angle+.3);ctx.stroke();
  }
  // Glitch spark arcs
  ctx.strokeStyle='#ff5252';ctx.lineWidth=2;
  const gx=Math.sin(time*.3)*40,gy=Math.cos(time*.25)*25-5;
  ctx.beginPath();ctx.moveTo(gx-8,gy-6);ctx.lineTo(gx,gy);ctx.lineTo(gx+8,gy-4);ctx.stroke();
 }

 ctx.restore();return true;
}
export function drawStitchoEnemyAccent(ctx,e,cam,t=0,reduced=false){
 if(!e||e._stitchoBoss||!e.roomPersona?.name)return;
 const x=e.x+e.w/2-cam.x,y=e.y-cam.y,variant=(e.spawnIndex||0)%4;
 ctx.save();ctx.strokeStyle=['#99eafe','#d0aeff','#c4ffe4','#ffe6af'][variant];
 ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-8,y+4);ctx.lineTo(x-13,y-9);ctx.lineTo(x,y-5);
 ctx.lineTo(x+11,y-16);ctx.stroke();
 ctx.fillStyle=ctx.strokeStyle;const flicker=reduced?0:Math.sin(t*.15+variant)*2;
 ctx.beginPath();ctx.arc(x+11,y-17+flicker,3.5,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
