import {chapterBossStart,chapterBossFinish} from './chapters-lunar-prism-embers.js';
// REINO DEL HORNO — Chef Magmático (Pizza's personal mini boss).
// 100% vector Canvas: a giant magma humanoid chef — wide apron, tall toque, pizza
// peel weapon, cheese drips from body. Three phases evolve from brick-red to
// magma-orange to full eruption glow.
export const PIZZA_BOSS_ID='hub-pizza-boss-v1';
export const PIZZA_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','cheese_volley','peel_slam','eruption_wave']);

export function createPizzaBoss(makeFoe,rng=()=>.5,options={}){
 const arena=Object.freeze({...PIZZA_BOSS,...options.arena}),roomId=options.roomId||'hub',x=options.x??3420;
 const e=makeFoe(x,arena.floor-128,'cangrejo',roomId,993,{rng});
 e._chapterArena=arena;e._growthChapter=options.chapter||null;
 e.x=x;e.y=arena.floor-128;e.w=e._growthChapter?200:120;e.h=e._growthChapter?220:128;
 e.hp=e.max=arena.hp;if(e._growthChapter){e.damageTakenScale=0;e.damageWindowRemaining=0;}
 e.miniBoss=true;e._pizzaBoss=true;
 e._campaignOriginal=true;e.spawnIndex=993;
 e._encounterSaveId=options.encounterId||PIZZA_BOSS_ID;
 e.roomId=roomId;e.color='#ff7043';e.contactDmg=0;
 e._magmaChef={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,launch:0};
 return e;
}

export function updatePizzaBoss(e,g,hurt){
 if(!e?._pizzaBoss)return false;
 const b=e._magmaChef,p=g.player,arena=e._chapterArena||PIZZA_BOSS,previous=b.phase;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x));
 e.y=arena.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;
 if(!chapterBossStart(e,g,b))return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 if(b.launch>0)b.launch--;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<680){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-50,'CHEF MAGMÁTICO — DESPIERTO','#ffccbc',true);
   if(b.clock<=0){b.phase=e._growthChapter?'warn':'rest';b.clock=50;b.aim=Math.sign(dx)||1;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if((--b.clock<=0||e._growthChapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<950){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?32:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24&&!e._growthChapter){b.phase='rest';b.clock=88;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡CHEF ATURDIDO!','#ffe0b2',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:22;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const fireCheese=(vx,vy=-3,col='#ff7043')=>{
   if((g.projectiles?.length||0)<130)
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-24,w:22,h:22,vx,vy,life:148,dmg:b.tier===3?19:13,owner:'enemy',shape:'orb',color:col});
  };
  if(!b.burst){
   if(b.attack===0){b.launch=22;}
   if(b.attack===1){fireCheese(b.aim*7,-3);if(b.tier>1)fireCheese(-b.aim*5,-2,'#ffab91');}
   if(b.attack===2){for(let k=-1;k<=1;k++)fireCheese(b.aim*(5+k*2),-3-Math.abs(k));}
   if(b.attack===3&&(b.tier===3||e._growthChapter)){const spread=b.tier===3?2:1;for(let k=-spread;k<=spread;k++)fireCheese(k*4.5,-4,'#ff8a65');}
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*9.5;e.facing=b.aim;}
  if(Math.abs(dx)<e.w*.55&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*.6)hurt?.(b.tier===3?20:14,'pizza-boss');
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?32:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 chapterBossFinish(e,g,b,previous);
 return true;
}

