// OHANA · V305–V311: six real U duets with the next hero's L.
// Dragón calls Dino's fossil quake, retaining his original free-flight supreme.
// Visuals never damage anything. Only updateFamilyDuet mutates combat state.
// The cooperative wire format is deliberately small and contains NO hit sets.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const TAU=Math.PI*2;
const names={
 dragon:{ally:"dino",borrowedL:"quake",name:"Dragón y Dino",line:"¡El cielo tiembla!",cue:"DINO · TERREMOTO",color:"#ffac63",kind:"quake"},
 dino:{ally:"frita",borrowedL:"fryer",name:"Dino y Frita",line:"¡Patatas sísmicas!",cue:"FRITA · FREIDORA",color:"#d9ee7a",kind:"geyser"},
 frita:{ally:"pizza",borrowedL:"oven",name:"Frita y Pizza",line:"¡Menú volcánico!",cue:"PIZZA · HORNO",color:"#ffd36a",kind:"oven"},
 pizza:{ally:"yomi",borrowedL:"maw",name:"Pizza y Yomi",line:"¡Esta pizza muerde!",cue:"YOMI · FAUCES",color:"#ff9d82",kind:"maw"},
 yomi:{ally:"cuerno",borrowedL:"rainbow",name:"Yomi y Cuerno",line:"¡Luz entre sombras!",cue:"CUERNO · ARCOÍRIS",color:"#e2b8ff",kind:"rainbow"},
 cuerno:{ally:"kilo",borrowedL:"ohana",name:"Cuerno y Kilo",line:"¡Toda la familia!",cue:"KILO · CORO OHANA",color:"#ffe9a8",kind:"ohana"}
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
export function familyDuetPose(s,reduce=false){
 const data=FAMILY_DUETS[s?.hero];if(!data)return null;
 const age=clamp(s.age,0,119),evo=clamp(s.evo,0,4),face=s.facing===-1?-1:1;
 const arrival=Math.min(1,age/18);
 const exit=age>=106?Math.max(0,1-(age-106)/14):1;
 const beat=age<18?"arrival":age<36?"exchange":age<102?"borrowed-L":"farewell";
 const phase=age<36?0:age<102?(age-36)/66:1;
 const allyX=s.x-face*(146-75*arrival)+(reduce?0:face*Math.sin(age*.09)*7);
 const allyY=s.y-24-(data.kind==="quake"?48:data.kind==="rainbow"?34:12)-(reduce?0:Math.sin(age*.075)*8);
 return {beat,phase,allyX,allyY,alpha:exit,kind:data.kind,
   radius:56+evo*8,focusX:s.x+face*(56+phase*65),focusY:s.y-26};
}
export function startFamilyDuet(game,power=1,legacyTargets=[]){
 const p=game?.player,def=FAMILY_DUETS[p?.id];
 if(!p||p.dead||!def)return false;
 game._familyDuet={hero:p.id,room:String(game.roomId||"hub"),
   x:center(p).x,y:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),
   facing:p.facing===-1?-1:1,power:clamp(power,1,2),
   // Entities already handled by the legacy U cannot be damaged twice by L.
   legacyTargets:new Set(Array.isArray(legacyTargets)?legacyTargets.slice(0,256):[])};
 game._assist={heroId:def.ally,heroName:def.ally,t:p.id==="yomi"?240:FAMILY_DUET_LENGTH};
 return true;
}
export function familyDuetStrike(s,beat,e){
 const def=FAMILY_DUETS[s.hero];
 if(!def||!e)return false;
 const p=center(e),f=s.facing,dx=p.x-s.x,dy=p.y-s.y;
 const b=clamp(beat,0,2),evo=s.evo;
 switch(def.kind){
  case "quake":{const epicenter=s.x+f*(52+b*54);return Math.abs(p.x-epicenter)<=66+evo*7&&Math.abs(p.y-(s.y-24))<=65+evo*3;}
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
  for(const e of def.kind==='ohana'?[]:(game.enemies||[])){
   if(!e||e.hp<=0||e.dying||e.fell||s.legacyTargets?.has(e)||!familyDuetStrike(s,beat,e))continue;
   const knock=s.facing*(def.kind==="quake"?7:4);
   if(typeof hit==="function"&&hit(game,e,damage,{
    color:def.color,stun:def.kind==="rainbow"?48:32,kx:knock,ky:-5,hitstop:0,shake:1
   }))applied++;
  }
  if(def.kind==="ohana"&&typeof heal==="function")heal(p,(Number(p.maxHealth)||100)*(.035+s.evo*.006));
  if(def.kind==="quake")p._specialFlightT=Math.max(p._specialFlightT||0,180);
  if(def.kind==="rainbow")p.invuln=Math.max(p.invuln||0,16);
  if(def.kind==="geyser")p._specialTitanT=Math.max(p._specialTitanT||0,30);
  if(def.kind==="maw")p._specialGhostT=Math.max(p._specialGhostT||0,24);
  if(applied>0)game.fx?.emit?.(s.x+s.facing*54,s.y-30,{color:def.color,count:Math.min(6,applied+2),size:3,up:1,speed:2,life:13});
 }
 p._familyDuetAge=s.age;p._familyDuetT=FAMILY_DUET_LENGTH-s.age;
 if(game._assist?.heroId===def.ally)game._assist.t=(s.hero==="yomi"?240:FAMILY_DUET_LENGTH)-s.age;
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
// V311: every friend has a distinct movement signature. These cues are
// decorative only, scale with the five evolutions and never mutate a hitbox.
export function familyDuetChoreography(value,reduce=false){
 const s=readFamilyDuet(value);if(!s)return null;
 const pose=familyDuetPose(s,reduce);
 // Telegraph windows overlap for two frames. The nearest keyframe owns
 // the on-screen cue so an earlier impact never masks the coming L beat.
 const nearest=FAMILY_DUET_BEATS.reduce((best,b,i)=>{
  const distance=Math.abs(s.age-b);
  return s.age>=b-17&&s.age<=b+18&&distance<best.distance
   ?{index:i,distance}:best;
 },{index:-1,distance:Infinity});
 const beat=nearest.index;
 const delta=beat<0?null:s.age-FAMILY_DUET_BEATS[beat];
 return Object.freeze({
  hero:s.hero,ally:FAMILY_DUETS[s.hero].ally,borrowedL:FAMILY_DUETS[s.hero].borrowedL,
  stage:pose.beat,form:s.evo,allyX:pose.allyX,allyY:pose.allyY,opacity:pose.alpha,
  keyframe:beat,telegraph:delta!==null&&delta<0,
  impact:delta===0,progress:delta===null?0:delta<0?(delta+17)/17:Math.min(1,delta/18),
  accentCount:reduce?2:2+s.evo
 });
}
function drawFamilyDuetSignature(ctx,s,pose,cam,t,reduce){
 const def=FAMILY_DUETS[s.hero],evo=s.evo,x=s.x-cam.x,y=s.y-cam.y;
 const ax=pose.allyX-cam.x,ay=pose.allyY-cam.y;
 const energy=Math.min(1,s.age/12)*pose.alpha;
 ctx.save();ctx.globalAlpha*=energy;
 const count=reduce?2:2+evo;
 switch(def.kind){
  case "quake":{ // Dino arrives with fossil dust and Dragón's warm embers
   ctx.strokeStyle="#e5b487";ctx.lineWidth=2+evo*.35;
   ctx.beginPath();ctx.moveTo(ax-s.facing*14,ay+13);
   for(let i=0;i<count+2;i++){
    const xx=ax-s.facing*(16+i*11),yy=ay+12+(i%2?5:-3);
    ctx.lineTo(xx,yy);spark(ctx,xx,yy-6,2.2+i*.35,i%2?"#ffdca0":"#ec7541");
   }
   ctx.stroke();
   if(s.age>=22&&s.age<=105){
    for(let i=0;i<Math.min(6,count+1);i++){
     const offset=30+i*17,fireY=y-32-i*6-(reduce?0:Math.sin(t*.08+i)*3);
     spark(ctx,x+s.facing*offset,fireY,3.2+i*.25,i%2?"#ff974a":"#fff2b6");
    }
   }
   break;
  }
  case "geyser": // Frita lands running, a little spray of crispy salt
   for(let i=0;i<count;i++){
    const d=14+i*9,yy=reduce?0:Math.sin(s.age*.18+i)*4;
    spark(ctx,ax-s.facing*d,ay+8-i*4+yy,2.2+i*.3,i%2?"#fff5cb":"#ffb44a");
   }break;
  case "oven": // Pizza follows a trail of melting cheese with bright pepperoni
   ctx.strokeStyle="#ffdd8e";ctx.lineWidth=2.6;ctx.beginPath();
   ctx.moveTo(ax-s.facing*35,ay+13);
   ctx.quadraticCurveTo(ax-s.facing*53,ay-18,ax-s.facing*71,ay+7);
   ctx.stroke();
   for(let i=0;i<count;i++){ctx.fillStyle=i%2?"#df6950":"#ffdf8c";ctx.beginPath();
    ctx.arc(ax-s.facing*(20+i*12),ay-5+(reduce?0:Math.cos(s.age*.13+i)*3),3.6,0,TAU);ctx.fill();}
   break;
  case "maw": // Yomi arrives through folds of shadow, with floating ofuda
   for(let i=0;i<count;i++){
    ctx.save();ctx.translate(ax-s.facing*(15+i*12),ay-7-i*6);
    ctx.rotate((reduce?0:Math.sin(s.age*.07+i)*.12)*s.facing);
    ctx.fillStyle="#f5dbc3";ctx.fillRect(-3.8,-9,7.6,15);
    ctx.strokeStyle="#be6570";ctx.lineWidth=1.2;ctx.beginPath();
    ctx.moveTo(-2,-5);ctx.lineTo(2,-2);ctx.lineTo(-2,1);ctx.stroke();ctx.restore();
   }break;
  case "rainbow": // Cuerno sweeps seven gentle ribbon strokes, never flashing
   for(let i=0;i<7;i++){
    const hues=["#ffaabb","#ffe8a2","#beffa7","#9ce8fa","#c3b6ff","#f6b9ee","#fff6bd"];
    ctx.strokeStyle=hues[i];ctx.lineWidth=2;ctx.beginPath();
    const off=10+i*4;
    ctx.moveTo(ax-s.facing*off,ay+i*2-20);
    ctx.quadraticCurveTo(ax-s.facing*(35+i*3),ay-50,ax-s.facing*(65+i*2),ay-20+i*4);
    ctx.stroke();
   }break;
  case "ohana": // Kilo appears with a small musical constellation
   for(let i=0;i<count;i++){
    const phase=i*TAU/count+(reduce?0:t*.025);
    const rx=25+evo*4,ry=18+evo*2;
    const xx=ax+Math.cos(phase)*rx,yy=ay-15+Math.sin(phase)*ry;
    spark(ctx,xx,yy,2.5+i*.5,i%2?"#ff9bbf":"#fff9d2");
    if(i<2){ctx.lineWidth=1.7;ctx.strokeStyle="#fff0aa";ctx.beginPath();
      ctx.moveTo(xx+2,yy);ctx.lineTo(xx+2,yy-11);ctx.lineTo(xx+9,yy-13);ctx.stroke();}
   }break;
 }
 // All five heroes participate in a clearly bounded L handoff.
 if(s.age>=28&&s.age<105){
   const p=(s.age-28)/77;
   const targetX=x+s.facing*(36+p*56);
   ctx.globalAlpha*=reduce?.4:.75;
   ring(ctx,targetX,y-25,13+evo*3,def.color,.8,.6);
 }
 ctx.restore();
}
export function drawFamilyDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readFamilyDuet(value);if(!s)return false;
 const def=FAMILY_DUETS[s.hero],pose=familyDuetPose(s,reduce);
 const x=s.x-cam.x,y=s.y-cam.y,friend=roster.find(r=>r.id===def.ally),form=friend?.forms?.[s.evo];
 ctx.save();const baseAlpha=ctx.globalAlpha;ctx.globalAlpha*=pose.alpha;
 if(friend&&form&&typeof drawActor==="function"){
  const arrival=Math.min(1,s.age/18);
  drawActor(ctx,{...friend,...form,id:def.ally,evo:s.evo,
   x:pose.allyX-form.w/2,y:pose.allyY-form.h,
   // The friend runs toward the hero, turns to lend L, then waves goodbye.
   facing:pose.beat==="arrival"?-s.facing:s.facing,
   vx:pose.beat==="arrival"?s.facing*4:pose.beat==="farewell"?-s.facing*1.7:0,
   vy:pose.beat==="arrival"?-2:pose.beat==="borrowed-L"&&s.age%24<8?-1:0,
   grounded:pose.beat!=="arrival",
   _poseOverride:pose.beat==="arrival"?"run":pose.beat==="borrowed-L"?"attack":pose.beat==="farewell"?"victory":"idle",
   melee:pose.beat==="borrowed-L"?6:0,
   visualScale:.62+arrival*.11+s.evo*.018,_duetActor:true},cam,t);
 }
 if(s.age>=18&&s.age<106){
  // Hand-off: an illuminated link connects the player's presence to their friend.
  ctx.strokeStyle=def.color;ctx.lineWidth=2;ctx.globalAlpha*=.5;
  ctx.beginPath();ctx.moveTo(x,y-42);ctx.quadraticCurveTo((x+pose.allyX-cam.x)/2,y-120,pose.allyX-cam.x,pose.allyY-cam.y-30);ctx.stroke();
  ctx.globalAlpha=baseAlpha*pose.alpha;
 }
 if(pose.beat==="exchange"){
  const p=(s.age-18)/18;
  ctx.fillStyle=def.color;ctx.font="800 14px sans-serif";ctx.textAlign="center";
  ctx.fillText(def.cue,x,y-145-(reduce?0:Math.sin(p*Math.PI)*5));
  ctx.fillStyle="#fff8df";ctx.font="700 12px sans-serif";
  ctx.fillText(def.line,x,y-126);
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
   case "quake":{
    // Dino lends his L earthquake, not another Dragon meteor.
    const radius=windup?(18+progress*52):(69+s.evo*6)*(1+progress*.35);
    const floor=yy+24;
    ring(ctx,xx,floor,radius,windup?"#ffe7b5":"#ffba77",.82,.24);
    ctx.strokeStyle=windup?"#ffd8a9":"#f8b66d";ctx.lineWidth=2.5+s.evo*.35;
    ctx.beginPath();
    ctx.moveTo(xx-radius,floor+4);ctx.lineTo(xx-radius*.58,floor-9);
    ctx.lineTo(xx-radius*.2,floor+5);ctx.lineTo(xx+radius*.17,floor-17);
    ctx.lineTo(xx+radius*.5,floor+2);ctx.lineTo(xx+radius,floor-8);ctx.stroke();
    const shards=reduce?3:5+s.evo;
    for(let k=0;k<shards;k++){
     const a=k*TAU/shards,r=radius*.78;
     spark(ctx,xx+Math.cos(a)*r,floor+Math.sin(a)*r*.21-
      (windup?0:Math.sin(progress*Math.PI)*(8+k%3*3)),2.7+k%3,"#fff1c2");
    }
    break;
   }
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
 drawFamilyDuetSignature(ctx,s,pose,cam,t,reduce);
 ctx.restore();return true;
}
