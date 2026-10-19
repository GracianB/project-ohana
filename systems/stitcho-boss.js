// Stitcho's own three-phase encounter. Uses the same enemy hit pipeline as
// ordinary campaign foes, so H/J/K/L, team echoes and XP remain authoritative.
export const STITCHO_BOSS_ID='hub-stitcho-glitch-v1';
export const STITCHO_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['sweep','charge','cross','meteor']);
export function createStitchoBoss(makeFoe,rng=()=>.5){
  const e=makeFoe(3400,1000,'cangrejo','hub',997,{rng});
  e.x=3400;e.y=STITCHO_BOSS.floor-92;e.w=112;e.h=92;
  e.hp=e.max=STITCHO_BOSS.hp;
  e.miniBoss=true;e._stitchoBoss=true;
  e._campaignOriginal=true;e.spawnIndex=997;
  e._encounterSaveId=STITCHO_BOSS_ID;
  e.roomId='hub';e.color='#80ddf8';e.contactDmg=0;
  e._glitch={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
  return e;
}
export function updateStitchoBoss(e,g,hurt){
 if(!e?._stitchoBoss)return false;
 const b=e._glitch,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(STITCHO_BOSS.left,Math.min(STITCHO_BOSS.right-e.w,e.x));
 e.y=STITCHO_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;
 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
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
   e.x=Math.max(STITCHO_BOSS.left,Math.min(STITCHO_BOSS.right-e.w,e.x+b.aim*(b.tier===3?10:6)));
   if(Math.abs(dx)<(e.w+p.w)/2&&Math.abs(p.y+p.h/2-e.y-e.h/2)<(p.h+e.h)/2)
     hurt?.(b.tier===3?22:16,'EMBESTIDA GLITCH');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?37:72;b.attack=(b.attack+1)%PATTERNS.length;b.exposed=true;}
 }
 e.stun=Math.min(e.stun||0,2);
 e._campaign={wind:e.wind,active:e.lunge,aim:b.aim};
 return true;
}
export function drawStitchoBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._stitchoBoss||e.hp<=0)return;
 const b=e._glitch,x=e.x+e.w/2-cam.x,y=e.y-cam.y;
 ctx.save();ctx.textAlign='center';
 ctx.fillStyle='#092d42';ctx.fillRect(x-120,y-72,240,47);
 ctx.fillStyle='#e3faff';ctx.font='bold 12px sans-serif';ctx.fillText('NÚCLEO GLITCH · FASE '+b.tier+'/3',x,y-56);
 ctx.fillStyle='#2d5570';ctx.fillRect(x-108,y-46,216,8);
 ctx.fillStyle='#73e7fc';ctx.fillRect(x-108,y-46,216*Math.max(0,e.hp/e.max),8);
 if(b.phase==='warn'){
  const floor=STITCHO_BOSS.floor-cam.y;ctx.strokeStyle='#ffe6a3';ctx.lineWidth=4;
  ctx.setLineDash([9,8]);ctx.beginPath();
  if(b.attack===0||b.attack===2){ctx.moveTo(x-260,floor-13);ctx.lineTo(x+260,floor-13);}
  else if(b.attack===1){ctx.moveTo(x,floor-8);ctx.lineTo(x+b.aim*310,floor-8);}
  else {for(let i=-1;i<=1;i++){const xx=x+i*135;ctx.moveTo(xx,floor-250);ctx.lineTo(xx,floor);}}
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

// Fully vectorial mechanical enemy. Three health phases reshape the core and
// animate six segmented arms; no static cangrejo sprite or image dependency.
export function drawStitchoBossBody(ctx,e,cam,t=0,reduced=false){
 if(!e?._stitchoBoss||e.hp<=0)return false;
 const b=e._glitch,phase=b.tier||1,active=b.phase==='attack',warning=b.phase==='warn';
 const cx=e.x+e.w/2-cam.x,cy=e.y+e.h/2-cam.y;
 const time=reduced?0:t,sw=Math.sin(time*.09);
 ctx.save();ctx.translate(cx,cy);
 // Ground shadow and articulated angular feet.
 ctx.fillStyle='rgba(10,25,46,.5)';ctx.beginPath();ctx.ellipse(0,e.h/2-3,68,10,0,0,Math.PI*2);ctx.fill();
 for(const side of [-1,1]){
  const stride=active&&b.attack===1?(reduced?5:sw*10):reduced?0:Math.sin(time*.07+side)*3;
  ctx.strokeStyle='#16324b';ctx.lineWidth=15;ctx.lineCap='round';ctx.beginPath();
  ctx.moveTo(side*30,17);ctx.lineTo(side*(35+stride*.25),e.h/2-9);ctx.lineTo(side*(53+stride),e.h/2-5);ctx.stroke();
  ctx.strokeStyle='#66cce4';ctx.lineWidth=5;ctx.stroke();
 }
 // Six individually jointed and animated arms as enemies escalate.
 for(let arm=0;arm<6;arm++){
  const side=arm%2?1:-1,k=Math.floor(arm/2)-1;
  const ax=side*42,ay=k*22,reach=phase===3?54:phase===2?44:34;
  const swing=reduced?0:Math.sin(time*.11+arm*1.8)*9+(warning?5:0);
  const elbowX=side*(63+reach*.32),elbowY=ay-11+swing;
  const tipX=side*(65+reach),tipY=ay-20-swing*.6;
  ctx.strokeStyle='#0e213c';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(elbowX,elbowY);ctx.lineTo(tipX,tipY);ctx.stroke();
  ctx.strokeStyle=arm%3===0?'#dca7ff':'#70dffc';ctx.lineWidth=8;ctx.stroke();
  ctx.fillStyle='#d5faff';ctx.beginPath();ctx.arc(elbowX,elbowY,5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=phase===3?'#ffd0e1':'#a3dfff';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.lineTo(tipX+side*14,tipY-9);ctx.moveTo(tipX,tipY);ctx.lineTo(tipX+side*16,tipY+7);ctx.stroke();
 }
 // Main shell + energy core; damage reveals glowing cracks.
 ctx.fillStyle='#132f4e';ctx.strokeStyle='#89e6ff';ctx.lineWidth=5;ctx.beginPath();
 ctx.moveTo(-48,-30);ctx.lineTo(-25,-48);ctx.lineTo(28,-48);ctx.lineTo(51,-23);
 ctx.lineTo(45,29);ctx.lineTo(14,45);ctx.lineTo(-35,33);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=phase===3?'#ff8ccc':phase===2?'#c8a6ff':'#82edff';
 ctx.beginPath();ctx.moveTo(-20,-24);ctx.lineTo(23,-28);ctx.lineTo(28,19);ctx.lineTo(-18,21);ctx.closePath();ctx.fill();
 ctx.fillStyle='#061527';ctx.beginPath();ctx.ellipse(0,-5,17,21,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e9ffff';ctx.beginPath();ctx.ellipse(0,-5,7,9,0,0,Math.PI*2);ctx.fill();
 // Expressive eyes and antennae track active warning rhythm.
 ctx.strokeStyle='#b8f8ff';ctx.lineWidth=4;ctx.beginPath();
 ctx.moveTo(-21,-44);ctx.lineTo(-29,-64-(warning?7:0));
 ctx.moveTo(21,-44);ctx.lineTo(29,-64-(warning?7:0));ctx.stroke();
 ctx.fillStyle=warning?'#ffdf82':'#a6eaff';
 for(const x of [-29,29]){ctx.beginPath();ctx.arc(x,-64-(warning?7:0),8,0,Math.PI*2);ctx.fill();}
 if(phase>=2){
  ctx.strokeStyle='#ffddf3';ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(-25,-35);ctx.lineTo(-9,-19);ctx.lineTo(-19,0);ctx.moveTo(29,20);ctx.lineTo(10,10);ctx.lineTo(18,-6);ctx.stroke();
 }
 if(phase===3&&!reduced){
  ctx.strokeStyle='#fbc2ee';ctx.globalAlpha=.6+.4*Math.sin(time*.2);
  for(let i=0;i<4;i++){
   const angle=time*.08+i*Math.PI/2;ctx.beginPath();ctx.arc(0,-4,60+i*8,angle,angle+.3);ctx.stroke();
  }
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
