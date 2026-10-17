import {drawChispaSprite,chispaSpriteCacheKey} from './chispa-sprite.js';
// Five distinct thunder evolutions; vector art is only a loading fallback.
// Each form fits the same art envelope; roster.js retains the physical collider.
export const CHISPA_FORMS=Object.freeze([
 {body:'#fffefa',shade:'#e9b85d',head:26,headY:-52,bodyX:20,bodyY:19,ear:14,collar:0},
 {body:'#fffefa',shade:'#e4a54d',head:25,headY:-54,bodyX:19,bodyY:23,ear:15,collar:0},
 {body:'#fffefa',shade:'#dc9746',head:24,headY:-56,bodyX:18,bodyY:25,ear:15,collar:1},
 {body:'#fffefa',shade:'#db9652',head:25,headY:-55,bodyX:22,bodyY:25,ear:16,collar:2},
 {body:'#fffefa',shade:'#e5b55b',head:25,headY:-56,bodyX:21,bodyY:26,ear:16,collar:3}
]);
const INK='#303345',CREAM='#fff6db',TAU=Math.PI*2;
const finite=(v,f=0)=>Number.isFinite(v)?v:f;
function oval(ctx,x,y,rx,ry,c,outline=true,rotation=0){
 ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,TAU);ctx.fillStyle=c;ctx.fill();
 if(outline){ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.stroke();}
}
function line(ctx,points,c=INK,width=2){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function ear(ctx,x,y,length,angle,c,charge){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 oval(ctx,0,-length*.55,8,length,c);oval(ctx,0,-length*.6,3.8,length*.63,charge?'#d8d1ed':'#b99bc8',false);
 oval(ctx,-2,-length*1.08,2,3,CREAM,false);ctx.restore();
}
function paw(ctx,x,y,a,c){ctx.save();ctx.translate(x,y);ctx.rotate(a);oval(ctx,0,6,6,10,c);ctx.restore();}
function eye(ctx,x,y,r,closed,look,hurt){
 if(closed){ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y+1,r,-Math.PI*.9,-Math.PI*.1);ctx.stroke();return;}
 if(hurt){line(ctx,[[x-r,y-r],[x+r*.4,y],[x-r,y+r]]);return;}
 oval(ctx,x,y,r,r*1.2,INK,false);oval(ctx,x+look,y+1,r*.48,r*.64,'#71506c',false);
 oval(ctx,x-r*.28,y-r*.42,r*.34,r*.4,'#fffef4',false);oval(ctx,x+r*.4,y+r*.45,r*.16,r*.16,'#fffef4',false);
}
export function chispaActing(pose={}){
 const state=pose.state||'idle',t=finite(pose.t),reduced=!!pose.reduceMotion;
 const run=state==='run',air=['jump','fall','glide'].includes(state),attack=['attack','cast'].includes(state);
 const welcome=!reduced&&state==='idle'?pose.chispinWelcome:null;
 const gag=Math.max(state==='idle'&&finite(pose.flourish)>0?Math.sin(Math.PI*pose.flourish):0,finite(welcome?.prank),finite(welcome?.hiccup)*.7);
 return {state,run,air,attack,reduced,t:reduced?40:t,
  step:reduced?0:run?Math.sin(finite(pose.phase,t*.2)):0,
  ears:reduced?0:Math.sin(t*.085)*.08+(gag?Math.sin(t*.2)*gag*.17:0)+finite(welcome?.ear)*.2,
  tail:reduced?0:Math.sin(t*.075)*5+finite(welcome?.coil)*5,gag:reduced?0:gag,
  smile:state==='victory'||gag>.5,blink:!!pose.blink,hurt:state==='hurt'||state==='dead',
  charge:state==='cast'&&pose.castSlot===2||finite(welcome?.charge)>.2};
}
function feral(ctx,pose,a){
 const c='#fffefa',dark='#cc9148',step=a.step;
 // A low, spring-loaded quadruped: the body, gait and face all change.
 ctx.strokeStyle=INK;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-23,-27);ctx.bezierCurveTo(-66,-18,-60,-58,-37,-46);ctx.stroke();
 ctx.strokeStyle='#91bdb5';ctx.lineWidth=3;ctx.stroke();oval(ctx,-38,-47,8,12,'#b6ddd1',true,-.7);
 for(const [x,back] of [[-23,true],[20,true],[-13,false],[29,false]]){
  const y=-4-Math.max(0,step*(back?-1:1))*8;
  line(ctx,[[x,-22],[x+(back?-step:step)*6,y]],back?dark:c,9);oval(ctx,x+(back?-step:step)*6,y,9,5,back?dark:c);
 }
 oval(ctx,-2,-30,31,19,c);oval(ctx,4,-27,23,10,CREAM,false);
 // Dark shoulder lightning is a fur marking, never floating ornament.
 line(ctx,[[-20,-40],[-12,-35],[-17,-30],[-8,-26]],'#89738b',3);
 ctx.save();ctx.translate(24,-52);ctx.rotate(a.hurt?-.15:a.ears*.5);
 ear(ctx,-14,-13,20,-.65-a.ears,c,false);ear(ctx,11,-17,17,.25+a.ears,c,false);
 oval(ctx,0,0,22,18,c);oval(ctx,12,7,14,9,CREAM);
 eye(ctx,-6,-2,4.6,a.smile||a.blink,1,a.hurt);eye(ctx,10,-4,4.4,a.smile||a.blink,1,a.hurt);
 oval(ctx,22,4,3,2.5,INK,false);line(ctx,[[18,9],[12,12],[8,10]],INK,1.8);
 ctx.fillStyle=c;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-18,1);ctx.lineTo(-28,6);ctx.lineTo(-23,-5);ctx.lineTo(-27,-10);ctx.lineTo(-16,-12);ctx.fill();ctx.stroke();ctx.restore();
}
function cumulus(ctx,pose,a){
 const c='#a6b9cc',dark='#778da7',t=a.t;
 // Broad thunder cub, tiny ears and enormous soft hands. Weight replaces speed.
 ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-18,-20);ctx.bezierCurveTo(-44,-10,-48,-33,-32,-37);ctx.stroke();
 oval(ctx,-35,-39,10,10,'#f1dfb7');
 oval(ctx,-13,-3-a.step*2,13,6,dark);oval(ctx,15,-3+a.step*2,13,6,c);
 oval(ctx,0,-29,27,28,c);oval(ctx,2,-25,18,22,CREAM,false);
 for(let i=0;i<7;i++){const ang=Math.PI+i*Math.PI/6;oval(ctx,Math.cos(ang)*26,-53+Math.sin(ang)*26,12,13,'#dbe4e6');}
 oval(ctx,-17,-73,8,9,c);oval(ctx,17,-74,8,9,c);
 oval(ctx,0,-58,24,22,c);oval(ctx,2,-49,17,12,CREAM,false);
 eye(ctx,-9,-61,5,a.smile||a.blink,0,a.hurt);eye(ctx,11,-61,5,a.smile||a.blink,0,a.hurt);oval(ctx,2,-50,3,2,INK,false);
 line(ctx,[[-5,-43],[2,-40],[10,-44]],INK,2);
 const raised=a.attack||a.smile;
 oval(ctx,-26,-25-(raised?16:0),12,17,dark,true,raised?.5:.2);
 oval(ctx,27,-26-(raised?18:0),13,18,c,true,raised?-.55:-.2);
 for(const x of [-26,27]){oval(ctx,x,-18-(raised?17:0),6,7,'#c9dcd1',false);}
 // A storm seed on its forehead opens only when charging.
 oval(ctx,1,-71,4,a.charge?6:4,'#e6d699');
}
function tempest(ctx,pose,a){
 const c='#657f97',light='#c6ddd8',gold='#efce8a',step=a.step;
 // A long-legged guardian with a comet fan and a forward-swept cloud mane.
 ctx.strokeStyle=INK;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-22,-27);ctx.bezierCurveTo(-59,-19,-53,-57,-33,-61);ctx.stroke();
 ctx.strokeStyle=gold;ctx.lineWidth=3;ctx.stroke();
 for(let i=0;i<3;i++){ctx.save();ctx.translate(-40-i*5,-57+i*8);ctx.rotate(-.5-i*.25+a.ears);oval(ctx,0,0,6,17-i*2,i===1?gold:light);ctx.restore();}
 for(const [x,back] of [[-20,true],[18,true],[-10,false],[29,false]]){
  const y=-4-Math.max(0,step*(back?-1:1))*7;
  line(ctx,[[x,-28],[x+(back?-step:step)*5,y]],c,8);oval(ctx,x+(back?-step:step)*5,y,8,5,gold);
 }
 oval(ctx,-1,-32,29,18,c);oval(ctx,10,-39,15,25,c,true,.4);
 for(let i=0;i<5;i++){
  const x=10-i*9,y=-50-i*5;ctx.fillStyle=i%2?light:CREAM;ctx.strokeStyle=INK;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x+13,y-12);ctx.quadraticCurveTo(x-15,y-17,x-22,y+7);ctx.quadraticCurveTo(x-6,y+3,x+2,y+15);ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.save();ctx.translate(23,-65);ctx.rotate(a.hurt?-.1:0);
 ear(ctx,-13,-13,16,-.75-a.ears,light,a.charge);ear(ctx,10,-15,16,.4+a.ears,light,a.charge);
 oval(ctx,0,0,22,18,CREAM);oval(ctx,12,6,13,8,CREAM,false);
 eye(ctx,-7,-1,4.8,a.smile||a.blink,.6,a.hurt);eye(ctx,10,-3,4.4,a.smile||a.blink,.6,a.hurt);
 oval(ctx,22,4,2.7,2.2,INK,false);line(ctx,[[17,9],[12,12],[7,9]],INK,1.8);
 oval(ctx,0,-13,4,5,gold);ctx.restore();
}
function draw(ctx,pose){
 if(drawChispaSprite(ctx,pose))return;
 const f=Math.max(0,Math.min(4,pose.form|0)),s=CHISPA_FORMS[f],a=chispaActing(pose),t=a.t;
 ctx.save();
 try{
  ctx.lineCap='round';ctx.lineJoin='round';
  if(a.state==='dead'){ctx.translate(-7,-8);ctx.rotate(-1.1);}
  if(f===2){feral(ctx,pose,a);return;}
  if(f===3){cumulus(ctx,pose,a);return;}
  if(f===4){tempest(ctx,pose,a);return;}
  const ty=-26+a.tail,tx=-35-(a.run?5:0);
  ctx.strokeStyle=INK;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-12,-22);ctx.bezierCurveTo(-39,-9,tx-6,ty+14,tx,ty);ctx.stroke();
  ctx.strokeStyle=s.shade;ctx.lineWidth=3;ctx.stroke();
  ctx.save();ctx.translate(tx,ty-5);ctx.rotate(-.35+a.ears);
  oval(ctx,0,0,8+f*.6,11+f*.4,a.charge?'#fff9dd':'#b5ddcb');oval(ctx,-2,-3,2.5,4,'#efffee',false);ctx.restore();
  if(f>=2)for(let i=0;i<f-1;i++){
   const k=(t*.012+i*.4)%1,x=tx-6-k*12,y=ty-12-k*10;
   ctx.save();ctx.globalAlpha*=.25*(1-k);oval(ctx,x,y,2,3,'#f9f0bc',false);ctx.restore();
  }
  const bcy=-25;
  oval(ctx,-10-a.step*3,-3-Math.max(0,a.step)*4,8,5,s.shade);
  paw(ctx,-s.bodyX+1,bcy-5,a.attack?-.7:-a.step*.45,s.shade);
  oval(ctx,0,bcy,s.bodyX,s.bodyY,s.body);
  oval(ctx,3,bcy+3,s.bodyX*.62,s.bodyY*.7,CREAM,false);
  oval(ctx,11+a.step*3,-3-Math.max(0,-a.step)*4,9,5,s.body);
  if(s.collar){
   for(let i=0;i<5;i++)oval(ctx,-16+i*8,-38-(i%2)*2,7,s.collar===3?7:4,s.collar===1?'#a3c7b9':CREAM,i===0||i===4);
   if(s.collar>=2){ctx.fillStyle=CREAM;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-14,-38);ctx.quadraticCurveTo(-31,-37,-27,-17-a.ears*15);ctx.lineTo(-18,-22);ctx.lineTo(-15,-18);ctx.closePath();ctx.fill();ctx.stroke();}
  }
  ctx.save();ctx.translate(2,s.headY+(a.run?Math.abs(a.step)*1.2:0));
  ctx.rotate(a.hurt?-.13:a.gag?Math.sin(t*.08)*a.gag*.1:0);
  ear(ctx,-16,-15,s.ear,-.5-a.ears-(a.hurt?.3:0),s.body,a.charge);
  ear(ctx,15,-17,s.ear*.86,.42+a.ears+(a.run?.15:0),s.body,a.charge);
  oval(ctx,0,0,s.head,s.head*.83,s.body);
  ctx.fillStyle=s.body;ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-9,-19);ctx.quadraticCurveTo(-13,-29,-1,-25);ctx.quadraticCurveTo(7,-33,10,-22);ctx.quadraticCurveTo(19,-25,16,-17);ctx.fill();ctx.stroke();
  oval(ctx,2,7,16,10,CREAM,false);
  const er=f===0?5.6:5.1,closed=!!pose.blink||a.smile,look=finite(pose.look?.x)*1.2;
  eye(ctx,-8,-1,er,closed,look,a.hurt);eye(ctx,11,-2,er*.96,closed,look,a.hurt);
  oval(ctx,2,7,2.6,1.9,INK,false);
  if(a.charge){oval(ctx,3,13,3,4,INK,false);}
  else {ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(2,9);ctx.quadraticCurveTo(-2,16,-6,11);ctx.moveTo(2,9);ctx.quadraticCurveTo(7,16,11,10);ctx.stroke();}
  line(ctx,[[-20,5],[-17,3]],'#c38d62',1.7);line(ctx,[[19,2],[22,4]],'#c38d62',1.7);
  if(f===4)oval(ctx,1,-15,3,4,'#b7dccc');
  ctx.restore();
  const front=a.charge?-2.65:a.attack?-1.65:a.smile?-2.3:-a.step*.5;
  paw(ctx,s.bodyX-2,bcy-7,front,s.body);
  if(a.gag>.25){const x=23+a.gag*4,y=-68-a.gag*8;line(ctx,[[x-3,y],[x,y-4],[x+2,y],[x,y+4],[x-3,y]],'#c2d8bc',1.5);}
 }finally{ctx.restore();}
}
export default {id:'chispin',draw,cacheKey:chispaSpriteCacheKey};
