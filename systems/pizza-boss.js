// REINO DEL HORNO — Chef Magmático (Pizza's personal mini boss).
// 100% vector Canvas drawing: colossal molten stone oven golem with chef hat, fiery shovel and rolling crust armor.
// Three phases: rolling crust crush, tomato splash eruption, and superheated oven flare.
export const PIZZA_BOSS_ID='hub-pizza-boss-v1';
export const PIZZA_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','tomato_burst','crust_slam','stellar_flare']);

export function createPizzaBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',993,{rng});
 e.x=3420;e.y=PIZZA_BOSS.floor-102;e.w=126;e.h=102;
 e.hp=e.max=PIZZA_BOSS.hp;
 e.miniBoss=true;e._pizzaBoss=true;
 e._campaignOriginal=true;e.spawnIndex=993;
 e._encounterSaveId=PIZZA_BOSS_ID;
 e.roomId='hub';e.color='#ff7043';e.contactDmg=0;
 e._magmaChef={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
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
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'CHEF MAGMÁTICO · DESPIERTO','#ff8a65',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡CHEF MAGMÁTICO ATURDIDO!','#ffcc80',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const launchTomatoDisc=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:24,h:24,vx:direction*speed,vy:-1.5,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#d84315'});
   }
  };
  if(!b.burst){
   if(b.attack===2){launchTomatoDisc(b.aim,7);if(b.tier>1)launchTomatoDisc(-b.aim,5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5.2,vy:-3.8,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ff5722'});
     }
    }
   }
   if(b.attack===3&&b.tier===3){
    for(let k=-2;k<=2;k++){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+30,w:18,h:18,vx:k*3.4,vy:-4,life:130,dmg:15,owner:'enemy',shape:'orb',color:'#ffab40'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*8.4;e.facing=b.aim;}
  if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<e.w*0.5&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*0.55){
   hurt?.(b.tier===3?19:14,'pizza-boss');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?35:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

export function drawPizzaBoss(ctx,e,cam,t){
 if(!e?._pizzaBoss)return false;
 const b=e._magmaChef,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);
 const flip=b.aim||1;ctx.scale(flip,1);

 // Stone oven body
 ctx.fillStyle=b.tier===3?'#bf360c':'#d84315';
 ctx.strokeStyle='#ffcc80';
 ctx.lineWidth=3.5;
 ctx.beginPath();
 ctx.ellipse(0,-45,54,40,0,0,Math.PI*2);
 ctx.fill();
 ctx.stroke();

 // Chef hat made of baked dough
 ctx.fillStyle='#fff3e0';
 ctx.strokeStyle='#d7ccc8';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(-20,-80);
 ctx.lineTo(20,-80);
 ctx.quadraticCurveTo(30,-105,0,-110);
 ctx.quadraticCurveTo(-30,-105,-20,-80);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 // Molten Hearth Window
 const pulse=Math.sin(t*0.14)*4;
 ctx.fillStyle=b.tier===3?'#ffff00':'#ff9100';
 ctx.beginPath();
 ctx.arc(15,-45,12+pulse,0,Math.PI*2);
 ctx.fill();

 // Pizza shovel / paddle
 ctx.strokeStyle='#8d6e63';ctx.lineWidth=4;
 ctx.beginPath();ctx.moveTo(35,-20);ctx.lineTo(65,-55);ctx.stroke();
 ctx.fillStyle='#d7ccc8';ctx.fillRect(55,-65,24,20);

 // Eye
 ctx.fillStyle='#212121';
 ctx.beginPath();
 ctx.arc(36,-50,3.5,0,Math.PI*2);
 ctx.fill();

 // Telegraph warning
 if(e.telegraph){
  ctx.strokeStyle='#ff9100';
  ctx.lineWidth=2.5;
  ctx.setLineDash([6,6]);
  ctx.strokeRect(-65,-105,130,110);
 }
 ctx.restore();

 // Accessible Boss Health Bar
 const barW=140,barH=9,bx=x+e.w/2-barW/2,by=y-24;
 ctx.fillStyle='rgba(25,10,5,0.85)';
 ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#d50000':b.tier===2?'#ff6d00':'#ff9100';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#ffcc80';
 ctx.lineWidth=1.2;
 ctx.strokeRect(bx-2,by-2,barW+4,barH+4);

 ctx.fillStyle='#fff3e0';
 ctx.font='bold 10px sans-serif';
 ctx.textAlign='center';
 ctx.fillText(`CHEF MAGMÁTICO · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-6);
 return true;
}
