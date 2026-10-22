import {drawChispaAssist} from './chispa-stagecraft.js';
// OHANA · V305–V311: six real U duets with the next hero's L.
// Dragón calls Dino's fossil quake, retaining his original free-flight supreme.
// Visuals never damage anything. Only updateFamilyDuet mutates combat state.
// The cooperative wire format is deliberately small and contains NO hit sets.
import {ROSTER} from "../characters/roster.js";
import {DEFAULT_U_PARTNERS,chooseUPartner,U_L_NAMES,bondXP,uExpRank,gainUBondHit,persistUBonds} from "./u-partners.js";
import {duetChemistry,duetHitOptions,applyDuetChemistry,drawDuetChemistry} from "./u-duet-chemistry.js";
import {borrowedLFootprint,borrowedLContains,guestPerformance,readGuestOrigin,surpriseGuestDrawer,drawBorrowedLWarnings} from "./u-duet-direction-v315.js";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const TAU=Math.PI*2;
const names={
 dragon:{ally:"dino",borrowedL:"quake",name:"Dragón y Dino",line:"¡El cielo tiembla!",cue:"DINO · TERREMOTO",color:"#ffac63",kind:"quake"},
 dino:{ally:"frita",borrowedL:"fryer",name:"Dino y Frita",line:"¡Patatas sísmicas!",cue:"FRITA · FREIDORA",color:"#d9ee7a",kind:"geyser"},
 frita:{ally:"pizza",borrowedL:"oven",name:"Frita y Pizza",line:"¡Menú volcánico!",cue:"PIZZA · HORNO",color:"#ffd36a",kind:"oven"},
 pizza:{ally:"yomi",borrowedL:"maw",name:"Pizza y Yomi",line:"¡Esta pizza muerde!",cue:"YOMI · SÍNTESIS",color:"#ff9d82",kind:"maw"},
 yomi:{ally:"cuerno",borrowedL:"rainbow",name:"Yomi y Cuerno",line:"¡Luz entre sombras!",cue:"CUERNO · ARCOÍRIS",color:"#e2b8ff",kind:"rainbow"},
 cuerno:{ally:"kilo",borrowedL:"ohana",name:"Cuerno y Kilo",line:"¡Toda la familia!",cue:"KILO · CORO OHANA",color:"#ffe9a8",kind:"ohana"}
};
export const FAMILY_DUETS=Object.freeze(Object.fromEntries(Object.entries(names).map(([id,data])=>[id,Object.freeze({hero:id,...data})])));
// Classic six duets retain their original art. The others gain the same
// in-world system only when the player selects an alternative companion.
const L_VISUALS=Object.freeze({
 caos:"chaos",storm:"storm",ninetails:"tails",meteor:"meteor",
 quake:"quake",fryer:"geyser",oven:"oven",maw:"maw",rainbow:"rainbow",ohana:"ohana"
});
export function familyDuetDefinition(s){
 const hero=s?.hero;
 const chosen=s?.ally===undefined?DEFAULT_U_PARTNERS[hero]:s.ally;
 const ally=chooseUPartner(hero,chosen);
 if(!ally||ally!==chosen)return null;
 if(FAMILY_DUETS[hero]&&FAMILY_DUETS[hero].ally===ally)return FAMILY_DUETS[hero];
 const friend=ROSTER.find(r=>r.id===ally);
 const ability=friend?.abilities?.[2];
 const kind=L_VISUALS[ability];
 if(!kind)return null;
 const actor=ROSTER.find(r=>r.id===hero);
 return Object.freeze({hero,ally,borrowedL:ability,kind,
  name:actor.name+" y "+friend.name,
  cue:friend.name.toUpperCase()+" · "+(U_L_NAMES[ability]||ability).toUpperCase(),
  line:"¡"+friend.name+", préstame tu L!",
  color:friend.color||"#fff6cf"});
}
export const FAMILY_DUET_LENGTH=120;
export const SURPRISE_DUET_LENGTH=360;
const duetLength=s=>s?.surprise===true?SURPRISE_DUET_LENGTH:FAMILY_DUET_LENGTH;
export const FAMILY_DUET_BEATS=Object.freeze([42,66,90]);
const validNumber=n=>typeof n==="number"&&Number.isFinite(n)&&Math.abs(n)<=20000;
const center=e=>({x:e.x+(e.w||0)/2,y:e.y+(e.h||0)/2});