function drawChapterChef(ctx,e,t){
 const b=e._magmaChef,hot=b.tier===3,edge='#564a49',skin=hot?'#d28d6d':'#d5a181',cheese='#eed6a0';ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=edge;ctx.lineWidth=3;
 // Heavy shoes and curved trousers plant the chef on the quay.
 ctx.fillStyle='#77675f';for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*10,42);ctx.lineTo(side*29,42);ctx.quadraticCurveTo(side*35,61,side*28,66);ctx.quadraticCurveTo(side*47,66,side*43,76);ctx.lineTo(side*7,76);ctx.closePath();ctx.fill();ctx.stroke();}
 ctx.fillStyle='#e8dfc7';ctx.beginPath();ctx.moveTo(-29,-35);ctx.bezierCurveTo(-63,-24,-57,33,-35,50);ctx.quadraticCurveTo(0,65,35,50);ctx.bezierCurveTo(57,33,63,-24,29,-35);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#f7efda';ctx.beginPath();ctx.moveTo(-23,-19);ctx.quadraticCurveTo(0,-8,23,-19);ctx.lineTo(34,47);ctx.quadraticCurveTo(0,58,-34,47);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#bdae95';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-16,19);ctx.quadraticCurveTo(0,25,16,19);ctx.lineTo(15,36);ctx.quadraticCurveTo(0,43,-15,36);ctx.closePath();ctx.stroke();
 ctx.fillStyle='#b46553';ctx.beginPath();ctx.moveTo(-18,-28);ctx.lineTo(0,-13);ctx.lineTo(19,-28);ctx.lineTo(6,-7);ctx.lineTo(-5,-7);ctx.closePath();ctx.fill();
 // Hands are oven mitts; the peel is a wooden tool with a clear handle.
 ctx.strokeStyle='#d5c6a7';ctx.lineWidth=17;ctx.beginPath();ctx.moveTo(-34,-17);ctx.quadraticCurveTo(-57,-2,-51,14);ctx.moveTo(34,-17);ctx.quadraticCurveTo(53,-10,55,2);ctx.stroke();
 ctx.fillStyle='#a5b29a';ctx.strokeStyle=edge;ctx.lineWidth=2;for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*54,10,12,17,side*.25,0,Math.PI*2);ctx.fill();ctx.stroke();}
 ctx.strokeStyle='#866c53';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(47,12);ctx.lineTo(77,-48);ctx.stroke();ctx.fillStyle='#d7bc8b';ctx.strokeStyle='#846f57';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(80,-55,18,27,.38,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle=skin;ctx.strokeStyle=edge;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-54,33,29,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#efc4a0';ctx.beginPath();ctx.ellipse(0,-48,8,6,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#645149';for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*12,-44,13,5,-side*.25,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle=b.phase==='warn'?'#fff1b8':'#3c514e';for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*12,-61,3,5,0,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle=edge;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-21,-68);ctx.lineTo(-6,-72);ctx.moveTo(6,-72);ctx.lineTo(21,-68);ctx.stroke();
 // The toque has soft lobes, folded cloth and a dark rim.
 ctx.fillStyle='#f7f0dc';ctx.strokeStyle='#acaa96';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-29,-77);ctx.lineTo(-31,-108);ctx.bezierCurveTo(-59,-126,-25,-147,-14,-127);ctx.bezierCurveTo(-9,-153,24,-147,23,-125);ctx.bezierCurveTo(46,-144,54,-115,31,-106);ctx.lineTo(29,-77);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#c7c4ad';ctx.beginPath();ctx.moveTo(-16,-112);ctx.lineTo(-14,-83);ctx.moveTo(0,-121);ctx.lineTo(0,-83);ctx.moveTo(16,-112);ctx.lineTo(14,-83);ctx.stroke();
 ctx.fillStyle='#e0d9bd';ctx.beginPath();ctx.roundRect(-31,-87,62,13,4);ctx.fill();ctx.stroke();
 ctx.fillStyle=cheese;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(-18+i*18,33+i%2*5,3,2,0,0,Math.PI*2);ctx.fill();}
 if(b.exposed){ctx.strokeStyle='#f5d48e';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,5,16,10,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
}

