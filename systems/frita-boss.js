import {chapterBossStart,chapterBossFinish} from './chapters-lunar-prism-embers.js';
import {drawFryerKing} from './fryer-astral-boss-art.js';
// MERCADO DORADO — Rey Crujiente (Frita's personal mini boss).
// 100% vector Canvas: a massive golden crab chef king — wide shell, chef toque,
// enormous claws, oil-dripping apron. Three phases evolve the colour and silhouette.
export const FRITA_BOSS_ID='hub-frita-boss-v1';
export const FRITA_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','bubble_spray','fryer_slam','crisp_overdrive']);

export function createFritaBoss(makeFoe,rng=()=>.5,options={}){
 const arena=Object.freeze({...FRITA_BOSS,...options.arena}),roomId=options.roomId||'hub',x=options.x??3420;
 const e=makeFoe(x,arena.floor-120,'cangrejo',roomId,994,{rng});
 e._chapterArena=arena;e._growthChapter=options.chapter||null;
 e.x=x;e.w=e._growthChapter?240:138;e.h=e._growthChapter?190:116;e.y=arena.floor-e.h;
 e.hp=e.max=arena.hp;if(e._growthChapter){e.damageTakenScale=0;e.damageWindowRemaining=0;}
 e.miniBoss=true;e._fritaBoss=true;
 e._campaignOriginal=true;e.spawnIndex=994;
 e._encounterSaveId=options.encounterId||FRITA_BOSS_ID;
 e.roomId=roomId;e.color='#ffb300';e.contactDmg=0;
 e._crispyKing={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,boil:0};
 return e;
}

export function updateFritaBoss(e,g,hurt){
 if(!e?._fritaBoss)return false;
 const b=e._crispyKing,p=g.player,arena=e._chapterArena||FRITA_BOSS,previous=b.phase;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x));
 e.y=arena.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;
 if(!chapterBossStart(e,g,b))return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 if(b.boil>0)b.boil--;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<680){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-50,'REY CRUJIENTE — DESPIERTO','#ffd54f',true);
   if(b.clock<=0){b.phase=e._growthChapter?'warn':'rest';b.clock=50;b.aim=Math.sign(dx)||1;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if((--b.clock<=0||e._growthChapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<950){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?32:48;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24&&!e._growthChapter){b.phase='rest';b.clock=88;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡REY CRUJIENTE ATURDIDO!','#fff59d',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?30:22;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const fireOil=(vx,vy=-2.5,col='#ffb300')=>{
   if((g.projectiles?.length||0)<130)
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:20,h:18,vx,vy,life:145,dmg:b.tier===3?19:13,owner:'enemy',shape:'orb',color:col});
  };
  if(!b.burst){
   if(b.attack===0){b.boil=20;}                                                    // sizzle charge
   if(b.attack===1){fireOil(b.aim*7,-2.5);if(b.tier>1)fireOil(-b.aim*5,-1.5,'#ffd54f');}
   if(b.attack===2){for(let s=-1;s<=1;s++)fireOil(b.aim*(5+s*2),-2.5-Math.abs(s));}
   if(b.attack===3&&(b.tier===3||e._growthChapter)){for(let k=-2;k<=2;k++)fireOil(k*4,-4,'#ffeb3b');}
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*9;e.facing=b.aim;}
  if(Math.abs(dx)<e.w*.55&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*.6)hurt?.(b.tier===3?20:14,'frita-boss');
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?32:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 chapterBossFinish(e,g,b,previous);
 return true;
}

