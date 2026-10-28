import {chapterBossStart,chapterBossFinish} from './chapters-lunar-prism-embers.js';
import {drawAstralCustodian} from './fryer-astral-boss-art.js';
// OBSERVATORIO ASTRAL — Guía del Más Allá (Yomi's personal mini boss).
// 100% vector Canvas: a translucent spirit guide — flowing ethereal robes,
// floating spirit orbs orbiting, star-crown, void-black face with glowing soul eyes.
// Three phases: calm spirit → restless apparition → full void manifestation.
export const YOMI_BOSS_ID='hub-yomi-boss-v1';
export const YOMI_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['drift','spirit_volley','soul_blast','void_eruption']);

export function createYomiBoss(makeFoe,rng=()=>.5,options={}){
 const arena=Object.freeze({...YOMI_BOSS,...options.arena}),roomId=options.roomId||'hub',x=options.x??3420;
 const e=makeFoe(x,arena.floor-120,'escoria',roomId,992,{rng});
 e._chapterArena=arena;e._growthChapter=options.chapter||null;
 e.x=x;e.w=e._growthChapter?190:110;e.h=e._growthChapter?205:120;e.y=arena.floor-e.h;
 e.hp=e.max=arena.hp;if(e._growthChapter){e.damageTakenScale=0;e.damageWindowRemaining=0;}
 e.miniBoss=true;e._yomiBoss=true;
 e._campaignOriginal=true;e.spawnIndex=992;
 e._encounterSaveId=options.encounterId||YOMI_BOSS_ID;
 e.roomId=roomId;e.color='#ce93d8';e.contactDmg=0;
 e._spiritGuide={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,orbitAngle:0,orbit:0};
 e._custodian=e._spiritGuide;
 return e;
}

export function updateYomiBoss(e,g,hurt){
 if(!e?._yomiBoss)return false;
 const b=e._spiritGuide||e._custodian,p=g.player,arena=e._chapterArena||YOMI_BOSS,previous=b.phase;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x));
 e.y=arena.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 b.orbitAngle=(b.orbitAngle||0)+0.04*(b.tier===3?2:1);
 b.orbit=b.orbitAngle;
 if(!p||p.dead||e.hp<=0)return true;
 if(!chapterBossStart(e,g,b))return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<680){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-50,'GUÍA DEL MÁS ALLÁ — DESPIERTO','#e1bee7',true);
   if(b.clock<=0){b.phase=e._growthChapter?'warn':'rest';b.clock=50;b.aim=Math.sign(dx)||1;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if((--b.clock<=0||e._growthChapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<950){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?30:48;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24&&!e._growthChapter){b.phase='rest';b.clock=88;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡GUÍA ATURDIDO!','#e1bee7',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?30:22;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const fireOrb=(vx,vy=-3.5,col='#ce93d8')=>{
   if((g.projectiles?.length||0)<130)
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h/2,w:20,h:20,vx,vy,life:155,dmg:b.tier===3?19:13,owner:'enemy',shape:'orb',color:col});
  };
  if(!b.burst){
   if(b.attack===0){/* drift attack — handled by locomotion */}
   if(b.attack===1){fireOrb(b.aim*6.5,-3.5);if(b.tier>1)fireOrb(-b.aim*4.5,-2,'#f3e5f5');}
   if(b.attack===2){for(let k=-1;k<=1;k++)fireOrb(b.aim*(5+k*2),-3-Math.abs(k),'#ab47bc');}
   if(b.attack===3&&(b.tier===3||e._growthChapter)){for(let a=0;a<6;a++){const ang=a*Math.PI/3;fireOrb(Math.cos(ang)*5.5,Math.sin(ang)*5.5-3,'#7b1fa2');}}
   b.burst=1;
  }
  // Drift locomotion: ghostly glide
  if(b.attack===0){e.x+=b.aim*7;e.facing=b.aim;}
  if(Math.abs(dx)<e.w*.55&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*.6)hurt?.(b.tier===3?18:13,'yomi-boss');
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?30:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 chapterBossFinish(e,g,b,previous);
 return true;
}

