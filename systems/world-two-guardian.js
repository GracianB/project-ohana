// Mundo personal 2 (Archipiélago de Stitcho): boss secreto blanco/dorado.
// NO es Chispín. El héroe jugable conserva el rig de pikachu.js, incluida
// su cuarta forma «Trueno Gordo». Este guardián usa el antiguo arte chispa.js.
import whiteGoldThunderArt from '../characters/art/chispin-boss.js';

export const WORLD_TWO_GUARDIAN_ID='hub-world2-white-gold-v1';
export const WORLD_TWO_GUARDIAN=Object.freeze({
 name:'KIRIN · GUARDIÁN DEL RELÁMPAGO',hp:320,
 left:1800,right:2180,floor:1134
});
export const WORLD_TWO_ATTACKS=Object.freeze(['arco','descarga','embestida']);

export function createWorldTwoGuardian(makeFoe,rng=()=>.5){
 const e=makeFoe(1930,1010,'cangrejo','hub',996,{rng});
 e.x=1930;e.y=WORLD_TWO_GUARDIAN.floor-116;e.w=104;e.h=116;
 e.hp=e.max=WORLD_TWO_GUARDIAN.hp;e.roomId='hub';
 e.spawnIndex=996;e._campaignOriginal=true;
 e.miniBoss=true;e._worldTwoGuardian=true;e._encounterSaveId=WORLD_TWO_GUARDIAN_ID;
 e.color='#f8df9e';e.contactDmg=0;
 e._worldTwo={phase:'intro',clock:85,tier:1,attack:0,aim:1,emitted:false,markedX:1930};
 return e;
}
export function updateWorldTwoGuardian(e,g,hurt){
 if(!e?._worldTwoGuardian)return false;
 const s=e._worldTwo,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(WORLD_TWO_GUARDIAN.left,Math.min(WORLD_TWO_GUARDIAN.right-e.w,e.x));
 e.y=WORLD_TWO_GUARDIAN.floor-e.h;e.vx=0;e.vy=0;e.grounded=true;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;
 s.tier=e.hp<=e.max*.48?2:1;
 const dx=p.x+p.w/2-e.x-e.w/2,near=Math.abs(dx)<550;
 const bolt=(x,y,vx,vy)=>{
  if(!Array.isArray(g.projectiles)||g.projectiles.length>=115)return;
  g.projectiles.push({x,y,w:18,h:18,vx,vy,life:105,owner:'enemy',
   dmg:s.tier===2?16:10,shape:'orb',color:'#fff2b2'});
 };
 if(e.sleep>0){e.sleep--;return true;}
 if(s.phase==='intro'){
  if(near&&--s.clock<=0){s.phase='rest';s.clock=55;}
 }else if(s.phase==='rest'){
  if(near&&--s.clock<=0){
   s.phase='warn';s.clock=s.tier===2?35:52;s.emitted=false;
   s.aim=Math.sign(dx)||1;
   s.markedX=Math.max(WORLD_TWO_GUARDIAN.left,Math.min(WORLD_TWO_GUARDIAN.right,p.x+p.w/2));
  }
 }else if(s.phase==='warn'){
  e.telegraph=true;e.wind=s.clock;
  if((e.stun||0)>23){s.phase='rest';s.clock=88;}
  else if(--s.clock<=0){s.phase='attack';s.clock=s.attack===2?29:21;}
 }else if(s.phase==='attack'){
  if(!s.emitted){
   if(s.attack===0){
    bolt(e.x+e.w/2,e.y+35,s.aim*6,-1);
    if(s.tier===2)bolt(e.x+e.w/2,e.y+35,-s.aim*5,0);
   }else if(s.attack===1){
    for(const offset of [-40,0,40])bolt(s.markedX+offset,e.y-215,0,7);
   }
   s.emitted=true;
  }
  if(s.attack===2){
   e.x=Math.max(WORLD_TWO_GUARDIAN.left,Math.min(WORLD_TWO_GUARDIAN.right-e.w,e.x+s.aim*(s.tier===2?9:6)));
   const contact=Math.abs(p.x+p.w/2-e.x-e.w/2)<(p.w+e.w)*.5&&
     Math.abs(p.y+p.h/2-e.y-e.h/2)<(p.h+e.h)*.5;
   if(contact&&!(p.invuln>0))hurt?.(14,'EMBESTIDA DEL KIRIN');
  }
  if(--s.clock<=0){s.phase='rest';s.clock=s.tier===2?45:70;s.attack=(s.attack+1)%WORLD_TWO_ATTACKS.length;}
 }
 return true;
}
export function drawWorldTwoGuardian(ctx,e,cam,t=0,reduced=false){
 if(!e?._worldTwoGuardian||e.hp<=0)return false;
 const s=e._worldTwo,cx=e.x+e.w/2-cam.x,feet=e.y+e.h-cam.y;
 ctx.save();
 try{
  // The legacy white/gold kirin and serpentine boss forms must never enter
  // the player ART registry or the Chispín evolution cinematic.
  ctx.translate(cx,feet);
  const scale=s.tier===2?1.15:1.06;
  ctx.scale(scale,scale);
  whiteGoldThunderArt.draw(ctx,{
   form:s.tier===2?4:2,state:s.phase==='attack'?'attack':s.phase==='warn'?'cast':'idle',
   t:reduced?40:t,phase:0,castSlot:2,
   look:{x:s.aim*.5,y:0},reduceMotion:!!reduced
  });
 }finally{ctx.restore();}
 return true;
}
export function drawWorldTwoGuardianSignals(ctx,e,cam){
 if(!e?._worldTwoGuardian||e.hp<=0)return;
 const s=e._worldTwo,x=e.x+e.w*.5-cam.x,y=e.y-cam.y,floor=WORLD_TWO_GUARDIAN.floor-cam.y;
 ctx.save();
 ctx.fillStyle='rgba(11,27,48,.85)';ctx.fillRect(x-126,y-98,252,61);
 ctx.fillStyle='#fff2c2';ctx.textAlign='center';ctx.font='bold 11px sans-serif';
 ctx.fillText('KIRIN · GUARDIÁN DEL RELÁMPAGO',x,y-77);
 ctx.fillStyle='#32445f';ctx.fillRect(x-110,y-65,220,9);
 ctx.fillStyle='#f8d57e';ctx.fillRect(x-110,y-65,220*Math.max(0,e.hp/e.max),9);
 if(s.phase==='warn'){
  ctx.strokeStyle='#ffe5a0';ctx.setLineDash([8,7]);ctx.lineWidth=4;ctx.beginPath();
  if(s.attack===1){const px=s.markedX-cam.x;ctx.moveTo(px,floor-300);ctx.lineTo(px,floor);}
  else {ctx.moveTo(x-190,floor-45);ctx.lineTo(x+190,floor-45);}
  ctx.stroke();ctx.setLineDash([]);
 }
 ctx.restore();
}
