// OHANA V314 · Ten authored hero reactions x nine borrowed L identities.
// An overlay of BOTH characters, not another generic effect or new damage
// source. Peer snapshots contain only a bounded rank (1..3), never XP.
import {ROSTER} from "../characters/roster.js";
import {DEFAULT_U_PARTNERS,chooseUPartner,uPartnerInfo} from "./u-partners.js";

const TAU=Math.PI*2;
const origin=Object.freeze({
 kilo:{shape:"flower",verb:"Jardín",perk:"heart",line:"Luz que cuida"},
 stitcho:{shape:"stitch",verb:"Travesura",perk:"stagger",line:"Costuras del caos"},
 chispin:{shape:"bolt",verb:"Chispa",perk:"speed",line:"Energía contagiosa"},
 cat:{shape:"paw",verb:"Nueve vidas",perk:"guard",line:"Pasos de sombra"},
 dragon:{shape:"wing",verb:"Ascenso",perk:"flight",line:"Alas que responden"},
 dino:{shape:"fossil",verb:"Pisada",perk:"titan",line:"Una tierra que tiembla"},
 frita:{shape:"crisp",verb:"Turbo",perk:"speed",line:"Carrera crujiente"},
 pizza:{shape:"slice",verb:"Rebote",perk:"bounce",line:"Fiesta volcánica"},
 yomi:{shape:"spirit",verb:"Enlace",perk:"ghost",line:"Lo que aprendo, lo comparto"},
 cuerno:{shape:"star",verb:"Aurora",perk:"aura",line:"Sueños compartidos"}
});
const byId=Object.freeze(Object.fromEntries(ROSTER.map((p,i)=>[p.id,Object.freeze({name:p.name,color:p.color,index:i})])));
export const DUET_ORIGINS=Object.freeze(Object.fromEntries(Object.entries(origin).map(([id,value])=>[id,Object.freeze(value)])));
const boundedRank=v=>Number.isInteger(v)&&v>=1&&v<=3?v:1;
export function duetChemistry(hero,ally,rank=1){
 const h=byId[hero],b=byId[ally],style=origin[hero];
 if(!h||!b||!style||hero===ally||chooseUPartner(hero,ally)!==ally)return null;
 const borrowed=uPartnerInfo(hero,ally);
 const seed=(h.index*11+b.index*7+1)%90;
 const quality=boundedRank(rank);
 return Object.freeze({
  key:hero+":"+ally,
  hero,ally,shape:style.shape,perk:style.perk,
  name:style.verb+" y "+borrowed.lName,
  phrase:style.line+" · "+b.name+" presta "+borrowed.lName,
  heroColor:h.color,allyColor:b.color,
  rank:quality,rhythm:(seed%5)+1,
  orbit:seed%3,offset:seed%7,crests:quality===3?5:quality===2?4:3
 });
}
export function duetHitOptions(chemistry,facing=1,baseStun=32){
 if(!chemistry)return {stun:baseStun,kx:4*facing};
 return Object.freeze({
  stun:baseStun+(chemistry.perk==="stagger"?8+chemistry.rank*4:0),
  kx:facing*(chemistry.perk==="titan"?6+chemistry.rank:4)
 });
}
// Only the authoritative local hero receives the perk. No remote damage or
// new attack is created, and bonuses require a successful borrowed-L hit.
export function applyDuetChemistry(p,chemistry,successful,heal){
 if(!p||p.dead||!chemistry||successful<=0||chemistry.rank<2)return false;
 const rank=chemistry.rank,life=12+rank*7;
 switch(chemistry.perk){
  case "heart":
   if(typeof heal==="function")heal(p,(Number(p.maxHealth)||100)*(.012+.005*rank));
   break;
  case "stagger":p._specialT=Math.max(p._specialT||0,life);break;
  case "speed":p._specialSpeedT=Math.max(p._specialSpeedT||0,life);break;
  case "guard":p.invuln=Math.max(p.invuln||0,life);break;
  case "flight":p._specialFlightT=Math.max(p._specialFlightT||0,life);break;
  case "titan":p._specialTitanT=Math.max(p._specialTitanT||0,life);break;
  case "bounce":p._specialBounceT=Math.max(p._specialBounceT||0,life);break;
  case "ghost":p._specialGhostT=Math.max(p._specialGhostT||0,life);break;
  case "aura":p._specialAuroraT=Math.max(p._specialAuroraT||0,life);break;
  default:return false;
 }
 return true;
}
function symbol(ctx,shape,x,y,size,color){
 const z=size;ctx.save();ctx.translate(x,y);
 ctx.lineWidth=Math.max(1,z*.16);ctx.strokeStyle=color;ctx.fillStyle=color;
 ctx.lineCap="round";ctx.lineJoin="round";
 ctx.beginPath();
 switch(shape){
  case "flower":
   for(let k=0;k<5;k++){const a=k*TAU/5;ctx.ellipse(Math.cos(a)*z*.56,Math.sin(a)*z*.56,z*.32,z*.20,a,0,TAU)}
   ctx.fill();break;
  case "stitch":
   ctx.moveTo(-z,-z*.6);ctx.lineTo(z,z*.6);
   ctx.moveTo(-z*.85,z*.6);ctx.lineTo(z*.8,-z*.5);ctx.stroke();break;
  case "bolt":
   ctx.moveTo(z*.2,-z);ctx.lineTo(-z*.55,z*.15);
   ctx.lineTo(z*.10,z*.15);ctx.lineTo(-z*.25,z);ctx.lineTo(z*.65,-z*.2);
   ctx.lineTo(0,-z*.2);ctx.closePath();ctx.fill();break;
  case "paw":
   ctx.ellipse(0,z*.3,z*.65,z*.45,0,0,TAU);
   for(let k=-1;k<=1;k++)ctx.ellipse(k*z*.6,-z*.45,z*.23,z*.3,0,0,TAU);
   ctx.fill();break;
  case "wing":
   ctx.moveTo(-z*.8,z*.9);ctx.quadraticCurveTo(-z*.45,-z,z*.9,-z*.8);
   ctx.quadraticCurveTo(z*.55,z*.2,-z*.8,z*.9);ctx.stroke();break;
  case "fossil":
   ctx.moveTo(-z,z*.2);ctx.lineTo(z*.75,-z*.55);
   ctx.moveTo(-z*.45,-z*.1);ctx.lineTo(-z*.55,-z*.75);
   ctx.moveTo(z*.15,-z*.4);ctx.lineTo(z*.3,z*.45);ctx.stroke();break;
  case "crisp":
   ctx.rect(-z*.55,-z*.55,z*1.1,z*1.1);ctx.fill();break;
  case "slice":
   ctx.moveTo(-z*.8,-z*.5);ctx.lineTo(z*.85,-z*.5);ctx.lineTo(0,z*.95);ctx.closePath();ctx.stroke();break;
  case "spirit":
   ctx.moveTo(-z*.65,z*.9);ctx.quadraticCurveTo(-z*.85,-z*.7,0,-z);
   ctx.quadraticCurveTo(z*.9,-z*.6,z*.65,z*.9);ctx.stroke();break;
  case "star":
   for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?z*.38:z;
    const xx=Math.cos(a)*r,yy=Math.sin(a)*r;
    if(k===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}
   ctx.closePath();ctx.stroke();break;
 }
 ctx.restore();
}
// Adds a small, evolving joint seal at the handoff and the L beats.
// Each of the 90 pairings has distinct hue, rhythm and spatial signature.
export function drawDuetChemistry(ctx,s,cam,t=0,reduced=false){
 const c=duetChemistry(s?.hero,s?.ally||DEFAULT_U_PARTNERS[s?.hero],s?.bondRank||1);
 if(!c||!ctx||!Number.isFinite(s.x)||!Number.isFinite(s.y))return false;
 if(!cam||!Number.isFinite(cam.x)||!Number.isFinite(cam.y))return false;
 const age=s.age||0,face=s.facing===-1?-1:1;
 const amplitude=Math.min(1,age/14)*Math.min(1,(120-age)/18);
 if(amplitude<=0)return false;
 const x=s.x-cam.x,y=s.y-47-cam.y,evo=Math.max(0,Math.min(4,s.evo|0));
 const count=reduced?2:c.crests;
 ctx.save();ctx.globalAlpha*=.30*amplitude;ctx.lineWidth=1.7+Math.max(0,c.rank-1)*.25;
 // Dual-strand links use both actors' own colors; never two generic rings.
 const jolt=reduced?0:Math.sin(t*.055*c.rhythm)*3;
 ctx.strokeStyle=c.heroColor;ctx.beginPath();
 ctx.moveTo(x-face*20,y);ctx.quadraticCurveTo(x+face*20,y-50+jolt,x+face*(45+c.offset*2),y-30);ctx.stroke();
 ctx.strokeStyle=c.allyColor;ctx.beginPath();
 ctx.moveTo(x-face*19,y-9);ctx.quadraticCurveTo(x+face*19,y-60-jolt,x+face*(45+c.offset*2),y-39);ctx.stroke();
 for(let i=0;i<count;i++){
  const phase=i*TAU/count+(reduced?0:t*.008*c.rhythm);
  const r=24+evo*3+c.orbit*5;
  symbol(ctx,c.shape,x+Math.cos(phase)*r,y-7+Math.sin(phase)*r*.58,
   2.9+c.rank*.7,i%2?c.allyColor:c.heroColor);
 }
 if(age>=31&&age<105){
  // Impact pre-cue with hero symbol and partner color, not an extra hitbox.
  const j=Math.max(0,Math.min(2,Math.round((age-42)/24)));
  const d=Math.abs(age-(42+j*24));
  if(d<=15){
   ctx.globalAlpha*=1-d/16;
   symbol(ctx,c.shape,x+face*(52+j*54),y+4,5+evo*.8+c.rank,c.heroColor);
  }
 }
 ctx.restore();return true;
}
