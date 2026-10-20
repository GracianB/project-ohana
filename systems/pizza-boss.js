// REINO DEL HORNO — Chef Magmático (Pizza's personal mini boss).
// 100% vector Canvas: a giant magma humanoid chef — wide apron, tall toque, pizza
// peel weapon, cheese drips from body. Three phases evolve from brick-red to
// magma-orange to full eruption glow.
export const PIZZA_BOSS_ID='hub-pizza-boss-v1';
export const PIZZA_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','cheese_volley','peel_slam','eruption_wave']);

export function createPizzaBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',993,{rng});
 e.x=3420;e.y=PIZZA_BOSS.floor-128;e.w=120;e.h=128;
 e.hp=e.max=PIZZA_BOSS.hp;
 e.miniBoss=true;e._pizzaBoss=true;
 e._campaignOriginal=true;e.spawnIndex=993;
 e._encounterSaveId=PIZZA_BOSS_ID;
 e.roomId='hub';e.color='#ff7043';e.contactDmg=0;
 e._magmaChef={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,launch:0};
 return e;
}

export function updatePizzaBoss(e,g,hurt){
 if(!e?._pizzaBoss)return false;
 const b=e._magmaChef,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(PIZZA_BOSS.left,Math.min(PIZZA_BOSS.right-e.w,e.x));
 e.y=PIZZA_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 if(b.launch>0)b.launch--;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<680){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-50,'CHEF MAGMÁTICO — DESPIERTO','#ffccbc',true);
   if(b.clock<=0){b.phase='rest';b.clock=55;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<950){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?32:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=88;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡CHEF ATURDIDO!','#ffe0b2',true);}
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
   if(b.attack===3&&b.tier===3){for(let k=-2;k<=2;k++)fireCheese(k*4.5,-4,'#ff8a65');}
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*9.5;e.facing=b.aim;}
  if(Math.abs(dx)<e.w*.55&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*.6)hurt?.(b.tier===3?20:14,'pizza-boss');
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?32:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

function _drawChef(ctx,e,t){
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

export function drawPizzaBoss(ctx,e,cam,t){
 if(!e?._pizzaBoss)return false;
 const b=e._magmaChef,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);ctx.scale(b.aim||1,1);
 _drawChef(ctx,e,t);
 if(e.telegraph){ctx.strokeStyle='#ff8a65';ctx.lineWidth=2.5;ctx.setLineDash([6,6]);ctx.strokeRect(-88,-138,176,146);ctx.setLineDash([]);}
 ctx.restore();

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
