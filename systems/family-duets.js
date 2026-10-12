// OHANA · V305–V310: six interactive U duets, each borrows the next hero's L.
// Visuals never damage anything. Only updateFamilyDuet mutates combat state.
// The cooperative wire format is deliberately small and contains NO hit sets.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const TAU=Math.PI*2;
const names={
 dragon:{ally:"dino",borrowedL:"quake",name:"Dragón y Dino",line:"¡Meteoritos con patas!",color:"#ffb86b",kind:"meteor"},
 dino:{ally:"frita",borrowedL:"fryer",name:"Dino y Frita",line:"¡Patatas sísmicas!",color:"#d9ee7a",kind:"geyser"},
 frita:{ally:"pizza",borrowedL:"oven",name:"Frita y Pizza",line:"¡Menú volcánico!",color:"#ffd36a",kind:"oven"},
 pizza:{ally:"yomi",borrowedL:"maw",name:"Pizza y Yomi",line:"¡Esta pizza muerde!",color:"#ff9d82",kind:"maw"},
 yomi:{ally:"cuerno",borrowedL:"rainbow",name:"Yomi y Cuerno",line:"¡Luz entre sombras!",color:"#e2b8ff",kind:"rainbow"},
 cuerno:{ally:"kilo",borrowedL:"ohana",name:"Cuerno y Kilo",line:"¡Toda la familia!",color:"#ffe9a8",kind:"ohana"}
};
export const FAMILY_DUETS=Object.freeze(Object.fromEntries(Object.entries(names).map(([id,data])=>[id,Object.freeze({hero:id,...data})])));
export const FAMILY_DUET_LENGTH=120;
export const FAMILY_DUET_BEATS=Object.freeze([42,66,90]);
const validNumber=n=>typeof n==="number"&&Number.isFinite(n)&&Math.abs(n)<=20000;
const center=e=>({x:e.x+(e.w||0)/2,y:e.y+(e.h||0)/2});