function _drawSpirit(ctx,e,t){
 const b=e._spiritGuide||e._custodian,tier=b.tier;
 const robe  =tier===3?'rgba(123,31,162,0.85)':tier===2?'rgba(171,71,188,0.78)':'rgba(206,147,216,0.72)';
 const robeS =tier===3?'#ce93d8':tier===2?'#e1bee7':'#f3e5f5';
 const orb   =tier===3?'#7b1fa2':tier===2?'#ab47bc':'#ce93d8';
 const eyeG  =tier===3?'#ff4081':'#e040fb';
 const float =Math.sin(t*.07)*6;
 const FAM   =['#eb554a','#5ad1ff','#ffe14a','#c9a8ff','#ff6a2a','#4cbf56','#f0b43a','#e0402a','#f2c1ff','#4ff0c8'];

 ctx.save();ctx.translate(0,float);

 // ── Portal Cuántico Detrás del Custodio ──
 ctx.save();
 const portalR=tier===3?65:tier===2?55:45;
 const portalGlow=ctx.createRadialGradient(0,25,10,0,25,portalR);
 portalGlow.addColorStop(0,tier===3?'rgba(123,31,162,0.45)':'rgba(79,240,200,0.3)');
 portalGlow.addColorStop(0.7,tier===3?'rgba(206,147,216,0.2)':'rgba(42,36,104,0.15)');
 portalGlow.addColorStop(1,'rgba(13,20,48,0)');
 ctx.fillStyle=portalGlow;
 ctx.beginPath();ctx.ellipse(0,25,portalR*1.1,portalR,0,0,Math.PI*2);ctx.fill();

 // Anillo cuántico de datos
 ctx.strokeStyle=tier===3?'rgba(206,147,216,0.6)':'rgba(79,240,200,0.5)';
 ctx.lineWidth=1.8;
 ctx.setLineDash([4,6]);
 ctx.beginPath();ctx.ellipse(0,25,portalR,portalR*0.8,t*0.02,0,Math.PI*2);ctx.stroke();
 ctx.setLineDash([]);
 ctx.restore();

 // ── Flowing robe body ──
 ctx.fillStyle=robe;ctx.strokeStyle=robeS;ctx.lineWidth=2.5;
 ctx.beginPath();
 ctx.moveTo(-28,-10);
 ctx.quadraticCurveTo(-50,30,-38,68);
 ctx.quadraticCurveTo(-20,80,0,75);
 ctx.quadraticCurveTo(20,80,38,68);
 ctx.quadraticCurveTo(50,30,28,-10);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Robe tails (wispy ends)
 ctx.fillStyle=robe;
 ctx.beginPath();ctx.moveTo(-38,68);ctx.quadraticCurveTo(-50,90,-30,100);ctx.quadraticCurveTo(-20,95,-20,75);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(38,68);ctx.quadraticCurveTo(50,90,30,100);ctx.quadraticCurveTo(20,95,20,75);ctx.closePath();ctx.fill();

 // Código binario holográfico en la túnica
 ctx.fillStyle=tier===3?'rgba(255,255,255,0.7)':'rgba(79,240,200,0.65)';
 ctx.font='bold 8px monospace';ctx.textAlign='center';
 const b0=Math.floor(t*0.15)%2?'1':'0',b1=Math.floor(t*0.15+1)%2?'0':'1';
 ctx.fillText(b0,-12,38);ctx.fillText(b1,12,42);ctx.fillText(b0,0,58);

 // ── Upper body / torso glow ──
 ctx.fillStyle=tier===3?'rgba(123,31,162,0.6)':'rgba(206,147,216,0.45)';
 ctx.beginPath();ctx.ellipse(0,-18,24,30,0,0,Math.PI*2);ctx.fill();

 // ── Corona de 10 Estrellas Ohana ──
 const starCount=10;
 for(let s=0;s<starCount;s++){
  const ang=s*(Math.PI*2/starCount)+(t*.035);
  const sr=34+Math.sin(t*.12+s)*3;
  const sx=Math.cos(ang)*sr,sy=-55+Math.sin(ang)*10;
  const starPulse=0.7+Math.sin(t*.14+s)*.3;
  ctx.fillStyle=FAM[s % FAM.length];
  ctx.beginPath();
  ctx.arc(sx,sy,2.5+starPulse,0,Math.PI*2);
  ctx.fill();
 }

 // ── Face — void dark with glowing soul eyes ──
 ctx.fillStyle='rgba(10,0,22,0.92)';ctx.strokeStyle=robeS;ctx.lineWidth=2;
 ctx.beginPath();ctx.ellipse(0,-36,18,20,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 // Soul eyes
 ctx.fillStyle=eyeG;
 const eyePulse=0.7+Math.sin(t*.16)*.3;
 ctx.globalAlpha=eyePulse;
 ctx.beginPath();ctx.arc(-8,-38,5,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(8,-38,5,0,Math.PI*2);ctx.fill();
 ctx.globalAlpha=1;
 // Eye cores
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-8,-38,2,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(8,-38,2,0,Math.PI*2);ctx.fill();

 // ── Manos Espectrales de Luz ──
 for(let side of [-1,1]){
  const hWave=Math.sin(t*0.12+side)*4;
  const hx=side*36+hWave,hy=20+Math.abs(hWave)*2;
  ctx.fillStyle='rgba(79,240,200,0.7)';
  ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(hx,hy,5.5,0,Math.PI*2);ctx.fill();ctx.stroke();
 }

 // ── Orbiting spirit orbs ──
 const orbCount=tier===3?5:tier===2?4:3;
 for(let o=0;o<orbCount;o++){
  const ang=b.orbitAngle+o*(Math.PI*2/orbCount);
  const ox=Math.cos(ang)*46,oy=Math.sin(ang)*18-22;
  ctx.fillStyle=FAM[o % FAM.length];ctx.globalAlpha=0.85;
  ctx.beginPath();ctx.arc(ox,oy,6.5,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=0.4;ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(ox-2,oy-2,2.5,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
 }

 ctx.restore();
}

const TAU=Math.PI*2;
function _rr(c,x,y,w,h,r=4){
 if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);
}

export function drawYomiBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._spiritGuide)return;
 const b=e._spiritGuide,x=e.x-cam.x,y=e.y-cam.y,cx=x+e.w/2;
 const panW=250,panH=68,px=cx-panW/2,py=Math.max(12,y-105);

 ctx.save();
 ctx.strokeStyle='rgba(79,240,200,0.45)';ctx.lineWidth=1;
 for(let vb=0;vb<6;vb++){
  const vbx=px+vb*(panW/5);
  ctx.beginPath();ctx.moveTo(vbx,py-4);ctx.lineTo(vbx+6,py);ctx.stroke();
 }

 ctx.fillStyle='rgba(13,20,48,0.92)';
 ctx.strokeStyle='rgba(79,240,200,0.70)';ctx.lineWidth=1.5;
 _rr(ctx,px,py,panW,panH,5);ctx.fill();ctx.stroke();

 const TIER_COL=['#80deea','#ce93d8','#ff7f6e'];
 for(let i=0;i<3;i++){
  ctx.fillStyle=i<b.tier?TIER_COL[i]:'#0a1026';
  ctx.beginPath();ctx.arc(px+14+i*14,py+12,4.5,0,TAU);ctx.fill();
  if(i<b.tier){
   ctx.strokeStyle='rgba(255,255,255,0.85)';ctx.lineWidth=1.2;
   ctx.beginPath();ctx.arc(px+14+i*14,py+12,4.5,0,TAU);ctx.stroke();
  }
 }

 ctx.fillStyle='#e0f7fa';ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText('CUSTODIO DEL OBSERVATORIO',cx,py+15);

 const barX=px+10,barY=py+26,barW=panW-20,barH=9;
 const hpRatio=Math.max(0,e.hp/e.max);
 ctx.fillStyle='rgba(6,10,24,0.9)';_rr(ctx,barX,barY,barW,barH,3);ctx.fill();

 const gBar=ctx.createLinearGradient(barX,barY,barX+barW*hpRatio,barY);
 gBar.addColorStop(0,b.tier===3?'#7b1fa2':b.tier===2?'#ab47bc':'#00b4d8');
 gBar.addColorStop(1,b.tier===3?'#ba68c8':'#4ff0c8');
 ctx.fillStyle=gBar;_rr(ctx,barX,barY,barW*hpRatio,barH,3);ctx.fill();

 ctx.strokeStyle='rgba(128,222,234,0.7)';ctx.lineWidth=1;_rr(ctx,barX,barY,barW,barH,3);ctx.stroke();

 const PHASE_INFO={
  intro:  {icon:'✦',col:'#80deea',txt:'INICIALIZANDO CUSTODIO DEL OBSERVATORIO'},
  rest:   {icon:'◇',col:'#4ff0c8',txt:'¡CUSTODIO VULNERABLE! ATACA AHORA'},
  warn:   {icon:'▲',col:'#ff7f6e',txt:['¡DERIVA ASTRAL! SALTA EL PASO','DESCARGA DE PULSOS ETÉREOS','ESTALLIDO DEL ALMA · BUSCA ALTURA','ERUPCIÓN DEL VACÍO CÓSMICO'][b.attack]||'¡PELIGRO ASTRAL!'},
  attack: {icon:'■',col:'#ce93d8',txt:'DESCARGA ASTRAL CUÁNTICA'}
 };
 const pi=PHASE_INFO[b.phase]||PHASE_INFO.intro;
 ctx.fillStyle=pi.col;ctx.font='bold 12px monospace';ctx.textAlign='left';
 ctx.fillText(pi.icon,px+10,py+52);
 ctx.fillStyle='rgba(224,247,250,0.95)';ctx.font='10px monospace';
 ctx.fillText(pi.txt,px+26,py+52);

 if(b.phase==='warn'){
  const floor=e._chapterArena?.floor?e._chapterArena.floor-cam.y:1134-cam.y;
  ctx.strokeStyle='rgba(79,240,200,0.85)';ctx.lineWidth=2.5;ctx.setLineDash([8,6]);
  const dir=b.aim||1;
  const tipX=cx+dir*(b.attack===0?330:260);
  ctx.beginPath();ctx.moveTo(cx,floor-8);ctx.lineTo(tipX,floor-8);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(79,240,200,0.9)';
  ctx.beginPath();ctx.moveTo(tipX,floor-8);ctx.lineTo(tipX-dir*14,floor-14);ctx.lineTo(tipX-dir*14,floor-2);ctx.closePath();ctx.fill();
 }

 if(e.telegraph||b.exposed){
  const tr=reduced?0:Math.sin(t*0.2)*5;
  ctx.strokeStyle=b.exposed?'rgba(79,240,200,0.85)':'rgba(255,127,110,0.85)';
  ctx.lineWidth=2.8;
  ctx.beginPath();ctx.arc(cx,y+e.h/2,70+tr,0,TAU);ctx.stroke();
 }

 ctx.restore();
}

export function drawYomiBoss(ctx,e,cam,t,reduceMotion=false){
 if(!e?._yomiBoss)return false;
 const b=e._spiritGuide,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h-(e._growthChapter?50:0));ctx.scale(b.aim||1,1);
 if(e._growthChapter)drawAstralCustodian(ctx,e,reduceMotion?0:t);else _drawSpirit(ctx,e,reduceMotion?0:t);
 if(e.telegraph){ctx.strokeStyle='#ce93d8';ctx.lineWidth=2.5;ctx.setLineDash([5,5]);ctx.strokeRect(-60,-115,120,125);ctx.setLineDash([]);}
 ctx.restore();

 drawYomiBossSignals(ctx,e,cam,t,reduceMotion);
 return true;
}