function _drawChef(ctx,e,t){
 if(e._growthChapter){drawChapterChef(ctx,e,t);return;}
 const b=e._magmaChef,tier=b.tier;
 const bodyCol=tier===3?'#bf360c':tier===2?'#d84315':'#e64a19';
 const accent =tier===3?'#ff6d00':tier===2?'#ff8f00':'#ffa726';
 const cheese  =tier===3?'#ffd600':'#ffe57f';
 const pulse   =Math.sin(t*.11)*3;

 // ── Apron / body ──
 ctx.fillStyle='#fafafa';ctx.strokeStyle=accent;ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(-28,-10);ctx.lineTo(-32,50);ctx.lineTo(32,50);ctx.lineTo(28,-10);ctx.closePath();ctx.fill();ctx.stroke();
 // Apron strings
 ctx.strokeStyle=accent;ctx.lineWidth=1.5;
 ctx.beginPath();ctx.moveTo(-20,-10);ctx.lineTo(-18,50);ctx.stroke();
 ctx.beginPath();ctx.moveTo(20,-10);ctx.lineTo(18,50);ctx.stroke();

 // ── Main body (torso behind apron) ──
 ctx.fillStyle=bodyCol;ctx.strokeStyle=accent;ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(0,-22,38,35,0,0,Math.PI*2);ctx.fill();ctx.stroke();

 // ── Chef toque hat ──
 ctx.fillStyle='#fafafa';ctx.strokeStyle='#bdbdbd';ctx.lineWidth=2;
 // Hat brim
 ctx.fillRect(-32,-60,64,12);ctx.strokeRect(-32,-60,64,12);
 // Hat top puff (tall chef hat)
 ctx.beginPath();ctx.moveTo(-22,-60);ctx.lineTo(-18,-120+pulse);ctx.lineTo(18,-120+pulse);ctx.lineTo(22,-60);ctx.closePath();ctx.fill();ctx.stroke();
 // Hat puff top
 ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,-120+pulse,20,12,0,0,Math.PI*2);ctx.fill();ctx.stroke();

 // ── Face ──
 ctx.fillStyle=bodyCol;ctx.strokeStyle=accent;ctx.lineWidth=2;
 ctx.beginPath();ctx.ellipse(0,-32,26,22,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 // Bushy moustache
 ctx.fillStyle='#4a2c00';
 ctx.beginPath();ctx.ellipse(-10,-26,10,5,0.3,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.ellipse(10,-26,10,5,-0.3,0,Math.PI*2);ctx.fill();
 // Eyes
 ctx.fillStyle=tier===3?'#ff3d00':'#212121';
 ctx.beginPath();ctx.arc(-10,-36,4,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(10,-36,4,0,Math.PI*2);ctx.fill();

 // ── Pizza peel weapon (arm + peel paddle) ──
 ctx.strokeStyle=accent;ctx.lineWidth=8;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(32,-20);ctx.lineTo(68,-8);ctx.stroke();
 // Peel paddle head
 ctx.fillStyle=tier===3?accent:bodyCol;ctx.strokeStyle='#d84315';ctx.lineWidth=2;
 ctx.beginPath();ctx.ellipse(80,-4,20,14,0.3,0,Math.PI*2);ctx.fill();ctx.stroke();
 // Tiny pizza on peel
 ctx.fillStyle='#ffd54f';ctx.beginPath();ctx.arc(80,-4,10,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e53935';ctx.beginPath();ctx.arc(80,-4,6,0,Math.PI*2);ctx.fill();

 // ── Left arm ──
 ctx.strokeStyle=bodyCol;ctx.lineWidth=10;
 ctx.beginPath();ctx.moveTo(-30,-18);ctx.lineTo(-56,2);ctx.stroke();

 // ── Legs ──
 ctx.lineWidth=12;ctx.strokeStyle=bodyCol;
 ctx.beginPath();ctx.moveTo(-14,50);ctx.lineTo(-16,80);ctx.stroke();
 ctx.beginPath();ctx.moveTo(14,50);ctx.lineTo(16,80);ctx.stroke();

 // Cheese drips (tier 2+)
 if(tier>=2){
  ctx.fillStyle=cheese;
  for(let d=0;d<4;d++){
   const drx=(-24+d*16),dry=50+Math.sin(t*.2+d)*4+d*5;
   ctx.beginPath();ctx.arc(drx,dry,4-d*.5,0,Math.PI*2);ctx.fill();
  }
 }

 // Phase 3 eruption aura
 if(tier===3){
  ctx.fillStyle=`rgba(255,100,0,${0.16+Math.sin(t*.1)*0.07})`;
  ctx.beginPath();ctx.ellipse(0,-10,60,55,0,0,Math.PI*2);ctx.fill();
 }
}

export function drawPizzaBoss(ctx,e,cam,t,reduceMotion=false){
 if(!e?._pizzaBoss)return false;
 const b=e._magmaChef,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h-(e._growthChapter?76:0));ctx.scale(b.aim||1,1);
 _drawChef(ctx,e,reduceMotion?0:t);
 if(e.telegraph){ctx.strokeStyle='#ff8a65';ctx.lineWidth=2.5;ctx.setLineDash([6,6]);ctx.strokeRect(-88,-138,176,146);ctx.setLineDash([]);}
 ctx.restore();

 if(e._growthChapter)return true;
 const barW=160,barH=10,bx=x+e.w/2-barW/2,by=y-32;
 ctx.fillStyle='rgba(18,8,4,0.88)';ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#bf360c':b.tier===2?'#e64a19':'#ff7043';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#ffccbc';ctx.lineWidth=1.2;ctx.strokeRect(bx-2,by-2,barW+4,barH+4);
 ctx.fillStyle='#fff3e0';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
 ctx.fillText(`CHEF MAGMÁTICO · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-7);
 return true;
}
