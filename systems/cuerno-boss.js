// BOSQUE DEL PRISMA — Bestia Prisma (Cuerno's personal mini boss).
// 100% vector Canvas: a majestic crystal stag/beast — faceted crystal body,
// rainbow prism antlers that refract light, aurora tail, crystal hooves.
// Three phases: clear crystal → amber-veined → full rainbow eruption.
export const CUERNO_BOSS_ID='hub-cuerno-boss-v1';
export const CUERNO_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','prism_volley','aurora_slam','rainbow_eruption']);

export function createCuernoBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'rana','hub',991,{rng});
 e.x=3420;e.y=CUERNO_BOSS.floor-118;e.w=132;e.h=118;
 e.hp=e.max=CUERNO_BOSS.hp;
 e.miniBoss=true;e._cuernoBoss=true;
 e._campaignOriginal=true;e.spawnIndex=991;
 e._encounterSaveId=CUERNO_BOSS_ID;
 e.roomId='hub';e.color='#b39ddb';e.contactDmg=0;
 e._prismBeast={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,rainbowAngle:0};
 return e;
}

export function updateCuernoBoss(e,g,hurt){
 if(!e?._cuernoBoss)return false;
 const b=e._prismBeast,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(CUERNO_BOSS.left,Math.min(CUERNO_BOSS.right-e.w,e.x));
 e.y=CUERNO_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 b.rainbowAngle=(b.rainbowAngle||0)+0.05;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<700){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-50,'BESTIA PRISMA — DESPIERTA','#e1d5ff',true);
   if(b.clock<=0){b.phase='rest';b.clock=55;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<950){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?30:48;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=88;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡BESTIA ATURDIDA!','#e1d5ff',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?30:22;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const rainbow=['#ef5350','#ff9800','#fdd835','#66bb6a','#42a5f5','#7e57c2'];
  const fireShard=(vx,vy=-3.5,col)=>{
   if((g.projectiles?.length||0)<130)
    g.projectiles.push({x:e.x+e.w/2,y:e.y+40,w:18,h:18,vx,vy,life:150,dmg:b.tier===3?19:13,owner:'enemy',shape:'orb',color:col||rainbow[b.attack%6]});
  };
  if(!b.burst){
   if(b.attack===0){/* charge */}
   if(b.attack===1){fireShard(b.aim*7,-3.5);if(b.tier>1)fireShard(-b.aim*5,-2,rainbow[2]);}
   if(b.attack===2){for(let k=-1;k<=1;k++)fireShard(b.aim*(5+k*2),-3.2-Math.abs(k),rainbow[k+1]);}
   if(b.attack===3&&b.tier===3){for(let a=0;a<6;a++){const ang=a*Math.PI/3;fireShard(Math.cos(ang)*5.5,Math.sin(ang)*5.5-3,rainbow[a]);}}
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*10;e.facing=b.aim;}
  if(Math.abs(dx)<e.w*.55&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*.6)hurt?.(b.tier===3?20:14,'cuerno-boss');
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?30:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

function _drawPrismBeast(ctx,e,t){
 const b=e._prismBeast,tier=b.tier;
 const crystal=tier===3?'rgba(100,60,200,0.85)':tier===2?'rgba(140,100,220,0.80)':'rgba(180,150,240,0.75)';
 const edge   =tier===3?'#ff4081':tier===2?'#e040fb':'#ce93d8';
 const glow   =tier===3?'#ea80fc':'#d1c4e9';
 const float  =Math.sin(t*.08)*4;

 ctx.save();ctx.translate(0,float);

 // ── Hind legs ──
 ctx.strokeStyle=crystal;ctx.lineWidth=12;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-24,10);ctx.lineTo(-30,48);ctx.lineTo(-22,62);ctx.stroke();
 ctx.beginPath();ctx.moveTo(24,10);ctx.lineTo(30,48);ctx.lineTo(22,62);ctx.stroke();
 // Crystal hooves
 ctx.fillStyle=edge;
 ctx.beginPath();ctx.rect(-26,60,12,10);ctx.fill();
 ctx.beginPath();ctx.rect(18,60,12,10);ctx.fill();

 // ── Body (faceted crystal prism shape) ──
 ctx.fillStyle=crystal;ctx.strokeStyle=edge;ctx.lineWidth=2.5;
 ctx.beginPath();
 ctx.moveTo(-40,-8);ctx.lineTo(-50,10);ctx.lineTo(-44,36);
 ctx.lineTo(44,36);ctx.lineTo(50,10);ctx.lineTo(40,-8);
 ctx.lineTo(20,-38);ctx.lineTo(-20,-38);
 ctx.closePath();ctx.fill();ctx.stroke();

 // Inner facet lines
 ctx.strokeStyle=`rgba(255,255,255,0.3)`;ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(-20,-38);ctx.lineTo(0,36);ctx.lineTo(20,-38);ctx.stroke();
 ctx.beginPath();ctx.moveTo(-40,-8);ctx.lineTo(0,36);ctx.lineTo(40,-8);ctx.stroke();

 // ── Neck + head ──
 ctx.fillStyle=crystal;ctx.strokeStyle=edge;ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(-18,-36);ctx.lineTo(-22,-60);ctx.lineTo(0,-72);ctx.lineTo(22,-60);ctx.lineTo(18,-36);ctx.closePath();ctx.fill();ctx.stroke();
 // Snout
 ctx.beginPath();ctx.moveTo(-14,-58);ctx.lineTo(0,-72);ctx.lineTo(30,-56);ctx.lineTo(24,-44);ctx.lineTo(-10,-48);ctx.closePath();ctx.fill();ctx.stroke();
 // Eyes
 ctx.fillStyle=tier===3?'#ff4081':'#e040fb';
 ctx.beginPath();ctx.arc(14,-58,5,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(16,-59,2,0,Math.PI*2);ctx.fill();

 // ── Rainbow prism antlers ──
 const rainbow=['#ef5350','#ff9800','#fdd835','#66bb6a','#42a5f5','#7e57c2'];
 const antlerTines=tier===3?4:tier===2?3:2;
 // Left antler
 ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-10,-70);ctx.quadraticCurveTo(-40,-100,-50,-95+Math.sin(t*.12)*3);ctx.stroke();
 for(let i=0;i<antlerTines;i++){
  ctx.strokeStyle=rainbow[i%6];ctx.lineWidth=2.5;
  const tx=-38-(i*6),ty=-86-(i*10);
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx-12-(i*4),ty-16);ctx.stroke();
 }
 // Right antler
 ctx.strokeStyle=edge;ctx.lineWidth=4;
 ctx.beginPath();ctx.moveTo(10,-70);ctx.quadraticCurveTo(40,-100,50,-95+Math.sin(t*.12+1)*3);ctx.stroke();
 for(let i=0;i<antlerTines;i++){
  ctx.strokeStyle=rainbow[(i+2)%6];ctx.lineWidth=2.5;
  const tx=38+(i*6),ty=-86-(i*10);
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+12+(i*4),ty-16);ctx.stroke();
 }

 // ── Front legs ──
 ctx.strokeStyle=crystal;ctx.lineWidth=10;
 ctx.beginPath();ctx.moveTo(-30,-4);ctx.lineTo(-44,30);ctx.stroke();
 ctx.beginPath();ctx.moveTo(30,-4);ctx.lineTo(44,30);ctx.stroke();

 // ── Aurora tail ──
 const tColors=['#ff4081','#ff9800','#fdd835','#4caf50','#2196f3','#9c27b0'];
 for(let tc=0;tc<6;tc++){
  const tailOff=Math.sin(t*.14+tc*.5)*12;
  ctx.strokeStyle=`rgba(${tc===0?'255,64,129':tc===1?'255,152,0':tc===2?'253,216,53':tc===3?'76,175,80':tc===4?'33,150,243':'156,39,176'},0.6)`;
  ctx.lineWidth=5-tc*.5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-44,20+tc*3);ctx.quadraticCurveTo(-70,40+tailOff,-80+tc*5,50+tc*8+tailOff);ctx.stroke();
 }

 // Phase 3 rainbow aura
 if(tier===3){
  for(let a=0;a<6;a++){
   const ang=b.rainbowAngle+a*(Math.PI/3);
   ctx.strokeStyle=`rgba(${rainbow[a].slice(1)===rainbow[a].slice(1)?rainbow[a]:'200,100,255'},0.25)`;
   ctx.strokeStyle=rainbow[a];ctx.globalAlpha=0.18+Math.sin(t*.1+a)*.08;ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(0,-14,55+a*4,ang,ang+Math.PI/3);ctx.stroke();
   ctx.globalAlpha=1;
  }
 }

 ctx.restore();
}

export function drawCuernoBoss(ctx,e,cam,t){
 if(!e?._cuernoBoss)return false;
 const b=e._prismBeast,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);ctx.scale(b.aim||1,1);
 _drawPrismBeast(ctx,e,t);
 if(e.telegraph){ctx.strokeStyle='#ce93d8';ctx.lineWidth=2.5;ctx.setLineDash([6,6]);ctx.strokeRect(-80,-120,160,130);ctx.setLineDash([]);}
 ctx.restore();

 const barW=162,barH=10,bx=x+e.w/2-barW/2,by=y-32;
 ctx.fillStyle='rgba(8,4,18,0.88)';ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#7e57c2':b.tier===2?'#ab47bc':'#ce93d8';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#e1d5ff';ctx.lineWidth=1.2;ctx.strokeRect(bx-2,by-2,barW+4,barH+4);
 ctx.fillStyle='#ede7f6';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
 ctx.fillText(`BESTIA PRISMA · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-7);
 return true;
}
