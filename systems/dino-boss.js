// VALLE DE LOS GIGANTES — Coloso de Piedra Ancestral (Dino's personal mini boss).
// 100% vector Canvas drawing: a massive stone T-Rex with amber-cracked armour that evolves
// across three phases — from grey granite to glowing amber ruptures to a full eruption form.
// Three telegraphed phases: ground-shake charge, amber boulder barrage, colossal mega-slam.
export const DINO_BOSS_ID='hub-dino-boss-v1';
export const DINO_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','boulder_barrage','quake_slam','fossil_eruption']);

export function createDinoBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',995,{rng});
 e.x=3420;e.y=DINO_BOSS.floor-120;e.w=140;e.h=120;
 e.hp=e.max=DINO_BOSS.hp;
 e.miniBoss=true;e._dinoBoss=true;
 e._campaignOriginal=true;e.spawnIndex=995;
 e._encounterSaveId=DINO_BOSS_ID;
 e.roomId='hub';e.color='#8d6e63';e.contactDmg=0;
 e._stoneColossus={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,stomp:0};
 return e;
}

export function updateDinoBoss(e,g,hurt){
 if(!e?._dinoBoss)return false;
 const b=e._stoneColossus,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(DINO_BOSS.left,Math.min(DINO_BOSS.right-e.w,e.x));
 e.y=DINO_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(b.stomp>0)b.stomp--;
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<700){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-50,'COLOSO DE PIEDRA — DESPIERTO','#d7ccc8',true);
   if(b.clock<=0){b.phase='rest';b.clock=60;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<950){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?32:48;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡COLOSO ATURDIDO!','#ffe082',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?30:24;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const fireBoulder=(vx,vy=-3,color='#8d6e63')=>{
   if((g.projectiles?.length||0)<130)
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-30,w:28,h:28,vx,vy,life:150,dmg:b.tier===3?20:14,owner:'enemy',shape:'orb',color});
  };
  if(!b.burst){
   // Attack 0: charge stomp — contact damage + ground shake
   if(b.attack===0){b.stomp=22;}
   // Attack 1: dual boulders
   if(b.attack===1){fireBoulder(b.aim*7,-3);if(b.tier>1)fireBoulder(-b.aim*5,-2,'#bcaaa4');}
   // Attack 2: quake slam — fan of 3 projectiles
   if(b.attack===2){for(let k=-1;k<=1;k++)fireBoulder(b.aim*(5.5+k*2),-2.5-Math.abs(k)*1.5,'#a1887f');}
   // Attack 3 (tier 3 only): fossil eruption — 5-way spread
   if(b.attack===3&&b.tier===3){for(let k=-2;k<=2;k++)fireBoulder(k*4,-4,'#ffb74d');}
   b.burst=1;
  }
  // Charge locomotion
  if(b.attack===0){e.x+=b.aim*9.5;e.facing=b.aim;}
  if(Math.abs(dx)<e.w*.55&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*.6){
   hurt?.(b.tier===3?20:15,'dino-boss');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?32:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

// ── Stone T-Rex vector drawing ────────────────────────────────────────────────
// Phase 1: solid grey granite  · Phase 2: amber crack veins  · Phase 3: eruption glow
function _drawColossus(ctx,e,t){
 const b=e._stoneColossus;
 const tier=b.tier;
 const body = tier===3?'#5d4037':tier===2?'#6d4c41':'#4e342e';
 const accent= tier===3?'#ff8f00':tier===2?'#ffca28':'#a1887f';
 const crack = tier===3?'#ff6f00':tier===2?'#ffd54f':'rgba(0,0,0,0)';
 const pulse  = Math.sin(t*0.12)*3;

 // ── Tail ──
 ctx.fillStyle=body;
 ctx.beginPath();
 ctx.moveTo(-56,-28);ctx.lineTo(-90,-18);ctx.lineTo(-80,8);ctx.lineTo(-46,-2);
 ctx.closePath();ctx.fill();

 // ── Main body ──
 ctx.strokeStyle=accent;ctx.lineWidth=3;
 ctx.beginPath();
 ctx.ellipse(0,-38,52,38,0,0,Math.PI*2);
 ctx.fillStyle=body;ctx.fill();ctx.stroke();

 // Amber crack veins on body (tier 2+)
 if(tier>=2){
  ctx.strokeStyle=crack;ctx.lineWidth=2;ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(-30,-55);ctx.lineTo(-15,-25);ctx.lineTo(-28,-8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(20,-60);ctx.lineTo(30,-30);ctx.lineTo(18,-5);ctx.stroke();
 }

 // ── Dorsal plates (iconic dino spines) ──
 ctx.fillStyle=accent;ctx.strokeStyle=body;ctx.lineWidth=1.5;
 const spines=[{x:-32,h:28},{x:-14,h:38},{x:4,h:42},{x:22,h:36},{x:38,h:26}];
 for(const sp of spines){
  ctx.beginPath();
  ctx.moveTo(sp.x-9,-68);
  ctx.lineTo(sp.x,-68-sp.h-(tier===3?pulse:0));
  ctx.lineTo(sp.x+9,-68);
  ctx.closePath();ctx.fill();ctx.stroke();
 }

 // ── Head (T-Rex shape: elongated snout, deep bite) ──
 ctx.fillStyle=body;ctx.strokeStyle=accent;ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(38,-52);    // neck join top
 ctx.lineTo(80,-38);    // top snout
 ctx.lineTo(96,-16);    // tip of snout
 ctx.lineTo(88,4);      // lower jaw tip
 ctx.lineTo(60,14);     // jaw underside
 ctx.lineTo(40,-6);     // throat
 ctx.lineTo(32,-26);    // neck join bottom
 ctx.closePath();
 ctx.fill();ctx.stroke();

 // Teeth
 ctx.fillStyle='#efebe9';ctx.strokeStyle='none';
 for(let t2=0;t2<3;t2++){
  const tx=68+t2*9,ty=4-t2*4;
  ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx-4,ty+10);ctx.lineTo(tx+4,ty+10);ctx.closePath();ctx.fill();
 }

 // Amber eye
 const eyePulse=tier===3?(1.2+Math.sin(t*0.18)*0.3):1;
 ctx.fillStyle=tier===3?'#ff6d00':'#ffe082';
 ctx.beginPath();ctx.arc(68,-28,6*eyePulse,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#1a0800';ctx.beginPath();ctx.arc(70,-28,3,0,Math.PI*2);ctx.fill();

 // ── Tiny arms ──
 ctx.fillStyle=body;ctx.strokeStyle=accent;ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(30,-20);ctx.lineTo(52,0);ctx.lineTo(46,16);
 ctx.stroke();

 // ── Legs ──
 ctx.lineWidth=10;
 ctx.strokeStyle=body;
 ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-22,36);ctx.lineTo(-14,36);ctx.stroke();
 ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(22,36);ctx.lineTo(14,36);ctx.stroke();

 // Phase 3: amber eruption aura
 if(tier===3){
  ctx.fillStyle=`rgba(255,143,0,${0.18+Math.sin(t*0.1)*0.08})`;
  ctx.beginPath();ctx.ellipse(0,-30,70,56,0,0,Math.PI*2);ctx.fill();
 }
}

export function drawDinoBoss(ctx,e,cam,t){
 if(!e?._dinoBoss)return false;
 const b=e._stoneColossus;
 const x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);
 const flip=b.aim||1;ctx.scale(flip,1);

 _drawColossus(ctx,e,t);

 // Telegraph warning box
 if(e.telegraph){
  ctx.strokeStyle='#ffca28';ctx.lineWidth=2.5;ctx.setLineDash([6,6]);
  ctx.strokeRect(-74,-128,148,132);ctx.setLineDash([]);
 }
 ctx.restore();

 // ── Boss health bar ──
 const barW=160,barH=10,bx=x+e.w/2-barW/2,by=y-30;
 ctx.fillStyle='rgba(15,8,4,0.88)';ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#ff6f00':b.tier===2?'#ffb300':'#66bb6a';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#d7ccc8';ctx.lineWidth=1.2;ctx.strokeRect(bx-2,by-2,barW+4,barH+4);

 ctx.fillStyle='#fff8e1';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
 ctx.fillText(`COLOSO DE PIEDRA · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-7);
 return true;
}
