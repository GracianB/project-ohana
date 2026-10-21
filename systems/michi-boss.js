// LOS JARDINES DE LA LUNA — Oráculo Medusaluna (Michicornio's personal mini boss).
// 100% vector Canvas drawing: colossal astral celestial feline with twin moon tails.
// Three phases: shadow pounce, dream orb barrage, and full eclipse overload.
export const MICHI_BOSS_ID='hub-michi-boss-v1';
export const MICHI_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['pounce','dream_barrage','crescent_strike','eclipse_overload']);

export function createMichiBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',997,{rng});
 e.x=3420;e.y=MICHI_BOSS.floor-96;e.w=118;e.h=96;
 e.hp=e.max=MICHI_BOSS.hp;
 e.miniBoss=true;e._michiBoss=true;
 e._campaignOriginal=true;e.spawnIndex=999;
 e._encounterSaveId=MICHI_BOSS_ID;
 e.roomId='hub';e.color='#e5c2ff';e.contactDmg=0;
 e._astralCat={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false,pattern:'pounce'};
 return e;
}

export function updateMichiBoss(e,g,hurt){
 if(!e?._michiBoss)return false;
 const b=e._astralCat,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(MICHI_BOSS.left,Math.min(MICHI_BOSS.right-e.w,e.x));
 e.y=MICHI_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'ORÁCULO MEDUSALUNA · DESPIERTO','#e5c2ff',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.pattern=PATTERNS[b.attack];b.clock=b.tier===3?35:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡ESPÍRITU ATURDIDO!','#ffd6fa',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const astralWave=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:22,h:16,vx:direction*speed,vy:0,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#e5c2ff'});
   }
  };
  if(!b.burst){
   if(b.attack===2){astralWave(b.aim,6.5);if(b.tier>1)astralWave(-b.aim,4.5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5,vy:-3,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ffb6e4'});
     }
    }
   }
   if(b.attack===3){
    // Lunar eclipse starlight barrage from above
    for(let i=-1;i<=1;i++){
     const sx=p.x+i*80;
     g.fx?.emit?.(sx,p.y-120,{color:'#e5c2ff',count:8,size:3,star:true,life:30});
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:sx,y:e.y-180,w:18,h:32,vx:0,vy:8,life:90,dmg:b.tier===3?22:15,owner:'enemy',shape:'orb',color:'#ffcbf2'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){
   e.x=Math.max(MICHI_BOSS.left,Math.min(MICHI_BOSS.right-e.w,e.x+b.aim*(b.tier===3?9.5:6.2)));
   if(Math.abs(dx)<(e.w+p.w)/2&&Math.abs(p.y+p.h/2-e.y-e.h/2)<(p.h+e.h)/2){
    hurt?.(b.tier===3?22:16,'ZARPAZO ASTRAL');
   }
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?38:70;b.attack=(b.attack+1)%PATTERNS.length;b.exposed=true;}
 }
 e.stun=Math.min(e.stun||0,2);
 e._campaign={wind:e.wind,active:e.lunge,aim:b.aim};
 return true;
}