export function readFamilyDuet(s){
 if(!s||typeof s!=="object"||!Object.hasOwn(FAMILY_DUETS,s.hero)||!validNumber(s.x)||!validNumber(s.y)||
 !Number.isInteger(s.age)||s.age<0||s.age>=FAMILY_DUET_LENGTH||
 !Number.isInteger(s.evo)||s.evo<0||s.evo>4||![-1,1].includes(s.facing))return null;
 return {hero:s.hero,x:s.x,y:s.y,age:s.age,evo:s.evo,facing:s.facing};
}
export function familyDuetPose(s){
 const data=FAMILY_DUETS[s?.hero];if(!data)return null;
 const age=clamp(s.age,0,119),evo=clamp(s.evo,0,4),face=s.facing===-1?-1:1;
 const arrival=Math.min(1,age/18);
 const exit=age>=106?Math.max(0,1-(age-106)/14):1;
 const beat=age<18?"arrival":age<36?"exchange":age<102?"borrowed-L":"farewell";
 const phase=age<36?0:age<102?(age-36)/66:1;
 const allyX=s.x-face*(146-75*arrival)+face*Math.sin(age*.09)*7;
 const allyY=s.y-24-(data.kind==="meteor"?74:data.kind==="rainbow"?34:12)-Math.sin(age*.075)*8;
 return {beat,phase,allyX,allyY,alpha:exit,kind:data.kind,
   radius:56+evo*8,focusX:s.x+face*(56+phase*65),focusY:s.y-26};
}
export function startFamilyDuet(game,power=1){
 const p=game?.player,def=FAMILY_DUETS[p?.id];
 if(!p||p.dead||!def)return false;
 game._familyDuet={hero:p.id,room:String(game.roomId||"hub"),
   x:center(p).x,y:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),
   facing:p.facing===-1?-1:1,power:clamp(power,1,2)};
 game._assist={heroId:def.ally,heroName:def.ally,t:FAMILY_DUET_LENGTH};
 return true;
}
export function familyDuetStrike(s,beat,e){
 const def=FAMILY_DUETS[s.hero];
 if(!def||!e)return false;
 const p=center(e),f=s.facing,dx=p.x-s.x,dy=p.y-s.y;
 const b=clamp(beat,0,2),evo=s.evo;
 switch(def.kind){
  case "meteor":{const x=s.x+f*(52+b*54),y=s.y-26;return Math.hypot(p.x-x,p.y-y)<=65+evo*6;}
  case "geyser":{const x=s.x+f*(34+b*54);return Math.abs(p.x-x)<=31+evo*3&&p.y>s.y-163&&p.y<s.y+27;}
  case "oven":{const forward=dx*f;return forward>=-24&&forward<=210+evo*15&&Math.abs(dy+18)<54+b*19;}
  case "maw":{const x=s.x+f*(58+b*21);return Math.abs(p.x-x)<=65+evo*5&&Math.abs(dy+38)<=60;}
  case "rainbow":{const r=70+b*40+evo*8;return Math.hypot(dx,dy+24)<=r&&Math.hypot(dx,dy+24)>=Math.max(0,r-85);}
  case "ohana":return Math.hypot(dx,dy+30)<=155+evo*15;
  default:return false;
 }
}
export function updateFamilyDuet(game,hit,heal){
 const s=game?._familyDuet,p=game?.player;
 if(!s){if(p)p._familyDuetT=0;return;}
 const def=FAMILY_DUETS[s.hero];
 if(!p||p.dead||!def||p.id!==s.hero||String(game.roomId||"hub")!==s.room||s.age>=FAMILY_DUET_LENGTH){
  game._familyDuet=null;if(p)p._familyDuetT=0;
  if(game._assist?.heroId===def?.ally)game._assist.t=0;
  return;
 }
 s.x=center(p).x;s.y=p.y+p.h;
 const beat=FAMILY_DUET_BEATS.indexOf(s.age);
 if(beat>=0){
  const damage=(70+s.evo*14)*s.power*(def.kind==="ohana"?.19:def.kind==="maw"?.27:.23);
  let applied=0;
  for(const e of game.enemies||[]){
   if(!e||e.hp<=0||e.dying||e.fell||!familyDuetStrike(s,beat,e))continue;
   const knock=s.facing*(def.kind==="meteor"?6:4);
   if(typeof hit==="function"&&hit(game,e,damage,{
    color:def.color,stun:def.kind==="rainbow"?48:32,kx:knock,ky:-5,hitstop:0,shake:1
   }))applied++;
  }
  if(def.kind==="ohana"&&typeof heal==="function")heal(p,p.maxHealth*(.035+s.evo*.006));
  if(def.kind==="rainbow")p.invuln=Math.max(p.invuln||0,16);
  if(def.kind==="geyser")p._specialTitanT=Math.max(p._specialTitanT||0,30);
  if(def.kind==="maw")p._specialGhostT=Math.max(p._specialGhostT||0,24);
  if(applied>0)game.fx?.emit?.(s.x+s.facing*54,s.y-30,{color:def.color,count:Math.min(6,applied+2),size:3,up:1,speed:2,life:13});
 }
 p._familyDuetAge=s.age;p._familyDuetT=FAMILY_DUET_LENGTH-s.age;
 if(game._assist?.heroId===def.ally)game._assist.t=FAMILY_DUET_LENGTH-s.age;
 s.age++;
}

