// VALLE DE LOS GIGANTES — Coloso de Piedra Ancestral (Dino's personal mini boss).
// 100% vector Canvas drawing: ancient stone dinosaur colossus with amber crests and fossilized plate armor.
// Three phases: seismic quake charge, rolling boulder barrage, and colossal mega-shockwave.
export const DINO_BOSS_ID='hub-dino-boss-v1';
export const DINO_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','boulder_barrage','quake_slam','fossil_eruption']);

export function createDinoBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',995,{rng});
 e.x=3420;e.y=DINO_BOSS.floor-104;e.w=128;e.h=104;
 e.hp=e.max=DINO_BOSS.hp;
 e.miniBoss=true;e._dinoBoss=true;
 e._campaignOriginal=true;e.spawnIndex=995;
 e._encounterSaveId=DINO_BOSS_ID;
 e.roomId='hub';e.color='#8d6e63';e.contactDmg=0;
 e._stoneColossus={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
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
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'COLOSO DE PIEDRA ANCESTRAL · DESPIERTO','#d7ccc8',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡COLOSO ATURDIDO!','#ffe082',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:22;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const throwBoulder=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-24,w:26,h:26,vx:direction*speed,vy:-2,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#8d6e63'});
   }
  };
  if(!b.burst){
   if(b.attack===2){throwBoulder(b.aim,7);if(b.tier>1)throwBoulder(-b.aim,5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:22,h:22,vx:side*5.5,vy:-4,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#bcaaa4'});
     }
    }
   }
   if(b.attack===3&&b.tier===3){
    for(let k=-2;k<=2;k++){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+30,w:20,h:20,vx:k*3.5,vy:-4.5,life:130,dmg:15,owner:'enemy',shape:'orb',color:'#ffb74d'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*8.5;e.facing=b.aim;}
  if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<e.w*0.5&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*0.55){
   hurt?.(b.tier===3?19:14,'dino-boss');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?35:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

export function drawDinoBoss(ctx,e,cam,t){
 if(!e?._dinoBoss)return false;
 const b=e._stoneColossus,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);
 const flip=b.aim||1;ctx.scale(flip,1);

 // Colossus body & fossil carapace
 ctx.fillStyle=b.tier===3?'#5d4037':'#4e342e';
 ctx.strokeStyle='#bcaaa4';
 ctx.lineWidth=3.5;
 ctx.beginPath();
 ctx.ellipse(0,-45,56,42,0,0,Math.PI*2);
 ctx.fill();
 ctx.stroke();

 // Armored bone plates
 ctx.fillStyle='#8d6e63';
 for(let i=-2;i<=2;i++){
  ctx.beginPath();
  ctx.moveTo(i*20,-75);
  ctx.lineTo(i*20-10,-95);
  ctx.lineTo(i*20+10,-95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
 }

 // Amber core glow
 const pulse=Math.sin(t*0.12)*4;
 ctx.fillStyle=b.tier===3?'#ff9800':'#ffca28';
 ctx.beginPath();
 ctx.arc(15,-45,12+pulse,0,Math.PI*2);
 ctx.fill();

 // Head & horns
 ctx.fillStyle='#3e2723';
 ctx.beginPath();
 ctx.moveTo(35,-50);
 ctx.lineTo(65,-40);
 ctx.lineTo(75,-25);
 ctx.lineTo(45,-20);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 // Amber eye
 ctx.fillStyle='#ffe082';
 ctx.beginPath();
 ctx.arc(52,-38,3.5,0,Math.PI*2);
 ctx.fill();

 // Telegraph warning
 if(e.telegraph){
  ctx.strokeStyle='#ffca28';
  ctx.lineWidth=2.5;
  ctx.setLineDash([6,6]);
  ctx.strokeRect(-65,-105,130,110);
 }
 ctx.restore();

 // Accessible Boss Health Bar
 const barW=140,barH=9,bx=x+e.w/2-barW/2,by=y-24;
 ctx.fillStyle='rgba(15,10,6,0.85)';
 ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#ff7043':b.tier===2?'#ffb74d':'#81c784';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#d7ccc8';
 ctx.lineWidth=1.2;
 ctx.strokeRect(bx-2,by-2,barW+4,barH+4);

 ctx.fillStyle='#fff8e1';
 ctx.font='bold 10px sans-serif';
 ctx.textAlign='center';
 ctx.fillText(`COLOSO DE PIEDRA · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-6);
 return true;
}
