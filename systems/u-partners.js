// OHANA V313 · Personaliza a quién llamas con U. Ni un solo dúo se elige a dedo
// por el motor: cada héroe puede invocar a cualquiera de los otros nueve.
// La EXP de afinidad es independiente de los cristales y de la forma.
import {ROSTER} from "../characters/roster.js";

export const DEFAULT_U_PARTNERS=Object.freeze({
 kilo:"stitcho",stitcho:"chispin",chispin:"cat",cat:"dragon",dragon:"dino",
 dino:"frita",frita:"pizza",pizza:"yomi",yomi:"cuerno",cuerno:"kilo"
});
export const U_EXP_THRESHOLDS=Object.freeze([0,35,100]);
export const MAX_U_EXP=200;
export const U_L_NAMES=Object.freeze({
 ohana:"Coro Ohana",caos:"Caos",storm:"Tormenta",ninetails:"Nueve colas",
 meteor:"Meteoritos",quake:"Terremoto",fryer:"Freidora",oven:"Horno",
 maw:"Fauces",rainbow:"Arcoíris"
});
const byId=new Map(ROSTER.map(r=>[r.id,r]));
export function optionsForUPartner(hero){
 if(!byId.has(hero))return [];
 return ROSTER.filter(r=>r.id!==hero).map(r=>Object.freeze({
  id:r.id,name:r.name,borrowedL:r.abilities[2],lName:U_L_NAMES[r.abilities[2]]||r.abilities[2]
 }));
}
export function chooseUPartner(hero,requested){
 if(!byId.has(hero))return null;
 if(typeof requested==="string"&&requested!==hero&&byId.has(requested))return requested;
 return DEFAULT_U_PARTNERS[hero];
}
export function uPartnerInfo(hero,requested){
 const ally=chooseUPartner(hero,requested);
 return ally?optionsForUPartner(hero).find(p=>p.id===ally)||null:null;
}
export function uExpRank(xp){
 const n=Number.isFinite(xp)?Math.max(0,Math.min(MAX_U_EXP,Math.floor(xp))):0;
 return n>=U_EXP_THRESHOLDS[2]?3:n>=U_EXP_THRESHOLDS[1]?2:1;
}
export function gainUExp(p,slot){
 if(!p||p.dead||!Number.isInteger(slot)||slot<0||slot>3)return 0;
 const before=Number.isFinite(p.uExp)?Math.max(0,Math.min(MAX_U_EXP,Math.floor(p.uExp))):0;
 const next=Math.min(MAX_U_EXP,before+(slot===3?12:slot===2?8:slot===1?5:3));
 p.uExp=next;
 return next-before;
}
export function uExpPower(p){
 return 1+(uExpRank(p?.uExp)-1)*.10;
}
// Per-hero choice is non-sensitive game preference. Never sync localStorage
// itself to another player. The chosen ally is already validated on peer frames.
export const U_PARTNERS_STORAGE="ohana-u-partners-v1";
export function loadUPartnerChoice(storage,hero){
 const fallback=chooseUPartner(hero);
 if(!fallback)return null;
 try{
  const data=JSON.parse(storage?.getItem(U_PARTNERS_STORAGE)||"{}");
  return chooseUPartner(hero,data?.[hero]);
 }catch{return fallback;}
}
export function storeUPartnerChoice(storage,hero,ally){
 const chosen=chooseUPartner(hero,ally);
 if(!chosen||chosen!==ally)return false;
 try{
  const data=JSON.parse(storage?.getItem(U_PARTNERS_STORAGE)||"{}");
  const safe={};
  for(const key of Object.keys(DEFAULT_U_PARTNERS))safe[key]=chooseUPartner(key,data?.[key]);
  safe[hero]=chosen;
  storage?.setItem(U_PARTNERS_STORAGE,JSON.stringify(safe));
  return true;
 }catch{return false;}
}
