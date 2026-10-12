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
const boundedXP=n=>Number.isFinite(n)?Math.max(0,Math.min(MAX_U_EXP,Math.floor(n))):0;
export const U_BONDS_STORAGE="ohana-u-bonds-v2";
export function sanitizeUBonds(hero,raw){
 const safe=Object.create(null);
 if(!byId.has(hero)||!raw||typeof raw!=="object"||Array.isArray(raw))return safe;
 for(const ally of optionsForUPartner(hero)){
  if(!Object.hasOwn(raw,ally.id))continue;
  if(typeof raw[ally.id]==="number"&&Number.isFinite(raw[ally.id]))
   safe[ally.id]=boundedXP(raw[ally.id]);
 }
 return safe;
}
export function combineUBonds(hero,...ledgers){
 const merged=Object.create(null);
 for(const data of ledgers)for(const [ally,xp]of Object.entries(sanitizeUBonds(hero,data)))
  merged[ally]=Math.max(merged[ally]||0,xp);
 return merged;
}
export function readStoredUBonds(storage,hero){
 if(!byId.has(hero))return Object.create(null);
 try{
  const raw=JSON.parse(storage?.getItem(U_BONDS_STORAGE)||"{}");
  return sanitizeUBonds(hero,raw?.[hero]);
 }catch{return Object.create(null);}
}
export function persistUBonds(storage,hero,bonds){
 if(!byId.has(hero))return false;
 try{
  const raw=JSON.parse(storage?.getItem(U_BONDS_STORAGE)||"{}");
  const result=Object.create(null);
  for(const id of Object.keys(DEFAULT_U_PARTNERS))
   result[id]=combineUBonds(id,raw?.[id],id===hero?bonds:null);
  storage?.setItem(U_BONDS_STORAGE,JSON.stringify(result));
  return true;
 }catch{return false;}
}
export function bondXP(p,ally=p?.uPartner){
 const selected=chooseUPartner(p?.id,ally);
 if(!selected)return 0;
 if(p?.uBonds&&typeof p.uBonds==="object"){
  return boundedXP(p.uBonds[selected]);
 }
 // V313 saved one experience number, not one experience per partner.
 return boundedXP(p?.uExp);
}
export function switchUPartner(p,ally){
 const chosen=chooseUPartner(p?.id,ally);
 if(!p||!chosen||ally!==chosen)return false;
 p.uPartner=chosen;
 p.uExp=bondXP(p,chosen);
 return true;
}
export function gainUExp(p,slot){
 if(!p||p.dead||!Number.isInteger(slot)||slot<0||slot>3)return 0;
 const buddy=chooseUPartner(p.id,p.uPartner);
 if(!buddy)return 0;
 // Migrate the old V313 scalar only once, to the actual equipped buddy.
 if(!p.uBonds||typeof p.uBonds!=="object")p.uBonds={[buddy]:boundedXP(p.uExp)};
 const before=bondXP(p,buddy);
 const next=Math.min(MAX_U_EXP,before+(slot===3?12:slot===2?8:slot===1?5:3));
 p.uBonds[buddy]=next;
 p.uExp=next;
 return next-before;
}
export function gainUBondHit(p,amount=3){
 const buddy=chooseUPartner(p?.id,p?.uPartner);
 if(!buddy||p?.dead)return 0;
 if(!p.uBonds||typeof p.uBonds!=="object")p.uBonds={[buddy]:boundedXP(p.uExp)};
 const before=bondXP(p,buddy);
 const next=Math.min(MAX_U_EXP,before+Math.max(0,Math.min(6,Math.floor(Number(amount)||0))));
 p.uBonds[buddy]=next;p.uExp=next;return next-before;
}
export function uBondProgress(p,ally=p?.uPartner){
 const xp=bondXP(p,ally),rank=uExpRank(xp),next=rank<3?U_EXP_THRESHOLDS[rank]:MAX_U_EXP;
 const prev=U_EXP_THRESHOLDS[rank-1];
 return Object.freeze({xp,rank,next,remaining:Math.max(0,next-xp),
  percent:rank===3?Math.min(100,Math.round(xp/MAX_U_EXP*100)):
   Math.min(100,Math.round((xp-prev)/(next-prev)*100)),
  name:["","Encuentro","Sintonía","Leyenda"][rank]});
}
export function uExpPower(p){
 return 1+(uExpRank(bondXP(p))-1)*.10;
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
