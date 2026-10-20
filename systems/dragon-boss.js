// CORDILLERA DE LAS BRASAS — Guardián del Núcleo Ígneo (Dragón's personal mini boss).
// 100% vector Canvas drawing: colossal igneous dragon guardian with molten magma scales.
// Three phases: magma charge, volcanic eruption barrage, and full solar flare overload.
export const DRAGON_BOSS_ID='hub-dragon-boss-v1';
export const DRAGON_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','lava_barrage','magma_slam','solar_eruption']);

export function createDragonBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',996,{rng});
 e.x=3420;e.y=DRAGON_BOSS.floor-100;e.w=124;e.h=100;
 e.hp=e.max=DRAGON_BOSS.hp;
 e.miniBoss=true;e._dragonBoss=true;
 e._campaignOriginal=true;e.spawnIndex=996;
 e._encounterSaveId=DRAGON_BOSS_ID;
 e.roomId='hub';e.color='#ff6a2a';e.contactDmg=0;
 e._igneousDragon={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
 return e;
}

export function updateDragonBoss(e,g,hurt){
 if(!e?._dragonBoss)return false;
 const b=e._igneousDragon,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(DRAGON_BOSS.left,Math.min(DRAGON_BOSS.right-e.w,e.x));
 e.y=DRAGON_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'GUARDIÁN DEL NÚCLEO ÍGNEO · DESPIERTO','#ff8a50',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡GUARDIÁN ATURDIDO!','#ffe89c',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const magmaWave=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:24,h:18,vx:direction*speed,vy:0,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#ff5420'});
   }
  };
  if(!b.burst){
   if(b.attack===2){magmaWave(b.aim,6.5);if(b.tier>1)magmaWave(-b.aim,4.5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:22,h:22,vx:side*5,vy:-3,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ff9030'});
     }
    }
   }
   if(b.attack===3&&b.tier===3){
    for(let k=-2;k<=2;k++){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+30,w:18,h:18,vx:k*3.2,vy:-4,life:130,dmg:15,owner:'enemy',shape:'orb',color:'#ffe668'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*8;e.facing=b.aim;}
  if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<e.w*0.5&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*0.55){
   hurt?.(b.tier===3?19:14,'dragon-boss');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?35:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
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
 ctx.ellipse(0,-42,54,34,0,0,Math.PI*2);
 ctx.fill();ctx.stroke();

 // Glowing volcanic fissures on body
 ctx.strokeStyle='#ffd255';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(-28,-42);ctx.lineTo(-8,-52);ctx.lineTo(12,-38);ctx.lineTo(34,-44);
 ctx.stroke();

 // Strong front and back claws
 ctx.fillStyle='#180604';ctx.strokeStyle='#ff5220';ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(-34,-8,14,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.arc(34,-8,14,0,Math.PI*2);ctx.fill();ctx.stroke();

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
 ctx.beginPath();ctx.arc(55,-52,5,0,Math.PI*2);ctx.fill();

 // Spiked dorsal plates (dientes de magma)
 for(let i=-2;i<=2;i++){
  const sx=i*18,sy=-74-Math.cos(i*0.6)*6+pulse*0.3;
  ctx.fillStyle='#ff5020';ctx.strokeStyle='#ffd870';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(sx-7,-48);ctx.lineTo(sx,sy);ctx.lineTo(sx+7,-48);ctx.closePath();
  ctx.fill();ctx.stroke();
 }

 // Telegraph warning aura
 if(e.telegraph){
  ctx.strokeStyle='rgba(255,230,100,0.85)';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,-45,68+Math.sin(t*0.3)*6,0,Math.PI*2);ctx.stroke();
 }

 // Exposed weak point indicator
 if(b.exposed){
  ctx.fillStyle='#ffe580';
  ctx.font='bold 11px sans-serif';ctx.textAlign='center';
  ctx.fillText('¡VULNERABLE!',0,-96);
 }

 ctx.restore();
 return true;
}