export function readFamilyDuet(s){
 if(!s||typeof s!=="object"||readGuestOrigin(s)===null||!familyDuetDefinition(s)||!validNumber(s.x)||!validNumber(s.y)||
 !Number.isInteger(s.age)||s.age<0||s.age>=duetLength(s)||
 !Number.isInteger(s.evo)||s.evo<0||s.evo>4||![-1,1].includes(s.facing)||
 (s.bondRank!==undefined&&(!Number.isInteger(s.bondRank)||s.bondRank<1||s.bondRank>3)))return null;
 return {...(s.surprise===true?{surprise:true}:{}),...readGuestOrigin(s),...(s.ally===undefined?{}:{ally:s.ally}),...(s.bondRank===undefined?{}:{bondRank:s.bondRank}),hero:s.hero,x:s.x,y:s.y,age:s.age,evo:s.evo,facing:s.facing};
}
export function familyDuetPose(s,reduce=false){
 const data=familyDuetDefinition(s);if(!data)return null;
 const age=clamp(s.age,0,duetLength(s)-1),evo=clamp(s.evo,0,4),face=s.facing===-1?-1:1;
 const arrival=Math.min(1,age/18);
 const exit=Math.min(1,(duetLength(s)-age)/14);
 const beat=age<18?"arrival":age<36?"exchange":age<102?"borrowed-L":"farewell";
 const phase=age<36?0:age<102?(age-36)/66:1;
 const guest=guestPerformance({...s,age,evo,facing:face},data.ally,reduce);
 const allyX=guest?.x??s.x-face*(146-75*arrival);
 const allyY=guest?.y??s.y-40;
 return {beat,phase,allyX,allyY,guest,alpha:exit,kind:data.kind,
   radius:56+evo*8,focusX:s.x+face*(56+phase*65),focusY:s.y-26};
}
export function startFamilyDuet(game,power=1,legacyTargets=[],selectedAlly){
 const p=game?.player;
 const ally=selectedAlly===undefined?DEFAULT_U_PARTNERS[p?.id]:selectedAlly;
 const def=familyDuetDefinition({hero:p?.id,ally});
 if(!p||p.dead||!def)return false;
 const bondRank=uExpRank(bondXP(p,def.ally));
 game._familyDuet={hero:p.id,...(def.ally===DEFAULT_U_PARTNERS[p.id]?{}:{ally:def.ally}),
   ...(bondRank>1?{bondRank}:{}),room:String(game.roomId||"hub"),
   ...(p.uSurprise?{surprise:true}:{}),x:center(p).x,y:p.y+p.h,originX:center(p).x,originY:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),
   facing:p.facing===-1?-1:1,power:clamp(power,1,2),
   // Entities already handled by the legacy U cannot be damaged twice by L.
   legacyTargets:new Set(Array.isArray(legacyTargets)?legacyTargets.slice(0,256):[])};
 game._assist={heroId:def.ally,heroName:def.ally,t:p.id==="yomi"?240:FAMILY_DUET_LENGTH};
 return true;
}
// The exact footprint is shared with the on-screen pre-hit telegraph.
export function familyDuetStrike(s,beat,e){
 const def=familyDuetDefinition(s);
 if(!def||!e)return false;
 return borrowedLContains(borrowedLFootprint(def.kind,s,beat),e);
}
export function updateFamilyDuet(game,hit,heal){
 const s=game?._familyDuet,p=game?.player;
 if(!s){if(p)p._familyDuetT=0;return;}
 const def=familyDuetDefinition(s);
 if(!p||p.dead||!def||p.id!==s.hero||String(game.roomId||"hub")!==s.room||s.age>=duetLength(s)){
  game._familyDuet=null;if(p)p._familyDuetT=0;
  if(game._assist?.heroId===def?.ally)game._assist.t=0;
  return;
 }
 s.x=center(p).x;s.y=p.y+p.h;
 const beat=FAMILY_DUET_BEATS.indexOf(s.age);
 if(beat>=0){
  const damage=(70+s.evo*14)*s.power*(def.kind==="ohana"?.19:def.kind==="maw"?.27:.23);
  let applied=0;
  const chemistry=duetChemistry(s.hero,def.ally,s.bondRank||1);
  for(const e of def.kind==='ohana'?[]:(game.enemies||[])){
   if(!e||e.hp<=0||e.dying||e.fell||s.legacyTargets?.has(e)||!familyDuetStrike(s,beat,e))continue;
   const identity=duetHitOptions(chemistry,s.facing,def.kind==="rainbow"?48:32);
   const knock=s.facing*(def.kind==="quake"?7:4);
   if(typeof hit==="function"&&hit(game,e,damage,{
    color:def.color,stun:identity.stun,kx:chemistry.perk==="titan"?identity.kx:knock,ky:-5,hitstop:0,shake:1
   }))applied++;
  }
  if(def.kind==="ohana"&&typeof heal==="function")heal(p,(Number(p.maxHealth)||100)*(.035+s.evo*.006));
  applyDuetChemistry(p,chemistry,applied,heal);
  // Bond experience belongs only to the active hero/ally pair. Each actual
  // successful L beat (or Kilo's helpful chorus) is rewarded once.
  if(applied>0||def.kind==="ohana"){
   const gained=gainUBondHit(p,2+Math.min(3,applied));
   if(gained){
    try{persistUBonds(globalThis.localStorage,p.id,p.uBonds);}catch{}
   }
  }
  if(def.kind==="chaos")p.invuln=Math.max(p.invuln||0,18);
  if(def.kind==="storm")p._specialSpeedT=Math.max(p._specialSpeedT||0,18);
  if(def.kind==="tails")p._specialShadowT=Math.max(p._specialShadowT||0,18);
  if(def.kind==="meteor")p._specialFlightT=Math.max(p._specialFlightT||0,18);
  if(def.kind==="quake")p._specialFlightT=Math.max(p._specialFlightT||0,180);
  if(def.kind==="rainbow")p.invuln=Math.max(p.invuln||0,16);
  if(def.kind==="geyser")p._specialTitanT=Math.max(p._specialTitanT||0,30);
  if(def.kind==="maw")p._specialGhostT=Math.max(p._specialGhostT||0,24);
  if(applied>0)game.fx?.emit?.(s.x+s.facing*54,s.y-30,{color:def.color,count:Math.min(6,applied+2),size:3,up:1,speed:2,life:13});
 }
 p._familyDuetAge=s.age;p._familyDuetT=duetLength(s)-s.age;
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
  hero:s.hero,ally:familyDuetDefinition(s).ally,borrowedL:familyDuetDefinition(s).borrowedL,bondRank:s.bondRank||1,
  stage:pose.beat,form:s.evo,allyX:pose.allyX,allyY:pose.allyY,opacity:pose.alpha,
  keyframe:beat,telegraph:delta!==null&&delta<0,
  impact:delta===0,progress:delta===null?0:delta<0?(delta+17)/17:Math.min(1,delta/18),
  accentCount:reduce?2:2+s.evo
 });
}
// V322 · Six canonical LEGENDARY meetings, not six extra sources of damage.
// Rank 1/2 and every alternate partner keep their established acting and L.
const LEGEND_GAGS=Object.freeze({
 dragon:Object.freeze({ally:"dino",kind:"egg",guestPose:"victory"}),
 dino:Object.freeze({ally:"frita",kind:"sprout",guestPose:"jump"}),
 frita:Object.freeze({ally:"pizza",kind:"snack",guestPose:"jump"}),
 pizza:Object.freeze({ally:"yomi",kind:"slice",guestPose:"attack"}),
 yomi:Object.freeze({ally:"cuerno",kind:"lantern",guestPose:"glide"}),
 cuerno:Object.freeze({ally:"kilo",kind:"flowers",guestPose:"victory"})
});
export function legendaryDuetMoment(value,reduce=false){
 const s=readFamilyDuet(value);
 const def=s&&LEGEND_GAGS[s.hero];
 if(!s||s.bondRank!==3||!def||def.ally!==(s.ally||DEFAULT_U_PARTNERS[s.hero])||s.age<18)return null;
 const guest=familyDuetPose(s,reduce);
 const stage=s.age<36?"gag":s.age<102?"borrowed-L":"farewell";
 const start=stage==="gag"?18:stage==="borrowed-L"?36:102;
 const length=stage==="gag"?18:stage==="borrowed-L"?66:18;
 const progress=clamp((s.age-start)/length,0,1);
 const x=(s.x+guest.allyX)*.5,y=Math.min(s.y-23,guest.allyY-10);
 return Object.freeze({hero:s.hero,ally:def.ally,kind:def.kind,stage,progress,
  x,y,face:s.facing,form:s.evo,guestPose:stage==="gag"?def.guestPose:null,
  // Static, stage-driven poses are kept when reduced motion is requested.
  still:!!reduce});
}
function drawLegendaryDuetMoment(ctx,s,cam,reduce){
 const d=legendaryDuetMoment(s,reduce);
 if(!d)return false;
 const x=d.x-cam.x,y=d.y-cam.y,k=d.progress,face=d.face,scale=.82+d.form*.07;
 ctx.save();ctx.translate(x,y);ctx.scale(face*scale,scale);
 ctx.globalAlpha*=d.stage==="farewell"?Math.max(.16,1-k):.82;
 ctx.lineWidth=2.2;ctx.lineCap="round";ctx.lineJoin="round";
 const oval=(a,b,rx,ry,color)=>{
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(a,b,rx,ry,0,0,TAU);ctx.fill();
  ctx.strokeStyle="#674c47";ctx.lineWidth=1.5;ctx.stroke();
 };
 const line=(color,points)=>{
  ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.beginPath();
  points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.stroke();
 };
 const lift=d.still?0:Math.sin(Math.PI*k)*4;
 if(d.kind==="egg"){
  // Dino mistakes a small, harmless meteor for an egg.
  oval(0,-9-lift,12,16,"#ffebbc");
  line("#d48d52",[[-6,-3-lift],[-2,-7-lift],[1,-3-lift],[5,-7-lift]]);
  line("#ef9555",[[-14,-22-lift],[-18,-27-lift],[-23,-30-lift]]);
 }else if(d.kind==="sprout"){
  // The quake grows a potato; Frita catches rather than damages it.
  oval(0,-6-lift,13,9,"#e3b572");
  ctx.strokeStyle="#71b65c";ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(0,-13-lift);ctx.quadraticCurveTo(-7,-24-lift,-12,-19-lift);
  ctx.moveTo(0,-13-lift);ctx.quadraticCurveTo(5,-28-lift,12,-24-lift);ctx.stroke();
 }else if(d.kind==="snack"){
  // Frita offers one crisp potato to Pizza's oven.
  ctx.fillStyle="#ffe08f";ctx.fillRect(-7,-20-lift,10,22);
  line("#d88d38",[[-7,-20-lift],[-7,3-lift],[4,3-lift]]);
  line("#fbe2a4",[[4,-13-lift],[13,-16-lift],[19,-12-lift]]);
 }else if(d.kind==="slice"){
  // Pizza offers a slice; Yomi's small mouth tastes it.
  ctx.fillStyle="#ffcc70";ctx.beginPath();
  ctx.moveTo(-21,-13-lift);ctx.lineTo(2,-19-lift);ctx.lineTo(-8,5-lift);ctx.closePath();ctx.fill();
  line("#b46b4a",[[-21,-13-lift],[2,-19-lift]]);
  oval(-9,-9-lift,2.7,2.7,"#cf6657");
  ctx.strokeStyle="#d6b0ce";ctx.lineWidth=3;ctx.beginPath();
  ctx.ellipse(17,-9,7,11,0,-Math.PI*.5,Math.PI*.5);ctx.stroke();
 }else if(d.kind==="lantern"){
  // Aurora unfolds from Yomi's lantern, caught by Cuerno's floating horn.
  ctx.fillStyle="#f6dbb4";ctx.fillRect(-13,-17-lift,14,18);
  line("#63475e",[[-13,-17-lift],[-6,-23-lift],[1,-17-lift]]);
  ctx.strokeStyle="#9be8d8";ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(1,-7-lift);ctx.quadraticCurveTo(15,-29-lift,24,-17-lift);ctx.stroke();
 }else if(d.kind==="flowers"){
  // Kilo neatly orders Cuerno's rainbow into three small, fixed flowers.
  const shades=["#ef9cbb","#edd77d","#a6daec"];
  for(let i=0;i<3;i++){
   const xx=-16+i*16,yy=-8-(i%2)*7-lift;
   for(let j=0;j<4;j++){
    const angle=j*TAU/4;
    ctx.fillStyle=shades[i];ctx.beginPath();
    ctx.ellipse(xx+Math.cos(angle)*4,yy+Math.sin(angle)*4,3.7,3,angle,0,TAU);ctx.fill();
   }
   oval(xx,yy,2.5,2.5,"#fff2c7");
  }
  line("#a7d5bf",[[-16,0],[-7,7],[0,0],[8,7],[16,0]]);
 }
 ctx.restore();return true;
}
function drawFamilyDuetSignature(ctx,s,pose,cam,t,reduce){
 const def=familyDuetDefinition(s),evo=s.evo,x=s.x-cam.x,y=s.y-cam.y;
 const ax=pose.allyX-cam.x,ay=pose.allyY-cam.y;
 const energy=Math.min(1,s.age/12)*pose.alpha;
 ctx.save();ctx.globalAlpha*=energy;
 const count=reduce?2:2+evo;
 switch(def.kind){
  case "chaos": // Dimension stitch through the friend's entrance
   for(let i=0;i<count;i++){
    const bx=ax-s.facing*(20+i*13),by=ay-18-(i%2)*13;
    ctx.strokeStyle=i%2?"#a2b4ff":"#e4a9fc";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(bx-7,by-8);ctx.lineTo(bx+6,by+5);
    ctx.lineTo(bx-5,by+11);ctx.stroke();
   }break;
  case "storm": // Lightning branches along the arrival path
   for(let i=0;i<count;i++){
    const bx=ax-s.facing*(18+i*15),by=ay-16-i*7;
    ctx.strokeStyle=i%2?"#ffffff":"#f6e574";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(bx,by-11);ctx.lineTo(bx+8,by+1);
    ctx.lineTo(bx+2,by);ctx.lineTo(bx+12,by+16);ctx.stroke();
   }break;
  case "tails": // Nine wisps, bounded by reduced-motion
   for(let i=0;i<(reduce?3:9);i++){
    const a=i*TAU/(reduce?3:9)+(reduce?0:t*.02);
    spark(ctx,ax+Math.cos(a)*(25+evo*4),ay-30+Math.sin(a)*(18+evo*3),
     2.5+i%3,i%2?"#ffb4de":"#f8dcff");
   }break;
  case "meteor":
   for(let i=0;i<count;i++){
    const bx=ax+s.facing*(16+i*9),by=ay-20-i*9;
    spark(ctx,bx,by,3+i*.4,i%2?"#ffe4a0":"#ff926e");
    ctx.strokeStyle="#ffb374";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(bx-s.facing*9,by-18);ctx.lineTo(bx,by);ctx.stroke();
   }break;
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
 const s=readFamilyDuet(value);if(!s)return false;drawActor=surpriseGuestDrawer(drawActor,s,cam,reduce);
 const def=familyDuetDefinition(s),pose=familyDuetPose(s,reduce);
 const legendary=legendaryDuetMoment(s,reduce);
 if(def.ally==='chispin')drawChispaAssist(ctx,s,cam,t,reduce);
 const x=s.x-cam.x,y=s.y-cam.y,friend=roster.find(r=>r.id===def.ally),form=friend?.forms?.[s.evo];
 ctx.save();const baseAlpha=ctx.globalAlpha;ctx.globalAlpha*=pose.alpha;
 if(friend&&form&&typeof drawActor==="function"){
  const actor=pose.guest;
  drawActor(ctx,{...friend,...form,id:def.ally,evo:s.evo,
   x:pose.allyX-form.w/2,y:pose.allyY-form.h,
   // Ten genuinely different entrances and L gestures, not one generic hop.
   facing:actor?.facing??s.facing,
   vx:actor?.vx??0,vy:actor?.vy??0,grounded:actor?.grounded??true,
   _poseOverride:legendary?.guestPose||actor?.pose||"idle",
   melee:actor?.impact?6:0,
   visualScale:actor?.visualScale??.72,_duetActor:true},cam,t);
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
   case "chaos":{
    const r=windup?30+progress*52:100+progress*35;
    ring(ctx,xx,yy,r,"#b39dff",.85,.5);
    for(let k=0;k<(reduce?3:6);k++){
     const a=k*TAU/(reduce?3:6);
     spark(ctx,xx+Math.cos(a)*r,yy+Math.sin(a)*r*.45,4,"#eacfff");
    }
    break;
   }
   case "storm":{
    if(def.ally==='chispin')break;
    for(let k=0;k<(reduce?2:4);k++){
     const bx=xx+(k-1)*22;
     ctx.strokeStyle=k%2?"#fff0ad":"#b2efff";ctx.lineWidth=3;
     ctx.beginPath();ctx.moveTo(bx,yy-115);ctx.lineTo(bx+17,yy-52);
     ctx.lineTo(bx+1,yy-47);ctx.lineTo(bx+22,yy+23);ctx.stroke();
    }break;
   }
   case "tails":{
    const rad=windup?55:90+s.evo*10;
    for(let k=0;k<(reduce?3:9);k++){
     const a=k*TAU/(reduce?3:9)+(reduce?0:t*.015);
     ring(ctx,xx+Math.cos(a)*rad,yy+Math.sin(a)*rad*.55,9, k%2?"#ffb8e2":"#d8b0ff",.5,.7);
    }break;
   }
   case "meteor":{
    const fall=windup?55+progress*15:70*(1-progress);
    for(let k=0;k<(reduce?2:4);k++){
     const mx=xx+(k-1)*19,my=yy-fall-30;
     spark(ctx,mx,my,10-k*.8,k%2?"#ffb678":"#ffe5a3");
     ctx.strokeStyle="#ffae75";ctx.lineWidth=2.5;ctx.beginPath();
     ctx.moveTo(mx-16,my-26);ctx.lineTo(mx,my);ctx.stroke();
    }break;
   }
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
 drawBorrowedLWarnings(ctx,def.kind,s,cam,t,reduce);
 drawDuetChemistry(ctx,s,cam,t,reduce);
 // Draw the gag last, between hero and guest, never at an enemy target.
 drawLegendaryDuetMoment(ctx,s,cam,reduce);
 ctx.restore();return true;
}