// V458 Oráculo Medusaluna. Visuals have no influence on collisions or attack damage.
const TAU=Math.PI*2;
export function drawMichiBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._michiBoss)return;
 const b=e._astralCat,x=e.x+e.w/2-cam.x,y=e.y+e.h/2-cam.y;
 if(!e.telegraph&&!b.exposed)return;
 ctx.save();
 if(b.exposed){
  ctx.globalAlpha=.56;ctx.lineWidth=3;ctx.strokeStyle='#baf9f3';
  ctx.beginPath();ctx.ellipse(x,y,Math.max(42,e.w*.55),Math.max(43,e.h*.68),0,0,TAU);ctx.stroke();
 }else{
  const progress=1-Math.max(0,Math.min(1,b.clock/(b.tier===3?35:50)));
  const r=72-(reduced?0:Math.sin(t*.18)*4)-progress*16;
  ctx.globalAlpha=.9;ctx.strokeStyle=b.attack===3?'#ffd1a6':b.attack===2?'#fff2a9':'#f4b5ff';ctx.lineWidth=3.5;
  ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
  ctx.setLineDash?.([9,7]);ctx.beginPath();ctx.arc(x,y,r+10,Math.PI/8,TAU+Math.PI/8);ctx.stroke();ctx.setLineDash?.([]);
  // Aimed pounce/crescent shows exact attack direction before the hit.
  ctx.beginPath();ctx.moveTo(x+b.aim*48,y+20);ctx.lineTo(x+b.aim*99,y+20);
  ctx.lineTo(x+b.aim*86,y+11);ctx.moveTo(x+b.aim*99,y+20);
  ctx.lineTo(x+b.aim*86,y+29);ctx.stroke();
 }
 ctx.restore();
}
export function drawMichiBossBody(ctx,e,cam,t=0,reduced=false){
 if(!e?._michiBoss)return;
 const b=e._astralCat,w=e.w,h=e.h,beat=reduced?0:Math.sin(t*.066),swim=reduced?0:Math.sin(t*.095);
 const x=e.x+w/2-cam.x,y=e.y+h-cam.y;
 const disk=(x,y,rx,ry,color)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=color;ctx.fill();};
 const stroke=(color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
 const jewel=(x,y,r,color)=>{ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.7,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.7,y);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.stroke();};
 ctx.save();ctx.translate(x,y);
 // Indicate the full combat silhouette, not the original triangle cat.
 ctx.globalAlpha=.13;disk(0,-h*.48,w*.75,h*.67,'#d5b6ff');ctx.globalAlpha=1;
 // Five large jellyfish veils, each with a different pendulum cycle.
 for(let i=0;i<7;i++){
  const lane=i-3,root=lane*13,tip=lane*17+swim*(i%2?8:-8);
  ctx.beginPath();ctx.moveTo(root,-h*.54);
  ctx.bezierCurveTo(root-17,-h*.27,tip+18,-h*.22,tip,-4+beat*2);
  stroke('#3f2b59',i===3?11:8);
  stroke(i%2?'#b7b4fa':'#87e5e8',i===3?7:5);
  disk(tip,-3+beat*2,4,5,i%2?'#fff7fa':'#b9ffff');
 }
 // Protective side wings have a recognizable curled outline.
 for(const side of [-1,1]){
  ctx.save();ctx.scale(side,1);
  ctx.beginPath();ctx.moveTo(16,-h*.65);
  ctx.bezierCurveTo(38,-h*1.06,72,-h*1.1,60,-h*.52);
  ctx.bezierCurveTo(43,-h*.3,27,-h*.3,16,-h*.65);
  ctx.closePath();ctx.fillStyle='#564071';ctx.fill();stroke('#c9afec',2.5);
  for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(23,-h*.6+j*7);ctx.lineTo(53,-h*.77+j*12);stroke('#e8dcff',1.3);}
  ctx.restore();
 }
 // Iridescent dome. Strong dark outline helps readability on the moon sky.
 ctx.beginPath();ctx.moveTo(-w*.45,-h*.42);
 ctx.bezierCurveTo(-w*.44,-h*1.08,-w*.22,-h*1.17,0,-h*1.17);
 ctx.bezierCurveTo(w*.24,-h*1.17,w*.46,-h*.93,w*.45,-h*.42);
 ctx.quadraticCurveTo(w*.28,-h*.3,w*.14,-h*.42);
 ctx.quadraticCurveTo(0,-h*.32,-w*.15,-h*.42);
 ctx.quadraticCurveTo(-w*.32,-h*.3,-w*.45,-h*.42);ctx.closePath();
 const g=ctx.createLinearGradient(0,-h*1.12,0,-h*.35);
 g.addColorStop(0,b.tier===3?'#ffd4ac':'#fff6ff');
 g.addColorStop(.28,'#d2eefe');g.addColorStop(.68,'#b6a8ee');g.addColorStop(1,'#6a467d');
 ctx.fillStyle=g;ctx.fill();stroke('#27253f',3.8);
 // Structure and windowlike glass veins.
 ctx.globalAlpha=.35;disk(0,-h*.76,w*.28,h*.26,'#e9f9ff');ctx.globalAlpha=1;
 for(let j=-2;j<=2;j++){
  ctx.beginPath();ctx.moveTo(j*8,-h*1.04);
  ctx.quadraticCurveTo(j*20,-h*.78,j*22,-h*.53);stroke('rgba(255,255,255,.75)',1.9);
 }
 // Twin fin crown and the central eclipse horn.
 for(const side of [-1,1]){
  ctx.beginPath();ctx.moveTo(side*18,-h*1.03);
  ctx.lineTo(side*37,-h*1.31);ctx.lineTo(side*35,-h*.89);
  ctx.closePath();ctx.fillStyle='#f9d6e8';ctx.fill();stroke('#47406b',2);
 }
 ctx.beginPath();ctx.moveTo(-9,-h*1.11);ctx.lineTo(0,-h*1.47);
 ctx.lineTo(9,-h*1.11);ctx.closePath();ctx.fillStyle='#ffedaf';ctx.fill();stroke('#46365f',2.4);
 // Readable face and two separate personalities per phase.
 for(const side of [-1,1]){
  disk(side*21,-h*.76,12,15,'#fdfaff');
  disk(side*21+(b.aim||1)*2,-h*.76,7,10,b.tier===3?'#e39c59':'#8054a7');
  disk(side*22+(b.aim||1)*2,-h*.76,3,8,'#32234c');
  disk(side*19,-h*.80,2,3,'#fff');
  disk(side*39,-h*.61,6,3,'#eaa6d9');
 }
 ctx.beginPath();ctx.moveTo(-9,-h*.58);ctx.quadraticCurveTo(0,-h*.51+(reduced?0:beat),9,-h*.58);stroke('#4c3e6e',2);
 jewel(0,-h*.98,12,b.exposed?'#b6fff1':'#fce1ab');
 // Countable orbiting relics, three only on tier 3. Reduced-motion fixes their positions.
 for(let j=0;j<b.tier;j++){
  const angle=j*TAU/b.tier+(reduced?0:t*.021),r=w*.55;
  jewel(Math.cos(angle)*r,-h*.77+Math.sin(angle)*16,5,j%2?'#ffdcac':'#dffaff');
 }
 if(e.invuln>0){ctx.globalAlpha=.16;disk(0,-h*.7,w*.54,h*.57,'#fff');}
 ctx.restore();
}