// A compact set of authored visual signatures, never a second damage source.
function ring(ctx,x,y,r,color,alpha=.8,ry=1){
 ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();
 ctx.ellipse(x,y,r,Math.max(1,r*ry),0,0,TAU);ctx.stroke();ctx.restore();
}
function spark(ctx,x,y,r,color){
 ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.4,y-r*.4);
 ctx.lineTo(x+r,y);ctx.lineTo(x+r*.4,y+r*.4);ctx.lineTo(x,y+r);
 ctx.lineTo(x-r*.4,y+r*.4);ctx.lineTo(x-r,y);ctx.lineTo(x-r*.4,y-r*.4);
 ctx.closePath();ctx.fill();
}
export function drawFamilyDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readFamilyDuet(value);if(!s)return false;
 const def=FAMILY_DUETS[s.hero],pose=familyDuetPose(s);
 const x=s.x-cam.x,y=s.y-cam.y,friend=roster.find(r=>r.id===def.ally),form=friend?.forms?.[s.evo];
 ctx.save();ctx.globalAlpha*=pose.alpha;
 if(friend&&form&&typeof drawActor==="function"){
  const arrival=Math.min(1,s.age/18);
  drawActor(ctx,{...friend,...form,id:def.ally,evo:s.evo,
   x:pose.allyX-form.w/2,y:pose.allyY-form.h,facing:s.facing,
   vx:pose.beat==="arrival"?s.facing*4:0,vy:pose.beat==="arrival"?-2:0,
   grounded:pose.beat!=="arrival"&&def.kind!=="meteor",
   visualScale:.62+arrival*.11,_duetActor:true},cam,t);
 }
 if(s.age>=18&&s.age<106){
  // Hand-off: an illuminated link connects the player's presence to their friend.
  ctx.strokeStyle=def.color;ctx.lineWidth=2;ctx.globalAlpha*=.5;
  ctx.beginPath();ctx.moveTo(x,y-42);ctx.quadraticCurveTo((x+pose.allyX-cam.x)/2,y-120,pose.allyX-cam.x,pose.allyY-cam.y-30);ctx.stroke();
  ctx.globalAlpha=pose.alpha;
 }
 if(pose.beat==="exchange"){
  ctx.fillStyle="#fff8df";ctx.font="700 13px sans-serif";ctx.textAlign="center";
  ctx.fillText(def.line,x,y-130);
 }
 // Three actual L beats at 42,66,90 with forecast then impact.
 for(let j=0;j<3;j++){
  const delta=s.age-FAMILY_DUET_BEATS[j];
  if(delta < -17||delta>18)continue;
  const windup=delta<0,progress=windup?(delta+17)/17:Math.min(1,delta/18);
  const intensity=windup?.18+progress*.23:Math.max(.08,.82*(1-progress));
  const xx=x+s.facing*(40+j*54),yy=y-26;
  ctx.save();ctx.globalAlpha*=intensity;
  switch(def.kind){
   case "meteor":{
    const sky=yy-160*(windup?1-progress:0);
    ring(ctx,xx,yy+25,45+s.evo*3,def.color,.75,.28);
    ctx.fillStyle="#ff7f4b";ctx.beginPath();ctx.arc(xx,windup?sky:yy-6,11+s.evo*2,0,TAU);ctx.fill();
    for(let k=0;k<3;k++)spark(ctx,xx+(k-1)*12,sky-16-k*6,4,"#ffe7b8");
    break;}
   case "geyser":{
    const height=windup?8:145*(1-progress*.55);
    ctx.fillStyle="#ffbd51";ctx.beginPath();ctx.moveTo(xx-25,y);
    ctx.quadraticCurveTo(xx-20,y-height,xx,y-height-18);
    ctx.quadraticCurveTo(xx+19,y-height,xx+25,y);ctx.closePath();ctx.fill();
    ring(ctx,xx,y,26,def.color,.85,.20);
    break;}
   case "oven":{
    const range=windup?48:165*(1-progress*.3);
    ctx.fillStyle="rgba(255,124,46,.72)";
    ctx.beginPath();ctx.moveTo(x,y-43);ctx.lineTo(x+s.facing*range,yy-70);
    ctx.lineTo(x+s.facing*range,yy+70);ctx.closePath();ctx.fill();
    for(let k=0;k<3;k++)ring(ctx,x+s.facing*(56+k*30),yy+(k-1)*18,12,def.color,.6,.4);
    break;}
   case "maw":{
    const bx=x+s.facing*(60+j*22),gape=windup?5:46*(1-progress*.65);
    ctx.strokeStyle="#ffe2c7";ctx.lineWidth=4;ctx.beginPath();
    ctx.ellipse(bx,yy-30,62,gape,0,0,TAU);ctx.stroke();
    for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(bx+k*18,yy-30-gape);ctx.lineTo(bx+k*18+5,yy-30-gape+11);ctx.stroke();}
    break;}
   case "rainbow":{
    const palette=["#ff9bad","#ffeaa0","#9ef3ff","#9cf6bb","#b6a5ff","#fff0bc","#ffb8e8"];
    for(let k=0;k<7;k++){
     ctx.strokeStyle=palette[k];ctx.lineWidth=2.4;ctx.beginPath();
     ctx.arc(x,y-26,65+j*39+s.evo*7-k*3,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
    }break;}
   case "ohana":{
    const r=85+j*24+(windup?progress*30:30);
    ring(ctx,x,y-30,r,def.color,.88,.75);
    const n=reduce?5:10;
    for(let k=0;k<n;k++){const a=k*TAU/n+(reduce?0:t*.012);
      spark(ctx,x+Math.cos(a)*r,y-30+Math.sin(a)*r*.75,5,k%2?"#ff9ab0":"#fff5d1");}
    break;}
  }
  ctx.restore();
 }
 if(pose.beat==="farewell"){
  for(let k=0;k<3;k++)spark(ctx,pose.allyX-cam.x+(k-1)*16,pose.allyY-cam.y-25-k*11,4+k,def.color);
 }
 ctx.restore();return true;
}