// ── Giant golden crab chef king vector drawing ───────────────────────────────
function _drawCrabKing(ctx,e,t){
 const b=e._crispyKing,tier=b.tier;
 const shell =tier===3?'#bf360c':tier===2?'#e64a19':'#f4511e';
 const gold  =tier===3?'#ff8f00':tier===2?'#ffa000':'#ffc107';
 const bright=tier===3?'#ffea00':'#ffd54f';
 const pulse =Math.sin(t*.13)*3;

 // ── Legs (6, drawn first behind body) ──
 ctx.strokeStyle=shell;ctx.lineWidth=7;ctx.lineCap='round';
 for(let i=-2;i<=2;i++){
  if(i===0)continue;
  const lx=i*22,sign=i<0?-1:1;
  ctx.beginPath();ctx.moveTo(lx,-10);ctx.lineTo(lx+sign*30,20);ctx.lineTo(lx+sign*36,42);ctx.stroke();
 }

 // ── Main shell (wide oval) ──
 ctx.fillStyle=shell;ctx.strokeStyle=gold;ctx.lineWidth=3.5;
 ctx.beginPath();ctx.ellipse(0,-30,62,40,0,0,Math.PI*2);ctx.fill();ctx.stroke();

 // Shell ridges
 ctx.strokeStyle=bright;ctx.lineWidth=1.5;
 for(let r=1;r<=3;r++){
  ctx.beginPath();ctx.ellipse(0,-30,62*(.6+r*.13),40*(.5+r*.18),0,0,Math.PI*2);ctx.stroke();
 }

 // ── Chef toque (white chef hat) ──
 ctx.fillStyle='#fafafa';ctx.strokeStyle=gold;ctx.lineWidth=2;
 ctx.fillRect(-24,-80,48,22);ctx.strokeRect(-24,-80,48,22);
 // Hat top puff
 ctx.fillStyle='#fff';
 ctx.beginPath();ctx.ellipse(0,-92,22,16,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 // Hat band
 ctx.fillStyle=gold;ctx.fillRect(-24,-64,48,8);

 // ── Face (eyes on stalks) ──
 ctx.fillStyle=shell;ctx.strokeStyle=gold;ctx.lineWidth=2;
 // Left eye stalk
 ctx.beginPath();ctx.moveTo(-22,-52);ctx.lineTo(-30,-68);ctx.stroke();
 ctx.fillStyle=bright;ctx.beginPath();ctx.arc(-30,-72,7,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#1a0000';ctx.beginPath();ctx.arc(-30,-72,3.5,0,Math.PI*2);ctx.fill();
 // Right eye stalk
 ctx.strokeStyle=gold;ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(22,-52);ctx.lineTo(30,-68);ctx.stroke();
 ctx.fillStyle=bright;ctx.beginPath();ctx.arc(30,-72,7,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#1a0000';ctx.beginPath();ctx.arc(30,-72,3.5,0,Math.PI*2);ctx.fill();

 // ── Mouth / smile ──
 ctx.strokeStyle=bright;ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(0,-22,18,0.2,Math.PI-.2);ctx.stroke();

 // ── Left giant claw ──
 ctx.fillStyle=gold;ctx.strokeStyle=shell;ctx.lineWidth=2.5;
 // Claw arm
 ctx.beginPath();ctx.moveTo(-55,-20);ctx.lineTo(-80,-10);ctx.lineTo(-90,10);ctx.stroke();
 // Claw pincers
 ctx.fillStyle=gold;
 ctx.beginPath();ctx.arc(-90,6,18,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-90,-12);ctx.lineTo(-76,-20);ctx.lineTo(-80,-2);ctx.closePath();ctx.fill();

 // ── Right giant claw (weapon claw — bigger, facing outward) ──
 ctx.fillStyle=tier===3?bright:gold;ctx.strokeStyle=shell;ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(55,-20);ctx.lineTo(82,-8);ctx.lineTo(96,12);ctx.stroke();
 ctx.fillStyle=tier===3?bright:gold;
 ctx.beginPath();ctx.arc(96,8,22,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(96,-14);ctx.lineTo(80,-22);ctx.lineTo(86,-4);ctx.closePath();ctx.fill();

 // Sizzling oil drip on claw (tier 2+)
 if(tier>=2){
  const drip=Math.sin(t*.18)*5;
  ctx.fillStyle=`rgba(255,${tier===3?130:195},0,0.7)`;
  for(let i=0;i<3;i++){
   ctx.beginPath();ctx.arc(90+i*6,28+drip+i*8,3.5-i*.5,0,Math.PI*2);ctx.fill();
  }
 }

 // Phase 3: boiling aura
 if(tier===3){
  ctx.fillStyle=`rgba(255,145,0,${0.15+Math.sin(t*.09)*0.07})`;
  ctx.beginPath();ctx.ellipse(0,-25,82,56,0,0,Math.PI*2);ctx.fill();
 }
}

const TAU=Math.PI*2;
function _rr(c,x,y,w,h,r=4){
 if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);
}

export function drawFritaBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._crispyKing)return;
 const b=e._crispyKing,x=e.x-cam.x,y=e.y-cam.y,cx=x+e.w/2;
 const panW=250,panH=68,px=cx-panW/2,py=Math.max(12,y-105);

 ctx.save();
 ctx.strokeStyle='rgba(255,179,0,0.45)';ctx.lineWidth=1;
 for(let vb=0;vb<6;vb++){
  const vbx=px+vb*(panW/5);
  ctx.beginPath();ctx.moveTo(vbx,py-4);ctx.lineTo(vbx+6,py);ctx.stroke();
 }

 ctx.fillStyle='rgba(38,26,12,0.90)';
 ctx.strokeStyle='rgba(255,179,0,0.65)';ctx.lineWidth=1.5;
 _rr(ctx,px,py,panW,panH,5);ctx.fill();ctx.stroke();

 const TIER_COL=['#ffd54f','#ff9800','#e65100'];
 for(let i=0;i<3;i++){
  ctx.fillStyle=i<b.tier?TIER_COL[i]:'#241408';
  ctx.beginPath();ctx.arc(px+14+i*14,py+12,4.5,0,TAU);ctx.fill();
  if(i<b.tier){
   ctx.strokeStyle='rgba(255,245,157,0.85)';ctx.lineWidth=1.2;
   ctx.beginPath();ctx.arc(px+14+i*14,py+12,4.5,0,TAU);ctx.stroke();
  }
 }

 ctx.fillStyle='#fff8e1';ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText('REY CRUJIENTE · CHEF DE LA FREIDORA',cx,py+15);

 const barX=px+10,barY=py+26,barW=panW-20,barH=9;
 const hpRatio=Math.max(0,e.hp/e.max);
 ctx.fillStyle='rgba(18,12,6,0.9)';_rr(ctx,barX,barY,barW,barH,3);ctx.fill();

 const gBar=ctx.createLinearGradient(barX,barY,barX+barW*hpRatio,barY);
 gBar.addColorStop(0,b.tier===3?'#d84315':b.tier===2?'#f57c00':'#ffb300');
 gBar.addColorStop(1,b.tier===3?'#ff8a65':'#ffe082');
 ctx.fillStyle=gBar;_rr(ctx,barX,barY,barW*hpRatio,barH,3);ctx.fill();

 ctx.strokeStyle='rgba(255,224,130,0.7)';ctx.lineWidth=1;_rr(ctx,barX,barY,barW,barH,3);ctx.stroke();

 const PHASE_INFO={
  intro:  {icon:'★',col:'#ffca28',txt:'DESPERTANDO REY CRUJIENTE'},
  rest:   {icon:'◇',col:'#80cbc4',txt:'¡CRUJIENTE VULNERABLE! ATACA AHORA'},
  warn:   {icon:'▲',col:'#ff9800',txt:['¡EMBESTIDA CRUJIENTE! SALTA','DISPARO DE ACEITE HIRVIENDO','GOLPE DE FREIDORA · ONDA','DESCARGA DORADA TOTAL'][b.attack]||'¡ATENCIÓN!'},
  attack: {icon:'■',col:'#e65100',txt:'DESCARGA DE ACEITE HIRVIENDO'}
 };
 const pi=PHASE_INFO[b.phase]||PHASE_INFO.intro;
 ctx.fillStyle=pi.col;ctx.font='bold 12px monospace';ctx.textAlign='left';
 ctx.fillText(pi.icon,px+10,py+52);
 ctx.fillStyle='rgba(255,248,225,0.95)';ctx.font='10px monospace';
 ctx.fillText(pi.txt,px+26,py+52);

 if(b.phase==='warn'){
  const floor=e._chapterArena?.floor?e._chapterArena.floor-cam.y:1134-cam.y;
  ctx.strokeStyle='rgba(255,179,0,0.85)';ctx.lineWidth=2.5;ctx.setLineDash([8,6]);
  const dir=b.aim||1;
  const tipX=cx+dir*(b.attack===0?330:260);
  ctx.beginPath();ctx.moveTo(cx,floor-8);ctx.lineTo(tipX,floor-8);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,179,0,0.9)';
  ctx.beginPath();ctx.moveTo(tipX,floor-8);ctx.lineTo(tipX-dir*14,floor-14);ctx.lineTo(tipX-dir*14,floor-2);ctx.closePath();ctx.fill();
 }

 if(e.telegraph||b.exposed){
  const tr=reduced?0:Math.sin(t*0.2)*5;
  ctx.strokeStyle=b.exposed?'rgba(128,203,196,0.85)':'rgba(255,179,0,0.85)';
  ctx.lineWidth=2.8;
  ctx.beginPath();ctx.arc(cx,y+e.h/2,70+tr,0,TAU);ctx.stroke();
 }

 ctx.restore();
}

export function drawFritaBoss(ctx,e,cam,t,reduceMotion=false){
 if(!e?._fritaBoss)return false;
 const b=e._crispyKing,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h-(e._growthChapter?47:0));
 ctx.scale(b.aim||1,1);
 if(e._growthChapter)drawFryerKing(ctx,e,reduceMotion?0:t);else _drawCrabKing(ctx,e,reduceMotion?0:t);
 if(e.telegraph){
  ctx.strokeStyle='#ffd54f';ctx.lineWidth=2.5;ctx.setLineDash([6,6]);
  ctx.strokeRect(-100,-108,200,115);ctx.setLineDash([]);
 }
 ctx.restore();

 drawFritaBossSignals(ctx,e,cam,t,reduceMotion);
 return true;
}
