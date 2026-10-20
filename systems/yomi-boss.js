// OBSERVATORIO ASTRAL — Guía del Más Allá (Yomi's personal mini boss).
// 100% vector Canvas: a translucent spirit guide — flowing ethereal robes,
// floating spirit orbs orbiting, star-crown, void-black face with glowing soul eyes.
// Three phases: calm spirit → restless apparition → full void manifestation.
export const YOMI_BOSS_ID='hub-yomi-boss-v1';
export const YOMI_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['drift','spirit_volley','soul_blast','void_eruption']);

export function createYomiBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'escoria','hub',992,{rng});
 e.x=3420;e.y=YOMI_BOSS.floor-120;e.w=110;e.h=120;
 e.hp=e.max=YOMI_BOSS.hp;
 e.miniBoss=true;e._yomiBoss=true;
 e._campaignOriginal=true;e.spawnIndex=992;
 e._encounterSaveId=YOMI_BOSS_ID;
 e.roomId='hub';e.color='#ce93d8';e.contactDmg=0;
 e._spiritGuide={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,orbitAngle:0};
 return e;
}

export function updateYomiBoss(e,g,hurt){
 if(!e?._yomiBoss)return false;
 const b=e._spiritGuide,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(YOMI_BOSS.left,Math.min(YOMI_BOSS.right-e.w,e.x));
 e.y=YOMI_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 b.orbitAngle=(b.orbitAngle||0)+0.04*(b.tier===3?2:1);
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<680){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-50,'GUÍA DEL MÁS ALLÁ — DESPIERTO','#e1bee7',true);
   if(b.clock<=0){b.phase='rest';b.clock=55;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<950){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?30:48;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=88;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡GUÍA ATURDIDO!','#e1bee7',true);}
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
   if(b.attack===3&&b.tier===3){for(let a=0;a<6;a++){const ang=a*Math.PI/3;fireOrb(Math.cos(ang)*5.5,Math.sin(ang)*5.5-3,'#7b1fa2');}}
   b.burst=1;
  }
  // Drift locomotion: ghostly glide
  if(b.attack===0){e.x+=b.aim*7;e.facing=b.aim;}
  if(Math.abs(dx)<e.w*.55&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*.6)hurt?.(b.tier===3?18:13,'yomi-boss');
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?30:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

function _drawSpirit(ctx,e,t){
 const b=e._spiritGuide,tier=b.tier;
 const robe  =tier===3?'rgba(123,31,162,0.82)':tier===2?'rgba(171,71,188,0.75)':'rgba(206,147,216,0.70)';
 const robeS =tier===3?'#ce93d8':tier===2?'#e1bee7':'#f3e5f5';
 const orb   =tier===3?'#7b1fa2':tier===2?'#ab47bc':'#ce93d8';
 const eyeG  =tier===3?'#ff4081':'#e040fb';
 const float =Math.sin(t*.07)*6;

 ctx.save();ctx.translate(0,float);

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

 // ── Upper body / torso glow ──
 ctx.fillStyle=tier===3?'rgba(123,31,162,0.6)':'rgba(206,147,216,0.45)';
 ctx.beginPath();ctx.ellipse(0,-18,24,30,0,0,Math.PI*2);ctx.fill();

 // ── Star crown ──
 const starCount=tier===3?8:5;
 for(let s=0;s<starCount;s++){
  const ang=s*(Math.PI*2/starCount)+(t*.04);
  const sr=34+Math.sin(t*.12+s)*3;
  const sx=Math.cos(ang)*sr,sy=-55+Math.sin(ang)*sr;
  const starPulse=0.6+Math.sin(t*.14+s)*.3;
  ctx.fillStyle=`rgba(${tier===3?'200,50,255':'180,100,240'},${starPulse})`;
  ctx.beginPath();
  ctx.moveTo(sx,sy-5);ctx.lineTo(sx+2,sy-2);ctx.lineTo(sx+5,sy);
  ctx.lineTo(sx+2,sy+2);ctx.lineTo(sx,sy+5);ctx.lineTo(sx-2,sy+2);
  ctx.lineTo(sx-5,sy);ctx.lineTo(sx-2,sy-2);ctx.closePath();ctx.fill();
 }

 // ── Face — void dark with glowing soul eyes ──
 ctx.fillStyle='rgba(10,0,22,0.85)';ctx.strokeStyle=robeS;ctx.lineWidth=2;
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

 // ── Orbiting spirit orbs ──
 const orbCount=tier===3?4:tier===2?3:2;
 for(let o=0;o<orbCount;o++){
  const ang=b.orbitAngle+o*(Math.PI*2/orbCount);
  const ox=Math.cos(ang)*44,oy=Math.sin(ang)*18-22;
  ctx.fillStyle=orb;ctx.globalAlpha=0.75;
  ctx.beginPath();ctx.arc(ox,oy,7,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=0.3;ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(ox-2,oy-2,2.5,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
 }

 ctx.restore();
}

export function drawYomiBoss(ctx,e,cam,t){
 if(!e?._yomiBoss)return false;
 const b=e._spiritGuide,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);ctx.scale(b.aim||1,1);
 _drawSpirit(ctx,e,t);
 if(e.telegraph){ctx.strokeStyle='#ce93d8';ctx.lineWidth=2.5;ctx.setLineDash([5,5]);ctx.strokeRect(-60,-115,120,125);ctx.setLineDash([]);}
 ctx.restore();

 const barW=158,barH=10,bx=x+e.w/2-barW/2,by=y-32;
 ctx.fillStyle='rgba(10,0,20,0.88)';ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#7b1fa2':b.tier===2?'#ab47bc':'#ce93d8';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#e1bee7';ctx.lineWidth=1.2;ctx.strokeRect(bx-2,by-2,barW+4,barH+4);
 ctx.fillStyle='#f3e5f5';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
 ctx.fillText(`GUÍA DEL MÁS ALLÁ · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-7);
 return true;
}
