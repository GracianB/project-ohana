// OHANA V315 · Each of ten allies arrives, lends L and departs differently.
// Shared authoritative footprints ensure warning artwork and hit testing
// describe exactly the same area, without changing the old attack geometry.
const TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,Number.isFinite(x)?x:0));
const finite=x=>typeof x==="number"&&Number.isFinite(x)&&Math.abs(x)<=20000;
export const GUEST_ACTING=Object.freeze({
 kilo:Object.freeze({style:"petal-drift",gesture:"hop",height:22,travel:1.0}),
 stitcho:Object.freeze({style:"portal-dash",gesture:"dash",height:10,travel:1.20}),
 chispin:Object.freeze({style:"spark-hop",gesture:"spring",height:25,travel:1.18}),
 cat:Object.freeze({style:"cat-pounce",gesture:"pounce",height:15,travel:1.15}),
 dragon:Object.freeze({style:"wing-swoop",gesture:"soar",height:63,travel:1.12}),
 dino:Object.freeze({style:"fossil-charge",gesture:"stomp",height:1,travel:.89}),
 frita:Object.freeze({style:"crispy-slide",gesture:"slide",height:4,travel:1.24}),
 pizza:Object.freeze({style:"elastic-bounce",gesture:"bounce",height:20,travel:.97}),
 yomi:Object.freeze({style:"shadow-portal",gesture:"hover",height:48,travel:.94}),
 cuerno:Object.freeze({style:"prismatic-glide",gesture:"float",height:44,travel:1.05})
});
const L_BEATS=Object.freeze([42,66,90]);
// All values are world coordinates. Pure descriptors (no DOM, CSS or health).
export function borrowedLFootprint(kind,s,beat=0){
 if(!s||!finite(s.x)||!finite(s.y)||![-1,1].includes(s.facing)||
  !Number.isInteger(s.evo)||s.evo<0||s.evo>4||
  !Number.isInteger(beat)||beat<0||beat>2)return null;
 const f=s.facing,e=s.evo,b=beat;
 const circle=(x,y,r)=>Object.freeze({shape:"circle",x,y,r});
 const rect=(x,y,rx,ry,strictY=false)=>Object.freeze({shape:"rect",x,y,rx,ry,strictY});
 switch(kind){
  case "chaos":return circle(s.x,s.y-26,140+e*12);
  case "storm":return rect(s.x+f*(45+b*43),s.y-45,52+e*6,120);
  case "tails":return circle(s.x,s.y-25,105+e*13);
  case "meteor":return circle(s.x+f*(55+b*46),s.y-22,60+e*5);
  case "quake":return rect(s.x+f*(52+b*54),s.y-24,66+e*7,65+e*3);
  case "geyser":return rect(s.x+f*(34+b*54),s.y-68,31+e*3,95,true);
  case "oven":{
   const reach=210+e*15,left=-24;
   return rect(s.x+f*((left+reach)/2),s.y-18,(reach-left)/2,54+b*19,true);
  }
  case "maw":return rect(s.x+f*(58+b*21),s.y-38,65+e*5,60);
  case "rainbow":{
   const r=70+b*40+e*8;
   return Object.freeze({shape:"annulus",x:s.x,y:s.y-24,r,inner:Math.max(0,r-85)});
  }
  case "ohana":return circle(s.x,s.y-30,155+e*15);
  default:return null;
 }
}
export function borrowedLContains(area,entity){
 if(!area||!entity||!finite(entity.x)||!finite(entity.y))return false;
 const x=entity.x+(Number(entity.w)||0)/2,y=entity.y+(Number(entity.h)||0)/2;
 if(!finite(x)||!finite(y))return false;
 const dx=x-area.x,dy=y-area.y;
 switch(area.shape){
  case "circle":return Math.hypot(dx,dy)<=area.r;
  case "annulus":{const distance=Math.hypot(dx,dy);return distance<=area.r&&distance>=area.inner;}
  case "rect":return Math.abs(dx)<=area.rx&&(area.strictY?Math.abs(dy)<area.ry:Math.abs(dy)<=area.ry);
  default:return false;
 }
}
export function readGuestOrigin(s){
 if(s?.originX===undefined&&s?.originY===undefined)return {};
 if(!finite(s?.originX)||!finite(s?.originY))return null;
 return {originX:s.originX,originY:s.originY};
}
export function guestPerformance(s,ally,reduced=false){
 const identity=GUEST_ACTING[ally];
 if(!identity||!s||!finite(s.x)||!finite(s.y)||
  !Number.isInteger(s.age)||s.age<0||s.age>=120||
  ![-1,1].includes(s.facing))return null;
 const origin=readGuestOrigin(s);if(origin===null)return null;
 const originX=origin.originX??s.x,originY=origin.originY??s.y;
 const age=s.age,f=s.facing,e=clamp(s.evo,0,4),
  rank=Number.isInteger(s.bondRank)&&s.bondRank<=3&&s.bondRank>=1?s.bondRank:1;
 const arrive=clamp(age/18,0,1),out=clamp((age-105)/15,0,1);
 const closest=L_BEATS.reduce((best,frame)=>{
  const distance=Math.abs(age-frame);
  return distance<best?distance:best;
 },1000);
 const attack=closest<=7,impulse=attack?1-closest/8:0;
 // Every pair has a consistent, bounded spatial signature. The hero's
 // facing defines direction; the guest never teleports across the player.
 const pairSeed=(s.hero||"").split("").reduce((n,ch)=>n+ch.charCodeAt(0),0)%7;
 const offset=(pairSeed-3)*1.5;
 const rest=74+offset;
 const smooth=k=>k*k*(3-2*k);
 const advance=clamp((age-36)/66,0,1);
 let travel=age<18?-180+(180-rest)*smooth(arrive):age<36?-rest+(rest-28)*smooth((age-18)/18):-28+230*advance*identity.travel;
 if(age>=106)travel+=out*100;
 let lateral=-travel;
 let altitude=identity.height,drift=0,gesture="idle",pose="idle",vx=0,vy=0;
 switch(ally){
  case "kilo":
   altitude+=reduced?0:Math.sin(age*.17)*7;
   drift=2.5*impulse;gesture="hover";pose=attack?"attack":"idle";break;
  case "stitcho":
   altitude+=reduced?0:Math.sin(age*.28)*4;
   drift=12*impulse;gesture="dash";pose=attack?"attack":"run";vx=age<18?5:0;break;
  case "chispin":
   altitude+=reduced?0:Math.abs(Math.sin(age*.23))*13;
   drift=8*impulse;gesture="spring";pose=attack?"attack":"jump";vy=-1;break;
  case "cat":
   altitude+=reduced?0:Math.abs(Math.sin(age*.19))*16;
   drift=16*impulse;gesture="pounce";pose=attack?"attack":"run";vx=age<18?4:0;break;
  case "dragon":
   altitude+=reduced?0:Math.sin(age*.12)*12;
   drift=12*impulse;gesture="soar";pose=attack?"attack":"glide";vy=-1;break;
  case "dino":
   altitude+=reduced?0:Math.sin(age*.38)*2;
   drift=8*impulse;gesture="stomp";pose=attack?"attack":"run";vx=age<18?3:0;break;
  case "frita":
   altitude+=reduced?0:Math.sin(age*.20)*3;
   drift=12*impulse;gesture="slide";pose=attack?"attack":"run";vx=age<18?6:0;break;
  case "pizza":
   altitude+=reduced?0:Math.abs(Math.sin(age*.16))*19;
   drift=6*impulse;gesture="bounce";pose=attack?"attack":"jump";vy=-1;break;
  case "yomi":
   altitude+=reduced?0:Math.sin(age*.11)*8;
   drift=4*impulse;gesture="hover";pose=attack?"attack":"glide";break;
  case "cuerno":
   altitude+=reduced?0:Math.sin(age*.14)*9;
   drift=7*impulse;gesture="float";pose=attack?"attack":"glide";break;
 }
 const exchange=age>=18&&age<36,leaving=age>=106;
 const facing=f;
 if(exchange){pose=age<30?(identity.height>=40?"glide":"run"):"idle";vx=age<30?f*3:0;}
 if(leaving){pose=identity.height>=40?"glide":"run";vx=f*7;}
 else if(!attack&&age>=36)vx=f*230*identity.travel/66;
 // Bigger forms are recognizable without obscuring the parent character.
 const size=.59+arrive*.13+e*.017+(rank-1)*.012;
 return Object.freeze({
  ally,style:identity.style,gesture,phase:leaving?"farewell":age<18?"arrival":exchange?"exchange":attack?"impact":"borrowed-L",
  x:originX-f*(lateral-drift),y:originY-altitude-(rank-1)*2,
  facing,pose,vx,vy,grounded:identity.height<20,
  visualScale:size,rank,impact:attack,arrival:arrive,exit:out
 });
}
// Dashed contours appear before each beat, never after unrelated frames.
// They are drawn from the *same descriptor* as borrowedLContains().
export function drawBorrowedLWarnings(ctx,kind,s,cam,t=0,reduced=false){
 if(!ctx||!cam||!finite(cam.x)||!finite(cam.y)||!s)return false;
 let drawn=false;
 for(let i=0;i<L_BEATS.length;i++){
  const delta=s.age-L_BEATS[i];
  if(!Number.isInteger(s.age)||delta< -17||delta>6)continue;
  const area=borrowedLFootprint(kind,s,i);if(!area)continue;
  const forecast=delta<0,fade=forecast?(delta+17)/17:1-delta/7;
  const alpha=clamp(fade,0,1)*.21;
  if(alpha<=0)continue;
  const x=area.x-cam.x,y=area.y-cam.y;
  ctx.save();ctx.globalAlpha*=alpha;
  ctx.strokeStyle=forecast?"#fff3bb":"#fff9e8";
  ctx.lineWidth=forecast?2:3;
  if(typeof ctx.setLineDash==="function")ctx.setLineDash(reduced?[6,6]:[7,4]);
  ctx.beginPath();
  if(area.shape==="rect")ctx.rect(x-area.rx,y-area.ry,area.rx*2,area.ry*2);
  else{
   ctx.arc(x,y,area.r,0,TAU);
   if(area.shape==="annulus"&&area.inner>0){ctx.moveTo(x+area.inner,y);ctx.arc(x,y,area.inner,0,TAU);}
  }
  ctx.stroke();
  ctx.restore();drawn=true;
 }
 return drawn;
}

export function surpriseGuestDrawer(drawActor,s,cam,reduced=false){
 if(!s.surprise||typeof drawActor!=='function')return drawActor;
 return (...args)=>{
  const ctx=args[0],actor=args[1],age=s.age;
  const x=actor.x+actor.w/2-cam.x,y=actor.y+actor.h-48-cam.y;
  const alpha=clamp((age-18)/8,0,1);
  if(age<18){
   ctx.save();ctx.translate(x,y);if(!reduced)ctx.rotate(Math.sin(age*.5)*.06);
   ctx.fillStyle='#ffe6a2';ctx.strokeStyle='#805735';ctx.lineWidth=2.5;ctx.beginPath();
   if(typeof ctx.roundRect==='function')ctx.roundRect(-23,-23,46,46,12);else ctx.rect(-23,-23,46,46);
   ctx.fill();ctx.stroke();ctx.fillStyle='#76543f';ctx.textAlign='center';ctx.font='700 34px Fredoka, sans-serif';ctx.fillText('?',0,12);ctx.restore();
  }else if(age<28){
   ctx.save();ctx.globalAlpha*=1-(age-18)/10;ctx.strokeStyle='#ffeaa4';ctx.lineWidth=2;
   for(let i=0;i<6;i++){const a=i*TAU/6,r=25+(age-18)*2;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.lineTo(x+Math.cos(a)*(r+8),y+Math.sin(a)*(r+8));ctx.stroke();}ctx.restore();
  }
  if(alpha>0){ctx.save();ctx.globalAlpha*=alpha;drawActor(...args);ctx.restore();}
 };
}
